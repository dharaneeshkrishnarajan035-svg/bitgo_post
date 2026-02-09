require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  writeLog,
  generateHtml,
  pickAttachments,
  formatTextArea,
  readDecryptedData,
  formatCurrency,
} = require("../../Functions/commonFunctions");
const { fetchDestinationId } = require("../../Functions/dynamoFunctions");
const { requesterMigration } = require("../../Controller/requester");
const {
  agentIds,
  groupIds,
  agentMapping,
  groupMapping,
  companyMapping,
  productMapping,
  companyIds,
  skippedAgentIds,
  skippedAgentMapping
} = require("./mappings");
const moment = require("moment-timezone");
const {
  ticketFieldMapping,
  ticketDropdownMapping
} = require("../helperMapping");

const PROJECT_PATH = process.env.PROJECT_PATH;
const USERS_TABLE = process.env.AWS_SOURCE_USERS_TABLE;
const DEFAULT_REQUESTER_ID = Number(process.env.DEFAULT_REQUESTER_ID);
const DEFAULT_AGENT_ID = Number(process.env.DEFAULT_AGENT_ID);

const sourceType = "sFFieldType";
const destType = "fDFieldType";
const sourceKey = "sFFieldKey";
const destKey = "fDFieldKey";

function cleanPayload(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(
        ([_, value]) =>
          value !== null &&
          value !== undefined &&
          !(typeof value === "number" && isNaN(value))
      )
      .map(([key, value]) => [
        key,
        typeof value === "boolean" ? String(value) : value,
      ])
  );
}

function htmlToPlainText(input) {
  if (!input) return "";

  return input
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newlines
    .replace(/<[^>]+>/g, "")       // Remove any other HTML tags if present
    .trim();
}

const formatTicket = async (moduleRow, sourceId, OVERALL_LOG, ERROR_LOG) => {
  const payload = {};
  const customFields = {};
  const cfDropdownFields = [
    "Wallet_Outreach_Result__c",
    "Type_of_Coin__c",
    "Using_the_API_or_browser_interface__c",
    "svc_Impact__c",
    "svc_Importance__c",
    "svc_Pricing_Plan__c",
    "svc_Request_Type__c",
    "svc_Responsible__c",
    "svc_Root_Cause_Fixed__c",
    "svc_Type__c",
    "svc_Type_of_Coin__c",
    "svc_Using_the_API_or_browser_interface__c",
    "svc_Wallet_Outreach_Result__c",
    "svc_What_is_your_request__c",
    "SVC_Set1__c",
    "SVC_Set2__c",
    "SVC_Set3__c",
    "svc_Sub_Category__c",
    "JIRA_Project__c",
    "CurrencyIsoCode"
  ];

  try {
    const DEFAULT_TIMEZONE = "America/Los_Angeles";

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
        "Dropdown-Dropdown": (v) => v,
        "picklist-dropdown": (v) => v,
        "textarea-string": (v) => formatTextArea(v),
        "textarea-arrayofstrings": (v) => v,
        "phone-string": (v) => v,
        "address-string": (v) => v,
        "currency-string": (v) => formatCurrency(v),
        "double-string": (v) => v,
        "double-double": (v) => v,
        "reference-string": (v) => v,
        "reference-number": (v) => Number(v),
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

      /*
      const map = {
        "Text-Text": (v) => String(v),
        "Text-Array of Text": (v) => [String(v)],
        "Number-Text": (v) => String(v),
        "Number-Number": (v) => Number(v),
        "Boolean-Text": (v) => (v ? "true" : "false"),
        "Boolean-Boolean": (v) => Boolean(v),
        "Dropdown-Dropdown": (v) => v,
        "Dropdown-Text": (v) => String(v),
        "Date-Date": (v) => moment(v).format("YYYY-MM-DD"),
        "Datetime-Date": (v) =>
          moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DD"),
        "Datetime-Datetime": (v) =>
          moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DDTHH:mm:ss[Z]"),
        "Textarea-Multiline Text": (v) => String(v),
        "Checkbox-Checkbox": (v) => (v ? "true" : "false"),
      };
      */

      const key = `${sourceType}-${destType}`;
      return map[key] ? map[key](value) : value;
    };

    for (const map of ticketFieldMapping) {
      try {
        const rawValue = moduleRow[map[sourceKey]];

        let transformed = transformValue(
          rawValue,
          map[sourceType],
          map[destType]
        );

        if (
          transformed == null ||
          transformed === "" ||
          (Array.isArray(transformed) && transformed.length === 0)
        ) {
          if (map[destKey] === "requester_id") {
            if (moduleRow["ContactEmail"]) {
              payload.email = moduleRow?.ContactEmail;
              payload.name = moduleRow?.ContactName ?? moduleRow?.ContactEmail;
            } else if (moduleRow["ContactPhone"]) {
              payload.email = moduleRow?.ContactPhone;
              payload.name = moduleRow?.ContactName ?? moduleRow?.ContactPhone;
            } else if (moduleRow["SuppliedEmail"]) {
              payload.email = moduleRow?.SuppliedEmail;
              payload.name = moduleRow?.SuppliedName ?? moduleRow?.SuppliedEmail;
            } else {
              payload[map[destKey]] = DEFAULT_REQUESTER_ID;
            }
          }

          continue; // skip safely
        }

        if (
          map.isDefaultField &&
          (map[destType] === "Dropdown" || map[destType] === "dropdown") &&
          ticketDropdownMapping[map[sourceKey]]
        ) {
          transformed = ticketDropdownMapping[map[sourceKey]][transformed] ?? transformed;
        }

        if (map.isDefaultField) {
          if (map[destKey] === "subject") {
            payload[map[destKey]] = (
              `SF#${moduleRow?.CaseNumber}: ${transformed}` ||
              `SF#${moduleRow?.CaseNumber}: Migrated Ticket`
            )?.substring(0, 255);
          } else if (map[destKey] === "requester_id") {
            let destReqId = DEFAULT_REQUESTER_ID;
            if (rawValue) {
              if (agentIds.includes(rawValue)) {
                destReqId = agentMapping[rawValue];
              } else if (groupIds.includes(rawValue)) {
                destReqId = DEFAULT_REQUESTER_ID;
              } else if (skippedAgentIds.includes(rawValue)) {
                destReqId = skippedAgentMapping[rawValue];
              } else {
                const isExistingUser = await fetchDestinationId(
                  USERS_TABLE,
                  rawValue,
                  OVERALL_LOG,
                  ERROR_LOG
                );

                if (!!isExistingUser) {
                  destReqId = isExistingUser;
                } else {
                  const createdUserId = await requesterMigration(rawValue);
                  destReqId = createdUserId || DEFAULT_REQUESTER_ID;
                }
              }
            }
            payload[map[destKey]] = destReqId;
          } else if (map[destKey] === "responder_id") {
            if (agentIds.includes(rawValue)) {
              payload[map[destKey]] = agentMapping[rawValue];
            }
            //  else if (groupIds.includes(rawValue)) {
            //   payload[map[destKey]] = DEFAULT_AGENT_ID;
            // }
          }
          // else if (map[destKey] === "group_id") {
          //   if (groupIds.includes(rawValue)) {
          //     payload[map[destKey]] = groupMapping[rawValue];
          //   }
          // }
          // else if (map[destKey] === "company_id") {
          //   if (companyIds.includes(rawValue) && !agentIds.includes(moduleRow['ContactId'])) {
          //     payload[map[destKey]] = companyMapping[rawValue];
          //   }
          // }
          else if (map[destKey] === "cf_sf_created_date") {
            const hsCreatedDate = new Date(rawValue);
            const formatter = new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Los_Angeles",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            const [year, month, day] = formatter
              .format(hsCreatedDate)
              .split("-");
            payload[
              `custom_fields[${map[destKey]}]`
            ] = `${year}-${month}-${day}`;
          } else if (map[destKey] === "cf_sf_updated_date") {
            const hsUpdatedDate = new Date(rawValue);
            const formatter = new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Los_Angeles",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            const [year, month, day] = formatter
              .format(hsUpdatedDate)
              .split("-");

            payload[
              `custom_fields[${map[destKey]}]`
            ] = `${year}-${month}-${day}`;
          } else {
            payload[map[destKey]] = transformed;
          }
        } else {
          if (map[destKey] === "cf_survey_heading" || map[destKey] === "cf_last_email_body") {
            customFields[map[destKey]] = htmlToPlainText(transformed);
          } else if (map[destType] === "datetime" || map[destType] === "date") {
            const hsUpdatedDate = new Date(rawValue);
            const formatter = new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Los_Angeles",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            const [year, month, day] = formatter
              .format(hsUpdatedDate)
              .split("-");

            payload[
              `custom_fields[${map[destKey]}]`
            ] = `${year}-${month}-${day}`;
          } else if (cfDropdownFields.includes(map[sourceKey])) {
            customFields[map[destKey]] = ticketDropdownMapping[map[sourceKey]][transformed];
          } else {
            customFields[map[destKey]] = transformed;
          }
        }
      } catch (err) {
        console.error(
          `❌ Error processing field ${map[destKey]}:`,
          err.message
        );
        writeLog(
          ERROR_LOG,
          `❌ Error processing field ${map[destKey]}: ${err.message}`
        );
        writeLog(
          OVERALL_LOG,
          `❌ Error processing field ${map[destKey]}: ${err.message}`
        );
      }
    }

    Object.entries(customFields).forEach(([key, val]) => {
      payload[`custom_fields[${key}]`] = val;
    });

    const attachmentFilePath = path.join(
      process.env.TICKET_ATTACHMENT_PATH,
      sourceId,
      "allAttachments.json"
    );

    let ticketAttachments = [];
    let s3Links = [];

    if (fs.existsSync(attachmentFilePath)) {
      const rawCaseAttachments = readDecryptedData(attachmentFilePath, ERROR_LOG)
      // JSON.parse(fs.readFileSync(attachmentFilePath, "utf-8"));

      const filteredAttachments = rawCaseAttachments?.filter(
        (item) => item?.ParentId === sourceId
      );

      if (filteredAttachments?.length > 0) {
        const attachmentsData = pickAttachments(
          filteredAttachments,
          `${process.env.TICKET_ATTACHMENT_PATH}/${sourceId}`,
          sourceId
        );

        if (attachmentsData?.attachments.length > 0 || attachmentsData?.s3Links.length > 0) {
          ticketAttachments = attachmentsData?.attachments;
          s3Links = attachmentsData?.s3Links;
        }
      }
    } else {
      console.log("No caseAttachments.json found for this ticket.");
    }

    if (s3Links.length > 0) {
      payload["description"] += "<br /><br /> --- Migration Attachments Over 20MB (S3) --- <br />";
      s3Links.forEach(link => {
        payload["description"] += `${link}\n`;
      });
    }

    payload["attachments[]"] = ticketAttachments;
    payload["tags[]"] = moduleRow["Labels__c"] ? [...moduleRow["Labels__c"]?.split(";"), "Migrated"] : ["Migrated"];
    //["Migrated"];

    if (!payload["description"]) {
      payload["description"] = '<div></div>'
    }

    if (payload["group_id"] && payload["responder_id"]) {
      // const groupInfo = await fetc
    }

    const cleaned = cleanPayload(payload);

    // console.log("payload",payload);
    return cleaned;
  } catch (error) {
    const errorMsg = error?.response?.data || error.message;

    let formattedErrorMsg;
    try {
      formattedErrorMsg = JSON.stringify(errorMsg);
    } catch (jsonErr) {
      formattedErrorMsg = errorMsg;
    }

    let errorMessage;

    if (error.stack) {
      const filteredStack = error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_PATH))
        .map((line) => line.trim())
        .join("\n");

      errorMessage = `❌ ERROR formating ticket at formatTicket block (sourceId: ${sourceId} ) & payload :(${JSON.stringify(
        moduleRow
      )}): ${formattedErrorMsg} @ ${filteredStack}`;
    } else {
      errorMessage = `❌ ERROR formating ticket at formatTicket block (sourceId: ${ticketId} ) & payload :(${JSON.stringify(
        moduleRow
      )}): ${formattedErrorMsg}`;
    }

    console.error(errorMessage);
    writeLog(OVERALL_LOG, errorMessage);
    writeLog(ERROR_LOG, errorMessage);
  }
};

module.exports = { formatTicket };
