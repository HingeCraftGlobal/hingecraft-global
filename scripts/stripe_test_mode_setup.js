/**
 * Stripe Test Mode Setup & Session Creation
 * Creates test checkout sessions and extracts URLs
 * 
 * Usage: node stripe_test_mode_setup.js
 * 
 * Requires: STRIPE_SECRET_TEST environment variable
 */

const Stripe = require('stripe');
const fs = require('fs');

// Initialize Stripe with test key
const stripe = Stripe(process.env.STRIPE_SECRET_TEST || process.env.STRIPE_SECRET_KEY);

if (!stripe) {
  console.error('❌ STRIPE_SECRET_TEST not set. Please set environment variable.');
  process.exit(1);
}

/**
 * Create test checkout session
 */
async function createTestCheckoutSession(amount, currency = 'usd', paymentMethod = 'card') {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethod === 'ACH' ? ['us_bank_account'] : ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'HingeCraft Charter Donation',
            description: 'Mission Support Contribution'
          },
          unit_amount: Math.round(amount * 100) // Convert to cents
        },
        quantity: 1
      }],
      success_url: `https://www.hingecraft-global.ai/payment-success?amount=${amount}&method=${paymentMethod}`,
      cancel_url: `https://www.hingecraft-global.ai/charter?canceled=true&amount=${amount}`,
      metadata: {
        source: 'charter_page',
        amount: amount.toString(),
        currency: currency,
        paymentMethod: paymentMethod
      }
    });
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url,
      amount: amount,
      currency: currency,
      paymentMethod: paymentMethod
    };
  } catch (error) {
    console.error('❌ Stripe session creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create test sessions for all currencies
 */
async function createAllTestSessions() {
  const currencies = [
    { currency: 'USD', amount: 1, method: 'card' },
    { currency: 'USD', amount: 5, method: 'card' },
    { currency: 'USD', amount: 20, method: 'card' },
    { currency: 'USD', amount: 1, method: 'ACH' },
    { currency: 'EUR', amount: 1, method: 'card' },
    { currency: 'EUR', amount: 5, method: 'card' }
  ];
  
  const results = [];
  
  for (const config of currencies) {
    console.log(`Creating session for ${config.currency} ${config.amount} (${config.method})...`);
    const result = await createTestCheckoutSession(config.amount, config.currency, config.method);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Created: ${result.url}`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save results
  fs.writeFileSync(
    '/tmp/stripe_test_sessions.json',
    JSON.stringify(results, null, 2)
  );
  
  // Create mapping
  const mapping = {};
  results.forEach(r => {
    if (r.success) {
      const key = `${r.currency}_${r.paymentMethod}`;
      if (!mapping[key]) mapping[key] = [];
      mapping[key].push({
        amount: r.amount,
        url: r.url
      });
    }
  });
  
  fs.writeFileSync(
    '/tmp/stripe_test_url_mapping.json',
    JSON.stringify(mapping, null, 2)
  );
  
  console.log('\n✅ All test sessions created!');
  console.log('📁 Results saved to /tmp/stripe_test_sessions.json');
  console.log('📁 Mapping saved to /tmp/stripe_test_url_mapping.json');
  
  return results;
}

/**
 * Test webhook with Stripe CLI
 */
function printStripeCLICommands() {
  console.log('\n📋 Stripe CLI Commands for Testing:');
  console.log('=====================================');
  console.log('\n1. Listen for webhooks:');
  console.log('   stripe listen --forward-to localhost:3000/_functions/webhooks/stripe');
  console.log('\n2. Trigger test events:');
  console.log('   stripe trigger checkout.session.completed');
  console.log('   stripe trigger payment_intent.succeeded');
  console.log('\n3. Test with test cards:');
  console.log('   Card: 4242 4242 4242 4242');
  console.log('   Expiry: Any future date');
  console.log('   CVC: Any 3 digits');
  console.log('   ZIP: Any 5 digits');
}

// Run if called directly
if (require.main === module) {
  createAllTestSessions()
    .then(() => printStripeCLICommands())
    .catch(console.error);
}

module.exports = { createTestCheckoutSession, createAllTestSessions };
