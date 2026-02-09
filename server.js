const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const envArg = process.argv.find(arg => arg.startsWith('--env='));
const envName = envArg ? envArg.split('=')[1] : 'server1';
const envFile = `.env.${envName}`;
console.log(envFile);

const myEnv = dotenv.config({ path: envFile });
dotenvExpand.expand(myEnv);

const [, , cmd, ...args] = process.argv;

const { agentMigration } = require("./Controller/agent");
const { companyMigration } = require("./Controller/company");
const { groupMigration } = require("./Controller/group");
const { requesterMigration } = require("./Controller/requester");
const { ticketFieldMigration } = require("./Controller/ticketFields");
const { ticketMigration } = require("./Controller/ticket");
const { parseErrorLogs } = require('./Controller/parseAttachmentError');
const { ticketAttachmentFix } = require('./Controller/ticketAttachment');
const { commentAttachmentFix } = require('./Controller/commentAttachment');
const { fetchDestIds } = require('./Controller/getDestId');
const { resetDestinationId } = require('./Controller/updateDestIdNull');
const { deleteTickets } = require('./Controller/deleteFDKTickets');
const { generateExcel } = require('./Controller/generateExcelReport');
const { generateModuleMapping } = require('./Controller/generateMapping');
const { scanDynamo, idMappingGeneration, fieldValues } = require('./Controller/scanDynamo');
const { createCount } = require('./Controller/countCreation');
const { updateComments } = require("./Controller/updateComment");
const { fieldMigration } = require("./Controller/field");
const { updateGroupMembers } = require("./Controller/updateGroupMembers");

const flags = Object.fromEntries(
  args
    .filter(arg => arg.startsWith('--') && arg.includes('='))
    .map(arg => {
      const [key, value] = arg.replace(/^--/, '').split('=');
      return [key, value];
    })
);

const start = parseInt(flags.start || 0);
const end = parseInt(flags.end || 1);

let tableName;

switch (cmd) {
  case "migratefields":
    fieldMigration(args[0]);
    break;

  case "migratecompany":
    companyMigration();
    break;

  case "migrateagent":
    agentMigration();
    break;

  case "migrategroup":
    groupMigration();
    break;

  case "migraterequester":
    const response = requesterMigration();
    break;

  case "migrateticketfield":
    ticketFieldMigration();
    break;

  case "migrateticket":
    ticketMigration({ start, end });
    break;

  case "parseerror":
    parseErrorLogs();
    break;

  case "ticketattachmentfix":
    ticketAttachmentFix();
    break;

  case "commentattachmentfix":
    commentAttachmentFix();
    break;

  case "updateComment":
    updateComments();
    break;

  case "getdestid":
    if (args[0] === 'companies') {
      tableName = process.env.AWS_SOURCE_ORGS_TABLE;
    } else if (args[0] === 'groups') {
      tableName = process.env.AWS_SOURCE_GROUPS_TABLE;
    } else if (args[0] === 'agents') {
      tableName = process.env.AWS_SOURCE_AGENTS_TABLE;
    } else if (args[0] === 'requesters') {
      tableName = process.env.AWS_SOURCE_USERS_TABLE;
    } else if (args[0] === 'ticketfields') {
      tableName = process.env.AWS_SOURCE_FIELDS_TABLE;
    } else if (args[0] === 'tickets') {
      tableName = process.env.AWS_SOURCE_TICKETS_TABLE;
    } else if (args[0] === 'comments') {
      tableName = process.env.AWS_COMMENTS_TABLE
    }

    fetchDestIds(tableName);
    break;

  case "resetid":
    if (args[0] === 'companies') {
      tableName = process.env.AWS_SOURCE_ORGS_TABLE;
    } else if (args[0] === 'groups') {
      tableName = process.env.AWS_SOURCE_GROUPS_TABLE;
    } else if (args[0] === 'agents') {
      tableName = process.env.AWS_SOURCE_AGENTS_TABLE;
    } else if (args[0] === 'requesters') {
      tableName = process.env.AWS_SOURCE_USERS_TABLE;
    } else if (args[0] === 'ticketfields') {
      tableName = process.env.AWS_SOURCE_FIELDS_TABLE;
    } else if (args[0] === 'tickets') {
      tableName = process.env.AWS_SOURCE_TICKETS_TABLE;
    } else if (args[0] === 'comments') {
      tableName = process.env.AWS_COMMENTS_TABLE
    }

    resetDestinationId(tableName, args[0]);
    break;

  case 'deletetickets':
    deleteTickets();
    break;

  case 'generatereport':
    const START_YEAR = Number(args[0]);
    const END_YEAR = Number(args[1]);
    generateExcel(START_YEAR, END_YEAR);
    break;

  case 'generatemapping':
    generateModuleMapping();
    break;

  case 'scandynamo':
    scanDynamo(args[0]);
    break;

  case "getidmapping":
    if (args[0] === 'companies') {
      tableName = process.env.AWS_SOURCE_ORGS_TABLE;
    } else if (args[0] === 'groups') {
      tableName = process.env.AWS_SOURCE_GROUPS_TABLE;
    } else if (args[0] === 'agents') {
      tableName = process.env.AWS_SOURCE_AGENTS_TABLE;
    } else if (args[0] === 'requesters') {
      tableName = process.env.AWS_SOURCE_USERS_TABLE;
    } else if (args[0] === 'ticketfields') {
      tableName = process.env.AWS_SOURCE_FIELDS_TABLE;
    } else if (args[0] === 'tickets') {
      tableName = process.env.AWS_SOURCE_TICKETS_TABLE;
    } else if (args[0] === 'comments') {
      tableName = process.env.AWS_COMMENTS_TABLE
    }

    idMappingGeneration(tableName);
    break;

  case "getfieldvalues":
    if (args[0] === 'companies') {
      tableName = process.env.AWS_SOURCE_ORGS_TABLE;
    } else if (args[0] === 'groups') {
      tableName = process.env.AWS_SOURCE_GROUPS_TABLE;
    } else if (args[0] === 'agents') {
      tableName = process.env.AWS_SOURCE_AGENTS_TABLE;
    } else if (args[0] === 'requesters') {
      tableName = process.env.AWS_SOURCE_USERS_TABLE;
    } else if (args[0] === 'ticketfields') {
      tableName = process.env.AWS_SOURCE_FIELDS_TABLE;
    } else if (args[0] === 'tickets') {
      tableName = process.env.AWS_SOURCE_TICKETS_TABLE;
    } else if (args[0] === 'comments') {
      tableName = process.env.AWS_COMMENTS_TABLE
    }

    fieldValues(tableName);
    break;

  case "createcount":
    createCount(args[0]);
    break;

  case "updategroupmembers":
    updateGroupMembers();
    break;

  default:
    console.log(`❌ Unknown command: ${cmd}`);
}
