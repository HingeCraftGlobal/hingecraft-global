/**
 * HingeCraft Payment Page Integration - FIXED VERSION 2
 * 
 * FIXES:
 * - Fixed form submission error ("We could not submit your form")
 * - Fixed button click redirect to charter page
 * - Properly handles Wix payment flow without blocking form submission
 * - Uses Wix payment success hooks
 * 
 * Instructions:
 * 1. Add this code to your Wix payment page (Settings → Custom Code → JavaScript)
 * 2. Ensure backend function 'saveDonation' is deployed in Wix Velo
 * 3. Update CHARTER_PAGE_URL to match your charter page URL
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    CHARTER_PAGE_URL: '/charter', // UPDATE THIS to your actual charter page URL
    VELO_API_REF: 'https://www.wix.com/velo/reference/api-overview/introduction'
  };

  let donationAmount = null;
  let isProcessing = false;

  /**
   * Get donation amount from form (non-blocking)
   */
  function getDonationAmount() {
    // Try multiple selectors
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
   * Store donation amount (non-blocking)
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
   * Save to database via Velo (non-blocking, async)
   */
  async function saveToDatabaseViaVelo(amount) {
    try {
      const response = await fetch('/_functions/saveDonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          isOtherAmount: true,
          source: 'payment_page',
          paymentStatus: 'completed',
          paymentMethod: 'card'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Donation saved to database:', result);
        return result;
      } else {
        console.warn('⚠️ Database save failed, but continuing:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      return null;
    }
  }

  /**
   * Redirect to charter page
   */
  function redirectToCharterPage(amount) {
    const charterUrl = `${CONFIG.CHARTER_PAGE_URL}?donationAmount=${encodeURIComponent(amount)}`;
    console.log('✅ Redirecting to charter page:', charterUrl);
    
    // Use Wix location API if available
    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
      wixLocation.to(charterUrl);
    } else {
      window.location.href = charterUrl;
    }
  }

  /**
   * Handle payment button click (BEFORE form submission)
   * This captures the amount but doesn't block form submission
   */
  function handleButtonClick(event) {
    if (isProcessing) return;
    
    // Get donation amount
    const amount = getDonationAmount();
    
    if (amount && amount > 0) {
      donationAmount = amount;
      storeDonationAmount(amount);
      
      // Save to database (async, non-blocking)
      saveToDatabaseViaVelo(amount).catch(err => {
        console.error('Database save error (non-blocking):', err);
      });
      
      console.log('💰 Donation amount captured:', amount);
    }
    
    // DO NOT prevent default - let Wix handle payment
    // Form will submit normally
  }

  /**
   * Handle payment success (AFTER payment completes)
   */
  function handlePaymentSuccess() {
    if (donationAmount && donationAmount > 0) {
      console.log('✅ Payment successful, redirecting with amount:', donationAmount);
      setTimeout(() => {
        redirectToCharterPage(donationAmount);
      }, 1000);
    } else {
      // Try to get amount from storage
      try {
        const stored = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.amount) {
            redirectToCharterPage(data.amount);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading stored amount:', e);
      }
    }
  }

  /**
   * Initialize payment page integration
   */
  function init() {
    console.log('🚀 HingeCraft Payment Page Integration initialized');

    // Capture donation amount on button click (before form submission)
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
          // Remove any existing listeners to avoid duplicates
          const newButton = button.cloneNode(true);
          button.parentNode.replaceChild(newButton, button);
          
          // Add click listener (capture phase)
          newButton.addEventListener('click', handleButtonClick, true);
          console.log('✅ Button listener attached:', selector);
        });
      } catch (e) {
        // Continue
      }
    });

    // Listen for Wix payment success events
    if (typeof window !== 'undefined') {
      // Method 1: Listen for Wix payment success message
      window.addEventListener('message', function(event) {
        if (event.data && (
          event.data.type === 'payment-success' ||
          event.data.paymentStatus === 'success' ||
          event.data.status === 'success'
        )) {
          handlePaymentSuccess();
        }
      });

      // Method 2: Check URL for success indicators
      if (window.location.pathname.includes('/success') || 
          window.location.pathname.includes('/thank-you') ||
          window.location.search.includes('payment=success') ||
          window.location.search.includes('status=success')) {
        setTimeout(handlePaymentSuccess, 500);
      }

      // Method 3: Poll for success indicators
      let pollCount = 0;
      const maxPolls = 20;
      const pollInterval = setInterval(() => {
        pollCount++;
        
        const successIndicators = [
          document.querySelector('.payment-success'),
          document.querySelector('[data-payment-status="success"]'),
          document.querySelector('.thank-you-message'),
          document.querySelector('.success-message'),
          document.querySelector('[data-testid="payment-success"]')
        ];

        if (successIndicators.some(el => el !== null && el.offsetParent !== null)) {
          clearInterval(pollInterval);
          handlePaymentSuccess();
        }

        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }, 500);
    }

    // Method 4: Use Wix $w API if available
    if (typeof $w !== 'undefined' && $w.onReady) {
      $w.onReady(function() {
        try {
          // Try to hook into Wix payment success
          if (typeof wixPayments !== 'undefined') {
            wixPayments.onPaymentSuccess(function() {
              handlePaymentSuccess();
            });
          }
        } catch (e) {
          console.log('Wix payments API not available:', e);
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








