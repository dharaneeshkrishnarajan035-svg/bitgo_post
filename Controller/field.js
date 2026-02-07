const axios = require('axios');
const { writeLog } = require("../Functions/commonFunctions");
const {
  requesterFieldMapping,
  requesterDropdownMapping,
  companyFieldMapping,
  companyDropdownMapping,
  ticketFieldMapping,
  ticketDropdownMapping,
  agentFieldMapping,
  agentDropdownMapping
} = require("../Utils/helperMapping");
const { createFreshdeskField } = require("../Utils/TicketFields/createFDKFields");
const { formatField } = require("../Utils/TicketFields/formatFields");

const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const DESTINATION_DOMAIN = process.env.DESTINATION_DOMAIN;
const DESTINATION_API_KEY = process.env.DESTINATION_API_KEY;

const OVERALL_LOG = process.env.FIELD_OVERALL_LOG;
const ERROR_LOG = process.env.FIELD_ERROR_LOG;

async function fieldMigration(module) {
  const fields = {
    contact: requesterFieldMapping.filter(item => !item.isDefaultField),
    agent: agentFieldMapping.filter(item => !item.isDefaultField),
    company: companyFieldMapping.filter(item => !item.isDefaultField),
    ticket: ticketFieldMapping.filter(item => !item.isDefaultField && item.sFFieldType === "boolean"),
  };

  const dropdowns = {
    contact: requesterDropdownMapping,
    agent: agentDropdownMapping,
    company: companyDropdownMapping,
    ticket: ticketDropdownMapping,
  };

  const resourceMap = {
    company: 'company_fields',
    contact: 'contact_fields',
    agent: 'contact_fields',
    ticket: 'ticket_fields'
  };

  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');

    const resource = resourceMap[module];
    console.log(`🔍 Fetching existing ${module} fields from Freshdesk...`);

    const { data: existingFields } = await axios.get(
      `https://${DESTINATION_DOMAIN}/api/v2/${resource}`,
      { auth: { username: DESTINATION_API_KEY, password: 'X' } }
    );

    const existingLabels = new Set(existingFields.map(f => f.label.toLowerCase()));

    console.log(`${module.toUpperCase()} Fields Migration Started...`);
    writeLog(OVERALL_LOG, `${module.toUpperCase()} Fields Migration Started...`);
    writeLog(ERROR_LOG, `${module.toUpperCase()} Fields Migration Started...`);

    const fieldsToMigrate = fields[module]//.slice(0, 1);
    const totalFields = fieldsToMigrate.length;

    if (totalFields === 0) {
      console.error("No fields found for migration.");
      writeLog(OVERALL_LOG, `No fields found for migration!!`);
      writeLog(ERROR_LOG, `No fields found for migration!!`);
      return;
    }

    console.log("Total Fields to Migrate: ", totalFields);
    writeLog(OVERALL_LOG, `Total Fields to Migrate: ${totalFields}`);
    writeLog(ERROR_LOG, `Total Fields to Migrate: ${totalFields}`);

    const migrateOne = async (field) => {
      let result = { success: 0, failure: 0, skipped: 0 };

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      writeLog(OVERALL_LOG, `Processing Field: ${field.sFFieldKey}`);
      writeLog(ERROR_LOG, `Processing Field: ${field.sFFieldKey}`);

      const formattedField = await formatField(field, module, dropdowns[module][field["sFFieldKey"]]);
      writeLog(OVERALL_LOG, `Formatted Field Payload : ${JSON.stringify(formattedField)}`);

      if (existingLabels.has(formattedField.label.toLowerCase())) {
        const skipMsg = `ℹ️ Skipping: Field "${formattedField.label}" already exists in Freshdesk.`;
        console.log(skipMsg);
        writeLog(OVERALL_LOG, skipMsg);
        result.skipped = 1;
        return result;
      }

      try {
        const createdField = await createFreshdeskField(
          module, formattedField, DESTINATION_DOMAIN, DESTINATION_API_KEY
        );

        await new Promise(res => setTimeout(res, 300));

        if (createdField) {
          console.log(`✅ Field ${field["sFFieldKey"]} created successfully. FDK Id ${createdField.id}`);
          writeLog(OVERALL_LOG, `✅ Field: ${field["sFFieldKey"]}, Created ID: ${createdField.id}`);
          result.success = 1;
        } else {
          console.error("Don't know what happended ", createdField)
          result.failure = 1;
          writeLog(ERROR_LOG, `Error Creating Field: ${field["sFFieldKey"]}, Reponse: ${createdField}`);
        }
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(PROJECT_DIRECTORY))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR Source ID ${field.sFFieldKey} ${formattedField.name}: ${error.message} @ ${frames}`;

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        result.failure = 1;
      };

      return result;
    };

    const CONCURRENCY = 5;
    for (let i = 0; i < totalFields; i += CONCURRENCY) {
      const batch = fieldsToMigrate.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(field => migrateOne(field)));

      console.log("RESULTS ", results);
    }

    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n');
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n');
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Fields: ${error.message
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

module.exports = { fieldMigration };
