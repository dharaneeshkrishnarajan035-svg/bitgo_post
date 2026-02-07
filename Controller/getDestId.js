require("dotenv").config();
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const fs = require('fs');
const path = require('path');


const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

async function fetchDestinationId(tableName,sourceId) {
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
      return existingItem.destinationId || null;
    }

    return null;
  } catch (error) {
    console.log('FETCHING ERROR', error);
    return null;
  }
};


const destIds = [];

const fetchDestIds = async (tableName) => {
  const tickets = JSON.parse(fs.readFileSync(process.env.DESTIDS_INPUT_FILE));
  await Promise.all(tickets.map(async ticket => {
    const destId = await fetchDestinationId(tableName,ticket);
    console.log("SOurce ID : ", ticket, "Dest ID : ", destId);
    destIds.push(destId)
  }))


  console.log("JSON ", JSON.stringify(destIds.filter(Boolean)));
  console.log("Input Length ", tickets.length);
  console.log("Output Length ", destIds.length);
  fs.writeFileSync(process.env.DESTIDS_OUTPUT_FILE, JSON.stringify(destIds, null, 2));
};

module.exports = {fetchDestIds}
