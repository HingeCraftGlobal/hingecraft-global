/**
 * Payment Receipt Service
 * Handles payment receipt email generation and sending
 * Integrates with payment-info-service for unified payment data
 */

const gmail = require('./gmail');
const db = require('../utils/database');
const logger = require('../utils/logger');
const config = require('../../config/api_keys');

class PaymentReceiptService {
  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt({ paymentId, paymentData, to, from, replyTo }) {
    try {
      // Get complete payment information
      let paymentInfo = paymentData;
      
      if (paymentId && !paymentData) {
        // Try to fetch from database or payment service
        try {
          const paymentInfoService = require('../../wix-backend/payment-info-service');
          const result = await paymentInfoService.getPaymentInfo(paymentId);
          if (result.success) {
            paymentInfo = result.paymentInfo;
          }
        } catch (error) {
          logger.warn('Payment info service not available, using provided data:', error.message);
        }
      }
      
      // Format payment info for email
      const formattedPayment = await this.formatPaymentInfoForEmail(paymentInfo);
      
      // Generate receipt email
      const receiptEmail = this.generateReceiptEmail(formattedPayment);
      
      // Send via Gmail
      return await gmail.sendEmail({
        to: to || formattedPayment.donorEmail,
        subject: receiptEmail.subject,
        html: receiptEmail.html,
        text: receiptEmail.text,
        from: from || config.email.fromAddress,
        replyTo: replyTo || config.email.replyTo
      });
    } catch (error) {
      logger.error('Error sending payment receipt:', error.message);
      throw error;
    }
  }

  /**
   * Format payment information for email templates
   */
  async formatPaymentInfoForEmail(paymentData) {
    try {
      // If payment info service is available, use it
      try {
        const paymentInfoService = require('../../wix-backend/payment-info-service');
        return await paymentInfoService.formatPaymentInfoForEmail(paymentData);
      } catch (e) {
        // Fallback to local formatting
        return this.formatPaymentInfoLocal(paymentData);
      }
    } catch (error) {
      logger.error('Error formatting payment info:', error.message);
      return this.formatPaymentInfoLocal(paymentData);
    }
  }

  /**
   * Local payment info formatting (fallback)
   */
  formatPaymentInfoLocal(paymentData) {
    return {
      receiptNumber: paymentData.receiptNumber || paymentData._id || paymentData.id || 'N/A',
      paymentDate: this.formatDate(paymentData.created_at || paymentData.createdAt || new Date()),
      amount: this.formatCurrency(paymentData.amount || 0, paymentData.currency || 'USD'),
      currency: paymentData.currency || 'USD',
      donorName: paymentData.recipientName || 
                 `${paymentData.firstName || ''} ${paymentData.lastName || ''}`.trim() || 
                 'Anonymous Donor',
      donorEmail: paymentData.email || paymentData.recipientEmail || paymentData.donorEmail || 'N/A',
      donorAddress: paymentData.address || paymentData.donorAddress || 'N/A',
      paymentMethod: this.formatPaymentMethod(paymentData.paymentMethod || paymentData.payment_method),
      paymentStatus: this.formatPaymentStatus(paymentData.paymentStatus || paymentData.payment_status || paymentData.status),
      transactionId: paymentData.transactionId || paymentData.provider_id || paymentData.invoice_id || paymentData.stripe_payment_intent_id || 'N/A',
      missionSupportName: paymentData.missionSupportName || paymentData.mission_support_name || null
    };
  }

  /**
   * Generate receipt email HTML
   */
  generateReceiptEmail(paymentInfo) {
    const subject = `Thank you for your ${paymentInfo.amount} contribution to HingeCraft`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #10b981; margin-top: 0;">Payment Receipt</h1>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0;">Receipt #${paymentInfo.receiptNumber}</h2>
      <p><strong>Date:</strong> ${paymentInfo.paymentDate}</p>
      <p><strong>Amount:</strong> ${paymentInfo.amount}</p>
      <p><strong>Payment Method:</strong> ${paymentInfo.paymentMethod}</p>
      <p><strong>Status:</strong> ${paymentInfo.paymentStatus}</p>
      ${paymentInfo.transactionId !== 'N/A' ? `<p><strong>Transaction ID:</strong> ${paymentInfo.transactionId}</p>` : ''}
    </div>
    
    <div style="margin: 20px 0;">
      <h3>Donor Information</h3>
      <p><strong>Name:</strong> ${paymentInfo.donorName}</p>
      <p><strong>Email:</strong> ${paymentInfo.donorEmail}</p>
      <p><strong>Address:</strong> ${paymentInfo.donorAddress}</p>
    </div>
    
    ${paymentInfo.missionSupportName ? `
    <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Mission Support:</strong> ${paymentInfo.missionSupportName}</p>
    </div>
    ` : ''}
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
      <p>Thank you for your contribution to HingeCraft Global.</p>
      <p>This receipt serves as confirmation of your tax-deductible donation.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    const text = `
Payment Receipt

Receipt #${paymentInfo.receiptNumber}
Date: ${paymentInfo.paymentDate}
Amount: ${paymentInfo.amount}
Payment Method: ${paymentInfo.paymentMethod}
Status: ${paymentInfo.paymentStatus}
${paymentInfo.transactionId !== 'N/A' ? `Transaction ID: ${paymentInfo.transactionId}` : ''}

Donor Information:
Name: ${paymentInfo.donorName}
Email: ${paymentInfo.donorEmail}
Address: ${paymentInfo.donorAddress}

${paymentInfo.missionSupportName ? `Mission Support: ${paymentInfo.missionSupportName}` : ''}

Thank you for your contribution to HingeCraft Global.
This receipt serves as confirmation of your tax-deductible donation.
    `;
    
    return { subject, html, text };
  }

  /**
   * Format date helper
   */
  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format currency helper
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format payment method helper
   */
  formatPaymentMethod(method) {
    if (!method) return 'N/A';
    const methodMap = {
      'card': 'Credit/Debit Card',
      'crypto': 'Cryptocurrency',
      'stripe': 'Credit/Debit Card (Stripe)',
      'nowpayments': 'Cryptocurrency (NOWPayments)'
    };
    return methodMap[method.toLowerCase()] || method;
  }

  /**
   * Format payment status helper
   */
  formatPaymentStatus(status) {
    if (!status) return 'Unknown';
    const statusMap = {
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'waiting': 'Waiting',
      'confirmed': 'Confirmed'
    };
    return statusMap[status.toLowerCase()] || status;
  }
}

module.exports = new PaymentReceiptService();
