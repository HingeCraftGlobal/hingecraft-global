/**
 * Secrets Access Test Script
 * 
 * This script tests that all required secrets are accessible in Wix Secrets Manager.
 * 
 * Usage:
 * 1. Upload this file to Wix Editor → Backend → Test Scripts
 * 2. Run testAllSecrets() function
 * 3. Check console for results
 */

import { secrets } from 'wix-secrets-backend';

/**
 * List of required secrets
 */
const REQUIRED_SECRETS = [
    'NOWPAYMENTS_API_KEY',
    'NOWPAYMENTS_IPN_SECRET',
    'NOWPAYMENTS_BASE_URL',
    'BASE_URL',
    'KYC_THRESHOLD_USD',
    'CRYPTO_CONFIRMATIONS_REQUIRED',
    'EXTERNAL_DB_ENDPOINT',
    'EXTERNAL_DB_SECRET_KEY',
    'SENDGRID_API_KEY',
    'EMAIL_FROM'
];

/**
 * Test individual secret access
 */
async function testSecret(secretName) {
    try {
        const value = await secrets.getSecret(secretName);
        
        if (value && value.length > 0) {
            // Mask sensitive values for logging
            const maskedValue = secretName.includes('KEY') || secretName.includes('SECRET') 
                ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
                : value;
            
            console.log(`✅ ${secretName}: ACCESSIBLE`);
            console.log(`   Value: ${maskedValue}`);
            return { success: true, secretName, accessible: true };
        } else {
            console.log(`❌ ${secretName}: EMPTY`);
            return { success: false, secretName, accessible: false, error: 'Secret is empty' };
        }
    } catch (error) {
        console.log(`❌ ${secretName}: ERROR`);
        console.log(`   Error: ${error.message}`);
        return { success: false, secretName, accessible: false, error: error.message };
    }
}

/**
 * Test all secrets
 */
export async function testAllSecrets() {
    console.log('🔐 Testing Secrets Access...');
    console.log('==========================================');
    console.log('');
    
    const results = {};
    let accessible = 0;
    let inaccessible = 0;
    
    for (const secretName of REQUIRED_SECRETS) {
        const result = await testSecret(secretName);
        results[secretName] = result;
        
        if (result.accessible) {
            accessible++;
        } else {
            inaccessible++;
        }
        
        console.log('');
    }
    
    console.log('==========================================');
    console.log('📊 Secrets Test Summary:');
    console.log('');
    console.log(`Total Secrets: ${REQUIRED_SECRETS.length}`);
    console.log(`✅ Accessible: ${accessible}`);
    console.log(`❌ Inaccessible: ${inaccessible}`);
    console.log('');
    
    if (inaccessible > 0) {
        console.log('⚠️  Missing or Inaccessible Secrets:');
        for (const [secretName, result] of Object.entries(results)) {
            if (!result.accessible) {
                console.log(`   - ${secretName}: ${result.error}`);
            }
        }
        console.log('');
    }
    
    return {
        success: inaccessible === 0,
        accessible,
        inaccessible,
        results
    };
}

/**
 * Test specific secret
 */
export async function testSecretByName(secretName) {
    console.log(`🔐 Testing Secret: ${secretName}...`);
    console.log('');
    
    const result = await testSecret(secretName);
    
    return result;
}

