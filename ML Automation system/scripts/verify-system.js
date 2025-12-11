#!/usr/bin/env node

/**
 * System Verification Script
 * Verifies that all components are properly configured and functional
 */

const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const config = require('../config/api_keys');
const oauthManager = require('../src/utils/oauthManager');
const healthCheck = require('../src/monitoring/healthCheck');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logCheck(name, passed, message) {
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} [${status}] ${name}: ${message}`);
  
  if (passed) {
    checks.passed++;
  } else {
    checks.failed++;
  }
}

function logWarning(name, message) {
  console.log(`⚠️  [WARN] ${name}: ${message}`);
  checks.warnings++;
}

async function verifyDatabase() {
  console.log('\n📊 Verifying Database...');
  
  try {
    const result = await db.query('SELECT NOW() as time, version() as version');
    logCheck('Database Connection', true, 'Connected successfully');
    logCheck('Database Query', true, `PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);
    
    // Check tables
    const tables = [
      'leads', 'staging_leads', 'import_batches', 'sequences',
      'sequence_steps', 'lead_sequences', 'email_logs', 'hubspot_sync',
      'message_logs', 'suppression_list', 'audit_log'
    ];
    
    for (const table of tables) {
      try {
        await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
        logCheck(`Table: ${table}`, true, 'Exists');
      } catch (error) {
        logCheck(`Table: ${table}`, false, `Missing or error: ${error.message}`);
      }
    }
  } catch (error) {
    logCheck('Database Connection', false, error.message);
  }
}

async function verifyConfiguration() {
  console.log('\n⚙️  Verifying Configuration...');
  
  // Check API keys
  const requiredKeys = [
    { name: 'Google Client ID', value: config.google.clientId },
    { name: 'Google Client Secret', value: config.google.clientSecret },
    { name: 'HubSpot API Key', value: config.hubspot.apiKey },
    { name: 'Anymail API Key', value: config.anymail.apiKey },
    { name: 'Google Drive Folder ID', value: config.google.driveFolderId }
  ];
  
  for (const key of requiredKeys) {
    if (key.value && key.value.length > 0) {
      logCheck(key.name, true, 'Configured');
    } else {
      logCheck(key.name, false, 'Missing or empty');
    }
  }
  
  // Check database config
  if (config.database.host && config.database.database) {
    logCheck('Database Config', true, `${config.database.host}/${config.database.database}`);
  } else {
    logCheck('Database Config', false, 'Missing configuration');
  }
}

async function verifyOAuth() {
  console.log('\n🔐 Verifying OAuth...');
  
  try {
    oauthManager.initialize();
    const hasTokens = oauthManager.hasTokens();
    
    if (hasTokens) {
      logCheck('OAuth Tokens', true, 'Tokens found and loaded');
    } else {
      logWarning('OAuth Tokens', 'No tokens found. Complete OAuth flow at /auth/google');
    }
    
    const authUrl = oauthManager.getAuthUrl();
    if (authUrl && authUrl.includes('accounts.google.com')) {
      logCheck('OAuth URL Generation', true, 'Auth URL generated successfully');
    } else {
      logCheck('OAuth URL Generation', false, 'Failed to generate auth URL');
    }
  } catch (error) {
    logCheck('OAuth Setup', false, error.message);
  }
}

async function verifyServices() {
  console.log('\n🔧 Verifying Services...');
  
  // Check if service files exist and can be required
  const services = [
    'googleDrive',
    'anymail',
    'hubspot',
    'gmail',
    'leadProcessor',
    'sequenceEngine'
  ];
  
  for (const service of services) {
    try {
      require(`../src/services/${service}`);
      logCheck(`Service: ${service}`, true, 'Loaded successfully');
    } catch (error) {
      logCheck(`Service: ${service}`, false, error.message);
    }
  }
}

async function verifyHealthCheck() {
  console.log('\n🏥 Verifying Health Check...');
  
  try {
    const health = await healthCheck.checkHealth();
    logCheck('Health Check', health.status === 'healthy', `Status: ${health.status}`);
    
    if (health.checks) {
      Object.keys(health.checks).forEach(check => {
        const checkResult = health.checks[check];
        logCheck(`Health: ${check}`, checkResult.status === 'healthy', checkResult.message || checkResult.status);
      });
    }
  } catch (error) {
    logCheck('Health Check', false, error.message);
  }
}

async function verifyStatistics() {
  console.log('\n📈 Verifying Statistics...');
  
  try {
    const stats = await healthCheck.getStatistics();
    logCheck('Statistics API', true, 'Statistics retrieved successfully');
    
    console.log('\n   Current Statistics:');
    console.log(`   - Leads: ${stats.leads?.total || 0} total`);
    console.log(`   - Sequences: ${stats.sequences?.active || 0} active`);
    console.log(`   - Emails: ${stats.emails?.sent || 0} sent`);
    console.log(`   - Imports: ${stats.imports?.total || 0} total`);
  } catch (error) {
    logCheck('Statistics API', false, error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 HingeCraft ML Automation System - Verification');
  console.log('═══════════════════════════════════════════════════════');
  
  await verifyConfiguration();
  await verifyDatabase();
  await verifyOAuth();
  await verifyServices();
  await verifyHealthCheck();
  await verifyStatistics();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Verification Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${checks.passed}`);
  console.log(`❌ Failed: ${checks.failed}`);
  console.log(`⚠️  Warnings: ${checks.warnings}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (checks.failed === 0) {
    console.log('✅ System verification PASSED!');
    console.log('🚀 System is ready to use.\n');
    process.exit(0);
  } else {
    console.log('❌ System verification FAILED!');
    console.log('⚠️  Please fix the issues above before using the system.\n');
    process.exit(1);
  }
}

// Run verification
main().catch(error => {
  console.error('Verification error:', error);
  process.exit(1);
});
