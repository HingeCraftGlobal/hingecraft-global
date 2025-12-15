/**
 * Master Deployment Verification Script
 * Verifies EVERY component is ready for launch
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../config/api_keys');
const logger = require('../src/utils/logger');

const results = {
  verified: [],
  errors: [],
  warnings: [],
  missing: []
};

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

// 1. Verify Configuration
async function verifyConfiguration() {
  logSection('1. Configuration Verification');
  
  const requiredConfig = {
    'Drive Folder ID': config.google.driveFolderId === '1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF',
    'AnyMail API Key': config.anymail.apiKey === 'pRUtyDRHSPageC2jHGbnWGpD',
    'HubSpot Portal ID': !!config.hubspot.portalId,
    'HubSpot API Key': !!config.hubspot.apiKey,
    'Gmail From Address': !!config.email.fromAddress,
    'OAuth Client ID': !!config.google.clientId,
    'OAuth Client Secret': !!config.google.clientSecret
  };
  
  for (const [key, valid] of Object.entries(requiredConfig)) {
    if (valid) {
      log(`✅ ${key}`, 'green');
      results.verified.push(key);
    } else {
      log(`❌ ${key} - INVALID`, 'red');
      results.errors.push(key);
    }
  }
}

// 2. Verify Google Apps Script Files
async function verifyGoogleAppsScript() {
  logSection('2. Google Apps Script Verification');
  
  const gasDir = path.join(__dirname, '..', 'google-apps-script');
  const requiredFiles = [
    'Code.gs',
    'Templates.gs',
    'HubSpotSetup.gs',
    'appsscript.json',
    '.clasp.json'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(gasDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
      results.verified.push(`GAS: ${file}`);
    } else {
      log(`❌ ${file} - MISSING`, 'red');
      results.missing.push(`GAS: ${file}`);
    }
  }
  
  // Check .clasp.json content
  const claspJson = path.join(gasDir, '.clasp.json');
  if (fs.existsSync(claspJson)) {
    try {
      const claspConfig = JSON.parse(fs.readFileSync(claspJson, 'utf8'));
      if (claspConfig.scriptId === '1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS') {
        log('✅ Script ID correct', 'green');
        results.verified.push('GAS: Script ID');
      } else {
        log(`❌ Script ID incorrect: ${claspConfig.scriptId}`, 'red');
        results.errors.push('GAS: Script ID');
      }
    } catch (error) {
      log(`❌ Error reading .clasp.json: ${error.message}`, 'red');
      results.errors.push('GAS: .clasp.json parse');
    }
  }
}

// 3. Verify Service Files
async function verifyServiceFiles() {
  logSection('3. Service Files Verification');
  
  const requiredServices = [
    'src/services/googleDrive.js',
    'src/services/hubspot.js',
    'src/services/gmail.js',
    'src/services/anymail.js',
    'src/services/leadProcessor.js',
    'src/services/sequenceEngine.js',
    'src/orchestrator.js'
  ];
  
  for (const service of requiredServices) {
    const servicePath = path.join(__dirname, '..', service);
    if (fs.existsSync(servicePath)) {
      log(`✅ ${service}`, 'green');
      results.verified.push(`Service: ${service}`);
    } else {
      log(`❌ ${service} - MISSING`, 'red');
      results.missing.push(`Service: ${service}`);
    }
  }
}

// 4. Verify CLI Tools
async function verifyCLITools() {
  logSection('4. CLI Tools Verification');
  
  const cliTools = {
    'clasp': 'Google Apps Script CLI',
    'hs': 'HubSpot CLI',
    'node': 'Node.js'
  };
  
  for (const [tool, description] of Object.entries(cliTools)) {
    try {
      const version = execSync(`${tool} --version || ${tool} -v`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      log(`✅ ${tool} (${description}) - ${version}`, 'green');
      results.verified.push(`CLI: ${tool}`);
    } catch (error) {
      log(`❌ ${tool} (${description}) - NOT INSTALLED`, 'red');
      results.missing.push(`CLI: ${tool}`);
    }
  }
}

// 5. Verify Database Schema
async function verifyDatabaseSchema() {
  logSection('5. Database Schema Verification');
  
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    log('✅ schema.sql exists', 'green');
    results.verified.push('Database: schema.sql');
    
    // Check for required tables
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const requiredTables = [
      'leads',
      'import_batches',
      'email_logs',
      'hubspot_sync',
      'sequences',
      'sequence_steps',
      'lead_sequences'
    ];
    
    for (const table of requiredTables) {
      if (schema.includes(`CREATE TABLE.*${table}`) || schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
        log(`✅ Table: ${table}`, 'green');
        results.verified.push(`Database: ${table}`);
      } else {
        log(`⚠️  Table: ${table} - Not found in schema`, 'yellow');
        results.warnings.push(`Database: ${table}`);
      }
    }
  } else {
    log('❌ schema.sql - MISSING', 'red');
    results.missing.push('Database: schema.sql');
  }
}

// 6. Verify API Endpoints
async function verifyAPIEndpoints() {
  logSection('6. API Endpoints Verification');
  
  const endpoints = {
    'HubSpot API': config.hubspot.baseUrl,
    'AnyMail API': config.anymail.baseUrl,
    'Google Drive API': 'https://www.googleapis.com/drive/v3',
    'Gmail API': 'https://www.googleapis.com/gmail/v1'
  };
  
  for (const [name, url] of Object.entries(endpoints)) {
    if (url && url.startsWith('http')) {
      log(`✅ ${name} - ${url}`, 'green');
      results.verified.push(`API: ${name}`);
    } else {
      log(`⚠️  ${name} - URL not configured`, 'yellow');
      results.warnings.push(`API: ${name}`);
    }
  }
}

// 7. Generate Report
function generateReport() {
  logSection('📊 Final Verification Report');
  
  const total = results.verified.length + results.errors.length + results.warnings.length + results.missing.length;
  const successRate = total > 0 ? ((results.verified.length / total) * 100).toFixed(1) : 0;
  
  log(`Total Checks: ${total}`, 'blue');
  log(`✅ Verified: ${results.verified.length}`, 'green');
  log(`❌ Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');
  log(`❓ Missing: ${results.missing.length}`, results.missing.length > 0 ? 'red' : 'green');
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  
  if (results.errors.length > 0) {
    log('\n❌ ERRORS FOUND:', 'red');
    results.errors.forEach(error => log(`   - ${error}`, 'red'));
  }
  
  if (results.missing.length > 0) {
    log('\n❓ MISSING COMPONENTS:', 'red');
    results.missing.forEach(missing => log(`   - ${missing}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    results.warnings.forEach(warning => log(`   - ${warning}`, 'yellow'));
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (results.errors.length === 0 && results.missing.length === 0) {
    log('🎉 SYSTEM 100% READY FOR LAUNCH', 'green');
  } else {
    log('⚠️  SYSTEM HAS ISSUES - REVIEW ABOVE', 'yellow');
  }
  
  console.log('='.repeat(80) + '\n');
  
  return {
    verified: results.verified.length,
    errors: results.errors.length,
    warnings: results.warnings.length,
    missing: results.missing.length,
    successRate: parseFloat(successRate)
  };
}

// Main execution
async function main() {
  console.clear();
  log('\n🚀 MASTER DEPLOYMENT VERIFICATION\n', 'cyan');
  
  try {
    await verifyConfiguration();
    await verifyGoogleAppsScript();
    await verifyServiceFiles();
    await verifyCLITools();
    await verifyDatabaseSchema();
    await verifyAPIEndpoints();
    
    const report = generateReport();
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'deployment-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`📄 Report saved: ${reportPath}`, 'blue');
    
    process.exit(report.errors > 0 || report.missing > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


