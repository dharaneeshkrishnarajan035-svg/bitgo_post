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
