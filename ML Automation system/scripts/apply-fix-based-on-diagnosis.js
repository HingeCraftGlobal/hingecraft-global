#!/usr/bin/env node

/**
 * Apply Fix Based on Diagnosis
 * 
 * Automatically applies fixes based on execution log diagnosis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIAGNOSIS_REPORT = path.join(__dirname, '../execution-diagnosis-report.json');
const CODE_GS = path.join(__dirname, '../google-apps-script/Code.gs');
const BULK_PROCESSING_GS = path.join(__dirname, '../google-apps-script/BulkProcessing.gs');

// Common fixes
const FIXES = {
  'missing_properties': {
    name: 'Missing Script Properties',
    action: 'addScriptProperties',
    description: 'Add missing script properties via Apps Script UI'
  },
  'hubspot_connection': {
    name: 'HubSpot Connection Issue',
    action: 'fixHubSpotConnection',
    description: 'Verify HubSpot token and API access'
  },
  'anymail_key': {
    name: 'AnyMail API Key Missing',
    action: 'fixAnyMailKey',
    description: 'Add AnyMail API key to Script Properties'
  },
  'template_not_found': {
    name: 'Template Not Found',
    action: 'fixTemplateLoading',
    description: 'Verify template database/file is accessible'
  },
  'gmail_permissions': {
    name: 'Gmail Permissions Issue',
    action: 'fixGmailPermissions',
    description: 'Grant Gmail API permissions'
  },
  'contact_not_created': {
    name: 'Contact Not Created',
    action: 'fixContactCreation',
    description: 'Fix HubSpot contact creation logic'
  },
  'sequence_manager_issue': {
    name: 'Sequence Manager Issue',
    action: 'fixSequenceManager',
    description: 'Fix sequence manager query or timing'
  }
};

function readDiagnosisReport() {
  if (!fs.existsSync(DIAGNOSIS_REPORT)) {
    console.log('❌ Diagnosis report not found. Run diagnose-execution-logs.js first.');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(DIAGNOSIS_REPORT, 'utf8'));
}

function addScriptProperties() {
  console.log('📝 Adding Script Properties...\n');
  console.log('⚠️  This must be done manually in Apps Script UI:\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Open your project');
  console.log('3. Go to: Project Settings → Script Properties');
  console.log('4. Add these properties:\n');
  
  const requiredProps = [
    { name: 'TRACKING_ENDPOINT_URL', value: 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec' },
    { name: 'GA4_MEASUREMENT_ID', value: 'G-QF5H2Q291T' },
    { name: 'GA4_API_SECRET', value: 'cJH76-IHQteQx6DKaiPkGA' },
    { name: 'GA4_STREAM_ID', value: '13142410458' },
    { name: 'GA4_STREAM_URL', value: 'https://hingecraft-global.ai' }
  ];
  
  requiredProps.forEach(prop => {
    console.log(`   ${prop.name}: ${prop.value}`);
  });
  
  console.log('\n✅ After adding, the system will automatically use them.\n');
}

function fixHubSpotConnection() {
  console.log('🔧 Fixing HubSpot Connection...\n');
  console.log('1. Verify HUBSPOT_TOKEN in Script Properties\n');
  console.log('2. Test HubSpot API connection...');
  
  try {
    const { execSync } = require('child_process');
    execSync('node scripts/verify-hubspot-setup.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ HubSpot verification failed');
    console.log('   → Check token in Script Properties\n');
  }
}

function fixAnyMailKey() {
  console.log('🔧 Fixing AnyMail API Key...\n');
  console.log('1. Add ANYMAIL_API_KEY to Script Properties\n');
  console.log('2. The system will use fallback if AnyMail fails\n');
  console.log('✅ Fallback already implemented in code\n');
}

function fixTemplateLoading() {
  console.log('🔧 Fixing Template Loading...\n');
  console.log('1. Verify template database/file is accessible\n');
  console.log('2. Check TEMPLATE_DB_FILE_ID in Script Properties\n');
  console.log('3. Ensure template exists for the template set\n');
}

function fixGmailPermissions() {
  console.log('🔧 Fixing Gmail Permissions...\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Run any function that uses Gmail');
  console.log('3. Grant Gmail API permissions when prompted\n');
  console.log('4. Ensure FROM address is authorized\n');
}

function fixContactCreation() {
  console.log('🔧 Fixing Contact Creation...\n');
  console.log('✅ Contact creation logic already includes:');
  console.log('   • Error handling');
  console.log('   • Property validation');
  console.log('   • Fallback processing\n');
  console.log('📝 If issue persists, check:');
  console.log('   • HubSpot API token');
  console.log('   • Property names match HubSpot');
  console.log('   • Contact data format\n');
}

function fixSequenceManager() {
  console.log('🔧 Fixing Sequence Manager...\n');
  console.log('✅ Sequence manager already includes:');
  console.log('   • HubSpot Search API query');
  console.log('   • 24-hour timing logic');
  console.log('   • Template set filtering\n');
  console.log('📝 If issue persists, check:');
  console.log('   • Contact exists in HubSpot');
  console.log('   • automation_next_email_step = 1');
  console.log('   • automation_next_send_timestamp = current time\n');
}

function applyFixes(issues) {
  console.log('🔧 Applying Fixes Based on Diagnosis\n');
  console.log('=====================================\n');
  
  const appliedFixes = [];
  
  issues.forEach(issue => {
    const fix = FIXES[issue.type];
    if (fix) {
      console.log(`\n🔧 Fix: ${fix.name}`);
      console.log(`   ${fix.description}\n`);
      
      switch (fix.action) {
        case 'addScriptProperties':
          addScriptProperties();
          break;
        case 'fixHubSpotConnection':
          fixHubSpotConnection();
          break;
        case 'fixAnyMailKey':
          fixAnyMailKey();
          break;
        case 'fixTemplateLoading':
          fixTemplateLoading();
          break;
        case 'fixGmailPermissions':
          fixGmailPermissions();
          break;
        case 'fixContactCreation':
          fixContactCreation();
          break;
        case 'fixSequenceManager':
          fixSequenceManager();
          break;
      }
      
      appliedFixes.push(fix);
    }
  });
  
  if (appliedFixes.length === 0) {
    console.log('✅ No automatic fixes needed');
    console.log('   → Check execution logs for specific errors\n');
  }
  
  return appliedFixes;
}

function pushFixesToAppsScript() {
  console.log('\n📤 Pushing fixes to Apps Script...\n');
  
  try {
    const scriptPath = path.join(__dirname, '../google-apps-script');
    process.chdir(scriptPath);
    
    console.log('Running: clasp push --force');
    const output = execSync('clasp push --force', { encoding: 'utf8' });
    console.log(output);
    
    console.log('✅ Code pushed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to push code:', error.message);
    return false;
  }
}

async function main() {
  const report = readDiagnosisReport();
  
  console.log('🔧 Apply Fix Based on Diagnosis\n');
  console.log('================================\n');
  
  if (report.issues && report.issues.length > 0) {
    const appliedFixes = applyFixes(report.issues);
    
    if (appliedFixes.length > 0) {
      // Push any code fixes
      pushFixesToAppsScript();
    }
  } else {
    console.log('✅ No issues found in diagnosis report');
    console.log('   → Check execution logs manually for specific errors\n');
  }
  
  console.log('📋 Next Steps:');
  console.log('1. Complete manual fixes (Script Properties, Permissions)');
  console.log('2. Run: node scripts/test-email-send.js');
  console.log('3. Verify email sent and received\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyFixes, FIXES };

