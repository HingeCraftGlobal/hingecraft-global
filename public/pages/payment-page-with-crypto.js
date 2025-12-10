/**
 * HingeCraft Payment Page - WITH CRYPTO & WIX PAY INTEGRATIONS
 * 
 * Features:
 * - Wix Payment API (card payments)
 * - Crypto wallet payments (Solana, Stellar, Bitcoin, Ethereum)
 * - NOWPayments API integration
 * - Database integration
 * - QR code generation
 * - Complete payment flow
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'hingecraft_donation',
    SESSION_KEY: 'hingecraft_donation',
    CHARTER_PAGE_URL: '/charter',
    CHECKOUT_PAGE_URL: '/checkout',
    BACKEND_API: '/_functions/hingecraft.api',
    NOWPAYMENTS_API: '/_functions/nowpayments.api',
    CRYPTO_CHAINS: ['solana', 'stellar', 'bitcoin', 'ethereum'],
    CRYPTO_TOKENS: {
      'solana': 'SOL',
      'stellar': 'XLM',
      'bitcoin': 'BTC',
      'ethereum': 'ETH'
    }
  };

  let donationAmount = null;
  let selectedPaymentMethod = null;
  let selectedChain = null;
  let cryptoInvoiceData = null;

  /**
   * Initialize payment page with crypto options
   */
  function init() {
    console.log('🚀 HingeCraft Payment Page initialized (WITH CRYPTO & WIX PAY)');

    // Get amount from URL
    const urlAmount = getAmountFromURL();
    if (urlAmount) {
      donationAmount = urlAmount;
      prefillPaymentWidget(urlAmount);
    }

    // Add crypto payment options UI
    addCryptoPaymentOptions();

    // Setup form handlers
    setupFormHandlers();

    // Setup Wix Pay handlers
    setupWixPayHandlers();
  }

  /**
   * Add crypto payment options UI
   */
  function addCryptoPaymentOptions() {
    // Check if crypto options already exist
    if (document.getElementById('hingecraft-crypto-options')) {
      return;
    }

    const cryptoContainer = document.createElement('div');
    cryptoContainer.id = 'hingecraft-crypto-options';
    cryptoContainer.style.cssText = `
      margin: 20px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    `;

    cryptoContainer.innerHTML = `
      <div style="margin-bottom: 16px; font-weight: bold; font-size: 18px; color: #111827;">
        Choose Payment Method
      </div>
      
      <!-- Card Payment Option -->
      <div class="payment-method-option" data-method="card" style="
        padding: 16px;
        margin-bottom: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="radio" name="paymentMethod" value="card" id="payment-card" checked>
          <label for="payment-card" style="flex: 1; cursor: pointer; font-weight: 500;">
            💳 Credit/Debit Card (Wix Pay)
          </label>
        </div>
      </div>

      <!-- Crypto Payment Options -->
      <div style="margin-top: 20px; margin-bottom: 12px; font-weight: 600; color: #374151;">
        Or pay with cryptocurrency:
      </div>
      
      <div class="payment-method-option" data-method="crypto-solana" style="
        padding: 16px;
        margin-bottom: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="radio" name="paymentMethod" value="crypto-solana" id="payment-solana">
          <label for="payment-solana" style="flex: 1; cursor: pointer; font-weight: 500;">
            ⚡ Solana (SOL)
          </label>
        </div>
      </div>

      <div class="payment-method-option" data-method="crypto-stellar" style="
        padding: 16px;
        margin-bottom: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="radio" name="paymentMethod" value="crypto-stellar" id="payment-stellar">
          <label for="payment-stellar" style="flex: 1; cursor: pointer; font-weight: 500;">
            ⭐ Stellar (XLM)
          </label>
        </div>
      </div>

      <div class="payment-method-option" data-method="crypto-bitcoin" style="
        padding: 16px;
        margin-bottom: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="radio" name="paymentMethod" value="crypto-bitcoin" id="payment-bitcoin">
          <label for="payment-bitcoin" style="flex: 1; cursor: pointer; font-weight: 500;">
            ₿ Bitcoin (BTC)
          </label>
        </div>
      </div>

      <div class="payment-method-option" data-method="crypto-ethereum" style="
        padding: 16px;
        margin-bottom: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="radio" name="paymentMethod" value="crypto-ethereum" id="payment-ethereum">
          <label for="payment-ethereum" style="flex: 1; cursor: pointer; font-weight: 500;">
            Ξ Ethereum (ETH)
          </label>
        </div>
      </div>

      <!-- Crypto Payment Display (hidden by default) -->
      <div id="crypto-payment-display" style="display: none; margin-top: 20px; padding: 20px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-weight: bold; font-size: 20px; color: #065f46; margin-bottom: 8px;">
            Pay with <span id="crypto-chain-name"></span>
          </div>
          <div style="font-size: 16px; color: #059669;">
            Amount: $<span id="crypto-amount-usd"></span> USD
          </div>
        </div>
        
        <div id="crypto-qr-code" style="text-align: center; margin: 20px 0;">
          <!-- QR code will be inserted here -->
        </div>
        
        <div style="margin: 16px 0;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Wallet Address:</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <code id="crypto-address" style="flex: 1; padding: 12px; background: white; border: 1px solid #d1d5db; border-radius: 4px; word-break: break-all; font-size: 14px;"></code>
            <button id="copy-address-btn" style="padding: 12px 20px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
              Copy
            </button>
          </div>
        </div>

        <div style="margin: 16px 0;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Memo (if required):</div>
          <code id="crypto-memo" style="display: block; padding: 12px; background: white; border: 1px solid #d1d5db; border-radius: 4px; word-break: break-all; font-size: 14px;"></code>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 14px; color: #92400e;">
          ⚠️ After sending payment, your transaction will be verified automatically. This may take a few minutes.
        </div>
      </div>
    `;

    // Insert before form or at top of page
    const form = document.querySelector('form') || document.body;
    form.insertBefore(cryptoContainer, form.firstChild);

    // Add click handlers for payment method selection
    const options = document.querySelectorAll('.payment-method-option');
    options.forEach(option => {
      option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          handlePaymentMethodChange(radio.value);
        }
      });
    });

    // Add hover effects
    options.forEach(option => {
      option.addEventListener('mouseenter', function() {
        this.style.borderColor = '#10b981';
        this.style.background = '#f0fdf4';
      });
      option.addEventListener('mouseleave', function() {
        if (!this.querySelector('input[type="radio"]:checked')) {
          this.style.borderColor = '#e5e7eb';
          this.style.background = 'white';
        }
      });
    });

    // Copy address button handler
    const copyBtn = document.getElementById('copy-address-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        const address = document.getElementById('crypto-address').textContent;
        navigator.clipboard.writeText(address).then(() => {
          this.textContent = 'Copied!';
          setTimeout(() => {
            this.textContent = 'Copy';
          }, 2000);
        });
      });
    }
  }

  /**
   * Handle payment method change
   */
  async function handlePaymentMethodChange(method) {
    selectedPaymentMethod = method;
    
    if (method.startsWith('crypto-')) {
      // Extract chain from method (e.g., 'crypto-solana' -> 'solana')
      selectedChain = method.replace('crypto-', '');
      
      // Show crypto payment display
      const cryptoDisplay = document.getElementById('crypto-payment-display');
      if (cryptoDisplay) {
        cryptoDisplay.style.display = 'block';
        
        // Get amount
        const amount = getDonationAmount();
        if (amount && amount > 0) {
          await createCryptoInvoice(amount, selectedChain);
        }
      }
    } else {
      // Hide crypto payment display
      const cryptoDisplay = document.getElementById('crypto-payment-display');
      if (cryptoDisplay) {
        cryptoDisplay.style.display = 'none';
      }
    }
  }

  /**
   * Create crypto invoice via NOWPayments API
   */
  async function createCryptoInvoice(amountUsd, chain) {
    try {
      console.log('💰 Creating crypto invoice:', { amountUsd, chain });

      // Call NOWPayments API
      const response = await wixFetch.fetch(CONFIG.NOWPAYMENTS_API + '/createInvoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountUsd,
          currency: 'USD',
          payCurrency: CONFIG.CRYPTO_TOKENS[chain] || 'SOL',
          orderId: `HC-${Date.now()}`,
          orderDescription: `HingeCraft Donation - $${amountUsd}`,
          successUrl: window.location.origin + CONFIG.CHARTER_PAGE_URL + '?paymentMethod=crypto&chain=' + chain,
          cancelUrl: window.location.origin + '/payment?canceled=true'
        })
      });

      if (!response.ok) {
        throw new Error(`NOWPayments API error: ${response.status}`);
      }

      const invoiceData = await response.json();
      cryptoInvoiceData = invoiceData;

      // Display crypto payment info
      displayCryptoPaymentInfo(invoiceData, chain, amountUsd);

      // Store invoice data
      storeCryptoInvoice(invoiceData);

    } catch (error) {
      console.error('❌ Error creating crypto invoice:', error);
      showError('Failed to create crypto payment invoice. Please try again.');
    }
  }

  /**
   * Display crypto payment information
   */
  function displayCryptoPaymentInfo(invoiceData, chain, amountUsd) {
    const chainName = chain.charAt(0).toUpperCase() + chain.slice(1);
    const address = invoiceData.payAddress || invoiceData.address;
    const memo = invoiceData.memo || '';
    const qrContent = invoiceData.payUrl || address;

    // Update display
    document.getElementById('crypto-chain-name').textContent = chainName;
    document.getElementById('crypto-amount-usd').textContent = amountUsd.toFixed(2);
    document.getElementById('crypto-address').textContent = address;
    
    if (memo) {
      document.getElementById('crypto-memo').textContent = memo;
      document.getElementById('crypto-memo').parentElement.style.display = 'block';
    } else {
      document.getElementById('crypto-memo').parentElement.style.display = 'none';
    }

    // Generate QR code
    generateQRCode(qrContent, 'crypto-qr-code');
  }

  /**
   * Generate QR code
   */
  function generateQRCode(content, elementId) {
    // Use QR code library if available, or generate via API
    const qrContainer = document.getElementById(elementId);
    if (!qrContainer) return;

    // Try to use qrcode.js library
    if (typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: content,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff'
      });
    } else {
      // Fallback: Use API to generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(content)}`;
      qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="max-width: 256px; height: auto;">`;
    }
  }

  /**
   * Store crypto invoice data
   */
  function storeCryptoInvoice(invoiceData) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('hingecraft_crypto_invoice', JSON.stringify({
          invoiceId: invoiceData.invoiceId || invoiceData.id,
          amount: donationAmount,
          chain: selectedChain,
          address: invoiceData.payAddress || invoiceData.address,
          memo: invoiceData.memo,
          timestamp: new Date().toISOString()
        }));
      }

      if (typeof wixStorage !== 'undefined') {
        wixStorage.setItem('hingecraft_crypto_invoice', JSON.stringify({
          invoiceId: invoiceData.invoiceId || invoiceData.id,
          amount: donationAmount,
          chain: selectedChain,
          address: invoiceData.payAddress || invoiceData.address,
          memo: invoiceData.memo,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error storing crypto invoice:', error);
    }
  }

  /**
   * Setup Wix Pay handlers
   */
  function setupWixPayHandlers() {
    // Wix Pay integration
    if (typeof wixPay !== 'undefined') {
      console.log('✅ Wix Pay API available');
      
      // Handle Wix Pay success
      if (wixPay.onSuccess) {
        wixPay.onSuccess(function(order) {
          console.log('✅ Wix Pay success:', order);
          
          // Store payment data
          storeDonationAmount(donationAmount, {
            paymentMethod: 'card',
            transactionId: order.id,
            orderData: order
          });
          
          // Redirect to charter page
          redirectToCharterPage(donationAmount, 'card');
        });
      }

      // Handle Wix Pay error
      if (wixPay.onError) {
        wixPay.onError(function(error) {
          console.error('❌ Wix Pay error:', error);
          showError('Payment failed. Please try again.');
        });
      }
    }
  }

  /**
   * Setup form handlers
   */
  function setupFormHandlers() {
    // Form submission handler
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        const amount = getDonationAmount();
        if (!amount || amount <= 0) {
          return true; // Let form submit normally
        }

        donationAmount = amount;

        // Check payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (paymentMethod && paymentMethod.startsWith('crypto-')) {
          // Crypto payment - prevent form submission, show crypto payment UI
          e.preventDefault();
          e.stopPropagation();
          
          const chain = paymentMethod.replace('crypto-', '');
          await createCryptoInvoice(amount, chain);
          
          return false;
        } else {
          // Card payment - let Wix Pay handle it
          // Store amount for redirect after payment
          storeDonationAmount(amount, { paymentMethod: 'card' });
          
          // Wix Pay will handle the rest
          return true;
        }
      }, true);
    });
  }

  /**
   * Get amount from URL
   */
  function getAmountFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAmount = urlParams.get('amt') || urlParams.get('donationAmount') || urlParams.get('amount');
      
      if (urlAmount) {
        const amount = parseFloat(urlAmount);
        if (!isNaN(amount) && amount >= 1.00 && amount <= 25000.00) {
          return amount;
        }
      }
    } catch (e) {
      console.error('Error reading URL parameter:', e);
    }
    return null;
  }

  /**
   * Get donation amount from form
   */
  function getDonationAmount() {
    const urlAmount = getAmountFromURL();
    if (urlAmount) return urlAmount;

    const selectors = [
      '#other-amount', '#otherAmount', '#customAmount',
      'input[name="otherAmount"]', 'input[name="customAmount"]',
      'input[type="number"][placeholder*="Other"]',
      '.other-amount-input', '.custom-amount-input'
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
      } catch (e) {}
    }

    return null;
  }

  /**
   * Prefill payment widget
   */
  function prefillPaymentWidget(amount) {
    if (!amount || amount <= 0) return false;

    try {
      if (typeof wixPay !== 'undefined' && wixPay.setAmount) {
        wixPay.setAmount(amount);
        return true;
      }
    } catch (e) {}

    return false;
  }

  /**
   * Store donation amount
   */
  function storeDonationAmount(amount, metadata = {}) {
    try {
      const data = {
        amount: amount,
        timestamp: new Date().toISOString(),
        source: 'payment_page',
        ...metadata
      };

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(data));
      }

      if (typeof wixStorage !== 'undefined') {
        wixStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error storing donation amount:', error);
    }
  }

  /**
   * Redirect to charter page
   */
  function redirectToCharterPage(amount, paymentMethod = null) {
    const params = new URLSearchParams({
      donationAmount: amount.toString(),
      fromPayment: 'true'
    });
    
    if (paymentMethod) {
      params.set('paymentMethod', paymentMethod);
    }
    
    if (selectedChain) {
      params.set('chain', selectedChain);
    }

    const charterUrl = `${CONFIG.CHARTER_PAGE_URL}?${params.toString()}`;
    
    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
      wixLocation.to(charterUrl);
    } else {
      window.location.href = charterUrl;
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
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
      const form = document.querySelector('form') || document.body;
      form.insertBefore(errorEl, form.firstChild);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
      if (errorEl) errorEl.style.display = 'none';
    }, 5000);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also initialize after delay
  setTimeout(init, 1000);

})();




