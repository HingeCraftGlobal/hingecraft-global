/**
 * NOWPayments Invoice Creator & URL Extractor
 * Creates test invoices and extracts payment URLs
 * 
 * Usage: node nowpayments_invoice_creator.js
 * 
 * Requires: NOWPAYMENTS_API_KEY environment variable
 */

const fetch = require('node-fetch');
const fs = require('fs');

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_BASE_URL = process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io/v1';
const BASE_URL = process.env.BASE_URL || 'https://www.hingecraft-global.ai';

if (!NOWPAYMENTS_API_KEY) {
  console.error('❌ NOWPAYMENTS_API_KEY not set. Please set environment variable.');
  process.exit(1);
}

/**
 * Create NOWPayments invoice
 */
async function createNowPaymentsInvoice(amount, fiatCurrency, payCurrency, orderId) {
  try {
    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: fiatCurrency.toLowerCase(),
        order_id: orderId,
        pay_currency: payCurrency.toLowerCase(),
        success_url: `${BASE_URL}/payment-success?intent=${orderId}&source=crypto`,
        cancel_url: `${BASE_URL}/payment-cancel?intent=${orderId}&source=crypto`,
        ipn_callback_url: `${BASE_URL}/_functions/webhooks/nowpayments`
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NOWPayments API error: ${response.status} - ${errorText}`);
    }
    
    const invoiceData = await response.json();
    
    return {
      success: true,
      invoiceId: invoiceData.id || invoiceData.invoice_id,
      paymentUrl: invoiceData.invoice_url || invoiceData.payment_url,
      payAddress: invoiceData.pay_address,
      payAmountCrypto: invoiceData.pay_amount ? parseFloat(invoiceData.pay_amount) : null,
      payCurrency: invoiceData.pay_currency || payCurrency,
      orderId: orderId,
      rawResponse: invoiceData
    };
  } catch (error) {
    console.error('❌ NOWPayments invoice creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get invoice status
 */
async function getInvoiceStatus(invoiceId) {
  try {
    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting invoice status:', error);
    return null;
  }
}

/**
 * Create test invoices for all crypto currencies
 */
async function createAllTestInvoices() {
  const configs = [
    { amount: 1, fiatCurrency: 'USD', payCurrency: 'BTC' },
    { amount: 5, fiatCurrency: 'USD', payCurrency: 'BTC' },
    { amount: 20, fiatCurrency: 'USD', payCurrency: 'BTC' },
    { amount: 1, fiatCurrency: 'USD', payCurrency: 'ETH' },
    { amount: 5, fiatCurrency: 'USD', payCurrency: 'ETH' },
    { amount: 1, fiatCurrency: 'USD', payCurrency: 'SOL' },
    { amount: 5, fiatCurrency: 'USD', payCurrency: 'SOL' },
    { amount: 1, fiatCurrency: 'USD', payCurrency: 'XLM' },
    { amount: 5, fiatCurrency: 'USD', payCurrency: 'XLM' }
  ];
  
  const results = [];
  
  for (const config of configs) {
    const orderId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Creating invoice for ${config.payCurrency} ${config.amount} ${config.fiatCurrency}...`);
    
    const result = await createNowPaymentsInvoice(
      config.amount,
      config.fiatCurrency,
      config.payCurrency,
      orderId
    );
    
    results.push({
      ...config,
      orderId,
      ...result
    });
    
    if (result.success) {
      console.log(`✅ Created: ${result.paymentUrl}`);
      console.log(`   Wallet: ${result.payAddress}`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  fs.writeFileSync(
    '/tmp/nowpayments_test_invoices.json',
    JSON.stringify(results, null, 2)
  );
  
  // Create mapping
  const mapping = {};
  results.forEach(r => {
    if (r.success) {
      if (!mapping[r.payCurrency]) mapping[r.payCurrency] = [];
      mapping[r.payCurrency].push({
        amount: r.amount,
        paymentUrl: r.paymentUrl,
        payAddress: r.payAddress,
        payAmountCrypto: r.payAmountCrypto
      });
    }
  });
  
  fs.writeFileSync(
    '/tmp/nowpayments_test_url_mapping.json',
    JSON.stringify(mapping, null, 2)
  );
  
  console.log('\n✅ All test invoices created!');
  console.log('📁 Results saved to /tmp/nowpayments_test_invoices.json');
  console.log('📁 Mapping saved to /tmp/nowpayments_test_url_mapping.json');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  createAllTestInvoices().catch(console.error);
}

module.exports = { createNowPaymentsInvoice, getInvoiceStatus, createAllTestInvoices };
