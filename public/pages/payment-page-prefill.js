/**
 * HingeCraft Payment Page - Amount Pre-Fill Integration
 * 
 * T10 IMPLEMENTATION: "Other Amount → Redirect → Payment Pre-Filled"
 * 
 * Flow: User redirected from Charter Page → Payment Page reads amount from URL →
 *       Pre-fills payment processor widget → User completes payment
 * 
 * This code reads the amount from URL parameter (?amt=VALUE), validates it,
 * and pre-fills the payment processor widget before rendering to prevent UI flicker.
 */

import wixLocation from 'wix-location';
import wixStorage from 'wix-storage';
import wixPay from 'wix-pay';

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    URL_PARAM_NAME: 'amt', // URL parameter name for amount
    MIN_AMOUNT: 1.00,
    MAX_AMOUNT: 25000.00,
    AMOUNT_REGEX: /^\d{1,5}(\.\d{1,2})?$/
  };

  let prefillAmount = null;
  let paymentWidgetInitialized = false;

  /**
   * Validate and sanitize amount from URL parameter
   * Server-side validation (never trust client-side)
   */
  function validateAndSanitizeAmount(urlValue) {
    if (!urlValue || typeof urlValue !== 'string') {
      return null;
    }

    // Stage 1: Decode URL parameter
    let decoded = decodeURIComponent(urlValue);

    // Stage 2: Remove whitespace and trim
    let sanitized = decoded.trim().replace(/\s+/g, '');

    // Stage 3: Remove currency symbols and commas
    sanitized = sanitized.replace(/[$,\s]/g, '');

    // Stage 4: Regex validation
    if (!CONFIG.AMOUNT_REGEX.test(sanitized)) {
      console.warn('❌ Invalid amount format from URL:', urlValue);
      return null;
    }

    // Stage 5: Convert to float
    const amount = parseFloat(sanitized);

    // Stage 6: Range validation
    if (isNaN(amount) || amount < CONFIG.MIN_AMOUNT || amount > CONFIG.MAX_AMOUNT) {
      console.warn('❌ Amount out of range:', amount);
      return null;
    }

    // Stage 7: Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    console.log('✅ Amount validated from URL:', roundedAmount);
    return roundedAmount;
  }

  /**
   * Get amount from URL parameter
   * Priority: URL param (?amt=VALUE) → Session storage → Default
   */
  function getAmountFromURL() {
    try {
      if (typeof wixLocation !== 'undefined' && wixLocation.query) {
        const queryParams = wixLocation.query;
        const urlAmount = queryParams[CONFIG.URL_PARAM_NAME] || queryParams['amount'] || queryParams['donationAmount'];
        
        if (urlAmount) {
          return validateAndSanitizeAmount(urlAmount);
        }
      }

      // Fallback: browser URL parsing
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAmount = urlParams.get(CONFIG.URL_PARAM_NAME) || urlParams.get('amount') || urlParams.get('donationAmount');
        
        if (urlAmount) {
          return validateAndSanitizeAmount(urlAmount);
        }
      }
    } catch (e) {
      console.error('Error reading URL parameter:', e);
    }

    return null;
  }

  /**
   * Get amount from session storage (fallback)
   */
  function getAmountFromSession() {
    try {
      // Try Wix Storage first
      if (typeof wixStorage !== 'undefined') {
        const stored = wixStorage.session.getItem(CONFIG.SESSION_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.amount) {
            const amount = parseFloat(data.amount);
            if (!isNaN(amount) && amount >= CONFIG.MIN_AMOUNT && amount <= CONFIG.MAX_AMOUNT) {
              return amount;
            }
          }
        }
      }

      // Fallback: browser sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.amount) {
            const amount = parseFloat(data.amount);
            if (!isNaN(amount) && amount >= CONFIG.MIN_AMOUNT && amount <= CONFIG.MAX_AMOUNT) {
              return amount;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error reading session storage:', e);
    }

    return null;
  }

  /**
   * Pre-fill Wix Payment Widget
   * Supports multiple payment processor configurations
   */
  function prefillPaymentWidget(amount) {
    if (!amount || amount <= 0) {
      console.warn('❌ Invalid amount for payment widget:', amount);
      return false;
    }

    console.log('💰 Pre-filling payment widget with amount:', amount);

    // Method 1: Wix Pay API (Wix Payments)
    try {
      if (typeof wixPay !== 'undefined' && wixPay.setAmount) {
        wixPay.setAmount(amount);
        console.log('✅ Amount set via wixPay.setAmount');
        return true;
      }
    } catch (e) {
      console.log('wixPay API not available:', e);
    }

    // Method 2: Wix $w API - Payment Widget
    try {
      if (typeof $w !== 'undefined') {
        // Try common payment widget IDs
        const paymentWidgets = [
          $w('#paymentWidget'),
          $w('#paymentForm'),
          $w('#checkoutForm'),
          $w('#wixPayWidget'),
          $w('#stripeWidget')
        ];

        for (const widget of paymentWidgets) {
          if (widget && widget.amount !== undefined) {
            widget.amount = amount;
            console.log('✅ Amount set via $w payment widget');
            return true;
          }
          if (widget && widget.setAmount) {
            widget.setAmount(amount);
            console.log('✅ Amount set via widget.setAmount');
            return true;
          }
        }
      }
    } catch (e) {
      console.log('$w payment widget not available:', e);
    }

    // Method 3: Direct DOM manipulation (Stripe, PayPal, etc.)
    try {
      const amountInputSelectors = [
        '#amount',
        '#payment-amount',
        '#donation-amount',
        'input[name="amount"]',
        'input[name="paymentAmount"]',
        'input[name="donationAmount"]',
        '[data-amount]',
        '[data-payment-amount]'
      ];

      for (const selector of amountInputSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.value = amount.toFixed(2);
          
          // Trigger change event for form validation
          const event = new Event('change', { bubbles: true });
          element.dispatchEvent(event);
          
          console.log('✅ Amount set via DOM:', selector);
          return true;
        }
      }
    } catch (e) {
      console.log('DOM manipulation failed:', e);
    }

    // Method 4: Wix Store Payment Widget
    try {
      if (typeof $w !== 'undefined') {
        const storeWidget = $w('#storeWidget') || $w('#productWidget');
        if (storeWidget && storeWidget.setPrice) {
          storeWidget.setPrice(amount);
          console.log('✅ Amount set via store widget');
          return true;
        }
      }
    } catch (e) {
      console.log('Store widget not available:', e);
    }

    console.warn('⚠️ Could not pre-fill payment widget - no compatible widget found');
    return false;
  }

  /**
   * Show soft warning if amount cannot be pre-filled
   * Non-blocking: doesn't prevent payment flow
   */
  function showSoftWarning() {
    try {
      let warningEl = document.getElementById('hingecraft-prefill-warning');
      
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.id = 'hingecraft-prefill-warning';
        warningEl.style.cssText = `
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 8px 12px;
          margin: 12px 0;
          color: #92400e;
          font-size: 13px;
          display: none;
        `;
        warningEl.textContent = 'Please enter your donation amount manually.';
        
        // Insert at top of payment form
        const paymentForm = document.querySelector('form') || document.body;
        paymentForm.insertBefore(warningEl, paymentForm.firstChild);
      }

      warningEl.style.display = 'block';

      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (warningEl) {
          warningEl.style.display = 'none';
        }
      }, 3000);
    } catch (e) {
      // Fail silently
    }
  }

  /**
   * Initialize Payment Page - Pre-fill amount
   * Runs BEFORE rendering animations to prevent UI flicker
   */
  function init() {
    console.log('🚀 HingeCraft Payment Page - Pre-fill Integration initialized');

    // Get amount from URL (priority 1)
    let amount = getAmountFromURL();

    // Fallback to session storage (priority 2)
    if (!amount) {
      amount = getAmountFromSession();
    }

    if (amount && amount > 0) {
      prefillAmount = amount;
      console.log('💰 Amount found:', amount);

      // Pre-fill payment widget IMMEDIATELY (before any rendering)
      const prefilled = prefillPaymentWidget(amount);

      if (!prefilled) {
        // Show soft warning if pre-fill failed
        showSoftWarning();
      } else {
        console.log('✅ Payment widget pre-filled successfully');
      }
    } else {
      console.log('ℹ️ No amount found in URL or session - using default amount');
    }
  }

  /**
   * Initialize with Wix $w API
   * Runs in $w.onReady() for Wix-specific widgets
   */
  function initWixWidgets() {
    if (typeof $w === 'undefined' || !$w.onReady) {
      return;
    }

    $w.onReady(function() {
      console.log('✅ Wix $w API ready - initializing payment widget pre-fill');

      if (prefillAmount && prefillAmount > 0) {
        // Try to pre-fill again with $w API (may not have been available earlier)
        const prefilled = prefillPaymentWidget(prefillAmount);
        
        if (prefilled) {
          paymentWidgetInitialized = true;
          console.log('✅ Payment widget initialized with amount:', prefillAmount);
        }
      }
    });
  }

  // Initialize IMMEDIATELY (before DOM ready to prevent flicker)
  init();

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init();
      initWixWidgets();
    });
  } else {
    init();
    initWixWidgets();
  }

  // Also initialize after delay for dynamic widgets
  setTimeout(function() {
    if (prefillAmount && !paymentWidgetInitialized) {
      const prefilled = prefillPaymentWidget(prefillAmount);
      if (prefilled) {
        paymentWidgetInitialized = true;
      }
    }
  }, 500);

})();



