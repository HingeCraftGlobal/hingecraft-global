/**
 * HingeCraft Backend API for Wix Velo
 * 
 * This file should be deployed as: backend/hingecraft-api.jsw
 * 
 * It connects to the external database adaptor (Docker-based PostgreSQL)
 * to store and retrieve donation data.
 */

import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';

// ============================================
// CONFIGURATION
// ============================================

// Option 1: Use Wix Secrets Manager (Recommended for Production)
let EXTERNAL_DB_ENDPOINT;
let EXTERNAL_DB_SECRET_KEY;
let USE_EXTERNAL_DB = true;

// Initialize configuration from secrets
async function initConfig() {
    try {
        EXTERNAL_DB_ENDPOINT = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
        EXTERNAL_DB_SECRET_KEY = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
    } catch (error) {
        console.warn('Could not load secrets, using fallback configuration:', error);
        // Fallback to hardcoded values (not recommended for production)
        EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev'; // ngrok URL for Wix connection
        EXTERNAL_DB_SECRET_KEY = '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b'; // Secret key
    }
}

// Initialize on module load
initConfig();

// Option 2: Hardcoded Configuration (Alternative - Update these values)
// const EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev'; // For local Docker
// const EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev'; // For production
// const EXTERNAL_DB_SECRET_KEY = '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b';
// const USE_EXTERNAL_DB = true;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Make authenticated request to external database adaptor
 */
async function makeRequest(method, path, body = null) {
    if (!USE_EXTERNAL_DB || !EXTERNAL_DB_ENDPOINT) {
        throw new Error('External database not configured');
    }

    const url = `${EXTERNAL_DB_ENDPOINT}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
        'X-API-Key': EXTERNAL_DB_SECRET_KEY
    };

    const options = {
        method: method,
        headers: headers
    };

    if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Database adaptor request failed:', error);
        throw error;
    }
}

// ============================================
// PUBLIC API FUNCTIONS
// ============================================

/**
 * Get the latest donation from the database
 * 
 * @returns {Promise<Object>} Latest donation object with id, amount, currency, is_other_amount, created_at
 * 
 * Usage in frontend:
 * import { getLatestDonation } from 'backend/hingecraft-api';
 * const donation = await getLatestDonation();
 */
export async function getLatestDonation() {
    try {
        const donation = await makeRequest('GET', '/donations/latest');
        return donation;
    } catch (error) {
        console.error('Error getting latest donation:', error);
        
        // Return null if no donations found (404)
        if (error.message && error.message.includes('404')) {
            return null;
        }
        
        throw error;
    }
}

/**
 * Save a new donation to the database
 * 
 * @param {number} amount - Donation amount
 * @param {Object} options - Additional donation data
 * @param {string} options.currency - Currency code (default: 'USD')
 * @param {boolean} options.isOtherAmount - True if custom amount (default: false)
 * @param {string} options.source - Source identifier (default: 'payment_page')
 * @param {string} options.paymentStatus - Payment status (default: 'completed')
 * @param {string} options.paymentMethod - Payment method
 * @param {string} options.transactionId - Transaction ID
 * @param {string} options.memberEmail - Member email
 * @param {string} options.memberName - Member name
 * @param {Object} options.metadata - Additional metadata
 * 
 * @returns {Promise<Object>} Created donation object with id, amount, created_at
 * 
 * Usage:
 * import { saveDonation } from 'backend/hingecraft-api';
 * const donation = await saveDonation(50.00, {
 *   isOtherAmount: true,
 *   paymentMethod: 'card',
 *   memberEmail: 'user@example.com'
 * });
 */
export async function saveDonation(amount, options = {}) {
    if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    const donationData = {
        amount: parseFloat(amount),
        currency: options.currency || 'USD',
        is_other_amount: options.isOtherAmount || false,
        source: options.source || 'payment_page',
        payment_status: options.paymentStatus || 'completed',
        payment_method: options.paymentMethod || null,
        transaction_id: options.transactionId || null,
        member_email: options.memberEmail || null,
        member_name: options.memberName || null,
        metadata: options.metadata || null
    };

    try {
        const donation = await makeRequest('POST', '/donations', donationData);
        return donation;
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}

/**
 * Get all donations with optional limit
 * 
 * @param {number} limit - Maximum number of donations to return (default: 100)
 * @param {number} offset - Number of donations to skip (default: 0)
 * 
 * @returns {Promise<Object>} Object with donations array, total, limit, offset
 * 
 * Usage:
 * import { getAllDonations } from 'backend/hingecraft-api';
 * const result = await getAllDonations(50, 0);
 */
export async function getAllDonations(limit = 100, offset = 0) {
    try {
        const result = await makeRequest('GET', `/donations?limit=${limit}&offset=${offset}`);
        return result;
    } catch (error) {
        console.error('Error getting donations:', error);
        throw error;
    }
}

/**
 * Get a specific donation by ID
 * 
 * @param {string} id - Donation ID
 * 
 * @returns {Promise<Object>} Donation object
 * 
 * Usage:
 * import { getDonationById } from 'backend/hingecraft-api';
 * const donation = await getDonationById('donation-id-123');
 */
export async function getDonationById(id) {
    if (!id) {
        throw new Error('Donation ID is required');
    }

    try {
        const donation = await makeRequest('GET', `/donations/${id}`);
        return donation;
    } catch (error) {
        console.error('Error getting donation:', error);
        
        if (error.message && error.message.includes('404')) {
            return null;
        }
        
        throw error;
    }
}

/**
 * Update a donation's status or other fields
 * 
 * @param {string} id - Donation ID
 * @param {Object} updates - Fields to update
 * @param {string} updates.paymentStatus - New payment status
 * @param {string} updates.paymentMethod - Payment method
 * @param {Object} updates.metadata - Updated metadata
 * 
 * @returns {Promise<Object>} Updated donation object
 * 
 * Usage:
 * import { updateDonationStatus } from 'backend/hingecraft-api';
 * const donation = await updateDonationStatus('donation-id-123', {
 *   paymentStatus: 'completed'
 * });
 */
export async function updateDonationStatus(id, updates = {}) {
    if (!id) {
        throw new Error('Donation ID is required');
    }

    try {
        const donation = await makeRequest('PATCH', `/donations/${id}`, updates);
        return donation;
    } catch (error) {
        console.error('Error updating donation:', error);
        throw error;
    }
}

/**
 * Test the database connection
 * 
 * @returns {Promise<Object>} Health check result
 * 
 * Usage:
 * import { testConnection } from 'backend/hingecraft-api';
 * const health = await testConnection();
 */
export async function testConnection() {
    try {
        // Health endpoint now requires authentication (API is private)
        const url = `${EXTERNAL_DB_ENDPOINT}/health`;
        const headers = {
            'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
            'X-API-Key': EXTERNAL_DB_SECRET_KEY
        };
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Connection test failed:', error);
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

// ============================================
// CONFIGURATION FOR EXTERNAL DATABASE ADAPTOR
// ============================================

/**
 * Configuration for External Database Adaptor
 * 
 * If using "Custom" database type in Wix:
 * 
 * 1. Go to Wix Editor → Database → External Database
 * 2. Click "Connect External Database"
 * 3. Select "Custom"
 * 4. Enter:
 *    - Connection Name: HingeCraftDonationsDB
 *    - Endpoint URL: YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL
 *      * For Docker (local): http://localhost:3000
 *      * For Production: https://your-deployed-api-url.com
 *    - Secret Key: YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY
 *      * This should match the SECRET_KEY in your database adaptor .env file
 * 
 * 5. Set up Wix Secrets Manager (recommended):
 *    - Go to Settings → Secrets Manager
 *    - Add secret: EXTERNAL_DB_ENDPOINT = your endpoint URL
 *    - Add secret: EXTERNAL_DB_SECRET_KEY = your secret key
 * 
 * 6. The initConfig() function will automatically load these secrets
 * 
 * For Docker setup, see DOCKER_SETUP.md
 * For connection setup, see DATABASE_CONNECTION_SETUP.md
 */





