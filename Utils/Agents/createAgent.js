const axios = require('axios');
const base64 = require('base-64');


const { delay } = require('../../Functions/commonFunctions')
const { writeLog, writeIDLog } = require('../../Functions/commonFunctions')

const FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
const FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/contacts` // agents, contacts;
const AGENT_NOT_CREATED_LOG = process.env.AGENT_NOT_CREATED_LOG;
const DEFAULT_AGENT_ID = process.env.DEFAULT_AGENT_ID;

const createAgent = async (sourceId, agentData, OVERALL_LOG, ERROR_LOG) => {
  const authValue = base64.encode(`${FRESHDESK_API_TOKEN}:X`);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authValue}`
  };

  let retry = 0;
  const maxRetries = 5;

  while (retry < maxRetries) {
    try {
      const response = await axios.post(BASE_URL, agentData, { headers });

      writeLog(OVERALL_LOG, `✅ Agent with Name: ${agentData.name} Created : ${response.data.id}`)
      return response.data.id;
    } catch (error) {
      retry++;
      console.log(`❌ ERROR Occured at Agent creation : ${sourceId} ${agentData.name} : ${JSON.stringify(error?.response?.data)}`);
      writeLog(
        OVERALL_LOG,
        `❌ ERROR Occured at Agent creation : ${sourceId} ${agentData.name} : ${JSON.stringify(error?.response?.data)}`
      );

      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while creating agent ${sourceId} ${agentData.name}. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
        continue;
      } else if (
        error?.response?.data?.errors[0]?.code === 'duplicate_value'
        && error?.response?.data?.errors[0]?.field === 'email'
      ) {
        console.error(
          "Duplicate Agent with this name already exists :",
          error?.response?.data?.errors[0]?.additional_info?.user_id
        );
        writeLog(
          OVERALL_LOG,
          `✅ Agent with Name: ${agentData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );
        writeLog(
          ERROR_LOG,
          `✅ Agent with Name ${sourceId} : ${agentData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );

        return error?.response?.data?.errors[0]?.additional_info?.user_id;
      } else if (
        error?.response?.data?.errors[0]?.code === 'duplicate_value'
        && error?.response?.data?.errors[0]?.field === 'other_emails'
      ) {
        console.error(
          "Duplicate Agent with this name already exists :",
          error?.response?.data?.errors[0]?.additional_info?.user_id
        );
        writeLog(
          OVERALL_LOG,
          `✅ Agent with Name: ${agentData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );
        writeLog(
          ERROR_LOG,
          `✅ Agent with Name ${sourceId}: ${agentData.name} Created : ${error?.response?.data?.errors[0]?.additional_info?.user_id}`
        );

        const duplicateEmail = error?.response?.data?.errors[0]?.message?.split(',')[1];
        const otherEmails = agentData.other_emails.filter(item => !duplicateEmail.includes(item));

        console.log('🔺BEFORE REQUESTER PAYLOAD', agentData);
        if (otherEmails.length > 0) {
          agentData["other_emails"] = otherEmails;
        } else {
          delete agentData.other_emails;
        }
        console.log('🔺AFTER REQUESTER PAYLOAD', agentData);

        continue;
        // return error?.response?.data?.errors[0]?.additional_info?.user_id;
      } else if (
        error?.response?.data?.errors[0]?.code === 'invalid_format'
        || error?.response?.data?.errors[0]?.code === 'invalid_value'
      ) {
        console.error("Invalid Format :", error?.response?.data?.errors[0]);
        writeLog(
          OVERALL_LOG,
          `❌ERROR Occured at Agent Creation ${sourceId} Invalid Format: ${agentData.name} Created : ${error?.response?.data?.errors[0]}`
        );
        writeLog(
          ERROR_LOG,
          `❌ERROR Occured at Agent Creation ${sourceId} Invalid Format: ${agentData.name} Created : ${error?.response?.data?.errors[0]}`
        );
        writeIDLog(AGENT_NOT_CREATED_LOG, sourceId);
        return null; //Number(DEFAULT_REQUESTER_ID);
      } else {
        // console.error("New Error Occured :", error)
        writeLog(
          OVERALL_LOG,
          `❌ New Error Occured for Agent with Name: ${agentData.name} ${JSON.stringify(error)}`
        );
        writeLog(
          ERROR_LOG,
          `❌ New Error Occured for Agent with Name: ${agentData.name} ${JSON.stringify(error)}`
        );
        writeIDLog(AGENT_NOT_CREATED_LOG, sourceId);
        return null
      }
    }
  }

  return null
};

module.exports = { createAgent }
