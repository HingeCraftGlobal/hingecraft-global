#!/usr/bin/env node

/**
 * Diagnose Email Funnel Issue
 * 
 * Comprehensive diagnosis of why the initial test email didn't send
 * after going through the funnel and sequence start
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
  funnelSteps: [],
  issues: [],
  fixes: [],
  nextSteps: []
};

// Expected funnel flow
const FUNNEL_FLOW = [
  {
    step: 1,
    name: 'File Upload',
    location: 'Google Drive (Monitored Folder)',
    trigger: 'Time-driven trigger (checkFolderForNewFiles)',
    expected: 'File detected in Drive folder'
  },
  {
    step: 2,
    name: 'File Processing',
    location: 'Code.gs → checkFolderForNewFiles()',
    trigger: 'Automated (trigger fires)',
    expected: 'File read, rows parsed, AnyMail enrichment called'
  },
  {
    step: 3,
    name: 'AnyMail Enrichment',
    location: 'BulkProcessing.gs → runAnyMailBulkEnrichment()',
    trigger: 'API call to AnyMail',
    expected: 'Email addresses enriched, data returned'
  },
  {
    step: 4,
    name: 'Bulk Results Processing',
    location: 'BulkProcessing.gs → processBulkResults()',
    trigger: 'After AnyMail returns',
    expected: 'Leads created in HubSpot, qualification runs'
  },
  {
    step: 5,
    name: 'Lead Qualification',
    location: 'Code.gs → qualifyLeadFromData()',
    trigger: 'After contact creation',
    expected: 'Lead type determined (B2B/Student/Referral)'
  },
  {
    step: 6,
    name: 'Sequence Assignment',
    location: 'Code.gs → determineTemplateSet()',
    trigger: 'After qualification',
    expected: 'Template set assigned (set_three_b2b, set_one_student, set_two_referral)'
  },
  {
    step: 7,
    name: 'Sequence Manager',
    location: 'Code.gs → sequenceManager()',
    trigger: 'Called from checkFolderForNewFiles',
    expected: 'Sequence manager runs, checks for leads ready to send'
  },
  {
    step: 8,
    name: 'Email Sending',
    location: 'Code.gs → sendPersonalizedEmail()',
    trigger: 'For Referral: immediate, For B2B/Student: 24h delay',
    expected: 'Email sent via GmailApp.sendEmail()'
  }
];

function addFunnelIssue(step, problem, solution, priority = 'HIGH') {
  DIAGNOSIS.issues.push({ step, problem, solution, priority });
}

function addFix(fix) {
  DIAGNOSIS.fixes.push(fix);
}

function addNextStep(step) {
  DIAGNOSIS.nextSteps.push(step);
}

// Check Script Properties
function checkScriptProperties() {
  console.log('\n🔍 Step 1: Script Properties Check\n');
  
  const required = [
    'HUBSPOT_TOKEN',
    'ANYMAIL_API_KEY',
    'MONITORED_FOLDER_ID',
    'GMAIL_FROM_ADDRESS'
  ];
  
  const missing = [];
  const present = [];
  
  required.forEach(prop => {
    if (process.env[prop]) {
      present.push(prop);
    } else {
      missing.push(prop);
    }
  });
  
  if (present.length > 0) {
    console.log(`✅ Found ${present.length} properties in environment:`);
    present.forEach(p => console.log(`   • ${p}`));
  }
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing ${missing.length} required properties:`);
    missing.forEach(p => console.log(`   • ${p}`));
    addFunnelIssue(1, `Missing Script Properties: ${missing.join(', ')}`, 
      'Set in Apps Script UI: Project Settings → Script Properties', 'CRITICAL');
  } else {
    console.log('\n✅ All required Script Properties should be set');
  }
  
  console.log('\n📝 Note: Script Properties must be set in Apps Script UI');
  console.log('   They cannot be verified from CLI\n');
}

// Check test file
function checkTestFile() {
  console.log('🔍 Step 2: Test File Check\n');
  
  const testFile = path.join(__dirname, '../test_chandler_tracking.csv');
  
  if (fs.existsSync(testFile)) {
    console.log('✅ Test file exists:', testFile);
    const content = fs.readFileSync(testFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log(`   • ${lines.length} lines (header + data)`);
    
    if (content.includes('chandlerferguson319@gmail.com')) {
      console.log('   • Contains test email: chandlerferguson319@gmail.com');
    } else {
      console.log('   ⚠️  Test email not found in file');
      addFunnelIssue(2, 'Test email not in file', 'Verify test_chandler_tracking.csv content', 'HIGH');
    }
  } else {
    console.log('❌ Test file not found:', testFile);
    addFunnelIssue(2, 'Test file missing', 'Create test_chandler_tracking.csv in root', 'CRITICAL');
  }
  console.log('');
}

// Check Apps Script code structure
function checkAppsScriptCode() {
  console.log('🔍 Step 3: Apps Script Code Structure\n');
  
  const scriptDir = path.join(__dirname, '../google-apps-script');
  const expectedFiles = ['Code.gs', 'BulkProcessing.gs', 'Templates.gs', 'HubSpotSetup.gs'];
  
  if (!fs.existsSync(scriptDir)) {
    console.log('⚠️  Google Apps Script directory not found locally');
    console.log('   Code should be deployed via clasp\n');
    addFunnelIssue(3, 'Apps Script files not found locally', 
      'Code is deployed remotely via clasp. Check Apps Script editor.', 'MEDIUM');
    return;
  }
  
  let found = 0;
  expectedFiles.forEach(file => {
    const filePath = path.join(scriptDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
      found++;
    } else {
      console.log(`❌ ${file} - MISSING`);
      addFunnelIssue(3, `Missing file: ${file}`, 'Ensure file is pushed via clasp', 'HIGH');
    }
  });
  
  console.log(`\n✅ Found ${found}/${expectedFiles.length} expected files\n`);
}

// Check trigger setup
function checkTriggerSetup() {
  console.log('🔍 Step 4: Trigger Setup Check\n');
  
  console.log('📝 Expected Trigger Configuration:');
  console.log('   Function: checkFolderForNewFiles');
  console.log('   Event: Time-driven');
  console.log('   Frequency: Every 5 minutes (or Every hour)');
  console.log('\n⚠️  This must be verified in Apps Script UI:');
  console.log('   1. Go to: https://script.google.com');
  console.log('   2. Open your project');
  console.log('   3. Click Triggers tab (⏰)');
  console.log('   4. Verify checkFolderForNewFiles is set\n');
  
  addFunnelIssue(4, 'Trigger verification required', 
    'Manually verify trigger in Apps Script UI', 'HIGH');
}

// Check HubSpot properties
function checkHubSpotProperties() {
  console.log('🔍 Step 5: HubSpot Properties Check\n');
  
  console.log('📝 Expected Properties (23 total):');
  console.log('   • 21 Contact properties');
  console.log('   • 2 Company properties');
  console.log('\n⚠️  Verify in HubSpot:');
  console.log('   1. Go to: https://app.hubspot.com');
  console.log('   2. Settings → Properties');
  console.log('   3. Check for automation_* properties\n');
  
  const hubspotScript = path.join(__dirname, 'push-hubspot-properties-cli.js');
  if (fs.existsSync(hubspotScript)) {
    console.log('✅ HubSpot properties script available');
    console.log('   Run: node scripts/push-hubspot-properties-cli.js\n');
  }
}

// Diagnose email sending flow
function diagnoseEmailFlow() {
  console.log('🔍 Step 6: Email Sending Flow Diagnosis\n');
  
  console.log('📋 Expected Flow:\n');
  FUNNEL_FLOW.forEach(step => {
    console.log(`   ${step.step}. ${step.name}`);
    console.log(`      Location: ${step.location}`);
    console.log(`      Expected: ${step.expected}\n`);
  });
  
  console.log('🔍 Common Issues:\n');
  console.log('   1. File not in monitored folder');
  console.log('      → Check MONITORED_FOLDER_ID Script Property');
  console.log('      → Verify file is in correct Drive folder\n');
  
  console.log('   2. Trigger not firing');
  console.log('      → Check Apps Script execution logs');
  console.log('      → Verify trigger is set correctly\n');
  
  console.log('   3. AnyMail API failure');
  console.log('      → Check ANYMAIL_API_KEY Script Property');
  console.log('      → Verify API key is valid');
  console.log('      → Check execution logs for API errors\n');
  
  console.log('   4. HubSpot contact creation failure');
  console.log('      → Check HUBSPOT_TOKEN Script Property');
  console.log('      → Verify token has correct permissions');
  console.log('      → Check execution logs for API errors\n');
  
  console.log('   5. Sequence manager not running');
  console.log('      → Verify sequenceManager() is called from checkFolderForNewFiles');
  console.log('      → Check execution logs for errors\n');
  
  console.log('   6. Email not sending');
  console.log('      → Check GMAIL_FROM_ADDRESS Script Property');
  console.log('      → Verify Gmail permissions in Apps Script');
  console.log('      → Check execution logs for Gmail errors\n');
}

// Generate report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Email Funnel Diagnosis Report');
  console.log('='.repeat(60) + '\n');
  
  if (DIAGNOSIS.issues.length > 0) {
    console.log(`❌ Found ${DIAGNOSIS.issues.length} issues:\n`);
    DIAGNOSIS.issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.priority}] ${issue.problem}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  } else {
    console.log('✅ No critical issues found in code structure\n');
  }
  
  console.log('📋 Next Steps:\n');
  console.log('1. Check Apps Script Execution Logs:');
  console.log('   → Go to: https://script.google.com');
  console.log('   → Open your project');
  console.log('   → Click Executions tab');
  console.log('   → Review latest execution of checkFolderForNewFiles\n');
  
  console.log('2. Verify Script Properties:');
  console.log('   → Project Settings → Script Properties');
  console.log('   → Ensure all required properties are set\n');
  
  console.log('3. Test File Upload:');
  console.log('   → Upload test_chandler_tracking.csv to monitored folder');
  console.log('   → Wait for trigger to fire (5 minutes)');
  console.log('   → Check execution logs\n');
  
  console.log('4. Check HubSpot:');
  console.log('   → Verify contact was created');
  console.log('   → Check automation_* properties are set\n');
  
  // Save report
  const reportPath = path.join(__dirname, '../email-funnel-diagnosis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(DIAGNOSIS, null, 2));
  
  console.log('📄 Full report saved to:');
  console.log(`   ${reportPath}\n`);
}

async function main() {
  console.log('🔍 Email Funnel Diagnosis\n');
  console.log('='.repeat(60) + '\n');
  
  checkScriptProperties();
  checkTestFile();
  checkAppsScriptCode();
  checkTriggerSetup();
  checkHubSpotProperties();
  diagnoseEmailFlow();
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnoseEmailFlow: main };
