/**
 * Mission Support Page Velo Middleware
 * T10 Implementation: Full middleware binding + dynamic totals + 2-page sync
 * 
 * Functions:
 * - onReady() → load Stripe + crypto handlers
 * - handleUserInputDonation() → validate → send to payment
 * - goToCharterAfterPayment(value) → pass donation amount
 * - databaseWrite() → store contribution
 * - dynamic update reference → reflect accurate totals
 * 
 * IMPORTANT: This is a web module - can be called from frontend
 * Permissions: Anyone (for public access)
 */

import wixData from 'wix-data';
import { createNowPaymentsInvoice } from 'backend/nowpayments.api';
import { logMissionSupportIntent } from 'backend/hingecraft.api.web';
import { redirectBackToCharter } from 'backend/charter-page-middleware';

/**
 * Initialize mission support page on ready
 * Loads Stripe and crypto handlers
 * @public
 */
export async function onReady() {
    try {
        console.log('🚀 Mission Support Page Middleware: onReady()');
        
        // Get cumulative total from database
        const { getCumulativeTotal } = await import('backend/charter-page-middleware');
        const totalResult = await getCumulativeTotal();
        
        // Setup database change listeners
        setupDatabaseListeners();
        
        return {
            success: true,
            cumulativeTotal: totalResult.total
        };
    } catch (error) {
        console.error('❌ Mission Support onReady error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle user input donation
 * Validates and sends to payment flow
 * @public
 * @param {Object} formData - Form data with donation details
 */
export async function handleUserInputDonation(formData) {
    try {
        console.log('💰 User input donation:', formData);
        
        // Validate form data
        const validationResult = validateFormData(formData);
        if (!validationResult.valid) {
            throw new Error(validationResult.error);
        }
        
        const amount = parseFloat(formData.amount);
        const paymentMethod = formData.paymentMethod || 'card';
        
        // Log mission support intent
        const sessionId = await getSessionId();
        const anonymousFingerprint = await getAnonymousFingerprint();
        
        const intentResult = await logMissionSupportIntent({
            formData: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                missionSupportName: formData.missionSupportName || null
            },
            amountEntered: amount,
            timestamp: new Date().toISOString(),
            sessionID: sessionId,
            anonymousFingerprint: anonymousFingerprint,
            referrerSource: formData.referrerSource || 'direct',
            pageUrl: formData.pageUrl || 'unknown',
            userAgent: formData.userAgent || 'unknown'
        });
        
        if (!intentResult.success) {
            console.warn('⚠️ Intent logging failed (non-blocking):', intentResult.error);
        }
        
        // Handle payment method
        if (paymentMethod === 'crypto') {
            // Create crypto invoice
            const invoiceResult = await createNowPaymentsInvoice({
                intentId: intentResult.intentId || sessionId,
                amount: amount,
                email: formData.email,
                sessionId: sessionId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                missionSupportName: formData.missionSupportName || null
            });
            
            if (!invoiceResult.success) {
                throw new Error(invoiceResult.error || 'Failed to create crypto invoice');
            }
            
            // Store invoice data
            await storeCryptoInvoiceData(invoiceResult);
            
            return {
                success: true,
                paymentMethod: 'crypto',
                invoiceId: invoiceResult.invoiceId,
                paymentUrl: invoiceResult.paymentUrl,
                payAddress: invoiceResult.payAddress,
                payAmountCrypto: invoiceResult.payAmountCrypto,
                payCurrency: invoiceResult.payCurrency
            };
        } else {
            // Card payment: redirect to charter page
            const redirectResult = await goToCharterAfterPayment(amount);
            
            return {
                success: true,
                paymentMethod: 'card',
                redirectUrl: redirectResult.redirectUrl,
                amount: amount
            };
        }
    } catch (error) {
        console.error('❌ Handle user input donation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Go to charter page after payment
 * Passes donation amount to charter page
 * @public
 * @param {number} value - Donation amount
 */
export async function goToCharterAfterPayment(value) {
    try {
        console.log('🔄 Redirecting to charter page with amount:', value);
        
        // Store donation amount
        await storeDonationAmount(value, 'card', null);
        
        // Get redirect URL
        const redirectResult = await redirectBackToCharter(value, 'card');
        
        return {
            success: true,
            redirectUrl: redirectResult.redirectUrl,
            amount: value
        };
    } catch (error) {
        console.error('❌ Go to charter error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Write to database
 * Stores contribution intent
 * @public
 * @param {Object} contributionData - Contribution data
 */
export async function databaseWrite(contributionData) {
    try {
        console.log('💾 Writing to database:', contributionData);
        
        // Save to ContributionIntent collection
        const intentRecord = {
            amount_entered: parseFloat(contributionData.amount),
            status: 'intent',
            source: 'missionSupportForm',
            first_name: contributionData.firstName || null,
            last_name: contributionData.lastName || null,
            email: contributionData.email || null,
            address: contributionData.address || null,
            mission_support_name: contributionData.missionSupportName || null,
            session_id: contributionData.sessionId || await getSessionId(),
            anonymous_fingerprint: contributionData.anonymousFingerprint || await getAnonymousFingerprint(),
            timestamp: new Date().toISOString(),
            metadata: contributionData.metadata || {}
        };
        
        const result = await wixData.save('ContributionIntent', intentRecord);
        
        // Update cumulative total
        const { getCumulativeTotal } = await import('backend/charter-page-middleware');
        const totalResult = await getCumulativeTotal();
        
        return {
            success: true,
            intentId: result._id,
            cumulativeTotal: totalResult.total
        };
    } catch (error) {
        console.error('❌ Database write error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get dynamic update reference
 * Returns function to update totals dynamically
 * @public
 */
export async function getDynamicUpdateReference() {
    try {
        const { getCumulativeTotal } = await import('backend/charter-page-middleware');
        
        return {
            updateTotals: async () => {
                const totalResult = await getCumulativeTotal();
                return totalResult;
            },
            subscribeToChanges: (callback) => {
                // Setup listeners
                wixData.onChange('Donations', async () => {
                    const totalResult = await getCumulativeTotal();
                    if (callback) callback(totalResult);
                });
                
                wixData.onChange('CryptoPayments', async () => {
                    const totalResult = await getCumulativeTotal();
                    if (callback) callback(totalResult);
                });
            }
        };
    } catch (error) {
        console.error('❌ Error getting dynamic update reference:', error);
        return null;
    }
}

/**
 * Validate form data
 */
function validateFormData(formData) {
    const firstNamePattern = /^[a-zA-Z\-\s]{1,50}$/;
    const lastNamePattern = /^[a-zA-Z\-\s]{1,50}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const addressPattern = /^[a-zA-Z0-9\s\-\.,#]{1,200}$/;
    const missionSupportNamePattern = /^[a-zA-Z0-9\s\-\.,]{0,200}$/;
    const amountPattern = /^\d{1,5}(\.\d{1,2})?$/;
    
    if (!formData.firstName || !firstNamePattern.test(formData.firstName)) {
        return { valid: false, error: 'Invalid first name' };
    }
    
    if (!formData.lastName || !lastNamePattern.test(formData.lastName)) {
        return { valid: false, error: 'Invalid last name' };
    }
    
    if (!formData.email || !emailPattern.test(formData.email)) {
        return { valid: false, error: 'Invalid email' };
    }
    
    if (!formData.address || !addressPattern.test(formData.address)) {
        return { valid: false, error: 'Invalid address' };
    }
    
    if (formData.missionSupportName && !missionSupportNamePattern.test(formData.missionSupportName)) {
        return { valid: false, error: 'Invalid mission support name' };
    }
    
    if (!formData.amount) {
        return { valid: false, error: 'Amount is required' };
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 1.00 || amount > 25000.00) {
        return { valid: false, error: 'Amount must be between $1.00 and $25,000.00' };
    }
    
    if (!amountPattern.test(String(amount))) {
        return { valid: false, error: 'Invalid amount format' };
    }
    
    return { valid: true };
}

/**
 * Setup database change listeners
 */
function setupDatabaseListeners() {
    try {
        // Listen for changes to ContributionIntent collection
        wixData.onChange('ContributionIntent', async (changedItem) => {
            console.log('📊 ContributionIntent collection changed:', changedItem);
        });
        
        // Listen for changes to Donations collection
        wixData.onChange('Donations', async (changedItem) => {
            console.log('📊 Donations collection changed:', changedItem);
        });
        
        // Listen for changes to CryptoPayments collection
        wixData.onChange('CryptoPayments', async (changedItem) => {
            console.log('📊 CryptoPayments collection changed:', changedItem);
        });
    } catch (error) {
        console.error('Error setting up database listeners:', error);
    }
}

/**
 * Store crypto invoice data
 */
async function storeCryptoInvoiceData(invoiceData) {
    try {
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            wixStorage.session.setItem('hc_nowpay_invoice', JSON.stringify({
                invoiceId: invoiceData.invoiceId,
                paymentUrl: invoiceData.paymentUrl,
                orderId: invoiceData.orderId,
                intentId: invoiceData.intentId,
                payAddress: invoiceData.payAddress,
                payAmountCrypto: invoiceData.payAmountCrypto,
                payCurrency: invoiceData.payCurrency,
                timestamp: new Date().toISOString()
            }));
        }
    } catch (error) {
        console.error('Error storing crypto invoice:', error);
    }
}

/**
 * Store donation amount
 */
async function storeDonationAmount(amount, method, coin) {
    try {
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            wixStorage.session.setItem('hingecraft_donation', JSON.stringify({
                amount: amount,
                paymentMethod: method,
                coin: coin,
                timestamp: new Date().toISOString(),
                source: 'mission_support_form'
            }));
        }
    } catch (error) {
        console.error('Error storing donation amount:', error);
    }
}

/**
 * Get session ID
 */
async function getSessionId() {
    try {
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            let sessionId = wixStorage.session.getItem('hingecraft_session_id');
            if (!sessionId) {
                sessionId = 'hc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                wixStorage.session.setItem('hingecraft_session_id', sessionId);
            }
            return sessionId;
        }
        return 'hc_' + Date.now();
    } catch (error) {
        return 'hc_' + Date.now();
    }
}

/**
 * Get prefill data by ID
 * Used by Charter page to retrieve prefill amount from Mission Support form
 * @public
 * @param {string} prefillId - Prefill token ID
 */
export async function getPrefill(prefillId) {
    try {
        if (!prefillId) {
            throw new Error('Prefill ID is required');
        }
        
        // Try to get from ContributionIntent collection
        let prefillData = null;
        try {
            const result = await wixData.get('ContributionIntent', prefillId);
            if (result) {
                // Check if expired
                const expiresAt = new Date(result.expires_at);
                if (expiresAt < new Date()) {
                    throw new Error('Prefill token expired');
                }
                
                // Check if already used
                if (result.used) {
                    throw new Error('Prefill token already used');
                }
                
                prefillData = result;
            }
        } catch (dbError) {
            if (dbError.message !== 'Item not found') {
                throw dbError;
            }
        }
        
        if (!prefillData) {
            throw new Error('Prefill token not found or expired');
        }
        
        // Mark as used (if from DB)
        if (prefillData._id) {
            try {
                await wixData.update('ContributionIntent', {
                    ...prefillData,
                    used: true,
                    used_at: new Date()
                });
            } catch (updateError) {
                console.warn('⚠️ Error marking prefill as used:', updateError);
            }
        }
        
        return {
            success: true,
            amount: prefillData.amount_entered || prefillData.amount,
            prefillId: prefillId,
            userInfo: {
                firstName: prefillData.first_name || null,
                lastName: prefillData.last_name || null,
                email: prefillData.email || null,
                address: prefillData.address || null
            }
        };
    } catch (error) {
        console.error('❌ Get prefill error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get anonymous fingerprint
 */
async function getAnonymousFingerprint() {
    try {
        // This would typically use canvas fingerprinting
        // For backend, we'll use a simple hash
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return 'fp_' + timestamp + '_' + random;
    } catch (error) {
        return 'fp_' + Date.now();
    }
}
