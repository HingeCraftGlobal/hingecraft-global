/**
 * Database Listener
 * Listens to PostgreSQL NOTIFY events and triggers route rebuilds
 */

const { pool } = require('./db');
const buildPaymentRoutes = require('./routesBuilder');
const fetch = require('node-fetch');

const WIX_ENDPOINTS = (process.env.WIX_WEBHOOK_ENDPOINTS || '').split(',').filter(Boolean);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// Debounce queue for route rebuilds
let rebuildQueue = null;
let rebuildTimeout = null;
const DEBOUNCE_MS = 2000; // 2 seconds

async function start() {
  try {
    const client = await pool.connect();
    
    // Listen to route change notifications
    await client.query('LISTEN hc_routes_changed');
    
    client.on('notification', async (msg) => {
      try {
        console.log('📢 PG NOTIFY received:', msg.channel, msg.payload);
        
        // Debounce: coalesce rapid updates
        if (rebuildTimeout) {
          clearTimeout(rebuildTimeout);
        }
        
        rebuildTimeout = setTimeout(async () => {
          try {
            console.log('🔄 Rebuilding payment routes after notification...');
            const result = await buildPaymentRoutes();
            
            // Notify Wix webhook endpoints
            for (const url of WIX_ENDPOINTS) {
              if (!url) continue;
              try {
                await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': WEBHOOK_SECRET
                  },
                  body: JSON.stringify({
                    version: result.version,
                    generated_at: new Date().toISOString(),
                    source: 'database_notify'
                  }),
                  timeout: 5000
                });
                console.log('✅ Notified Wix endpoint:', url);
              } catch (e) {
                console.warn('⚠️ Failed to notify Wix endpoint:', url, e.message);
              }
            }
          } catch (err) {
            console.error('❌ Error rebuilding routes after notify:', err);
          }
        }, DEBOUNCE_MS);
      } catch (err) {
        console.error('❌ Listener notification error:', err);
      }
    });
    
    client.on('error', (err) => {
      console.error('❌ Listener client error:', err);
      // Attempt to reconnect
      setTimeout(() => start(), 5000);
    });
    
    console.log('✅ Database listener started (LISTEN hc_routes_changed)');
  } catch (error) {
    console.error('❌ Failed to start database listener:', error);
    // Retry after delay
    setTimeout(() => start(), 5000);
  }
}

module.exports = { start };
