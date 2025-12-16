#!/usr/bin/env node

/**
 * Scan Entire Database
 * 
 * Comprehensive scan of the entire database to confirm what's applied
 */

const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

// Try to load pg module
let Client = null;
try {
  Client = require('pg').Client;
} catch (e) {
  // pg module not installed
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hingecraft',
  user: process.env.DB_USER || 'hingecraft',
  password: process.env.DB_PASSWORD || 'hingecraft'
};

const SCAN_RESULTS = {
  connection: { status: 'UNKNOWN', details: [] },
  tables: { found: [], expected: [], missing: [], status: 'UNKNOWN' },
  indexes: { found: [], expected: [], missing: [], status: 'UNKNOWN' },
  triggers: { found: [], expected: [], missing: [], status: 'UNKNOWN' },
  functions: { found: [], expected: [], missing: [], status: 'UNKNOWN' },
  data: { rowCounts: {}, status: 'UNKNOWN' }
};

// Expected schema from schema.sql
const EXPECTED_TABLES = [
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

const EXPECTED_INDEXES = [
  'idx_leads_email',
  'idx_leads_fingerprint',
  'idx_leads_status',
  'idx_leads_source',
  'idx_staging_fingerprint',
  'idx_staging_import_id',
  'idx_staging_status',
  'idx_email_logs_lead_id',
  'idx_email_logs_provider_msg_id',
  'idx_email_logs_status',
  'idx_lead_sequences_lead_id',
  'idx_lead_sequences_status',
  'idx_hubspot_sync_lead_id',
  'idx_hubspot_sync_contact_id',
  'idx_suppression_email',
  'idx_audit_actor',
  'idx_audit_action',
  'idx_audit_created_at'
];

const EXPECTED_FUNCTIONS = [
  'update_updated_at_column',
  'compute_fingerprint'
];

async function scanDatabase() {
  console.log('🔍 Scanning Entire Database\n');
  console.log('='.repeat(60) + '\n');
  
  if (!Client) {
    console.log('⚠️  PostgreSQL client (pg) module not installed');
    console.log('📝 Cannot connect to database for scanning\n');
    console.log('📋 Expected Schema (from schema.sql):\n');
    console.log(`   Tables: ${EXPECTED_TABLES.length}`);
    EXPECTED_TABLES.forEach(table => {
      console.log(`   • ${table}`);
    });
    console.log(`\n   Indexes: ${EXPECTED_INDEXES.length}`);
    console.log(`   Functions: ${EXPECTED_FUNCTIONS.length}`);
    console.log(`   Triggers: 3 (update_updated_at triggers)\n`);
    
    SCAN_RESULTS.connection.status = 'NO_CLIENT';
    SCAN_RESULTS.connection.details.push('pg module not installed');
    return SCAN_RESULTS;
  }
  
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');
    SCAN_RESULTS.connection.status = 'CONNECTED';
    SCAN_RESULTS.connection.details.push('Successfully connected');
    
    // Scan Tables
    console.log('📊 Scanning Tables...\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const foundTables = tablesResult.rows.map(r => r.table_name);
    SCAN_RESULTS.tables.found = foundTables;
    SCAN_RESULTS.tables.expected = EXPECTED_TABLES;
    
    console.log(`✅ Found ${foundTables.length} tables:\n`);
    foundTables.forEach(table => {
      console.log(`   • ${table}`);
      if (EXPECTED_TABLES.includes(table)) {
        SCAN_RESULTS.tables.found.push(table);
      } else {
        console.log(`     ⚠️  Unexpected table (not in schema.sql)`);
      }
    });
    
    const missingTables = EXPECTED_TABLES.filter(t => !foundTables.includes(t));
    SCAN_RESULTS.tables.missing = missingTables;
    
    if (missingTables.length > 0) {
      console.log(`\n❌ Missing ${missingTables.length} tables:\n`);
      missingTables.forEach(table => {
        console.log(`   • ${table}`);
      });
      SCAN_RESULTS.tables.status = 'INCOMPLETE';
    } else {
      console.log('\n✅ All expected tables found!');
      SCAN_RESULTS.tables.status = 'COMPLETE';
    }
    
    // Scan Indexes
    console.log('\n📊 Scanning Indexes...\n');
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    
    const foundIndexes = indexesResult.rows.map(r => r.indexname);
    SCAN_RESULTS.indexes.found = foundIndexes;
    SCAN_RESULTS.indexes.expected = EXPECTED_INDEXES;
    
    console.log(`✅ Found ${foundIndexes.length} indexes:\n`);
    foundIndexes.forEach(index => {
      console.log(`   • ${index}`);
    });
    
    const missingIndexes = EXPECTED_INDEXES.filter(i => !foundIndexes.includes(i));
    SCAN_RESULTS.indexes.missing = missingIndexes;
    
    if (missingIndexes.length > 0) {
      console.log(`\n⚠️  Missing ${missingIndexes.length} indexes:\n`);
      missingIndexes.forEach(index => {
        console.log(`   • ${index}`);
      });
      SCAN_RESULTS.indexes.status = 'INCOMPLETE';
    } else {
      console.log('\n✅ All expected indexes found!');
      SCAN_RESULTS.indexes.status = 'COMPLETE';
    }
    
    // Scan Functions
    console.log('\n📊 Scanning Functions...\n');
    const functionsResult = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `);
    
    const foundFunctions = functionsResult.rows.map(r => r.routine_name);
    SCAN_RESULTS.functions.found = foundFunctions;
    SCAN_RESULTS.functions.expected = EXPECTED_FUNCTIONS;
    
    console.log(`✅ Found ${foundFunctions.length} functions:\n`);
    foundFunctions.forEach(func => {
      console.log(`   • ${func}`);
    });
    
    const missingFunctions = EXPECTED_FUNCTIONS.filter(f => !foundFunctions.includes(f));
    SCAN_RESULTS.functions.missing = missingFunctions;
    
    if (missingFunctions.length > 0) {
      console.log(`\n⚠️  Missing ${missingFunctions.length} functions:\n`);
      missingFunctions.forEach(func => {
        console.log(`   • ${func}`);
      });
      SCAN_RESULTS.functions.status = 'INCOMPLETE';
    } else {
      console.log('\n✅ All expected functions found!');
      SCAN_RESULTS.functions.status = 'COMPLETE';
    }
    
    // Scan Triggers
    console.log('\n📊 Scanning Triggers...\n');
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    const foundTriggers = triggersResult.rows;
    SCAN_RESULTS.triggers.found = foundTriggers.map(t => t.trigger_name);
    
    console.log(`✅ Found ${foundTriggers.length} triggers:\n`);
    foundTriggers.forEach(trigger => {
      console.log(`   • ${trigger.trigger_name} on ${trigger.event_object_table}`);
    });
    
    const expectedTriggerCount = 3; // update_updated_at triggers
    if (foundTriggers.length >= expectedTriggerCount) {
      console.log('\n✅ Expected triggers found!');
      SCAN_RESULTS.triggers.status = 'COMPLETE';
    } else {
      console.log(`\n⚠️  Expected ${expectedTriggerCount} triggers, found ${foundTriggers.length}`);
      SCAN_RESULTS.triggers.status = 'INCOMPLETE';
    }
    
    // Scan Data
    console.log('\n📊 Scanning Data...\n');
    const rowCounts = {};
    
    for (const table of foundTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        rowCounts[table] = count;
        console.log(`   ${table}: ${count} rows`);
      } catch (error) {
        console.log(`   ${table}: Error counting rows`);
        rowCounts[table] = 'ERROR';
      }
    }
    
    SCAN_RESULTS.data.rowCounts = rowCounts;
    SCAN_RESULTS.data.status = 'SCANNED';
    
    console.log('\n✅ Data scan complete\n');
    
    return SCAN_RESULTS;
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    SCAN_RESULTS.connection.status = 'ERROR';
    SCAN_RESULTS.connection.details.push(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Cannot connect to database');
      console.log('   Start Docker: docker-compose up -d postgres\n');
    }
    
    return SCAN_RESULTS;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Scan Summary');
  console.log('='.repeat(60) + '\n');
  
  console.log('🔌 Connection:');
  console.log(`   Status: ${results.connection.status}`);
  results.connection.details.forEach(detail => {
    console.log(`   • ${detail}`);
  });
  console.log('');
  
  if (results.connection.status === 'CONNECTED') {
    console.log('📋 Tables:');
    console.log(`   Found: ${results.tables.found.length}`);
    console.log(`   Expected: ${results.tables.expected.length}`);
    console.log(`   Missing: ${results.tables.missing.length}`);
    console.log(`   Status: ${results.tables.status}\n`);
    
    console.log('📋 Indexes:');
    console.log(`   Found: ${results.indexes.found.length}`);
    console.log(`   Expected: ${results.indexes.expected.length}`);
    console.log(`   Missing: ${results.indexes.missing.length}`);
    console.log(`   Status: ${results.indexes.status}\n`);
    
    console.log('📋 Functions:');
    console.log(`   Found: ${results.functions.found.length}`);
    console.log(`   Expected: ${results.functions.expected.length}`);
    console.log(`   Missing: ${results.functions.missing.length}`);
    console.log(`   Status: ${results.functions.status}\n`);
    
    console.log('📋 Triggers:');
    console.log(`   Found: ${results.triggers.found.length}`);
    console.log(`   Status: ${results.triggers.status}\n`);
    
    console.log('📊 Data:');
    Object.entries(results.data.rowCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} rows`);
    });
    console.log('');
    
    // Overall status
    const allComplete = 
      results.tables.status === 'COMPLETE' &&
      results.indexes.status === 'COMPLETE' &&
      results.functions.status === 'COMPLETE' &&
      results.triggers.status === 'COMPLETE';
    
    if (allComplete) {
      console.log('✅ Database schema is COMPLETE!\n');
    } else {
      console.log('⚠️  Database schema is INCOMPLETE\n');
      console.log('📝 To apply missing components:');
      console.log('   node scripts/apply-entire-database-direct.js\n');
    }
  } else {
    console.log('⚠️  Cannot scan database (connection failed)');
    console.log('📝 Expected schema:');
    console.log(`   • ${EXPECTED_TABLES.length} tables`);
    console.log(`   • ${EXPECTED_INDEXES.length} indexes`);
    console.log(`   • ${EXPECTED_FUNCTIONS.length} functions`);
    console.log(`   • 3 triggers\n`);
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../database-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    scan: results
  }, null, 2));
  
  console.log('📄 Full scan report saved to:');
  console.log(`   ${reportPath}\n`);
}

async function main() {
  const results = await scanDatabase();
  generateReport(results);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scanDatabase };
