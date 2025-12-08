/**
 * HingeCraft Charter Page - Other Amount Capture & Redirect
 * 
 * T10 IMPLEMENTATION: "Other Amount → Redirect → Payment Pre-Filled"
 * 
 * Flow: Charter Contribution Page → User enters "Other Amount" → 
 *       Redirects to Payment Page → Payment Page pre-fills amount
 * 
 * This code captures the "Other Amount" input from the Charter Contribution Page,
 * validates, sanitizes, and redirects to the Payment Page with the amount pre-filled.
 */

import wixLocation from 'wix-location';
import wixStorage from 'wix-storage';
import { logContributionIntent } from 'backend/hingecraft.api.web';

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    PAYMENT_PAGE_URL: '/payment', // Update to your actual payment page URL
    MIN_AMOUNT: 1.00,
    MAX_AMOUNT: 25000.00,
    AMOUNT_REGEX: /^\d{1,5}(\.\d{1,2})?$/ // Validates: 1-5 digits, optional 1-2 decimal places
  };

  /**
   * Validate and sanitize donation amount
   * Multi-stage validation: regex, numeric range, type safety
   */
  function validateAndSanitizeAmount(inputValue) {
    if (!inputValue || typeof inputValue !== 'string') {
      return null;
    }

    // Stage 1: Remove whitespace and trim
    let sanitized = inputValue.trim().replace(/\s+/g, '');

    // Stage 2: Remove currency symbols and commas
    sanitized = sanitized.replace(/[$,\s]/g, '');

    // Stage 3: Regex validation (matches: 1-5 digits, optional .XX)
    if (!CONFIG.AMOUNT_REGEX.test(sanitized)) {
      console.warn('❌ Invalid amount format:', inputValue);
      return null;
    }

    // Stage 4: Convert to float
    const amount = parseFloat(sanitized);

    // Stage 5: Range validation
    if (isNaN(amount) || amount < CONFIG.MIN_AMOUNT || amount > CONFIG.MAX_AMOUNT) {
      console.warn('❌ Amount out of range:', amount);
      return null;
    }

    // Stage 6: Round to 2 decimal places (currency precision)
    const roundedAmount = Math.round(amount * 100) / 100;

    console.log('✅ Amount validated and sanitized:', roundedAmount);
    return roundedAmount;
  }

  /**
   * Get "Other Amount" from form input
   * Supports multiple selector patterns for flexibility
   */
  function getOtherAmountInput() {
    const selectors = [
      '#other-amount',
      '#otherAmount',
      '#customAmount',
      'input[name="otherAmount"]',
      'input[name="customAmount"]',
      'input[type="number"][placeholder*="Other" i]',
      'input[type="number"][placeholder*="Custom" i]',
      'input[type="text"][placeholder*="Other" i]',
      '.other-amount-input',
      '.custom-amount-input',
      '[data-amount="other"]',
      '[data-testid="other-amount"]',
      '[data-contribution="other"]'
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.value) {
          return element.value;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Try Wix $w API if available
    if (typeof $w !== 'undefined' && $w.onReady) {
      try {
        const wixInput = $w('#otherAmount') || $w('#customAmount') || $w('#other-amount');
        if (wixInput && wixInput.value) {
          return wixInput.value;
        }
      } catch (e) {
        // Continue
      }
    }

    return null;
  }

  /**
   * Store amount in session storage (fallback mechanism)
   * Uses both Wix Storage and sessionStorage for redundancy
   */
  function storeAmountInSession(amount) {
    try {
      const storageData = {
        amount: amount,
        timestamp: new Date().toISOString(),
        source: 'charter_contribution_page',
        sessionId: generateSessionId()
      };

      // Store in Wix Storage
      if (typeof wixStorage !== 'undefined') {
        wixStorage.session.setItem(CONFIG.SESSION_KEY, JSON.stringify(storageData));
        console.log('✅ Amount stored in Wix session storage');
      }

      // Store in browser sessionStorage (fallback)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(storageData));
        console.log('✅ Amount stored in browser sessionStorage');
      }

      return true;
    } catch (error) {
      console.error('❌ Error storing amount in session:', error);
      return false;
    }
  }

  /**
   * Generate anonymous session ID for tracking
   */
  function generateSessionId() {
    try {
      // Try to get existing session ID
      if (typeof sessionStorage !== 'undefined') {
        let sessionId = sessionStorage.getItem('hingecraft_session_id');
        if (sessionId) return sessionId;
      }

      // Generate new session ID
      const sessionId = 'hc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('hingecraft_session_id', sessionId);
      }

      return sessionId;
    } catch (e) {
      return 'hc_' + Date.now();
    }
  }

  /**
   * Get anonymous fingerprint for analytics
   */
  function getAnonymousFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('HingeCraft', 2, 2);
      const fingerprint = canvas.toDataURL().substring(0, 50);
      return btoa(fingerprint).substring(0, 16);
    } catch (e) {
      return 'fp_' + Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Log contribution intent to backend
   * Non-blocking: fails silently for UI but logs deeply in backend
   */
  async function logContributionIntentToBackend(amount, sessionId, fingerprint) {
    try {
      const intentData = {
        amountEntered: amount,
        timestamp: new Date().toISOString(),
        sessionID: sessionId,
        anonymousFingerprint: fingerprint,
        referrerSource: document.referrer || 'direct',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent || 'unknown'
      };

      // Call backend function (non-blocking)
      if (typeof logContributionIntent !== 'undefined') {
        logContributionIntent(intentData).catch(err => {
          console.error('Backend logging error (non-blocking):', err);
        });
      } else {
        // Fallback: direct API call if backend function not available
        console.log('ℹ️ Backend function not available, using fallback');
      }

      console.log('✅ Contribution intent logged:', intentData);
    } catch (error) {
      // Fail silently for UI - don't block redirect
      console.error('❌ Error logging contribution intent (non-blocking):', error);
    }
  }

  /**
   * Redirect to Payment Page with amount parameter
   * Uses Wix Location API for proper navigation
   */
  function redirectToPaymentPage(amount) {
    // Serialize amount using encodeURIComponent
    const encodedAmount = encodeURIComponent(amount);
    const paymentUrl = `${CONFIG.PAYMENT_PAGE_URL}?amt=${encodedAmount}&fromCharter=true`;

    console.log('🔄 Redirecting to Payment Page:', paymentUrl);
    console.log('💰 Amount:', amount);

    // Use Wix Location API if available
    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
      wixLocation.to(paymentUrl);
    } else if (typeof window !== 'undefined' && window.location) {
      window.location.href = paymentUrl;
    } else {
      console.error('❌ Cannot redirect: wixLocation and window.location unavailable');
    }
  }

  /**
   * Handle form submission
   * Captures "Other Amount", validates, stores, logs, and redirects
   */
  async function handleFormSubmit(event) {
    // Prevent default form submission
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    // Get "Other Amount" input value
    const inputValue = getOtherAmountInput();

    if (!inputValue) {
      console.log('ℹ️ No "Other Amount" entered - allowing normal form submission');
      return true; // Allow normal form submission
    }

    // Validate and sanitize amount
    const validatedAmount = validateAndSanitizeAmount(inputValue);

    if (!validatedAmount) {
      // Show user-friendly error message
      showErrorMessage('Please enter a valid amount between $1.00 and $25,000.00');
      return false; // Prevent form submission
    }

    // Store amount in session (fallback mechanism)
    storeAmountInSession(validatedAmount);

    // Generate session ID and fingerprint for analytics
    const sessionId = generateSessionId();
    const fingerprint = getAnonymousFingerprint();

    // Log contribution intent to backend (non-blocking)
    await logContributionIntentToBackend(validatedAmount, sessionId, fingerprint);

    // Redirect to Payment Page with amount
    redirectToPaymentPage(validatedAmount);

    return false; // Prevent default form submission
  }

  /**
   * Handle button click (for "Continue" or "Submit" buttons)
   */
  async function handleButtonClick(event) {
    const inputValue = getOtherAmountInput();

    if (!inputValue) {
      return true; // Allow normal button behavior
    }

    // Prevent default button action
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    // Validate and sanitize
    const validatedAmount = validateAndSanitizeAmount(inputValue);

    if (!validatedAmount) {
      showErrorMessage('Please enter a valid amount between $1.00 and $25,000.00');
      return false;
    }

    // Store, log, and redirect
    storeAmountInSession(validatedAmount);
    const sessionId = generateSessionId();
    const fingerprint = getAnonymousFingerprint();
    await logContributionIntentToBackend(validatedAmount, sessionId, fingerprint);
    redirectToPaymentPage(validatedAmount);

    return false;
  }

  /**
   * Show user-friendly error message
   */
  function showErrorMessage(message) {
    // Try to find error display element
    let errorEl = document.getElementById('hingecraft-error-message');
    
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'hingecraft-error-message';
      errorEl.style.cssText = `
        background: #fee2e2;
        border: 2px solid #ef4444;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 16px 0;
        color: #991b1b;
        font-size: 14px;
        font-weight: 500;
      `;
      
      // Insert after form or at top of page
      const form = document.querySelector('form') || document.body;
      form.insertBefore(errorEl, form.firstChild);
    }

    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }, 5000);
  }

  /**
   * Initialize Charter Page integration
   */
  function init() {
    console.log('🚀 HingeCraft Charter Page - Other Amount Integration initialized');
    console.log('📋 Flow: Charter Page → Other Amount → Payment Page (Pre-filled)');

    // Method 1: Listen for form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit, true); // Capture phase
    });

    // Method 2: Listen for button clicks
    const buttonSelectors = [
      'button[type="submit"]',
      'button[data-submit="contribution"]',
      'button[data-continue="payment"]',
      '.submit-contribution',
      '.continue-to-payment',
      '[data-testid="submit-contribution"]',
      'button.wixui-button',
      'button[aria-label*="Continue" i]',
      'button[aria-label*="Submit" i]'
    ];

    buttonSelectors.forEach(selector => {
      try {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          button.addEventListener('click', handleButtonClick, true); // Capture phase
        });
      } catch (e) {
        // Continue
      }
    });

    // Method 3: Use Wix $w API if available
    if (typeof $w !== 'undefined' && $w.onReady) {
      $w.onReady(function() {
        try {
          // Find contribution form
          const contributionForm = $w('#contributionForm') || $w('#donationForm') || $w('form');
          if (contributionForm && contributionForm.onSubmit) {
            contributionForm.onSubmit(async function() {
              return await handleFormSubmit({ preventDefault: () => {}, stopPropagation: () => {} });
            });
          }

          // Find continue/submit button
          const continueButton = $w('#continueButton') || $w('#submitButton') || $w('button[type="submit"]');
          if (continueButton && continueButton.onClick) {
            continueButton.onClick(async function() {
              return await handleButtonClick({ preventDefault: () => {}, stopPropagation: () => {} });
            });
          }
        } catch (e) {
          console.log('Wix $w API initialization:', e);
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also initialize after delay for dynamic content
  setTimeout(init, 1000);

})();

