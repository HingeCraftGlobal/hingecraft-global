/**
 * Extract Wallet Addresses from Database
 * 
 * This script extracts crypto wallet addresses for HingeCraft
 * from the database and prepares them for NOWPayments configuration.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hingecraft',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
};

// Supported cryptocurrencies
const CRYPTO_CURRENCIES = {
    'BTC': { name: 'Bitcoin', table: 'bitcoin_wallets' },
    'ETH': { name: 'Ethereum', table: 'ethereum_wallets' },
    'SOL': { name: 'Solana', table: 'solana_wallets' },
    'XLM': { name: 'Stellar', table: 'stellar_wallets' }
};

async function queryWalletAddresses() {
    const client = new Client(DB_CONFIG);
    const wallets = {};
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Check for crypto_treasury table
        const treasuryExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'crypto_treasury'
            );
        `);
        
        if (treasuryExists.rows[0].exists) {
            console.log('📋 Found crypto_treasury table');
            
            // Query wallet addresses
            const walletsQuery = await client.query(`
                SELECT 
                    currency,
                    wallet_address,
                    wallet_type,
                    is_active,
                    network
                FROM crypto_treasury
                WHERE is_active = true
                ORDER BY currency, wallet_type;
            `);
            
            for (const wallet of walletsQuery.rows) {
                const currency = wallet.currency.toUpperCase();
                if (!wallets[currency]) {
                    wallets[currency] = [];
                }
                wallets[currency].push({
                    address: wallet.wallet_address,
                    type: wallet.wallet_type,
                    network: wallet.network
                });
            }
        }
        
        // Check for wallets table
        const walletsExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'wallets'
            );
        `);
        
        if (walletsExists.rows[0].exists) {
            console.log('📋 Found wallets table');
            
            const walletsQuery = await client.query(`
                SELECT 
                    currency,
                    address,
                    type,
                    is_active
                FROM wallets
                WHERE is_active = true
                ORDER BY currency;
            `);
            
            for (const wallet of walletsQuery.rows) {
                const currency = wallet.currency.toUpperCase();
                if (!wallets[currency]) {
                    wallets[currency] = [];
                }
                wallets[currency].push({
                    address: wallet.address,
                    type: wallet.type
                });
            }
        }
        
        // Check for individual currency tables
        for (const [currency, config] of Object.entries(CRYPTO_CURRENCIES)) {
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `, [config.table]);
            
            if (tableExists.rows[0].exists) {
                console.log(`📋 Found ${config.table} table`);
                
                const addresses = await client.query(`
                    SELECT address, type, is_active
                    FROM ${config.table}
                    WHERE is_active = true;
                `);
                
                if (addresses.rows.length > 0) {
                    if (!wallets[currency]) {
                        wallets[currency] = [];
                    }
                    for (const addr of addresses.rows) {
                        wallets[currency].push({
                            address: addr.address,
                            type: addr.type
                        });
                    }
                }
            }
        }
        
        // Check config/secrets tables for wallet addresses
        const configQuery = await client.query(`
            SELECT key, value
            FROM secrets
            WHERE key LIKE '%WALLET%' OR key LIKE '%ADDRESS%'
            AND is_active = true;
        `);
        
        for (const config of configQuery.rows) {
            const key = config.key.toUpperCase();
            if (key.includes('BTC') || key.includes('BITCOIN')) {
                if (!wallets['BTC']) wallets['BTC'] = [];
                wallets['BTC'].push({ address: config.value, type: 'payout' });
            } else if (key.includes('ETH') || key.includes('ETHEREUM')) {
                if (!wallets['ETH']) wallets['ETH'] = [];
                wallets['ETH'].push({ address: config.value, type: 'payout' });
            } else if (key.includes('SOL') || key.includes('SOLANA')) {
                if (!wallets['SOL']) wallets['SOL'] = [];
                wallets['SOL'].push({ address: config.value, type: 'payout' });
            } else if (key.includes('XLM') || key.includes('STELLAR')) {
                if (!wallets['XLM']) wallets['XLM'] = [];
                wallets['XLM'].push({ address: config.value, type: 'payout' });
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await client.end();
    }
    
    return wallets;
}

function formatForNOWPayments(wallets) {
    console.log('\n' + '='.repeat(80));
    console.log('💰 CRYPTO WALLET ADDRESSES FOR NOWPAYMENTS');
    console.log('='.repeat(80) + '\n');
    
    const nowPaymentsFormat = {};
    
    for (const [currency, addresses] of Object.entries(wallets)) {
        if (addresses.length > 0) {
            // Use the first active address as primary
            const primaryAddress = addresses[0].address;
            nowPaymentsFormat[currency] = primaryAddress;
            
            console.log(`${currency} (${CRYPTO_CURRENCIES[currency]?.name || currency}):`);
            console.log(`  Primary Address: ${primaryAddress}`);
            if (addresses.length > 1) {
                console.log(`  Additional Addresses: ${addresses.length - 1}`);
            }
            console.log('');
        }
    }
    
    return nowPaymentsFormat;
}

async function main() {
    console.log('🔍 Extracting wallet addresses from database...\n');
    
    const wallets = await queryWalletAddresses();
    
    if (Object.keys(wallets).length === 0) {
        console.log('⚠️ No wallet addresses found in database.');
        console.log('💡 You need to:');
        console.log('   1. Configure wallet addresses in NOWPayments Dashboard');
        console.log('   2. Or add them to your database secrets/config table');
        console.log('   3. Or set them in Wix Secrets Manager');
    } else {
        const nowPaymentsFormat = formatForNOWPayments(wallets);
        
        // Save to file
        const outputFile = path.join(__dirname, '../WALLET_ADDRESSES.json');
        fs.writeFileSync(outputFile, JSON.stringify(nowPaymentsFormat, null, 2));
        console.log(`💾 Wallet addresses saved to: ${outputFile}`);
        
        // Generate Wix Secrets format
        console.log('\n' + '='.repeat(80));
        console.log('📋 WIX SECRETS FORMAT (For Wallet Addresses)');
        console.log('='.repeat(80) + '\n');
        
        for (const [currency, address] of Object.entries(nowPaymentsFormat)) {
            console.log(`Secret Name: NOWPAYMENTS_WALLET_${currency}`);
            console.log(`Secret Value: ${address}`);
            console.log('---\n');
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { queryWalletAddresses };
