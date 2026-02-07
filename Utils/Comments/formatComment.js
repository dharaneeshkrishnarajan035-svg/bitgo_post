require("dotenv").config();
const path = require("path");
const fs = require("fs");
const cheerio = require('cheerio');
const axios = require('axios');
const mime = require('mime-types');
const { writeLog, convertToHTML, generateHtml, pickAttachments, readDecryptedData, getFreshdeskData } = require("../../Functions/commonFunctions");
const { fetchDestinationId } = require("../../Functions/dynamoFunctions");
const { uploadFileToS3, uploadRecordingToS3 } = require("../../Functions/uploadFileToS3");
const { requesterMigration } = require("../../Controller/requester");
const { agentIds, groupIds, agentMapping, skippedAgentIds, skippedAgentMapping } = require("../../Utils/Tickets/mappings");
const { loadEnvFile } = require("process");

const PROJECT_PATH = process.env.PROJECT_PATH;
const USERS_TABLE = process.env.AWS_SOURCE_USERS_TABLE;
const DEFAULT_REQUESTER_ID = Number(process.env.DEFAULT_REQUESTER_ID);
const SOURCE_API_KEY = process.env.SOURCE_API_KEY;
const SOURCE_EMAIL = process.env.SOURCE_EMAIL;
const CLIENT_BUCKET_NAME = process.env.CLIENT_BUCKET_NAME;

const commentUserIdKey = "CreatedById";
const commentCreatedAtKey = "CreatedDate";
const commentUpdatedAtKey = "LastModifiedDate";

async function getFormattedBody(item) {
  if (!item?.attributes?.type) return "Migrated Comment";

  if (item.attributes.type === "CaseComment") {
    return item.CommentBody
      ? await convertToHTML(item.CommentBody)
      : "Migrated Comment";
  } else if (item.attributes.type === "FeedItem") {
    let body = item?.Body ? item?.Body : "Migrated Comment";
    const linkTitle = item?.Title || 'View Shared Link';

    if (item?.Type === "LinkPost")
      // body += `<br /><br /><b>Shared Link:</b> <a href="${item.LinkUrl}" target="_blank" rel="noopener noreferrer">${linkTitle}</a>`;
      body += `
        <br /><br />
        <div style="padding: 10px; border: 1px solid #ebebeb; border-left: 4px solid #0070d2; background-color: #f3f2f2;">
            <strong>${linkTitle}</strong><br />
            <a href="${item.LinkUrl}" target="_blank">${item.LinkUrl}</a>
        </div>`;

    return body;
  } else if (item.attributes.type === "FeedComment") {
    return item.CommentBody
      ? item.CommentBody
      : "Migrated Comment";
  } else if (item.attributes.type === "EmailMessage") {
    if (item.HtmlBody) return item.HtmlBody;
    return item.TextBody
      ? await convertToHTML(item.TextBody)
      : "Migrated Comment";
  } else if (item?.attributes?.type === 'ConversationEntry') {
    return item.Message
      ? item.Message
      : "Migrated Comment";
  }

  return "Migrated Comment";
}

const formatComment = async (item, ticketDescription, ticketContactId, ticketFolderName, OVERALL_LOG, ERROR_LOG) => {
  try {
    let formData = {};
    formData.private = "true";
    let dummyEmailRequester = 0;

    let body = await getFormattedBody(item);

    //User
    const userIdKey =
      item.attributes.type === "ConversationEntry"
        ? "ActorId"
        : item.attributes.type === "FeedComment"
          ? "CreatedBy"
          : "CreatedById";

    let userId = Number(DEFAULT_REQUESTER_ID);
    let sourceUserId =
      userIdKey === "CreatedBy"
        ? item?.[userIdKey]?.Id
        : item?.[userIdKey];

    if (
      (dummyEmailRequester === sourceUserId || sourceUserId === "0051U000008EJ3TQAW") &&
      item?.FromAddress !== "supportcaseack@bitgo.com"
    ) {
      sourceUserId = ticketContactId;
    }

    if (
      item.attributes.type === "EmailMessage" &&
      item?.TextBody?.trim() === ticketDescription?.trim()
    ) {
      dummyEmailRequester = sourceUserId;
      sourceUserId = ticketContactId;
    }

    if (sourceUserId) {
      if (agentIds.includes(sourceUserId)) {
        userId = agentMapping[sourceUserId];
      } else if (skippedAgentIds.includes(sourceUserId)) {
        userId = skippedAgentMapping[sourceUserId];
      } else if (groupIds.includes(sourceUserId)) {
        userId = DEFAULT_REQUESTER_ID;
      } else {
        const isExistingUser = await fetchDestinationId(
          USERS_TABLE,
          sourceUserId,
          OVERALL_LOG,
          ERROR_LOG
        );

        if (!!isExistingUser) {
          userId = isExistingUser;
        } else {
          const createdUserId = await requesterMigration(sourceUserId);
          console.log({ createdUserId });

          if (!createdUserId && item?.FromAddress) {
            const fetchedUser = await getFreshdeskData(`contacts`, { email: item?.FromAddress });
            console.log({ fetchedUser });
            userId = fetchedUser[0]?.id;
          } else {
            userId = DEFAULT_REQUESTER_ID;
          }
        }
      }
    } else {
      if (item?.FromAddress) {
        const fetchedUser = await getFreshdeskData(`contacts?email=${item?.FromAddress}`);
        userId = fetchedUser[0]?.id ?? DEFAULT_REQUESTER_ID;
      } else {
        userId = DEFAULT_REQUESTER_ID;
      }
    }

    formData["user_id"] = userId;

    let emails = [];
    let bccEmails = [];
    let ticketAttachments = [];
    let s3Links = [];

    if (item.attributes.type === "EmailMessage") {
      const cc_emails = item?.CcAddress ? [item.CcAddress] : [];
      const bcc_emails = item?.BccAddress ? [item.BccAddress] : [];

      emails = cc_emails;
      bccEmails = bcc_emails;
    }

    if (Object.keys(item).includes("HasAttachment") && item?.HasAttachment) {
      const attachmentFilePath = path.join(
        process.env.TICKET_ATTACHMENT_PATH,
        ticketFolderName,
        "allAttachments.json"
      );

      if (fs.existsSync(attachmentFilePath)) {
        const rawCaseAttachments = readDecryptedData(attachmentFilePath, ERROR_LOG);
        // JSON.parse(fs.readFileSync(attachmentFilePath, "utf-8"));
        // console.log({ rawCaseAttachments, itemId: item.Id });

        const filteredAttachments = [
          ...rawCaseAttachments.filter(a => a.ParentId === item.Id),
          ...rawCaseAttachments.filter(
            a => a.FirstPublishLocationId === item.Id
          ),
        ];

        if (filteredAttachments.length > 0) {
          const attachmentsData = await pickAttachments(
            filteredAttachments,
            `${process.env.TICKET_ATTACHMENT_PATH}/${ticketFolderName}`,
            ticketFolderName
          );

          if (attachmentsData?.attachments.length > 0 || attachmentsData?.s3Links.length > 0) {
            ticketAttachments = attachmentsData?.attachments ?? [];
            s3Links = attachmentsData?.s3Links ?? [];
          }
        }
      } else {
        console.log("No caseAttachments.json found for this ticket.");
      }
    }

    formData["attachments[]"] = ticketAttachments;

    const updatedBody = generateHtml({
      datetimestamp: item[commentCreatedAtKey],
      lastModifiedDatetime: item[commentUpdatedAtKey],
      cc_emails: emails,
      bcc_emails: bccEmails,
      message: body,
      commentData: item
    });

    if (s3Links.length > 0) {
      updatedBody += "<br /><br /> --- Migration Attachments Over 20MB (S3) --- <br />";
      s3Links.forEach(link => {
        updatedBody += `${link}\n`;
      });
    }

    formData.body = updatedBody;

    return formData;
  } catch (error) {
    console.error(
      `❌ ERROR Source ID ${item.Id} : ${error?.message} @ ${error?.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_PATH))
        .map((line) => line.trim())
        .join("\n")}`
    );

    const errorMessage = `❌ ERROR Source ID ${item.Id}: ${error.message} @ ${error.stack
      .split("\n")
      .filter((line) => line.includes(PROJECT_PATH))
      .map((line) => line.trim())
      .join("\n")}`;

    writeLog(OVERALL_LOG, errorMessage);
    writeLog(ERROR_LOG, errorMessage);
  }
};

module.exports = { formatComment };
