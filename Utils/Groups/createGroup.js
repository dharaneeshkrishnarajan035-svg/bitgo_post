const axios = require('axios');
const base64 = require('base-64');


const { delay } = require('../../Functions/commonFunctions')
const { writeLog } = require('../../Functions/commonFunctions')

let FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
let FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
let BASE_URL = '';

async function createGroupInFreshdesk(groupData, OVERALL_LOG, ERROR_LOG) {

  const maxRetries = 5;
  let retry = 0;

  while (retry < maxRetries) {
    try {
      const authHeader = `Basic ${base64.encode(`${FRESHDESK_API_TOKEN}:X`)}`;
      const response = await axios.post(`https://${FRESHDESK_DOMAIN}/api/v2/groups`, groupData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      writeLog(OVERALL_LOG, `✅ Group with Name: ${groupData.name} Created : ${response.data.id}`)

      return response.data.id;
    } catch (error) {
      console.log(error?.response?.data?.errors)
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while creating ticket. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
      } else if (error?.response?.data?.errors[0]?.code === 'duplicate_value' && error?.response?.data?.errors[0]?.field === 'name') {
        writeLog(OVERALL_LOG, "Error Occured at Creating Group : ", error?.response?.data?.errors[0]?.code, " response :", error?.response?.data?.errors[0]);
        console.log(error?.response?.data?.errors[0]?.additional_info?.group_id)
        return error?.response?.data?.errors[0]?.additional_info?.group_id
        //{ id: error?.response?.data?.errors[0]?.additional_info?.group_id, name: groupData.name }
      }
      else {
        console.error("Error Occured at Creating Group ", error.response ? error.response.data?.errors[0] : error.message);
        writeLog(OVERALL_LOG, "Error Occured at Creating Group ", error.response ? error.response.data?.errors[0] : error.message);
        writeLog(ERROR_LOG, "Error Occured at Creating Group ", error.response ? error.response.data?.errors[0] : error.message)
      }
    }
  }
}


module.exports = { createGroupInFreshdesk }
