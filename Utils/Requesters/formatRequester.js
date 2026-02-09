const { writeLog, formatTextArea, formatCurrency } = require("../../Functions/commonFunctions");
const {
  requesterFieldMapping,
  requesterDropdownMapping,
  extractMainCity,
  extractDate
} = require("../helperMapping");

const moment = require("moment-timezone");

const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const sourceType = "sFFieldType";
const destType = "fDFieldType";
const sourceKey = "sFFieldKey";
const destKey = "fDFieldKey";

function getCleanName(name) {
  if (!name || typeof name !== 'string') return 'Unknown Requester';

  let clean = name.trim();

  // 1. Replace double quotes (") with single quotes (')
  // This fixes "Beatrice O"Carroll" -> "Beatrice O'Carroll"
  clean = clean.replace(/"/g, "'");

  // 2. Remove characters that are commonly flagged in names (like < > ; or URLs)
  // We keep letters, numbers, spaces, and basic name punctuation (. , - ')
  clean = clean.replace(/[^a-zA-Z0-9\s.\-']/g, '');

  // 3. Freshdesk sometimes flags multiple dots or trailing symbols
  clean = clean.replace(/\.\.+/g, '.');

  return clean || 'Unknown Requester';
}

function getCleanEmail(email) {
  if (!email || typeof email !== 'string') return null;

  // 1. Convert to lowercase and trim whitespace
  let clean = email.toLowerCase().trim();

  // 2. Remove any characters that aren't letters, numbers, or @ . _ - +
  // This specifically targets the '?' in your "x?@x.com" example
  clean = clean.replace(/[^a-z0-9@._\-+]/gi, '');

  // 3. Basic structural check (must have @ and .)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(clean) ? clean : null;
}

function isFreshdeskSafeEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check for Punycode/International domains (The xn-- issue)
  if (cleanEmail.includes('xn--')) return false;

  // 2. Strict Regex: Only allows standard alphanumeric, dots, hyphens, and underscores.
  // TLD must be standard alphabetic (a-z) only.
  const strictRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  return strictRegex.test(cleanEmail);
}

const buildPayloadFromModule = (moduleRow) => {
  const DEFAULT_TIMEZONE = "UTC";
  const payload = {};
  const customFields = {};

  const cfDropdownFields = [
    "LeadSource",
    "CurrencyIsoCode",
    "Lead_Sales_Country__c",
    "Conversion_Point__c",
    "Contact_Status__c",
    "DOZISF__ZoomInfo_Enrich_Status__c",
    "Spoke_with_at_Tradeshow__c",
    "Lead_Sales_Region__c",
    "Contact_Role__c",
    "HubSpot_Original_Source__c"
  ]

  const transformValue = (value, sourceType, destType) => {
    if (value == null || value === "") return null;

    if (Array.isArray(value)) {
      if (destType === "dropdown") return value[0];
      if (destType === "string") return value.join(", ");
      if (destType === "Array of strings") return value.map(String);
    }

    const map = {
      "string-string": (v) => String(v),
      "url-url": (v) => String(v),
      // "Text-Array of Text": (v) => [String(v)], Finery;Team Clean Up
      "string-Array of strings": (v) => [String(v)],
      "number-string": (v) => String(v),
      "string-number": (v) => Number(v),
      "number-number": (v) => Number(v),
      "boolean-string": (v) => (v ? "true" : "false"),
      "boolean-boolean": (v) => Boolean(v),
      "dropdown-dropdown": (v) => v,
      "picklist-dropdown": (v) => v,
      "textarea-string": (v) => formatTextArea(v),
      "phone-string": (v) => v,
      "address-string": (v) => v,
      "currency-string": (v) => formatCurrency(v),
      "double-string": (v) => String(v),
      "double-double": (v) => String(v),
      "reference-string": (v) => v,
      "email-string": (v) => v,
      "textarea-textarea": (v) => formatTextArea(v),
      "multipicklist-dropdown": (v) => v,
      "dropdown-text": (v) => String(v),
      "date-date": (v) => moment(v).format("YYYY-MM-DD"),
      "datetime-date": (v) =>
        moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DD"),
      "datetime-datetime": (v) =>
        moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DDTHH:mm:ss[Z]"),
    };

    const key = `${sourceType}-${destType}`;
    return map[key] ? map[key](value) : value;
  };

  requesterFieldMapping.forEach((map) => {
    let rawValue = moduleRow[map[sourceKey]];

    if (map["fDFieldKey"] === "time_zone" && rawValue)
      rawValue = extractMainCity(rawValue);

    let transformed = transformValue(rawValue, map[sourceType], map[destType]);

    if (
      transformed == null ||
      transformed === "" ||
      (Array.isArray(transformed) && transformed.length === 0)
    )
      return;

    if (map.isDefaultField && map[destType] === "dropdown" && requesterDropdownMapping[map[sourceKey]]) {
      const lookup = requesterDropdownMapping[map[sourceKey]]?.[transformed];
      transformed = lookup === undefined ? transformed : lookup;
    }

    if (map.isDefaultField) {
      if (map[destKey] === "phone" || map[destKey] === "mobile") {
        const cleaned = transformed.replace(/[^0-9]/g, "");

        if (/^\d{5,}$/.test(cleaned)) {
          payload[map[destKey]] = cleaned;
        }
      } else if (map[destKey] === "name") {
        const cleaned = transformed.replace(/"([^"]*)"/g, '$1').trim();
        payload[map[destKey]] = cleaned;
      } else {
        payload[map[destKey]] = transformed;
      }
    } else {
      if (cfDropdownFields.includes(map[sourceKey])) {
        customFields[map[destKey]] = requesterDropdownMapping[map[sourceKey]][transformed];
      } else {
        customFields[map[destKey]] = transformed;
      }
    }
  });

  let custom_fields = {};

  Object.entries(customFields).forEach(([key, val]) => {
    custom_fields[key] = val;
  });

  if (Object.keys(custom_fields).length > 0) {
    payload['custom_fields'] = custom_fields;
  }

  if (!payload?.email && !payload?.phone)
    payload["unique_external_id"] = moduleRow?.Id;

  return payload;
};

const formatRequesterPayload = async (
  userData,
  OVERALL_LOG,
  ERROR_LOG
) => {
  try {
    const payload = buildPayloadFromModule(userData);
    writeLog(OVERALL_LOG, `User Data payload : ${JSON.stringify(payload)}`);

    payload["name"] = getCleanName(payload["name"]);

    if (payload["email"] && !isFreshdeskSafeEmail(payload["email"])) {
      if (isFreshdeskSafeEmail(getCleanEmail(payload["email"]))) {
        payload["email"] = getCleanEmail(payload["email"])
      } else {
        payload["unique_external_id"] = userData?.Id;
        delete payload["email"];
      }
    }

    return payload;
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR Source ID ${userData.id} ${userData.name} : ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error);

    console.error(errorMessage);

    writeLog(OVERALL_LOG, errorMessage);
    writeLog(ERROR_LOG, errorMessage);
  }
};

module.exports = { formatRequesterPayload };
