#!/usr/bin/env node

/**
 * Diagnose Execution Logs
 * 
 * Checks Google Apps Script execution logs via Apps Script API
 * to identify email send issues
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Load credentials
const SCRIPT_ID = process.env.APPS_SCRIPT_ID || 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4';
const FUNCTION_NAME = 'checkFolderForNewFiles';

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '../config/service-account-key.json'),
    scopes: [
      'https://www.googleapis.com/auth/script.scriptapp',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/logging.read'
    ]
  });
  
  return await auth.getClient();
}

async function getExecutionLogs(auth, maxResults = 10) {
  const script = google.script('v1');
  
  try {
    // Note: Apps Script API doesn't directly provide execution logs
    // We'll use the Apps Script API to get script metadata and provide instructions
    console.log('📋 Execution Log Diagnosis');
    console.log('================================\n');
    
    console.log('⚠️  Note: Google Apps Script execution logs are not directly accessible via API.');
    console.log('📝 You need to check logs manually in the Apps Script UI.\n');
    
    console.log('🔗 Direct Link to Execution Logs:');
    console.log(`   https://script.google.com/home/projects/${SCRIPT_ID}/executions\n`);
    
    console.log('📋 What to Look For:\n');
    console.log('✅ SUCCESS INDICATORS:');
    console.log('   • "📦 Prepared X unique contacts" (should be 1)');
    console.log('   • "✅ Enriched X contacts" OR "⚠️ No enriched results"');
    console.log('   • "💡 Attempting to process source data directly..."');
    console.log('   • "✅ Bulk processing complete" (should show 1 processed)');
    console.log('   • "📧 Running sequence manager..."');
    console.log('   • "Found X contacts ready" (should be 1)');
    console.log('   • "✅ Email sent to chandlerferguson319@gmail.com"\n');
    
    console.log('❌ ERROR INDICATORS:');
    console.log('   • "Error in checkFolderForNewFiles"');
    console.log('   • "Exception: No item with the given ID"');
    console.log('   • "Failed to create/update contact"');
    console.log('   • "Template not found"');
    console.log('   • "Gmail send failed"');
    console.log('   • "HubSpot API error"\n');
    
    console.log('🔍 DIAGNOSIS STEPS:\n');
    console.log('1. Open execution log link above');
    console.log('2. Find latest "checkFolderForNewFiles" execution');
    console.log('3. Click to view full log');
    console.log('4. Copy error messages and run:');
    console.log('   node scripts/apply-fix-based-on-diagnosis.js\n');
    
    // Try to get script info
    try {
      const response = await script.projects.get({
        auth,
        scriptId: SCRIPT_ID
      });
      
      console.log('✅ Script Found:');
      console.log(`   Name: ${response.data.title || 'Unknown'}`);
      console.log(`   ID: ${SCRIPT_ID}\n`);
    } catch (err) {
      console.log('⚠️  Could not fetch script info (this is normal if using Web App ID)');
      console.log(`   Using Script ID: ${SCRIPT_ID}\n`);
    }
    
    return {
      success: true,
      message: 'Diagnosis instructions provided',
      scriptId: SCRIPT_ID,
      executionLogUrl: `https://script.google.com/home/projects/${SCRIPT_ID}/executions`
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkCommonIssues() {
  console.log('🔍 Checking Common Issues...\n');
  
  const issues = [];
  
  // Check Script Properties
  console.log('1. Checking Script Properties...');
  const requiredProps = [
    'HUBSPOT_TOKEN',
    'ANYMAIL_API_KEY',
    'MONITORED_FOLDER_ID',
    'GMAIL_FROM_ADDRESS',
    'TRACKING_ENDPOINT_URL',
    'GA4_MEASUREMENT_ID',
    'GA4_API_SECRET'
  ];
  
  const missingProps = requiredProps.filter(prop => !process.env[prop]);
  
  if (missingProps.length > 0) {
    console.log('   ❌ Missing Script Properties:');
    missingProps.forEach(prop => console.log(`      - ${prop}`));
    issues.push({
      type: 'missing_properties',
      properties: missingProps
    });
  } else {
    console.log('   ✅ All required properties found in .env');
  }
  
  // Check HubSpot connection
  console.log('\n2. Checking HubSpot Connection...');
  if (process.env.HUBSPOT_TOKEN) {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
        }
      });
      
      if (response.ok) {
        console.log('   ✅ HubSpot API connection successful');
      } else {
        console.log(`   ❌ HubSpot API error: ${response.status}`);
        issues.push({
          type: 'hubspot_connection',
          status: response.status
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Could not verify HubSpot connection: ${error.message}`);
    }
  } else {
    console.log('   ⚠️  HUBSPOT_TOKEN not set');
  }
  
  // Check AnyMail connection
  console.log('\n3. Checking AnyMail Connection...');
  if (process.env.ANYMAIL_API_KEY) {
    console.log('   ✅ AnyMail API key found');
  } else {
    console.log('   ⚠️  ANYMAIL_API_KEY not set');
    issues.push({
      type: 'anymail_key',
      message: 'AnyMail API key missing'
    });
  }
  
  console.log('\n📊 Summary:');
  if (issues.length === 0) {
    console.log('   ✅ No common issues detected');
    console.log('   → Check execution logs for specific errors\n');
  } else {
    console.log(`   ⚠️  Found ${issues.length} potential issue(s)`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.type}`);
    });
    console.log('\n');
  }
  
  return issues;
}

async function main() {
  console.log('🔍 Execution Log Diagnosis Tool\n');
  
  // Check common issues first
  const issues = await checkCommonIssues();
  
  // Get execution log instructions
  const auth = await authenticate();
  const result = await getExecutionLogs(auth);
  
  // Save diagnosis report
  const report = {
    timestamp: new Date().toISOString(),
    scriptId: SCRIPT_ID,
    executionLogUrl: result.executionLogUrl,
    issues: issues,
    nextSteps: [
      '1. Open execution log URL above',
      '2. Find latest checkFolderForNewFiles execution',
      '3. Copy error messages',
      '4. Run: node scripts/apply-fix-based-on-diagnosis.js'
    ]
  };
  
  const reportPath = path.join(__dirname, '../execution-diagnosis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Diagnosis report saved to:');
  console.log(`   ${reportPath}\n`);
  
  console.log('🎯 Next Steps:');
  report.nextSteps.forEach((step, i) => {
    console.log(`   ${step}`);
  });
  console.log('');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getExecutionLogs, checkCommonIssues };

