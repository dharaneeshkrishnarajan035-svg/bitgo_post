
const axios = require('axios');
const base64 = require('base-64');
const { delay } = require('../../Functions/commonFunctions')
const { writeLog,writeIDLog } = require('../../Functions/commonFunctions')

let FRESHDESK_DOMAIN = process.env.DESTINATION_DOMAIN;
let FRESHDESK_API_TOKEN = process.env.DESTINATION_API_KEY;
let BASE_URL = '';

const NOT_CREATED_LOG = process.env.COMPANY_NOT_CREATED_LOG;

const createCompanyInFreshdesk = async (sourceId,companyData, OVERALL_LOG, ERROR_LOG) => {
  const authValue = base64.encode(`${FRESHDESK_API_TOKEN}:X`);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authValue}`
  };
  BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/companies`;

  // console.log("COMPANY DATA", companyData);

  let retry = 0;
  const maxRetries = 5;

  while (retry < maxRetries) {
    try {
      const response = await axios.post(BASE_URL, companyData, { headers });
      writeLog(OVERALL_LOG, `✅ Company with Name: ${companyData.name} Created : ${response.data.id}`)
      return response.data.id;
    } catch (error) {
      writeLog(OVERALL_LOG, `❌ ERROR Occured at Company creation : ${companyData.name} : ${JSON.stringify(error?.response?.data)}`)
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
        console.log(
          `Rate limit reached while creating ticket. Retrying after ${retryAfter} ms...`
        );
        await delay(retryAfter);
      } else if (error?.response?.data?.errors[0]?.code === 'duplicate_value' && error?.response?.data?.errors[0]?.field === 'domains') {
        console.log(error?.response?.data?.errors[0])
        console.error("Duplicate Domains already exists :", error?.response?.data?.errors[0]?.additional_info?.company_id)
        retry++;
        console.log("Retrying to Create Attempt ", retry)
        delete companyData.domains
        continue
      } else if (error?.response?.data?.errors[0]?.code === 'duplicate_value' && error?.response?.data?.errors[0]?.field === 'name') {
        console.error("Duplicate Company with this name already exists :", error?.response?.data?.errors[0]?.additional_info?.company_id)
        return error?.response?.data?.errors[0]?.additional_info?.company_id
      } else {
        console.error(`❌ Failed to create company ${companyData.name}: ${JSON.stringify(companyData)} ${error.response ? JSON.stringify(error?.response?.data?.errors[0]) : error.message}`);
        // console.log(error?.response?.data?.errors[0])
        writeLog(OVERALL_LOG, `❌ ERROR Occured at Company creation else: ${sourceId} ${companyData.name} :${JSON.stringify(companyData)} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}`)
        writeLog(ERROR_LOG, `❌ ERROR Occured at Company creation else : ${sourceId} ${companyData.name} :${JSON.stringify(companyData)} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}`)
        writeIDLog(NOT_CREATED_LOG, `${sourceId}`)
        return null
      }
    }
  }
};

module.exports = { createCompanyInFreshdesk }
