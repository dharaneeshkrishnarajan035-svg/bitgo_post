const fs = require('fs');
const path = require('path');
const { writeLog, writeIDLog, delay } = require("../Functions/commonFunctions");
const { fetchDestinationId } = require("../Functions/dynamoFunctions");

require("dotenv").config();

const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;
const TICKET_CREATED_LOG = process.env.TICKET_CREATED_LOG;
const TICKET_NOT_CREATED_LOG = process.env.TICKET_NOT_CREATED_LOG;

async function updateDescription() {
  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
    writeLog(OVERALL_LOG, `Ticket Migration Started...`);
    writeLog(ERROR_LOG, `Ticket Migration Started...`);
    console.log("Ticket Migration Started...");

    //Fetch Org DynamoDB Data
    const ticketsData = await fs.promises.readFile(process.env.TICKET_ID_FILE, 'utf-8');

    // Step 2: Parse the JSON string into a JavaScript array or object
    let tickets = JSON.parse(ticketsData)//?.slice(10000, 15000);

    // Restarted
    //const startIndex = tickets.indexOf(1217526);
    //if (startIndex !== -1) {
    //  tickets = tickets.slice(startIndex);
    //}

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
    console.log(tickets);

    const createDescription = async (ticket) => {
      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      console.log(`Processing Ticket ID: ${ticket} - At `, tickets.indexOf(ticket));

      writeLog(OVERALL_LOG, `Processing Ticket SourceID : ${ticket}`);
      writeLog(ERROR_LOG, `Processing Ticket SourceID : ${ticket}`);
      writeLog(OVERALL_LOG, `Formatted Ticket Payload : ${JSON.stringify(decriptionParse)}`);

      try {
        const destTicketId = await fetchDestinationId(TIC_TABLE, ticket, OVERALL_LOG, ERROR_LOG);

        if (destTicketId) {
          console.log(`✅ ZDK Ticket: ${ticket} FDK Ticket: ${destTicketId}`);
          writeLog(OVERALL_LOG, `✅ ZDK Ticket: ${ticket} FDK Ticket: ${destTicketId}`);
          writeIDLog(TICKET_CREATED_LOG, `${ticket}: ${destTicketId},`);

          const commentPath = path.join(
            process.env.TICKET_ATTACHMENT_PATH,
            `/${ticket}/description.json`
          );

          let commentData =
            !!commentPath && JSON.parse(fs.readFileSync(commentPath, "utf8"));

          console.log("Description", commentData?.description);
          const comments = `
              <div style="display: inline-block; background: linear-gradient(135deg, #e0f7fa, #e1f5fe); color: #0277bd; padding: 6px 7px; border-radius: 25px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); min-width: 200px; text-align: center; margin-bottom: 20px;font-style:italic;">
                Updated Description with Voice notes
              </div>
              ${commentData?.description}
            `;

          try {
            const commentsPayload = {
              body: comments,
              private: true
            };

            const createDescriptionComment = async () => {
              let retry = 0;
              const maxRetries = 5;
              const BASE_URL = `https://${FRESHDESK_DOMAIN}/api/v2/tickets/${ticket}/notes`;

              while (retry < maxRetries) {
                try {
                  const headers = { Authorization: `Basic ${AUTH_VALUE}` };
                  const response = await axios.post(BASE_URL, commentsPayload, { headers });

                  writeLog(OVERALL_LOG, `✅ ZDK Ticket Id: ${ticket}, FDK Ticket Id: ${destTicketId}, ZDK Comment Id: ${ticket} FDK Comment Id : ${response.data.id}`);

                  return response.data.id;
                } catch (error) {
                  const status = error?.response?.status;

                  if (status === 429) {
                    const retryAfter = parseInt(error.response.headers["retry-after"]) * 1000;
                    console.log(`Rate limit reached while creating comment. Retrying after ${retryAfter} ms...`);
                    await delay(retryAfter);
                  } else if (status === 502 || status === 503 || status === 504) {
                    console.log(`Server error ${status} while creating comment ${ticket}. Retrying in 10s...`);
                    await delay(10000);
                  } else if (error.code === 'ECONNRESET' || (error.message && error.message.includes('socket hang up'))) {
                    const retryDelay = 10000;
                    console.log(`Socket hang up detected while creating comment ${ticket}. Retrying after ${retryDelay} ms...`);
                    await delay(retryDelay);
                  } else {
                    console.error(`Failed to create comment ${ticket}: ${error.response ? JSON.stringify(error.response.data) : JSON.stringify(error.message)}, Payload: ${JSON.stringify(comments)}`);
                    console.log(error?.response?.data?.errors?.[0]);
                    writeLog(OVERALL_LOG, `❌ ERROR Occured at Comment creation else: ${ticket} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(comments)}`);
                    writeLog(ERROR_LOG, `❌ ERROR Occured at Comment creation else : ${ticket} : ${error.response ? JSON.stringify(error?.response?.data) : error.message}, Payload: ${JSON.stringify(comments)}`)
                    return null;
                  }
                  retry++;

                  if (retry === maxRetries) {
                    writeLog(ERROR_LOG, `❌ Ticket ${ticket} failed after ${maxRetries} retries. Payload: ${JSON.stringify(comments)}`);
                    console.error(`Comment ${ticket} failed after ${maxRetries} attempts. Payload: ${JSON.stringify(comments)}`);
                    return null;
                  }
                }
              }
            };

            await createDescriptionComment();

          } catch (error) {
            const frames = error.stack
              .split("\n")
              .filter(line => line.includes(PROJECT_DIRECTORY))
              .map(line => line.trim())
              .join(" | ");
            const errorMessage = `❌ ERROR Source ID ${comment.id}: ${error.message} @ ${frames}`;
            console.error(errorMessage);

            writeLog(OVERALL_LOG, errorMessage);
            writeLog(ERROR_LOG, errorMessage);
          }

          success++;
        } else {
          writeIDLog(TICKET_NOT_CREATED_LOG, `${ticket},`);
        }
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR for Source ID ${ticket} at ticketMigration, ${error.message} @ ${frames}`;
        console.error(errorMessage);

        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        writeIDLog(TICKET_NOT_CREATED_LOG, `${ticket},`);
        failure++;
      }

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');
    };

    const CONCURRENCY = 100;
    for (let i = 0; i < tickets.length; i += CONCURRENCY) {
      const batch = tickets.slice(i, i + CONCURRENCY);

      await Promise.all(batch.map(ticket => createDescription(ticket)));
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

module.exports = { updateDescription }
