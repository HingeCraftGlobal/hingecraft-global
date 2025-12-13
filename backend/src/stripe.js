/**
 * Stripe Service Wrapper
 * Handles Stripe API calls for checkout sessions
 * 
 * IMPORTANT: Stripe secret key must be set in environment variable STRIPE_SECRET
 * DO NOT hardcode keys in this file
 */

const Stripe = require('stripe');
const fetch = require('node-fetch');

let stripe = null;

function initStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY_LIVE;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET environment variable not set');
    }
    stripe = Stripe(secretKey);
    console.log('✅ Stripe initialized (mode: ' + (secretKey.includes('test') ? 'TEST' : 'LIVE') + ')');
  }
  return stripe;
}

/**
 * Create Stripe checkout session
 * @param {Object} params - Session parameters
 * @returns {Promise<Object>} - Session with id and url
 */
async function createCheckoutSession(params) {
  try {
    const s = initStripe();
    
    const {
      amount,
      currency = 'usd',
      paymentMethod = 'card',
      successUrl,
      cancelUrl,
      donationId,
      email,
      baseUrl,
      metadata = {}
    } = params;
    
    // Validate amount
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents < 100 || amountInCents > 2500000) {
      throw new Error('Invalid amount (must be between $1.00 and $25,000.00)');
    }
    
    // Build session data
    const sessionData = {
      payment_method_types: paymentMethod === 'ACH' || paymentMethod === 'ach' ? ['us_bank_account'] : ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'HingeCraft Charter Donation',
            description: 'Mission Support Contribution - Charter of Abundance'
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      cancel_url: cancelUrl || `${baseUrl}/charter?canceled=true&amount=${amount}`,
      metadata: {
        donationId: donationId || '',
        source: metadata.source || 'charter_page',
        amount: amount.toString(),
        currency: currency,
        paymentMethod: paymentMethod,
        ...metadata
      },
      allow_promotion_codes: true
    };
    
    // Add customer email if provided
    if (email) {
      sessionData.customer_email = email;
    }
    
    // Create session with idempotency key
    const idempotencyKey = `hc_${donationId || Date.now()}_${amount}`;
    
    const session = await s.checkout.sessions.create(sessionData, {
      idempotencyKey: idempotencyKey.substring(0, 255) // Stripe limit
    });
    
    if (!session.id || !session.url) {
      throw new Error('Invalid Stripe session response: missing id or url');
    }
    
    return {
      id: session.id,
      url: session.url,
      paymentIntent: session.payment_intent || null
    };
  } catch (error) {
    console.error('❌ Stripe checkout session error:', error);
    throw error;
  }
}

/**
 * Retrieve Stripe checkout session
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} - Session data
 */
async function retrieveSession(sessionId) {
  try {
    const s = initStripe();
    const session = await s.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('❌ Stripe retrieve session error:', error);
    throw error;
  }
}

module.exports = {
  createCheckoutSession,
  retrieveSession
};
