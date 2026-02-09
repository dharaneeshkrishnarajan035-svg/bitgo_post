const { fetchAllRows, updateDestinationId, updateCount, fetchParticularRow } = require("../Functions/dynamoFunctions");
const { formatCompanyPayload } = require("../Utils/Companies/formatCompany");
const { createCompanyInFreshdesk, } = require("../Utils/Companies/createCompany");
const { writeLog, writeIDLog } = require('../Functions/commonFunctions');
const fs = require('fs');

const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const COMPANY_TABLE = process.env.AWS_SOURCE_ORGS_TABLE;
const OVERALL_LOG = process.env.COMPANY_OVERALL_LOG;
const ERROR_LOG = process.env.COMPANY_ERROR_LOG;
const NOT_CREATED_LOG = process.env.COMPANY_NOT_CREATED_LOG;
const CREATED_LOG = process.env.COMPANY_CREATED_LOG;

async function companyMigration() {
  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');

    console.log("Company Migration Started...");
    writeLog(OVERALL_LOG, `Company Migration Started...`);
    writeLog(ERROR_LOG, `Company Migration Started...`);

    //Fetch Org DynamoDB Data
    let orgsPath = await fs.promises.readFile(process.env.COMPANY_JSON, 'utf-8');

    if (!orgsPath) {
      console.error("No organization data found for migration.");
      writeLog(OVERALL_LOG, `No organization data found for migration!!`);
      writeLog(ERROR_LOG, `No organization data found for migration!!`);
      return;
    }

    let orgsData = JSON.parse(orgsPath);
    orgsData = orgsData.slice(10);

    writeLog(OVERALL_LOG, `Total Organizations to Migrate : ${orgsData.length}`);
    writeLog(ERROR_LOG, `Total Organizations to Migrate : ${orgsData.length}`);

    const migrateOne = async (orgId) => {
      let result = { success: 0, failure: 0 };

      let rawOrgData = await fetchParticularRow(
        COMPANY_TABLE,
        "sourceId",
        orgId,
        sortKey = null,
        sortValue = null,
        OVERALL_LOG,
        ERROR_LOG
      );

      // console.log({ rawOrgData });

      const orgData = rawOrgData?.sourceData;

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      writeLog(OVERALL_LOG, `Processing Company Name: ${orgData?.Name}`);
      writeLog(ERROR_LOG, `Processing Company Name: ${orgData?.Name}`);

      const companyPayload = formatCompanyPayload(orgData, OVERALL_LOG, ERROR_LOG);
      writeLog(OVERALL_LOG, `Formatted Company Payload : ${JSON.stringify(companyPayload)}`);
      // console.log({ orgData, companyPayload });
      // return;

      try {
        const companyId = await createCompanyInFreshdesk(orgData?.Id, companyPayload, OVERALL_LOG, ERROR_LOG);

        if (companyId) {
          console.log(`✅ Company ${orgData?.Name} created: ${companyId}`);
          writeIDLog(CREATED_LOG, `"${orgData?.Id}": ${companyId},`);
          writeLog(OVERALL_LOG, `✅ Company Source ID: ${orgData?.Name} Destination Id: ${companyId}`);

          await updateDestinationId(
            COMPANY_TABLE,
            orgId,
            companyId,
            true,
            "Company",
            OVERALL_LOG,
            ERROR_LOG
          );

          result.success += 1;
        } else {
          result.failure += 1;
        }
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR Source ID ${orgData}: ${error.message} @ ${frames}`;

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        writeIDLog(NOT_CREATED_LOG, orgData.sourceId);
        result.failure = 1;
      }

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');
      return result;
    };

    const CONCURRENCY = 5;
    for (let i = 0; i < orgsData.length; i += CONCURRENCY) {
      const batch = orgsData.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(org => migrateOne(org)));

      const batchSuccess = results.reduce((sum, r) => sum + r.success, 0);
      const batchFailure = results.reduce((sum, r) => sum + r.failure, 0);

      // if (batchSuccess > 0) {
      //   await updateCount('success', 1, batchSuccess, OVERALL_LOG, ERROR_LOG);
      // }

      // if (batchFailure > 0) {
      //   await updateCount('failure', 1, batchFailure, OVERALL_LOG, ERROR_LOG);
      // }

      console.log(`Batch ${i / CONCURRENCY + 1} completed: ${batchSuccess} succeeded, ${batchFailure} failed`);
    }

    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Companies: ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error)
    console.error(errorMessage);

    writeLog(OVERALL_LOG, errorMessage);
    writeLog(ERROR_LOG, errorMessage);
  }

}

module.exports = { companyMigration };
