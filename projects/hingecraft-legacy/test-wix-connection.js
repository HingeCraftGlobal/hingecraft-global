/**
 * Test Wix Connection - Run this to verify everything works
 * 
 * Usage in Wix Velo:
 * 1. Copy this code to a backend web module
 * 2. Call testWixConnection() from frontend
 */

import { testConnection, getLatestDonation, saveDonation } from 'backend/hingecraft-api';

export async function testWixConnection() {
    const results = {
        connection: null,
        latestDonation: null,
        saveTest: null,
        errors: []
    };
    
    try {
        // Test 1: Connection
        console.log('Testing connection...');
        results.connection = await testConnection();
        console.log('✅ Connection:', results.connection);
        
        // Test 2: Get latest donation
        console.log('Testing getLatestDonation...');
        results.latestDonation = await getLatestDonation();
        console.log('✅ Latest donation:', results.latestDonation);
        
        // Test 3: Save test donation
        console.log('Testing saveDonation...');
        results.saveTest = await saveDonation(1.00, {
            isOtherAmount: true,
            source: 'wix_test',
            paymentStatus: 'test'
        });
        console.log('✅ Save test:', results.saveTest);
        
        return {
            success: true,
            results: results
        };
    } catch (error) {
        results.errors.push(error.message);
        console.error('❌ Error:', error);
        return {
            success: false,
            results: results,
            error: error.message
        };
    }
}
