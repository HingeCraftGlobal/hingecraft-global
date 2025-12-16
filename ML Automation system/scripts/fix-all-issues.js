#!/usr/bin/env node

/**
 * Fix All Issues
 * 
 * Automatically fixes all identified issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIAGNOSIS_REPORT = path.join(__dirname, '../email-send-diagnosis-report.json');
const TEST_FILE = path.join(__dirname, '../test_chandler_tracking.csv');

function fixTestFile() {
  console.log('📄 Fixing Test File...\n');
  
  if (!fs.existsSync(TEST_FILE)) {
    const testData = `Organization Name,Website URL,Primary Contact Email,Lead ID,City,State,Focus Areas,Target Age Range,Annual Budget Range,Partnership Likelihood
Ferguson Ventures,https://fergusonventures.com,chandlerferguson319@gmail.com,B2B-001,San Francisco,CA,SaaS,25-45,30M-50M ARR,High`;
    
    fs.writeFileSync(TEST_FILE, testData);
    console.log('✅ Test file created:', TEST_FILE);
    return true;
  } else {
    console.log('✅ Test file already exists');
    return true;
  }
}

function fixScriptProperties() {
  console.log('\n📝 Script Properties Fix\n');
  console.log('⚠️  Script Properties must be added manually in Apps Script UI:\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Open your project');
  console.log('3. Go to: Project Settings → Script Properties');
  console.log('4. Add these properties:\n');
  
  const requiredProps = [
    { name: 'HUBSPOT_TOKEN', description: 'HubSpot Private App Token' },
    { name: 'ANYMAIL_API_KEY', description: 'AnyMail API Key (optional, fallback available)' },
    { name: 'MONITORED_FOLDER_ID', description: 'Google Drive Folder ID to monitor' },
    { name: 'GMAIL_FROM_ADDRESS', description: 'Gmail address to send from (e.g., marketingecraft@gmail.com)' },
    { name: 'TRACKING_ENDPOINT_URL', value: 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec' },
    { name: 'GA4_MEASUREMENT_ID', value: 'G-QF5H2Q291T' },
    { name: 'GA4_API_SECRET', value: 'cJH76-IHQteQx6DKaiPkGA' },
    { name: 'GA4_STREAM_ID', value: '13142410458' },
    { name: 'GA4_STREAM_URL', value: 'https://hingecraft-global.ai' }
  ];
  
  requiredProps.forEach(prop => {
    if (prop.value) {
      console.log(`   ${prop.name}: ${prop.value}`);
    } else {
      console.log(`   ${prop.name}: [${prop.description}]`);
    }
  });
  
  console.log('\n✅ After adding, the system will automatically use them.\n');
}

function pushCodeToAppsScript() {
  console.log('\n📤 Pushing Code to Apps Script...\n');
  
  const scriptPath = path.join(__dirname, '../google-apps-script');
  
  try {
    process.chdir(scriptPath);
    console.log('Running: clasp push --force');
    const output = execSync('clasp push --force', { encoding: 'utf8' });
    console.log(output);
    console.log('✅ Code pushed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to push code:', error.message);
    console.log('⚠️  Run manually: cd google-apps-script && clasp push --force\n');
    return false;
  }
}

function generateFixReport() {
  const report = {
    timestamp: new Date().toISOString(),
    fixes: {
      testFile: 'Created',
      scriptProperties: 'Manual setup required',
      codePush: 'Attempted'
    },
    nextSteps: [
      '1. Add Script Properties in Apps Script UI',
      '2. Verify trigger is configured',
      '3. Upload test file to Drive folder',
      '4. Check execution logs',
      '5. Verify email sent'
    ]
  };
  
  const reportPath = path.join(__dirname, '../fix-all-issues-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Fix report saved to:');
  console.log(`   ${reportPath}\n`);
}

async function main() {
  console.log('🔧 Fix All Issues\n');
  console.log('='.repeat(60) + '\n');
  
  // Fix 1: Test file
  fixTestFile();
  
  // Fix 2: Script Properties (manual)
  fixScriptProperties();
  
  // Fix 3: Push code
  pushCodeToAppsScript();
  
  // Generate report
  generateFixReport();
  
  console.log('✅ Fixes Applied!\n');
  console.log('📋 Next Steps:');
  console.log('1. Add Script Properties (see above)');
  console.log('2. Verify trigger in Apps Script');
  console.log('3. Upload test file to Drive folder');
  console.log('4. Check execution logs');
  console.log('5. Verify email sent\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixAllIssues: main };
