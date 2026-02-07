const fs = require('fs');
const path = require('path');
const { writeLog, writeIDLog, delay } = require("../Functions/commonFunctions");

require("dotenv").config();

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;

async function deleteComments() {
  writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
  writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
  writeLog(OVERALL_LOG, `Comment Deletion Started...`);
  writeLog(ERROR_LOG, `Comment Deletion Started...`);

  const commentsData = await fs.promises.readFile(process.env.TICKET_ID_FILE, 'utf-8');
  let comments = JSON.parse(commentsData);

  if (!comments) {
    console.error("No comments found for migration.");
    writeLog(OVERALL_LOG, `No comments found for migration!!`);
    writeLog(ERROR_LOG, `No comments found for migration!!`);
    return;
  }

  writeLog(OVERALL_LOG, `Total comments to Delete : ${comments.length}`);
  writeLog(ERROR_LOG, `Total comments to Delete : ${comments.length}`);

  const deleteComment = async (id) => {
    let retry = 0;
    const maxRetries = 5;
    const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/conversations/${id}`;

    writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

    console.log(`Processing Comment ID: ${id} - At `, tickets.indexOf(id));
    writeLog(OVERALL_LOG, `Processing Comment ID : ${id}`);
    writeLog(ERROR_LOG, `Processing Comment ID : ${id}`);

    while (retry < maxRetries) {
      try {
        const headers = { Authorization: `Basic ${AUTH_VALUE}` };
        const response = await axios.delete(BASE_URL, { headers });

        writeLog(OVERALL_LOG, `✅ FDK Comment Id : ${id}`);

        return response.status;
      } catch (error) {
        const status = error?.response?.status;

        if (status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
          console.log(`Rate limit reached while deleting comment. Retrying after ${retryAfter} ms...`);
          await delay(retryAfter);
        } else if (status === 502 || status === 503 || status === 504) {
          console.log(`Server error ${status} while deleting comment ${id}. Retrying in 10s...`);
          await delay(10000);
        } else if (error.code === 'ECONNRESET' || (error.message && error.message.includes('socket hang up'))) {
          const retryDelay = 10000;
          console.log(`Socket hang up detected while deleting comment ${id}. Retrying after ${retryDelay} ms...`);
          await delay(retryDelay);
        } else {
          console.error(`Failed to delete comment ${id}: ${error.response ? JSON.stringify(error.response.data) : JSON.stringify(error.message)}`);
          console.log(error?.response?.data?.errors?.[0]);
          writeLog(OVERALL_LOG, `❌ ERROR Occured at Comment deletion else: ${id} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}`);
          writeLog(ERROR_LOG, `❌ ERROR Occured at Comment deletion else : ${id} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}`);
          return null;
        }
        retry++;

        if (retry === maxRetries) {
          writeLog(ERROR_LOG, `❌ Comment ${id} failed after ${maxRetries} retries`);
          console.error(`Comment ${id} failed after ${maxRetries} attempts`);
          return null;
        }
      }
    }
  };

  const CONCURRENCY = 100;
  for (let i = 0; i < comments.length; i += CONCURRENCY) {
    const batch = comments.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(ticket => deleteComment(ticket)));
  }
};

deleteComments();
