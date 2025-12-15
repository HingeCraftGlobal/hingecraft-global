/**
 * Prepare All Import/Export Scripts for API Calls
 * Creates all necessary JSON payloads and API call scripts
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/api_keys');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

// 1. HubSpot List Creation Payload
function createHubSpotListPayload() {
  logSection('1. Creating HubSpot List Payload');
  
  const payload = {
    name: "Ready to Send",
    objectTypeId: "0-1",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "AND",
      filters: [
        {
          filterType: "PROPERTY",
          operator: "EQ",
          property: "send_email_ready",
          value: "true"
        }
      ]
    }
  };
  
  const filePath = path.join(__dirname, '..', 'api-payloads', 'hubspot-ready-to-send-list.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  log(`✓ Created: ${filePath}`, 'green');
  
  return payload;
}

// 2. HubSpot Export Payload
function createHubSpotExportPayload() {
  logSection('2. Creating HubSpot Export Payload');
  
  const payload = {
    objectType: "contacts",
    format: "CSV",
    properties: [
      "email",
      "firstname",
      "lastname",
      "company",
      "jobtitle",
      "hs_object_id",
      "send_email_ready",
      "anymail_source_type",
      "original_sheet_data_segment_1",
      "original_sheet_data_segment_2",
      "original_sheet_data_segment_3",
      "original_sheet_data_segment_4",
      "original_sheet_data_segment_5"
    ],
    filterGroups: [
      {
        filters: [
          {
            propertyName: "send_email_ready",
            operator: "EQ",
            value: "true"
          }
        ]
      }
    ]
  };
  
  const filePath = path.join(__dirname, '..', 'api-payloads', 'hubspot-export-payload.json');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  log(`✓ Created: ${filePath}`, 'green');
  
  return payload;
}

// 3. HubSpot Batch Update Payload Template
function createHubSpotBatchUpdateTemplate() {
  logSection('3. Creating HubSpot Batch Update Template');
  
  const template = {
    inputs: [
      {
        id: "CONTACT_ID_HERE",
        properties: {
          "last_gmail_send_id": "GMAIL_SEND_ID_HERE",
          "last_email_sent_date": "TIMESTAMP_HERE",
          "send_email_ready": "false"
        }
      }
    ]
  };
  
  const filePath = path.join(__dirname, '..', 'api-payloads', 'hubspot-batch-update-template.json');
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
  log(`✓ Created: ${filePath}`, 'green');
  
  return template;
}

// 4. AnyMail API Payload Template
function createAnyMailPayloadTemplate() {
  logSection('4. Creating AnyMail API Payload Template');
  
  const template = {
    find_person_email: {
      first_name: "FIRST_NAME_HERE",
      last_name: "LAST_NAME_HERE",
      company_url: "COMPANY_URL_HERE",
      company_domain: "COMPANY_DOMAIN_HERE"
    },
    send_email: {
      to: "EMAIL_HERE",
      subject: "SUBJECT_HERE",
      html_body: "HTML_BODY_HERE",
      from: {
        email: config.email.fromAddress,
        name: config.email.fromName
      }
    }
  };
  
  const filePath = path.join(__dirname, '..', 'api-payloads', 'anymail-payload-template.json');
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
  log(`✓ Created: ${filePath}`, 'green');
  
  return template;
}

// 5. Google Apps Script Execution Payload
function createGASExecutionPayload() {
  logSection('5. Creating GAS Execution Payload');
  
  const payload = {
    function: "importAndStageLeads",
    parameters: [
      "CSV_FILE_ID_HERE",
      "TARGET_FOLDER_ID_HERE"
    ]
  };
  
  const filePath = path.join(__dirname, '..', 'api-payloads', 'gas-execution-payload.json');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  log(`✓ Created: ${filePath}`, 'green');
  
  return payload;
}

// 6. Create cURL Command Scripts
function createCurlScripts() {
  logSection('6. Creating cURL Command Scripts');
  
  const scripts = {
    'hubspot-create-list.sh': `#!/bin/bash
# Create "Ready to Send" List in HubSpot
curl --request POST \\
  --url 'https://api.hubapi.com/crm/v3/lists' \\
  --header "Authorization: Bearer ${config.hubspot.apiKey}" \\
  --header 'Content-Type: application/json' \\
  --data @api-payloads/hubspot-ready-to-send-list.json`,
    
    'hubspot-export-contacts.sh': `#!/bin/bash
# Export contacts from HubSpot
EXPORT_ID=$(curl --request POST \\
  --url 'https://api.hubapi.com/crm/v3/exports' \\
  --header "Authorization: Bearer ${config.hubspot.apiKey}" \\
  --header 'Content-Type: application/json' \\
  --data @api-payloads/hubspot-export-payload.json | jq -r '.id')

echo "Export ID: $EXPORT_ID"
echo "Poll status with: curl --request GET --url "https://api.hubapi.com/crm/v3/exports/$EXPORT_ID" --header "Authorization: Bearer ${config.hubspot.apiKey}""`,
    
    'hubspot-batch-update.sh': `#!/bin/bash
# Batch update contacts in HubSpot
curl --request POST \\
  --url 'https://api.hubapi.com/crm/v3/objects/contacts/batch/update' \\
  --header "Authorization: Bearer ${config.hubspot.apiKey}" \\
  --header 'Content-Type: application/json' \\
  --data @api-payloads/hubspot-batch-update-template.json`,
    
    'gas-execute-function.sh': `#!/bin/bash
# Execute Google Apps Script function
SCRIPT_ID="1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl --request POST \\
  --url "https://script.googleapis.com/v1/scripts/$SCRIPT_ID:run" \\
  --header "Authorization: Bearer $ACCESS_TOKEN" \\
  --header "Content-Type: application/json" \\
  --data @api-payloads/gas-execution-payload.json`
  };
  
  const scriptsDir = path.join(__dirname, '..', 'api-scripts');
  fs.mkdirSync(scriptsDir, { recursive: true });
  
  for (const [filename, content] of Object.entries(scripts)) {
    const filePath = path.join(scriptsDir, filename);
    fs.writeFileSync(filePath, content);
    fs.chmodSync(filePath, '755');
    log(`✓ Created: ${filePath}`, 'green');
  }
}

// 7. Create Node.js API Call Scripts
function createNodeAPIScripts() {
  logSection('7. Creating Node.js API Scripts');
  
  const hubspotExportScript = `/**
 * HubSpot Export API Script
 */
const axios = require('axios');
const fs = require('fs');
const config = require('../config/api_keys');

async function exportHubSpotContacts() {
  const payload = JSON.parse(
    fs.readFileSync('api-payloads/hubspot-export-payload.json', 'utf8')
  );
  
  try {
    // Create export
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/exports',
      payload,
      {
        headers: {
          'Authorization': \`Bearer \${config.hubspot.apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const exportId = response.data.id;
    console.log('Export ID:', exportId);
    
    // Poll for completion
    let status = 'PENDING';
    while (status !== 'COMPLETED') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await axios.get(
        \`https://api.hubapi.com/crm/v3/exports/\${exportId}\`,
        {
          headers: {
            'Authorization': \`Bearer \${config.hubspot.apiKey}\`
          }
        }
      );
      status = statusResponse.data.status;
      console.log('Status:', status);
    }
    
    // Download CSV
    const downloadUrl = response.data.downloadUrl;
    console.log('Download URL:', downloadUrl);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

exportHubSpotContacts();
`;
  
  const filePath = path.join(__dirname, '..', 'api-scripts', 'hubspot-export.js');
  fs.writeFileSync(filePath, hubspotExportScript);
  log(`✓ Created: ${filePath}`, 'green');
}

// Main execution
function main() {
  console.clear();
  log('\n📦 PREPARING ALL API IMPORT/EXPORT SCRIPTS\n', 'cyan');
  
  createHubSpotListPayload();
  createHubSpotExportPayload();
  createHubSpotBatchUpdateTemplate();
  createAnyMailPayloadTemplate();
  createGASExecutionPayload();
  createCurlScripts();
  createNodeAPIScripts();
  
  logSection('✅ All API Scripts Created');
  log('All import/export scripts and payloads are ready!', 'green');
  log('\nFiles created in:', 'yellow');
  log('  - api-payloads/ (JSON payloads)', 'yellow');
  log('  - api-scripts/ (cURL and Node.js scripts)', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main };


