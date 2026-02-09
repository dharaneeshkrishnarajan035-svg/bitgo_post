require("dotenv").config();
const { DynamoDBClient, ScanCommand, } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { writeFileSync } = require("fs");
const { decryptJSON } = require("../Functions/encDec");
const { fetchParticularRow } = require("../Functions/dynamoFunctions");

const client = new DynamoDBClient({ region: "us-west-2" });

const fetchAllItems = async (tableName) => {
  let items = [];
  let ExclusiveStartKey = undefined;

  do {
    const command = new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey,
    });

    const response = await client.send(command);

    const unmarshalledItems = response.Items.map(rawItem => {
      const item = unmarshall(rawItem);

      if (item.sourceData) {
        try {
          const decrypted = decryptJSON(item.sourceData);
          item.sourceData = decrypted;
        } catch (error) {
          console.error(`❌ Failed to decrypt sourceData for item with PK ${item.sourceId}: ${error?.message}`);
        }
      }

      return item;
    });
    items = items.concat(unmarshalledItems);

    console.log('FETCHED COUNT', items.length);
    ExclusiveStartKey = response.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
};

const scanDynamo = async (tableName) => {
  const fileName = `${process.env.CONFIG_FOLDER}/${tableName}_ids.json`
  try {
    const data = await fetchAllItems(tableName);
    // const data = await fetchParticularRow("bitgoGroup", "sourceId", "00GJw000001NCuLMAW");

    const filtered = data
      .filter(item => item.destinationId === null || item.destinationId === undefined)
      .map(item => item.sourceId);
    //     .reduce((acc, item) => {
    //   acc[item.sourceId] = item?.sourceData?.Name;
    //   return acc;
    // }, {});

    writeFileSync(fileName, JSON.stringify(filtered, null, 2));
    console.log(`${fileName} created with entries:`, filtered.length);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

const idMappingGeneration = async (tableName) => {
  console.log("Started");
  const fileName = `${process.env.CONFIG_FOLDER}/${tableName}_id_mapping.json`
  try {
    const data = await fetchAllItems(tableName);

    const filtered = data
      .filter(item => item.destinationId !== null && item.destinationId !== undefined)
      .reduce((acc, item) => {
        acc[item.sourceId] = item?.destinationId;
        return acc;
      }, {});

    writeFileSync(fileName, JSON.stringify(filtered, null, 2));
    console.log(`${fileName} created with entries:`, filtered.length);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

const fieldValues = async (tableName) => {

  console.log("Started");
  const fileName = `${process.env.CONFIG_FOLDER}/${tableName}_uniqueValues.json`
  try {
    const data = await fetchAllItems(tableName);

    const fields = [
      "Priority",
      "Support_Technician__c",
      "Customer_Severity__c",
      "Close_Reason__c",
      "Reason",
      "Origin",
      "Status"
    ];


    const uniqueValues = {};

    for (const field of fields) {
      uniqueValues[field] = [...new Set(data.map(item => item?.sourceData[field]).filter(v => v != null && v !== ""))];
    }

    console.log(uniqueValues);

    writeFileSync(fileName, JSON.stringify(uniqueValues, null, 2));
    console.log(`${fileName} created with entries:`, uniqueValues.length);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

module.exports = { scanDynamo, idMappingGeneration, fieldValues };
