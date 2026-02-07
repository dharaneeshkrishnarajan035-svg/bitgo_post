
const axios = require('axios');
const base64 = require('base-64');
const FormData = require('form-data');
const { delay } = require('../../Functions/commonFunctions');
const { writeLog } = require('../../Functions/commonFunctions');

const FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
const FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
const AUTH_VALUE = base64.encode(`${FRESHDESK_API_TOKEN}:X`);
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const UPDATE_COMMENT_LOG = process.env.UPDATE_COMMENT_LOG;

const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/conversations`;

const createComment = async (data, sfCommentId, sfTicketId, fdkTicketId, OVERALL_LOG, ERROR_LOG) => {
  const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/tickets/${fdkTicketId}/notes`;

  let retry = 0;
  const maxRetries = 5;

  while (retry < maxRetries) {
    try {
      let formData = new FormData();

      const headers = {
        Authorization: `Basic ${AUTH_VALUE}`,
        ...formData.getHeaders()
      };

      const keys = Object.keys(data);

      for (const key of keys) {
        if (key !== 'attachments[]') {
          formData.append(key, data[key]);
        } else if (key === 'attachments[]') {
          const attachments = data[key] ?? [];
          attachments.map(item => {
            formData.append(key, item.file, item.filename)
          });
        }
      }

      const response = await axios.post(BASE_URL, formData, { headers });
      writeLog(OVERALL_LOG, `✅ SF Ticket Id: ${sfTicketId}, FDK Ticket Id: ${fdkTicketId}, ZDK Comment Id: ${sfCommentId} FDK Comment Id : ${response.data.id}`);

      return response.data.id;
    } catch (error) {
      // writeLog(OVERALL_LOG, `❌ ERROR Occured at Comment creation for FDK Ticket Id${fdkTicketId} : ${JSON.stringify(error?.response?.data)}`);
      const status = error?.response?.status;

      if (status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(`Rate limit reached while creating comment. Retrying after ${retryAfter} ms...`);
        await delay(retryAfter);
      } else if (status === 502 || status === 503 || status === 504) {
        console.log(`Server error ${status} while creating comment ${sfCommentId}. Retrying in 10s...`);
        await delay(10000);
      } else if (error.code === 'ECONNRESET' || (error.message && error.message.includes('socket hang up'))) {
        const retryDelay = 10000;
        console.log(`Socket hang up detected while creating comment ${sfCommentId}. Retrying after ${retryDelay} ms...`);
        await delay(retryDelay);
      } else {
        console.error(`Failed to create comment ${sfCommentId}: ${error.response ? JSON.stringify(error.response.data) : JSON.stringify(error.message)}, Payload: ${JSON.stringify(data)}`);
        console.log(error?.response?.data?.errors?.[0]);
        writeLog(OVERALL_LOG, `❌ ERROR Occured at Comment creation else: ${sfCommentId} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(data)}`);
        writeLog(ERROR_LOG, `❌ ERROR Occured at Comment creation else : ${sfCommentId} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(data)}`)
        return null;
      }
      retry++;

      if (retry === maxRetries) {
        writeLog(ERROR_LOG, `❌ Ticket ${sfCommentId} failed after ${maxRetries} retries. Payload: ${JSON.stringify(data)}`);
        console.error(`Comment ${sfCommentId} failed after ${maxRetries} attempts. Payload: ${JSON.stringify(data)}`);
        return null;
      }
    }
  }
};

const updateComment = async (sourceId, destinationId, conversationId, updationData, OVERALL_LOG, ERROR_LOG) => {
  let retryCount = 0;

  while (retryCount < 5) {
    try {
      let formData = new FormData();

      const headers = {
        Authorization: `Basic ${AUTH_VALUE}`,
        ...formData.getHeaders()
      };

      const keys = Object.keys(updationData);

      for (const key of keys) {
        if (key === 'body') {
          formData.append(key, updationData[key]);
        }
      }

      const response = await axios.put(`${BASE_URL}/${conversationId}`, formData, { headers });

      writeLog(UPDATE_COMMENT_LOG, `✅ SF Ticket Id: ${sourceId} FDK Ticket Id : ${destinationId} Conversation ID :${conversationId} Updated Successfully`);
      console.log(`✅ SF Ticket Id: ${sourceId} FDK Ticket Id : ${destinationId} Conversation ID :${conversationId} Updated Successfully`);
      return response.status;
    }
    catch (error) {
      // console.error(error)

      if (error.response.status === 429) {
        retryCount++;
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while updating ticket. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
        continue;
      }
      else {
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
            .filter((line) => line.includes(PROJECT_DIRECTORY))
            .map((line) => line.trim())
            .join("\n");

          errorMessage = `❌ ERROR updating ticket at Ticket Updation block (sourceId: ${sourceId}, destinationId: ${destinationId} ) & Payload :(${JSON.stringify(updationData)}): ${formattedErrorMsg} @ ${filteredStack}`;
        } else {
          errorMessage = `❌ ERROR updating ticket at Ticket Updation block (sourceId: ${ticketId}, destinationId: ${destinationId} ) & Payload :(${JSON.stringify(updationData)}): ${formattedErrorMsg}`;
        }

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
      }


    }
  }



}

module.exports = { createComment, updateComment };
