// SEO Configuration
$w.onReady(function () {
    // Set page title
    if (typeof document !== 'undefined') {
        document.title = ' | HingeCraft Global';
    }
    
    // Set meta tags via Wix SEO (if available)
    try {
        import({ seo } from 'wix-seo').then(seoModule => {
            seoModule.seo.setTitle(' | HingeCraft Global');
            seoModule.seo.setDescription('');
            seoModule.seo.setKeywords('');
            seoModule.seo.setOgTitle('');
            seoModule.seo.setOgDescription('');
        }).catch(() => {
            // Fallback: Use page settings API
            console.log('SEO module not available, using page settings');
        });
    } catch(e) {
        console.log('SEO setup:', e);
    }
});

// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// HingeCraft Charter Page - WITH CHECKOUT FLOW
// Flow: Payment Page → Charter Page → Checkout

// SEO Configuration for Charter of Abundance Invitation
import { seo } from 'wix-seo';

$w.onReady(function () {
    // Set page SEO
    seo.setTitle(' | HingeCraft Global');
    seo.setDescription('');
    seo.setKeywords('');
    
    // Set Open Graph
    seo.setOgTitle('');
    seo.setOgDescription('');
    seo.setOgImage('https://hingecraft-global.ai/og-image.jpg');
    
    // Set canonical and robots
    seo.setCanonicalUrl(window.location.href);
    seo.setRobots('index, follow');
});

    $w.onReady(function () {
    // Charter Page Integration - WITH CHECKOUT FLOW
    (function() {
      'use strict';

      // Guard: Wix Preview / server contexts may lack DOM/window
      const HAS_DOM = typeof document !== 'undefined';
      const HAS_WINDOW = typeof window !== 'undefined';

      const CONFIG = {
        STORAGE_KEY: 'hingecraft_donation',
        SESSION_KEY: 'hingecraft_donation',
        CHECKOUT_PAGE_URL: '/checkout' // UPDATE THIS to your checkout page URL
      };

      let donationAmount = null;

      /**
       * Get donation amount from multiple sources
       */
      function getDonationAmount() {
        // Method 1: URL parameter
        if (HAS_WINDOW) {
          const urlParams = new URLSearchParams(window.location.search);
          const urlAmount = urlParams.get('donationAmount') || urlParams.get('amount');
          if (urlAmount) {
            const amount = parseFloat(urlAmount);
            if (!isNaN(amount) && amount > 0) {
              return amount;
            }
          }
        }

        // Method 2: sessionStorage
        try {
          const stored = sessionStorage.getItem(CONFIG.SESSION_KEY);
          if (stored) {
            const data = JSON.parse(stored);
            if (data.amount) {
              return parseFloat(data.amount);
            }
          }
        } catch (e) {
          console.error('Error reading sessionStorage:', e);
        }

        // Method 3: Wix Storage
        try {
          if (typeof wixStorage !== 'undefined') {
            const stored = wixStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
              const data = JSON.parse(stored);
              if (data.amount) {
                return parseFloat(data.amount);
              }
            }
          }
        } catch (e) {
          console.error('Error reading Wix Storage:', e);
        }

        return null;
      }

      /**
       * Update contributions section with donation amount
       */
      function updateContributionsSection(amount) {
        if (!HAS_DOM || !amount || amount <= 0) return;

        const amountText = `$${amount.toFixed(2)}`;
        console.log('🔄 Updating contributions section with amount:', amountText);

        // Method 1: Find contributions section by common selectors
        const contributionSelectors = [
          '.contribution-amount',
          '.donation-amount',
          '#contribution-amount',
          '#donation-amount',
          '[data-contribution]',
          '[data-donation]',
          '.contribution',
          '#contribution'
        ];

        contributionSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              el.textContent = amountText;
              el.style.color = '#10b981';
              el.style.fontWeight = 'bold';
              console.log('✅ Updated contribution element:', selector, amountText);
            });
          } catch (e) {
            // Continue
          }
        });

        // Method 2: Find "Contribution" text and update nearby amount
        const contributionLabels = document.querySelectorAll('*');
        contributionLabels.forEach(el => {
          if (el.textContent && (el.textContent.includes('Contribution') || el.textContent.includes('Donation'))) {
            const parent = el.parentElement || el;
            const amountElements = parent.querySelectorAll('.amount, [data-amount], .text-2xl, .text-xl, .font-bold');
            amountElements.forEach(amountEl => {
              if (amountEl.textContent && (amountEl.textContent.includes('$') || !isNaN(parseFloat(amountEl.textContent)))) {
                amountEl.textContent = amountText;
                amountEl.style.color = '#10b981';
                amountEl.style.fontWeight = 'bold';
                console.log('✅ Updated contribution amount:', amountText);
              }
            });
          }
        });

        console.log('✅ Contributions section update complete');
      }

      /**
       * Display donation amount prominently
       */
      function displayDonationAmount(amount) {
        if (!HAS_DOM) return;
        let displayEl = document.getElementById('hingecraft-donation-display');
        
        if (!displayEl) {
          displayEl = document.createElement('div');
          displayEl.id = 'hingecraft-donation-display';
          displayEl.style.cssText = `
            background: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            color: #065f46;
          `;
          
          const contributionsSection = document.querySelector('.contributions, [data-contributions], #contributions');
          if (contributionsSection) {
            contributionsSection.insertBefore(displayEl, contributionsSection.firstChild);
          } else {
            document.body.insertBefore(displayEl, document.body.firstChild);
          }
        }

        displayEl.innerHTML = `
          <div style="font-weight: bold; font-size: 24px; color: #10b981; margin-bottom: 8px;">
            Donation Amount: $${amount.toFixed(2)}
          </div>
          <div style="font-size: 14px; color: #059669;">
            Thank you for your contribution!
          </div>
        `;

        console.log('✅ Donation amount displayed:', amount);
      }

      /**
       * Handle checkout button click
       */
      function handleCheckoutClick() {
        const amount = donationAmount || getDonationAmount();
        
        if (amount && amount > 0) {
          storeDonationAmount(amount);
          const checkoutUrl = `${CONFIG.CHECKOUT_PAGE_URL}?donationAmount=${encodeURIComponent(amount)}`;
          
          console.log('✅ Proceeding to checkout:', checkoutUrl);
          
          if (typeof wixLocation !== 'undefined' && wixLocation.to) {
            wixLocation.to(checkoutUrl);
          } else {
            window.location.href = checkoutUrl;
          }
        } else {
          if (typeof wixLocation !== 'undefined' && wixLocation.to) {
            wixLocation.to(CONFIG.CHECKOUT_PAGE_URL);
          } else {
            window.location.href = CONFIG.CHECKOUT_PAGE_URL;
          }
        }
      }

      /**
       * Store donation amount
       */
      function storeDonationAmount(amount) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({
              amount: amount,
              timestamp: new Date().toISOString(),
              source: 'charter_page'
            }));
          }

          if (typeof wixStorage !== 'undefined') {
            wixStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
              amount: amount,
              timestamp: new Date().toISOString(),
              source: 'charter_page'
            }));
          }
        } catch (e) {
          console.error('Error storing amount:', e);
        }
      }

      /**
       * Add checkout button
       */
      function addCheckoutButton() {
        if (!HAS_DOM) return;
        if (document.getElementById('hingecraft-checkout-button')) {
          return;
        }

        const button = document.createElement('button');
        button.id = 'hingecraft-checkout-button';
        button.textContent = 'Proceed to Checkout';
        button.style.cssText = `
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 16px 32px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          margin: 20px auto;
          display: block;
          transition: background 0.3s;
        `;

        button.addEventListener('mouseenter', function() {
          this.style.background = '#059669';
        });

        button.addEventListener('mouseleave', function() {
          this.style.background = '#10b981';
        });

        button.addEventListener('click', handleCheckoutClick);

        const displayEl = document.getElementById('hingecraft-donation-display');
        if (displayEl) {
          displayEl.appendChild(button);
        } else {
          const contributionsSection = document.querySelector('.contributions, [data-contributions], #contributions');
          if (contributionsSection) {
            contributionsSection.appendChild(button);
          } else {
            document.body.appendChild(button);
          }
        }

        console.log('✅ Checkout button added');
      }

      /**
       * Initialize charter page
       */
      function init() {
        console.log('🚀 HingeCraft Charter Page initialized (WITH CHECKOUT FLOW)');

        if (!HAS_DOM) {
          console.log('ℹ️ DOM not available in this context. Skipping DOM bindings.');
          return;
        }

        donationAmount = getDonationAmount();

        if (donationAmount && donationAmount > 0) {
          console.log('💰 Donation amount found:', donationAmount);
          displayDonationAmount(donationAmount);
          updateContributionsSection(donationAmount);
          addCheckoutButton();

          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('fromPayment') === 'true') {
            console.log('✅ Redirected from payment page');
          }
        } else {
          console.log('ℹ️ No donation amount found');
        }
      }

      // Initialize
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }

      setTimeout(init, 1000);
    })();
});
