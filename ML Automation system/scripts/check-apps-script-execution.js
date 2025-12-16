#!/usr/bin/env node

/**
 * Check Apps Script Execution Logs
 * 
 * Provides instructions and tools to check Apps Script execution logs
 * to diagnose why email didn't send
 */

const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const SCRIPT_ID = 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4';

function generateDiagnosisGuide() {
  console.log('🔍 Apps Script Execution Logs Diagnosis Guide\n');
  console.log('='.repeat(60) + '\n');
  
  console.log('📋 Step-by-Step: How to Check Execution Logs\n');
  
  console.log('1. Open Apps Script Editor:');
  console.log('   → Go to: https://script.google.com');
  console.log('   → Open your project (Script ID: ' + SCRIPT_ID + ')\n');
  
  console.log('2. Navigate to Executions Tab:');
  console.log('   → Click "Executions" in the left sidebar (clock icon ⏰)');
  console.log('   → You\'ll see a list of recent executions\n');
  
  console.log('3. Find Latest Execution:');
  console.log('   → Look for the most recent execution of "checkFolderForNewFiles"');
  console.log('   → Click on it to see details\n');
  
  console.log('4. Check Execution Status:');
  console.log('   → ✅ Green checkmark = Success');
  console.log('   → ❌ Red X = Failed');
  console.log('   → ⏱️  Clock icon = Running\n');
  
  console.log('5. Review Execution Log:');
  console.log('   → Click "View logs" or expand the execution');
  console.log('   → Look for error messages\n');
  
  console.log('='.repeat(60) + '\n');
  console.log('🔍 Common Errors and Solutions\n');
  
  const commonErrors = [
    {
      error: 'No item with the given ID could be found',
      cause: 'MONITORED_FOLDER_ID is incorrect or folder doesn\'t exist',
      solution: 'Verify MONITORED_FOLDER_ID in Script Properties matches actual Drive folder ID'
    },
    {
      error: 'API key invalid',
      cause: 'HUBSPOT_TOKEN or ANYMAIL_API_KEY is incorrect',
      solution: 'Verify API keys in Script Properties are correct and active'
    },
    {
      error: 'Gmail permission denied',
      cause: 'Gmail API not authorized',
      solution: 'Re-authorize Gmail in Apps Script: Run → Review permissions'
    },
    {
      error: 'Function not found',
      cause: 'Code not deployed or function name changed',
      solution: 'Run clasp push to deploy latest code'
    },
    {
      error: 'Exception: Rate limit exceeded',
      cause: 'Too many API calls too quickly',
      solution: 'Add delays between API calls or reduce batch size'
    },
    {
      error: 'Exception: Invalid email address',
      cause: 'Email format is invalid',
      solution: 'Check email addresses in source file are valid'
    },
    {
      error: 'Exception: Contact already exists',
      cause: 'Contact already in HubSpot',
      solution: 'This is normal - system should update existing contact'
    }
  ];
  
  commonErrors.forEach((err, i) => {
    console.log(`${i + 1}. Error: "${err.error}"`);
    console.log(`   Cause: ${err.cause}`);
    console.log(`   Solution: ${err.solution}\n`);
  });
  
  console.log('='.repeat(60) + '\n');
  console.log('📊 What to Look For in Logs\n');
  
  console.log('✅ Success Indicators:');
  console.log('   • "File processed: X leads"');
  console.log('   • "Contact created/updated in HubSpot"');
  console.log('   • "Email sent successfully"');
  console.log('   • "Sequence initialized"\n');
  
  console.log('❌ Failure Indicators:');
  console.log('   • Any "Exception:" messages');
  console.log('   • "Error:" or "Failed:" messages');
  console.log('   • API status codes: 400, 401, 403, 404, 500');
  console.log('   • "Permission denied" messages\n');
  
  console.log('='.repeat(60) + '\n');
  console.log('🔧 Debugging Steps\n');
  
  console.log('1. Enable Detailed Logging:');
  console.log('   → Add Logger.log() statements in Code.gs');
  console.log('   → Log at each step: file read, API calls, email send\n');
  
  console.log('2. Test Individual Functions:');
  console.log('   → Run checkFolderForNewFiles manually');
  console.log('   → Run sequenceManager() manually');
  console.log('   → Run sendPersonalizedEmail() with test data\n');
  
  console.log('3. Check Script Properties:');
  console.log('   → Project Settings → Script Properties');
  console.log('   → Verify all values are set correctly\n');
  
  console.log('4. Verify Trigger:');
  console.log('   → Triggers tab → Check trigger is active');
  console.log('   → Verify function name matches exactly\n');
  
  console.log('5. Test with Single Lead:');
  console.log('   → Create test file with just one lead');
  console.log('   → Upload to Drive folder');
  console.log('   → Monitor execution logs\n');
  
  // Save guide
  const guidePath = path.join(__dirname, '../apps-script-execution-guide.md');
  const guideContent = `# Apps Script Execution Logs Diagnosis Guide

## How to Check Execution Logs

1. Go to: https://script.google.com
2. Open your project
3. Click "Executions" tab
4. Find latest execution of checkFolderForNewFiles
5. Review logs for errors

## Common Errors

${commonErrors.map((err, i) => `
### ${i + 1}. ${err.error}

**Cause:** ${err.cause}

**Solution:** ${err.solution}
`).join('\n')}

## Success Indicators

- "File processed: X leads"
- "Contact created/updated in HubSpot"
- "Email sent successfully"
- "Sequence initialized"

## Failure Indicators

- "Exception:" messages
- "Error:" or "Failed:" messages
- API status codes: 400, 401, 403, 404, 500
- "Permission denied" messages
`;
  
  fs.writeFileSync(guidePath, guideContent);
  
  console.log('📄 Full guide saved to:');
  console.log(`   ${guidePath}\n`);
}

if (require.main === module) {
  generateDiagnosisGuide();
}

module.exports = { generateDiagnosisGuide };
