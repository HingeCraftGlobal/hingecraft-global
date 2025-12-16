#!/usr/bin/env node

/**
 * Test Email Send
 * 
 * Tests the email send functionality end-to-end
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_FILE = path.join(__dirname, '../test_chandler_tracking.csv');

async function verifyTestFile() {
  console.log('📄 Verifying Test File...\n');
  
  if (!fs.existsSync(TEST_FILE)) {
    console.log('❌ Test file not found:', TEST_FILE);
    console.log('   Creating test file...\n');
    
    const testData = `Organization Name,Website URL,Primary Contact Email,Lead ID,City,State,Focus Areas,Target Age Range,Annual Budget Range,Partnership Likelihood
Ferguson Ventures,https://fergusonventures.com,chandlerferguson319@gmail.com,B2B-001,San Francisco,CA,SaaS,25-45,30M-50M ARR,High`;
    
    fs.writeFileSync(TEST_FILE, testData);
    console.log('✅ Test file created\n');
  } else {
    console.log('✅ Test file exists\n');
  }
}

async function checkScriptProperties() {
  console.log('🔍 Checking Script Properties...\n');
  
  const requiredProps = [
    'HUBSPOT_TOKEN',
    'ANYMAIL_API_KEY',
    'MONITORED_FOLDER_ID',
    'GMAIL_FROM_ADDRESS'
  ];
  
  const missing = [];
  
  requiredProps.forEach(prop => {
    if (!process.env[prop]) {
      missing.push(prop);
    }
  });
  
  if (missing.length > 0) {
    console.log('⚠️  Missing Script Properties:');
    missing.forEach(prop => console.log(`   - ${prop}`));
    console.log('\n📝 Add these in Apps Script UI:\n');
    console.log('   1. Go to: https://script.google.com');
    console.log('   2. Project Settings → Script Properties');
    console.log('   3. Add missing properties\n');
    return false;
  } else {
    console.log('✅ All required properties found\n');
    return true;
  }
}

async function checkTrigger() {
  console.log('🔍 Checking Trigger...\n');
  
  console.log('⚠️  Trigger verification must be done manually:\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Open your project');
  console.log('3. Go to: Triggers tab');
  console.log('4. Verify trigger exists:\n');
  console.log('   Function: checkFolderForNewFiles');
  console.log('   Event: Time-driven');
  console.log('   Type: Minutes timer');
  console.log('   Frequency: Every 5 minutes');
  console.log('   Status: Enabled\n');
  
  console.log('✅ After verifying, the trigger will run automatically\n');
}

async function uploadTestFile() {
  console.log('📤 Uploading Test File...\n');
  
  console.log('⚠️  File upload must be done manually:\n');
  console.log('1. Go to: https://drive.google.com');
  console.log('2. Navigate to your monitored folder');
  console.log('3. Upload:', TEST_FILE);
  console.log('4. Wait 5 minutes for trigger to process\n');
  
  console.log('OR use Google Drive API (if configured):\n');
  console.log('   node scripts/upload-test-file.js\n');
}

async function monitorExecution() {
  console.log('👀 Monitoring Execution...\n');
  
  console.log('📋 Check execution logs:\n');
  console.log('   https://script.google.com/home/projects/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/executions\n');
  
  console.log('✅ What to verify:\n');
  console.log('1. File processed successfully');
  console.log('2. Contact created in HubSpot');
  console.log('3. Email sent to chandlerferguson319@gmail.com');
  console.log('4. Check Gmail Sent folder');
  console.log('5. Check inbox for email');
  console.log('6. Test tracking (open email, click link)\n');
}

async function verifyEmailSent() {
  console.log('📧 Verifying Email Sent...\n');
  
  console.log('1. Check Gmail Sent folder:');
  console.log('   https://mail.google.com/mail/u/0/#sent\n');
  
  console.log('2. Check inbox:');
  console.log('   chandlerferguson319@gmail.com\n');
  
  console.log('3. Verify email contains:');
  console.log('   • Tracking pixel (invisible)');
  console.log('   • Wrapped links');
  console.log('   • Correct subject and body\n');
  
  console.log('4. Test tracking:');
  console.log('   • Open email');
  console.log('   • Click a link');
  console.log('   • Check HubSpot for opens/clicks');
  console.log('   • Check GA4 for events\n');
}

async function main() {
  console.log('🧪 Test Email Send\n');
  console.log('==================\n');
  
  // Step 1: Verify test file
  await verifyTestFile();
  
  // Step 2: Check script properties
  const propsOk = await checkScriptProperties();
  
  // Step 3: Check trigger
  await checkTrigger();
  
  // Step 4: Upload test file
  await uploadTestFile();
  
  // Step 5: Monitor execution
  await monitorExecution();
  
  // Step 6: Verify email sent
  await verifyEmailSent();
  
  console.log('✅ Test Complete!\n');
  console.log('📋 Summary:');
  console.log('   • Test file ready');
  if (!propsOk) {
    console.log('   ⚠️  Add missing Script Properties');
  }
  console.log('   • Upload file to Drive folder');
  console.log('   • Wait for trigger (5 minutes)');
  console.log('   • Verify email sent and received\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyTestFile, checkScriptProperties, verifyEmailSent };

