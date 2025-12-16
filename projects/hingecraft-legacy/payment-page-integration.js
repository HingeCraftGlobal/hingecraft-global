/**
 * HingeCraft Payment Page Integration
 * 
 * This code should be added to the Wix payment page
 * It captures donation amounts from the "Other" amount field
 * and stores them for display on the charter page.
 * 
 * Instructions:
 * 1. Add this code to your Wix payment page
 * 2. Ensure the "Other" amount input has id="other-amount" or update selector
 * 3. Update the API endpoint URL to match your deployment
 * 4. Update the SECRET_KEY to match your .env configuration
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // API endpoint - serverless Docker deployment for Wix custom database
    // For local development:
    API_ENDPOINT: 'http://localhost:3000',
    // For production (serverless Docker):
    // API_ENDPOINT: 'https://your-deployed-api-url.com',
    
    // Secret key - should match ADAPTOR_SECRET_KEY from .env
    // Auto-generated secure key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
    SECRET_KEY: '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b',
    
    // Webhook URL for Wix Velo API integration
    // Reference: https://www.wix.com/velo/reference/api-overview/introduction
    WEBHOOK_URL: 'https://www.wix.com/velo/reference/api-overview/introduction',
    WEBHOOK_SECRET: '63e22733255b2953c56157238c167fb62b4c68f282f81b07c15b70aa766e2620',
    
    // Storage keys
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    
    // Charter page URL
    CHARTER_PAGE_URL: '/charter', // Update to your charter page URL
    
    // Docker repository info
    DOCKER_REPOSITORY: 'departmentsai/wix',
    DEPLOYMENT_TYPE: 'serverless-docker-wix-custom-database'
  };

  /**
   * Get donation amount from form
   */
  function getDonationAmount() {
    // Try multiple selectors for "Other" amount field
    const selectors = [
      '#other-amount',
      'input[name="otherAmount"]',
      'input[type="number"][placeholder*="Other"]',
      '.other-amount-input',
      '[data-amount="other"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.value) {
        const amount = parseFloat(element.value);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    // Fallback: check if "Other" option is selected and get amount
    const otherCheckbox = document.querySelector('input[type="checkbox"][value="other"]');
    if (otherCheckbox && otherCheckbox.checked) {
      const amountInput = document.querySelector('input[type="number"]');
      if (amountInput && amountInput.value) {
        return parseFloat(amountInput.value);
      }
    }

    return null;
  }

  /**
   * Store donation amount in Wix Storage
   */
  function storeInWixStorage(amount) {
    try {
      if (typeof wixStorage !== 'undefined') {
        const donationData = {
          amount: amount,
          timestamp: new Date().toISOString(),
          source: 'payment_page'
        };
        wixStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(donationData));
        console.log('Stored in Wix Storage:', donationData);
        return true;
      }
    } catch (error) {
      console.error('Error storing in Wix Storage:', error);
    }
    return false;
  }

  /**
   * Store donation amount in sessionStorage
   */
  function storeInSessionStorage(amount) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const donationData = {
          amount: amount,
          timestamp: new Date().toISOString(),
          source: 'payment_page'
        };
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(donationData));
        console.log('Stored in sessionStorage:', donationData);
        return true;
      }
    } catch (error) {
      console.error('Error storing in sessionStorage:', error);
    }
    return false;
  }

  /**
   * Save donation to database via API
   */
  async function saveToDatabase(amount) {
    try {
      const donationData = {
        amount: amount,
        currency: 'USD',
        is_other_amount: true,
        source: 'payment_page',
        payment_status: 'completed',
        payment_method: 'card', // Update based on actual payment method
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${CONFIG.API_ENDPOINT}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.SECRET_KEY}`,
          'X-API-Key': CONFIG.SECRET_KEY
        },
        body: JSON.stringify(donationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('Donation saved to database:', result);
      return result;
    } catch (error) {
      console.error('Error saving to database:', error);
      // Don't throw - allow flow to continue even if API fails
      return null;
    }
  }

  /**
   * Trigger webhook notification
   */
  async function triggerWebhook(event, data) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL || CONFIG.API_ENDPOINT + '/webhook';
      const webhookSecret = process.env.WEBHOOK_SECRET || CONFIG.SECRET_KEY;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.SECRET_KEY}`,
          'X-API-Key': CONFIG.SECRET_KEY,
          'X-Webhook-Secret': webhookSecret
        },
        body: JSON.stringify({
          event: event,
          data: data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Webhook error (non-critical):', error);
    }
  }

  /**
   * Handle payment form submission
   */
  async function handlePaymentSubmit(event) {
    const amount = getDonationAmount();
    
    if (!amount || amount <= 0) {
      console.log('No "Other" amount found or amount is invalid');
      return; // Let normal payment flow continue
    }

    console.log('Processing donation amount:', amount);

    // Store in multiple locations for redundancy
    storeInWixStorage(amount);
    storeInSessionStorage(amount);

    // Save to database
    const dbResult = await saveToDatabase(amount);

    // Trigger webhook if configured
    if (dbResult) {
      await triggerWebhook('donation.created', {
        id: dbResult.id,
        amount: amount,
        timestamp: new Date().toISOString()
      });
    }

    // Add amount to URL for charter page redirect
    const charterUrl = `${CONFIG.CHARTER_PAGE_URL}?donationAmount=${amount}`;
    
    // Store URL for redirect (if payment processor redirects)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('hingecraft_redirect_url', charterUrl);
    }

    console.log('Donation processed. Redirect URL:', charterUrl);
    
    // Perform redirect after a short delay to ensure storage completes
    // This allows the payment processor to complete, then redirects
    setTimeout(() => {
      // Check if payment was successful (you may need to adjust this based on your payment processor)
      // For now, redirect after storing the data
      if (window.location.pathname.includes('/payment') || window.location.pathname.includes('/checkout')) {
        window.location.href = charterUrl;
      }
    }, 1000);
  }

  /**
   * Initialize payment page integration
   */
  function init() {
    console.log('HingeCraft Payment Page Integration initialized');

    // Listen for form submission
    const paymentForm = document.querySelector('form[data-payment-form]') || 
                       document.querySelector('form') ||
                       document.querySelector('[data-form="payment"]');

    if (paymentForm) {
      paymentForm.addEventListener('submit', handlePaymentSubmit);
      console.log('Payment form listener attached');
    } else {
      // Fallback: listen for submit button click
      const submitButton = document.querySelector('button[type="submit"]') ||
                          document.querySelector('[data-submit="payment"]') ||
                          document.querySelector('.submit-payment');

      if (submitButton) {
        submitButton.addEventListener('click', handlePaymentSubmit);
        console.log('Submit button listener attached');
      }
    }

    // Also listen for Wix payment events if available
    if (typeof $w !== 'undefined' && $w.onReady) {
      $w.onReady(function() {
        // Wix-specific initialization
        console.log('Wix environment detected');
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also initialize after a short delay (for dynamic content)
  setTimeout(init, 1000);

})();

