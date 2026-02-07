const axios = require('axios');

const fs = require('fs');


const instance = axios.create({
  baseURL: `https://${process.env.DESTINATION_DOMAIN}/api/v2`,
  auth: {
    username: process.env.DESTINATION_API_KEY,
    password: 'X'
  }
});


async function deleteTicket(ticketId) {
  try {
    const res = await instance.delete(`/tickets/${ticketId}`);
    console.log(`✅ Deleted Ticket ID: ${ticketId}`);
  } catch (error) {
    if (error.response) {
      console.error(`❌ Failed to delete Ticket ID ${ticketId}: ${error.response.status} - ${error.response.data}`);
    } else {
      console.error(`❌ Error deleting Ticket ID ${ticketId}:`, error.message);
    }
  }
}


const deleteTickets = async () => {

  const tickets = JSON.parse(fs.readFileSync(process.env.DELETE_TICKETS_FILE));

  await Promise.all(tickets.map(ticketId => deleteTicket(ticketId)));
  console.log("Total Tickets Deleted :", tickets.length);

}


module.exports = {deleteTickets}