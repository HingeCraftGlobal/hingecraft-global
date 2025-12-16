#!/usr/bin/env node

/**
 * Diagnose Email Send Issue
 * 
 * Comprehensive diagnosis of why email is not sending
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load .env if dotenv is available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed, use environment variables directly
}

const DIAGNOSIS = {
  issues: [],
  recommendations: [],
  nextSteps: []
};

function addIssue(component, problem, solution) {
  DIAGNOSIS.issues.push({ component, problem, solution });
}

function addRecommendation(rec) {
  DIAGNOSIS.recommendations.push(rec);
}

function addNextStep(step) {
  DIAGNOSIS.nextSteps.push(step);
}

async function diagnoseComponent(component, testFn) {
  console.log(`\n🔍 Diagnosing: ${component}\n`);
  try {
    const result = await testFn();
    return result;
  } catch (error) {
    console.error(`❌ Error diagnosing ${component}:`, error.message);
    return false;
  }
}

// Component 1: File Processing
async function diagnoseFileProcessing() {
  const testFile = path.join(__dirname, '../test_chandler_tracking.csv');
  
  if (!fs.existsSync(testFile)) {
    addIssue('File Processing', 'Test file not found', 'Create test_chandler_tracking.csv');
    return false;
  }
  
  const content = fs.readFileSync(testFile, 'utf8');
  if (!content.includes('chandlerferguson319@gmail.com')) {
    addIssue('File Processing', 'Test file missing email', 'Add email to test file');
    return false;
  }
  
  console.log('✅ Test file exists and contains email');
  return true;
}

// Component 2: AnyMail Enrichment
async function diagnoseAnyMailEnrichment() {
  if (!process.env.ANYMAIL_API_KEY) {
    addIssue('AnyMail Enrichment', 'API key not set', 'Add ANYMAIL_API_KEY to Script Properties');
    addRecommendation('System will use fallback (source data)');
    return false;
  }
  
  try {
    const response = await fetch('https://api.anymailfinder.com/api/v4/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANYMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain: 'test.com', name: 'Test' })
    });
    
    if (response.ok || response.status === 400) {
      console.log('✅ AnyMail API connection successful');
      return true;
    } else {
      addIssue('AnyMail Enrichment', `API error: ${response.status}`, 'Check API key or use fallback');
      addRecommendation('Fallback will use source data directly');
      return false;
    }
  } catch (error) {
    addIssue('AnyMail Enrichment', `Connection failed: ${error.message}`, 'Check API key or use fallback');
    addRecommendation('Fallback will use source data directly');
    return false;
  }
}

// Component 3: HubSpot Contact Creation
async function diagnoseHubSpotContactCreation() {
  if (!process.env.HUBSPOT_TOKEN) {
    addIssue('HubSpot Contact Creation', 'HUBSPOT_TOKEN not set', 'Add HUBSPOT_TOKEN to Script Properties');
    return false;
  }
  
  try {
    // Test contact creation
    const testContact = {
      properties: {
        email: 'test-diagnosis@example.com',
        firstname: 'Test',
        lastname: 'Diagnosis'
      }
    };
    
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContact)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HubSpot contact creation successful');
      
      // Clean up test contact
      if (data.id) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
          }
        });
      }
      
      return true;
    } else {
      const errorText = await response.text();
      addIssue('HubSpot Contact Creation', `API error: ${response.status}`, `Check token and permissions: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    addIssue('HubSpot Contact Creation', `Connection failed: ${error.message}`, 'Check HUBSPOT_TOKEN and network');
    return false;
  }
}

// Component 4: Sequence Manager
async function diagnoseSequenceManager() {
  if (!process.env.HUBSPOT_TOKEN) {
    addIssue('Sequence Manager', 'HUBSPOT_TOKEN not set', 'Add HUBSPOT_TOKEN to Script Properties');
    return false;
  }
  
  try {
    // Test Search API (used by sequence manager)
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: 'chandlerferguson319@gmail.com'
        }]
      }],
      properties: ['email', 'automation_next_email_step', 'automation_next_send_timestamp'],
      limit: 1
    };
    
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HubSpot Search API working');
      
      if (data.results && data.results.length > 0) {
        const contact = data.results[0];
        console.log(`✅ Contact found: ${contact.properties.email}`);
        
        if (!contact.properties.automation_next_email_step) {
          addIssue('Sequence Manager', 'Contact missing automation_next_email_step', 'Run createHubSpotProperties() in Apps Script');
        }
        
        if (!contact.properties.automation_next_send_timestamp) {
          addIssue('Sequence Manager', 'Contact missing automation_next_send_timestamp', 'Run createHubSpotProperties() in Apps Script');
        }
      } else {
        addIssue('Sequence Manager', 'Contact not found in HubSpot', 'Upload test file and wait for processing');
        addRecommendation('Contact may not have been created yet');
      }
      
      return true;
    } else {
      const errorText = await response.text();
      addIssue('Sequence Manager', `Search API error: ${response.status}`, `Check token: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    addIssue('Sequence Manager', `Connection failed: ${error.message}`, 'Check HUBSPOT_TOKEN and network');
    return false;
  }
}

// Component 5: Template Loading
async function diagnoseTemplateLoading() {
  console.log('⚠️  Template loading cannot be tested via API');
  addRecommendation('Check Apps Script execution logs for template errors');
  addRecommendation('Verify TEMPLATE_DB_FILE_ID in Script Properties');
  addRecommendation('Ensure template exists for set_three_b2b, step 1');
  return true; // Assume OK, check logs
}

// Component 6: Gmail Sending
async function diagnoseGmailSending() {
  if (!process.env.GMAIL_FROM_ADDRESS) {
    addIssue('Gmail Sending', 'GMAIL_FROM_ADDRESS not set', 'Add GMAIL_FROM_ADDRESS to Script Properties');
    return false;
  }
  
  console.log(`✅ FROM address configured: ${process.env.GMAIL_FROM_ADDRESS}`);
  addRecommendation('Gmail permissions must be granted in Apps Script UI');
  addRecommendation('Run any Gmail function to trigger permission request');
  addRecommendation('Verify FROM address is authorized in Gmail');
  
  return true; // Assume OK, check permissions
}

// Component 7: Apps Script Execution
async function diagnoseAppsScriptExecution() {
  console.log('⚠️  Apps Script execution must be checked manually');
  addNextStep('1. Go to: https://script.google.com');
  addNextStep('2. Open your project');
  addNextStep('3. Go to: Executions tab');
  addNextStep('4. Find latest checkFolderForNewFiles execution');
  addNextStep('5. Review execution log for errors');
  
  return true; // Manual check
}

// Generate Diagnosis Report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Email Send Issue Diagnosis');
  console.log('='.repeat(60) + '\n');
  
  if (DIAGNOSIS.issues.length === 0) {
    console.log('✅ No critical issues found in automated tests');
    console.log('⚠️  Check Apps Script execution logs for specific errors\n');
  } else {
    console.log(`❌ Found ${DIAGNOSIS.issues.length} issue(s):\n`);
    DIAGNOSIS.issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.component}`);
      console.log(`   Problem: ${issue.problem}`);
      console.log(`   Solution: ${issue.solution}\n`);
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
      console.log(`${step}`);
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../email-send-diagnosis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    diagnosis: DIAGNOSIS
  }, null, 2));
  
  console.log('📄 Full diagnosis report saved to:');
  console.log(`   ${reportPath}\n`);
}

// Main
async function main() {
  console.log('🔍 Diagnose Email Send Issue\n');
  console.log('='.repeat(60) + '\n');
  
  // Diagnose each component
  await diagnoseComponent('File Processing', diagnoseFileProcessing);
  await diagnoseComponent('AnyMail Enrichment', diagnoseAnyMailEnrichment);
  await diagnoseComponent('HubSpot Contact Creation', diagnoseHubSpotContactCreation);
  await diagnoseComponent('Sequence Manager', diagnoseSequenceManager);
  await diagnoseComponent('Template Loading', diagnoseTemplateLoading);
  await diagnoseComponent('Gmail Sending', diagnoseGmailSending);
  await diagnoseComponent('Apps Script Execution', diagnoseAppsScriptExecution);
  
  // Generate report
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnoseEmailSendIssue: main };
