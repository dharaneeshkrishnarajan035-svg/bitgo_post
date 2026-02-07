const fs = require('fs');
const { writeLog, formatCurrency, formatTextArea } = require("../../Functions/commonFunctions");
const { companyFieldMapping, companySalesTeMapping, companyRecordType, companyDropdownMapping } = require("../helperMapping");
const moment = require("moment-timezone");

const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const sourceType = "sFFieldType";
const destType = "fDFieldType";
const sourceKey = "sFFieldKey";
const destKey = "fDFieldKey";

const companyNames = JSON.parse(fs.readFileSync(`${process.env.PROJECT_PATH}/Config_Out/CompanyNames.json`));

const formatCompanyPayload = (moduleRow, OVERALL_LOG, ERROR_LOG) => {
  try {
    const payload = {};
    const customFields = {};
    const DEFAULT_TIMEZONE = "UTC";

    const defaultDropdownFields = [
      "Industry",
    ];

    const cfDropdownFields = [
      "Type",
      "Rating",
      "CurrencyIsoCode",
      "AccountSource",
      "Business_Type__c",
      "Terms__c",
      "Account_Status__c",
      "Termination_Reason__c",
      "Client_Touch_Level__c",
      "RegionOverride__c",
      "BitGo_Entity__c",
      "AccountTier__c",
      "Reasons_for_no_CSM__c",
      "Conversion_Point__c",
      "Market_Segment__c",
      "CSM_Call_Cadence__c",
      "DOZISF__ZoomInfo_Enrich_Status__c",
      "Logo_Usage__c",
      "Main_POC_Location__c",
      "Data_Breach_Notification_Time__c",
      "Testnet_Activated__c",
      "Testnet_Engagement_Frequency__c",
      "Training__c",
      "Mt_Gox_Org_Type__c",
      "CSM_Health_Score__c",
      "Application_Type__c",
      "Country_of_Primary_Business_Operations__c",
      "Market_Segment_Tier__c",
      "Client_Status__c",
      "KYC_Status__c",
      "account_type__c"
    ];

    const transformValue = (value, sourceType, destType) => {
      if (value == null || value === "") return null;

      if (Array.isArray(value)) {
        if (destType === "dropdown") return value[0];
        if (destType === "string") return value.join(", ");
        if (destType === "Array of strings") return value.map(String);
      }

      const map = {
        "string-string": (v) => String(v),
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
        "double-string": (v) => v,
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

    console.log({ moduleRow });

    companyFieldMapping.forEach((map) => {
      const rawValue = moduleRow[map[sourceKey]];
      let transformed = transformValue(rawValue, map[sourceType], map[destType]);

      if (
        transformed == null ||
        transformed === "" ||
        (Array.isArray(transformed) && transformed.length === 0)
      )
        return;

      if (
        map.isDefaultField &&
        map[destType] === "dropdown" &&
        companyDropdownMapping[map[sourceKey]]
      ) {
        // Map the raw or transformed value using the provided dropdownMapping
        transformed = companyDropdownMapping[map[sourceKey]][transformed] || transformed;
      }

      if (map.isDefaultField) {
        if (map[destKey] === "domains") {
          payload[map[destKey]] = transformed.map(item => {
            const match = item.match(/[a-zA-Z0-9.-]+\.[a-z]{2,}/);
            return match ? match[0] : null;
          });
        } else if (defaultDropdownFields.includes(map[sourceKey])) {
          payload[map[destKey]] = companyDropdownMapping[map[sourceKey]][transformed];
        } else {
          payload[map[destKey]] = transformed;
        }
      } else {
        if (cfDropdownFields.includes(map[sourceKey])) {
          customFields[map[destKey]] = companyDropdownMapping[map[sourceKey]][transformed];
        } else {
          customFields[map[destKey]] = transformed;
        }
      }
    });

    const custom_fields = {};

    Object.entries(customFields).forEach(([key, val]) => {
      custom_fields[key] = val;
    });

    if (Object.keys(custom_fields).length > 0) {
      payload['custom_fields'] = custom_fields;
    }

    return payload;
  } catch (error) {
    console.error(
      `❌ ERROR Source ID ${moduleRow?.Id} ${moduleRow?.Name} : ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}`
    );

    writeLog(
      OVERALL_LOG,
      `❌ ERROR Source ID ${moduleRow.Id} ${moduleRow.Name} : ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}`
    );

    writeLog(
      ERROR_LOG,
      `❌ ERROR Source ID ${moduleRow.Id} ${moduleRow.Name} : ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}`
    );
  }
};

module.exports = { formatCompanyPayload };
