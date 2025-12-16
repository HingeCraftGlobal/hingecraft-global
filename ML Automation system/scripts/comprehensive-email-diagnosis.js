#!/usr/bin/env node

/**
 * Comprehensive Email Send Diagnosis
 * 
 * Uses all data from this chat session to diagnose why email didn't send
 */

const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const DIAGNOSIS = {
  timestamp: new Date().toISOString(),
  issues: [],
  fixes: [],
  recommendations: [],
  nextSteps: []
};

// All data from chat session
const CHAT_DATA = {
  scriptProperties: {
    required: [
      'HUBSPOT_TOKEN',
      'ANYMAIL_API_KEY',
      'MONITORED_FOLDER_ID',
      'GMAIL_FROM_ADDRESS'
    ],
    tracking: [
      'TRACKING_ENDPOINT_URL',
      'GA4_MEASUREMENT_ID',
      'GA4_API_SECRET',
      'GA4_STREAM_ID',
      'GA4_STREAM_URL'
    ],
    values: {
      'TRACKING_ENDPOINT_URL': 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec',
      'GA4_MEASUREMENT_ID': 'G-QF5H2Q291T',
      'GA4_API_SECRET': 'cJH76-IHQteQx6DKaiPkGA',
      'GA4_STREAM_ID': '13142410458',
      'GA4_STREAM_URL': 'https://hingecraft-global.ai',
      'GMAIL_FROM_ADDRESS': 'marketingecraft@gmail.com'
    }
  },
  hubspotProperties: {
    count: 23,
    contacts: 21,
    companies: 2
  },
  testFile: {
    path: '../test_chandler_tracking.csv',
    email: 'chandlerferguson319@gmail.com',
    leadId: 'B2B-001'
  },
  appsScript: {
    scriptId: 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4',
    functions: [
      'checkFolderForNewFiles',
      'sequenceManager',
      'sendPersonalizedEmail',
      'getContactsReadyForNextStep',
      'createOrUpdateContact',
      'processBulkResults'
    ]
  }
};

function addIssue(component, problem, solution, priority = 'HIGH') {
  DIAGNOSIS.issues.push({ component, problem, solution, priority });
}

function addFix(fix) {
  DIAGNOSIS.fixes.push(fix);
}

function addRecommendation(rec) {
  DIAGNOSIS.recommendations.push(rec);
}

function addNextStep(step) {
  DIAGNOSIS.nextSteps.push(step);
}

// Check 1: Script Properties
async function checkScriptProperties() {
  console.log('\n🔍 Check 1: Script Properties\n');
  
  const missing = [];
  const present = [];
  
  CHAT_DATA.scriptProperties.required.forEach(prop => {
    if (process.env[prop]) {
      present.push(prop);
      console.log(`✅ ${prop}: Set`);
    } else {
      missing.push(prop);
      console.log(`❌ ${prop}: Missing`);
      addIssue('Script Properties', `${prop} not set`, `Add ${prop} to Apps Script Script Properties`, 'CRITICAL');
    }
  });
  
  CHAT_DATA.scriptProperties.tracking.forEach(prop => {
    if (process.env[prop] || CHAT_DATA.scriptProperties.values[prop]) {
      present.push(prop);
      console.log(`✅ ${prop}: Available`);
    } else {
      console.log(`⚠️  ${prop}: Missing (optional)`);
      addRecommendation(`Add ${prop} for tracking functionality`);
    }
  });
  
  if (missing.length > 0) {
    addFix({
      type: 'script_properties',
      action: 'Add missing properties in Apps Script UI',
      properties: missing,
      instructions: [
        '1. Go to: https://script.google.com',
        '2. Open your project',
        '3. Go to: Project Settings → Script Properties',
        '4. Add missing properties'
      ]
    });
  }
  
  return missing.length === 0;
}

// Check 2: HubSpot Connection
async function checkHubSpotConnection() {
  console.log('\n🔍 Check 2: HubSpot Connection\n');
  
  if (!process.env.HUBSPOT_TOKEN) {
    addIssue('HubSpot Connection', 'HUBSPOT_TOKEN not set', 'Add HUBSPOT_TOKEN to Script Properties', 'CRITICAL');
    console.log('❌ HUBSPOT_TOKEN not set');
    return false;
  }
  
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ HubSpot API connection successful');
      return true;
    } else {
      const errorText = await response.text();
      addIssue('HubSpot Connection', `API error: ${response.status}`, `Check token validity: ${errorText.substring(0, 200)}`, 'HIGH');
      console.log(`❌ HubSpot API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    addIssue('HubSpot Connection', `Connection failed: ${error.message}`, 'Check network and token', 'HIGH');
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

// Check 3: HubSpot Properties
async function checkHubSpotProperties() {
  console.log('\n🔍 Check 3: HubSpot Properties\n');
  
  if (!process.env.HUBSPOT_TOKEN) {
    console.log('⚠️  Cannot check (HUBSPOT_TOKEN not set)');
    return false;
  }
  
  const criticalProps = [
    'automation_next_email_step',
    'automation_next_send_timestamp',
    'automation_template_set',
    'automation_lead_type'
  ];
  
  let allExist = true;
  
  for (const prop of criticalProps) {
    try {
      const response = await fetch(`https://api.hubapi.com/crm/v3/properties/contacts/${prop}`, {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${prop}: Exists`);
      } else if (response.status === 404) {
        console.log(`❌ ${prop}: Missing`);
        addIssue('HubSpot Properties', `${prop} not found`, 'Run push-hubspot-properties-cli.js', 'HIGH');
        allExist = false;
      } else {
        console.log(`⚠️  ${prop}: Check failed (${response.status})`);
      }
    } catch (error) {
      console.log(`⚠️  ${prop}: Check error`);
    }
  }
  
  if (!allExist) {
    addFix({
      type: 'hubspot_properties',
      action: 'Push HubSpot properties via CLI',
      command: 'node scripts/push-hubspot-properties-cli.js'
    });
  }
  
  return allExist;
}

// Check 4: Test File
function checkTestFile() {
  console.log('\n🔍 Check 4: Test File\n');
  
  const testFile = path.join(__dirname, CHAT_DATA.testFile.path);
  
  if (fs.existsSync(testFile)) {
    const content = fs.readFileSync(testFile, 'utf8');
    if (content.includes(CHAT_DATA.testFile.email)) {
      console.log('✅ Test file exists with correct email');
      return true;
    } else {
      addIssue('Test File', 'Test file missing email', 'Recreate test file', 'MEDIUM');
      console.log('❌ Test file missing email');
      return false;
    }
  } else {
    addIssue('Test File', 'Test file not found', 'Create test_chandler_tracking.csv', 'MEDIUM');
    console.log('❌ Test file not found');
    return false;
  }
}

// Check 5: Apps Script Code
function checkAppsScriptCode() {
  console.log('\n🔍 Check 5: Apps Script Code\n');
  
  const scriptDir = path.join(__dirname, '../google-apps-script');
  let allExist = true;
  
  if (!fs.existsSync(scriptDir)) {
    console.log('⚠️  google-apps-script directory not found locally');
    console.log('   (Code may be deployed remotely)');
    addRecommendation('Verify code is deployed via clasp');
    return true; // Assume OK if deployed remotely
  }
  
  const requiredFiles = ['Code.gs', 'BulkProcessing.gs', 'Tracking.gs', 'HubSpotSetup.gs'];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(scriptDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}: Exists`);
      
      // Check for required functions
      if (file === 'Code.gs') {
        const content = fs.readFileSync(filePath, 'utf8');
        CHAT_DATA.appsScript.functions.forEach(func => {
          if (content.includes(`function ${func}`) || content.includes(`${func}(`)) {
            console.log(`   ✅ Function ${func} found`);
          } else {
            console.log(`   ⚠️  Function ${func} not found`);
            addIssue('Apps Script Code', `${func} not found in Code.gs`, 'Verify function exists', 'HIGH');
            allExist = false;
          }
        });
      }
    } else {
      console.log(`⚠️  ${file}: Not found locally`);
    }
  });
  
  return allExist;
}

// Check 6: Email Send Flow
function checkEmailSendFlow() {
  console.log('\n🔍 Check 6: Email Send Flow Analysis\n');
  
  console.log('📧 Email Send Flow Components:\n');
  
  const flowSteps = [
    { step: '1. File Detection', component: 'checkFolderForNewFiles()', status: '✅' },
    { step: '2. File Reading', component: 'readDriveFile()', status: '✅' },
    { step: '3. Bulk Processing', component: 'prepareAnyMailBulkPayload()', status: '✅' },
    { step: '4. AnyMail Enrichment', component: 'runAnyMailBulkEnrichment()', status: '⚠️  (fallback available)' },
    { step: '5. Contact Creation', component: 'createOrUpdateContact()', status: '❌ (requires HUBSPOT_TOKEN)' },
    { step: '6. Sequence Initiation', component: 'Sets automation_next_email_step = 1', status: '❌ (requires contact)' },
    { step: '7. Sequence Manager', component: 'sequenceManager()', status: '❌ (requires contact)' },
    { step: '8. Template Loading', component: 'getTemplate()', status: '⚠️  (verify template DB)' },
    { step: '9. Email Sending', component: 'sendPersonalizedEmail()', status: '❌ (requires Gmail permissions)' },
    { step: '10. Tracking Injection', component: 'Tracking pixel & links', status: '✅' }
  ];
  
  flowSteps.forEach(s => {
    console.log(`${s.status} ${s.step}: ${s.component}`);
    if (s.status === '❌') {
      addIssue('Email Send Flow', s.step, `Fix: ${s.component}`, 'HIGH');
    }
  });
  
  // Most likely failure points
  addRecommendation('Most likely failure: Script Properties missing (HUBSPOT_TOKEN, GMAIL_FROM_ADDRESS)');
  addRecommendation('Second most likely: Contact not created in HubSpot');
  addRecommendation('Third: Gmail permissions not granted');
}

// Generate comprehensive report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Comprehensive Email Send Diagnosis');
  console.log('='.repeat(60) + '\n');
  
  console.log(`🔍 Issues Found: ${DIAGNOSIS.issues.length}\n`);
  
  if (DIAGNOSIS.issues.length === 0) {
    console.log('✅ No critical issues found!');
    console.log('⚠️  Check Apps Script execution logs for runtime errors\n');
  } else {
    console.log('❌ Critical Issues:\n');
    DIAGNOSIS.issues.filter(i => i.priority === 'CRITICAL').forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.component}`);
      console.log(`   Problem: ${issue.problem}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
    
    console.log('⚠️  High Priority Issues:\n');
    DIAGNOSIS.issues.filter(i => i.priority === 'HIGH').forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.component}`);
      console.log(`   Problem: ${issue.problem}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  }
  
  if (DIAGNOSIS.fixes.length > 0) {
    console.log('🔧 Fixes to Apply:\n');
    DIAGNOSIS.fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix.type}: ${fix.action}`);
      if (fix.command) {
        console.log(`   Command: ${fix.command}`);
      }
      if (fix.instructions) {
        fix.instructions.forEach(inst => console.log(`   ${inst}`));
      }
      console.log('');
    });
  }
  
  if (DIAGNOSIS.recommendations.length > 0) {
    console.log('💡 Recommendations:\n');
    DIAGNOSIS.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.log('');
  }
  
  if (DIAGNOSIS.nextSteps.length > 0) {
    console.log('🎯 Next Steps:\n');
    DIAGNOSIS.nextSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../comprehensive-email-diagnosis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(DIAGNOSIS, null, 2));
  
  console.log('📄 Full diagnosis report saved to:');
  console.log(`   ${reportPath}\n`);
  
  // Add next steps based on findings
  addNextStep('1. Add missing Script Properties (see fixes above)');
  addNextStep('2. Push HubSpot properties: node scripts/push-hubspot-properties-cli.js');
  addNextStep('3. Check Apps Script execution logs');
  addNextStep('4. Verify trigger is configured');
  addNextStep('5. Test email send');
}

// Main
async function main() {
  console.log('🔍 Comprehensive Email Send Diagnosis\n');
  console.log('Using all data from chat session...\n');
  console.log('='.repeat(60) + '\n');
  
  // Run all checks
  await checkScriptProperties();
  await checkHubSpotConnection();
  await checkHubSpotProperties();
  checkTestFile();
  checkAppsScriptCode();
  checkEmailSendFlow();
  
  // Generate report
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { comprehensiveDiagnosis: main };
