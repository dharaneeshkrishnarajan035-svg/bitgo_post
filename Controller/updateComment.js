const fs = require('fs');
const path = require('path');
const { writeLog, writeIDLog } = require("../Functions/commonFunctions");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { fetchParticularRow, updateDestinationId } = require("../Functions/dynamoFunctions");
const { formatComment } = require("../Utils/Comments/formatComment");
const { updateComment, createComment } = require("../Utils/Comments/createComment");
require("dotenv").config();

const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;
const COMMENTS_TABLE = process.env.AWS_COMMENTS_TABLE;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const UPDATE_COMMENT_LOG = process.env.UPDATE_COMMENT_LOG;
const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;

const moduleId = 6;

async function updateComments() {
    writeLog(UPDATE_COMMENT_LOG, '*'.repeat(40), '\n\n');
    writeLog(UPDATE_COMMENT_LOG, `Update Comments Migration Started...`);
    console.log("Update Comments Migration Started...");

    const ticketsData = await fs.promises.readFile(process.env.TICKET_ID_FILE, 'utf-8');

    let tickets = JSON.parse(ticketsData);
    console.log('Tickets Count', tickets.length);
    
    // const endIndex = tickets.findIndex(id => id === 1982188265);
    // tickets = tickets.slice(2, 3); // endIndex

    for (const ticket of tickets) {
        let rawTicketData = await fetchParticularRow(TIC_TABLE, "sourceId", ticket, sortKey = null, sortValue = null, OVERALL_LOG, ERROR_LOG);
        let ticketData = unmarshall(rawTicketData);

        console.log(`Processing Ticket ID: ${ticket} - At ${tickets.indexOf(ticket)}`);

        const commentPath = path.join(
            process.env.TICKET_ATTACHMENT_PATH,
            `/${ticketData.sourceData.id}/comments.json`
        );

        let commentData = [];
        if (fs.existsSync(commentPath)) {
            const comments = JSON.parse(fs.readFileSync(commentPath, "utf8"));
            commentData = comments.filter(item => item.type !== 'lineitem');
        }

        const comments = commentData?.length > 0 ? commentData.slice(1) : commentData;
        console.log("Comments Count", comments.length - 1);

        if (comments.length > 0) {
            for (const comment of comments) {
                try {
                    const commentPayload = await formatComment(
                        comment,
                        ticketData.destinationId,
                        ticketData.sourceData.id,
                        OVERALL_LOG,
                        ERROR_LOG
                    );

                    let rawCommentData = await fetchParticularRow(COMMENTS_TABLE, "sourceId", comment.id, sortKey = null, sortValue = null, OVERALL_LOG, ERROR_LOG);
                    let commentData = unmarshall(rawCommentData);
                    let destCommentId = commentData?.destinationId;

                    if (!destCommentId) {
                        console.log(`Destination ID Exists For: ${destCommentId}, HS Ticket ID: ${ticket}`);
                        writeLog(UPDATE_COMMENT_LOG, `Dest Id not exist for ${comment.id}, HS Ticket ID: ${ticket}`);

                        const createdCommentId = await createComment(
                            commentPayload,
                            comment.id,
                            ticketData.sourceData.id,
                            ticketData.destinationId,
                            OVERALL_LOG,
                            ERROR_LOG
                        );

                        if (createdCommentId) {
                            await updateDestinationId(
                                COMMENTS_TABLE,
                                comment.id,
                                createdCommentId,
                                true,
                                "Notes",
                                OVERALL_LOG,
                                ERROR_LOG
                            );
                            writeLog(UPDATE_COMMENT_LOG, `✅ Comment Source ID : ${comment.id} Created ID: ${createdCommentId}`);
                        } else {
                            writeIDLog(COMMENT_NOT_CREATED_LOG, `${comment.id},`);
                        }
                        continue;
                    }

                    console.log(destCommentId);

                    await updateComment(
                        ticketData.sourceData.id,
                        ticketData.destinationId,
                        destCommentId,
                        commentPayload,
                        OVERALL_LOG,
                        ERROR_LOG
                    );
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
            }
        }
    }
}

module.exports = { updateComments };