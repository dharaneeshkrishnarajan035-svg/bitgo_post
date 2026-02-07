const fs = require('fs');
const path = require('path');

// 🔧 Configuration: specify the folder manually
// const manualFolder = path.join('233', '50000-100000');
const manualFolder = path.join('233', '150000-200000', '150000-200000');
const relativeLogFilePath = path.join('Logs', 'Ticket', 'Error.log');
const actualLogFilePath = path.join('Logs', 'Ticket', 'Failed.log');
const outputFile = 'ExtractedTickets.json';
const outputCommentFile = 'ExtractedCommentTickets.json';

// 🧠 Regex patterns
const errorPattern = /❌ ERROR Occured at Comment creation/;
const sourceIdPattern = /Processing Ticket SourceID\s*:\s*(\d+)/;
const failedTicketPattern = /❌ Ticket (\d+) failed after 5 retries\. Payload: (.+)/;



const commentTickets = new Set();
const notCreatedTickets = new Set();

// Read & Process Log File
function readLogFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Existing logic for ❌ ERROR Occured at Comment creation
    if (errorPattern.test(line)) {
      for (let j = i; j >= 0; j--) {
        const match = lines[j - 1].match(sourceIdPattern);
        if (match) {
          commentTickets.add(Number(match[1]));
          break;
        }
      }
    }

    // New logic for ❌ Ticket <ID> failed...
    const failMatch = line.match(failedTicketPattern);
    if (failMatch) {
      const ticketId = failMatch[1];
      const payloadJson = failMatch[2];

      try {
        const payload = JSON.parse(payloadJson);

        if ('private' in payload) {
          const match = lines[i - 1].match(sourceIdPattern);
          if (match) {
            commentTickets.add(Number(match[1]));
          }
        } else if ('description' in payload) {
          notCreatedTickets.add(Number(ticketId));
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse JSON for Ticket ${ticketId}`);
      }
    }
  }
}

// 🛣️ Build full path to the log file
const fullPath = path.join(manualFolder, relativeLogFilePath);
console.log('fullPath', fullPath);

if (fs.existsSync(fullPath)) {
  console.log(`📂 Reading: ${fullPath}`);
  readLogFile(fullPath);
} else {
  console.error('❌ File does not exist:', fullPath);
}

const actualFilePath = path.join(manualFolder, actualLogFilePath)

const presentTicketsNotCreated = fs.readFileSync(actualFilePath, 'utf8').split(',\n')?.map(item => item !== "" ? Number(item) : null).filter(Boolean)
console.log([...presentTicketsNotCreated].length)
// 💾 Write results
const uniqueIDs = [...new Set([...presentTicketsNotCreated, ...notCreatedTickets])];
const uniqueCommentIDs = [...new Set(commentTickets)];
fs.writeFileSync(outputFile, JSON.stringify(uniqueIDs), null, 2);
fs.writeFileSync(outputCommentFile, JSON.stringify(uniqueCommentIDs), null, 2);
console.log(`✅ Done! Extracted ${uniqueIDs.length} ticket SourceIDs to ${outputFile}`);
console.log(`✅ Done! Extracted ${uniqueCommentIDs.length} Comment ticket SourceIDs to ${outputCommentFile}`);
