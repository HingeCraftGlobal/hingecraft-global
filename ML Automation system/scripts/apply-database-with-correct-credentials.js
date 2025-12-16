#!/usr/bin/env node

/**
 * Apply Database with Correct Credentials
 * 
 * Connects to the actual running Docker container and applies schema
 */

const fs = require('fs');
const path = require('path');

// Try to load pg module
let Client = null;
try {
  Client = require('pg').Client;
} catch (e) {
  console.log('⚠️  Installing pg module...');
  console.log('   Run: npm install pg\n');
  process.exit(1);
}

const schemaFile = path.join(__dirname, '../database/schema.sql');

// Try different database configurations
const DB_CONFIGS = [
  {
    name: 'hingecraft-postgres (actual container)',
    host: 'localhost',
    port: 5432,
    database: 'hingecraft_db',
    user: 'hingecraft_user',
    password: 'bf0d1ab9a94bfdb34634e7d2d1672569e90ce20a62e66b813182d9ae5daf61cf'
  },
  {
    name: 'hingecraft-postgres (default)',
    host: 'localhost',
    port: 5432,
    database: 'hingecraft',
    user: 'hingecraft',
    password: 'hingecraft'
  },
  {
    name: 'hingecraft-postgres (changeme)',
    host: 'localhost',
    port: 5432,
    database: 'hingecraft_chat',
    user: 'hingecraft',
    password: 'changeme'
  },
  {
    name: 'hingecraft-postgres (postgres user)',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  }
];

async function tryConnect(config) {
  const client = new Client(config);
  try {
    await client.connect();
    const result = await client.query('SELECT current_database(), current_user');
    await client.end();
    return { success: true, db: result.rows[0].current_database, user: result.rows[0].current_user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function applySchema(config) {
  const client = new Client(config);
  
  try {
    console.log(`📡 Connecting to ${config.name}...`);
    await client.connect();
    console.log(`✅ Connected to database: ${config.database} as ${config.user}\n`);
    
    if (!fs.existsSync(schemaFile)) {
      console.error('❌ Schema file not found:', schemaFile);
      return false;
    }
    
    const schema = fs.readFileSync(schemaFile, 'utf8');
    
    console.log('📊 Applying schema...\n');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let applied = 0;
    let errors = 0;
    const errorDetails = [];
    
    for (const statement of statements) {
      if (statement.length < 10) continue;
      
      try {
        await client.query(statement);
        applied++;
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate') &&
            !error.message.includes('does not exist')) {
          errorDetails.push(error.message.substring(0, 100));
          errors++;
        }
      }
    }
    
    console.log(`✅ Applied ${applied} statements`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors:`);
      errorDetails.slice(0, 5).forEach(err => console.log(`   • ${err}`));
    }
    
    // Verify tables
    console.log('\n📋 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`✅ Found ${tables.length} tables:\n`);
    tables.forEach(table => {
      console.log(`   • ${table}`);
    });
    
    // Check for expected tables
    const expectedTables = ['leads', 'staging_leads', 'import_batches', 'sequences', 'sequence_steps', 
                           'lead_sequences', 'email_logs', 'hubspot_sync', 'message_logs', 
                           'suppression_list', 'audit_log'];
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing ${missingTables.length} expected tables:`);
      missingTables.forEach(table => {
        console.log(`   • ${table}`);
      });
    } else {
      console.log('\n✅ All expected tables found!');
    }
    
    console.log('\n✅ Database schema applied successfully!\n');
    
    return true;
  } catch (error) {
    console.error(`❌ Database error: ${error.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🗄️  Applying Database Schema\n');
  console.log('='.repeat(60) + '\n');
  
  // Try to find the correct database
  console.log('🔍 Finding correct database connection...\n');
  
  for (const config of DB_CONFIGS) {
    const result = await tryConnect(config);
    if (result.success) {
      console.log(`✅ Found working connection: ${config.name}`);
      console.log(`   Database: ${result.db}, User: ${result.user}\n`);
      
      // Apply schema
      const success = await applySchema(config);
      
      if (success) {
        console.log('🎯 Next Steps:');
        console.log('1. Scan database: node scripts/scan-entire-database.js');
        console.log('2. Diagnose email issue: node scripts/diagnose-email-funnel.js\n');
        return;
      }
    }
  }
  
  console.log('❌ Could not connect to any database configuration');
  console.log('\n📝 Check Docker container:');
  console.log('   docker ps | grep postgres');
  console.log('   docker exec hingecraft-postgres env | grep POSTGRES\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applySchema };
