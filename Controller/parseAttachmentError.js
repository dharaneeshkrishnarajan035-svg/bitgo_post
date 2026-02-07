const fs = require('fs');


const logFilePath = process.env.TICKET_ERROR_LOG; 



const parseErrorLogs = () =>{
    try{
        // Read log file
        const logData = fs.readFileSync(logFilePath, 'utf-8');

        // Define regular expressions
        const ticketAttachmentRegex = /❌ Attachment Error Source ID (\d+) : ENOENT/g;
        const commentAttachmentRegex = /❌ Attachment Error Source ID (\d+) ZDK (\d+) : ENOENT/g;

        // Containers for result
        const ticketAttachmentErrors = new Set();
        const commentAttachmentMap = {};

        // Extract ticket attachment errors
        let match;
        while ((match = ticketAttachmentRegex.exec(logData)) !== null) {
        ticketAttachmentErrors.add(match[1]);
        }

        // Extract comment attachment errors
        while ((match = commentAttachmentRegex.exec(logData)) !== null) {
        const commentId = match[1];
        const ticketId = Number(match[2]);

        if (!commentAttachmentMap[ticketId]) {
            commentAttachmentMap[ticketId] = [];
        }
        commentAttachmentMap[ticketId].push(Number(commentId));
        }

        // Format results
        const ticketAttachmentArray = Array.from(ticketAttachmentErrors).map(id => Number(id));

        const commentAttachmentErrors = Object.entries(commentAttachmentMap).map(([ticketId, commentSourceIds]) => ({
        ticketId:Number(ticketId),
        commentSourceIds
        }));

        // Output results
        console.log('\nTotal Ticket Attachment Errors:', ticketAttachmentArray.length);
        console.log('\nTotal Comment Attachment Errors:', commentAttachmentErrors.length);

        const commentsErrorTickets = commentAttachmentErrors.map(item =>item.ticketId)

        fs.writeFileSync(`${process.env.PROJECT_PATH}\\Logs\\Ticket\\ticketAttachmentError.json`,JSON.stringify(ticketAttachmentArray,null,2));
        fs.writeFileSync(`${process.env.PROJECT_PATH}\\Logs\\Ticket\\commentAttachmentError.json`,JSON.stringify(commentAttachmentErrors,null,2));
        fs.writeFileSync(`${process.env.PROJECT_PATH}\\Logs\\Ticket\\commentAttachmentErrorTickets.json`,JSON.stringify(commentsErrorTickets,null,2));

    }
    catch(error){
        console.error(`Error Occured at Parse Error Logs : `,error)
    }
}

module.exports = {parseErrorLogs}