
const axios = require('axios');
const base64 = require('base-64');
const FormData = require('form-data');
const { delay } = require('../../Functions/commonFunctions');
const { writeLog,writeIDLog } = require('../../Functions/commonFunctions');
const { agents,agentIds } = require('./mappings');

const FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
const FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
const AUTH_VALUE = base64.encode(`${FRESHDESK_API_TOKEN}:X`);
const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/tickets`;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
// const TICKET_NOT_CREATED_LOG = process.env.TICKET_NOT_CREATED_LOG;


const createTicket = async (data, ticket, OVERALL_LOG, ERROR_LOG) => {
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
        if (key.includes('[]') && key !== 'attachments[]') {
          data[key]?.forEach(element => {
            formData.append(key, element);
          });
        } else if (key !== 'attachments[]') {
          formData.append(key, data[key]);
        }else if (key === 'attachments[]') {
          const attachments = data[key] ?? [];
          attachments.map(item => {
            formData.append(key, item.file, item.filename)
          });
        }
      }

      // console.log("formData",formData);

      console.log('ENTERED THE TICKET CREATION BLOCK IN CREATE_TICKET.JS', ticket.Id);
      const response = await axios.post(BASE_URL, formData, { headers });
      console.log('TICKET CREATED!!!');
      writeLog(OVERALL_LOG, `✅ HS Ticket Id: ${ticket.id} Created : ${response.data.id}`);

      return response.data.id;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while creating ticket. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
      } else if (status === 502 || status === 503 || status === 504) {
        console.log(`Server error ${status} while creating ticket ${ticket.id}. Retrying in 5s...`);
        await delay(10000);
      } else if (error.code === 'ECONNRESET' || (error.message && error.message.includes('socket hang up'))) {
        console.log('TICKET NOT CREATED AND THE ERROR CODE IS ', error.code);
        const retryDelay = 1000;
        console.log(`Socket hang up detected while creating ticket ${ticket.id}. Retrying after ${retryDelay} ms...`);
        writeLog(OVERALL_LOG, `❌ ERROR Occured at Ticket creation else: ${ticket.id} : Socket hang up detected while creating ticket ${ticket.id}`);
        writeLog(ERROR_LOG, `❌ ERROR Occured at Ticket creation else : ${ticket.id} : Socket hang up detected while creating ticket ${ticket.id}`);
        // writeIDLog(TICKET_NOT_CREATED_LOG,`${sourceId}`);
        return null;
      } else {
        if (
          error?.response?.data?.errors[0]?.field === 'company_id'
          && error?.response?.data?.errors[0]?.message === 'The requester does not belong to the specified company'
        ) {
          console.log('REQUESTER DOES NOT BELONGS TO THE SPECIFIED COMPANY');
          
          const getRequester = await axios.get( `https://${FRESHDESK_DOMAIN}/api/v2/contacts/${data.requester_id}`,
            { headers: { Authorization: `Basic ${AUTH_VALUE}` } }
          );

        
          if(getRequester){
            let updationPayload = {};

            if(getRequester?.company_id){
              const newCompany = { company_id: data.company_id };
              
              updationPayload = {
                other_companies : [...getRequester?.other_companies,newCompany]
              }
            }
            else{
              updationPayload = { company_id: data.company_id }
            }

            const updateRequester = await axios.put(
              `https://${FRESHDESK_DOMAIN}/api/v2/contacts/${data.requester_id}`,
              updationPayload,
              { headers: { Authorization: `Basic ${AUTH_VALUE}` } }
            );
            continue;

          }     
        }

        console.error(`Failed to create ticket ${ticket.id}: ${error.response ? JSON.stringify(error.response.data) : JSON.stringify(error.message)}, Payload: ${JSON.stringify(data)}`);

        console.log(error?.response?.data?.errors[0]);
        writeLog(OVERALL_LOG, `❌ ERROR Occured at Ticket creation else: ${ticket.id} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(data)}`);
        writeLog(ERROR_LOG, `❌ ERROR Occured at Ticket creation else : ${ticket.id} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(data)}`);
        // writeIDLog(TICKET_NOT_CREATED_LOG,`${sourceId}`);
        return null;
      }
      retry++;

      if (retry === maxRetries) {
        writeLog(ERROR_LOG, `❌ Ticket ${ticket.id} failed after ${maxRetries} retries. Payload: ${JSON.stringify(data)}`);
        console.error(`Ticket ${ticket.id} failed after ${maxRetries} attempts. Payload: ${JSON.stringify(data)}`);
        // writeIDLog(TICKET_NOT_CREATED_LOG,`${sourceId}`);
        return null;
      }
    }
  }
};

const updateTicket = async (sourceId, destinationId, updationData, OVERALL_LOG, ERROR_LOG) => {
  let retryCount = 0;

  while (retryCount < 5) {
    try {
      let formData = new FormData();

      const headers = {
        Authorization: `Basic ${AUTH_VALUE}`,
        ...formData.getHeaders()
      };

      const attachments = updationData["attachments[]"] ?? [];
      attachments.map(item => {
        formData.append("attachments[]", item.file, item.filename)
      });

      await axios.put(`${BASE_URL}/${destinationId}`, formData, { headers });

      writeLog(OVERALL_LOG, `✅ HS Ticket Id: ${sourceId} FDK Ticket Id : ${destinationId} Updated Successfully`);
      console.log(`✅ HS Ticket Id: ${sourceId} FDK Ticket Id : ${destinationId} Updated Successfully`);
      return;
    }
    catch (error) {
      console.error(error)

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

module.exports = { createTicket, updateTicket };
