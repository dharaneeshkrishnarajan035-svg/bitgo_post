const axios = require('axios');
const base64 = require('base-64');
const { delay } = require('../../Functions/commonFunctions')
const { writeLog, writeIDLog } = require('../../Functions/commonFunctions')

const FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
const FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/contacts`;
const REQUESTER_NOT_CREATED_LOG = process.env.REQUESTER_NOT_CREATED_LOG;
const DEFAULT_REQUESTER_ID = process.env.DEFAULT_REQUESTER_ID;

const createRequester = async (sourceId, requesterData, OVERALL_LOG, ERROR_LOG) => {
  const authValue = base64.encode(`${FRESHDESK_API_TOKEN}:X`);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authValue}`
  };

  let retry = 0;
  const maxRetries = 5;

  while (retry < maxRetries) {
    try {
      // console.log({ requesterData });

      const response = await axios.post(BASE_URL, requesterData, { headers });

      writeLog(OVERALL_LOG, `✅ Requester with Name: ${requesterData.name} Created : ${response.data.id}`)
      return response.data.id;
    } catch (error) {
      retry++;
      console.log(`❌ ERROR Occured at Requester creation : ${sourceId} ${requesterData.name} : ${JSON.stringify(error?.response?.data)}`);
      writeLog(
        OVERALL_LOG,
        `❌ ERROR Occured at Requester creation : ${sourceId} ${requesterData.name} : ${JSON.stringify(error?.response?.data)}`
      );

      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while creating requester ${sourceId} ${requesterData.name}. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
        continue;
      } else if (
        error?.response?.data?.errors[0]?.code === 'duplicate_value'
        && error?.response?.data?.errors[0]?.field === 'email'
      ) {
        console.error(
          "Duplicate Requester with this name already exists :",
          error?.response?.data?.errors[0]?.additional_info?.user_id
        );
        writeLog(
          OVERALL_LOG,
          `✅ Requester with Name: ${requesterData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );
        writeLog(
          ERROR_LOG,
          `✅ Requester with Name ${sourceId} : ${requesterData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );

        return error?.response?.data?.errors[0]?.additional_info?.user_id;
      } else if (
        error?.response?.data?.errors[0]?.code === 'duplicate_value'
        && error?.response?.data?.errors[0]?.field === 'other_emails'
      ) {
        console.error(
          "Duplicate Requester with this name already exists :",
          error?.response?.data?.errors[0]?.additional_info?.user_id
        );
        writeLog(
          OVERALL_LOG,
          `✅ Requester with Name: ${requesterData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );
        writeLog(
          ERROR_LOG,
          `✅ Requester with Name ${sourceId}: ${requesterData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );

        const duplicateEmail = error?.response?.data?.errors[0]?.message?.split(',')[1];
        const otherEmails = requesterData.other_emails.filter(item => !duplicateEmail.includes(item));

        console.log('🔺 BEFORE REQUESTER PAYLOAD', requesterData);
        if (otherEmails.length > 0) {
          requesterData["other_emails"] = otherEmails;
        } else {
          delete requesterData.other_emails;
        }
        console.log('🔺 AFTER REQUESTER PAYLOAD', requesterData);

        continue;
        // return error?.response?.data?.errors[0]?.additional_info?.user_id;
      } else if (
        error?.response?.data?.errors[0]?.code === 'invalid_format'
        || error?.response?.data?.errors[0]?.code === 'invalid_value'
      ) {
        console.error("Invalid Format :", error?.response?.data?.errors[0]);
        writeLog(
          OVERALL_LOG,
          `❌ ERROR Occured at Requester Creation ${sourceId} Invalid Format: ${requesterData.name} Created : ${error?.response?.data?.errors[0]}`
        );
        writeLog(
          ERROR_LOG,
          `❌ ERROR Occured at Requester Creation ${sourceId} Invalid Format: ${requesterData.name} Created : ${error?.response?.data?.errors[0]}`
        );
        writeIDLog(REQUESTER_NOT_CREATED_LOG, sourceId);
        return null; //Number(DEFAULT_REQUESTER_ID);
      } else {
        // console.error("New Error Occured :", error)
        writeLog(
          OVERALL_LOG,
          `❌ New Error Occured for Requester with Name: ${requesterData.name} ${JSON.stringify(error)}`
        );
        writeLog(
          ERROR_LOG,
          `❌ New Error Occured for Requester with Name: ${requesterData.name} ${JSON.stringify(error)}`
        );
        writeIDLog(REQUESTER_NOT_CREATED_LOG, sourceId);
        return null
      }
    }
  }

  return null
};

module.exports = { createRequester }
