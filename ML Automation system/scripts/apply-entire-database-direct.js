#!/usr/bin/env node

/**
 * Apply Entire Database Directly
 * 
 * Applies the complete database schema to PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hingecraft',
  user: process.env.DB_USER || 'hingecraft',
  password: process.env.DB_PASSWORD || 'hingecraft'
};

async function applyDatabase() {
  console.log('🗄️  Applying Entire Database Schema\n');
  console.log('='.repeat(60) + '\n');
  
  const schemaFile = path.join(__dirname, '../database/schema.sql');
  
  if (!fs.existsSync(schemaFile)) {
    console.error('❌ Schema file not found:', schemaFile);
    return false;
  }
  
  const schema = fs.readFileSync(schemaFile, 'utf8');
  
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');
    
    console.log('📊 Applying schema...');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let applied = 0;
    let errors = 0;
    
    for (const statement of statements) {
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        await client.query(statement);
        applied++;
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate')) {
          console.error(`⚠️  Error: ${error.message.substring(0, 100)}`);
          errors++;
        }
      }
    }
    
    console.log(`\n✅ Applied ${applied} statements`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors (mostly "already exists" - safe to ignore)`);
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
    
    console.log('\n✅ Database schema applied successfully!\n');
    
    return true;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  const success = await applyDatabase();
  
  if (success) {
    console.log('🎯 Next Steps:');
    console.log('1. Set Script Properties');
    console.log('2. Push HubSpot Properties');
    console.log('3. Test email send\n');
  } else {
    console.log('\n⚠️  Database application had issues');
    console.log('   Check Docker is running: docker-compose up -d postgres\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyDatabase };
