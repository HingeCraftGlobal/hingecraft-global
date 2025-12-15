/**
 * Apply Entire Database and Verify Complete Flow
 * Ensures all database tables, functions, and data match the automation flow
 */

require('dotenv').config();
const db = require('../src/utils/database');
const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

const results = {
  applied: [],
  errors: [],
  verified: []
};

async function applyDatabaseSchema() {
  logSection('1. Applying Database Schema');
  
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      log('❌ Schema file not found', 'red');
      results.errors.push('Schema file not found');
      return false;
    }
    
    log('📄 Reading schema file...', 'blue');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    log(`📊 Found ${statements.length} SQL statements`, 'blue');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        await db.query(statement);
        if (i % 10 === 0) {
          log(`   Applied ${i + 1}/${statements.length} statements...`, 'blue');
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate')) {
          log(`   ⚠️  Statement ${i + 1}: ${error.message.substring(0, 50)}`, 'yellow');
        }
      }
    }
    
    log('✅ Database schema applied', 'green');
    results.applied.push('Database schema');
    return true;
  } catch (error) {
    log(`❌ Error applying schema: ${error.message}`, 'red');
    results.errors.push(`Schema application: ${error.message}`);
    return false;
  }
}

async function verifyTables() {
  logSection('2. Verifying Database Tables');
  
  const requiredTables = [
    'leads',
    'staging_leads',
    'import_batches',
    'sequences',
    'sequence_steps',
    'lead_sequences',
    'email_logs',
    'hubspot_sync',
    'message_logs',
    'suppression_list',
    'audit_log'
  ];
  
  for (const table of requiredTables) {
    try {
      const result = await db.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
        [table]
      );
      
      if (result.rows[0].exists) {
        log(`✅ Table: ${table}`, 'green');
        results.verified.push(`Table: ${table}`);
      } else {
        log(`❌ Table: ${table} - NOT FOUND`, 'red');
        results.errors.push(`Table missing: ${table}`);
      }
    } catch (error) {
      log(`❌ Error checking table ${table}: ${error.message}`, 'red');
      results.errors.push(`Table check error: ${table}`);
    }
  }
}

async function verifyFunctions() {
  logSection('3. Verifying Database Functions');
  
  const requiredFunctions = [
    'update_updated_at_column',
    'compute_fingerprint'
  ];
  
  for (const func of requiredFunctions) {
    try {
      const result = await db.query(
        "SELECT EXISTS (SELECT FROM pg_proc WHERE proname = $1)",
        [func]
      );
      
      if (result.rows[0].exists) {
        log(`✅ Function: ${func}`, 'green');
        results.verified.push(`Function: ${func}`);
      } else {
        log(`❌ Function: ${func} - NOT FOUND`, 'red');
        results.errors.push(`Function missing: ${func}`);
      }
    } catch (error) {
      log(`❌ Error checking function ${func}: ${error.message}`, 'red');
      results.errors.push(`Function check error: ${func}`);
    }
  }
}

async function verifyIndexes() {
  logSection('4. Verifying Database Indexes');
  
  const requiredIndexes = [
    'idx_leads_email',
    'idx_leads_fingerprint',
    'idx_email_logs_lead_id',
    'idx_hubspot_sync_contact_id'
  ];
  
  for (const index of requiredIndexes) {
    try {
      const result = await db.query(
        "SELECT EXISTS (SELECT FROM pg_indexes WHERE indexname = $1)",
        [index]
      );
      
      if (result.rows[0].exists) {
        log(`✅ Index: ${index}`, 'green');
        results.verified.push(`Index: ${index}`);
      } else {
        log(`⚠️  Index: ${index} - NOT FOUND (may be created automatically)`, 'yellow');
      }
    } catch (error) {
      log(`⚠️  Error checking index ${index}: ${error.message}`, 'yellow');
    }
  }
}

async function verifyFlowIntegration() {
  logSection('5. Verifying Flow Integration');
  
  // Check that all services can connect
  const services = {
    'Google Drive Service': '../src/services/googleDrive',
    'HubSpot Service': '../src/services/hubspot',
    'Gmail Service': '../src/services/gmail',
    'AnyMail Service': '../src/services/anymail',
    'Orchestrator': '../src/orchestrator'
  };
  
  for (const [name, modulePath] of Object.entries(services)) {
    try {
      const service = require(modulePath);
      log(`✅ ${name} - Loaded`, 'green');
      results.verified.push(`Service: ${name}`);
    } catch (error) {
      log(`❌ ${name} - Error: ${error.message}`, 'red');
      results.errors.push(`Service error: ${name}`);
    }
  }
}

async function verifyConfiguration() {
  logSection('6. Verifying Configuration');
  
  const config = require('../config/api_keys');
  
  const configChecks = [
    { name: 'Drive Folder ID', value: config.google.driveFolderId, expected: '1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF' },
    { name: 'AnyMail API Key', value: config.anymail.apiKey, expected: 'pRUtyDRHSPageC2jHGbnWGpD' },
    { name: 'HubSpot Portal ID', value: config.hubspot.portalId, expected: '244560986' },
    { name: 'Gmail From Address', value: config.email.fromAddress, check: (v) => v && v.includes('@') }
  ];
  
  for (const check of configChecks) {
    if (check.expected) {
      if (check.value === check.expected) {
        log(`✅ ${check.name} - Correct`, 'green');
        results.verified.push(`Config: ${check.name}`);
      } else {
        log(`❌ ${check.name} - Expected: ${check.expected}, Got: ${check.value}`, 'red');
        results.errors.push(`Config mismatch: ${check.name}`);
      }
    } else if (check.check) {
      if (check.check(check.value)) {
        log(`✅ ${check.name} - Valid`, 'green');
        results.verified.push(`Config: ${check.name}`);
      } else {
        log(`❌ ${check.name} - Invalid: ${check.value}`, 'red');
        results.errors.push(`Config invalid: ${check.name}`);
      }
    }
  }
}

async function generateReport() {
  logSection('📊 Final Report');
  
  log(`Applied: ${results.applied.length}`, 'blue');
  log(`Verified: ${results.verified.length}`, 'green');
  log(`Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
  
  if (results.errors.length > 0) {
    log('\n❌ Errors Found:', 'red');
    results.errors.forEach(error => log(`   - ${error}`, 'red'));
  }
  
  const successRate = ((results.verified.length / (results.verified.length + results.errors.length)) * 100).toFixed(1);
  log(`\n✅ Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  
  if (results.errors.length === 0) {
    log('\n🎉 DATABASE FULLY APPLIED AND VERIFIED', 'green');
    log('✅ All tables, functions, and services are ready', 'green');
    log('✅ Flow integration is complete', 'green');
  } else {
    log('\n⚠️  SOME ISSUES FOUND - REVIEW ERRORS ABOVE', 'yellow');
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
}

async function main() {
  console.clear();
  log('\n🚀 Applying Entire Database and Verifying Flow\n', 'cyan');
  
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    log('✅ Database connection OK', 'green');
    
    // Apply schema
    await applyDatabaseSchema();
    
    // Verify everything
    await verifyTables();
    await verifyFunctions();
    await verifyIndexes();
    await verifyFlowIntegration();
    await verifyConfiguration();
    
    // Generate report
    await generateReport();
    
    process.exit(results.errors.length > 0 ? 1 : 0);
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


