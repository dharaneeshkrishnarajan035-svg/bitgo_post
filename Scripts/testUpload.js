const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const envArg = process.argv.find(arg => arg.startsWith('--env='));
const envName = envArg ? envArg.split('=')[1] : 'server1';
const envFile = `.env.${envName}`;
console.log(envFile);

const myEnv = dotenv.config({ path: envFile });
dotenvExpand.expand(myEnv);

const AWS = require('aws-sdk');
const mime = require('mime-types');
const fs = require("fs");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function uploadFileToS3(filePath, fileName, ticketId, commentId) {
  const fileContent = await fs.promises.readFile(filePath);
  const contentType = mime.lookup(fileName) || 'application/octet-stream';

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, //'rck-techies-bg-migration',
    Key: `tickets/${ticketId}/${commentId}/${fileName}`,
    Body: fileContent,
    ContentType: contentType
  };

  const data = await s3.upload(params).promise();
  console.log({ data });

  return data.Location;
}

uploadFileToS3(
  "/Users/dharaneeshkirshnarajan/Documents/Workspace/BITGO_POST/Screenshot 2026-01-28 at 5.21.42 PM.png",
  "test.png",
  "0",
  "0"
);
