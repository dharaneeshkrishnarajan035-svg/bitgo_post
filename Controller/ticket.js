const fs = require('fs');
const path = require('path');
const { writeLog, writeIDLog, readDecryptedData } = require("../Functions/commonFunctions");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { updateDestinationId, updateCount, fetchParticularRow, insertUpdateData } = require("../Functions/dynamoFunctions");
const { formatTicket } = require("../Utils/Tickets/formatTicket");
const { createTicket } = require("../Utils/Tickets/createTicket");
const { formatComment } = require("../Utils/Comments/formatComment");
const { createComment } = require("../Utils/Comments/createComment");

const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;
const COMMENTS_TABLE = process.env.AWS_COMMENTS_TABLE
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;
const TICKET_CREATED_LOG = process.env.TICKET_CREATED_LOG;
const TICKET_EXISTS_LOG = process.env.TICKET_EXISTS_LOG;
const NOT_CLOSED_TICKETS_LOG = process.env.NOT_CLOSED_TICKETS_LOG;
const SKIPPED_DATE_LOG = process.env.SKIPPED_DATE_LOG;
const TICKET_NOT_CREATED_LOG = process.env.TICKET_NOT_CREATED_LOG;
const COMMENT_CREATED_LOG = process.env.COMMENT_CREATED_LOG;
const COMMENT_NOT_CREATED_LOG = process.env.COMMENT_NOT_CREATED_LOG;
const TICKET_PROCESSED_LOG = process.env.TICKET_PROCESSED_LOG;

//Keys
const ticketIdKey = "Id";
const commentIdKey = "Id";
const commentCreatedAtKey = "CreatedDate";

const moduleId = 6;

async function ticketMigration({ start, end }) {
  try {
    // console.log("OVERALL_LOG",OVERALL_LOG);
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
    writeLog(OVERALL_LOG, `Ticket Migration Started...`);
    writeLog(ERROR_LOG, `Ticket Migration Started...`);
    console.log("Ticket Migration Started...");

    //Fetch Org DynamoDB Data
    const ticketsData = await fs.promises.readFile(process.env.TICKET_ID_FILE, 'utf-8');

    let tickets = JSON.parse(ticketsData)
      // ?.slice(start, end);
      ?.slice(0, 1);
    tickets = ["500Jw00000nAfCCIA0"]

    if (!tickets) {
      console.error("No tickets data found for migration.");
      writeLog(OVERALL_LOG, `No tickets data found for migration!!`);
      writeLog(ERROR_LOG, `No tickets data found for migration!!`);
      return;
    }

    writeLog(OVERALL_LOG, `Total tickets to Migrate : ${tickets.length}`);
    writeLog(ERROR_LOG, `Total tickets to Migrate : ${tickets.length}`);

    let success = 0;
    let failure = 0;

    for (const ticket of tickets) {
      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      let ticketData = await fetchParticularRow(
        TIC_TABLE,
        "sourceId",
        ticket,
        sortKey = null,
        sortValue = null,
        OVERALL_LOG,
        ERROR_LOG
      );

      console.log(`Processing Ticket ID: ${ticket} - At ${tickets.indexOf(ticket)}`);
      writeIDLog(TICKET_PROCESSED_LOG, `Processing Ticket ID: ${ticket} - At ${tickets.indexOf(ticket)}`);

      if (!!ticketData?.destinationId) {
        console.log(`Destination ID Exists For: ${ticket}`);
        writeIDLog(TICKET_EXISTS_LOG, `${ticketData.sourceId}: ${ticketData.destinationId},`);
        continue;
      }

      if (ticketData.sourceData.Status !== 'Closed' && ticketData.sourceData.Status !== 'Resolved') {
        console.log(`Ticket Not Cloed: ${ticket} - ${ticketData.sourceData.Status}`);
        writeIDLog(NOT_CLOSED_TICKETS_LOG, `${ticketData.sourceId} - ${ticketData.sourceData.Status}`);
        continue;
      }

      writeLog(OVERALL_LOG, `Processing Ticket SourceID : ${ticketData.sourceData[ticketIdKey]}`);
      writeLog(ERROR_LOG, `Processing Ticket SourceID : ${ticketData.sourceData[ticketIdKey]}`);

      const formPayload = await formatTicket(
        ticketData?.sourceData, ticketData?.sourceData?.Id, OVERALL_LOG, ERROR_LOG
      );

      // console.log({ formPayload });
      // return;

      writeLog(OVERALL_LOG, `Formatted Ticket Payload : ${JSON.stringify(formPayload)}`);

      try {
        const destTicketId = await createTicket(formPayload, ticketData?.sourceData, OVERALL_LOG, ERROR_LOG);

        if (destTicketId) {
          console.log(`✅ Ticket ${ticketData.sourceData[ticketIdKey]} created: ${destTicketId}`);
          writeLog(OVERALL_LOG, `✅ Ticket Source ID : ${ticketData.sourceData[ticketIdKey]} Created ID: ${destTicketId}`);
          writeIDLog(TICKET_CREATED_LOG, `"${ticketData.sourceData[ticketIdKey]}": ${destTicketId},`);

          await updateDestinationId(
            TIC_TABLE,
            ticketData.sourceData.Id,
            destTicketId,
            true,
            "Ticket",
            OVERALL_LOG,
            ERROR_LOG
          );

          const commentPath = path.join(
            process.env.TICKET_ATTACHMENT_PATH,
            `/${ticketData.sourceData[ticketIdKey]}/allComments.json`
          );

          let commentData = [];
          if (fs.existsSync(commentPath))
            commentData = readDecryptedData(commentPath, ERROR_LOG);

          console.log("Comments Count", commentData.length);
          const comments = commentData;

          // const sortedComments = comments.sort((a, b) => {
          //   return new Date(a?.LastModifiedDate) - new Date(b?.LastModifiedDate);
          // });

          if (commentData.length > 0) {
            const CONCURRENCY = 25;

            for (let i = 1; i < commentData.length; i += CONCURRENCY) {
              const batch = commentData.slice(i, i + CONCURRENCY);
              await Promise.all(batch.map(comment =>
                insertUpdateData(
                  COMMENTS_TABLE,
                  comment[commentIdKey],
                  { created_at: comment[commentCreatedAtKey] },
                  null,
                  'Notes',
                  OVERALL_LOG,
                  ERROR_LOG
                )
              ));
            }

            for (const comment of comments) {
              try {
                const commentPayload = await formatComment(
                  comment,
                  ticketData.sourceData?.Description,
                  ticketData.sourceData?.ContactId,
                  ticketData.sourceData[ticketIdKey],
                  OVERALL_LOG,
                  ERROR_LOG
                );

                let commentData = await fetchParticularRow(
                  COMMENTS_TABLE,
                  "sourceId",
                  comment[commentIdKey],
                  sortKey = null,
                  sortValue = null,
                  OVERALL_LOG,
                  ERROR_LOG
                );

                if (commentData?.destinationId) {
                  console.log(`Destination ID Exists For Comment: ${comment[commentIdKey]}`);
                  writeIDLog(COMMENT_CREATED_LOG, `${commentData?.sourceId}: ${commentData?.destinationId},`);
                  continue;
                }

                const destCommentId = await createComment(
                  commentPayload,
                  comment[commentIdKey],
                  ticketData.sourceData[ticketIdKey],
                  destTicketId,
                  OVERALL_LOG,
                  ERROR_LOG
                );

                if (destCommentId) {
                  await updateDestinationId(
                    COMMENTS_TABLE,
                    comment[commentIdKey],
                    destCommentId,
                    true,
                    "Notes",
                    OVERALL_LOG,
                    ERROR_LOG
                  );

                  writeLog(OVERALL_LOG, `✅ Comment Source ID : ${comment[commentIdKey]} Created ID: ${destCommentId}`);
                  writeIDLog(COMMENT_CREATED_LOG, `"${comment[commentIdKey]}": ${destCommentId},`);
                } else {
                  writeIDLog(COMMENT_NOT_CREATED_LOG, `"${comment[commentIdKey]}",`);
                }
              } catch (error) {
                const frames = error.stack
                  .split("\n")
                  .filter(line => line.includes(PROJECT_DIRECTORY))
                  .map(line => line.trim())
                  .join(" | ");
                const errorMessage = `❌ ERROR Source ID ${comment[commentIdKey]}: ${error.message} @ ${frames}`;
                console.error(errorMessage);

                writeLog(OVERALL_LOG, errorMessage);
                writeLog(ERROR_LOG, errorMessage);
              }
            }
          };

          success++;
        } else {
          writeIDLog(TICKET_NOT_CREATED_LOG, `${ticketData.sourceData[ticketIdKey]},`);
        }

        console.log(`✅ Completed ${ticket}`);
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR for Source ID ${ticketData.sourceId} at ticketMigration, ${error.message} @ ${frames}`;
        console.error(errorMessage);

        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        writeIDLog(TICKET_NOT_CREATED_LOG, `${ticketData.sourceData[ticketIdKey]},`);
        failure++;
      }
      // finally {
      //   if (success > 0) {
      //     await updateCount('success', moduleId, success, OVERALL_LOG, ERROR_LOG);
      //   }

      //   if (failure > 0) {
      //     await updateCount('failure', moduleId, failure, OVERALL_LOG, ERROR_LOG);
      //   }
      // }

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');
    }

    writeLog(OVERALL_LOG, `Total Success : ${success}  Total Failure : ${failure}`);
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
    console.log('***TICKET MIGRATION COMPLETED***');
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Tickets: ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error);

    console.error(errorMessage);
    writeLog(OVERALL_LOG, errorMessage)
    writeLog(ERROR_LOG, errorMessage)
  }
}

module.exports = { ticketMigration }
