/**
 * HingeCraft Payment Orchestration Backend
 * Main Express server for payment routing, Stripe/NowPayments integration
 * 
 * Endpoints:
 * - GET /routes - Get canonical payment routes
 * - POST /mission-support/micro-payment - Create Stripe session for $1/$2/$5
 * - POST /mission-support/other - Create prefill token for "Other" amount
 * - GET /prefill/:id - Get prefill data
 * - POST /charter/generate-payment - Generate payment URL based on currency
 * - POST /admin/refresh - Force rebuild routes
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const buildPaymentRoutes = require('./routesBuilder');
const listener = require('./listener');
const stripeSvc = require('./stripe');
const nowpaymentsSvc = require('./nowpayments');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware (if needed for Wix)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /routes - Canonical payment routes (single source of truth)
 */
app.get('/routes', async (req, res) => {
  try {
    const currency = req.query.currency ? req.query.currency.toUpperCase() : null;
    
    const result = await db.query(
      'SELECT version, routes, generated_at FROM payment_routes ORDER BY version DESC LIMIT 1'
    );
    
    if (result.rowCount === 0) {
      // No routes yet - build initial set
      const built = await buildPaymentRoutes();
      return res.json({
        version: built.version,
        generated_at: new Date().toISOString(),
        routes: currency ? { [currency]: built.routes[currency] || [] } : built.routes
      });
    }
    
    const routes = result.rows[0].routes;
    const filtered = currency ? { [currency]: routes[currency] || [] } : routes;
    
    res.json({
      version: result.rows[0].version,
      generated_at: result.rows[0].generated_at,
      routes: filtered
    });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /mission-support/micro-payment
 * Create Stripe checkout session for $1, $2, or $5
 */
app.post('/mission-support/micro-payment', async (req, res) => {
  try {
    const { amount, userInfo = {} } = req.body;
    
    if (![1, 2, 5].includes(amount)) {
      return res.status(400).json({ error: 'Invalid micro payment amount. Must be 1, 2, or 5.' });
    }
    
    // Create payment record in DB
    const paymentResult = await db.query(
      `INSERT INTO payments (amount, currency, payment_method, payment_status, gateway, source, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       RETURNING id`,
      [amount, 'USD', 'stripe', 'pending', 'stripe', 'mission_support_micro']
    );
    
    const paymentId = paymentResult.rows[0].id;
    
    // Create Stripe checkout session
    const session = await stripeSvc.createCheckoutSession({
      amount: amount,
      currency: 'USD',
      paymentMethod: 'card',
      successUrl: `${process.env.BASE_URL}/payment-success?amount=${amount}&method=micro&source=mission_support`,
      cancelUrl: `${process.env.BASE_URL}/mission-support?canceled=true&amount=${amount}`,
      donationId: paymentId.toString(),
      email: userInfo.email || null,
      baseUrl: process.env.BASE_URL,
      metadata: {
        source: 'mission_support_micro',
        preset_amount: amount,
        payment_id: paymentId
      }
    });
    
    // Save to external_payments
    await db.query(
      `INSERT INTO external_payments (gateway, provider, provider_id, provider_url, currency, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      ['stripe', 'stripe', session.id, session.url, 'USD', amount, 'pending']
    );
    
    // Update payments record with provider info
    await db.query(
      `UPDATE payments SET provider = $1, provider_id = $2, provider_url = $3 WHERE id = $4`,
      ['stripe', session.id, session.url, paymentId]
    );
    
    // Trigger route rebuild via NOTIFY
    await db.query(`SELECT pg_notify('hc_routes_changed', '{"op":"INSERT","table":"external_payments","id":' + paymentId + '}')`);
    
    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      amount: amount
    });
  } catch (error) {
    console.error('Micro payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /mission-support/other
 * Create prefill token for "Other" amount and return redirect URL
 */
app.post('/mission-support/other', async (req, res) => {
  try {
    const { amount, userInfo = {} } = req.body;
    
    const validatedAmount = parseFloat(amount);
    if (isNaN(validatedAmount) || validatedAmount < 1.00 || validatedAmount > 25000.00) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $1.00 and $25,000.00' });
    }
    
    // Generate prefill token
    const prefillId = 'prefill_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    
    // Calculate expiry (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Save prefill token to ContributionIntent table (or create prefills table)
    await db.query(
      `INSERT INTO contribution_intent (_id, amount_entered, status, source, user_info, created_at, expires_at, used)
       VALUES ($1, $2, $3, $4, $5, now(), $6, false)
       ON CONFLICT (_id) DO UPDATE SET amount_entered = EXCLUDED.amount_entered, expires_at = EXCLUDED.expires_at, used = false`,
      [prefillId, validatedAmount, 'prefill', 'mission_support_other', JSON.stringify(userInfo), expiresAt]
    );
    
    const redirectUrl = `${process.env.BASE_URL}/charter?prefill=${prefillId}&donationAmount=${validatedAmount}`;
    
    res.json({
      success: true,
      redirectUrl: redirectUrl,
      prefillId: prefillId,
      amount: validatedAmount
    });
  } catch (error) {
    console.error('Other amount error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /prefill/:id
 * Get prefill data by ID (used by Charter page)
 */
app.get('/prefill/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT _id, amount_entered, expires_at, used FROM contribution_intent WHERE _id = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prefill token not found' });
    }
    
    const prefill = result.rows[0];
    
    // Check if expired
    if (new Date(prefill.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Prefill token expired' });
    }
    
    // Check if already used
    if (prefill.used) {
      return res.status(410).json({ error: 'Prefill token already used' });
    }
    
    // Mark as used
    await db.query(
      `UPDATE contribution_intent SET used = true, used_at = now() WHERE _id = $1`,
      [id]
    );
    
    res.json({
      success: true,
      amount: parseFloat(prefill.amount_entered),
      prefillId: id
    });
  } catch (error) {
    console.error('Get prefill error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /charter/generate-payment
 * Generate payment URL based on currency selection
 * Auto-routes to Stripe (fiat) or NowPayments (crypto)
 */
app.post('/charter/generate-payment', async (req, res) => {
  try {
    const { amount, currency, source = 'charter', prefillId = null } = req.body;
    
    const validatedAmount = parseFloat(amount);
    if (isNaN(validatedAmount) || validatedAmount < 1.00 || validatedAmount > 25000.00) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const normalizedCurrency = (currency || 'USD').toUpperCase();
    
    // Determine if fiat or crypto
    const fiatCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'RUB'];
    const isFiat = fiatCurrencies.includes(normalizedCurrency);
    
    // Create payment record
    const paymentResult = await db.query(
      `INSERT INTO payments (amount, currency, payment_method, payment_status, gateway, source, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       RETURNING id`,
      [
        validatedAmount,
        normalizedCurrency,
        isFiat ? 'stripe' : 'crypto',
        'pending',
        isFiat ? 'stripe' : 'nowpayments',
        source
      ]
    );
    
    const paymentId = paymentResult.rows[0].id;
    
    let providerUrl;
    let providerId;
    let provider;
    
    if (isFiat) {
      // Create Stripe checkout session
      const session = await stripeSvc.createCheckoutSession({
        amount: validatedAmount,
        currency: normalizedCurrency.toLowerCase(),
        paymentMethod: 'card',
        successUrl: `${process.env.BASE_URL}/payment-success?amount=${validatedAmount}&method=stripe&currency=${normalizedCurrency}`,
        cancelUrl: `${process.env.BASE_URL}/charter?canceled=true&amount=${validatedAmount}`,
        donationId: paymentId.toString(),
        email: null,
        baseUrl: process.env.BASE_URL,
        metadata: {
          source: source,
          currency: normalizedCurrency,
          payment_id: paymentId,
          prefill_id: prefillId
        }
      });
      
      providerUrl = session.url;
      providerId = session.id;
      provider = 'stripe';
      
      // Save to external_payments
      await db.query(
        `INSERT INTO external_payments (gateway, provider, provider_id, provider_url, currency, amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
        ['stripe', 'stripe', providerId, providerUrl, normalizedCurrency, validatedAmount, 'pending']
      );
    } else {
      // Create NowPayments invoice
      const coinMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'XLM': 'stellar',
        'USDT': 'usdt'
      };
      
      const payCurrency = coinMap[normalizedCurrency] || normalizedCurrency.toLowerCase();
      
      const invoice = await nowpaymentsSvc.createInvoice({
        intentId: `hc_${paymentId}`,
        amount: validatedAmount,
        payCurrency: payCurrency,
        email: null,
        sessionId: `session_${paymentId}`,
        firstName: null,
        lastName: null
      });
      
      if (!invoice.success) {
        throw new Error(invoice.error || 'Failed to create NowPayments invoice');
      }
      
      providerUrl = invoice.paymentUrl;
      providerId = invoice.invoiceId;
      provider = 'nowpayments';
      
      // Save to external_payments
      await db.query(
        `INSERT INTO external_payments (gateway, provider, provider_id, provider_url, currency, amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
        ['nowpayments', 'nowpayments', providerId, providerUrl, normalizedCurrency, validatedAmount, 'pending']
      );
    }
    
    // Update payments record
    await db.query(
      `UPDATE payments SET provider = $1, provider_id = $2, provider_url = $3 WHERE id = $4`,
      [provider, providerId, providerUrl, paymentId]
    );
    
    // Trigger route rebuild
    await db.query(`SELECT pg_notify('hc_routes_changed', '{"op":"INSERT","table":"external_payments"}')`);
    
    res.json({
      success: true,
      url: providerUrl,
      provider: provider,
      providerId: providerId,
      amount: validatedAmount,
      currency: normalizedCurrency
    });
  } catch (error) {
    console.error('Generate payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/refresh
 * Force rebuild payment routes and notify Wix endpoints
 */
app.post('/admin/refresh', async (req, res) => {
  try {
    // Check admin token if configured
    const adminToken = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await buildPaymentRoutes();
    
    // Notify Wix webhook endpoints
    const wixEndpoints = (process.env.WIX_WEBHOOK_ENDPOINTS || '').split(',').filter(Boolean);
    for (const url of wixEndpoints) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.WEBHOOK_SECRET || ''
          },
          body: JSON.stringify({ version: result.version, generated_at: new Date().toISOString() })
        });
      } catch (e) {
        console.warn('Failed to notify Wix endpoint:', url, e.message);
      }
    }
    
    res.json({
      success: true,
      version: result.version,
      routes: result.routes
    });
  } catch (error) {
    console.error('Admin refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ HingeCraft Payment Backend listening on port ${port}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`⚡ NowPayments: ${process.env.NOWPAYMENTS_API_KEY ? 'Configured' : 'Not configured'}`);
});

// Start database listener
listener.start().catch(console.error);
