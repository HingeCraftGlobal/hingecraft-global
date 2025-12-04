/**
 * HingeCraft Payment Page Integration - NO DATABASE VERSION
 * 
 * This version works WITHOUT external database connection
 * Flow: Payment Page → Charter Page → Checkout
 * 
 * FIXES:
 * - Works without external database
 * - Redirects to charter page immediately (before checkout)
 * - Updates contributions section on charter page
 * - Then proceeds to checkout
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    CHARTER_PAGE_URL: '/charter', // UPDATE THIS to your actual charter page URL
    CHECKOUT_PAGE_URL: '/checkout' // UPDATE THIS if needed
  };

  let donationAmount = null;

  /**
   * Get donation amount from form
   */
  function getDonationAmount() {
    const selectors = [
      '#other-amount',
      '#otherAmount',
      '#customAmount',
      'input[name="otherAmount"]',
      'input[name="customAmount"]',
      'input[type="number"][placeholder*="Other"]',
      'input[type="number"][placeholder*="Custom"]',
      '.other-amount-input',
      '.custom-amount-input',
      '[data-amount="other"]',
      '[data-testid="other-amount"]'
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.value) {
          const amount = parseFloat(element.value);
          if (!isNaN(amount) && amount > 0) {
            return amount;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('donationAmount') || urlParams.get('amount');
    if (urlAmount) {
      const amount = parseFloat(urlAmount);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }

    return null;
  }

  /**
   * Store donation amount (local storage only - no database)
   */
  function storeDonationAmount(amount) {
    try {
      // Store in sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({
          amount: amount,
          timestamp: new Date().toISOString(),
          source: 'payment_page'
        }));
      }

      // Store in Wix Storage (if available)
      if (typeof wixStorage !== 'undefined') {
        wixStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
          amount: amount,
          timestamp: new Date().toISOString(),
          source: 'payment_page'
        }));
      }

      console.log('✅ Donation amount stored:', amount);
      return true;
    } catch (error) {
      console.error('❌ Error storing donation amount:', error);
      return false;
    }
  }

  /**
   * Redirect to charter page (BEFORE checkout)
   */
  function redirectToCharterPage(amount) {
    const charterUrl = `${CONFIG.CHARTER_PAGE_URL}?donationAmount=${encodeURIComponent(amount)}&fromPayment=true`;
    console.log('✅ Redirecting to charter page:', charterUrl);
    
    // Use Wix location API if available
    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
      wixLocation.to(charterUrl);
    } else {
      window.location.href = charterUrl;
    }
  }

  /**
   * Handle form submission
   * NEW FLOW: Redirect to charter page immediately (before checkout)
   * Flow: Payment Page → Charter Page → Checkout
   */
  function handleFormSubmit(event) {
    // Get donation amount
    const amount = getDonationAmount();
    
    if (amount && amount > 0) {
      donationAmount = amount;
      
      // Store amount locally
      storeDonationAmount(amount);
      
      console.log('💰 Donation amount captured:', amount);
      console.log('🔄 Redirecting to charter page (before checkout)');
      
      // PREVENT default form submission
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      
      // Stop propagation
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // Redirect to charter page IMMEDIATELY (before checkout)
      redirectToCharterPage(amount);
      
      return false; // Prevent form submission
    }
    
    // If no "Other" amount, let normal flow continue (goes to checkout)
    console.log('ℹ️ No "Other" amount - continuing with normal checkout flow');
    return true; // Allow form submission
  }

  /**
   * Handle button click
   * Flow: Payment Page → Charter Page → Checkout
   */
  function handleButtonClick(event) {
    const amount = getDonationAmount();
    
    if (amount && amount > 0) {
      donationAmount = amount;
      
      // Store amount locally
      storeDonationAmount(amount);
      
      console.log('💰 Donation amount captured:', amount);
      console.log('🔄 Redirecting to charter page (before checkout)');
      
      // Prevent default button action
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      
      // Stop propagation
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // Redirect to charter page IMMEDIATELY
      redirectToCharterPage(amount);
      
      return false;
    }
    
    // Let button work normally if no "Other" amount
    return true;
  }

  /**
   * Initialize payment page integration
   */
  function init() {
    console.log('🚀 HingeCraft Payment Page Integration initialized (NO DATABASE VERSION)');
    console.log('📋 Flow: Payment Page → Charter Page → Checkout');

    // Method 1: Listen for form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const result = handleFormSubmit(e);
        if (result === false) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true); // Use capture phase
    });

    // Method 2: Listen for button clicks
    const buttonSelectors = [
      'button[type="submit"]',
      'button[data-testid="submit"]',
      '[data-submit="payment"]',
      '.submit-payment',
      '[data-testid="submit-payment"]',
      'button.wixui-button',
      'button[aria-label*="Submit"]',
      'button[aria-label*="Pay"]'
    ];

    buttonSelectors.forEach(selector => {
      try {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          button.addEventListener('click', function(e) {
            const result = handleButtonClick(e);
            if (result === false) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }, true); // Use capture phase
        });
      } catch (e) {
        // Continue
      }
    });

    // Method 3: Use Wix $w API if available
    if (typeof $w !== 'undefined' && $w.onReady) {
      $w.onReady(function() {
        try {
          const paymentForm = $w('#paymentForm') || $w('#checkoutForm');
          if (paymentForm && paymentForm.onSubmit) {
            paymentForm.onSubmit(function() {
              const amount = getDonationAmount();
              if (amount && amount > 0) {
                storeDonationAmount(amount);
                redirectToCharterPage(amount);
                return false; // Prevent form submission
              }
              return true; // Allow form submission
            });
          }
        } catch (e) {
          console.log('Wix $w API not available:', e);
        }
      });
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also initialize after delay for dynamic content
  setTimeout(init, 1000);

})();

