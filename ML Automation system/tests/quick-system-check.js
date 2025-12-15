/**
 * Quick System Check - No Database Required
 * Verifies configuration and service availability
 */

require('dotenv').config();
const config = require('../config/api_keys');
const fs = require('fs');
const path = require('path');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, condition, message = '') {
  if (condition) {
    log(`✅ ${name}`, 'green');
    if (message) log(`   ${message}`, 'reset');
    results.passed.push(name);
  } else {
    log(`❌ ${name}`, 'red');
    if (message) log(`   ${message}`, 'reset');
    results.failed.push(name);
  }
}

function warn(name, message = '') {
  log(`⚠️  ${name}`, 'yellow');
  if (message) log(`   ${message}`, 'reset');
  results.warnings.push(name);
}

console.log('\n' + '='.repeat(60));
log('🚀 Quick System Check', 'cyan');
console.log('='.repeat(60) + '\n');

// 1. Configuration Check
log('1. Configuration', 'cyan');
test('Drive Folder ID', config.google.driveFolderId === '1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF', 
  `Current: ${config.google.driveFolderId}`);
test('AnyMail API Key Updated', config.anymail.apiKey === 'pRUtyDRHSPageC2jHGbnWGpD',
  `Current: ${config.anymail.apiKey}`);
test('HubSpot Portal ID', !!config.hubspot.portalId, config.hubspot.portalId);
test('HubSpot API Key', !!config.hubspot.apiKey, 'Configured');
test('Gmail From Address', !!config.email.fromAddress, config.email.fromAddress);
test('App Port', !!config.app.port, String(config.app.port));

// 2. File Structure Check
log('\n2. File Structure', 'cyan');
const requiredFiles = [
  'src/index.js',
  'src/orchestrator.js',
  'src/services/googleDrive.js',
  'src/services/hubspot.js',
  'src/services/gmail.js',
  'src/services/anymail.js',
  'config/api_keys.js'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  test(`File: ${file}`, fs.existsSync(filePath));
}

// 3. Google Apps Script Check
log('\n3. Google Apps Script', 'cyan');
const gasDir = path.join(__dirname, '..', 'google-apps-script');
if (fs.existsSync(gasDir)) {
  test('Google Apps Script Directory', true);
  
  const gasFiles = ['Code.gs', 'Templates.gs', 'HubSpotSetup.gs', 'appsscript.json'];
  for (const file of gasFiles) {
    const filePath = path.join(gasDir, file);
    if (fs.existsSync(filePath)) {
      test(`GAS File: ${file}`, true);
    } else {
      // Check if file exists with different case or location
      const files = fs.readdirSync(gasDir);
      const found = files.find(f => f.toLowerCase() === file.toLowerCase());
      if (found) {
        test(`GAS File: ${file}`, true, `Found as: ${found}`);
      } else {
        warn(`GAS File: ${file}`, 'Not found in directory');
      }
    }
  }
  
  // Check .clasp.json
  const claspJson = path.join(gasDir, '.clasp.json');
  if (fs.existsSync(claspJson)) {
    try {
      const claspConfig = JSON.parse(fs.readFileSync(claspJson, 'utf8'));
      test('Script ID Configured', !!claspConfig.scriptId, claspConfig.scriptId);
    } catch (error) {
      warn('.clasp.json', 'Could not parse');
    }
  } else {
    warn('.clasp.json', 'Not found');
  }
} else {
  warn('Google Apps Script Directory', 'Not found');
}

// 4. Service Modules Check
log('\n4. Service Modules', 'cyan');
try {
  const googleDrive = require('../src/services/googleDrive');
  test('Google Drive Service', !!googleDrive);
} catch (error) {
  warn('Google Drive Service', error.message);
}

try {
  const hubspot = require('../src/services/hubspot');
  test('HubSpot Service', !!hubspot);
  test('HubSpot testConnection Method', typeof hubspot.testConnection === 'function');
} catch (error) {
  warn('HubSpot Service', error.message);
}

try {
  const gmail = require('../src/services/gmail');
  test('Gmail Service', !!gmail);
} catch (error) {
  warn('Gmail Service', error.message);
}

try {
  const anymail = require('../src/services/anymail');
  test('AnyMail Service', !!anymail);
} catch (error) {
  warn('AnyMail Service', error.message);
}

// 5. Configuration Values
log('\n5. Configuration Values', 'cyan');
test('OAuth Client ID', !!config.google.clientId);
test('OAuth Client Secret', !!config.google.clientSecret);
test('OAuth Scopes', Array.isArray(config.google.scopes) && config.google.scopes.length > 0,
  `${config.google.scopes.length} scopes configured`);

// Summary
console.log('\n' + '='.repeat(60));
log('📊 Summary', 'cyan');
console.log('='.repeat(60));
log(`Total Tests: ${results.passed.length + results.failed.length + results.warnings.length}`);
log(`Passed: ${results.passed.length}`, 'green');
log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');

const passRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1);
log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');

if (results.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  results.failed.forEach(test => log(`   - ${test}`, 'red'));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  results.warnings.forEach(test => log(`   - ${test}`, 'yellow'));
}

console.log('\n' + '='.repeat(60));

if (results.failed.length === 0) {
  log('✅ SYSTEM READY', 'green');
} else {
  log('⚠️  SYSTEM HAS ISSUES', 'yellow');
}

console.log('='.repeat(60) + '\n');

process.exit(results.failed.length > 0 ? 1 : 0);



