const { fetchAllRows, updateDestinationId, fetchParticularRow, } = require("../Functions/dynamoFunctions");
const { writeLog, writeIDLog } = require('../Functions/commonFunctions');
const { formatAgent } = require("../Utils/Agents/formatAgent");
const { createAgent } = require("../Utils/Agents/createAgent");

const AGENT_TABLE = process.env.AWS_SOURCE_AGENTS_TABLE;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const DEFAULT_AGENT_ID = process.env.DEFAULT_AGENT_ID;

const OVERALL_LOG = process.env.AGENT_OVERALL_LOG;
const ERROR_LOG = process.env.AGENT_ERROR_LOG;
const AGENT_NOT_CREATED_LOG = process.env.AGENT_NOT_CREATED_LOG;
const AGENT_CREATED_LOG = process.env.AGENT_CREATED_LOG;
const moduleId = 2;

let totalSuccess = 0;
let totalFailure = 0;

const agentIdKey = "Id";
const agentNameKey = "Name";

const AGENT_EMAILS = [
  "mike@bitgo.com",
  "nandish@bitgo.com",
  "davidchachanko@bitgo.com",
  "marywang@bitgo.com",
  "baileyschriever@bitgo.com",
  "nurichang@bitgo.com",
  "gregorystone@bitgo.com",
  "michelleliu@bitgo.com",
  "karlakeefe@bitgo.com",
  "raymondschroder@bitgo.com",
  "weiong@bitgo.com",
  "samroberts@bitgo.com",
  "caseykampa@bitgo.com",
  "maishanoon@bitgo.com",
  "bonnieshu@bitgo.com",
  "jodymettler@bitgo.com",
  "harveyalegrado@bitgo.com",
  "austinsalameh@bitgo.com",
  "teresalin@bitgo.com",
  "ankurchaturvedi@bitgo.com",
  "ankitjain@bitgo.com",
  "aubreybepko@bitgo.com",
  "shubhangipawar@bitgo.com",
  "kevinjaquez@bitgo.com",
  "annylibengood@bitgo.com",
  "vibulannadarajah@bitgo.com",
  "bartuzengin@bitgo.com",
  "wesleyying@bitgo.com",
  "virginiaivanova@bitgo.com",
  "beatricebediako-baah@bitgo.com",
  "brycetrueman@bitgo.com",
  "akshaythakur@bitgo.com",
  "nishasrivastava@bitgo.com",
  "lalitmudgil@bitgo.com",
  "varunl@bitgo.com",
  "adityadmonte@bitgo.com",
  "suyashravi@bitgo.com",
  "dennisjiang@bitgo.com",
  "ateebasker@bitgo.com",
  "devushaji@bitgo.com",
  "rishis@bitgo.com",
  "abhishekdambalmath243@bitgo.com",
  "alociusrozario050@bitgo.com",
  "shashankchandrashekar509@bitgo.com",
  "sumithmondal214@bitgo.com",
  "dineshkommu546@bitgo.com",
  "lithishkarthik928@bitgo.com",
  "vinayakgs815@bitgo.com",
  "ashpandey123@bitgo.com",
  "praneethumashankar792@bitgo.com",
  "shashwatshrey934@bitgo.com",
  "vipultiwari676@bitgo.com",
  "sysadmin@bitgo.com",
  "priteshrathi@bitgo.com",
  "mayankpawar@bitgo.com",
];

async function agentMigration(singleAgentId = null) {
  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')

    console.log("Agent Migration Started...");
    writeLog(OVERALL_LOG, `Agent Migration Started...`);
    writeLog(ERROR_LOG, `Agent Migration Started...`);

    let agentsData =
      singleAgentId
        ? [await fetchParticularRow(AGENT_TABLE, "sourceId", singleAgentId, null, null, OVERALL_LOG, ERROR_LOG)]
        : await fetchAllRows(AGENT_TABLE, "Agent", OVERALL_LOG, ERROR_LOG);

    const totalAgents = agentsData.length;

    if (totalAgents === 0) {
      console.error("No agent data found for migration.");
      writeLog(OVERALL_LOG, `No agent data found for migration!!`);
      writeLog(ERROR_LOG, `No agent data found for migration!!`);
      return;
    }

    console.log("Total Agents to Migrate: ", totalAgents);
    writeLog(OVERALL_LOG, `Total Agents to Migrate: ${totalAgents}`);
    writeLog(ERROR_LOG, `Total Agents to Migrate: ${totalAgents}`);

    const migrateOne = async (agent) => {
      let result = { success: 0, failure: 0, sourceId: agent?.sourceId, destinationId: null };
      // let parsedData = JSON.parse(agent.sourceData);
      // agent.sourceData = parsedData;
      // console.log({ parsedData });

      if (!AGENT_EMAILS.includes(agent.sourceData?.Email?.toLowerCase())) {
        // await updateDestinationId(
        //   AGENT_TABLE,
        //   agent.sourceData[agentIdKey],
        //   DEFAULT_AGENT_ID,
        //   true,
        //   "Agent",
        //   OVERALL_LOG,
        //   ERROR_LOG
        // );
        // console.log(agent.sourceData?.Email, 'DEFAULT');
        return result;
      }

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      writeLog(OVERALL_LOG, `Processing Agent SourceID : ${agent.sourceData[agentIdKey]} Name: ${agent.sourceData[agentNameKey]}`);
      writeLog(ERROR_LOG, `Processing Agent SourceID : ${agent.sourceData[agentIdKey]} Name: ${agent.sourceData[agentNameKey]}`);

      const formattedAgent = await formatAgent(agent.sourceData, OVERALL_LOG, ERROR_LOG);
      console.log({ formattedAgent });
      // return result;

      writeLog(OVERALL_LOG, `Formatted Agent Payload : ${JSON.stringify(formattedAgent)}`);

      try {
        const agentId = await createAgent(agent?.sourceId, formattedAgent, OVERALL_LOG, ERROR_LOG);

        if (agentId) {
          console.log(`✅ Agent ${agent.sourceData[agentIdKey]} created: ${agentId}`);
          writeLog(OVERALL_LOG, `✅ Agent Source ID : ${agent.sourceData[agentIdKey]} Created ID: ${agentId}`);
          writeIDLog(AGENT_CREATED_LOG, `"${agent.sourceData[agentIdKey]}": ${agentId},`);

          await updateDestinationId(
            AGENT_TABLE,
            agent.sourceData[agentIdKey],
            agentId,
            true,
            "Agent",
            OVERALL_LOG,
            ERROR_LOG
          );

          result.success = 1;
          result.destinationId = agentId;
        } else {
          console.error("Don't know what happended ", agentId)
          result.failure = 1;
          writeLog(ERROR_LOG, `Error Creating Agent: SourceID : ${agent.sourceData[agentIdKey]} reponse: ${agentId}`);
          writeLog(AGENT_NOT_CREATED_LOG, ` Requester Agent Failed: SourceID : ${agent.sourceData[agentIdKey]} reponse: ${agentId}`);
        }
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR Source ID ${agent.sourceId} ${formattedAgent?.name}: ${error.message} @ ${frames}`;

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        writeIDLog(NOT_CREATED_LOG, agent.sourceId);
        result.failure = 1;
      };
      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      return result;
    };

    const CONCURRENCY = 5;
    for (let i = 0; i < agentsData.length; i += CONCURRENCY) {
      const batch = agentsData.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(agent => migrateOne(agent)));
      // console.log("RESULTS ", results);

      const batchSuccess = results.reduce((sum, r) => sum + r.success, 0);
      const batchFailure = results.reduce((sum, r) => sum + r.failure, 0);

      // console.log(`Batch ${i / CONCURRENCY + 1} completed: ${batchSuccess} succeeded, ${batchFailure} failed`);

      if (singleAgentId) {
        console.log("SINGLE AGENT ID");
        return !!results && results[0]?.destinationId;
      }
    }

    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Agents: ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error)
    console.error(errorMessage);

    writeLog(OVERALL_LOG, errorMessage)
    writeLog(ERROR_LOG, errorMessage)
    return null;
  }
}

module.exports = { agentMigration }
