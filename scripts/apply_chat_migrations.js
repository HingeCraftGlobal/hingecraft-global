#!/usr/bin/env node
/**
 * Apply T10 Chat System Database Migrations
 * Connects to live database and applies chat system schema
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment
const DB_URL = process.env.DB_URL || 'postgresql://hc:hcpass@localhost:5432/hingecraft';

console.log('🔌 Connecting to database...');
console.log(`Database URL: ${DB_URL.replace(/:[^:@]+@/, ':****@')}`); // Hide password

const pool = new Pool({
  connectionString: DB_URL,
  max: 1, // Single connection for migrations
});

async function applyMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '../migrations/001_init_chat_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Applying migrations...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('✅ Migrations applied successfully!');
    
    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'messages', 'read_receipts', 'uploads', 'idempotency_keys', 'moderation_logs')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Created tables:');
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigrations()
  .then(() => {
    console.log('\n🎉 Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });

