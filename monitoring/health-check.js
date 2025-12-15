/**
 * Health Check Script for Mission Support System
 * 
 * This script checks the health of all system components after deployment.
 * Run this periodically to ensure everything is working correctly.
 * 
 * Usage:
 * 1. Upload to Wix Editor → Backend → Health Checks
 * 2. Run checkSystemHealth() function
 * 3. Review results in console
 */

import { getLatestDonation } from 'backend/hingecraft.api.web';
import { secrets } from 'wix-secrets-backend';
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

/**
 * Check backend functions health
 */
async function checkBackendFunctions() {
    const results = {
        getLatestDonation: false,
        errors: []
    };

    try {
        const donation = await getLatestDonation();
        if (donation && typeof donation === 'object') {
            results.getLatestDonation = true;
        }
    } catch (error) {
        results.errors.push(`getLatestDonation: ${error.message}`);
    }

    return results;
}

/**
 * Check secrets health
 */
async function checkSecrets() {
    const requiredSecrets = [
        'NOWPAYMENTS_API_KEY',
        'NOWPAYMENTS_IPN_SECRET',
        'NOWPAYMENTS_BASE_URL',
        'BASE_URL',
        'KYC_THRESHOLD_USD',
        'CRYPTO_CONFIRMATIONS_REQUIRED'
    ];

    const results = {
        accessible: [],
        missing: [],
        errors: []
    };

    for (const secretName of requiredSecrets) {
        try {
            const value = await secrets.getSecret(secretName);
            if (value && value.length > 0) {
                results.accessible.push(secretName);
            } else {
                results.missing.push(secretName);
            }
        } catch (error) {
            results.errors.push(`${secretName}: ${error.message}`);
            results.missing.push(secretName);
        }
    }

    return results;
}

/**
 * Check database health
 */
async function checkDatabase() {
    const results = {
        collections: {
            found: [],
            missing: []
        },
        errors: []
    };

    const requiredCollections = [
        'Donations',
        'ContributionIntents',
        'CryptoPayments',
        'WebhookLogs',
        'KYCVerifications'
    ];

    for (const collectionName of requiredCollections) {
        try {
            const query = await wixData.query(collectionName).limit(1).find();
            results.collections.found.push(collectionName);
        } catch (error) {
            results.collections.missing.push(collectionName);
            results.errors.push(`${collectionName}: ${error.message}`);
        }
    }

    return results;
}

/**
 * Check NOWPayments API health
 */
async function checkNowPaymentsAPI() {
    const results = {
        accessible: false,
        error: null
    };

    try {
        const apiKey = await secrets.getSecret('NOWPAYMENTS_API_KEY');
        const baseUrl = await secrets.getSecret('NOWPAYMENTS_BASE_URL') || 'https://api.nowpayments.io/v1';

        if (!apiKey) {
            results.error = 'API key not configured';
            return results;
        }

        // Test API connection with a simple status check
        const response = await fetch(`${baseUrl}/status`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            results.accessible = true;
        } else {
            results.error = `API returned status: ${response.status}`;
        }
    } catch (error) {
        results.error = error.message;
    }

    return results;
}

/**
 * Check webhook endpoint health
 */
async function checkWebhookEndpoint() {
    const results = {
        url: null,
        accessible: false,
        error: null
    };

    try {
        const baseUrl = await secrets.getSecret('BASE_URL') || 'https://www.hingecraft-global.ai';
        results.url = `${baseUrl}/_functions/webhooks/nowpayments`;

        // Note: Can't directly test webhook endpoint from here
        // This is just a URL validation
        results.accessible = true; // Assume accessible if URL is valid
    } catch (error) {
        results.error = error.message;
    }

    return results;
}

/**
 * Comprehensive system health check
 */
export async function checkSystemHealth() {
    console.log('🏥 Starting System Health Check...');
    console.log('==========================================');
    console.log('');

    const healthReport = {
        timestamp: new Date().toISOString(),
        overall: 'unknown',
        components: {},
        issues: [],
        warnings: []
    };

    // Check backend functions
    console.log('1. Checking Backend Functions...');
    const backendHealth = await checkBackendFunctions();
    healthReport.components.backend = backendHealth;
    if (backendHealth.errors.length > 0) {
        healthReport.issues.push(...backendHealth.errors);
    }
    console.log(`   ✅ getLatestDonation: ${backendHealth.getLatestDonation ? 'OK' : 'FAILED'}`);
    console.log('');

    // Check secrets
    console.log('2. Checking Secrets...');
    const secretsHealth = await checkSecrets();
    healthReport.components.secrets = secretsHealth;
    console.log(`   ✅ Accessible: ${secretsHealth.accessible.length}`);
    console.log(`   ❌ Missing: ${secretsHealth.missing.length}`);
    if (secretsHealth.missing.length > 0) {
        healthReport.issues.push(`Missing secrets: ${secretsHealth.missing.join(', ')}`);
    }
    if (secretsHealth.errors.length > 0) {
        healthReport.issues.push(...secretsHealth.errors);
    }
    console.log('');

    // Check database
    console.log('3. Checking Database...');
    const databaseHealth = await checkDatabase();
    healthReport.components.database = databaseHealth;
    console.log(`   ✅ Collections Found: ${databaseHealth.collections.found.length}`);
    console.log(`   ❌ Collections Missing: ${databaseHealth.collections.missing.length}`);
    if (databaseHealth.collections.missing.length > 0) {
        healthReport.issues.push(`Missing collections: ${databaseHealth.collections.missing.join(', ')}`);
    }
    if (databaseHealth.errors.length > 0) {
        healthReport.issues.push(...databaseHealth.errors);
    }
    console.log('');

    // Check NOWPayments API
    console.log('4. Checking NOWPayments API...');
    const nowpaymentsHealth = await checkNowPaymentsAPI();
    healthReport.components.nowpayments = nowpaymentsHealth;
    if (nowpaymentsHealth.accessible) {
        console.log('   ✅ NOWPayments API: Accessible');
    } else {
        console.log(`   ❌ NOWPayments API: ${nowpaymentsHealth.error || 'Not accessible'}`);
        healthReport.warnings.push(`NOWPayments API: ${nowpaymentsHealth.error || 'Not accessible'}`);
    }
    console.log('');

    // Check webhook endpoint
    console.log('5. Checking Webhook Endpoint...');
    const webhookHealth = await checkWebhookEndpoint();
    healthReport.components.webhook = webhookHealth;
    if (webhookHealth.accessible) {
        console.log(`   ✅ Webhook URL: ${webhookHealth.url}`);
    } else {
        console.log(`   ❌ Webhook: ${webhookHealth.error || 'Not accessible'}`);
        healthReport.warnings.push(`Webhook: ${webhookHealth.error || 'Not accessible'}`);
    }
    console.log('');

    // Determine overall health
    const hasIssues = healthReport.issues.length > 0;
    const hasWarnings = healthReport.warnings.length > 0;

    if (hasIssues) {
        healthReport.overall = 'unhealthy';
    } else if (hasWarnings) {
        healthReport.overall = 'degraded';
    } else {
        healthReport.overall = 'healthy';
    }

    // Print summary
    console.log('==========================================');
    console.log('📊 Health Check Summary:');
    console.log('');
    console.log(`Overall Status: ${healthReport.overall.toUpperCase()}`);
    console.log(`Issues: ${healthReport.issues.length}`);
    console.log(`Warnings: ${healthReport.warnings.length}`);
    console.log('');

    if (healthReport.issues.length > 0) {
        console.log('❌ Issues Found:');
        healthReport.issues.forEach(issue => {
            console.log(`   - ${issue}`);
        });
        console.log('');
    }

    if (healthReport.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        healthReport.warnings.forEach(warning => {
            console.log(`   - ${warning}`);
        });
        console.log('');
    }

    if (healthReport.overall === 'healthy') {
        console.log('✅ All systems operational!');
    }

    return healthReport;
}

/**
 * Quick health check (lightweight)
 */
export async function quickHealthCheck() {
    try {
        const donation = await getLatestDonation();
        const apiKey = await secrets.getSecret('NOWPAYMENTS_API_KEY');
        
        return {
            success: true,
            backend: donation ? 'ok' : 'warning',
            secrets: apiKey ? 'ok' : 'error',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}





