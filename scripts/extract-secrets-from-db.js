/**
 * Extract Secrets from Database
 * 
 * This script helps extract secrets from your database/configuration
 * and prepares them for input into Wix Secrets Manager.
 * 
 * Usage:
 * 1. Update the database connection details below
 * 2. Run: node scripts/extract-secrets-from-db.js
 * 3. Review the output and copy secrets to Wix Secrets Manager
 */

// Database connection configuration
const DB_CONFIG = {
    // PostgreSQL connection (if using external DB)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hingecraft',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    
    // Or Wix Data collection name
    wixCollection: 'Secrets' // If secrets are in Wix Data
};

// Secret names to look for
const SECRET_NAMES = {
    // Required
    STRIPE_SECRET_KEY_LIVE: ['STRIPE_SECRET_KEY_LIVE', 'STRIPE_SECRET_KEY', 'stripe_secret_key', 'STRIPE_API_KEY'],
    STRIPE_WEBHOOK_SECRET_LIVE: ['STRIPE_WEBHOOK_SECRET_LIVE', 'STRIPE_WEBHOOK_SECRET', 'stripe_webhook_secret', 'STRIPE_WEBHOOK'],
    NOWPAYMENTS_API_KEY: ['NOWPAYMENTS_API_KEY', 'nowpayments_api_key', 'NOWPAYMENTS_KEY', 'NP_API_KEY'],
    NOWPAYMENTS_IPN_SECRET: ['NOWPAYMENTS_IPN_SECRET', 'nowpayments_ipn_secret', 'NP_IPN_SECRET', 'NOWPAYMENTS_IPN'],
    
    // Recommended
    BASE_URL: ['BASE_URL', 'base_url', 'BASEURL', 'SITE_URL'],
    STRIPE_PUBLISHABLE_KEY_LIVE: ['STRIPE_PUBLISHABLE_KEY_LIVE', 'STRIPE_PUBLISHABLE_KEY', 'stripe_publishable_key'],
    
    // Optional
    NOWPAYMENTS_BASE_URL: ['NOWPAYMENTS_BASE_URL', 'nowpayments_base_url', 'NP_BASE_URL'],
    KYC_THRESHOLD_USD: ['KYC_THRESHOLD_USD', 'kyc_threshold', 'KYC_THRESHOLD'],
    CRYPTO_CONFIRMATIONS_REQUIRED: ['CRYPTO_CONFIRMATIONS_REQUIRED', 'crypto_confirmations', 'CONFIRMATIONS'],
    EXTERNAL_DB_ENDPOINT: ['EXTERNAL_DB_ENDPOINT', 'external_db_endpoint', 'DB_ENDPOINT'],
    EXTERNAL_DB_SECRET_KEY: ['EXTERNAL_DB_SECRET_KEY', 'external_db_secret', 'DB_SECRET_KEY'],
    SENDGRID_API_KEY: ['SENDGRID_API_KEY', 'sendgrid_api_key', 'SENDGRID_KEY'],
    EMAIL_FROM: ['EMAIL_FROM', 'email_from', 'FROM_EMAIL', 'SENDER_EMAIL'],
    NOTION_SYNC_URL: ['NOTION_SYNC_URL', 'notion_sync_url', 'NOTION_URL'],
    CRM_API_KEY: ['CRM_API_KEY', 'crm_api_key', 'NOTION_API_KEY']
};

/**
 * Extract from PostgreSQL database
 */
async function extractFromPostgreSQL() {
    const { Client } = require('pg');
    const client = new Client(DB_CONFIG);
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        
        // Query secrets table (adjust table name as needed)
        const query = `
            SELECT key, value, name 
            FROM secrets 
            WHERE key IN (
                ${Object.values(SECRET_NAMES).flat().map((_, i) => `$${i + 1}`).join(', ')}
            )
        `;
        
        const values = Object.values(SECRET_NAMES).flat();
        const result = await client.query(query, values);
        
        return result.rows;
    } catch (error) {
        console.error('❌ PostgreSQL error:', error.message);
        return [];
    } finally {
        await client.end();
    }
}

/**
 * Extract from .env file
 */
function extractFromEnvFile() {
    const fs = require('fs');
    const path = require('path');
    
    const envFiles = [
        path.join(__dirname, '../.env'),
        path.join(__dirname, '../.env.local'),
        path.join(__dirname, '../notion/.env'),
        path.join(__dirname, '../projects/hingecraft-legacy/.env')
    ];
    
    const secrets = {};
    
    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`📄 Reading ${envFile}`);
            const content = fs.readFileSync(envFile, 'utf8');
            const lines = content.split('\n');
            
            for (const line of lines) {
                if (line.trim() && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    
                    // Match against our secret names
                    for (const [wixName, variations] of Object.entries(SECRET_NAMES)) {
                        if (variations.includes(key.trim())) {
                            secrets[wixName] = value;
                            break;
                        }
                    }
                }
            }
        }
    }
    
    return secrets;
}

/**
 * Extract from JSON config file
 */
function extractFromJSONConfig() {
    const fs = require('fs');
    const path = require('path');
    
    const configFiles = [
        path.join(__dirname, '../wix.config.json'),
        path.join(__dirname, '../config.json')
    ];
    
    const secrets = {};
    
    for (const configFile of configFiles) {
        if (fs.existsSync(configFile)) {
            try {
                console.log(`📄 Reading ${configFile}`);
                const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                
                // Recursively search for secrets
                function searchObject(obj, prefix = '') {
                    for (const [key, value] of Object.entries(obj)) {
                        const fullKey = prefix ? `${prefix}_${key}` : key;
                        
                        if (typeof value === 'object' && value !== null) {
                            searchObject(value, fullKey);
                        } else if (typeof value === 'string') {
                            // Match against our secret names
                            for (const [wixName, variations] of Object.entries(SECRET_NAMES)) {
                                if (variations.includes(fullKey.toUpperCase())) {
                                    secrets[wixName] = value;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                searchObject(config);
            } catch (error) {
                console.error(`❌ Error reading ${configFile}:`, error.message);
            }
        }
    }
    
    return secrets;
}

/**
 * Format secrets for Wix Secrets Manager
 */
function formatForWix(secrets) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 SECRETS READY FOR WIX SECRETS MANAGER');
    console.log('='.repeat(80) + '\n');
    
    const categories = {
        '✅ REQUIRED (Must Configure)': [
            'STRIPE_SECRET_KEY_LIVE',
            'STRIPE_WEBHOOK_SECRET_LIVE',
            'NOWPAYMENTS_API_KEY',
            'NOWPAYMENTS_IPN_SECRET'
        ],
        '⚠️ RECOMMENDED (Optional but Useful)': [
            'BASE_URL',
            'STRIPE_PUBLISHABLE_KEY_LIVE'
        ],
        '🔧 OPTIONAL (Only if Using Feature)': [
            'NOWPAYMENTS_BASE_URL',
            'KYC_THRESHOLD_USD',
            'CRYPTO_CONFIRMATIONS_REQUIRED',
            'EXTERNAL_DB_ENDPOINT',
            'EXTERNAL_DB_SECRET_KEY',
            'SENDGRID_API_KEY',
            'EMAIL_FROM',
            'NOTION_SYNC_URL',
            'CRM_API_KEY'
        ]
    };
    
    for (const [category, secretNames] of Object.entries(categories)) {
        console.log(`\n${category}\n${'-'.repeat(80)}`);
        
        for (const secretName of secretNames) {
            const value = secrets[secretName];
            if (value) {
                // Mask sensitive values
                const masked = maskSecret(value);
                console.log(`\n${secretName}:`);
                console.log(`  Value: ${masked}`);
                console.log(`  Status: ✅ Found`);
            } else {
                console.log(`\n${secretName}:`);
                console.log(`  Status: ❌ Not Found`);
            }
        }
    }
    
    // Generate Wix CLI commands
    console.log('\n' + '='.repeat(80));
    console.log('📝 WIX CLI COMMANDS (Copy and run these)');
    console.log('='.repeat(80) + '\n');
    
    for (const [secretName, value] of Object.entries(secrets)) {
        if (value) {
            console.log(`wix secret set ${secretName} "${value}"`);
        }
    }
    
    // Generate manual input format
    console.log('\n' + '='.repeat(80));
    console.log('📋 MANUAL INPUT FORMAT (For Wix Editor)');
    console.log('='.repeat(80) + '\n');
    
    for (const [secretName, value] of Object.entries(secrets)) {
        if (value) {
            console.log(`Secret Name: ${secretName}`);
            console.log(`Secret Value: ${value}`);
            console.log('---\n');
        }
    }
}

/**
 * Mask secret value for display
 */
function maskSecret(value) {
    if (!value || value.length < 8) return '***';
    return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

/**
 * Main execution
 */
async function main() {
    console.log('🔍 Extracting secrets from database and config files...\n');
    
    const allSecrets = {};
    
    // Try PostgreSQL
    try {
        const pgSecrets = await extractFromPostgreSQL();
        for (const row of pgSecrets) {
            // Map database key to Wix secret name
            for (const [wixName, variations] of Object.entries(SECRET_NAMES)) {
                if (variations.includes(row.key) || variations.includes(row.name)) {
                    allSecrets[wixName] = row.value;
                    break;
                }
            }
        }
    } catch (error) {
        console.log('⚠️ PostgreSQL extraction skipped:', error.message);
    }
    
    // Try .env files
    const envSecrets = extractFromEnvFile();
    Object.assign(allSecrets, envSecrets);
    
    // Try JSON config
    const jsonSecrets = extractFromJSONConfig();
    Object.assign(allSecrets, jsonSecrets);
    
    // Format and display
    formatForWix(allSecrets);
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const outputFile = path.join(__dirname, '../SECRETS_EXTRACTED.json');
    fs.writeFileSync(outputFile, JSON.stringify(allSecrets, null, 2));
    console.log(`\n💾 Secrets saved to: ${outputFile}`);
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { extractFromPostgreSQL, extractFromEnvFile, extractFromJSONConfig };
