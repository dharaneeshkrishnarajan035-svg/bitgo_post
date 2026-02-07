const {
  fetchAllRows,
  updateDestinationId,
  updateCount,
} = require("../Functions/dynamoFunctions");
const { formatGroupPayload } = require("../Utils/Groups/formatGroup");
const { createGroupInFreshdesk } = require("../Utils/Groups/createGroup");
const { writeLog, writeIDLog } = require('../Functions/commonFunctions')

const GROUP_TABLE = process.env.AWS_SOURCE_GROUPS_TABLE;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;

const OVERALL_LOG = process.env.GROUP_OVERALL_LOG;
const ERROR_LOG = process.env.GROUP_ERROR_LOG;
const NOT_CREATED_LOG = process.env.GROUP_NOT_CREATED_LOG;
const moduleId = 2



const groupMigration = async () => {
  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')


    console.log("Group Migration Started...");
    writeLog(OVERALL_LOG, `Group Migration Started...`);
    writeLog(ERROR_LOG, `Group Migration Started...`);

    let groupsData = await fetchAllRows(GROUP_TABLE, "Group", OVERALL_LOG, ERROR_LOG);
    // groupsData = groupsData.slice(0, 3);

    const totalGroups = groupsData.length;

    if (totalGroups === 0) {
      console.error("No groups data found for migration.");
      writeLog(OVERALL_LOG, `No groups data found for migration!!`);
      writeLog(ERROR_LOG, `No groups data found for migration!!`);
      return;
    }

    console.log("Total Groups Fetched : ", totalGroups);
    writeLog(OVERALL_LOG, `Total Groups to Migrate : ${groupsData.length}`);
    writeLog(ERROR_LOG, `Total Groups to Migrate : ${groupsData.length}`);

    const migrateOne = async (group) => {
      let result = { success: 0, failure: 0 };
      // group.sourceData = JSON.parse(group.sourceData);

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      // const group = unmarshall(grp);
      writeLog(OVERALL_LOG, `Processing Group SourceID : ${group.sourceData.id} Name: ${group.sourceData.name}`);
      writeLog(ERROR_LOG, `Processing Group SourceID : ${group.sourceData.id} Name: ${group.sourceData.name}`);

      const formattedGroup = formatGroupPayload(group.sourceData);
      writeLog(OVERALL_LOG, `Formatted Group Payload : ${JSON.stringify(formattedGroup)}`);
      console.log({ formattedGroup });

      try {
        const companyId = await createGroupInFreshdesk(formattedGroup, OVERALL_LOG, ERROR_LOG);
        console.log(`✅ Group ${group.sourceData.Id} Created: ${companyId}`);

        writeLog(OVERALL_LOG, `"${group.sourceData.Id}": ${companyId}`);
        writeIDLog(NOT_CREATED_LOG, `"${group.sourceData.Id}": ${companyId}`);

        await updateDestinationId(
          GROUP_TABLE,
          group.sourceId,
          companyId,
          true,
          "Groups",
          OVERALL_LOG,
          ERROR_LOG
        );

        result.success = 1;
      } catch (error) {

        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR Source ID ${group.sourceId} ${formattedGroup.name}: ${error.message} @ ${frames}`;

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        writeIDLog(NOT_CREATED_LOG, group.sourceId);
        result.failure = 1;
      };
      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      return result;
    };

    const CONCURRENCY = 5;
    for (let i = 0; i < groupsData.length; i += CONCURRENCY) {
      const batch = groupsData.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(grp => migrateOne(grp)));
      console.log("RESULTS ", results);

      const batchSuccess = results.reduce((sum, r) => sum + r.success, 0);
      const batchFailure = results.reduce((sum, r) => sum + r.failure, 0);

      // if (batchSuccess > 0) {
      //   await updateCount('success', moduleId, batchSuccess, OVERALL_LOG, ERROR_LOG);
      // }
      // if (batchFailure > 0) {
      //   await updateCount('failure', moduleId, batchFailure, OVERALL_LOG, ERROR_LOG);
      // }

      console.log(`Batch ${i / CONCURRENCY + 1} completed: ${batchSuccess} succeeded, ${batchFailure} failed`);
    }

    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')
  }
  catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Groups: ${error.message
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

module.exports = { groupMigration };
