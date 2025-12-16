/**
 * Backend Functions Test Script
 * 
 * This script can be run in Wix Editor → Dev Mode → Backend → Functions
 * to test backend functions after deployment.
 * 
 * Usage:
 * 1. Upload this file to Wix Editor → Backend → Test Scripts
 * 2. Run each test function individually
 * 3. Check console for results
 */

import { getLatestDonation, saveDonation, logContributionIntent, logMissionSupportIntent } from 'backend/hingecraft.api.web';
import { createNowPaymentsInvoice } from 'backend/createNowPaymentsInvoice';

/**
 * Test 1: Get Latest Donation
 */
export async function testGetLatestDonation() {
    try {
        console.log('🧪 Testing getLatestDonation()...');
        const result = await getLatestDonation();
        
        if (result.success) {
            console.log('✅ getLatestDonation() SUCCESS');
            console.log('   Amount:', result.amount);
            console.log('   Created:', result.createdAt);
            return { success: true, result };
        } else {
            console.log('❌ getLatestDonation() FAILED');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ getLatestDonation() EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 2: Save Donation
 */
export async function testSaveDonation() {
    try {
        console.log('🧪 Testing saveDonation()...');
        
        const testDonation = {
            amount: 1.00,
            currency: 'USD',
            isOtherAmount: false,
            source: 'missionSupportForm',
            paymentStatus: 'completed',
            paymentMethod: 'test',
            transactionId: 'test_' + Date.now(),
            email: 'test@example.com',
            name: 'Test User',
            metadata: { test: true }
        };
        
        const result = await saveDonation(testDonation);
        
        if (result.success) {
            console.log('✅ saveDonation() SUCCESS');
            console.log('   Donation ID:', result.donationId);
            return { success: true, result };
        } else {
            console.log('❌ saveDonation() FAILED');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ saveDonation() EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 3: Log Contribution Intent
 */
export async function testLogContributionIntent() {
    try {
        console.log('🧪 Testing logContributionIntent()...');
        
        const testIntent = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            amount: 10.00,
            missionSupportName: 'Test Mission',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
            phone: '123-456-7890',
            paymentMethod: 'card',
            source: 'missionSupportForm'
        };
        
        const result = await logContributionIntent(testIntent);
        
        if (result.success) {
            console.log('✅ logContributionIntent() SUCCESS');
            console.log('   Intent ID:', result.intentId);
            return { success: true, result };
        } else {
            console.log('❌ logContributionIntent() FAILED');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ logContributionIntent() EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 4: Log Mission Support Intent
 */
export async function testLogMissionSupportIntent() {
    try {
        console.log('🧪 Testing logMissionSupportIntent()...');
        
        const testIntent = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            amount: 25.00,
            missionSupportName: 'Test Mission Support',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
            phone: '123-456-7890',
            paymentMethod: 'crypto',
            source: 'missionSupportForm'
        };
        
        const result = await logMissionSupportIntent(testIntent);
        
        if (result.success) {
            console.log('✅ logMissionSupportIntent() SUCCESS');
            console.log('   Intent ID:', result.intentId);
            return { success: true, result };
        } else {
            console.log('❌ logMissionSupportIntent() FAILED');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ logMissionSupportIntent() EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 5: Create NOWPayments Invoice (Test Mode)
 */
export async function testCreateNowPaymentsInvoice() {
    try {
        console.log('🧪 Testing createNowPaymentsInvoice()...');
        
        const testInvoice = {
            intentId: 'test_' + Date.now(),
            amount: 1.00,
            email: 'test@example.com',
            sessionId: 'test_session_' + Date.now(),
            firstName: 'Test',
            lastName: 'User',
            missionSupportName: 'Test Mission'
        };
        
        const result = await createNowPaymentsInvoice(testInvoice);
        
        if (result.success) {
            console.log('✅ createNowPaymentsInvoice() SUCCESS');
            console.log('   Invoice ID:', result.invoiceData?.invoice_id);
            console.log('   Payment URL:', result.invoiceData?.invoice_url);
            return { success: true, result };
        } else {
            console.log('❌ createNowPaymentsInvoice() FAILED');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ createNowPaymentsInvoice() EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 6: Run All Tests
 */
export async function runAllTests() {
    console.log('🚀 Running All Backend Function Tests...');
    console.log('==========================================');
    
    const results = {
        getLatestDonation: await testGetLatestDonation(),
        saveDonation: await testSaveDonation(),
        logContributionIntent: await testLogContributionIntent(),
        logMissionSupportIntent: await testLogMissionSupportIntent(),
        createNowPaymentsInvoice: await testCreateNowPaymentsInvoice()
    };
    
    console.log('');
    console.log('==========================================');
    console.log('📊 Test Results Summary:');
    console.log('');
    
    let passed = 0;
    let failed = 0;
    
    for (const [testName, result] of Object.entries(results)) {
        if (result.success) {
            console.log(`✅ ${testName}: PASSED`);
            passed++;
        } else {
            console.log(`❌ ${testName}: FAILED - ${result.error}`);
            failed++;
        }
    }
    
    console.log('');
    console.log(`Total: ${passed + failed} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('');
    
    return {
        success: failed === 0,
        passed,
        failed,
        results
    };
}





