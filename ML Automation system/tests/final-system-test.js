/**
 * Final System Test - Comprehensive Verification
 * Tests all phases: Initial ingestion, 24-hour delay, and sequence advancement
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[0;32m',
  red: '\x1b[0;31m',
  yellow: '\x1b[0;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  magenta: '\x1b[0;35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const testResults = {
  phase1: { steps: [], passed: 0, failed: 0 },
  phase2: { steps: [], passed: 0, failed: 0 },
  phase3: { steps: [], passed: 0, failed: 0 },
  overall: { passed: 0, failed: 0, total: 0 }
};

/**
 * Phase I: Initial Ingestion and Immediate Send
 */
function testPhase1() {
  log('\n📋 PHASE I: INITIAL INGESTION AND IMMEDIATE SEND', 'cyan');
  log('='.repeat(60), 'blue');
  
  log('\nStep 1: Set Trigger', 'yellow');
  log('Action: Go to Apps Script → Triggers tab', 'blue');
  log('Set: checkFolderForNewFiles - Time-driven - Every 5 minutes', 'blue');
  log('Expected: Script executes automatically', 'blue');
  log('Verification: Check Apps Script Executions log', 'blue');
  
  const step1 = {
    step: 1,
    name: 'Set Trigger',
    action: 'Set checkFolderForNewFiles to run every 5 minutes',
    expected: 'Script executes automatically',
    verification: 'Check Apps Script Executions log for successful run',
    status: 'pending'
  };
  
  log('\nStep 2: Create Test File', 'yellow');
  log('Action: Drop test_contact_1.xlsx into monitored Drive folder', 'blue');
  log('Wait: 1-5 minutes for timer to pick it up', 'blue');
  log('Expected:', 'blue');
  log('  (a) Contact ingested', 'blue');
  log('  (b) automation_next_email_step = 1', 'blue');
  log('  (c) sequenceManager() called', 'blue');
  log('  (d) Email 1 sent immediately', 'blue');
  log('Verification 1: Check Gmail Sent folder for Email 1', 'blue');
  log('Verification 2: Check HubSpot - automation_next_email_step = 2', 'blue');
  log('Verification 3: automation_next_send_timestamp = Now + 24 hours', 'blue');
  
  const step2 = {
    step: 2,
    name: 'Create Test File',
    action: 'Drop test file and wait for processing',
    expected: 'Email 1 sent immediately, step set to 2, timestamp set',
    verification: [
      'Gmail Sent folder contains Email 1',
      'HubSpot: automation_next_email_step = 2',
      'HubSpot: automation_next_send_timestamp = Now + 24 hours'
    ],
    status: 'pending'
  };
  
  log('\nStep 3: Test Tracking', 'yellow');
  log('Action: Open Email 1 in external inbox, click a link', 'blue');
  log('Expected: Hit logged to GA4 and HubSpot', 'blue');
  log('Verification 1: HubSpot - total_emails_opened incremented', 'blue');
  log('Verification 2: HubSpot - total_clicks incremented', 'blue');
  log('Verification 3: GA4 Realtime - email_opened event', 'blue');
  log('Verification 4: GA4 Realtime - link_clicked event', 'blue');
  
  const step3 = {
    step: 3,
    name: 'Test Tracking',
    action: 'Open email and click link',
    expected: 'Tracking events logged to GA4 and HubSpot',
    verification: [
      'HubSpot: total_emails_opened incremented',
      'HubSpot: total_clicks incremented',
      'GA4: email_opened event',
      'GA4: link_clicked event'
    ],
    status: 'pending'
  };
  
  testResults.phase1.steps = [step1, step2, step3];
  
  return testResults.phase1;
}

/**
 * Phase II: Validating 24-Hour Delay
 */
function testPhase2() {
  log('\n📋 PHASE II: VALIDATING 24-HOUR DELAY', 'cyan');
  log('='.repeat(60), 'blue');
  
  log('\nStep 4: Observe Timer', 'yellow');
  log('Action: Let trigger run every 5 minutes for several hours', 'blue');
  log('Expected: Script runs but does NOT send Email 2', 'blue');
  log('Verification: Execution log shows "Skipping: Not yet 24 hours"', 'blue');
  
  const step4 = {
    step: 4,
    name: 'Observe Timer',
    action: 'Monitor trigger runs for several hours',
    expected: 'Email 2 NOT sent, skipping messages in log',
    verification: 'Execution log shows skipping messages',
    status: 'pending'
  };
  
  testResults.phase2.steps = [step4];
  
  return testResults.phase2;
}

/**
 * Phase III: Sequence Advancement
 */
function testPhase3() {
  log('\n📋 PHASE III: SEQUENCE ADVANCEMENT', 'cyan');
  log('='.repeat(60), 'blue');
  
  log('\nStep 5: Wait 24 Hours', 'yellow');
  log('Action: Wait until next timer run after 24 hours passed', 'blue');
  log('Expected: Contact identified as eligible (Current Time > Timestamp)', 'blue');
  log('Verification: Execution log shows successful run WITHOUT skipping', 'blue');
  
  const step5 = {
    step: 5,
    name: 'Wait 24 Hours',
    action: 'Wait for 24-hour timestamp to pass',
    expected: 'Contact identified as eligible',
    verification: 'Execution log shows successful run without skipping',
    status: 'pending'
  };
  
  log('\nStep 6: Send Email 2', 'yellow');
  log('Action: sequenceManager() executes send logic', 'blue');
  log('Expected: Email 2 sent, contact record updated', 'blue');
  log('Verification 1: Gmail Sent folder contains Email 2', 'blue');
  log('Verification 2: HubSpot - automation_next_email_step = 3', 'blue');
  log('Verification 3: HubSpot - automation_next_send_timestamp = Now + 24 hours', 'blue');
  
  const step6 = {
    step: 6,
    name: 'Send Email 2',
    action: 'sequenceManager() sends Email 2',
    expected: 'Email 2 sent, step advanced to 3, timestamp updated',
    verification: [
      'Gmail Sent folder contains Email 2',
      'HubSpot: automation_next_email_step = 3',
      'HubSpot: automation_next_send_timestamp = Now + 24 hours'
    ],
    status: 'pending'
  };
  
  testResults.phase3.steps = [step5, step6];
  
  return testResults.phase3;
}

/**
 * Generate test file template
 */
function generateTestFileTemplate() {
  log('\n📄 GENERATING TEST FILE TEMPLATE', 'cyan');
  log('='.repeat(60), 'blue');
  
  const testData = {
    headers: [
      'Organization Name',
      'Website URL',
      'Primary Contact Email',
      'Lead ID',
      'City',
      'State',
      'Focus Areas',
      'Target Age Range',
      'Annual Budget Range',
      'Partnership Likelihood'
    ],
    sampleRow: [
      'Test Organization',
      'https://testorg.com',
      'test@testorg.com',
      'B2B-001',
      'San Francisco',
      'CA',
      'Technology, Innovation',
      '25-45',
      '$500K-1M',
      'High'
    ]
  };
  
  // Generate CSV format
  const csvContent = [
    testData.headers.join(','),
    testData.sampleRow.join(',')
  ].join('\n');
  
  const testFilePath = path.join(__dirname, '..', 'test_contact_1.csv');
  fs.writeFileSync(testFilePath, csvContent);
  
  log(`✅ Test file created: ${testFilePath}`, 'green');
  log('\nTest File Contents:', 'yellow');
  log(csvContent, 'blue');
  
  return testFilePath;
}

/**
 * Generate verification checklist
 */
function generateVerificationChecklist() {
  log('\n✅ VERIFICATION CHECKLIST', 'cyan');
  log('='.repeat(60), 'blue');
  
  const checklist = {
    phase1: {
      trigger: {
        action: 'Set checkFolderForNewFiles trigger to Every 5 minutes',
        verification: 'Apps Script Executions log shows successful run',
        status: 'pending'
      },
      testFile: {
        action: 'Upload test_contact_1.csv to monitored Drive folder',
        verification: [
          'Gmail Sent folder: Email 1 present',
          'HubSpot: Contact created',
          'HubSpot: automation_next_email_step = 2',
          'HubSpot: automation_next_send_timestamp set'
        ],
        status: 'pending'
      },
      tracking: {
        action: 'Open Email 1, click link',
        verification: [
          'HubSpot: total_emails_opened > 0',
          'HubSpot: total_clicks > 0',
          'GA4 Realtime: email_opened event',
          'GA4 Realtime: link_clicked event'
        ],
        status: 'pending'
      }
    },
    phase2: {
      delay: {
        action: 'Monitor for several hours',
        verification: 'Execution log shows skipping messages',
        status: 'pending'
      }
    },
    phase3: {
      advancement: {
        action: 'Wait 24 hours, monitor next run',
        verification: [
          'Execution log: No skipping message',
          'Gmail Sent folder: Email 2 present',
          'HubSpot: automation_next_email_step = 3',
          'HubSpot: automation_next_send_timestamp updated'
        ],
        status: 'pending'
      }
    }
  };
  
  return checklist;
}

/**
 * Main test function
 */
function main() {
  log('\n🧪 FINAL SYSTEM TEST - COMPREHENSIVE VERIFICATION', 'magenta');
  log('='.repeat(60), 'blue');
  
  // Generate test phases
  const phase1 = testPhase1();
  const phase2 = testPhase2();
  const phase3 = testPhase3();
  
  // Generate test file
  const testFilePath = generateTestFileTemplate();
  
  // Generate checklist
  const checklist = generateVerificationChecklist();
  
  // Save test results
  const reportPath = path.join(__dirname, '..', 'final-system-test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    phases: {
      phase1: testResults.phase1,
      phase2: testResults.phase2,
      phase3: testResults.phase3
    },
    checklist: checklist,
    testFile: testFilePath
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('\n📊 TEST PLAN SUMMARY', 'cyan');
  log('='.repeat(60), 'blue');
  log(`Phase I Steps: ${phase1.steps.length}`, 'blue');
  log(`Phase II Steps: ${phase2.steps.length}`, 'blue');
  log(`Phase III Steps: ${phase3.steps.length}`, 'blue');
  log(`Total Steps: ${phase1.steps.length + phase2.steps.length + phase3.steps.length}`, 'blue');
  log(`\n📄 Test report saved to: ${reportPath}`, 'green');
  log(`📄 Test file created: ${testFilePath}`, 'green');
  
  log('\n✅ TEST PLAN GENERATED', 'green');
  log('\nNext Steps:', 'yellow');
  log('1. Review the test plan above', 'blue');
  log('2. Set up the trigger in Apps Script', 'blue');
  log('3. Upload test_contact_1.csv to Drive folder', 'blue');
  log('4. Monitor execution and verify each step', 'blue');
  
  return report;
}

if (require.main === module) {
  main();
}

module.exports = { main, testPhase1, testPhase2, testPhase3, generateTestFileTemplate };
