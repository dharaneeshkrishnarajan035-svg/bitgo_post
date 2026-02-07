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
const { writeLog } = require('./commonFunctions');
const { encryptJSON, decryptJSON } = require("./encDec");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const updateDestinationId = async (
  tableName,
  sourceId,
  destinationId,
  isMigrated,
  module,
  OVERALL_LOG,
  ERROR_LOG
) => {
  try {
    // Detect type of sourceId
    const keyValue =
      typeof sourceId === "number"
        ? { N: `${sourceId}` }
        : { S: `${sourceId}` };

    const getParams = {
      TableName: tableName,
      Key: {
        sourceId: keyValue,
      },
    };

    const queryCommand = new GetItemCommand(getParams);
    const result = await client.send(queryCommand);

    if (result.Item) {
      const existingItem = unmarshall(result.Item);
      const createdAt = existingItem.createdAt; // Preserve existing createdAt
      const existingDestinationId = existingItem.destinationId || null;

      if (existingDestinationId) {
        console.log(
          `🔹 ${module} already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId} But Updating it.`
        );

        writeLog(
          OVERALL_LOG,
          `🔹 Ticket already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId} But Updating with new`
        );
      }

      const updateParams = {
        TableName: tableName,
        Key: marshall(
          {
            sourceId: sourceId, // marshall auto detects number vs string
          },
          { removeUndefinedValues: true }
        ),
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

      writeLog(
        OVERALL_LOG,
        `✅ Ticket migrated DestinationID: ${destinationId}, SourceID: ${sourceId} updated successfully`
      );

      return `${module} DestinationID updated successfully.`;
    } else {
      console.log(`⚠️ No ${module} found with sourceId: ${sourceId}`);

      await writeLog(
        OVERALL_LOG,
        `⚠️ No ${module} found with sourceId: ${sourceId}`
      );
      await writeLog(
        ERROR_LOG,
        `⚠️ No ${module} found with sourceId: ${sourceId}`
      );

      return `No matching ${module} found.`;
    }
  } catch (error) {
    console.error(`❌ Error updating ${module} DestinationID:`, error.message);
    await writeLog(
      OVERALL_LOG,
      `❌ Error updating ${module} DestinationID sourceId: ${sourceId} : ${error.message}`
    );
    await writeLog(
      ERROR_LOG,
      `❌ Error updating ${module} DestinationID sourceId: ${sourceId} : ${error.message}`
    );

    return `❌ Error updating ${module} DestinationID sourceId: ${sourceId} : ${error.message}`;
  }
};

// async function fetchDestinationId(tableName, sourceId, OVERALL_LOG, ERROR_LOG) {
//   try {
//     const getParams = {
//       TableName: tableName,
//       Key: {
//         "sourceId": { N: `${sourceId}` }
//       }
//     };

//     const queryCommand = new GetItemCommand(getParams);
//     const result = await client.send(queryCommand);

//     if (result.Item) {
//       const existingItem = unmarshall(result.Item);
//       return existingItem.destinationId || null;
//     }

//     return null;
//   } catch (error) {
//     writeLog(ERROR_LOG, `❌ Error checking destinationId for sourceId ${sourceId}: ${error.message}`);
//     writeLog(OVERALL_LOG, `❌ Error checking destinationId for sourceId ${sourceId}: ${error.message}`);
//     return null;
//   }
// }

async function fetchDestinationId(tableName, sourceId, OVERALL_LOG, ERROR_LOG) {
  try {
    const isNumber = typeof sourceId === "number" || (!isNaN(sourceId) && sourceId !== null && sourceId !== "");

    const getParams = {
      TableName: tableName,
      Key: {
        "sourceId": isNumber ? { N: `${sourceId}` } : { S: `${sourceId}` }
      }
    };

    const queryCommand = new GetItemCommand(getParams);
    const result = await client.send(queryCommand);

    if (result.Item) {
      const existingItem = unmarshall(result.Item);
      return existingItem.destinationId || null;
    }

    return null;
  } catch (error) {
    writeLog(ERROR_LOG, `❌ Error checking destinationId for sourceId ${sourceId}: ${error.message}`);
    writeLog(OVERALL_LOG, `❌ Error checking destinationId for sourceId ${sourceId}: ${error.message}`);
    return null;
  }
}

async function fetchDynamoData(tableName, sourceId) {
  let tickets = [];
  let retryCount = 0;
  const MAX_RETRIES = 5;
  while (retryCount < MAX_RETRIES) {
    try {
      let lastEvaluatedKey = null;

      do {
        const ticketParams = {
          TableName: tableName,
          KeyConditionExpression: "#sourceId = :sourceId",
          ExpressionAttributeNames: {
            "#sourceId": "sourceId",
          },
          ExpressionAttributeValues: {
            ":sourceId": { S: sourceId },
          },
          ExclusiveStartKey: lastEvaluatedKey, // Handle pagination
        };

        const ticketCommand = new QueryCommand(ticketParams);
        const ticketResponse = await client.send(ticketCommand);

        if (ticketResponse.Items) {
          tickets.push(...ticketResponse.Items.map((item) => unmarshall(item)));
        }

        lastEvaluatedKey = ticketResponse.LastEvaluatedKey; // Continue if more pages
      } while (lastEvaluatedKey);

      return tickets.length > 0 ? tickets[0] : null;
    } catch (error) {
      if (
        error.name === "ProvisionedThroughputExceededException" ||
        error.name === "ThrottlingException"
      ) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(
          `⚠️ Retrying... (${retryCount}/${MAX_RETRIES}) in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay)); // Proper async delay
      } else {
        console.error("❌ Error fetching ticket data:", error);
        await writeLog(ERROR_LOG, `❌ Error fetching ticket data Source ID : ${sourceId}: ${error}`);
        await writeLog(OVERALL_LOG, `❌ Error fetching ticket data Source ID : ${sourceId}: ${error}`);
        retryCount++;
      }
    }
  }
  await writeLog(ERROR_LOG, `❌Error Failed to fetch ticket data after ${MAX_RETRIES} retries Source ID : ${sourceId}`);
  await writeLog(OVERALL_LOG, `❌Error Failed to fetch ticket data after ${MAX_RETRIES} retries Source ID : ${sourceId}`);
  console.error(`❌ Error Failed to fetch ticket data after ${MAX_RETRIES} retries.`);
}

async function fetchParticularRow(
  tableName,
  partitionKey,
  partitionValue,
  sortKey = null,
  sortValue = null,
  OVERALL_LOG,
  ERROR_LOG,
) {

  let retryCount = 0;
  const MAX_RETRIES = 5;
  let params = {};

  while (retryCount < MAX_RETRIES) {
    try {
      const keyObj = {
        [partitionKey]: typeof partitionValue === "number"
          ? { N: partitionValue.toString() }
          : { S: partitionValue.toString() },
      };

      if (sortKey && sortValue !== null) {
        keyObj[sortKey] = typeof sortValue === "number"
          ? { N: sortValue.toString() }
          : { S: sortValue.toString() };
      }

      params = {
        TableName: tableName,
        Key: keyObj
      };

      const command = new GetItemCommand(params);
      // console.log("command:", command);
      const response = await client.send(command);
      // console.log("response:", response);

      if (!response.Item) return null;

      const item = unmarshall(response.Item);

      if (item.sourceData) {
        try {
          const decrypted = decryptJSON(
            item.sourceData
          );

          item.sourceData = JSON.parse(decrypted);
        } catch (e) {
          const errorMessage = `❌ Failed to decrypt sourceData: ${e.message}`;
          console.error("errorMessage:", errorMessage);
          writeLog(ERROR_LOG, errorMessage);
        }
      }
      return item;

    } catch (error) {

      retryCount++;
      if (
        error.name === "ProvisionedThroughputExceededException" ||
        error.name === "ThrottlingException"
      ) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`⚠️ Retrying... (${retryCount}/${MAX_RETRIES}) in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        const errorMsg = error?.response?.data || error.message;

        let formattedErrorMsg;
        try {
          formattedErrorMsg = JSON.stringify(errorMsg, null, 2);
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

          errorMessage = `❌ ERROR fetching data at ${tableName} at fetchParticularRow block () & Payload :${JSON.stringify(params)} = \n${formattedErrorMsg}\n@ ${filteredStack}`;
        } else {
          errorMessage = `❌ ERROR fetching data at ${tableName} at fetchParticularRow block () & Payload :${JSON.stringify(params)} =  ${formattedErrorMsg}`;
        }

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        retryCount++;
        break;
      }
    }
  }

  writeLog(
    OVERALL_LOG,
    `❌ ERROR fetching ${tableName} at fetchParticularRow block () & Payload :${JSON.stringify(params)} : after Max Retries`
  );
  writeLog(
    ERROR_LOG,
    `❌ ERROR fetching ${tableName} at fetchParticularRow block () & Payload :${JSON.stringify(params)} : after Max Retries`
  );
  console.error(`❌ ERROR fetching ${tableName} at fetchParticularRow block () & Payload :${JSON.stringify(params)} : after Max Retries`);
  return null;
}

/*
async function fetchParticularRow(
  tableName,
  partitionKey,
  partitionValue,
  sortKey = null,
  sortValue = null,
  OVERALL_LOG,
  ERROR_LOG
) {
  let tickets = [];
  let retryCount = 0;
  const MAX_RETRIES = 5;

  while (retryCount < MAX_RETRIES) {
    try {
      let lastEvaluatedKey = null;

      do {
        const expressionNames = {
          "#pk": partitionKey,
        };
        let expressionValues

        if (typeof partitionValue === 'number') {
          expressionValues = {
            ":pk": { N: partitionValue.toString() },
          };
        } else {
          expressionValues = {
            ":pk": { S: partitionValue.toString() },
          };
        }

        let keyCondition = "#pk = :pk";

        if (sortKey && sortValue) {
          expressionNames["#sk"] = sortKey;
          expressionValues[":sk"] = { N: sortValue.toString() };
          keyCondition += " AND #sk = :sk";
        }

        const ticketParams = {
          TableName: tableName,
          KeyConditionExpression: keyCondition,
          ExpressionAttributeNames: expressionNames,
          ExpressionAttributeValues: expressionValues,
          ExclusiveStartKey: lastEvaluatedKey,
        };


        const ticketCommand = new QueryCommand(ticketParams);
        const ticketResponse = await client.send(ticketCommand);

        if (ticketResponse.Items) {
          if (typeof partitionValue === 'number') {
            tickets.push(...ticketResponse.Items);
          } else {
            tickets.push(...ticketResponse.Items.map((item) => unmarshall(item)))
          }

        }

        lastEvaluatedKey = ticketResponse.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      return tickets.length > 0 ? tickets[0] : null;
    } catch (error) {
      if (
        error.name === "ProvisionedThroughputExceededException" ||
        error.name === "ThrottlingException"
      ) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(
          `⚠️ Retrying... (${retryCount}/${MAX_RETRIES}) in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("❌ Error fetching ticket data:", error);
        await writeLog(
          OVERALL_LOG,
          `❌ Error fetching data for ${partitionKey}: ${partitionValue}: ${error}`
        );
        await writeLog(
          ERROR_LOG,
          `❌ Error fetching data for ${partitionKey}: ${partitionValue}: ${error}`
        );
        retryCount++;
        break
      }
    }
  }

  writeLog(
    OVERALL_LOG,
    `❌ Failed to fetch data after ${MAX_RETRIES} retries for ${partitionKey}: ${partitionValue}`
  );
  writeLog(
    ERROR_LOG,
    `❌ Failed to fetch data after ${MAX_RETRIES} retries for ${partitionKey}: ${partitionValue}`
  );
  console.error(`❌ Final failure after ${MAX_RETRIES} retries.`);
  return null;
}
*/

async function fetchAllRows(tableName, module, OVERALL_LOG, ERROR_LOG) {
  let allData = [];
  let lastEvaluatedKey = null;

  try {

    writeLog(
      OVERALL_LOG,
      `Fetching ${module} data From DynamoDb `
    );

    do {
      const params = {
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const command = new ScanCommand(params);
      const result = await client.send(command);
      allData = allData.concat(result.Items.map(rawItem => {
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
      }));

      lastEvaluatedKey = result.LastEvaluatedKey;
      // lastEvaluatedKey = null;

      console.log(`🔹Fetched ${allData.length} module till now...`)
    } while (lastEvaluatedKey);

    return allData;

  } catch (error) {
    console.error(`Error Occured at fetchAllRows during  ${module} fetching`, error);
    writeLog(ERROR_LOG, `❌Error Occured at fetchAllRows during  ${module} fetching : ${error}`);
    writeLog(OVERALL_LOG, `❌Error Occured at fetchAllRows during  ${module} fetching : ${error}`);

  }
}

const insertUpdateData = async (tableName, sourceId, data, destinationId, module, OVERALL_LOG, ERROR_LOG) => {
  try {
    // console.log(tableName, sourceId, data, destinationId, module, OVERALL_LOG, ERROR_LOG)

    const getParams = {
      TableName: tableName,
      KeyConditionExpression: "sourceId = :sourceId",
      ExpressionAttributeValues: marshall(
        { ":sourceId": sourceId },
        { removeUndefinedValues: true }
      ),
    };

    // console.log("GET PA", getParams)

    const queryCommand = new QueryCommand(getParams);
    const result = await client.send(queryCommand);

    if (result.Items.length > 0) {
      const existingItem = unmarshall(result.Items[0]);
      const createdAt = existingItem.createdAt; // Preserve existing createdAt
      const existingDestinationId = existingItem.destinationId || null;
      // console.log("Exixsting Account ", existingDestinationId)
      if (existingDestinationId) {
        console.log(`🔹 ${module} already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId}`);
        await writeLog(OVERALL_LOG, `🔹 ${module} already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId}`);
        // await writeLog("success.log", `🔹 Ticket already migrated. DestinationID: ${existingDestinationId}, SourceID: ${sourceId}`);
        return `${module} already migrated. DestinationID: ${existingDestinationId}`;
      }

      let updateParams;

      // **Step 2: Update only if destinationId is null**
      // if (module === 'Notes') {
      //   updateParams = {
      //     TableName: tableName,
      //     Key: marshall(
      //       { sourceId },
      //       { removeUndefinedValues: true }
      //     ),
      //     UpdateExpression: `
      //     SET destinationId = :destinationId,
      //         isMigrated = :isMigrated,
      //         updatedAt = :updatedAt
      //   `,
      //     ExpressionAttributeValues: marshall(
      //       {
      //         ":destinationId": destinationId,
      //         ":isMigrated": true,
      //         ":updatedAt": new Date().toISOString(),
      //       },
      //       { removeUndefinedValues: true }
      //     ),
      //     ReturnValues: "UPDATED_NEW",
      //   };
      // }
      // else {
      updateParams = {
        TableName: tableName,
        Key: marshall(
          { sourceId, createdAt },
          { removeUndefinedValues: true }
        ),
        UpdateExpression: `
          SET destinationId = :destinationId,
              isMigrated = :isMigrated,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: marshall(
          {
            ":destinationId": destinationId,
            ":isMigrated": destinationId ? true : false,
            ":updatedAt": new Date().toISOString(),
          },
          { removeUndefinedValues: true }
        ),
        ReturnValues: "UPDATED_NEW",
      };
      // }


      // console.log("UPAP ", updateParams)

      // **Step 3: Execute the update operation**
      const updateCommand = new UpdateItemCommand(updateParams);
      await client.send(updateCommand);

      console.log(`✅ ${module} DestinationID updated successfully: ${sourceId}`);
      writeLog(OVERALL_LOG, `✅ ${module} DestinationID updated successfully: ${sourceId}`);
      return `✅ ${module} ${sourceId}  DestinationID ${destinationId} updated successfully`;
    } else {

      // **Step 4: Insert new module if not found**
      console.log(`⚠️ No ${module} found with sourceId: ${sourceId}. Inserting new ${module}...`);
      await writeLog(OVERALL_LOG, `⚠️ No ${module} found with sourceId: ${sourceId}. Inserting new ${module}...`);

      let newItem = {};

      if (module === "Notes") {
        newItem = {
          sourceId: sourceId,
          destinationId: destinationId,
          isMigrated: false,
          createdAt: data.created_at,
          updatedAt: data.created_at
        };
      }
      else {
        const createdAt = new Date().toISOString();
        newItem = {
          sourceId: sourceId,
          destinationId: destinationId,
          isMigrated: false,
          createdAt: createdAt,
          updatedAt: createdAt,
          sourceData: data
        };
      }

      const putParams = {
        TableName: tableName,
        Item: marshall(newItem, { removeUndefinedValues: true }),
      };

      const putCommand = new PutItemCommand(putParams);
      await client.send(putCommand);

      console.log(`✅ New ${module} inserted successfully with sourceId: ${sourceId}`);
      await writeLog(OVERALL_LOG, `✅ New ${module} inserted successfully with sourceId: ${sourceId}`);

      return `✅ New ${module} inserted successfully with sourceId: ${sourceId}`;
    }
  } catch (error) {
    console.error(`❌ Error updating/inserting ${module}:`, error.message);
    writeLog(ERROR_LOG, `❌ Error updating/inserting ${module} sourceId: ${sourceId}: ${error.message}`);
    writeLog(OVERALL_LOG, `❌ Error updating/inserting ${module} sourceId: ${sourceId}: ${error.message}`);

    return `❌ Error updating/inserting ${module} sourceId: ${sourceId}: ${error.message}`;
  }
};

const updateRowInDynamoDB = async (
  tableName,
  partitionKey,
  partitionValue,
  sortKey,
  sortValue,
  fieldsToUpdate
) => {
  try {
    const keyObject = {
      [partitionKey]: partitionValue,
      [sortKey]: sortValue,
    };

    const updateParams = {
      TableName: tableName,
      Key: marshall(keyObject),
      UpdateExpression: "",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ConditionExpression: `attribute_exists(#pk) AND attribute_exists(#sk)`,
      ReturnValues: "UPDATED_NEW",
    };

    // Attribute names for condition expression
    updateParams.ExpressionAttributeNames["#pk"] = partitionKey;
    updateParams.ExpressionAttributeNames["#sk"] = sortKey;

    // Build SET expression
    const updateClauses = [];
    let index = 0;
    for (const field in fieldsToUpdate) {
      const fieldKey = `#f${index}`;
      const valueKey = `:v${index}`;
      updateParams.ExpressionAttributeNames[fieldKey] = field;
      updateParams.ExpressionAttributeValues[valueKey] = marshall({
        value: fieldsToUpdate[field],
      }).value;
      updateClauses.push(`${fieldKey} = ${valueKey}`);
      index++;
    }

    updateParams.UpdateExpression = `SET ${updateClauses.join(", ")}`;

    const updateCommand = new UpdateItemCommand(updateParams);
    await client.send(updateCommand);

    // console.log("Count Record Updated Successfully")
    return {
      success: true,
      message: "Record Updated Successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Record Update Failed: ${error.message}`,
      error,
    };
  }
};

async function updateCount(updationType, moduleValue, incrementCount, OVERALL_LOG, ERROR_LOG,) {
  try {
    const clientCode = process.env.CLIENTCODE;
    const countTable = process.env.COUNT_TABLE;

    const countData = await fetchParticularRow(countTable, partitionKey = 'clientCode', partitionValue = clientCode, sortKey = 'moduleId', sortValue = moduleValue, OVERALL_LOG, ERROR_LOG)

    let fieldsToUpdate = {};

    if (updationType === 'success') {
      fieldsToUpdate = {
        destinationCount: (countData.destinationCount + incrementCount),
        migrationSuccess: (countData.migrationSuccess + incrementCount)
      }

    }
    else if (updationType === 'failure') {
      fieldsToUpdate = {
        migrationFailure: (countData.migrationFailure + incrementCount)
      }
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await updateRowInDynamoDB(countTable,
        partitionKey = 'clientCode',
        partitionValue = clientCode,
        sortKey = 'moduleId',
        sortValue = moduleValue,
        fieldsToUpdate)
    }
  }
  catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at Update Count : ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error)


    console.error(errorMessage);

    writeLog(OVERALL_LOG, errorMessage)

    writeLog(ERROR_LOG, errorMessage)
  }
}

const insertIntoDynamo = async (tableName, newItem, module) => {
  try {
    const params = {
      TableName: tableName,
      Item: marshall(newItem, { removeUndefinedValues: true })
    };
    // console.log(params)
    const command = new PutItemCommand(params);
    const response = await client.send(command);
    console.log("Item added successfully:", response.$metadata?.httpStatusCode);
    //  writeLog(overallLog, `Item added successfully: ${response.$metadata?.httpStatusCode}`);
  } catch (error) {
    const errorMsg = error?.response?.data || error.message;

    let formattedErrorMsg;
    try {
      formattedErrorMsg = JSON.stringify(errorMsg, null, 2);
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

      errorMessage = `❌ ERROR inserting ${module} at insertIntoDynamo block () & Payload :${JSON.stringify(newItem)} = \n${formattedErrorMsg}\n@ ${filteredStack}`;
    } else {
      errorMessage = `❌ ERROR inserting ${module} at insertIntoDynamo block () & Payload :${JSON.stringify(newItem)} = ${formattedErrorMsg}`;
    }

    console.error(errorMessage);
    // writeLog(overallLog, errorMessage);
    // writeLog(errorLog, errorMessage);
  }
};

async function insertIntoDynamoDB(tableName, data, module, OVERALL_LOG, ERROR_LOG) {
  const currentDate = new Date().toISOString();

  // Parameters for GetItem to check for an existing record
  const checkParams = {
    TableName: tableName,
    Key: {
      sourceId: { S: data.Id.toString() } // Convert to string for DynamoDB number type
    }
  };

  // let message = `Dynamo DB Insertion for ${module} Id :${data.id} Func Started`;
  // writeLog(OVERALL_LOG, message);

  try {
    // Perform the GetItem to find an existing record
    const getCommand = new GetItemCommand(checkParams);
    const existingRecord = await client.send(getCommand);

    const encrypted = encryptJSON(data);

    if (existingRecord.Item) {
      // If a record exists, update it
      const updateParams = {
        TableName: tableName,
        Key: {
          sourceId: { S: data.Id.toString() }
        },
        UpdateExpression: "SET sourceData = :sourceData, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":sourceData": { M: marshall(encrypted, { removeUndefinedValues: true }) }, // Convert data to DynamoDB map
          ":updatedAt": { S: currentDate }
        }
      };

      const updateCommand = new UpdateItemCommand(updateParams);
      await client.send(updateCommand);

      let message = `The ${module} Id:${data.Id} get Updated In DynamoDB Table`;
      writeLog(OVERALL_LOG, message);
      console.log(message);

      return "Updation";
    } else {
      const insertParams = {
        TableName: tableName,
        Item: {
          sourceData: { M: marshall(encrypted, { removeUndefinedValues: true }) },
          isMigrated: { BOOL: false },
          sourceId: { S: data.Id.toString() },
          destinationId: { NULL: true },
          createdAt: { S: currentDate },
          updatedAt: { S: currentDate }
        }
      };

      const putCommand = new PutItemCommand(insertParams);
      await client.send(putCommand);

      let message = `The ${module} Id:${data.Id} get Inserted In DynamoDB Table`;
      writeLog(OVERALL_LOG, message);
      console.log(message);

      return "Insertion";
    }
  } catch (error) {
    let formattedErrorMsg;
    try {
      formattedErrorMsg = JSON.stringify(error);
    } catch (jsonErr) {
      formattedErrorMsg = error.message;
    }

    let errorMessage;
    if (error.stack && typeof PROJECT_DIRECTORY === "string") {
      const filteredStack = error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n");
      errorMessage = `❌ ERROR inserting or updating Data at insertIntoDynamoDB block () & Payload :${JSON.stringify(data)} = ${formattedErrorMsg}@ ${filteredStack}`;
    } else {
      errorMessage = `❌ ERROR inserting or updating Data at insertIntoDynamoDB block () & Payload :${JSON.stringify(data)} = ${formattedErrorMsg}`;
    }

    console.error(errorMessage);
    writeLog(ERROR_LOG, errorMessage);
    throw error; // Re-throw to allow caller to handle
  }
}

module.exports = {
  updateDestinationId,
  fetchDestinationId,
  fetchDynamoData,
  fetchAllRows,
  insertUpdateData,
  updateCount,
  fetchParticularRow,
  insertIntoDynamo,
  insertIntoDynamoDB
};
