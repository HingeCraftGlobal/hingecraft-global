/**
 * HingeCraft MongoDB URL & Wallet Address Extraction
 * Run this script to extract all payment URLs and wallet addresses
 * Usage: node extract_database_urls_mongo.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection (update with your HingeCraft DB credentials)
// 
// IMPORTANT: This script assumes you have a local MongoDB instance or Docker container
// If your payment data is ONLY in Wix, use extract_from_wix.js instead
//
// For Docker MongoDB: mongodb://localhost:27017/hingecraft
// For Cloud MongoDB: mongodb+srv://user:pass@cluster.mongodb.net/hingecraft
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hingecraft';
const DB_NAME = process.env.MONGODB_DB_NAME || 'hingecraft';

// Check if MongoDB URI is set and warn if using default
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  Using default MongoDB URI: mongodb://localhost:27017/hingecraft');
  console.warn('   Set MONGODB_URI environment variable if different');
  console.warn('   If payment data is in Wix only, use extract_from_wix.js instead\n');
}

async function extractAllUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('✅ Connected to HingeCraft database');
    
    // ============================================
    // 1. EXTRACT PAYMENT URLs
    // ============================================
    const payments = await db.collection('payments').find({
      $or: [
        { payment_url: { $exists: true, $ne: null } },
        { invoice_url: { $exists: true, $ne: null } },
        { metadata: { $regex: /http/i } }
      ]
    }).toArray();
    
    fs.writeFileSync(
      '/tmp/hingecraft_payments.json',
      JSON.stringify(payments, null, 2)
    );
    console.log(`✅ Extracted ${payments.length} payment records`);
    
    // ============================================
    // 2. EXTRACT WALLET ADDRESSES
    // ============================================
    const wallets = await db.collection('wallets').find({
      wallet_address: { $exists: true, $ne: null }
    }).toArray();
    
    fs.writeFileSync(
      '/tmp/hingecraft_wallets.json',
      JSON.stringify(wallets, null, 2)
    );
    console.log(`✅ Extracted ${wallets.length} wallet records`);
    
    // ============================================
    // 3. EXTRACT EXTERNAL PAYMENT PROVIDERS
    // ============================================
    const externalPayments = await db.collection('external_payments').find({
      $or: [
        { gateway: /stripe/i },
        { gateway: /nowpayment/i }
      ]
    }).toArray();
    
    fs.writeFileSync(
      '/tmp/hingecraft_external_payments.json',
      JSON.stringify(externalPayments, null, 2)
    );
    console.log(`✅ Extracted ${externalPayments.length} external payment records`);
    
    // ============================================
    // 4. EXTRACT CRYPTO PAYMENTS
    // ============================================
    const cryptoPayments = await db.collection('CryptoPayments').find({
      $or: [
        { payment_url: { $exists: true, $ne: null } },
        { pay_address: { $exists: true, $ne: null } },
        { invoice_id: { $exists: true, $ne: null } }
      ]
    }).toArray();
    
    fs.writeFileSync(
      '/tmp/hingecraft_crypto_payments.json',
      JSON.stringify(cryptoPayments, null, 2)
    );
    console.log(`✅ Extracted ${cryptoPayments.length} crypto payment records`);
    
    // ============================================
    // 5. EXTRACT STRIPE PAYMENTS
    // ============================================
    const stripePayments = await db.collection('StripePayments').find({
      $or: [
        { checkout_url: { $exists: true, $ne: null } },
        { session_id: { $exists: true, $ne: null } }
      ]
    }).toArray();
    
    fs.writeFileSync(
      '/tmp/hingecraft_stripe_payments.json',
      JSON.stringify(stripePayments, null, 2)
    );
    console.log(`✅ Extracted ${stripePayments.length} Stripe payment records`);
    
    // ============================================
    // 6. CREATE NORMALIZED MAPPING
    // ============================================
    const urlMapping = {};
    
    // From payments
    payments.forEach(p => {
      const currency = p.currency || 'USD';
      if (!urlMapping[currency]) urlMapping[currency] = [];
      if (p.payment_url) urlMapping[currency].push({
        url: p.payment_url,
        gateway: p.gateway || 'unknown',
        method: p.payment_method || 'unknown',
        source: 'payments'
      });
      if (p.invoice_url) urlMapping[currency].push({
        url: p.invoice_url,
        gateway: p.gateway || 'unknown',
        method: p.payment_method || 'unknown',
        source: 'payments'
      });
    });
    
    // From crypto payments
    cryptoPayments.forEach(cp => {
      const currency = cp.pay_currency || cp.price_currency || 'USD';
      if (!urlMapping[currency]) urlMapping[currency] = [];
      if (cp.payment_url) urlMapping[currency].push({
        url: cp.payment_url,
        gateway: 'nowpayments',
        method: 'crypto',
        source: 'CryptoPayments'
      });
    });
    
    // From Stripe payments
    stripePayments.forEach(sp => {
      const currency = sp.currency || 'USD';
      if (!urlMapping[currency]) urlMapping[currency] = [];
      if (sp.checkout_url) urlMapping[currency].push({
        url: sp.checkout_url,
        gateway: 'stripe',
        method: sp.payment_method || 'card',
        source: 'StripePayments'
      });
    });
    
    fs.writeFileSync(
      '/tmp/hingecraft_payment_url_mapping.json',
      JSON.stringify(urlMapping, null, 2)
    );
    console.log(`✅ Created normalized URL mapping for ${Object.keys(urlMapping).length} currencies`);
    
    // ============================================
    // 7. CREATE WALLET MAPPING
    // ============================================
    const walletMapping = {};
    wallets.forEach(w => {
      const coin = w.coin || w.currency || 'UNKNOWN';
      if (!walletMapping[coin]) walletMapping[coin] = [];
      walletMapping[coin].push({
        address: w.wallet_address,
        network: w.network || null,
        source: 'wallets'
      });
    });
    
    fs.writeFileSync(
      '/tmp/hingecraft_wallet_mapping.json',
      JSON.stringify(walletMapping, null, 2)
    );
    console.log(`✅ Created wallet mapping for ${Object.keys(walletMapping).length} coins`);
    
    console.log('\n✅ All extractions complete!');
    console.log('📁 Files saved to /tmp/');
    
  } catch (error) {
    console.error('❌ Extraction error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run extraction
extractAllUrls().catch(console.error);
