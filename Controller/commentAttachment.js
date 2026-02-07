const fs = require('fs');
const path = require('path');

const { writeLog, writeIDLog } = require("../Functions/commonFunctions");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { updateDestinationId, updateCount, fetchParticularRow, insertUpdateData } = require("../Functions/dynamoFunctions");
const { formatTicket } = require("../Utils/Tickets/formatTicket");
const { updateTicket } = require('../Utils/Tickets/createTicket');
const { formatComment } = require("../Utils/Comments/formatComment");
const { updateComment } = require("../Utils/Comments/createComment");


const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;
const COMMENTS_TABLE = process.env.AWS_COMMENTS_TABLE;

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const COMMENT_CREATED_LOG = process.env.COMMENT_CREATED_LOG;
const COMMENT_NOT_CREATED_LOG = process.env.COMMENT_NOT_CREATED_LOG;


const commentAttachmentFix = async () => {

    writeLog(OVERALL_LOG, "*".repeat(40), "\n\n");
    writeLog(ERROR_LOG, "*".repeat(40), "\n\n");

    writeLog(OVERALL_LOG, `Updation Started.........`);
    writeLog(ERROR_LOG, `Updation Started.........`);
    console.log(`Updation Started.........`);

    let ticketIds =[{
    "ticketId": 9754,
    "commentSourceIds": [
      22516978422939,
      22754026930843
    ]
  }] //JSON.parse(fs.readFileSync(`${process.env.PROJECT_PATH}\\Logs\\Ticket\\commentAttachmentError.json`));
    // ticketIds = ticketIds.slice(0,1);

    writeLog(OVERALL_LOG, `📦 Total tickets to Update :  ${ticketIds.length}`);
    writeLog(ERROR_LOG, `📦 Total tickets to Update : ${ticketIds.length}`);
    console.log( `📦 Total tickets to Update : ${ticketIds.length}`);

    for(const ticket of ticketIds){
        const ticketId = ticket.ticketId;
        try{
            writeLog(OVERALL_LOG, "=".repeat(40));
            writeLog(ERROR_LOG, "=".repeat(40));

            writeLog(OVERALL_LOG, `⏳ Processing 🎫  TicketId : ${ticketId}`);
            writeLog(ERROR_LOG, `⏳Processing 🎫 TicketId : ${ticketId}`);
            console.log( `⏳ Processing 🎫 TicketId : ${ticketId}`);

            let rawTicketData = await fetchParticularRow(TIC_TABLE, "sourceId", ticketId, sortKey = null, sortValue = null, OVERALL_LOG, ERROR_LOG);
        
            let ticketData = unmarshall(rawTicketData);

            const ticketDestId = ticketData.destinationId;

            if(ticketDestId){
                const commentPath = path.join(
                            process.env.TICKET_ATTACHMENT_PATH,
                            `/${ticketData.sourceData.id}/comments.json`
                          );
                let commentData = !!commentPath && JSON.parse(fs.readFileSync(commentPath, "utf8"));
                
                console.log("Comments Count", commentData.length - 1);

                const neededComments = ticket.commentSourceIds;
                const filteredComments = commentData.filter(comment => neededComments.includes(comment.id));
                console.log('Filtered Comments : ',filteredComments.length);

                for (const comment of filteredComments) {
                    try {
                        const commentPayload = await formatComment(comment, ticketDestId, ticketId, OVERALL_LOG, ERROR_LOG);

                        const rawDestCommentRow = await fetchParticularRow(COMMENTS_TABLE, "sourceId", comment.id, sortKey = null, sortValue = null, OVERALL_LOG, ERROR_LOG);
                        let destCommentRow = unmarshall(rawDestCommentRow);

                        if (destCommentRow) {
                            const destCommentId = destCommentRow.destinationId;
                            
                            const updationPayload = {
                                 "attachments[]": commentPayload["attachments[]"]
                            }
                            console.log(destCommentId,updationPayload);

                            const response = await updateComment(ticketId,ticketDestId,destCommentId,updationPayload,OVERALL_LOG,ERROR_LOG);

                            if(response === 200){
                                writeLog(OVERALL_LOG, `✅ Comment Source ID : ${comment.id} Created ID: ${destCommentId}`);
                                writeIDLog(COMMENT_CREATED_LOG, `${comment.id}: ${destCommentId},`);
                            }
                            else{
                                writeIDLog(COMMENT_NOT_CREATED_LOG, `❌ ZDK Ticket Id: ${ticketId} FDK Ticket Id : ${ticketDestId} Comment :${comment.id} Created ID: ${destCommentId} is not Updated`);
                                console.error( `❌ ZDK Ticket Id: ${ticketId} FDK Ticket Id : ${ticketDestId} Comment :${comment.id} Created ID: ${destCommentId} is not Updated`);
                            }

                            
                        } else {
                            writeLog(ERROR_LOG, `❌ ZDK Ticket Id: ${ticketId} FDK Ticket Id : ${ticketDestId} Comment :${comment} is not present in FDK`);
                            console.error(`❌ ZDK Ticket Id: ${ticketId} FDK Ticket Id : ${ticketDestId} Comment :${comment} is not present in FDK`);
                        }
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

                // const formPayload = await formatTicket(ticketData?.sourceData, OVERALL_LOG, ERROR_LOG);

                // const updationPayload = {
                //     "attachments[]": formPayload["attachments[]"]
                // }

                // await updateTicket(ticketId,ticketDestId,updationPayload,OVERALL_LOG,ERROR_LOG);
            }
            else{
                writeIDLog(TICKET_NOT_CREATED_LOG, `${ticketData.sourceData.id},`);
            }

            writeLog(OVERALL_LOG, "=".repeat(40));
            writeLog(ERROR_LOG, "=".repeat(40));
        }
        catch(error){
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


module.exports = {commentAttachmentFix}

