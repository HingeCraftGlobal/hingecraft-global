/**
 * Verification Script for Manual Setup Tasks
 * Checks what can be verified programmatically and provides checklist for manual tasks
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkCodeForProperty(code, propertyName, description) {
  const hasProperty = code.includes(propertyName);
  if (hasProperty) {
    log(`✅ ${description} (found in code)`, 'green');
    return true;
  } else {
    log(`⚠️  ${description} (not found in code)`, 'yellow');
    return false;
  }
}

function main() {
  log('\n🔍 VERIFYING MANUAL SETUP TASKS\n', 'cyan');
  log('=' .repeat(60), 'blue');
  
  const rootDir = path.join(__dirname, '..');
  const gasDir = path.join(rootDir, 'google-apps-script');
  
  let checks = {
    codeFiles: 0,
    trackingSystem: 0,
    webAppUrl: 0,
    total: 0
  };
  
  // Check 1: Code Files
  log('\n📁 CODE FILES', 'cyan');
  log('-'.repeat(60), 'blue');
  
  const codeFiles = [
    { file: 'Code.gs', desc: 'Main automation code' },
    { file: 'Tracking.gs', desc: 'GA4 tracking system' },
    { file: 'DraftTracking.gs', desc: 'Draft tracking system' },
    { file: 'HubSpotSetup.gs', desc: 'HubSpot property setup' },
    { file: 'TEST_CONFIG.gs', desc: 'Test configuration' }
  ];
  
  codeFiles.forEach(({ file, desc }) => {
    if (checkFile(path.join(gasDir, file), `${file} - ${desc}`)) {
      checks.codeFiles++;
    }
    checks.total++;
  });
  
  // Check 2: Tracking System Files
  log('\n📊 TRACKING SYSTEM', 'cyan');
  log('-'.repeat(60), 'blue');
  
  const trackingDir = path.join(rootDir, 'tracking-system');
  const trackingFiles = [
    { file: 'README.md', desc: 'Tracking documentation' },
    { file: 'setup-tracking.sh', desc: 'Setup script' },
    { file: '.gitignore', desc: 'Git ignore for .env' }
  ];
  
  trackingFiles.forEach(({ file, desc }) => {
    if (checkFile(path.join(trackingDir, file), `${file} - ${desc}`)) {
      checks.trackingSystem++;
    }
    checks.total++;
  });
  
  // Check 3: Web App URL in Code
  log('\n🔗 WEB APP URL INTEGRATION', 'cyan');
  log('-'.repeat(60), 'blue');
  
  const trackingGsPath = path.join(gasDir, 'Tracking.gs');
  if (fs.existsSync(trackingGsPath)) {
    const trackingCode = fs.readFileSync(trackingGsPath, 'utf8');
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec';
    
    if (trackingCode.includes(webAppUrl)) {
      log(`✅ Web App URL found in Tracking.gs`, 'green');
      checks.webAppUrl++;
    } else {
      log(`⚠️  Web App URL not found in Tracking.gs`, 'yellow');
    }
    checks.total++;
    
    // Check for GA4 config function
    if (trackingCode.includes('getGA4Config')) {
      log(`✅ GA4 config function exists`, 'green');
      checks.webAppUrl++;
    }
    checks.total++;
  }
  
  // Check 4: Draft Tracking Integration
  log('\n📧 DRAFT TRACKING INTEGRATION', 'cyan');
  log('-'.repeat(60), 'blue');
  
  const codeGsPath = path.join(gasDir, 'Code.gs');
  if (fs.existsSync(codeGsPath)) {
    const codeContent = fs.readFileSync(codeGsPath, 'utf8');
    
    if (codeContent.includes('scanDraftsForOutbound')) {
      log(`✅ scanDraftsForOutbound() integrated in Code.gs`, 'green');
      checks.webAppUrl++;
    } else {
      log(`❌ scanDraftsForOutbound() not found in Code.gs`, 'red');
    }
    checks.total++;
  }
  
  // Check 5: HubSpot Properties
  log('\n🏢 HUBSPOT PROPERTIES', 'cyan');
  log('-'.repeat(60), 'blue');
  
  const hubspotSetupPath = path.join(gasDir, 'HubSpotSetup.gs');
  if (fs.existsSync(hubspotSetupPath)) {
    const hubspotCode = fs.readFileSync(hubspotSetupPath, 'utf8');
    
    const requiredProperties = [
      'total_emails_opened',
      'total_clicks',
      'sequence_replied',
      'last_email_opened_at',
      'last_link_clicked_at'
    ];
    
    requiredProperties.forEach(prop => {
      if (hubspotCode.includes(prop)) {
        log(`✅ Property: ${prop}`, 'green');
        checks.webAppUrl++;
      } else {
        log(`⚠️  Property: ${prop} (not found)`, 'yellow');
      }
      checks.total++;
    });
  }
  
  // Summary
  log('\n📊 VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(60), 'blue');
  log(`Code Files: ${checks.codeFiles}/5`, checks.codeFiles === 5 ? 'green' : 'yellow');
  log(`Tracking System: ${checks.trackingSystem}/3`, checks.trackingSystem === 3 ? 'green' : 'yellow');
  log(`Web App & Integration: ${checks.webAppUrl}/7`, checks.webAppUrl === 7 ? 'green' : 'yellow');
  log(`Total Checks: ${checks.total}`, 'blue');
  
  // Manual Tasks Checklist
  log('\n⚠️  MANUAL TASKS CHECKLIST', 'yellow');
  log('='.repeat(60), 'blue');
  log('\nThese tasks CANNOT be automated and MUST be done manually:\n', 'yellow');
  
  const manualTasks = [
    {
      task: 'Add TRACKING_ENDPOINT_URL to Script Properties',
      steps: [
        '1. Go to: https://script.google.com',
        '2. Open your project',
        '3. Project Settings (⚙️) → Script Properties',
        '4. Add property:',
        '   - Property: TRACKING_ENDPOINT_URL',
        '   - Value: https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec'
      ],
      critical: true
    },
    {
      task: 'Add GA4 Properties to Script Properties',
      steps: [
        '1. Same location: Script Properties',
        '2. Add these 4 properties:',
        '   - GA4_MEASUREMENT_ID = G-QF5H2Q291T',
        '   - GA4_API_SECRET = cJH76-IHQteQx6DKaiPkGA',
        '   - GA4_STREAM_ID = 13142410458',
        '   - GA4_STREAM_URL = https://hingecraft-global.ai'
      ],
      critical: true
    },
    {
      task: 'Run createHubSpotProperties() Function',
      steps: [
        '1. In Apps Script Editor',
        '2. Select function: createHubSpotProperties',
        '3. Click Run (▶️)',
        '4. Check execution log for success'
      ],
      critical: true
    },
    {
      task: 'Set Up Time-Driven Trigger',
      steps: [
        '1. Apps Script → Triggers tab (⏰)',
        '2. Delete old onNewFileAdded triggers',
        '3. Add Trigger → Configure:',
        '   - Function: checkFolderForNewFiles',
        '   - Event: Time-driven',
        '   - Type: Minutes timer',
        '   - Frequency: Every 5 minutes',
        '4. Save'
      ],
      critical: true
    },
    {
      task: 'Create Gmail Label (Optional - Auto-created)',
      steps: [
        '1. Go to Gmail',
        '2. Create label: "Tracked_Outbound"',
        '   (OR script will auto-create on first run)'
      ],
      critical: false
    }
  ];
  
  manualTasks.forEach((task, index) => {
    log(`\n${index + 1}. ${task.task} ${task.critical ? '(CRITICAL)' : '(OPTIONAL)'}`, task.critical ? 'red' : 'yellow');
    task.steps.forEach(step => {
      log(`   ${step}`, 'blue');
    });
  });
  
  log('\n' + '='.repeat(60), 'blue');
  log('\n✅ CODE VERIFICATION COMPLETE', 'green');
  log('⚠️  MANUAL TASKS MUST BE COMPLETED IN APPS SCRIPT UI\n', 'yellow');
  
  return {
    codeFiles: checks.codeFiles,
    trackingSystem: checks.trackingSystem,
    webAppUrl: checks.webAppUrl,
    total: checks.total,
    allCodeComplete: checks.codeFiles === 5 && checks.trackingSystem === 3 && checks.webAppUrl >= 6
  };
}

if (require.main === module) {
  main();
}

module.exports = { main };
