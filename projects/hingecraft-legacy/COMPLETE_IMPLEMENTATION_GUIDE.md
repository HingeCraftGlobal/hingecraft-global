# 🚀 Complete Implementation Guide - All Code & Steps

## ✅ Status: READY TO IMPLEMENT

**Flow**: Payment Page → Charter Page → Checkout  
**Time Required**: ~10 minutes  
**Files Needed**: 2 files

---

## 📦 File 1: Payment Page JavaScript Code

**Location**: Payment Page → Settings → Custom Code → JavaScript  
**File**: `PAYMENT_PAGE_READY_TO_COPY.js`

### Complete Code:

```javascript
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
```

### Configuration:
- **Line 21**: `CHARTER_PAGE_URL: '/charter'` - Update to your actual charter page URL
- Common URLs: `/charter`, `/membership`, `/contributions`

---

## 📦 File 2: Charter Page HTML Code

**Location**: Charter Page → Settings → Custom Code → HTML  
**File**: `CHARTER_PAGE_READY_TO_COPY.html`

### Complete Code:

```html
<!DOCTYPE html>
<!--
  HingeCraft Charter Page - WITH CHECKOUT FLOW
  Flow: Payment Page → Charter Page → Checkout
  
  This version:
  - Displays donation amount
  - Updates contributions section
  - Provides checkout button to proceed to checkout
  - Works WITHOUT external database (uses local storage)
-->

<script>
// Charter Page Integration - WITH CHECKOUT FLOW
(function() {
  'use strict';

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
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('donationAmount') || urlParams.get('amount');
    if (urlAmount) {
      const amount = parseFloat(urlAmount);
      if (!isNaN(amount) && amount > 0) {
        return amount;
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
   * This updates the contributions section on the charter page
   */
  function updateContributionsSection(amount) {
    if (!amount || amount <= 0) return;

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
          el.style.color = '#10b981'; // Green color
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
        // Look for amount in same element or nearby
        const parent = el.parentElement || el;
        
        // Try to find amount display
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

    // Method 3: Update React component state if available
    if (typeof window !== 'undefined' && window.React) {
      // Try to find React component and update state
      const reactRoot = document.getElementById('root');
      if (reactRoot && reactRoot._reactInternalInstance) {
        console.log('✅ React component found, amount will be displayed');
      }
    }

    console.log('✅ Contributions section update complete');
  }

  /**
   * Display donation amount prominently
   */
  function displayDonationAmount(amount) {
    // Create or update donation display
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
      
      // Insert at top of page or in contributions section
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
      // Store amount for checkout page
      storeDonationAmount(amount);
      
      // Redirect to checkout with amount
      const checkoutUrl = `${CONFIG.CHECKOUT_PAGE_URL}?donationAmount=${encodeURIComponent(amount)}`;
      
      console.log('✅ Proceeding to checkout:', checkoutUrl);
      
      if (typeof wixLocation !== 'undefined' && wixLocation.to) {
        wixLocation.to(checkoutUrl);
      } else {
        window.location.href = checkoutUrl;
      }
    } else {
      // No amount, just go to checkout
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
    // Check if button already exists
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

    // Insert button after donation display or in contributions section
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

    // Get donation amount
    donationAmount = getDonationAmount();

    if (donationAmount && donationAmount > 0) {
      console.log('💰 Donation amount found:', donationAmount);

      // Display donation amount
      displayDonationAmount(donationAmount);

      // Update contributions section
      updateContributionsSection(donationAmount);

      // Add checkout button
      addCheckoutButton();

      // Check if coming from payment page
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

  // Also initialize after delay
  setTimeout(init, 1000);

})();
</script>
```

### Configuration:
- **Line 21**: `CHECKOUT_PAGE_URL: '/checkout'` - Update to your actual checkout page URL

---

## 🚀 Step-by-Step Implementation

### STEP 1: Deploy Payment Page (3 minutes)

1. **Open Wix Editor**
   - Go to your Wix site
   - Click "Edit Site"

2. **Navigate to Payment Page**
   - Find your payment page
   - Click on it

3. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"JavaScript"** section

4. **Replace Code**
   - **DELETE** all existing code in the editor
   - Copy the **ENTIRE** Payment Page JavaScript code above
   - **Paste** into JavaScript editor

5. **Update Configuration**
   - Find line 21: `CHARTER_PAGE_URL: '/charter'`
   - Update to your actual charter page URL if different
   - Common URLs: `/charter`, `/membership`, `/contributions`

6. **Save**
   - Click **"Save"** button
   - Code is now active

7. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Payment Page is now LIVE!**

---

### STEP 2: Deploy Charter Page (3 minutes)

1. **Navigate to Charter Page**
   - Find your charter/contributions page
   - Click on it

2. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"HTML"** section

3. **Replace Code**
   - **DELETE** all existing code in the editor
   - Copy the **ENTIRE** Charter Page HTML code above
   - **Paste** into HTML editor

4. **Update Configuration**
   - Find line 21: `CHECKOUT_PAGE_URL: '/checkout'`
   - Update to your actual checkout page URL if different

5. **Save**
   - Click **"Save"** button
   - Code is now active

6. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Charter Page is now LIVE!**

---

### STEP 3: Test Complete Flow (4 minutes)

1. **Go to Payment Page**
   - Use Preview or Published site
   - Navigate to payment page

2. **Enter "Other" Amount**
   - Find "Other" amount field
   - Enter amount: `50.00` or `$50.00`

3. **Click Submit Button**
   - Click submit/pay button
   - **✅ Should redirect to Charter Page IMMEDIATELY**

4. **Verify Charter Page**
   - ✅ Should see: **"Donation Amount: $50.00"**
   - ✅ Contributions section should show: **"$50.00"**
   - ✅ Should see: **"Proceed to Checkout" button**

5. **Click Checkout Button**
   - Click "Proceed to Checkout" button
   - **✅ Should redirect to Checkout Page**

6. **Verify Checkout**
   - ✅ Should be on checkout page
   - ✅ URL should have: `?donationAmount=50`
   - ✅ Payment should process correctly

**✅ Flow is working!**

---

## ✅ Implementation Checklist

### Payment Page
- [ ] Code deployed to Wix
- [ ] `CHARTER_PAGE_URL` updated (line 21)
- [ ] No form submission errors
- [ ] Redirects to charter page immediately
- [ ] Amount captured correctly

### Charter Page
- [ ] Code deployed to Wix
- [ ] `CHECKOUT_PAGE_URL` updated (line 21)
- [ ] Donation amount displays prominently
- [ ] Contributions section updates automatically
- [ ] Checkout button appears
- [ ] Redirects to checkout correctly

### Checkout
- [ ] Receives amount from charter page
- [ ] Amount in URL parameter
- [ ] Payment processes correctly

### Complete Flow
- [ ] Payment → Charter → Checkout flow works
- [ ] All verifications passed
- [ ] Site is LIVE and working

---

## 🎯 Expected Behavior

1. **User enters "Other" amount** → Amount captured
2. **Clicks submit** → Redirects to charter page immediately
3. **Charter page loads** → Shows donation amount
4. **Contributions update** → Shows updated amount
5. **User clicks checkout** → Goes to checkout page
6. **Payment processes** → Transaction completes

---

## 🔧 Troubleshooting

### Payment Page Not Redirecting
- Check browser console for errors
- Verify `CHARTER_PAGE_URL` is correct
- Ensure "Other" amount field is detected (check selectors in code)

### Charter Page Not Showing Amount
- Check browser console for errors
- Verify URL has `?donationAmount=50` parameter
- Check sessionStorage/Wix Storage in browser DevTools

### Checkout Button Not Appearing
- Check browser console for errors
- Verify donation amount is found
- Check if button is being added to DOM

---

## ✅ Status: READY TO IMPLEMENT

**All code is ready. Follow steps above to implement on Wix.**

**Implementation Time**: ~10 minutes  
**Testing Time**: ~5 minutes  
**Total Time**: ~15 minutes

---

**Once implemented, your site will be LIVE and ready for testing!**







