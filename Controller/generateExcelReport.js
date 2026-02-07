const axios = require('axios');
const ExcelJS = require('exceljs');
const fs = require('fs');


const ZENDESK_DOMAIN = `https://${process.env.SOURCE_DOMAIN}`;
const ZENDESK_EMAIL = `${process.env.SOURCE_EMAIL}/token`;
const ZENDESK_API_TOKEN = process.env.SOURCE_API_KEY;

const STATUSES = ['new', 'open', 'pending', 'on-hold', 'solved', 'closed'];

async function fetchTicketsForYear(year) {
  const summary = {
    YEAR: year,
    TOTAL: 0,
    NEW: 0,
    OPEN: 0,
    PENDING: 0,
    'ON-HOLD': 0,
    SOLVED: 0,
    CLOSED: 0,
  };

  const baseUrl = `${ZENDESK_DOMAIN}/api/v2/search.json`;
  const baseQuery = `type:ticket created>=${year}-01-01 created<${year + 1}-01-01`;

  try {
    const totalRes = await axios.get(baseUrl, {
      params: { query: baseQuery },
      auth: { username: ZENDESK_EMAIL, password: ZENDESK_API_TOKEN },
    });
    summary.TOTAL = totalRes.data.count;
    console.log(`TOTAL TICKETS FOR ${year} IS ${summary.TOTAL}`);
  } catch (err) {
    console.error(`❌ Failed to fetch total for ${year}:`, err.message);
  }

  for (const status of STATUSES) {
    const query = `${baseQuery} status:${status}`;
    try {
      const res = await axios.get(baseUrl, {
        params: { query },
        auth: { username: ZENDESK_EMAIL, password: ZENDESK_API_TOKEN },
      });
      summary[status.toUpperCase()] = res.data.count;
      console.log(`${status.toUpperCase()} TICKETS FOR ${year} IS ${res.data.count}`);
    } catch (err) {
      console.error(`❌ Failed to fetch ${status} for ${year}:`, err.message);
    }
  }

  return summary;
}

async function fetchCounts() {
  const counts = [
    { Module: 'Organizations', Count: 0 },
    { Module: 'Groups', Count: 0 },
    { Module: 'Users', Count: 0 },
    { Module: 'Tickets', Count: 0 },
    { Module: 'Organization Fields', Count: 0 },
    { Module: 'User Fields', Count: 0 },
    { Module: 'Ticket Fields', Count: 0 },
    
  ];

  const apiCalls = [
    { module: 'Organizations', url: `${ZENDESK_DOMAIN}/api/v2/organizations/count.json`, field: 'count' },
    { module: 'Groups', url: `${ZENDESK_DOMAIN}/api/v2/groups/count.json`, field: 'count' },
    { module: 'Users', url: `${ZENDESK_DOMAIN}/api/v2/users/count.json`, field: 'count' },
    { module: 'Tickets', url: `${ZENDESK_DOMAIN}/api/v2/search.json`, params: { query: 'type:ticket' }, field: 'count' },
    { module: 'Organization Fields', url: `${ZENDESK_DOMAIN}/api/v2/organization_fields.json`, field: 'organization_fields', isArray: true },
    { module: 'User Fields', url: `${ZENDESK_DOMAIN}/api/v2/user_fields.json`, field: 'user_fields', isArray: true },
    { module: 'Ticket Fields', url: `${ZENDESK_DOMAIN}/api/v2/ticket_fields.json`, field: 'ticket_fields', isArray: true },
    
  ];

  for (const { module, url, params, field, isArray } of apiCalls) {
    try {
      const res = await axios.get(url, {
        params,
        auth: { username: ZENDESK_EMAIL, password: ZENDESK_API_TOKEN },
      });

      const count = isArray ? res.data[field].length : (module !== "Tickets" ?res.data[field]?.value : res.data[field]);
      const entry = counts.find(item => item.Module === module);
      if (entry) {
        if(module === "Ticket Fields"){
          entry.Count = count-7;
        }
        else{
          entry.Count = count;
        }
        
      }
      console.log(`${module.toUpperCase()} COUNT: ${count}`);
    } catch (err) {
      console.error(`❌ Failed to fetch ${module.toLowerCase()} count:`, err.message);
    }
  }

  return counts;
}

async function generateExcelReport(data, countsData, filename = process.env.EXCEL_REPORT) {
  const workbook = new ExcelJS.Workbook();
  
  // Worksheet 1: Ticket Report
  const ticketWorksheet = workbook.addWorksheet('Ticket Report');

  // Define ticket columns
  ticketWorksheet.columns = [
    { header: 'YEAR', key: 'YEAR', width: 10 },
    { header: 'TOTAL', key: 'TOTAL', width: 12 },
    { header: 'NEW', key: 'NEW', width: 10 },
    { header: 'OPEN', key: 'OPEN', width: 10 },
    { header: 'PENDING', key: 'PENDING', width: 10 },
    { header: 'ON-HOLD', key: 'ON-HOLD', width: 10 },
    { header: 'SOLVED', key: 'SOLVED', width: 10 },
    { header: 'CLOSED', key: 'CLOSED', width: 10 },
  ];

  // Add ticket data rows
  data.forEach(row => {
    ticketWorksheet.addRow(row);
  });

  // Calculate ticket totals
  const ticketTotals = {
    YEAR: 'Total',
    TOTAL: 0,
    NEW: 0,
    OPEN: 0,
    PENDING: 0,
    'ON-HOLD': 0,
    SOLVED: 0,
    CLOSED: 0,
  };

  data.forEach(row => {
    ticketTotals.TOTAL += row.TOTAL || 0;
    ticketTotals.NEW += row.NEW || 0;
    ticketTotals.OPEN += row.OPEN || 0;
    ticketTotals.PENDING += row.PENDING || 0;
    ticketTotals['ON-HOLD'] += row['ON-HOLD'] || 0;
    ticketTotals.SOLVED += row.SOLVED || 0;
    ticketTotals.CLOSED += row.CLOSED || 0;
  });

  // Add ticket total row
  const ticketTotalRow = ticketWorksheet.addRow(ticketTotals);
  ticketTotalRow.font = { bold: true };

  // Style ticket header row
  ticketWorksheet.getRow(1).font = { bold: true };
  ticketWorksheet.getRow(1).eachCell({ includeEmpty: false }, cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } },
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
    };
  });

  // Apply alternate row colors and borders to ticket data rows
  for (let i = 2; i <= ticketWorksheet.rowCount - 1; i++) {
    const row = ticketWorksheet.getRow(i);
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (i % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' },
        };
      }
      cell.border = {
        left: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } },
        top: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
      };
    });
  }

  // Style ticket total row
  ticketTotalRow.eachCell({ includeEmpty: false }, cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } },
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
    };
  });

  // Worksheet 2: Counts Report
  const countsWorksheet = workbook.addWorksheet('Counts Report');

  // Define counts columns
  countsWorksheet.columns = [
    { header: 'Module', key: 'Module', width: 20 },
    { header: 'Count', key: 'Count', width: 15 },
  ];

  // Add counts data
  countsData.forEach(row => {
    countsWorksheet.addRow(row);
  });

  // Style counts header row
  countsWorksheet.getRow(1).font = { bold: true };
  countsWorksheet.getRow(1).eachCell({ includeEmpty: false }, cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } },
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
    };
  });

  // Style counts data rows
  for (let i = 2; i <= countsWorksheet.rowCount; i++) {
    const row = countsWorksheet.getRow(i);
    row.eachCell({ includeEmpty: false }, cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        left: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } },
        top: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
      };
    });
  }

  // Save the workbook
  await workbook.xlsx.writeFile(filename);
  console.log(`📊 Report saved as "${filename}"`);
}

const generateExcel = async (START_YEAR, END_YEAR) => {
  const reportData = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const row = await fetchTicketsForYear(year);
    reportData.push(row);
  }

  const countsData = await fetchCounts();
  await generateExcelReport(reportData, countsData);
  console.log('DONE!!!');
};

module.exports = { generateExcel };