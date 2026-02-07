const path = require("path");
const fs = require("fs");
const axios = require('axios');
const { EventEmitter } = require('events');
const { getValidAccessToken } = require("../Utils/getAccessToken");
const { decryptJSON } = require("./encDec");
const { uploadFileToS3 } = require("./uploadFileToS3");

const PROJECT_PATH = process.env.PROJECT_PATH;

const loggers = new Map();

function ensureDirectoryExistence(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

class LogWriter extends EventEmitter {
  constructor(logFilePath, maxSizeMB = 10) {
    super();
    this.logFilePath = logFilePath;
    this.maxSize = maxSizeMB * 1024 * 1024;
    this.queue = [];
    this.writing = false;

    ensureDirectoryExistence(this.logFilePath);
    this._startWriter();
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.queue.push(`${timestamp} : ${message}\n`);
    this.emit('new');
  }

  _startWriter() {
    this.on('new', async () => {
      if (this.writing) return;
      this.writing = true;

      while (this.queue.length) {
        try {
          await this._checkRotate();
          const msg = this.queue.shift();
          await fs.promises.appendFile(this.logFilePath, msg);
        } catch (err) {
          console.error("❌ Failed to write log:", err);
          console.log(this.logFilePath, this.queue.shift());
        }
      }

      this.writing = false;
    });
  }

  async _checkRotate() {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const stats = await fs.promises.stat(this.logFilePath);
        if (stats.size >= this.maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const ext = path.extname(this.logFilePath);
          const base = path.basename(this.logFilePath, ext);
          const dir = path.dirname(this.logFilePath);
          const rotatedPath = path.join(dir, `${base}-${timestamp}${ext}`);
          await fs.promises.rename(this.logFilePath, rotatedPath);
          console.log(`🌀 Log rotated: ${rotatedPath}`);
        }
      }
    } catch (err) {
      console.error("❌ Error checking or rotating log:", err);
    }
  }
}

function writeLog(filePath, message) {
  if (!loggers.has(filePath)) {
    loggers.set(filePath, new LogWriter(filePath));
  }
  const logger = loggers.get(filePath);
  logger.log(message);
}

function writeIDLog(logFilePath, message) {
  ensureDirectoryExistence(logFilePath);

  const logMessage = `${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write log:", err);
    }
  });
}

function delay(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTextArea(value) {
  return value.replace(/\\"/g, '').replace(/"/g, '');
}

const handleRateLimit = async (headers) => {
  const remaining = parseInt(headers.get("x-ratelimit-remaining"));
  const retryAfter = parseInt(headers.get("Retry-After"));

  console.log(`Rate limited. Retrying after ${retryAfter / 1000} seconds...`);

  if (remaining === 0 || isNaN(remaining)) {
    console.log(`Rate limit reached. Waiting for ${retryAfter} seconds.`);
    await customSetTimeout(retryAfter * 1000);
  }

};

function convertStringToHoursMinutes(stringHours) {
  const match = stringHours.match(/(\d+)h\s*(\d+)m/);
  if (!match) return null;

  const hours = match[1].padStart(2, '0');
  const minutes = match[2].padStart(2, '0');

  return `${hours}:${minutes}`;
}

function generateTableHTML(jsonData) {
  let html = '<table>';

  // Process each table row
  jsonData.content.forEach(row => {
    html += '<tr>';

    // Process each table cell
    row.content.forEach(cell => {
      html += '<td>';

      // Process cell content
      cell.content.forEach(item => {
        if (item.type === 'mediaSingle') {
          const media = item.content[0];
          html += `<img src="media-${media.attrs.id}.jpg" alt="Media" height="${media.attrs.height}" width="${media.attrs.width}">`;
        }

        if (item.type === 'paragraph') {
          html += '<p>';
          item.content.forEach(content => {
            if (content.type === 'text') {
              let text = content.text;
              let spanAttrs = [];

              if (content.marks) {
                content.marks.forEach(mark => {
                  if (mark.type === 'textColor') {
                    spanAttrs.push(`style="color: ${mark.attrs.color}"`);
                  }
                  if (mark.type === 'strong') {
                    spanAttrs.push('class="bold"');
                  }
                  if (mark.type === 'underline') {
                    spanAttrs.push('class="underline"');
                  }
                  if (mark.type === 'link') {
                    text = `<a href="${mark.attrs.href}" style="color: ${mark.attrs.color || ''}">${text}</a>`;
                  }
                });
              }

              if (spanAttrs.length > 0 && !content.marks?.some(m => m.type === 'link')) {
                html += `<span ${spanAttrs.join(' ')}>${text}</span>`;
              } else {
                html += text;
              }
            }
            if (content.type === 'hardBreak') {
              html += '<br>';
            }
          });
          html += '</p>';
        }
      });

      html += '</td>';
    });

    html += '</tr>';
  });

  html += '</table>';
  return html;
}

function convertToHTML(text) {
  // Convert bold text (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert markdown images (![alt](url))
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

  // Convert markdown links ([text](url))
  text = text.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Convert new lines to <br> (except if it's within a table)
  text = text.replace(/\n/g, "<br>");

  // Convert table headers (--- ---) to <table>
  text = text.replace(/--- ---/g, "</th></tr><tr>");

  // Convert table rows (separated by new lines) into table structure
  text = text.replace(/([^\n]+)\n/g, "<tr><td>$1</td></tr>");

  // Wrap the table structure properly
  text = text.replace(/<tr><td>(.*?)<\/td><\/tr>/g, "<table border='1' style='border-collapse:collapse;width:100%;'><thead><tr><th>$1</th></tr></thead><tbody>") + "</tbody></table>";

  return text;
}

function convertADFtoHTML(adf) {
  if (!adf || adf.type !== "doc" || !adf.content) return "";

  function processNode(node) {
    if (!node) return "";
    switch (node.type) {
      case "paragraph":
        return `<p>${node.content ? node.content.map(processNode).join("") : ""}</p>`;
      case "text":
        let text = node.text || "";
        if (node.marks) {
          node.marks.forEach(mark => {
            if (mark.type === "strong") text = `<strong>${text}</strong>`;
            if (mark.type === "em") text = `<em>${text}</em>`;
            if (mark.type === "underline") text = `<u>${text}</u>`;
            if (mark.type === "code") text = `<code>${text}</code>`;
            if (mark.type === "link") text = `<a href="${mark.attrs.href}" target="_blank">${text}</a>`;
            // Handle textColor with inline style since HTML doesn't natively support it
            if (mark.type === "textColor") text = `<span style="color: ${mark.attrs.color}">${text}</span>`;
          });
        }
        return text;
      case "emoji":
        return node.attrs.text || "";
      case "bulletList":
        return `<ul>${node.content.map(processNode).join("")}</ul>`;
      case "orderedList":
        return `<ol>${node.content.map(processNode).join("")}</ol>`;
      case "listItem":
        return `<li>${node.content.map(processNode).join("")}</li>`;
      case "mention":
        return `<span class="mention">${node.attrs.text}</span>`;
      case "mediaSingle":
        if (node.content && node.content[0] && node.content[0].type === "media") {
          const media = node.content[0];
          const width = 200; //media.attrs.width ||
          const height = 183; // media.attrs.height ||
          const mimeType = "image"; // Placeholder; ideally, pass this from attachment data

          // Create a styled div box with centered MIME type
          return `
            <div style="
              width: ${width}px;
              height: ${height}px;
              border: 1px solid #ccc;
              border-radius:20px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color:rgb(255, 255, 255);
              margin: 10px auto;
              text-align: center;
              font-family: Arial, sans-serif;
              font-size: 14px;
              color: #666;
            ">
              ${mimeType}
            </div>
          `;
        }
        return ""
      case "mediaGroup":
        if (node.content && node.content[0] && node.content[0].type === "media") {
          const media = node.content[0];
          const width = 200; //media.attrs.width ||
          const height = 183; // media.attrs.height ||
          const mimeType = "file"; // Placeholder; ideally, pass this from attachment data

          // Create a styled div box with centered MIME type
          return `
              <div style="
                width: ${width}px;
                height: ${height}px;
                border: 1px solid #ccc;
                border-radius:20px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color:rgb(255, 255, 255);
                margin: 10px auto;
                text-align: center;
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #666;
              ">
                ${mimeType}
              </div>
            `;
        }
        return ""
      case "table":
        return `<table style="border-collapse: collapse; width: 100%;">${node.content.map(processNode).join("")}</table>`;
      case "tableRow":
        return `<tr>${node.content.map(processNode).join("")}</tr>`;
      case "tableCell":
        return `<td style="border: 1px solid #ccc; padding: 8px;">${node.content ? node.content.map(processNode).join("") : ""}</td>`;
      case "hardBreak":
        return `<br>`;
      default:
        return ""; // Return empty for unhandled types
    }
  }

  return adf.content.map(processNode).join("<br>");
}

async function deleteAllFiles() {
  const deletingFolderPath = process.env.sourceAttachmentPath;

  fs.readdir(deletingFolderPath, (err, files) => {
    if (err) {
      writeLog(
        process.env.TICKET_ERROR_LOG,
        `Error reading folder : ${JSON.stringify(err)} `
      )
      console.error('Error reading folder:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(deletingFolderPath, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${file}:`, err);
          writeLog(
            process.env.TICKET_ERROR_LOG,
            `Error at deleteAllFiles deleting file ${file} : ${JSON.stringify(err)} `
          )
        } else {
          console.log(`Deleted: ${file}`);
        }
      });
    });
  });
}

const validTimeZones = [
  'American Samoa', 'International Date Line West', 'Midway Island', 'Hawaii',
  'Alaska', 'Pacific Time (US & Canada)', 'Tijuana', 'Arizona', 'Mazatlan',
  'Mountain Time (US & Canada)', 'Central America', 'Central Time (US & Canada)',
  'Chihuahua', 'Guadalajara', 'Mexico City', 'Monterrey', 'Saskatchewan',
  'Bogota', 'Eastern Time (US & Canada)', 'Indiana (East)', 'Lima', 'Quito',
  'Atlantic Time (Canada)', 'Caracas', 'Georgetown', 'La Paz', 'Santiago',
  'Newfoundland', 'Brasilia', 'Buenos Aires', 'Montevideo', 'Greenland',
  'Mid-Atlantic', 'Azores', 'Cape Verde Is.', 'Casablanca', 'Dublin',
  'Edinburgh', 'Lisbon', 'London', 'Monrovia', 'UTC', 'Amsterdam', 'Belgrade',
  'Berlin', 'Bern', 'Bratislava', 'Brussels', 'Budapest', 'Copenhagen',
  'Ljubljana', 'Madrid', 'Paris', 'Prague', 'Rome', 'Sarajevo', 'Skopje',
  'Stockholm', 'Vienna', 'Warsaw', 'West Central Africa', 'Zagreb', 'Athens',
  'Bucharest', 'Cairo', 'Harare', 'Helsinki', 'Jerusalem', 'Kaliningrad',
  'Kyiv', 'Pretoria', 'Riga', 'Sofia', 'Tallinn', 'Vilnius', 'Baghdad',
  'Istanbul', 'Kuwait', 'Minsk', 'Moscow', 'Nairobi', 'Riyadh', 'St. Petersburg',
  'Volgograd', 'Tehran', 'Abu Dhabi', 'Baku', 'Muscat', 'Samara', 'Tbilisi',
  'Yerevan', 'Kabul', 'Ekaterinburg', 'Islamabad', 'Karachi', 'Tashkent',
  'Chennai', 'Kolkata', 'Mumbai', 'New Delhi', 'Sri Jayawardenepura', 'Kathmandu',
  'Almaty', 'Astana', 'Dhaka', 'Urumqi', 'Rangoon', 'Bangkok', 'Hanoi', 'Jakarta',
  'Krasnoyarsk', 'Novosibirsk', 'Beijing', 'Chongqing', 'Hong Kong', 'Irkutsk',
  'Kuala Lumpur', 'Perth', 'Singapore', 'Taipei', 'Ulaanbaatar', 'Osaka', 'Sapporo',
  'Seoul', 'Tokyo', 'Yakutsk', 'Adelaide', 'Darwin', 'Brisbane', 'Canberra', 'Guam',
  'Hobart', 'Melbourne', 'Port Moresby', 'Sydney', 'Vladivostok', 'Magadan',
  'New Caledonia', 'Solomon Is.', 'Srednekolymsk', 'Auckland', 'Fiji', 'Kamchatka',
  'Marshall Is.', 'Wellington', 'Chatham Is.', 'Nuku\'alofa', 'Samoa', 'Tokelau Is.'
];

const readDecryptedData = (filePath, ERROR_LOG) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContent);

    if (Array.isArray(parsed)) {
      return parsed.map((encryptedObj, index) => {
        try {
          const decrypted = decryptJSON(encryptedObj);
          return JSON.parse(decrypted);
        } catch (err) {
          const eMsg = `❌ Failed to decrypt array item [${index}] in file ${filePath}: ${err.message}`;
          console.error(eMsg);
          writeLog(ERROR_LOG, eMsg);
          return null;
        }
      }).filter(Boolean);
    }

    if (typeof parsed === "object" && parsed !== null) {
      try {
        const decrypted = decryptJSON(parsed);
        return JSON.parse(decrypted);
      } catch (err) {
        const eMsg = `❌ Failed to decrypt object in file ${filePath}: ${err.message}`;
        console.error(eMsg);
        writeLog(ERROR_LOG, eMsg);
        return null;
      }
    }

    const errorMessage = `❌ Invalid encrypted data format in file ${filePath}`;
    console.error(errorMessage);
    writeLog(ERROR_LOG, errorMessage);
    return null;

  } catch (error) {
    const errorMsg = error?.response?.data || error.message;
    const final = `❌ ERROR reading/decrypting file ${filePath}: ${errorMsg}`;
    console.error(final);
    writeLog(ERROR_LOG, final);
    return null;
  }
};

function generateHtml({ datetimestamp, lastModifiedDatetime, cc_emails = [], bcc_emails = [], message, attachments = [], commentData = null }) {
  let dateHtml = '';
  let updatedDateHtml = '';
  let metadata = '';

  if (datetimestamp) {
    const utcDate = new Date(datetimestamp);

    const options = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'

    };

    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short'

    };

    const datePart = utcDate.toLocaleDateString('en-US', options);
    const timePart = utcDate.toLocaleTimeString('en-US', timeOptions);

    const formattedTimeStamp = `${datePart} at ${timePart}`;

    dateHtml = formattedTimeStamp ? `
    <div style="display: inline-block;
            background-color: #2c3e50;
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-family: -apple-system, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;">
    Created at: ${formattedTimeStamp}
</div>
  ` : '';
  }

  if (lastModifiedDatetime) {
    const utcDate = new Date(lastModifiedDatetime);

    const options = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'

    };

    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short'

    };

    const datePart = utcDate.toLocaleDateString('en-US', options);
    const timePart = utcDate.toLocaleTimeString('en-US', timeOptions);

    const formattedTimeStamp = `${datePart} at ${timePart}`;

    updatedDateHtml = formattedTimeStamp ? `
    <div style="display: inline-block;
            background-color: #2c3e50;
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-family: -apple-system, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;">
    Updated at: ${formattedTimeStamp}
</div>
  ` : '';
  }

  //Create CC Emails HTML if the array is provided
  // const ccEmailsHtml = cc_emails.length > 0 ? `
  //   <div style="font-size: 13px; color: #333; padding: 10px 0; line-height: 1.5; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background-color: #f3f3f3;font-style:italic;">
  //     <strong style="color: #0277bd;">CC Emails:</strong> ${cc_emails.join(', ')}
  //   </div>
  // ` : '';

  // //Create CC Emails HTML if the array is provided
  // const bccEmailsHtml = bcc_emails.length > 0 ? `
  //   <div style="font-size: 13px; color: #333; padding: 10px 0; line-height: 1.5; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background-color: #f3f3f3;font-style:italic;">
  //     <strong style="color: #0277bd;">BCC Emails:</strong> ${bcc_emails.join(', ')}
  //   </div>
  // ` : '';

  // Message content
  const messageHtml = message ? message : 'Migrated Comment';

  // Attachments HTML if the array is provided
  const attachmentsHtml = attachments.length > 0 ? `
    <div style="padding: 10px 0; font-size: 14px; color: #333; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background-color: #f3f3f3;">
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 10px; color: #0277bd;">Attachments</div>
      ${attachments.map(attachment => `
        <div style="margin: 6px 0;">
          <a href="${attachment.link}" target="_blank" style="color: #1565c0; text-decoration: none; font-weight: 500;">
            ${attachment.filename}
          </a>
        </div>
      `).join('')}
    </div>
  ` : '';

  if (commentData?.FromAddress || cc_emails.length > 0 || bcc_emails.length > 0) {
    metadata = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  border: 1px solid #e0e6ed;
                  border-left: 4px solid #2c3e50;
                  border-radius: 4px;
                  background-color: #f9fbfd;
                  padding: 12px;
                  margin-bottom: 15px;
                  max-width: 100%;">

          <div style="font-size: 11px; color: #697386; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e0e6ed; padding-bottom: 4px;">
              Legacy Email Metadata
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5;">
              ${commentData?.Subject ? `<tr>
                  <td style="width: 100px; color: #4f566b; font-weight: 600; vertical-align: top;">Subject:</td>
                  <td style="color: #1a1f36; font-weight: 500;">${commentData?.Subject}</td>
              </tr>` : ''}
              ${commentData?.FromAddress ? `<tr>
                  <td style="width: 100px; color: #4f566b; font-weight: 600; vertical-align: top;">From:</td>
                  <td style="color: #1a1f36;">${commentData?.FromAddress}</td>
              </tr>`: ''}
              ${commentData?.ToAddress ? `<tr>
                  <td style="width: 100px; color: #4f566b; font-weight: 600; vertical-align: top;">To:</td>
                  <td style="color: #1a1f36;">${commentData?.ToAddress}</td>
              </tr>`: ''}
              ${(cc_emails?.length > 0 || commentData?.CcAddress) ? `<tr>
                  <td style="width: 100px; color: #4f566b; font-weight: 600; vertical-align: top;">Cc:</td>
                  <td style="color: #1a1f36;">${cc_emails?.length > 0 ? cc_emails.join('; ') : commentData?.CcAddress}</td>
              </tr>`: ''}
              ${(bcc_emails?.length > 0 || commentData?.BccAddress) ? `<tr>
                  <td style="width: 100px; color: #4f566b; font-weight: 600; vertical-align: top;">Bcc:</td>
                  <td style="color: #1a1f36;">${bcc_emails?.length > 0 ? bcc_emails.join('; ') : commentData?.BccAddress}</td>
              </tr>`: ''}
          </table>
      </div>
    `;
  }

  // Combine all the parts into one final HTML structure
  return `
    <div style="font-family: Arial, sans-serif; margin: 0 auto;">
      ${dateHtml} <br />
      ${updatedDateHtml} <br />
      ${metadata} ${metadata.length > 0 ? '<br />' : ''}
      ${messageHtml}
      ${attachmentsHtml}
    </div>
  `;
}

// async function pickAttachments(attachmentsData, folderPath, ticketId) {
//   let filesSizeInMB = 0;
//   let attachments = [];
//   let s3Links = [];

//   for (const attachment of attachmentsData) {
//     const fileName = attachment?.Name ?? `${attachment?.Title}.${attachment?.FileExtension}`;
//     const filePath = path.join(folderPath, fileName);

//     if (!fs.existsSync(filePath)) {
//       console.warn(`File not found: ${fileName}, skipping.`);
//       continue;
//     }

//     const attachmentSizeInBytes = attachment?.BodyLength ?? attachment?.ContentSize;
//     const attachmentSizeInMb = attachmentSizeInBytes / (1024 * 1024);

//     // If adding this file exceeds 20MB, upload to S3 instead of attaching
//     console.log(filesSizeInMB + attachmentSizeInMb, "###");

//     if (filesSizeInMB + attachmentSizeInMb > 20) {
//       console.log(`File ${fileName} exceeds 20MB limit. Uploading to S3...`);
//       try {
//         const s3Url = await uploadFileToS3(filePath, fileName, ticketId);
//         s3Links.push(s3Url);
//       } catch (err) {
//         console.error(`Failed to upload ${fileName} to S3:`, err.message);
//       }
//       continue;
//     }

//     // Otherwise, add to the standard attachments array
//     attachments.push({
//       file: fs.createReadStream(filePath),
//       filename: fileName
//     });

//     filesSizeInMB += attachmentSizeInMb;

//     console.log(
//       `Added ${fileName} (${attachmentSizeInMb.toFixed(2)} MB). Total: ${filesSizeInMB.toFixed(2)} MB`
//     );
//   }

//   return { attachments, s3Links };
// }

async function pickAttachments(attachmentsData, folderPath, ticketId) {
  let currentTotalSizeMB = 0;
  const LIMIT_MB = 20;
  let attachments = [];
  let s3Links = [];

  for (const attachment of attachmentsData) {
    const originalName = attachment?.Name ?? `${attachment?.Title}.${attachment?.FileExtension}` ?? 'file.bin';
    const extension = path.extname(originalName);
    const sanitizedBase = path.basename(originalName, extension).replace(/[^a-z0-9]/gi, '_');

    const fileNameOnDisk = `${sanitizedBase}_${attachment?.Id ?? ''}${extension}`;
    const filePath = path.join(folderPath, fileNameOnDisk);

    // const fileName = attachment?.Name ?? `${attachment?.Title}.${attachment?.FileExtension}`;
    // const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File ${fileNameOnDisk} not found for ${originalName}`);
      continue;
    }

    const stats = fs.statSync(filePath);
    const sizeInMb = stats.size / (1024 * 1024);

    // const sizeInBytes = attachment?.BodyLength ?? attachment?.ContentSize;
    // const sizeInMb = sizeInBytes / (1024 * 1024);

    if (currentTotalSizeMB + sizeInMb > LIMIT_MB) {
      console.log(`⚠️ Limit reached. Uploading ${originalName} (${sizeInMb.toFixed(2)}MB) to S3.`);

      const s3Url = await uploadFileToS3(filePath, originalName, ticketId);
      s3Links.push({ name: originalName, url: s3Url });
    } else {
      // Still have space in the "box"
      attachments.push({
        file: fs.createReadStream(filePath),
        filename: originalName
      });

      currentTotalSizeMB += sizeInMb;
      console.log(`✅ Attached ${originalName}. Total payload: ${currentTotalSizeMB.toFixed(2)}MB`);
    }
  }
  console.log(`Returning the attachments for ${folderPath}`);
  return { attachments, s3Links };
}

async function getSalesforceAccessToken() {
  try {
    const url = `https://login.salesforce.com/services/oauth2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", process.env.SOURCE_CLIENT_ID);
    params.append("client_secret", process.env.SOURCE_CLIENT_SECRET);
    params.append("username", process.env.SOURCE_EMAIL);
    params.append("password", process.env.SOURCE_PASSWORD); // password + security token

    const response = await axios.post(url, params);

    const { access_token, instance_url } = response.data;

    console.log("✅ Salesforce Access Token generated successfully");
    return { accessToken: access_token, instanceUrl: instance_url };
  } catch (error) {
    console.error(
      "❌ Failed to generate Salesforce access token:",
      error.response?.data || error.message
    );
    return { accessToken: null, instanceUrl: null };
  }
}

async function fetchSalesforceData(url, accessToken, OVERALL_LOG, ERROR_LOG) {
  let retry = 0;
  const MAX_RETRIES = 5;

  while (retry < MAX_RETRIES) {
    try {
      // console.log(url, 'url');

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      writeLog(OVERALL_LOG, `✅ Data from ${url} fetched successfully`);
      console.log(`✅ Data from ${url} fetched successfully`);

      return response.data;
    } catch (error) {
      retry++;

      const status = error?.response?.status;

      // Handle Salesforce API limits
      if (status === 403 || status === 503 || status === 429) {
        // 429 not common in Salesforce, but keeping for safety
        const retryAfter =
          parseInt(error?.response?.headers?.["retry-after"], 10) ||
          Math.min(2 ** retry * 1000, 60000); // exponential backoff max 60s
        console.log(
          `⚠️ Salesforce Rate Limit / Server Busy. Retry #${retry}. Waiting ${retryAfter / 1000} seconds...`
        );
        await delay(retryAfter);
        continue;
      }

      // Other errors
      const errorMsg = error?.response?.data || error.message;
      let formattedErrorMsg;
      try {
        formattedErrorMsg = JSON.stringify(errorMsg, null, 2);
      } catch {
        formattedErrorMsg = errorMsg;
      }

      let errorMessage;
      if (error.stack) {
        const filteredStack = error.stack
          .split("\n")
          .filter((line) => line.includes(PROJECT_PATH))
          .map((line) => line.trim())
          .join("\n");

        errorMessage = `❌ ERROR fetching data from Salesforce [${url}] (Retry #${retry}) \nPayload: ${formattedErrorMsg}\n@ ${filteredStack}`;
      } else {
        errorMessage = `❌ ERROR fetching data from Salesforce [${url}] (Retry #${retry}) \nPayload: ${formattedErrorMsg}`;
      }

      console.error(errorMessage);
      writeLog(ERROR_LOG, errorMessage);

      if (retry >= MAX_RETRIES) {
        console.error(`❌ Max retries reached for ${url}. Returning null.`);
        return null;
      }
    }
  }
}

async function getFreshdeskData(endpoint, params = {}) {
  const DOMAIN = process.env.DESTINATION_DOMAIN;
  const API_KEY = process.env.DESTINATION_API_KEY;

  const authHeader = Buffer.from(`${API_KEY}:X`).toString('base64');

  try {
    const response = await axios.get(`https://${DOMAIN}/api/v2/${endpoint}`, {
      params: params,
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Freshdesk API Error [${endpoint}]:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  handleRateLimit,
  ensureDirectoryExistence,
  delay,
  formatCurrency,
  formatTextArea,
  writeLog,
  convertStringToHoursMinutes,
  generateTableHTML,
  convertToHTML,
  convertADFtoHTML,
  deleteAllFiles,
  validTimeZones,
  writeIDLog,
  generateHtml,
  pickAttachments,
  getSalesforceAccessToken,
  fetchSalesforceData,
  getFreshdeskData,
  readDecryptedData
};
