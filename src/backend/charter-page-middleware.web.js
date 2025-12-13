/**
 * Charter Page Velo Middleware
 * T10 Implementation: Full middleware binding + dynamic totals + 2-page sync
 * 
 * Functions:
 * - onReady() → check dataset → update totals
 * - cryptoButtonClick(amount, coin) → call NowPayments handler
 * - fiatButtonClick(preset) → call Stripe dev key handler
 * - afterPaymentWebhook(payload) → update DB + totals
 * - redirectBackToCharter() → route with state
 * - getCumulativeTotal() → calculate total from database
 * 
 * IMPORTANT: This is a web module - can be called from frontend
 * Permissions: Anyone (for public access)
 */

import wixData from 'wix-data';
import { createNowPaymentsInvoice } from 'backend/nowpayments.api';
import { createCheckoutSession, createCustomInvoice } from 'backend/stripe.api';
import { getLatestDonation, saveDonation } from 'backend/hingecraft.api.web';

/**
 * Initialize charter page on ready
 * Checks dataset and updates totals dynamically
 * @public
 */
export async function onReady() {
    try {
        console.log('🚀 Charter Page Middleware: onReady()');
        
        // Get cumulative total from database
        const totalResult = await getCumulativeTotal();
        
        // Update contributions section
        await updateContributionsDisplay(totalResult.total);
        
        // Check for donation amount in URL or storage
        const donationAmount = await getDonationAmountFromStorage();
        
        if (donationAmount && donationAmount > 0) {
            // Display donation amount
            await displayDonationAmount(donationAmount);
            
            // Update contributions with new amount
            await updateContributionsDisplay(totalResult.total + donationAmount);
        }
        
        // Setup database change listeners
        setupDatabaseListeners();
        
        return {
            success: true,
            cumulativeTotal: totalResult.total,
            donationAmount: donationAmount
        };
    } catch (error) {
        console.error('❌ Charter Page onReady error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle crypto button click
 * Creates NOWPayments invoice for selected crypto
 * @public
 * @param {number} amount - Donation amount
 * @param {string} coin - Cryptocurrency (solana, stellar, bitcoin, ethereum)
 */
export async function cryptoButtonClick(amount, coin) {
    try {
        console.log('💰 Crypto button clicked:', { amount, coin });
        
        // Validate amount
        const validatedAmount = validateAmount(amount);
        if (!validatedAmount) {
            throw new Error('Invalid amount');
        }
        
        // Validate coin
        const validCoins = ['solana', 'stellar', 'bitcoin', 'ethereum', 'SOL', 'XLM', 'BTC', 'ETH'];
        const normalizedCoin = coin.toLowerCase();
        if (!validCoins.includes(normalizedCoin)) {
            throw new Error('Invalid cryptocurrency');
        }
        
        // Map coin to NOWPayments format
        const payCurrencyMap = {
            'solana': 'SOL',
            'stellar': 'XLM',
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'sol': 'SOL',
            'xlm': 'XLM',
            'btc': 'BTC',
            'eth': 'ETH'
        };
        
        const payCurrency = payCurrencyMap[normalizedCoin] || normalizedCoin.toUpperCase();
        
        // Generate intent ID
        const intentId = 'hc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Get user email if available
        let userEmail = '';
        try {
            if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                const stored = wixStorage.session.getItem('hingecraft_donation');
                if (stored) {
                    const data = JSON.parse(stored);
                    userEmail = data.email || '';
                }
            }
        } catch (e) {
            console.warn('Could not get email from session:', e);
        }
        
        // Create NOWPayments invoice
        const invoiceResult = await createNowPaymentsInvoice({
            intentId: intentId,
            amount: validatedAmount,
            payCurrency: payCurrency,
            email: userEmail,
            sessionId: await getSessionId(),
            firstName: '',
            lastName: ''
        });
        
        if (!invoiceResult.success) {
            throw new Error(invoiceResult.error || 'Failed to create crypto invoice');
        }
        
        // Store invoice data in session
        await storeCryptoInvoiceData(invoiceResult);
        
        // Store donation amount
        await storeDonationAmount(validatedAmount, 'crypto', coin);
        
        // Store in CryptoPayments collection
        try {
            const cryptoPaymentRecord = {
                invoice_id: invoiceResult.invoiceId,
                price_amount: validatedAmount,
                status: 'pending',
                pay_currency: payCurrency,
                pay_address: invoiceResult.payAddress,
                pay_amount_crypto: invoiceResult.payAmountCrypto,
                payment_url: invoiceResult.paymentUrl,
                expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                created_at: new Date(),
                metadata: {
                    intent_id: intentId,
                    coin: coin,
                    source: 'charter_page_membership'
                }
            };
            
            await wixData.save('CryptoPayments', cryptoPaymentRecord);
        } catch (dbError) {
            console.warn('⚠️  Error saving crypto payment to database (non-blocking):', dbError);
        }
        
        return {
            success: true,
            invoiceId: invoiceResult.invoiceId,
            paymentUrl: invoiceResult.paymentUrl,
            payAddress: invoiceResult.payAddress,
            payAmountCrypto: invoiceResult.payAmountCrypto,
            payCurrency: invoiceResult.payCurrency,
            intentId: intentId
        };
    } catch (error) {
        console.error('❌ Crypto button click error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle fiat button click (Stripe)
 * Creates custom Stripe invoice for preset amounts
 * @public
 * @param {number|Object} preset - Preset amount (1, 5, 20) or object with amount and user data
 */
export async function fiatButtonClick(preset) {
    try {
        console.log('💳 Fiat button clicked:', { preset });
        
        // Handle both number and object inputs
        let amount, email, customerName, metadata;
        
        if (typeof preset === 'object' && preset !== null) {
            amount = parseFloat(preset.amount || preset);
            email = preset.email || null;
            customerName = preset.customerName || preset.name || null;
            metadata = preset.metadata || {};
        } else {
            amount = parseFloat(preset);
            email = null;
            customerName = null;
            metadata = {};
        }
        
        // Validate amount
        const validPresets = [1, 5, 20];
        if (!validPresets.includes(amount) && (amount < 1 || amount > 25000)) {
            throw new Error('Invalid amount. Must be 1, 5, 20, or between $1-$25,000');
        }
        
        // Get user data from session if available
        let sessionData = null;
        try {
            if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                const stored = wixStorage.session.getItem('hingecraft_donation');
                if (stored) {
                    sessionData = JSON.parse(stored);
                }
            }
        } catch (e) {
            console.warn('Could not retrieve session data:', e);
        }
        
        // Use email from session if not provided
        if (!email && sessionData && sessionData.email) {
            email = sessionData.email;
        }
        
        // If no email, we need to get it from the database or form
        // For now, create invoice with email if available, otherwise use a placeholder
        if (!email) {
            // Try to get from ContributionIntent if available
            try {
                const intentResults = await wixData.query('ContributionIntent')
                    .eq('status', 'intent')
                    .descending('timestamp')
                    .limit(1)
                    .find();
                
                if (intentResults.items.length > 0) {
                    const latestIntent = intentResults.items[0];
                    email = latestIntent.email || null;
                    customerName = customerName || (latestIntent.first_name && latestIntent.last_name 
                        ? `${latestIntent.first_name} ${latestIntent.last_name}` : null);
                }
            } catch (dbError) {
                console.warn('Could not retrieve email from database:', dbError);
            }
        }
        
        // Add metadata with membership and database reference
        metadata = {
            ...metadata,
            source: 'charter_page_membership',
            amount_entered: amount.toString(),
            timestamp: new Date().toISOString(),
            donation_type: 'membership',
            tier: tier || (amount === 1 ? 'BASIC' : amount >= 2 && amount <= 20 ? 'PREMIER' : amount >= 30 ? 'VIP' : null),
            years: years || (amount === 1 ? 1 : amount >= 2 && amount <= 20 ? amount : amount >= 30 ? null : null),
            payment_method: paymentMethod
        };
        
        // Determine membership tier description
        let description = `HingeCraft Membership - $${amount.toFixed(2)}`;
        if (tier === 'BASIC' || amount === 1) {
            description = `HingeCraft Basic Membership - $${amount.toFixed(2)} (1 year)`;
        } else if (tier === 'PREMIER' || (amount >= 2 && amount <= 20)) {
            const membershipYears = years || amount;
            description = `HingeCraft Premier Membership - $${amount.toFixed(2)} (${membershipYears} years)`;
        } else if (tier === 'VIP' || amount >= 30) {
            description = `HingeCraft VIP Membership - $${amount.toFixed(2)} (Lifetime)`;
        }
        
        // Create custom Stripe invoice (works with DEV keys, instant creation, no email)
        const invoiceResult = await createCustomInvoice({
            amount: amount,
            email: email || 'member@hingecraft-global.ai', // Fallback email
            description: description,
            customerName: customerName,
            metadata: metadata
        });
        
        if (!invoiceResult.success) {
            throw new Error(invoiceResult.error || 'Failed to create custom invoice');
        }
        
        // Store donation amount and invoice data
        await storeDonationAmount(amount, 'stripe', null);
        
        // Store invoice data in session for reference
        try {
            if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                wixStorage.session.setItem('hingecraft_invoice', JSON.stringify({
                    invoiceId: invoiceResult.invoiceId,
                    invoiceUrl: invoiceResult.invoiceUrl,
                    invoicePdf: invoiceResult.invoicePdf,
                    amount: amount,
                    customerId: invoiceResult.customerId,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (e) {
            console.warn('Could not store invoice data in session:', e);
        }
        
        // Save invoice reference to database
        try {
            const invoiceRecord = {
                invoice_id: invoiceResult.invoiceId,
                customer_id: invoiceResult.customerId,
                amount: amount,
                currency: 'usd',
                status: invoiceResult.status,
                invoice_url: invoiceResult.invoiceUrl,
                invoice_pdf: invoiceResult.invoicePdf,
                email: email,
                payment_method: paymentMethod,
                created_at: new Date(),
                metadata: {
                    ...metadata,
                    stripe_mode: invoiceResult.mode
                }
            };
            
            await wixData.save('StripePayments', invoiceRecord);
        } catch (dbError) {
            console.warn('⚠️  Error saving invoice to database (non-blocking):', dbError);
        }
        
        return {
            success: true,
            invoiceId: invoiceResult.invoiceId,
            invoiceUrl: invoiceResult.invoiceUrl,
            invoicePdf: invoiceResult.invoicePdf,
            customerId: invoiceResult.customerId,
            amount: amount,
            status: invoiceResult.status,
            mode: invoiceResult.mode,
            message: 'Custom invoice created instantly in Stripe'
        };
    } catch (error) {
        console.error('❌ Fiat button click error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle payment webhook
 * Updates database and totals after payment
 * @public
 * @param {Object} payload - Webhook payload
 */
export async function afterPaymentWebhook(payload) {
    try {
        console.log('📥 Payment webhook received:', payload);
        
        const { paymentMethod, amount, transactionId, status, invoiceId } = payload;
        
        // Save donation to database
        const donationResult = await saveDonation({
            amount: amount,
            currency: 'USD',
            isOtherAmount: false,
            source: 'charter_page',
            paymentStatus: status || 'completed',
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            email: payload.email || null,
            name: payload.name || null,
            metadata: {
                invoiceId: invoiceId,
                webhookPayload: payload
            }
        });
        
        // Update cumulative total
        const totalResult = await getCumulativeTotal();
        
        // Trigger contributions update
        await updateContributionsDisplay(totalResult.total);
        
        return {
            success: true,
            donationId: donationResult.donationId,
            cumulativeTotal: totalResult.total
        };
    } catch (error) {
        console.error('❌ Payment webhook error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Redirect back to charter page with state
 * @public
 * @param {number} donationAmount - Donation amount
 * @param {string} paymentMethod - Payment method
 */
export async function redirectBackToCharter(donationAmount, paymentMethod) {
    try {
        const baseUrl = await getBaseUrl();
        const redirectUrl = `${baseUrl}/charter?donationAmount=${donationAmount}&paymentMethod=${paymentMethod}&fromMissionSupport=true`;
        
        return {
            success: true,
            redirectUrl: redirectUrl
        };
    } catch (error) {
        console.error('❌ Redirect error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get cumulative total from database
 * Sums all completed donations (crypto + fiat)
 * @public
 */
export async function getCumulativeTotal() {
    try {
        // Get all completed donations
        const donations = await wixData.query('Donations')
            .eq('payment_status', 'completed')
            .or(wixData.query('Donations').eq('payment_status', 'confirmed'))
            .find();
        
        // Get all confirmed crypto payments
        const cryptoPayments = await wixData.query('CryptoPayments')
            .eq('status', 'confirmed')
            .find();
        
        // Calculate totals
        let fiatTotal = 0;
        donations.items.forEach(donation => {
            if (donation.amount) {
                fiatTotal += parseFloat(donation.amount);
            }
        });
        
        let cryptoTotal = 0;
        cryptoPayments.items.forEach(payment => {
            if (payment.price_amount) {
                cryptoTotal += parseFloat(payment.price_amount);
            }
        });
        
        const total = fiatTotal + cryptoTotal;
        
        console.log('💰 Cumulative total calculated:', {
            fiatTotal,
            cryptoTotal,
            total
        });
        
        return {
            success: true,
            total: total,
            fiatTotal: fiatTotal,
            cryptoTotal: cryptoTotal,
            fiatCount: donations.items.length,
            cryptoCount: cryptoPayments.items.length
        };
    } catch (error) {
        console.error('❌ Error calculating cumulative total:', error);
        return {
            success: false,
            total: 0,
            error: error.message
        };
    }
}

/**
 * Update contributions display
 */
async function updateContributionsDisplay(total) {
    try {
        // This will be called from frontend to update the display
        // Store in session for frontend to pick up
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            wixStorage.session.setItem('hingecraft_cumulative_total', JSON.stringify({
                total: total,
                timestamp: new Date().toISOString()
            }));
        }
    } catch (error) {
        console.error('Error updating contributions display:', error);
    }
}

/**
 * Get donation amount from storage
 */
async function getDonationAmountFromStorage() {
    try {
        // Check URL parameters (handled by frontend)
        // Check session storage
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            const stored = wixStorage.session.getItem('hingecraft_donation');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.amount) {
                    return parseFloat(data.amount);
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting donation amount:', error);
        return null;
    }
}

/**
 * Display donation amount
 */
async function displayDonationAmount(amount) {
    try {
        // Store for frontend to display
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            wixStorage.session.setItem('hingecraft_donation_display', JSON.stringify({
                amount: amount,
                timestamp: new Date().toISOString()
            }));
        }
    } catch (error) {
        console.error('Error storing donation display:', error);
    }
}

/**
 * Setup database change listeners
 */
function setupDatabaseListeners() {
    try {
        // Listen for changes to Donations collection
        wixData.onChange('Donations', async (changedItem) => {
            console.log('📊 Donations collection changed:', changedItem);
            
            // Recalculate total
            const totalResult = await getCumulativeTotal();
            await updateContributionsDisplay(totalResult.total);
        });
        
        // Listen for changes to CryptoPayments collection
        wixData.onChange('CryptoPayments', async (changedItem) => {
            console.log('📊 CryptoPayments collection changed:', changedItem);
            
            // Recalculate total
            const totalResult = await getCumulativeTotal();
            await updateContributionsDisplay(totalResult.total);
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
            wixStorage.session.setItem('hingecraft_crypto_invoice', JSON.stringify({
                invoiceId: invoiceData.invoiceId,
                paymentUrl: invoiceData.paymentUrl,
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
                timestamp: new Date().toISOString()
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
 * Get base URL
 */
async function getBaseUrl() {
    try {
        const { secrets } = await import('wix-secrets-backend');
        const baseUrl = await secrets.getSecret('BASE_URL');
        return baseUrl || 'https://www.hingecraft-global.ai';
    } catch (error) {
        return 'https://www.hingecraft-global.ai';
    }
}

/**
 * Validate amount
 */
function validateAmount(amount) {
    const n = Number(amount);
    if (!isFinite(n)) return null;
    
    const regex = /^\d{1,5}(\.\d{1,2})?$/;
    const rounded = Math.round(n * 100) / 100;
    
    if (!regex.test(String(rounded))) return null;
    if (rounded < 1.00 || rounded > 25000.00) return null;
    
    return rounded;
}
