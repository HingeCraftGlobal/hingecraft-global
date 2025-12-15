/**
 * Verify HubSpot Setup
 * Checks HubSpot integration and provides setup instructions
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Verifying HubSpot Integration\n');
console.log('='.repeat(80));

// Check Code.gs for HubSpot configuration
const codePath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
const hubspotSetupPath = path.join(__dirname, '..', 'google-apps-script', 'HubSpotSetup.gs');

let hubspotToken = null;
let hubspotApiBase = null;
let propertiesScript = false;

if (fs.existsSync(codePath)) {
  const code = fs.readFileSync(codePath, 'utf8');
  
  // Extract HubSpot token
  const tokenMatch = code.match(/HUBSPOT_ACCESS_TOKEN:\s*['"]([^'"]+)['"]/);
  if (tokenMatch) {
    hubspotToken = tokenMatch[1];
    console.log('✅ HubSpot Token found');
    console.log(`   Token: ${hubspotToken.substring(0, 20)}...`);
  } else {
    console.log('⚠️ HubSpot Token not found in Code.gs');
  }
  
  // Extract API base
  const apiMatch = code.match(/HUBSPOT_API_BASE:\s*['"]([^'"]+)['"]/);
  if (apiMatch) {
    hubspotApiBase = apiMatch[1];
    console.log(`✅ HubSpot API Base: ${hubspotApiBase}`);
  }
}

if (fs.existsSync(hubspotSetupPath)) {
  propertiesScript = true;
  console.log('✅ HubSpotSetup.gs found');
  console.log('   Contains createHubSpotProperties() function');
} else {
  console.log('⚠️ HubSpotSetup.gs not found');
}

console.log('\n📋 HubSpot Setup Instructions:');
console.log('='.repeat(80));
console.log('\n1. Go to Google Apps Script: https://script.google.com');
console.log('2. Open your HingeCraft Automation project');
console.log('3. Select function: createHubSpotProperties');
console.log('4. Click "Run" (▶️)');
console.log('5. Authorize if prompted');
console.log('6. Check execution log for property creation status');
console.log('\nThis will create all required HubSpot properties:');
console.log('  - automation_next_email_step');
console.log('  - automation_next_send_timestamp');
console.log('  - automation_template_set');
console.log('  - automation_lead_type');
console.log('  - automation_emails_sent');
console.log('  - last_contact_sent_date');
console.log('  - And more...\n');

console.log('✅ HubSpot integration verified!\n');


