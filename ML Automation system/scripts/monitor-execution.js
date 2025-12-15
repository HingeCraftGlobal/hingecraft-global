/**
 * Real-Time Execution Monitor
 * Monitors Apps Script executions, HubSpot contacts, and email status
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
  magenta: '\x1b[0;35m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const testContact = {
  email: 'chandlerferguson319@gmail.com',
  company: 'Ferguson Ventures',
  leadType: 'B2B',
  templateSet: 'set_three_b2b'
};

/**
 * Execution Status Tracker
 */
const executionStatus = {
  phase1: {
    name: 'Initial Ingestion & Immediate Send',
    steps: [
      { step: 1, name: 'Trigger Fires', status: 'pending', verification: 'Apps Script Executions log' },
      { step: 2, name: 'File Scan', status: 'pending', verification: 'File detected in log' },
      { step: 3, name: 'Contact Creation', status: 'pending', verification: 'HubSpot contact exists' },
      { step: 4, name: 'Sequence Start', status: 'pending', verification: 'sequenceManager() called' },
      { step: 5, name: 'Email Sent', status: 'pending', verification: 'Gmail Sent folder' },
      { step: 6, name: 'Sequence Advanced', status: 'pending', verification: 'HubSpot step = 2' },
      { step: 7, name: 'Tracking Test', status: 'pending', verification: 'GA4 & HubSpot events' }
    ]
  },
  phase2: {
    name: '24-Hour Delay Validation',
    steps: [
      { step: 8, name: 'Timer Monitoring', status: 'pending', verification: 'Email 2 NOT sent' },
      { step: 9, name: 'Delay Verification', status: 'pending', verification: 'Step remains at 2' }
    ]
  },
  phase3: {
    name: 'Sequence Advancement',
    steps: [
      { step: 10, name: '24-Hour Wait', status: 'pending', verification: 'Timestamp passed' },
      { step: 11, name: 'Email 2 Sent', status: 'pending', verification: 'Email 2 in Sent folder' },
      { step: 12, name: 'Step Advanced', status: 'pending', verification: 'HubSpot step = 3' }
    ]
  }
};

/**
 * Display execution status
 */
function displayStatus() {
  log('\n🔍 REAL-TIME EXECUTION MONITOR', 'magenta');
  log('='.repeat(70), 'blue');
  log(`\n📧 Test Contact: ${testContact.email}`, 'cyan');
  log(`🏢 Company: ${testContact.company}`, 'cyan');
  log(`🎯 Template Set: ${testContact.templateSet}`, 'cyan');
  
  // Phase I
  log('\n📋 PHASE I: INITIAL INGESTION & IMMEDIATE SEND', 'yellow');
  log('-'.repeat(70), 'blue');
  executionStatus.phase1.steps.forEach(step => {
    const statusIcon = step.status === 'complete' ? '✅' : 
                      step.status === 'failed' ? '❌' : 
                      step.status === 'in_progress' ? '⏳' : '⏸️';
    const statusColor = step.status === 'complete' ? 'green' : 
                       step.status === 'failed' ? 'red' : 
                       step.status === 'in_progress' ? 'yellow' : 'blue';
    log(`${statusIcon} Step ${step.step}: ${step.name}`, statusColor);
    log(`   Verification: ${step.verification}`, 'blue');
  });
  
  // Phase II
  log('\n⏰ PHASE II: 24-HOUR DELAY VALIDATION', 'yellow');
  log('-'.repeat(70), 'blue');
  executionStatus.phase2.steps.forEach(step => {
    const statusIcon = step.status === 'complete' ? '✅' : 
                      step.status === 'failed' ? '❌' : 
                      step.status === 'in_progress' ? '⏳' : '⏸️';
    const statusColor = step.status === 'complete' ? 'green' : 
                       step.status === 'failed' ? 'red' : 
                       step.status === 'in_progress' ? 'yellow' : 'blue';
    log(`${statusIcon} Step ${step.step}: ${step.name}`, statusColor);
    log(`   Verification: ${step.verification}`, 'blue');
  });
  
  // Phase III
  log('\n🚀 PHASE III: SEQUENCE ADVANCEMENT', 'yellow');
  log('-'.repeat(70), 'blue');
  executionStatus.phase3.steps.forEach(step => {
    const statusIcon = step.status === 'complete' ? '✅' : 
                      step.status === 'failed' ? '❌' : 
                      step.status === 'in_progress' ? '⏳' : '⏸️';
    const statusColor = step.status === 'complete' ? 'green' : 
                       step.status === 'failed' ? 'red' : 
                       step.status === 'in_progress' ? 'yellow' : 'blue';
    log(`${statusIcon} Step ${step.step}: ${step.name}`, statusColor);
    log(`   Verification: ${step.verification}`, 'blue');
  });
  
  // Summary
  const totalSteps = executionStatus.phase1.steps.length + 
                     executionStatus.phase2.steps.length + 
                     executionStatus.phase3.steps.length;
  const completedSteps = [...executionStatus.phase1.steps, 
                           ...executionStatus.phase2.steps, 
                           ...executionStatus.phase3.steps]
                          .filter(s => s.status === 'complete').length;
  
  log('\n📊 EXECUTION SUMMARY', 'cyan');
  log('-'.repeat(70), 'blue');
  log(`Total Steps: ${totalSteps}`, 'blue');
  log(`Completed: ${completedSteps}`, completedSteps > 0 ? 'green' : 'yellow');
  log(`Pending: ${totalSteps - completedSteps}`, 'yellow');
  log(`Progress: ${Math.round((completedSteps / totalSteps) * 100)}%`, 'blue');
}

/**
 * Verification checklist
 */
function displayVerificationChecklist() {
  log('\n✅ VERIFICATION CHECKLIST', 'cyan');
  log('='.repeat(70), 'blue');
  
  log('\n📧 EMAIL VERIFICATION', 'yellow');
  log('  [ ] Check Gmail Sent folder for Email 1', 'blue');
  log('  [ ] Check chandlerferguson319@gmail.com inbox', 'blue');
  log('  [ ] Verify subject: "Partnership Opportunity: Let\'s Build Together"', 'blue');
  log('  [ ] Verify email contains tracking pixel', 'blue');
  log('  [ ] Verify email contains wrapped links', 'blue');
  
  log('\n📝 HUBSPOT VERIFICATION', 'yellow');
  log('  [ ] Contact exists: chandlerferguson319@gmail.com', 'blue');
  log('  [ ] automation_next_email_step = 2', 'blue');
  log('  [ ] automation_next_send_timestamp = Current time + 24 hours', 'blue');
  log('  [ ] automation_template_set = set_three_b2b', 'blue');
  log('  [ ] automation_lead_type = B2B', 'blue');
  log('  [ ] automation_emails_sent = 1', 'blue');
  log('  [ ] original_sheet_data_segment_1 = SaaS', 'blue');
  
  log('\n📊 TRACKING VERIFICATION', 'yellow');
  log('  [ ] Open email in inbox', 'blue');
  log('  [ ] HubSpot: total_emails_opened = 1', 'blue');
  log('  [ ] HubSpot: total_clicks = 1 (after clicking link)', 'blue');
  log('  [ ] GA4 Realtime: email_opened event', 'blue');
  log('  [ ] GA4 Realtime: link_clicked event', 'blue');
  
  log('\n🔍 EXECUTION LOG VERIFICATION', 'yellow');
  log('  [ ] Apps Script Executions tab shows successful run', 'blue');
  log('  [ ] Log shows: "✅ Email sent to chandlerferguson319@gmail.com"', 'blue');
  log('  [ ] Log shows: "✅ Sequence run complete: 1 emails sent/advanced"', 'blue');
}

/**
 * Quick action guide
 */
function displayQuickActions() {
  log('\n⚡ QUICK ACTION GUIDE', 'cyan');
  log('='.repeat(70), 'blue');
  
  log('\n1. CHECK APPS SCRIPT EXECUTIONS', 'yellow');
  log('   → Go to: https://script.google.com', 'blue');
  log('   → Click: Executions tab', 'blue');
  log('   → Look for: Latest checkFolderForNewFiles execution', 'blue');
  log('   → Verify: Status = Success (green checkmark)', 'blue');
  
  log('\n2. CHECK GMAIL SENT FOLDER', 'yellow');
  log('   → Go to: https://mail.google.com', 'blue');
  log('   → Click: Sent folder', 'blue');
  log('   → Look for: "Partnership Opportunity: Let\'s Build Together"', 'blue');
  log('   → Verify: Sent to chandlerferguson319@gmail.com', 'blue');
  
  log('\n3. CHECK INBOX', 'yellow');
  log('   → Go to: chandlerferguson319@gmail.com inbox', 'blue');
  log('   → Verify: Email 1 received', 'blue');
  log('   → Open: Email and check content', 'blue');
  
  log('\n4. CHECK HUBSPOT', 'yellow');
  log('   → Go to: https://app.hubspot.com', 'blue');
  log('   → Search: chandlerferguson319@gmail.com', 'blue');
  log('   → Verify: Contact exists and properties are set', 'blue');
  
  log('\n5. TEST TRACKING', 'yellow');
  log('   → Open: Email in inbox (triggers pixel)', 'blue');
  log('   → Click: Any link in email (triggers click)', 'blue');
  log('   → Verify: HubSpot properties updated', 'blue');
  log('   → Verify: GA4 Realtime shows events', 'blue');
}

/**
 * Expected timeline
 */
function displayTimeline() {
  log('\n⏰ EXPECTED TIMELINE', 'cyan');
  log('='.repeat(70), 'blue');
  
  log('\nTime 0:00 (Immediate)', 'yellow');
  log('  ✅ File detected', 'green');
  log('  ✅ Contact created in HubSpot', 'green');
  log('  ✅ Email 1 sent', 'green');
  log('  ✅ Step advanced: 1 → 2', 'green');
  log('  ✅ Timestamp set: Now + 24 hours', 'green');
  
  log('\nTime 0:05 to 24:00 (Waiting Period)', 'yellow');
  log('  ⏳ Timer runs every 5 minutes', 'blue');
  log('  ⏳ Email 2 NOT sent', 'blue');
  log('  ⏳ Step remains at 2', 'blue');
  log('  ⏳ Execution logs show: "Found 0 contacts"', 'blue');
  
  log('\nTime ≈ 24:05 (After 24 Hours)', 'yellow');
  log('  ✅ Contact identified as eligible', 'green');
  log('  ✅ Email 2 sent', 'green');
  log('  ✅ Step advanced: 2 → 3', 'green');
  log('  ✅ Timestamp updated: Now + 24 hours', 'green');
  
  log('\nTime ≈ 48:05 (After 48 Hours)', 'yellow');
  log('  ✅ Email 3 sent', 'green');
  log('  ✅ Step advanced: 3 → 4', 'green');
  
  log('\nTime ≈ 72:05 (After 72 Hours)', 'yellow');
  log('  ✅ Email 4 sent', 'green');
  log('  ✅ Step advanced: 4 → 5', 'green');
  
  log('\nTime ≈ 96:05 (After 96 Hours)', 'yellow');
  log('  ✅ Email 5 sent (final)', 'green');
  log('  ✅ Step advanced: 5 → 6 (completed)', 'green');
}

/**
 * Troubleshooting guide
 */
function displayTroubleshooting() {
  log('\n🐛 TROUBLESHOOTING GUIDE', 'cyan');
  log('='.repeat(70), 'blue');
  
  log('\nIssue: Email not received', 'yellow');
  log('  → Check: Gmail Sent folder (may be in Sent, not Inbox)', 'blue');
  log('  → Check: Spam folder', 'blue');
  log('  → Check: Execution log for errors', 'blue');
  log('  → Check: Gmail sending limits', 'blue');
  
  log('\nIssue: Contact not created', 'yellow');
  log('  → Check: Execution log for errors', 'blue');
  log('  → Check: HubSpot API token', 'blue');
  log('  → Check: AnyMail API (if enrichment fails)', 'blue');
  log('  → Check: File format (CSV vs XLSX)', 'blue');
  
  log('\nIssue: Tracking not working', 'yellow');
  log('  → Check: Web App deployed', 'blue');
  log('  → Check: TRACKING_ENDPOINT_URL in Script Properties', 'blue');
  log('  → Check: GA4 properties in Script Properties', 'blue');
  log('  → Check: doGet() execution logs', 'blue');
  
  log('\nIssue: Wrong template set', 'yellow');
  log('  → Check: Lead ID format (B2B-001 = B2B)', 'blue');
  log('  → Check: determineLeadTypeFromRow() logic', 'blue');
  log('  → Check: HubSpot automation_template_set property', 'blue');
}

/**
 * Main monitor function
 */
function main() {
  log('\n🚀 FULL SYSTEM EXECUTION MONITOR', 'magenta');
  log('='.repeat(70), 'blue');
  log(`\n📅 Started: ${new Date().toLocaleString()}`, 'cyan');
  log(`📧 Test Contact: ${testContact.email}`, 'cyan');
  
  displayStatus();
  displayVerificationChecklist();
  displayQuickActions();
  displayTimeline();
  displayTroubleshooting();
  
  log('\n📋 NEXT STEPS', 'cyan');
  log('='.repeat(70), 'blue');
  log('\n1. Follow the Quick Action Guide above', 'blue');
  log('2. Use the Verification Checklist to verify each step', 'blue');
  log('3. Monitor the Timeline to track progress', 'blue');
  log('4. Report any issues using the Troubleshooting Guide', 'blue');
  
  log('\n✅ MONITORING GUIDE READY', 'green');
  log('\nUse this guide to track the execution in real-time!', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main, executionStatus, displayStatus };
