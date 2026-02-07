const fs = require('fs');

const { writeLog, writeIDLog } = require("../Functions/commonFunctions");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { updateDestinationId, updateCount, fetchParticularRow, insertUpdateData } = require("../Functions/dynamoFunctions");
const { formatTicket } = require("../Utils/Tickets/formatTicket");
const { updateTicket } = require('../Utils/Tickets/createTicket');

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;
const TICKET_NOT_CREATED_LOG = process.env.TICKET_NOT_CREATED_LOG;


const ticketAttachmentFix = async () => {

  writeLog(OVERALL_LOG, "*".repeat(40), "\n\n");
  writeLog(ERROR_LOG, "*".repeat(40), "\n\n");

  writeLog(OVERALL_LOG, `Updation Started.........`);
  writeLog(ERROR_LOG, `Updation Started.........`);
  console.log(`Updation Started.........`);

  let ticketIds = [10239]//JSON.parse(fs.readFileSync(`${process.env.PROJECT_PATH}\\Logs\\Ticket\\ticketAttachmentError.json`));
  // ticketIds = ticketIds.slice(0,1);

  writeLog(OVERALL_LOG, `📦 Total tickets to Update :  ${ticketIds.length}`);
  writeLog(ERROR_LOG, `📦 Total tickets to Update : ${ticketIds.length}`);
  console.log(`📦 Total tickets to Update : ${ticketIds.length}`);

  for (const ticketId of ticketIds) {
    try {
      writeLog(OVERALL_LOG, "=".repeat(40));
      writeLog(ERROR_LOG, "=".repeat(40));

      writeLog(OVERALL_LOG, `⏳ Processing 🎫  TicketId : ${ticketId}`);
      writeLog(ERROR_LOG, `⏳Processing 🎫 TicketId : ${ticketId}`);
      console.log(`⏳ Processing 🎫 TicketId : ${ticketId}`);

      let rawTicketData = await fetchParticularRow(TIC_TABLE, "sourceId", ticketId, sortKey = null, sortValue = null, OVERALL_LOG, ERROR_LOG);

      let ticketData = unmarshall(rawTicketData);

      const ticketDestId = ticketData.destinationId;

      if (ticketDestId) {
        const formPayload = await formatTicket(ticketData?.sourceData, OVERALL_LOG, ERROR_LOG);

        const updationPayload = {
          "attachments[]": formPayload["attachments[]"]
        }

        await updateTicket(ticketId, ticketDestId, updationPayload, OVERALL_LOG, ERROR_LOG);
      }
      else {
        writeIDLog(TICKET_NOT_CREATED_LOG, `${ticketData.sourceData.id},`);
      }

      writeLog(OVERALL_LOG, "=".repeat(40));
      writeLog(ERROR_LOG, "=".repeat(40));
    }
    catch (error) {
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

        errorMessage = `❌ ERROR creating ticket at Ticket Attachment Fix block (sourceId: ${ticketId} ) & Payload :(): ${formattedErrorMsg} @ ${filteredStack}`;
      } else {
        errorMessage = `❌ ERROR creating ticket at Ticket Attachment Fix block (sourceId: ${ticketId} ) & Payload :(): ${formattedErrorMsg}`;
      }

      console.error(errorMessage);
      writeLog(OVERALL_LOG, errorMessage);
      writeLog(ERROR_LOG, errorMessage);
      writeLog(OVERALL_LOG, "=".repeat(40));
      writeLog(ERROR_LOG, "=".repeat(40));
    }
  }



}


module.exports = { ticketAttachmentFix }
