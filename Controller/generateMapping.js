
const ExcelJS = require('exceljs');
const axios = require('axios');


const ZENDESK_DOMAIN = `https://${process.env.SOURCE_DOMAIN}`;
const ZENDESK_EMAIL = `${process.env.SOURCE_EMAIL}/token`;
const ZENDESK_API_TOKEN = process.env.SOURCE_API_KEY;
const FRESHDESK_DOMAIN = `https://${process.env.DESTINATION_DOMAIN}`;


const orgMapping = {
    Headings : {
        "a1":"Organization to Company API Mapping",
        "a2":"ZDK API URL:",
        "b2":`${ZENDESK_DOMAIN}/api/v2/organization_fields`,
        "a3":"Module",
        "b3":"Organization",
        "d2":"FDK API URL:",
        "e2":`${FRESHDESK_DOMAIN}/api/v2/company_fields`,
        "d3":"Module",
        "e3":"Company",
    },
    colums:[
        {
            columnName:"ZDK Field",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Key",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Type",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"Freshdesk Field",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Key",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Type",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Questions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        },
        {
            columnName:"Decisions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        }
    ],
    fieldMapping:[
        {
            "ZDK Field":"Description",
            "ZDK Field Key":"details",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Description",
            "Freshdesk Field Key":"description",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Name",
            "ZDK Field Key":"name",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Name",
            "Freshdesk Field Key":"name",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Domains",
            "ZDK Field Key":"domain_names",
            "ZDK Field Type":"array",
            "Freshdesk Field":"Domains",
            "Freshdesk Field Key":"domain_names",
            "Freshdesk Field Type":"array",
            "Questions":"",
            "Decisions":""
        },
         {
            "ZDK Field":"Notes",
            "ZDK Field Key":"notes",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Note",
            "Freshdesk Field Key":"note",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"",
            "ZDK Field Key":"",
            "ZDK Field Type":"",
            "Freshdesk Field":"",
            "Freshdesk Field Key":"",
            "Freshdesk Field Type":"",
            "Questions":"",
            "Decisions":""
        }
    ]
}

const userMapping = {
   Headings : {
        "a1":"Users to Contacts API Mapping",
        "a2":"ZDK API URL:",
        "b2":`${ZENDESK_DOMAIN}/api/v2/user_fields`,
        "a3":"Module",
        "b3":"Users",
        "d2":"FDK API URL:",
        "e2":`${FRESHDESK_DOMAIN}/api/v2/contact_fields`,
        "d3":"Module",
        "e3":"Contacts",
    },
    colums:[
        {
            columnName:"ZDK Field",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Key",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Type",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"Freshdesk Field",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Key",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Type",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Questions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        },
        {
            columnName:"Decisions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        }
    ],
    fieldMapping:[
        {
            "ZDK Field":"Email",
            "ZDK Field Key":"email",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Email",
            "Freshdesk Field Key":"email",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Name",
            "ZDK Field Key":"name",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Name",
            "Freshdesk Field Key":"name",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Phone",
            "ZDK Field Key":"phone",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Phone",
            "Freshdesk Field Key":"phone",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Organization",
            "ZDK Field Key":"organization_id",
            "ZDK Field Type":"number",
            "Freshdesk Field":"Company",
            "Freshdesk Field Key":"company_id",
            "Freshdesk Field Type":"number",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"",
            "ZDK Field Key":"",
            "ZDK Field Type":"",
            "Freshdesk Field":"",
            "Freshdesk Field Key":"",
            "Freshdesk Field Type":"",
            "Questions":"",
            "Decisions":""
        }
    ]
}

const ticketMapping =  {
   Headings : {
        "a1":"Tickets to Tickets API Mapping",
        "a2":"ZDK API URL:",
        "b2":`${ZENDESK_DOMAIN}/api/v2/ticket_fields`,
        "a3":"Module",
        "b3":"Tickets",
        "d2":"FDK API URL:",
        "e2":`${FRESHDESK_DOMAIN}/api/v2/ticket_fields`,
        "d3":"Module",
        "e3":"Tickets",
    },
    colums:[
        {
            columnName:"ZDK Field",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Key",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Type",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"ZDK Field Type",
            columnColor:"#5b9bd5",
            rowAlternateColors:["#bdd7ee","#ddebf7"]
        },
        {
            columnName:"Freshdesk Field",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Key",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"FDK Type",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Freshdesk Field Type",
            columnColor:"#70ad47",
            rowAlternateColors:["#c6e0b4","#e2efda"]
        },
        {
            columnName:"Questions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        },
        {
            columnName:"Decisions",
            columnColor:"#ffc000",
            rowAlternateColors:["#ffe699","#fff2cc"]
        }
    ],
    fieldMapping:[
        {
            "ZDK Field":"Subject",
            "ZDK Field Key":"subject",
            "ZDK Type":"Default",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Subject",
            "Freshdesk Field Key":"subject",
            "FDK Type":"Default",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Description",
            "ZDK Field Key":"description",
            "ZDK Type":"Default",
            "ZDK Field Type":"string",
            "Freshdesk Field":"Description",
            "Freshdesk Field Key":"description",
            "FDK Type":"Default",
            "Freshdesk Field Type":"string",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Requester",
            "ZDK Field Key":"requester_id",
            "ZDK Type":"Default",
            "ZDK Field Type":"number",
            "Freshdesk Field":"Requester",
            "Freshdesk Field Key":"requester_id",
            "FDK Type":"Default",
            "Freshdesk Field Type":"number",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Organization",
            "ZDK Field Key":"organization_id",
            "ZDK Type":"Default",
            "ZDK Field Type":"number",
            "Freshdesk Field":"Company",
            "Freshdesk Field Key":"company_id",
            "FDK Type":"Default",
            "Freshdesk Field Type":"number",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Group",
            "ZDK Field Key":"group_id",
            "ZDK Type":"Default",
            "ZDK Field Type":"number",
            "Freshdesk Field":"Group",
            "Freshdesk Field Key":"group_id",
            "FDK Type":"Default",
            "Freshdesk Field Type":"number",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Assignee",
            "ZDK Field Key":"assignee_id",
            "ZDK Type":"Default",
            "ZDK Field Type":"number",
            "Freshdesk Field":"Agent",
            "Freshdesk Field Key":"responder_id",
            "FDK Type":"Default",
            "Freshdesk Field Type":"number",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"CC Emails",
            "ZDK Field Key":"email_cc_ids",
            "ZDK Type":"Default",
            "ZDK Field Type":"Array of ids",
            "Freshdesk Field":"CC Emails",
            "Freshdesk Field Key":"cc_emails",
            "FDK Type":"Default",
            "Freshdesk Field Type":"Array of ids",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Tags",
            "ZDK Field Key":"tags",
            "ZDK Type":"Default",
            "ZDK Field Type":"Array of strings",
            "Freshdesk Field":"Tags",
            "Freshdesk Field Key":"tags",
            "FDK Type":"Default",
            "Freshdesk Field Type":"Array of strings",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Type",
            "ZDK Field Key":"type",
            "ZDK Type":"Default",
            "ZDK Field Type":"dropdown",
            "Freshdesk Field":"Type",
            "Freshdesk Field Key":"type",
            "FDK Type":"Default",
            "Freshdesk Field Type":"dropdown",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Source",
            "ZDK Field Key":"via.channel",
            "ZDK Type":"Default",
            "ZDK Field Type":"dropdown",
            "Freshdesk Field":"Source",
            "Freshdesk Field Key":"source",
            "FDK Type":"Default",
            "Freshdesk Field Type":"dropdown",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Status",
            "ZDK Field Key":"status",
            "ZDK Type":"Default",
            "ZDK Field Type":"dropdown",
            "Freshdesk Field":"Status",
            "Freshdesk Field Key":"status",
            "FDK Type":"Default",
            "Freshdesk Field Type":"dropdown",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Priority",
            "ZDK Field Key":"priority",
            "ZDK Type":"Default",
            "ZDK Field Type":"dropdown",
            "Freshdesk Field":"Priority",
            "Freshdesk Field Key":"priority",
            "FDK Type":"Default",
            "Freshdesk Field Type":"dropdown",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Created At",
            "ZDK Field Key":"created_at",
            "ZDK Type":"Default",
            "ZDK Field Type":"datetime",
            "Freshdesk Field":"ZDK Created At",
            "Freshdesk Field Key":"cf_zdk_created_at",
            "FDK Type":"Custom Field",
            "Freshdesk Field Type":"date",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"Updated At",
            "ZDK Field Key":"updated_at",
            "ZDK Type":"Default",
            "ZDK Field Type":"datetime",
            "Freshdesk Field":"ZDK Updated At",
            "Freshdesk Field Key":"cf_zdk_updated_at",
            "FDK Type":"Custom Field",
            "Freshdesk Field Type":"date",
            "Questions":"",
            "Decisions":""
        },
        {
            "ZDK Field":"",
            "ZDK Field Key":"",
            "ZDK Type":"",
            "ZDK Field Type":"",
            "Freshdesk Field":"",
            "Freshdesk Field Key":"",
            "FDK Type":"",
            "Freshdesk Field Type":"",
            "Questions":"",
            "Decisions":""
        },
    ]
}


const fieldMapping = {
    text:"string",
    tagger:'dropdown'
}

async function fetchFields() {


  const apiCalls = [
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


      const dataFields = res.data[field];
      
      for(const field of dataFields){
        
        if(module === "Ticket Fields" && ["Subject","Description","Status","Type","Priority","Group","Assignee","Ticket status"].includes(field.title)){
          continue;
        }
        const fieldRow =  {
            "ZDK Field":field.raw_title,
            "ZDK Field Key": module === "Ticket Fields" ? field.id :field.key ,
            "ZDK Field Type": field.type  ,
            "Freshdesk Field":field.raw_title,
            "Freshdesk Field Key": module === "Ticket Fields" ? `cf_${field.raw_title.toLowerCase().replace(/\s/g, '_')}` :field.key,
            "Freshdesk Field Type": Object.keys(fieldMapping).includes(field.type)?fieldMapping[field.type]:field.type,
            "Questions":"",
            "Decisions":""
        }

        if(module === "Organization Fields"){
          orgMapping.fieldMapping.push(fieldRow);
        }
        else if(module === "User Fields"){
          userMapping.fieldMapping.push(fieldRow);
        }
        else if(module === "Ticket Fields"){
          fieldRow['ZDK Type'] = 'Custom Field'
          fieldRow['FDK Type'] = 'Custom Field'
          ticketMapping.fieldMapping.push(fieldRow);
        }
      }

      

    } catch (err) {
      console.error(`❌ Failed to fetch ${module.toLowerCase()} fields:`, err.message);
      return 500;
    }
  }

  return 200;
}


async function generateApiMappingExcel(mappings, filename) {
    const workbook = new ExcelJS.Workbook();

    for (const { name, data } of mappings) {
        const worksheet = workbook.addWorksheet(name);

        const headingMerges = [];
        console.log(`Starting worksheet: ${name}, headingMerges: ${JSON.stringify(headingMerges)}`);
        worksheet.mergeCells('A1:H1');
       
        
        worksheet.mergeCells('B2:C2');
        worksheet.mergeCells('B3:C3');
        worksheet.mergeCells('E2:F2');
        worksheet.mergeCells('E3:F3');


        // Set headings
        for (const [range, value] of Object.entries(data.Headings)) {
            if (!range.match(/^[a-zA-Z]+\d+(:[a-zA-Z]+\d+)?$/)) {
                console.error(`Invalid range format: ${range}`);
                continue;
            }
            if (range.includes(':')) {
                if (headingMerges.includes(range)) {
                    console.warn(`Skipping range: ${range}`);
                    continue;
                }
                try {
                    const [start, end] = range.split(':');
                    const rowNumber = parseInt(start.match(/\d+/)[0]);
                    worksheet.getRow(rowNumber);
                    const cell = worksheet.getCell(start.toUpperCase());
                   
                    cell.value = value;
                    headingMerges.push(range);
                    worksheet.mergeCells(range);
                    cell.font = { bold: true };
                    // cell.alignment = { vertical: 'middle', horizontal: 'center' };
                } catch (err) {
                    console.error(`Error merging range ${range}: ${err.message}`);
                    continue;
                }
            } else {
                const rowNumber = parseInt(range.match(/\d+/)[0]);
                worksheet.getRow(rowNumber);
                const cell = worksheet.getCell(range.toUpperCase());
                cell.value = value;
                 console.log("cell",cell['_address'])
                if(['A1','A2','A3','D2','D3'].includes(cell['_address'])){
                    cell.font = { bold: true };
                }
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
        }

        // Set column headers (row 4)
        const headerRow = worksheet.getRow(4);
        data.colums.forEach((col, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = col.columnName;
            cell.font = { bold: true ,color: { argb: 'FFFFFFFF' }};
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: col.columnColor.replace('#', '') }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            // cell.border = {
            //     left: { style: 'medium', color: { argb: 'FF000000' } },
            //     right: { style: 'medium', color: { argb: 'FF000000' } },
            //     top: { style: 'medium', color: { argb: 'FF000000' } },
            //     bottom: { style: 'medium', color: { argb: 'FF000000' } }
            // };
        });

        // Set column widths
        worksheet.columns = data.colums.map(col => ({
            width: Math.max(col.columnName.length, 20)
        }));

        // Add data rows (starting from row 5)
        data.fieldMapping.forEach((row, rowIndex) => {
            const dataRow = worksheet.getRow(5 + rowIndex);
            data.colums.forEach((col, colIndex) => {
                const cell = dataRow.getCell(colIndex + 1);
                const fieldKey = col.columnName;
                cell.value = row[fieldKey] || '';
                const colorIndex = rowIndex % 2;
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: col.rowAlternateColors[colorIndex].replace('#', '') }
                };
                // cell.border = {
                //     left: { style: 'medium', color: { argb: 'FF000000' } },
                //     right: { style: 'medium', color: { argb: 'FF000000' } },
                //     top: { style: 'medium', color: { argb: 'FF000000' } },
                //     bottom: { style: 'medium', color: { argb: 'FF000000' } }
                // };
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });

        const topRow = worksheet.getRow(1);
        const cell = topRow.getCell(1);

        cell.alignment = { vertical: 'middle', horizontal: 'center' };


        worksheet.getRow(1).height = 30;
        worksheet.getRow(2).height = 20;
        worksheet.getRow(3).height = 20;
        worksheet.getRow(4).height = 25;
    }

    await workbook.xlsx.writeFile(filename);
    console.log(`📊 API Mapping Report saved as "${filename}"`);
}


const generateModuleMapping = async () => {
  const fetchFieldMapping = await fetchFields();

  console.log(fetchFieldMapping);

  if(fetchFieldMapping === 200){
    const mappings = [
        { name: 'Organization Mapping', data: orgMapping },
        { name: 'Users Mapping', data: userMapping },
        { name: 'Ticket Mapping', data: ticketMapping }
    ];

    await generateApiMappingExcel(mappings,`${process.env.CONFIG_FOLDER}${process.env.CLIENT_NAME}.xlsx`);
  }
}

module.exports = {generateModuleMapping};