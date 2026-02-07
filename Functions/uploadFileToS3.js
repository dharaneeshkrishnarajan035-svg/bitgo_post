require("dotenv").config();
const AWS = require('aws-sdk');
const mime = require('mime-types');
const fs = require("fs");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(filePath, fileName, ticketId, commentId) {
  const fileContent = await fs.promises.readFile(filePath);
  const contentType = mime.lookup(fileName) || 'application/octet-stream';

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, //'rck-techies-bg-migration',
    Key: `tickets/${ticketId}/${fileName}`,
    Body: fileContent,
    ContentType: contentType
  };

  const data = await s3.upload(params).promise();
  return data.Location;
}

const uploadRecordingToS3 = async (
  bucketName,
  folderName,
  fileName,
  fileContent,
  contentType,
) => {
  try {
    const fileKey = `book_support/tickets/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    console.log(`✅ File uploaded. S3 URL: ${s3Url}`);

    return s3Url;
  } catch (error) {
    const errorData = error && error ? error.message : error;
    const finalErrorString = typeof error === 'object' ? JSON.stringify(error) : error;

    let message = `❌ Error In uploading file to S3 file ${fileName} not uploaded to ${folderName} : ${finalErrorString}`;

    // writeLog(overallLog, message);
    // writeLog(errorLog, message);
    console.error(message)
  }
};

module.exports = { uploadFileToS3, uploadRecordingToS3 };
