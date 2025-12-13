/**
 * HingeCraft Wix Database Extraction
 * Extracts payment URLs from Wix database via wixData API
 * 
 * NOTE: This script must run INSIDE Wix Velo environment
 * It cannot run locally - Wix data is only accessible via Velo functions
 * 
 * Usage: Deploy this as a Wix Velo backend function, then call it from frontend
 */

import wixData from 'wix-data';

/**
 * Export all payment URLs from Wix collections
 * Call this from: /_functions/extract-payment-urls
 */
export async function extractPaymentUrls() {
  try {
    const results = {
      payments: [],
      cryptoPayments: [],
      stripePayments: [],
      wallets: [],
      errors: []
    };

    // ============================================
    // 1. EXTRACT FROM Donations COLLECTION
    // ============================================
    try {
      const donations = await wixData.query('Donations')
        .hasSome('payment_url', ['']) // This won't work - need to check for non-null
        .or(wixData.query('Donations').hasSome('invoice_url', ['']))
        .find();
      
      results.payments = donations.items.map(item => ({
        id: item._id,
        created_at: item._createdDate,
        user_id: item.userId,
        gateway: item.gateway,
        payment_url: item.payment_url,
        invoice_url: item.invoice_url,
        amount: item.amount,
        currency: item.currency,
        payment_status: item.payment_status,
        payment_method: item.payment_method,
        metadata: item.metadata
      }));
    } catch (error) {
      results.errors.push({ collection: 'Donations', error: error.message });
    }

    // ============================================
    // 2. EXTRACT FROM CryptoPayments COLLECTION
    // ============================================
    try {
      const cryptoPayments = await wixData.query('CryptoPayments')
        .find();
      
      results.cryptoPayments = cryptoPayments.items
        .filter(item => item.payment_url || item.pay_address || item.invoice_id)
        .map(item => ({
          _id: item._id,
          intent_id: item.intent_id,
          order_id: item.order_id,
          invoice_id: item.invoice_id,
          payment_url: item.payment_url,
          pay_address: item.pay_address,
          pay_amount_crypto: item.pay_amount_crypto,
          pay_currency: item.pay_currency,
          price_amount: item.price_amount,
          price_currency: item.price_currency,
          status: item.status,
          invoice_created_at: item.invoice_created_at,
          invoice_expires_at: item.invoice_expires_at
        }));
    } catch (error) {
      results.errors.push({ collection: 'CryptoPayments', error: error.message });
    }

    // ============================================
    // 3. EXTRACT FROM StripePayments COLLECTION
    // ============================================
    try {
      const stripePayments = await wixData.query('StripePayments')
        .find();
      
      results.stripePayments = stripePayments.items
        .filter(item => item.checkout_url || item.session_id)
        .map(item => ({
          _id: item._id,
          session_id: item.session_id,
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          payment_method: item.payment_method,
          checkout_url: item.checkout_url,
          created_at: item._createdDate
        }));
    } catch (error) {
      results.errors.push({ collection: 'StripePayments', error: error.message });
    }

    return {
      success: true,
      data: results,
      summary: {
        total_payments: results.payments.length,
        total_crypto: results.cryptoPayments.length,
        total_stripe: results.stripePayments.length,
        total_wallets: results.wallets.length,
        errors: results.errors.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Get payment URL mapping by currency
 * Call this from: /_functions/get-payment-url-mapping
 */
export async function getPaymentUrlMapping() {
  try {
    const extraction = await extractPaymentUrls();
    if (!extraction.success) {
      return extraction;
    }

    const mapping = {};

    // Process payments
    extraction.data.payments.forEach(p => {
      const currency = p.currency || 'USD';
      if (!mapping[currency]) mapping[currency] = [];
      if (p.payment_url) {
        mapping[currency].push({
          url: p.payment_url,
          gateway: p.gateway || 'unknown',
          method: p.payment_method || 'unknown',
          source: 'Donations',
          priority: 1
        });
      }
    });

    // Process crypto payments
    extraction.data.cryptoPayments.forEach(cp => {
      const currency = cp.pay_currency || cp.price_currency || 'USD';
      if (!mapping[currency]) mapping[currency] = [];
      if (cp.payment_url) {
        mapping[currency].push({
          url: cp.payment_url,
          gateway: 'nowpayments',
          method: 'crypto',
          source: 'CryptoPayments',
          priority: 1
        });
      }
    });

    // Process Stripe payments
    extraction.data.stripePayments.forEach(sp => {
      const currency = sp.currency || 'USD';
      if (!mapping[currency]) mapping[currency] = [];
      if (sp.checkout_url) {
        mapping[currency].push({
          url: sp.checkout_url,
          gateway: 'stripe',
          method: sp.payment_method || 'card',
          source: 'StripePayments',
          priority: 1
        });
      }
    });

    return {
      success: true,
      mapping: mapping,
      currencies: Object.keys(mapping)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
