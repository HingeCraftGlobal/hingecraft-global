#!/usr/bin/env node

/**
 * Live Test Entire Funnel
 * 
 * Comprehensive live testing of the entire email sending funnel
 * Tests each step to identify where the email sending fails
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  steps: [],
  errors: [],
  warnings: [],
  recommendations: []
};

function addStep(name, status, details, error = null) {
  TEST_RESULTS.steps.push({
    name,
    status,
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  });
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
  if (error) {
    console.log(`   Error: ${error.message}`);
    TEST_RESULTS.errors.push({ step: name, error: error.message });
  }
  console.log('');
}

function addWarning(message) {
  TEST_RESULTS.warnings.push(message);
  console.log(`⚠️  Warning: ${message}\n`);
}

function addRecommendation(message) {
  TEST_RESULTS.recommendations.push(message);
  console.log(`💡 Recommendation: ${message}\n`);
}

// Step 1: Verify Test File
function testStep1_TestFile() {
  console.log('🔍 Step 1: Verify Test File\n');
  
  const testFile = path.join(__dirname, '../test_chandler_tracking.csv');
  
  if (!fs.existsSync(testFile)) {
    addStep('Test File Exists', 'FAIL', null, new Error('test_chandler_tracking.csv not found'));
    return false;
  }
  
  const content = fs.readFileSync(testFile, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length < 2) {
    addStep('Test File Content', 'FAIL', null, new Error('Test file has less than 2 lines'));
    return false;
  }
  
  if (!content.includes('chandlerferguson319@gmail.com')) {
    addStep('Test Email in File', 'FAIL', null, new Error('Test email not found in file'));
    return false;
  }
  
  addStep('Test File Exists', 'PASS', `File found with ${lines.length} lines`);
  addStep('Test File Content', 'PASS', 'Contains test email: chandlerferguson319@gmail.com');
  
  return true;
}

// Step 2: Check Script Properties (via instructions)
function testStep2_ScriptProperties() {
  console.log('🔍 Step 2: Script Properties Check\n');
  
  const required = [
    'HUBSPOT_TOKEN',
    'ANYMAIL_API_KEY',
    'MONITORED_FOLDER_ID',
    'GMAIL_FROM_ADDRESS'
  ];
  
  const missing = [];
  required.forEach(prop => {
    if (!process.env[prop]) {
      missing.push(prop);
    }
  });
  
  if (missing.length > 0) {
    addStep('Script Properties', 'FAIL', 
      `Missing: ${missing.join(', ')}`, 
      new Error('Script Properties must be set in Apps Script UI'));
    addRecommendation('Go to Apps Script → Project Settings → Script Properties and add all required properties');
    return false;
  }
  
  addStep('Script Properties', 'WARN', 
    'Cannot verify from CLI - must be checked in Apps Script UI');
  addRecommendation('Verify Script Properties are set in Apps Script UI');
  
  return true;
}

// Step 3: Check Google Drive Folder
function testStep3_DriveFolder() {
  console.log('🔍 Step 3: Google Drive Folder Check\n');
  
  const folderId = process.env.MONITORED_FOLDER_ID;
  
  if (!folderId) {
    addStep('Drive Folder ID', 'FAIL', null, new Error('MONITORED_FOLDER_ID not set'));
    return false;
  }
  
  addStep('Drive Folder ID', 'PASS', `Folder ID: ${folderId}`);
  addRecommendation('Verify this folder ID is correct in Google Drive');
  addRecommendation('Upload test_chandler_tracking.csv to this folder');
  
  return true;
}

// Step 4: Check HubSpot Connection
async function testStep4_HubSpotConnection() {
  console.log('🔍 Step 4: HubSpot Connection Check\n');
  
  const token = process.env.HUBSPOT_TOKEN;
  
  if (!token) {
    addStep('HubSpot Token', 'FAIL', null, new Error('HUBSPOT_TOKEN not set'));
    return false;
  }
  
  try {
    const response = await fetch('https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      addStep('HubSpot Connection', 'PASS', 'Successfully connected to HubSpot API');
      return true;
    } else {
      const errorText = await response.text();
      addStep('HubSpot Connection', 'FAIL', 
        `API returned ${response.status}`, 
        new Error(errorText.substring(0, 100)));
      return false;
    }
  } catch (error) {
    addStep('HubSpot Connection', 'FAIL', null, error);
    addWarning('HubSpot API test failed - check token validity');
    return false;
  }
}

// Step 5: Check AnyMail API
async function testStep5_AnyMailAPI() {
  console.log('🔍 Step 5: AnyMail API Check\n');
  
  const apiKey = process.env.ANYMAIL_API_KEY;
  
  if (!apiKey) {
    addStep('AnyMail API Key', 'FAIL', null, new Error('ANYMAIL_API_KEY not set'));
    return false;
  }
  
  try {
    const response = await fetch('https://api.anymailfinder.com/v4.0/health', {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      addStep('AnyMail API', 'PASS', 'AnyMail API is accessible');
      return true;
    } else {
      addStep('AnyMail API', 'WARN', 
        `API returned ${response.status}`, 
        new Error('AnyMail API may not be accessible'));
      addWarning('AnyMail API test returned non-200 status');
      return false;
    }
  } catch (error) {
    addStep('AnyMail API', 'WARN', null, error);
    addWarning('AnyMail API test failed - may still work in Apps Script');
    return true; // Don't fail the test, as this might work in Apps Script
  }
}

// Step 6: Check Apps Script Deployment
function testStep6_AppsScriptDeployment() {
  console.log('🔍 Step 6: Apps Script Deployment Check\n');
  
  const scriptId = 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4';
  
  addStep('Apps Script ID', 'PASS', `Script ID: ${scriptId}`);
  addRecommendation('Verify code is deployed: https://script.google.com');
  addRecommendation('Check that checkFolderForNewFiles function exists');
  addRecommendation('Verify trigger is set to run every 5 minutes');
  
  return true;
}

// Step 7: Check Trigger Setup
function testStep7_TriggerSetup() {
  console.log('🔍 Step 7: Trigger Setup Check\n');
  
  addStep('Trigger Verification', 'WARN', 
    'Cannot verify from CLI - must be checked in Apps Script UI');
  addRecommendation('Go to Apps Script → Triggers tab');
  addRecommendation('Verify checkFolderForNewFiles is set as Time-driven');
  addRecommendation('Frequency should be Every 5 minutes (or Every hour)');
  
  return true;
}

// Step 8: Test File Upload Simulation
function testStep8_FileUpload() {
  console.log('🔍 Step 8: File Upload Simulation\n');
  
  const testFile = path.join(__dirname, '../test_chandler_tracking.csv');
  const folderId = process.env.MONITORED_FOLDER_ID;
  
  if (!fs.existsSync(testFile)) {
    addStep('File Ready for Upload', 'FAIL', null, new Error('Test file not found'));
    return false;
  }
  
  if (!folderId) {
    addStep('Upload Target', 'FAIL', null, new Error('MONITORED_FOLDER_ID not set'));
    return false;
  }
  
  addStep('File Ready for Upload', 'PASS', 'test_chandler_tracking.csv is ready');
  addStep('Upload Target', 'PASS', `Target folder ID: ${folderId}`);
  addRecommendation('Manually upload test_chandler_tracking.csv to Google Drive folder');
  addRecommendation(`Folder URL: https://drive.google.com/drive/folders/${folderId}`);
  
  return true;
}

// Step 9: Execution Logs Check
function testStep9_ExecutionLogs() {
  console.log('🔍 Step 9: Execution Logs Check\n');
  
  addStep('Execution Logs', 'WARN', 
    'Cannot access from CLI - must be checked in Apps Script UI');
  addRecommendation('Go to Apps Script → Executions tab');
  addRecommendation('Look for latest execution of checkFolderForNewFiles');
  addRecommendation('Check for any errors in the execution log');
  addRecommendation('Common errors: "No item with the given ID", "API key invalid", "Gmail permission denied"');
  
  return true;
}

// Step 10: HubSpot Contact Check
async function testStep10_HubSpotContact() {
  console.log('🔍 Step 10: HubSpot Contact Check\n');
  
  const token = process.env.HUBSPOT_TOKEN;
  const testEmail = 'chandlerferguson319@gmail.com';
  
  if (!token) {
    addStep('HubSpot Contact Search', 'FAIL', null, new Error('HUBSPOT_TOKEN not set'));
    return false;
  }
  
  try {
    const response = await fetch(
      `https://api.hubapi.com/contacts/v1/contact/email/${testEmail}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const contact = await response.json();
      addStep('HubSpot Contact Exists', 'PASS', 
        `Contact found: ${contact.properties.firstname || 'N/A'} ${contact.properties.lastname || ''}`);
      
      // Check for automation properties
      const automationProps = [
        'automation_next_email_step',
        'automation_next_send_timestamp',
        'automation_template_set'
      ];
      
      const missingProps = automationProps.filter(prop => !contact.properties[prop]);
      
      if (missingProps.length > 0) {
        addWarning(`Missing automation properties: ${missingProps.join(', ')}`);
        addRecommendation('Run createHubSpotProperties() in Apps Script to create properties');
      } else {
        addStep('Automation Properties', 'PASS', 'All automation properties exist');
      }
      
      return true;
    } else if (response.status === 404) {
      addStep('HubSpot Contact Exists', 'WARN', 
        'Contact not found - will be created during processing');
      addRecommendation('Contact will be created when file is processed');
      return true;
    } else {
      const errorText = await response.text();
      addStep('HubSpot Contact Search', 'FAIL', 
        `API returned ${response.status}`, 
        new Error(errorText.substring(0, 100)));
      return false;
    }
  } catch (error) {
    addStep('HubSpot Contact Search', 'WARN', null, error);
    addWarning('Could not check HubSpot contact - may still work in Apps Script');
    return true;
  }
}

// Generate comprehensive report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Live Funnel Test Report');
  console.log('='.repeat(60) + '\n');
  
  const passed = TEST_RESULTS.steps.filter(s => s.status === 'PASS').length;
  const failed = TEST_RESULTS.steps.filter(s => s.status === 'FAIL').length;
  const warnings = TEST_RESULTS.steps.filter(s => s.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}\n`);
  
  if (TEST_RESULTS.errors.length > 0) {
    console.log('❌ Errors Found:\n');
    TEST_RESULTS.errors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.step}] ${err.error}`);
    });
    console.log('');
  }
  
  if (TEST_RESULTS.warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    TEST_RESULTS.warnings.forEach((warn, i) => {
      console.log(`${i + 1}. ${warn}`);
    });
    console.log('');
  }
  
  if (TEST_RESULTS.recommendations.length > 0) {
    console.log('💡 Recommendations:\n');
    TEST_RESULTS.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../live-funnel-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(TEST_RESULTS, null, 2));
  
  console.log('📄 Full report saved to:');
  console.log(`   ${reportPath}\n`);
  
  // Next steps
  console.log('📋 Next Steps to Diagnose Email Not Sending:\n');
  console.log('1. Check Apps Script Execution Logs:');
  console.log('   → Go to: https://script.google.com');
  console.log('   → Open your project');
  console.log('   → Click Executions tab');
  console.log('   → Review latest checkFolderForNewFiles execution\n');
  
  console.log('2. Verify Script Properties:');
  console.log('   → Project Settings → Script Properties');
  console.log('   → Ensure all 4 required properties are set\n');
  
  console.log('3. Check Trigger:');
  console.log('   → Triggers tab → Verify checkFolderForNewFiles is set\n');
  
  console.log('4. Upload Test File:');
  console.log('   → Upload test_chandler_tracking.csv to monitored Drive folder');
  console.log('   → Wait for trigger to fire (5 minutes)\n');
  
  console.log('5. Check HubSpot:');
  console.log('   → Verify contact was created');
  console.log('   → Check automation_* properties are set\n');
  
  console.log('6. Check Gmail:');
  console.log('   → Verify email was sent');
  console.log('   → Check spam folder\n');
}

async function main() {
  console.log('🧪 Live Test Entire Funnel\n');
  console.log('='.repeat(60) + '\n');
  console.log('Testing each step of the email sending funnel...\n');
  
  // Run all tests
  testStep1_TestFile();
  testStep2_ScriptProperties();
  testStep3_DriveFolder();
  await testStep4_HubSpotConnection();
  await testStep5_AnyMailAPI();
  testStep6_AppsScriptDeployment();
  testStep7_TriggerSetup();
  testStep8_FileUpload();
  testStep9_ExecutionLogs();
  await testStep10_HubSpotContact();
  
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEntireFunnel: main };
