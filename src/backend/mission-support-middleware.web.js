/**
 * Mission Support Middleware - Wix Velo Web Module
 * Handles Mission Support form submissions and redirects
 * 
 * Functions:
 * - microPayment(amount) → Create Stripe session for $1/$2/$5
 * - otherAmount(amount, userInfo) → Create prefill token and return redirect URL
 * - getPrefill(prefillId) → Retrieve prefill data for Charter page
 * 
 * IMPORTANT: This is a web module - can be called from frontend
 * Permissions: Anyone (for public access)
 */

import wixData from 'wix-data';
import { createCheckoutSession } from 'backend/stripe.api';
import { createNowPaymentsInvoice } from 'backend/nowpayments.api';

/**
 * Handle micro payment ($1, $2, $5)
 * Creates Stripe checkout session immediately
 * @public
 * @param {number} amount - Must be 1, 2, or 5
 * @param {Object} userInfo - Optional user information
 */
export async function microPayment(amount, userInfo = {}) {
    try {
        console.log('💰 Micro payment requested:', { amount, userInfo });
        
        // Validate amount
        if (![1, 2, 5].includes(amount)) {
            throw new Error('Invalid micro payment amount. Must be 1, 2, or 5.');
        }
        
        // Get base URL
        const baseUrl = await getBaseUrl();
        
        // Create Stripe checkout session
        const sessionResult = await createCheckoutSession({
            amount: amount,
            currency: 'USD',
            paymentMethod: 'card',
            successUrl: `${baseUrl}/payment-success?amount=${amount}&method=micro&source=mission_support`,
            cancelUrl: `${baseUrl}/mission-support?canceled=true&amount=${amount}`,
            donationId: null,
            email: userInfo.email || null,
            baseUrl: baseUrl,
            metadata: {
                source: 'mission_support_micro',
                preset_amount: amount,
                user_info: userInfo
            }
        });
        
        if (!sessionResult.success) {
            throw new Error(sessionResult.error || 'Failed to create Stripe session');
        }
        
        // Save payment record to database
        try {
            const paymentRecord = {
                amount: amount,
                currency: 'USD',
                payment_method: 'stripe',
                payment_status: 'pending',
                gateway: 'stripe',
                provider: 'stripe',
                provider_id: sessionResult.sessionId,
                provider_url: sessionResult.url,
                source: 'mission_support_micro',
                metadata: {
                    preset_amount: amount,
                    user_info: userInfo,
                    stripe_session_id: sessionResult.sessionId
                }
            };
            
            await wixData.save('Donations', paymentRecord);
            
            // Also save to external_payments for routing
            await wixData.save('external_payments', {
                gateway: 'stripe',
                provider: 'stripe',
                provider_id: sessionResult.sessionId,
                provider_url: sessionResult.url,
                currency: 'USD',
                amount: amount,
                status: 'pending',
                metadata: {
                    source: 'mission_support_micro',
                    preset_amount: amount
                }
            });
        } catch (dbError) {
            console.warn('⚠️ Error saving payment record (non-blocking):', dbError);
            // Don't fail the request if database save fails
        }
        
        return {
            success: true,
            url: sessionResult.url,
            sessionId: sessionResult.sessionId,
            amount: amount
        };
    } catch (error) {
        console.error('❌ Micro payment error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle "Other" amount - create prefill token and return redirect URL
 * @public
 * @param {number} amount - Custom donation amount
 * @param {Object} userInfo - Optional user information
 */
export async function otherAmount(amount, userInfo = {}) {
    try {
        console.log('📝 Other amount requested:', { amount, userInfo });
        
        // Validate amount
        const validatedAmount = parseFloat(amount);
        if (isNaN(validatedAmount) || validatedAmount < 1.00 || validatedAmount > 25000.00) {
            throw new Error('Invalid amount. Must be between $1.00 and $25,000.00');
        }
        
        // Generate prefill token
        const prefillId = 'prefill_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        
        // Save prefill token to database (expires in 10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        try {
            const prefillRecord = {
                _id: prefillId,
                amount: validatedAmount,
                user_info: userInfo,
                created_at: new Date(),
                expires_at: expiresAt,
                used: false,
                source: 'mission_support_other'
            };
            
            // Save to ContributionIntent collection (or create PrefillTokens if separate)
            await wixData.save('ContributionIntent', prefillRecord);
            
            // Also store in session for immediate access
            if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                wixStorage.session.setItem('hingecraft_prefill', JSON.stringify({
                    prefillId: prefillId,
                    amount: validatedAmount,
                    expiresAt: expiresAt.toISOString()
                }));
            }
        } catch (dbError) {
            console.warn('⚠️ Error saving prefill token (non-blocking):', dbError);
            // Continue even if DB save fails - we'll use session storage
        }
        
        // Get base URL
        const baseUrl = await getBaseUrl();
        
        // Return redirect URL to Charter page
        const redirectUrl = `${baseUrl}/charter?prefill=${prefillId}&donationAmount=${validatedAmount}`;
        
        return {
            success: true,
            redirectUrl: redirectUrl,
            prefillId: prefillId,
            amount: validatedAmount
        };
    } catch (error) {
        console.error('❌ Other amount error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get prefill data by ID
 * Used by Charter page to retrieve prefill amount
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
            // If not found in DB, try session storage
            if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                const stored = wixStorage.session.getItem('hingecraft_prefill');
                if (stored) {
                    const data = JSON.parse(stored);
                    if (data.prefillId === prefillId) {
                        const expiresAt = new Date(data.expiresAt);
                        if (expiresAt >= new Date()) {
                            prefillData = {
                                amount: data.amount,
                                prefillId: data.prefillId
                            };
                        }
                    }
                }
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
            amount: prefillData.amount,
            prefillId: prefillId
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
 * Get base URL helper
 */
async function getBaseUrl() {
    try {
        if (typeof wixLocation !== 'undefined') {
            return wixLocation.baseUrl || 'https://www.hingecraft-global.ai';
        }
        return 'https://www.hingecraft-global.ai';
    } catch (e) {
        return 'https://www.hingecraft-global.ai';
    }
}
