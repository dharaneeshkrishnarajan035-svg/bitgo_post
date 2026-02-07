const axios = require('axios');
const { groupMapping, agentMapping } = require('../Utils/Tickets/mappings');
const { getSalesforceAccessToken } = require('../Functions/commonFunctions');

const FD_DOMAIN = process.env.DESTINATION_DOMAIN;
const FD_API_KEY = process.env.DESTINATION_API_KEY;

async function updateGroupMembers() {
  try {
    console.log("🚀 Starting Migration...");
    const { accessToken, instanceUrl } = await getSalesforceAccessToken();

    // STEP 1: Fetch Groups and Members from Salesforce
    const sfQuery = `SELECT Id, Name, (SELECT UserOrGroupId FROM GroupMembers) FROM Group WHERE Type = 'Queue'`;
    const sfResponse = await axios.get(`${instanceUrl}/services/data/v64.0/query`, {
      params: { q: sfQuery },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const queues = sfResponse.data.records;

    for (const queue of queues) {
      const fdGroupId = groupMapping[queue.Id];

      if (!fdGroupId) {
        console.warn(`⚠️ No FD Group mapping for Queue: ${queue.Name} (${queue.Id})`);
        continue;
      }

      const members = queue.GroupMembers ? queue.GroupMembers.records : [];

      for (const member of members) {
        const sfUserId = member.UserOrGroupId;

        // Only process if it's a User (ID starts with 005)
        if (sfUserId.startsWith('005')) {
          const fdAgentId = agentMapping[sfUserId];

          if (fdAgentId) {
            await updateFreshdeskAgent(fdAgentId, fdGroupId);
          } else {
            console.error(`❌ No FD Agent mapping found for SF User: ${sfUserId}`);
          }
        }
      }
    }
    console.log("✅ Migration Completed.");
  } catch (err) {
    console.error("Critical Error:", err.response?.data || err.message);
  }
}

async function updateFreshdeskAgent(agentId, newGroupId) {
  const auth = Buffer.from(`${FD_API_KEY}:X`).toString('base64');
  const url = `https://${FD_DOMAIN}/api/v2/agents/${agentId}`;
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. GET current agent details
    const response = await axios.get(url, { headers });
    let currentGroups = response.data.group_ids || [];

    // 2. Check if agent is already in the group to avoid duplicates
    if (!currentGroups.includes(newGroupId)) {
      currentGroups.push(newGroupId);

      // 3. PUT the merged list back to Freshdesk
      await axios.put(url, { group_ids: currentGroups }, { headers });
      console.log(`Successfully added Agent ${agentId} to Group ${newGroupId}. (Total groups: ${currentGroups.length})`);
    } else {
      console.log(`Agent ${agentId} is already a member of Group ${newGroupId}.`);
    }

  } catch (err) {
    console.error(`Failed to update Agent ${agentId}:`, err.response?.data || err.message);
  }
}

module.exports = { updateGroupMembers };
