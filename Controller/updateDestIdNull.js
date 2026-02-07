const {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  PutItemCommand
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
require("dotenv").config();
const fs = require('fs');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const updateDestinationId = async (
  tableName,
  sourceId,
  destinationId,
  isMigrated,
  module,
) => {
  try {

    const getParams = {
      TableName: tableName,
      KeyConditionExpression: "sourceId = :sourceId",
      ExpressionAttributeValues: marshall(
        { ":sourceId": sourceId },
        { removeUndefinedValues: true }
      ),
    };

    const queryCommand = new QueryCommand(getParams);
    const result = await client.send(queryCommand);

    if (result.Items.length > 0) {
      const existingItem = unmarshall(result.Items[0]);
      const createdAt = existingItem.createdAt;
      const existingDestinationId = existingItem.destinationId || null;
      if (existingDestinationId) {
        console.log(
          `🔹 ${module} already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId} But Updating it.`
        );
      }

      const updateParams = {
        TableName: tableName,
        Key: marshall({
          sourceId: sourceId
        }, { removeUndefinedValues: true }),
        UpdateExpression: `
            SET destinationId = :destinationId,
                isMigrated = :isMigrated,
                updatedAt = :updatedAt
          `,
        ExpressionAttributeValues: marshall(
          {
            ":destinationId": destinationId,
            ":isMigrated": isMigrated,
            ":updatedAt": new Date().toISOString(),
          },
          { removeUndefinedValues: true }
        ),
        ReturnValues: "UPDATED_NEW",
      };

      const updateCommand = new UpdateItemCommand(updateParams);
      await client.send(updateCommand);

      console.log(
        `✅ ${module} DestinationID updated successfully: ${sourceId}`
      );

      return `${module} DestinationID updated successfully.`;
    } else {
      console.log(`⚠️ No ${module} found with sourceId: ${sourceId}`);
      return `No matching ${module} found.`;
    }
  } catch (error) {
    console.error(`❌ Error updating ${module} DestinationID:`, error.message);
    return `❌ Error updating ${module} DestinationID sourceId: ${sourceId} : ${error.message}`;
  }
};

const resetDestinationId = async (tableName, module) => {
  const ids = ["500Ro00000pcHDpIAM"] //["02sRo00000nKDcnIAG", "02sRo00000nJTF6IAO"] //JSON.parse(fs.readFileSync(process.env.NULLIDS_FILE));
  const CONCURRENCY = 25;
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    console.log(batch, batch.length);

    await Promise.all(batch.map(id =>
      updateDestinationId(
        tableName,
        id,
        null,
        false,
        module
      ))
    );
  }
}

module.exports = { resetDestinationId }
