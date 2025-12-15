/**
 * Database Setup Script
 * Creates database schema and initializes tables
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/api_keys');

async function setupDatabase() {
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Creating database schema...');
    await pool.query(schema);
    console.log('✓ Database schema created successfully');

    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✓ Logs directory created');
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Configure OAuth credentials');
    console.log('2. Run: npm start');
    console.log('3. Visit: http://localhost:3001/auth/google');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
