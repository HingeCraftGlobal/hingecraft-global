/**
 * Payment Routes Builder
 * Builds canonical payment routes from database
 * Single source of truth for currency → payment URL mapping
 */

const db = require('./db');

async function buildPaymentRoutes() {
  try {
    console.log('🔨 Building payment routes...');
    
    // 1) Load external_payments with provider URLs
    const extPayments = await db.query(`
      SELECT 
        id, gateway, provider, provider_id, provider_url, provider_payload,
        currency, amount, created_at
      FROM external_payments
      WHERE (provider_url IS NOT NULL OR provider_payload IS NOT NULL)
      ORDER BY created_at DESC
    `);
    
    // 2) Load wallets
    const wallets = await db.query(`
      SELECT id, coin, wallet_address, currency, network, created_at
      FROM wallets
      WHERE wallet_address IS NOT NULL
      ORDER BY created_at DESC
    `);
    
    // 3) Build routes map
    const routes = {};
    
    // Process external_payments
    for (const row of extPayments.rows) {
      let currency = (row.currency || 'USD').toString().toUpperCase();
      let url = row.provider_url;
      
      // Extract URL from provider_payload JSON if needed
      if (!url && row.provider_payload) {
        try {
          const payload = typeof row.provider_payload === 'string' 
            ? JSON.parse(row.provider_payload) 
            : row.provider_payload;
          url = payload.invoice_url || payload.payment_url || payload.checkout_url || payload.url || null;
        } catch (e) {
          console.warn('Failed to parse provider_payload for row', row.id, e.message);
        }
      }
      
      if (!url) continue;
      
      routes[currency] = routes[currency] || [];
      
      // Determine priority: Stripe = 1, NowPayments = 2, others = 3
      let priority = 3;
      if (row.gateway && row.gateway.toLowerCase().includes('stripe')) {
        priority = 1;
      } else if (row.gateway && (row.gateway.toLowerCase().includes('nowpay') || row.gateway.toLowerCase().includes('now-pay'))) {
        priority = 2;
      }
      
      routes[currency].push({
        provider: row.gateway || row.provider || 'unknown',
        url: url,
        provider_id: row.provider_id || null,
        source_row_id: row.id,
        priority: priority,
        amount: row.amount || null,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : null
      });
    }
    
    // Process wallets (fallback for crypto)
    for (const w of wallets.rows) {
      const coin = (w.coin || w.currency || 'BTC').toString().toUpperCase();
      
      // Get NowPayments URL from database if available
      // Otherwise, construct wallet: URL scheme
      let walletUrl = `wallet:${w.wallet_address}`;
      
      // Try to find NowPayments URL for this coin in external_payments
      const nowpaymentsUrl = extPayments.rows.find(
        ep => ep.currency && ep.currency.toUpperCase() === coin && 
        (ep.gateway && ep.gateway.toLowerCase().includes('nowpay'))
      );
      
      if (nowpaymentsUrl && nowpaymentsUrl.provider_url) {
        walletUrl = nowpaymentsUrl.provider_url;
      }
      
      routes[coin] = routes[coin] || [];
      routes[coin].push({
        provider: 'wallet',
        url: walletUrl,
        source_row_id: w.id,
        priority: 99, // Lowest priority - fallback only
        wallet_address: w.wallet_address,
        network: w.network || null
      });
    }
    
    // Sort each currency's routes by priority
    for (const currency in routes) {
      routes[currency].sort((a, b) => (a.priority || 99) - (b.priority || 99));
    }
    
    // Persist to payment_routes table with new version
    const versionResult = await db.query('SELECT COALESCE(MAX(version), 0) AS v FROM payment_routes');
    const newVersion = (versionResult.rows[0].v || 0) + 1;
    
    await db.query(
      'INSERT INTO payment_routes (version, routes, generated_at) VALUES ($1, $2, now())',
      [newVersion, routes]
    );
    
    console.log(`✅ Payment routes built - version ${newVersion}, ${Object.keys(routes).length} currencies`);
    
    return {
      version: newVersion,
      routes: routes
    };
  } catch (error) {
    console.error('❌ Error building payment routes:', error);
    throw error;
  }
}

module.exports = buildPaymentRoutes;
