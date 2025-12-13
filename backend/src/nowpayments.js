/**
 * NowPayments Service Wrapper
 * Handles NowPayments API calls for crypto invoices
 * 
 * IMPORTANT: NowPayments API key must be set in environment variable NOWPAYMENTS_API_KEY
 * DO NOT hardcode keys in this file
 */

const fetch = require('node-fetch');

const NOWPAYMENTS_BASE_URL = process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io/v1';
const BASE_URL = process.env.BASE_URL || 'https://www.hingecraft-global.ai';

function getApiKey() {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) {
    throw new Error('NOWPAYMENTS_API_KEY environment variable not set');
  }
  return key;
}

/**
 * Create NowPayments invoice
 * @param {Object} params - Invoice parameters
 * @returns {Promise<Object>} - Invoice data with payment_url
 */
async function createInvoice(params) {
  try {
    const {
      intentId,
      amount,
      payCurrency,
      email = null,
      sessionId = null,
      firstName = null,
      lastName = null
    } = params;
    
    // Validate amount
    const validatedAmount = parseFloat(amount);
    if (isNaN(validatedAmount) || validatedAmount < 1.00 || validatedAmount > 25000.00) {
      throw new Error('Invalid amount (must be between $1.00 and $25,000.00)');
    }
    
    // Build invoice payload
    const invoicePayload = {
      price_amount: validatedAmount,
      price_currency: 'usd',
      order_id: intentId || `hc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_description: 'HingeCraft Mission Support',
      ipn_callback_url: `${BASE_URL}/_functions/webhooks/nowpayments`,
      success_url: `${BASE_URL}/payment-success?intent=${encodeURIComponent(intentId || '')}&source=crypto`,
      cancel_url: `${BASE_URL}/payment-cancel?intent=${encodeURIComponent(intentId || '')}&source=crypto`
    };
    
    // Add pay_currency if specified
    if (payCurrency) {
      invoicePayload.pay_currency = payCurrency.toLowerCase();
    }
    
    // Add metadata
    invoicePayload.metadata = {
      intentId: intentId,
      sessionId: sessionId,
      source: 'charter_page',
      email: email || '',
      firstName: firstName || '',
      lastName: lastName || ''
    };
    
    // Call NowPayments API
    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': getApiKey(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoicePayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NowPayments API error: ${response.status} - ${errorText}`);
    }
    
    const invoiceData = await response.json();
    
    // Extract invoice details
    const invoiceId = invoiceData.id || invoiceData.invoice_id;
    const paymentUrl = invoiceData.invoice_url || invoiceData.payment_url;
    const payAddress = invoiceData.pay_address;
    const payAmountCrypto = invoiceData.pay_amount ? parseFloat(invoiceData.pay_amount) : null;
    const payCurrencyFinal = invoiceData.pay_currency || payCurrency;
    
    if (!invoiceId || !paymentUrl) {
      throw new Error('Invalid NowPayments response: missing invoice_id or payment_url');
    }
    
    return {
      success: true,
      invoiceId: invoiceId,
      paymentUrl: paymentUrl,
      payAddress: payAddress,
      payAmountCrypto: payAmountCrypto,
      payCurrency: payCurrencyFinal,
      orderId: invoicePayload.order_id
    };
  } catch (error) {
    console.error('❌ NowPayments invoice creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get invoice status
 * @param {string} invoiceId - NowPayments invoice ID
 * @returns {Promise<Object>} - Invoice status
 */
async function getInvoiceStatus(invoiceId) {
  try {
    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'x-api-key': getApiKey(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NowPayments API error: ${response.status}`);
    }
    
    const invoiceData = await response.json();
    
    // Map NowPayments status to internal status
    const nowpaymentsStatus = invoiceData.status || 'waiting';
    let internalStatus = 'pending';
    
    if (nowpaymentsStatus === 'waiting' || nowpaymentsStatus === 'invoice_waiting') {
      internalStatus = 'pending';
    } else if (nowpaymentsStatus === 'confirmed' || nowpaymentsStatus === 'finished') {
      internalStatus = 'confirmed';
    } else if (nowpaymentsStatus === 'failed' || nowpaymentsStatus === 'expired') {
      internalStatus = 'failed';
    }
    
    return {
      success: true,
      status: internalStatus,
      nowpaymentsStatus: nowpaymentsStatus,
      invoiceId: invoiceId,
      paymentUrl: invoiceData.invoice_url || invoiceData.payment_url,
      payAddress: invoiceData.pay_address,
      payAmountCrypto: invoiceData.pay_amount,
      payCurrency: invoiceData.pay_currency
    };
  } catch (error) {
    console.error('❌ NowPayments get invoice status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createInvoice,
  getInvoiceStatus
};
