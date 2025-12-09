/**
 * Database Connection Test Script
 * 
 * This script tests database connectivity and table existence.
 * 
 * Usage:
 * 1. Upload this file to Wix Editor → Backend → Test Scripts
 * 2. Run testDatabaseConnection() function
 * 3. Check console for results
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';

/**
 * Test Wix Database connection
 */
export async function testWixDatabase() {
    try {
        console.log('🧪 Testing Wix Database Connection...');
        
        // Test querying Donations collection
        const donations = await wixData.query('Donations')
            .limit(1)
            .find();
        
        console.log('✅ Wix Database: CONNECTED');
        console.log(`   Donations collection: ${donations.items.length} record(s) found`);
        
        return { success: true, type: 'Wix Database', records: donations.items.length };
    } catch (error) {
        console.log('❌ Wix Database: ERROR');
        console.log(`   Error: ${error.message}`);
        return { success: false, type: 'Wix Database', error: error.message };
    }
}

/**
 * Test External Database connection
 */
export async function testExternalDatabase() {
    try {
        console.log('🧪 Testing External Database Connection...');
        
        const dbEndpoint = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
        const dbSecret = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
        
        if (!dbEndpoint || !dbSecret) {
            return { 
                success: false, 
                type: 'External Database', 
                error: 'Database credentials not configured' 
            };
        }
        
        // Test connection by querying a simple endpoint
        const testUrl = `${dbEndpoint}/health` || `${dbEndpoint}/test`;
        
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${dbSecret}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ External Database: CONNECTED');
            console.log(`   Endpoint: ${dbEndpoint}`);
            return { success: true, type: 'External Database', endpoint: dbEndpoint };
        } else {
            console.log('❌ External Database: CONNECTION FAILED');
            console.log(`   Status: ${response.status}`);
            return { success: false, type: 'External Database', error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log('❌ External Database: ERROR');
        console.log(`   Error: ${error.message}`);
        return { success: false, type: 'External Database', error: error.message };
    }
}

/**
 * Test database tables/collections
 */
export async function testDatabaseTables() {
    try {
        console.log('🧪 Testing Database Tables/Collections...');
        console.log('');
        
        const requiredTables = [
            'Donations',
            'ContributionIntents',
            'CryptoPayments',
            'WebhookLogs',
            'KYCVerifications'
        ];
        
        const results = {};
        let found = 0;
        let missing = 0;
        
        for (const tableName of requiredTables) {
            try {
                const query = await wixData.query(tableName).limit(1).find();
                console.log(`✅ ${tableName}: EXISTS`);
                console.log(`   Records: ${query.items.length}`);
                results[tableName] = { exists: true, records: query.items.length };
                found++;
            } catch (error) {
                console.log(`❌ ${tableName}: MISSING or ERROR`);
                console.log(`   Error: ${error.message}`);
                results[tableName] = { exists: false, error: error.message };
                missing++;
            }
            console.log('');
        }
        
        console.log('==========================================');
        console.log('📊 Database Tables Summary:');
        console.log('');
        console.log(`Total Tables: ${requiredTables.length}`);
        console.log(`✅ Found: ${found}`);
        console.log(`❌ Missing: ${missing}`);
        console.log('');
        
        return {
            success: missing === 0,
            found,
            missing,
            results
        };
    } catch (error) {
        console.error('❌ Database Tables Test: ERROR', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test complete database connection
 */
export async function testDatabaseConnection() {
    console.log('🚀 Testing Database Connection...');
    console.log('==========================================');
    console.log('');
    
    const wixResult = await testWixDatabase();
    console.log('');
    
    const externalResult = await testExternalDatabase();
    console.log('');
    
    const tablesResult = await testDatabaseTables();
    
    console.log('==========================================');
    console.log('📊 Database Connection Summary:');
    console.log('');
    console.log(`Wix Database: ${wixResult.success ? '✅ CONNECTED' : '❌ FAILED'}`);
    console.log(`External Database: ${externalResult.success ? '✅ CONNECTED' : '❌ FAILED'}`);
    console.log(`Database Tables: ${tablesResult.success ? '✅ ALL EXIST' : '❌ SOME MISSING'}`);
    console.log('');
    
    return {
        success: wixResult.success && tablesResult.success,
        wixDatabase: wixResult,
        externalDatabase: externalResult,
        tables: tablesResult
    };
}

