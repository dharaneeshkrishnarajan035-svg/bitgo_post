const axios = require('axios');

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a custom field with automatic Rate-Limit (429) handling.
 */
async function createFreshdeskField(module, fieldData, domain, apiKey) {
  const endpointMap = {
    'company': 'company_fields',
    'contact': 'contact_fields',
    'agent': 'contact_fields',
    'ticket': 'admin/ticket_fields'
  };

  const resource = endpointMap[module.toLowerCase()];
  if (!resource) throw new Error(`Invalid module: ${module}`);

  const config = {
    method: 'post',
    url: `https://${domain}/api/v2/${resource}`,
    auth: { username: apiKey, password: 'X' },
    data: fieldData
  };

  try {
    const response = await axios(config);

    console.log(`✅ Created ${module} field: ${response.data.label}`);
    return response.data;
  } catch (error) {
    // Check specifically for Rate Limit error (429)
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 30; // Default to 30s
      console.warn(`⚠️ Rate limit hit. Sleeping for ${retryAfter} seconds...`);

      await sleep(retryAfter * 1000);

      // Retry the same function call
      return createFreshdeskField(module, fieldData, domain, apiKey);
    }

    const errDetail = error.response ? error.response.data : error.message;
    console.error(`❌ Failed ${module} field:`, JSON.stringify(errDetail));
    throw error;
  }
}

module.exports = { createFreshdeskField };
