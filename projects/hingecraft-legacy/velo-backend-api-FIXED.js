/**
 * HingeCraft Backend API for Wix Velo - FIXED FOR WDE0116
 * 
 * This file should be deployed as: backend/hingecraft-api.jsw
 * 
 * FIXES APPLIED:
 * 1. Correct field names (snake_case)
 * 2. Direct API calls (no wixData.aggregate)
 * 3. Proper error handling
 */

import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';

// Configuration
let EXTERNAL_DB_ENDPOINT;
let EXTERNAL_DB_SECRET_KEY;

async function initConfig() {
    try {
        EXTERNAL_DB_ENDPOINT = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
        EXTERNAL_DB_SECRET_KEY = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
    } catch (error) {
        console.warn('Using fallback configuration:', error);
        // UPDATE THIS with your ngrok URL or production URL
        EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev';
        EXTERNAL_DB_SECRET_KEY = '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b';
    }
}

initConfig();

async function makeRequest(method, path, body = null) {
    if (!EXTERNAL_DB_ENDPOINT) {
        throw new Error('External database not configured');
    }

    const url = `${EXTERNAL_DB_ENDPOINT}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
        'X-API-Key': EXTERNAL_DB_SECRET_KEY
    };

    const options = { method, headers };
    if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Database adaptor request failed:', error);
        throw error;
    }
}

// ✅ CORRECT: Get latest donation
export async function getLatestDonation() {
    try {
        const donation = await makeRequest('GET', '/donations/latest');
        // ✅ Use correct field names
        return {
            id: donation.id,
            amount: donation.amount,
            currency: donation.currency,
            is_other_amount: donation.is_other_amount,
            created_at: donation.created_at
        };
    } catch (error) {
        if (error.message && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

// ✅ CORRECT: Save donation with correct field names
export async function saveDonation(amount, options = {}) {
    if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    // ✅ Use correct field names (snake_case)
    const donationData = {
        amount: parseFloat(amount),
        currency: options.currency || 'USD',
        is_other_amount: options.isOtherAmount || false,  // ✅ Correct
        source: options.source || 'payment_page',
        payment_status: options.paymentStatus || 'completed',  // ✅ Correct
        payment_method: options.paymentMethod || null,  // ✅ Correct
        transaction_id: options.transactionId || null,  // ✅ Correct
        member_email: options.memberEmail || null,  // ✅ Correct
        member_name: options.memberName || null,  // ✅ Correct
        metadata: options.metadata || null
    };

    try {
        return await makeRequest('POST', '/donations', donationData);
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}

// ✅ CORRECT: Get all donations (no aggregate)
export async function getAllDonations(limit = 100, offset = 0) {
    try {
        const result = await makeRequest('GET', `/donations?limit=${limit}&offset=${offset}`);
        return result;
    } catch (error) {
        console.error('Error getting donations:', error);
        throw error;
    }
}

// ✅ CORRECT: Test connection (API is private - requires auth)
export async function testConnection() {
    try {
        const url = `${EXTERNAL_DB_ENDPOINT}/health`;
        const headers = {
            'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
            'X-API-Key': EXTERNAL_DB_SECRET_KEY
        };
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}
