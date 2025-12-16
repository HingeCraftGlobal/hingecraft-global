/**
 * Query Database for Secrets
 * 
 * This script queries the PostgreSQL database to find stored secrets.
 * Run this to extract secrets from your database.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - UPDATE THESE VALUES
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hingecraft',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
};

// Tables that might contain secrets
const SECRET_TABLES = [
    'secrets',
    'config',
    'api_keys',
    'credentials',
    'settings',
    'configuration',
    'app_config',
    'system_config'
];

// Secret name patterns to search for
const SECRET_PATTERNS = [
    'stripe',
    'nowpayments',
    'sendgrid',
    'notion',
    'crm',
    'api_key',
    'secret',
    'webhook',
    'ipn'
];

async function queryDatabase() {
    const client = new Client(DB_CONFIG);
    const foundSecrets = {};
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Try to find secrets table
        for (const table of SECRET_TABLES) {
            try {
                const tableExists = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    );
                `, [table]);
                
                if (tableExists.rows[0].exists) {
                    console.log(`📋 Found table: ${table}`);
                    
                    // Get column names
                    const columns = await client.query(`
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = $1
                    `, [table]);
                    
                    console.log(`   Columns: ${columns.rows.map(r => r.column_name).join(', ')}`);
                    
                    // Query all rows
                    const rows = await client.query(`SELECT * FROM ${table} LIMIT 100`);
                    
                    for (const row of rows.rows) {
                        // Check each column for secret-like values
                        for (const [key, value] of Object.entries(row)) {
                            if (typeof value === 'string' && value.length > 10) {
                                // Check if it matches secret patterns
                                const lowerKey = key.toLowerCase();
                                const lowerValue = value.toLowerCase();
                                
                                for (const pattern of SECRET_PATTERNS) {
                                    if (lowerKey.includes(pattern) || lowerValue.includes(pattern)) {
                                        foundSecrets[`${table}.${key}`] = value;
                                        console.log(`   Found: ${table}.${key} = ${value.substring(0, 20)}...`);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // Table doesn't exist, continue
            }
        }
        
        // Also search all tables for secret-like column names
        console.log('\n🔍 Searching all tables for secret-like columns...\n');
        const allTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        for (const table of allTables.rows) {
            const tableName = table.table_name;
            
            // Check if table has secret-like columns
            const columns = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
                AND (
                    column_name ILIKE '%secret%' OR
                    column_name ILIKE '%key%' OR
                    column_name ILIKE '%api%' OR
                    column_name ILIKE '%config%'
                )
            `, [tableName]);
            
            if (columns.rows.length > 0) {
                console.log(`📋 Table ${tableName} has secret-like columns: ${columns.rows.map(r => r.column_name).join(', ')}`);
                
                // Query the table
                try {
                    const rows = await client.query(`SELECT * FROM ${tableName} LIMIT 10`);
                    for (const row of rows.rows) {
                        for (const col of columns.rows) {
                            const colName = col.column_name;
                            if (row[colName] && typeof row[colName] === 'string') {
                                foundSecrets[`${tableName}.${colName}`] = row[colName];
                                console.log(`   ${tableName}.${colName} = ${row[colName].substring(0, 30)}...`);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`   ⚠️ Could not query ${tableName}: ${error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        console.log('\n💡 Tip: Update DB_CONFIG in this script with your database credentials');
    } finally {
        await client.end();
    }
    
    return foundSecrets;
}

async function main() {
    console.log('🔍 Querying database for secrets...\n');
    
    const secrets = await queryDatabase();
    
    if (Object.keys(secrets).length === 0) {
        console.log('\n⚠️ No secrets found in database.');
        console.log('💡 Try:');
        console.log('   1. Update DB_CONFIG with correct credentials');
        console.log('   2. Check if secrets are in .env files instead');
        console.log('   3. Check if secrets are in Wix Data collections');
    } else {
        console.log('\n' + '='.repeat(80));
        console.log('📋 FOUND SECRETS');
        console.log('='.repeat(80));
        
        for (const [key, value] of Object.entries(secrets)) {
            console.log(`\n${key}:`);
            console.log(`  ${value.substring(0, 50)}...`);
        }
        
        // Save to file
        const outputFile = path.join(__dirname, '../SECRETS_FROM_DATABASE.json');
        fs.writeFileSync(outputFile, JSON.stringify(secrets, null, 2));
        console.log(`\n💾 Saved to: ${outputFile}`);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { queryDatabase };
