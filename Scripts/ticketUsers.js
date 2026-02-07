const fs = require('fs');
const path = require('path');
const { writeLog, writeIDLog } = require("../Functions/commonFunctions");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { fetchAllRows, fetchParticularRow } = require("../Functions/dynamoFunctions");


const TIC_TABLE = process.env.AWS_SOURCE_TICKETS_TABLE;

const USER_FILE = `D:\\Zendesk2Freshdesk\\SNORKEL_AI\\Config_Out\\Users.json`;
const ORG_FILE = `D:\\Zendesk2Freshdesk\\SNORKEL_AI\\Config_Out\\Orgs.json`;
const TICKET_FILE = `D:\\Zendesk2Freshdesk\\SNORKEL_AI\\Config_Out\\Ticket.json`;

const OVERALL_LOG = process.env.TICKET_OVERALL_LOG;
const ERROR_LOG = process.env.TICKET_ERROR_LOG;


const fetchTicketUsers = async () => {
  let userIds = [];
  let orgIds = [];
  let ticketIds = [];

  // let tickets = [11380];

  let tickets = await fetchAllRows(TIC_TABLE, "Ticket", OVERALL_LOG, ERROR_LOG);
  // console.log(tickets.length);
  await Promise.all(tickets.map(async ticket => {
    const ticketData = ticket.sourceData;
    // console.log(ticketData);
    if (ticketData.status !== 'closed' && ticketData.status !== 'deleted') {
      const userId = ticketData.requester_id;
      const orgId = ticketData.organization_id;
      ticketIds.push(ticket.sourceId);
      if (userId) userIds.push(userId);
      if (orgId) orgIds.push(orgId);
    }


  }));

  userIds = [...new Set(userIds)];
  orgIds = [...new Set(orgIds)];
  ticketIds = [...new Set(ticketIds)];

  userIds.sort((a, b) => a - b);
  orgIds.sort((a, b) => a - b);
  ticketIds.sort((a, b) => a - b);

  fs.writeFileSync(USER_FILE, JSON.stringify(userIds, null, 2));
  fs.writeFileSync(ORG_FILE, JSON.stringify(orgIds, null, 2));
  fs.writeFileSync(TICKET_FILE, JSON.stringify(ticketIds, null, 2));

  console.log("Extraction Completed...");
  console.log(`Total Tickets : ${ticketIds.length}`);
  console.log(`Total Orgs : ${orgIds.length}`);
  console.log(`Total Users : ${userIds.length}`);

  process.exit(1);

}

fetchTicketUsers();
