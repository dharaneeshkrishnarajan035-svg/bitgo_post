const { insertIntoDynamo } = require("../Functions/dynamoFunctions");

const moduleIdMapping = {
  1: "Company",
  2: "Group",
  3: "Agent",
  4: "Requester",
  5: "TicketField",
  6: "Ticket",
};

const createCount = async (clientCode) => {

  const neededModules = [1, 2, 3, 4, 6];

  for (const module of neededModules) {
    const newItem = {
      clientCode: clientCode.to,
      moduleId: module,
      createdAt: new Date().toISOString(),
      destinationCount: 0,
      insertionFailure: 0,
      insertionSuccess: 0,
      migrationFailure: 0,
      migrationSuccess: 0,
      moduleName: moduleIdMapping[module],
      sourceCount: 0,
      updatedAt: new Date().toISOString(),
    };

    await insertIntoDynamo(process.env.COUNT_TABLE, newItem,'Count');
  }
};


module.exports = {createCount}