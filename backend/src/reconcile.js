/**
 * Payment Reconciliation Job
 * Reconciles payment statuses with Stripe and NowPayments
 */

const db = require('./db');
const stripeSvc = require('./stripe');
const nowpaymentsSvc = require('./nowpayments');

async function runOnce() {
  try {
    console.log('🔄 Starting payment reconciliation...');
    
    // Get all external_payments with provider_id
    const payments = await db.query(`
      SELECT id, gateway, provider, provider_id, provider_url, currency, amount, status
      FROM external_payments
      WHERE provider_id IS NOT NULL
        AND status IN ('pending', 'processing')
        AND created_at > NOW() - INTERVAL '24 hours'
    `);
    
    let reconciled = 0;
    let errors = 0;
    
    for (const payment of payments.rows) {
      try {
        if (payment.gateway && payment.gateway.toLowerCase().includes('stripe')) {
          // Reconcile Stripe payment
          const session = await stripeSvc.retrieveSession(payment.provider_id);
          
          const stripeStatus = session.payment_status;
          let newStatus = payment.status;
          
          if (stripeStatus === 'paid' || stripeStatus === 'complete') {
            newStatus = 'completed';
          } else if (stripeStatus === 'unpaid' || stripeStatus === 'open') {
            newStatus = 'pending';
          } else if (stripeStatus === 'expired' || stripeStatus === 'canceled') {
            newStatus = 'failed';
          }
          
          // Update if status changed
          if (newStatus !== payment.status) {
            await db.query(
              `UPDATE external_payments SET status = $1, reconciled = true, reconciled_at = now() WHERE id = $2`,
              [newStatus, payment.id]
            );
            
            // Update linked payment record
            await db.query(
              `UPDATE payments SET payment_status = $1, reconciled = true WHERE provider_id = $2`,
              [newStatus, payment.provider_id]
            );
            
            reconciled++;
            console.log(`✅ Reconciled Stripe payment ${payment.id}: ${payment.status} → ${newStatus}`);
          }
        } else if (payment.gateway && (payment.gateway.toLowerCase().includes('nowpay') || payment.gateway.toLowerCase().includes('now-pay'))) {
          // Reconcile NowPayments invoice
          const invoiceStatus = await nowpaymentsSvc.getInvoiceStatus(payment.provider_id);
          
          if (invoiceStatus.success) {
            let newStatus = payment.status;
            
            if (invoiceStatus.status === 'confirmed') {
              newStatus = 'completed';
            } else if (invoiceStatus.status === 'failed') {
              newStatus = 'failed';
            }
            
            // Update if status changed
            if (newStatus !== payment.status) {
              await db.query(
                `UPDATE external_payments SET status = $1, reconciled = true, reconciled_at = now() WHERE id = $2`,
                [newStatus, payment.id]
              );
              
              // Update linked crypto payment record
              await db.query(
                `UPDATE crypto_payments SET status = $1, nowpayments_status = $2 WHERE invoice_id = $3`,
                [newStatus, invoiceStatus.nowpaymentsStatus, payment.provider_id]
              );
              
              reconciled++;
              console.log(`✅ Reconciled NowPayments payment ${payment.id}: ${payment.status} → ${newStatus}`);
            }
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error reconciling payment ${payment.id}:`, error.message);
        
        // Log to audit
        await db.query(
          `INSERT INTO payment_audit (source_table, row_id, action, payload, resolved)
           VALUES ($1, $2, $3, $4, false)`,
          ['external_payments', payment.id, 'reconcile_error', { error: error.message }]
        );
      }
    }
    
    console.log(`✅ Reconciliation complete: ${reconciled} updated, ${errors} errors`);
    
    return {
      reconciled,
      errors,
      total: payments.rowCount
    };
  } catch (error) {
    console.error('❌ Reconciliation job error:', error);
    throw error;
  }
}

module.exports = { runOnce };
