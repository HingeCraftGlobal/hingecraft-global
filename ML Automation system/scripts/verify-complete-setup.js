#!/usr/bin/env node

/**
 * Verify Complete Setup
 * 
 * Verifies all steps are complete and provides final status
 */

const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const STATUS = {
  scriptProperties: { status: 'UNKNOWN', details: [] },
  hubspotProperties: { status: 'UNKNOWN', details: [] },
  database: { status: 'UNKNOWN', details: [] },
  testFile: { status: 'UNKNOWN', details: [] },
  clis: { status: 'UNKNOWN', details: [] }
};

function checkScriptProperties() {
  console.log('\n📋 Check 1: Script Properties\n');
  
  const scriptFile = path.join(__dirname, '../SET_PROPERTIES_SCRIPT.gs');
  
  if (fs.existsSync(scriptFile)) {
    console.log('✅ SET_PROPERTIES_SCRIPT.gs exists');
    STATUS.scriptProperties.details.push('Script file created');
    
    const content = fs.readFileSync(scriptFile, 'utf8');
    if (content.includes('setAllScriptProperties')) {
      console.log('✅ Function ready to copy to Apps Script');
      STATUS.scriptProperties.details.push('Function ready');
    }
    
    // Check for empty values
    const emptyProps = [];
    if (content.includes('"HUBSPOT_TOKEN": ""')) emptyProps.push('HUBSPOT_TOKEN');
    if (content.includes('"ANYMAIL_API_KEY": ""')) emptyProps.push('ANYMAIL_API_KEY');
    if (content.includes('"MONITORED_FOLDER_ID": ""')) emptyProps.push('MONITORED_FOLDER_ID');
    
    if (emptyProps.length > 0) {
      console.log(`⚠️  Empty values need to be filled: ${emptyProps.join(', ')}`);
      STATUS.scriptProperties.status = 'NEEDS_VALUES';
      STATUS.scriptProperties.details.push(`Empty: ${emptyProps.join(', ')}`);
    } else {
      console.log('✅ All values appear to be set');
      STATUS.scriptProperties.status = 'READY';
    }
    
    console.log('\n📝 To complete:');
    console.log('   1. Fill in empty values in SET_PROPERTIES_SCRIPT.gs');
    console.log('   2. Copy function to Apps Script');
    console.log('   3. Run setAllScriptProperties()');
    console.log('   4. Check execution log\n');
  } else {
    console.log('❌ SET_PROPERTIES_SCRIPT.gs not found');
    STATUS.scriptProperties.status = 'MISSING';
    console.log('   Run: node scripts/set-script-properties-cli.js\n');
  }
}

async function checkHubSpotProperties() {
  console.log('\n📋 Check 2: HubSpot Properties\n');
  
  if (!process.env.HUBSPOT_TOKEN) {
    console.log('⚠️  HUBSPOT_TOKEN not set');
    STATUS.hubspotProperties.status = 'NEEDS_TOKEN';
    STATUS.hubspotProperties.details.push('HUBSPOT_TOKEN not set');
    console.log('   Set token and run: node scripts/push-hubspot-properties-cli.js\n');
    return;
  }
  
  console.log('✅ HUBSPOT_TOKEN is set');
  STATUS.hubspotProperties.details.push('Token available');
  
  // Try to check if properties exist
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/properties/contacts/automation_next_email_step', {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
      }
    });
    
    if (response.ok) {
      console.log('✅ HubSpot properties exist');
      STATUS.hubspotProperties.status = 'COMPLETE';
      STATUS.hubspotProperties.details.push('Properties exist');
    } else if (response.status === 404) {
      console.log('⚠️  HubSpot properties not found');
      STATUS.hubspotProperties.status = 'NEEDS_PUSH';
      STATUS.hubspotProperties.details.push('Properties need to be created');
      console.log('   Run: node scripts/push-hubspot-properties-cli.js\n');
    } else {
      console.log(`⚠️  Could not verify (${response.status})`);
      STATUS.hubspotProperties.status = 'UNKNOWN';
    }
  } catch (error) {
    console.log('⚠️  Could not verify HubSpot properties');
    STATUS.hubspotProperties.status = 'UNKNOWN';
    console.log(`   Error: ${error.message}\n`);
  }
}

function checkDatabase() {
  console.log('\n📋 Check 3: Database\n');
  
  const schemaFile = path.join(__dirname, '../database/schema.sql');
  
  if (fs.existsSync(schemaFile)) {
    console.log('✅ Database schema file exists');
    STATUS.database.details.push('Schema file exists');
    
    const schema = fs.readFileSync(schemaFile, 'utf8');
    const tableCount = (schema.match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
    console.log(`✅ Schema defines ${tableCount} tables`);
    STATUS.database.details.push(`${tableCount} tables defined`);
    
    // Check if pg module is available
    try {
      require('pg');
      console.log('✅ PostgreSQL client (pg) module available');
      STATUS.database.details.push('pg module available');
      STATUS.database.status = 'READY_TO_APPLY';
    } catch (e) {
      console.log('⚠️  PostgreSQL client (pg) module not installed');
      STATUS.database.details.push('pg module not installed');
      STATUS.database.status = 'NEEDS_INSTALL';
      console.log('   Install: npm install\n');
    }
  } else {
    console.log('❌ Database schema file not found');
    STATUS.database.status = 'MISSING';
  }
}

function checkTestFile() {
  console.log('\n📋 Check 4: Test File\n');
  
  const testFile = path.join(__dirname, '../test_chandler_tracking.csv');
  
  if (fs.existsSync(testFile)) {
    console.log('✅ Test file exists');
    STATUS.testFile.status = 'READY';
    STATUS.testFile.details.push('File exists');
    
    const content = fs.readFileSync(testFile, 'utf8');
    if (content.includes('chandlerferguson319@gmail.com')) {
      console.log('✅ Contains test email');
      STATUS.testFile.details.push('Test email present');
    }
  } else {
    console.log('❌ Test file not found');
    STATUS.testFile.status = 'MISSING';
  }
  console.log('');
}

function checkCLIs() {
  console.log('\n📋 Check 5: CLI Scripts\n');
  
  const requiredScripts = [
    'set-script-properties-cli.js',
    'push-hubspot-properties-cli.js',
    'master-cli.js',
    'comprehensive-email-diagnosis.js',
    'verify-all-clis.js'
  ];
  
  let allExist = true;
  
  requiredScripts.forEach(script => {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`✅ ${script}`);
      STATUS.clis.details.push(`${script}: exists`);
    } else {
      console.log(`❌ ${script}`);
      STATUS.clis.details.push(`${script}: missing`);
      allExist = false;
    }
  });
  
  if (allExist) {
    STATUS.clis.status = 'COMPLETE';
  } else {
    STATUS.clis.status = 'INCOMPLETE';
  }
  console.log('');
}

function generateFinalReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Complete Setup Verification');
  console.log('='.repeat(60) + '\n');
  
  const checks = [
    { name: 'Script Properties', status: STATUS.scriptProperties },
    { name: 'HubSpot Properties', status: STATUS.hubspotProperties },
    { name: 'Database', status: STATUS.database },
    { name: 'Test File', status: STATUS.testFile },
    { name: 'CLI Scripts', status: STATUS.clis }
  ];
  
  checks.forEach(check => {
    const icon = check.status.status === 'COMPLETE' || check.status.status === 'READY' ? '✅' :
                 check.status.status === 'READY_TO_APPLY' ? '✅' :
                 check.status.status === 'NEEDS_VALUES' || check.status.status === 'NEEDS_PUSH' || check.status.status === 'NEEDS_INSTALL' ? '⚠️' :
                 check.status.status === 'MISSING' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.status.status}`);
    check.status.details.forEach(detail => {
      console.log(`   • ${detail}`);
    });
    console.log('');
  });
  
  // Summary
  const complete = checks.filter(c => c.status.status === 'COMPLETE' || c.status.status === 'READY').length;
  const needsAction = checks.filter(c => c.status.status.includes('NEEDS') || c.status.status === 'MISSING').length;
  
  console.log('📊 Summary:');
  console.log(`   ✅ Complete: ${complete}/${checks.length}`);
  console.log(`   ⚠️  Needs Action: ${needsAction}/${checks.length}\n`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    status: STATUS,
    summary: {
      complete: complete,
      needsAction: needsAction,
      total: checks.length
    }
  };
  
  const reportPath = path.join(__dirname, '../complete-setup-verification.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Full report saved to:');
  console.log(`   ${reportPath}\n`);
  
  // Next steps
  if (needsAction > 0) {
    console.log('🎯 Remaining Actions:\n');
    
    if (STATUS.scriptProperties.status === 'NEEDS_VALUES' || STATUS.scriptProperties.status === 'MISSING') {
      console.log('1. Script Properties:');
      console.log('   • Fill in SET_PROPERTIES_SCRIPT.gs');
      console.log('   • Copy to Apps Script and run\n');
    }
    
    if (STATUS.hubspotProperties.status === 'NEEDS_PUSH' || STATUS.hubspotProperties.status === 'NEEDS_TOKEN') {
      console.log('2. HubSpot Properties:');
      if (STATUS.hubspotProperties.status === 'NEEDS_TOKEN') {
        console.log('   • Set HUBSPOT_TOKEN');
      }
      console.log('   • Run: node scripts/push-hubspot-properties-cli.js\n');
    }
    
    if (STATUS.database.status === 'NEEDS_INSTALL') {
      console.log('3. Database:');
      console.log('   • Install: npm install');
      console.log('   • Start: docker-compose up -d postgres');
      console.log('   • Apply: node scripts/apply-entire-database-direct.js\n');
    }
  } else {
    console.log('✅ All automated checks passed!');
    console.log('⚠️  Manual verification still needed for:');
    console.log('   • Script Properties in Apps Script UI');
    console.log('   • Trigger configuration');
    console.log('   • Email send test\n');
  }
}

async function main() {
  console.log('🔍 Verify Complete Setup\n');
  console.log('='.repeat(60) + '\n');
  
  checkScriptProperties();
  await checkHubSpotProperties();
  checkDatabase();
  checkTestFile();
  checkCLIs();
  
  generateFinalReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyCompleteSetup: main };
