# Wix Implementation Blueprint - Auto-Fill Contributions from Other Amount

## 🎯 Objective

Implement auto-fill functionality where:
1. User enters "Other" amount on payment page
2. Amount is captured and stored
3. User is redirected to contributions/charter page
4. Contributions amount is automatically updated with the donation amount

---

## 📋 Complete Data Flow

```
Payment Page (/payment)
  ↓
User selects "Other" amount option
  ↓
User enters custom amount (e.g., $50.00)
  ↓
User submits payment
  ↓
payment-page-integration.js captures amount
  ↓
Amount stored in 3 locations:
  1. Wix Storage (hingecraft_donation)
  2. sessionStorage (hingecraft_donation)
  3. Database via API (POST /donations)
  ↓
Redirect to Charter/Contributions Page
  URL: /charter?donationAmount=50.00
  ↓
Charter Page (/charter)
  ↓
charter-page.html retrieves amount from:
  1. URL parameter (?donationAmount=50.00)
  2. Wix Storage
  3. sessionStorage
  4. Database API (latest donation)
  ↓
Displays amount below "Contribution" section
  "Donation Amount: $50.00"
```

---

## 🔧 Implementation Requirements

### 1. Payment Page Integration (EXISTING CODE - Keep Exactly As Is)

**File**: `payment-page-integration.js`

**Location**: Add to Wix Payment Page → Custom Code section

**Key Functions** (Already Implemented):
- ✅ `getDonationAmount()` - Captures "Other" amount from form
- ✅ `storeInWixStorage()` - Stores in Wix Storage
- ✅ `storeInSessionStorage()` - Stores in sessionStorage
- ✅ `saveToDatabase()` - Saves to database via API
- ✅ `handlePaymentSubmit()` - Handles form submission and redirect

**Critical Code Section** (Lines 194-229):
```javascript
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
}
```

**⚠️ IMPORTANT**: This code is already correct. DO NOT MODIFY. It:
- Captures the "Other" amount
- Stores it in multiple locations
- Creates redirect URL with donationAmount parameter
- Logs the redirect URL

**What Needs to Happen**:
- After payment processing completes, redirect to the charterUrl
- This may need to be added to the payment processor's success callback

---

### 2. Charter/Contributions Page Integration (EXISTING CODE - Keep Exactly As Is)

**File**: `charter-page.html`

**Location**: Add to Wix Charter/Contributions Page → Custom Code section

**Key Code Section** (Lines 70-97):
```javascript
useEffect(() => {
  const retrieveDonationAmount = async () => {
    let amount = 0;
    
    // 1. Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('donationAmount');
    if (urlAmount) { 
      amount = parseFloat(urlAmount) || 0; 
    }
    
    // 2. Check Wix Storage
    if (!amount && typeof wixStorage !== 'undefined') {
      try {
        const stored = wixStorage.getItem('hingecraft_donation');
        if (stored) { 
          const data = JSON.parse(stored); 
          amount = parseFloat(data.amount) || 0; 
        }
      } catch (error) { 
        console.log("Could not retrieve from Wix Storage:", error); 
      }
    }
    
    // 3. Check sessionStorage
    if (!amount && typeof sessionStorage !== 'undefined') {
      try {
        const sessionData = sessionStorage.getItem('hingecraft_donation');
        if (sessionData) { 
          const data = JSON.parse(sessionData); 
          amount = parseFloat(data.amount) || 0; 
        }
      } catch (error) { 
        console.log("Could not retrieve from sessionStorage:", error); 
      }
    }
    
    // 4. Check database API (fallback)
    if (!amount) {
      try {
        const response = await fetch('/_functions/getLatestDonation', { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        });
        if (response.ok) { 
          const data = await response.json(); 
          if (data && data.amount) { 
            amount = parseFloat(data.amount) || 0; 
          } 
        }
      } catch (error) { 
        console.log("Could not retrieve from database API:", error); 
      }
    }
    
    // Set donation amount if found
    if (amount > 0) { 
      setDonationAmount(amount); 
    }
  };
  retrieveDonationAmount();
}, []);
```

**Display Code** (Line 243):
```javascript
{donationAmount && donationAmount > 0 && (
  <div className="mt-2 text-lg font-semibold text-emerald-600">
    Donation Amount: {formatUSD(donationAmount)}
  </div>
)}
```

**⚠️ IMPORTANT**: This code is already correct. DO NOT MODIFY. It:
- Retrieves amount from URL parameter (priority 1)
- Falls back to Wix Storage (priority 2)
- Falls back to sessionStorage (priority 3)
- Falls back to database API (priority 4)
- Displays amount below "Contribution" section

---

## 🔄 What Needs to Be Added

### Option 1: Payment Processor Success Callback (Recommended)

If using Wix Payments or Stripe, add redirect in success callback:

```javascript
// In payment-page-integration.js, after handlePaymentSubmit
// Add to payment processor success callback:

function handlePaymentSuccess(paymentResult) {
  // Get the stored redirect URL
  const redirectUrl = sessionStorage.getItem('hingecraft_redirect_url');
  
  if (redirectUrl) {
    // Redirect to charter page with donation amount
    window.location.href = redirectUrl;
  } else {
    // Fallback: construct URL from stored amount
    const storedData = sessionStorage.getItem('hingecraft_donation');
    if (storedData) {
      const data = JSON.parse(storedData);
      window.location.href = `${CONFIG.CHARTER_PAGE_URL}?donationAmount=${data.amount}`;
    }
  }
}
```

### Option 2: Intercept Form Submission (If Needed)

If the payment form doesn't automatically redirect, intercept the submission:

```javascript
// Add to payment-page-integration.js init() function
function init() {
  // ... existing code ...
  
  // Intercept form submission to ensure redirect happens
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(event) {
      await handlePaymentSubmit(event);
      
      // If form would normally submit, prevent default and redirect
      // Only if "Other" amount was found
      const amount = getDonationAmount();
      if (amount && amount > 0) {
        // Wait a moment for storage to complete
        setTimeout(() => {
          const charterUrl = `${CONFIG.CHARTER_PAGE_URL}?donationAmount=${amount}`;
          window.location.href = charterUrl;
        }, 500);
      }
    });
  }
}
```

---

## 📝 Configuration Values

### Payment Page Configuration

Update these in `payment-page-integration.js`:

```javascript
const CONFIG = {
  // API endpoint - Update to your production URL
  API_ENDPOINT: 'https://your-deployed-api-url.com',
  // OR for local: 'http://localhost:3000',
  
  // Secret key - Must match ADAPTOR_SECRET_KEY from .env
  SECRET_KEY: '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b',
  
  // Charter page URL - Update to your actual page URL
  CHARTER_PAGE_URL: '/charter',
  // OR: '/contributions', '/membership', etc.
  
  // Storage keys (keep as is)
  STORAGE_KEY: 'hingecraft_donation',
  SESSION_KEY: 'hingecraft_donation',
};
```

### Charter Page Configuration

No configuration needed - it automatically:
- Reads from URL parameter
- Falls back to storage
- Displays the amount

---

## 🎯 Exact Implementation Steps

### Step 1: Add Payment Page Code

1. Go to **Wix Editor** → **Payment Page**
2. Click **Add** → **Custom Code** (or use Code Panel)
3. Copy entire `payment-page-integration.js` file
4. Update `CONFIG` values:
   - `API_ENDPOINT`: Your database adaptor URL
   - `SECRET_KEY`: Your secret key from `.env`
   - `CHARTER_PAGE_URL`: Your charter/contributions page URL
5. Paste code into Custom Code section
6. Save

### Step 2: Verify "Other" Amount Field

Ensure your payment form has an "Other" amount input with one of these:
- `id="other-amount"`
- `name="otherAmount"`
- Or update selector in `getDonationAmount()` function

### Step 3: Add Charter Page Code

1. Go to **Wix Editor** → **Charter/Contributions Page**
2. Click **Add** → **Custom Code** (or use Code Panel)
3. Copy entire `charter-page.html` file
4. Paste code into Custom Code section
5. Save

**Note**: The charter page code is a complete React component. You may need to:
- Add it as an HTML embed
- Or extract just the donation amount retrieval logic if you have existing page code

### Step 4: Add Redirect Logic (If Needed)

If payment doesn't automatically redirect:

1. Find your payment processor's success callback
2. Add redirect code (see "What Needs to Be Added" above)
3. Or modify `handlePaymentSubmit` to include redirect

### Step 5: Test Complete Flow

1. Navigate to payment page
2. Select "Other" amount
3. Enter amount (e.g., $50.00)
4. Submit payment
5. Verify redirect to `/charter?donationAmount=50.00`
6. Verify amount displays below "Contribution" section

---

## 🔍 Code Preservation Checklist

### Payment Page Code - DO NOT MODIFY

- ✅ `getDonationAmount()` function - Keep exactly as is
- ✅ `storeInWixStorage()` function - Keep exactly as is
- ✅ `storeInSessionStorage()` function - Keep exactly as is
- ✅ `saveToDatabase()` function - Keep exactly as is
- ✅ `handlePaymentSubmit()` function - Keep exactly as is
- ✅ Storage keys - Keep as `'hingecraft_donation'`
- ✅ Only update: `CONFIG` values (API_ENDPOINT, SECRET_KEY, CHARTER_PAGE_URL)

### Charter Page Code - DO NOT MODIFY

- ✅ `retrieveDonationAmount()` useEffect - Keep exactly as is
- ✅ Retrieval priority order - Keep exactly as is
- ✅ Display code - Keep exactly as is
- ✅ No configuration needed

---

## 🚨 Critical Requirements

1. **Code Must Be Exactly The Same**: Only update configuration values
2. **Storage Keys Must Match**: Both pages use `'hingecraft_donation'`
3. **URL Parameter Format**: Must be `?donationAmount={amount}` (numeric)
4. **Redirect Must Happen**: After payment, redirect to charter page with amount
5. **Display Must Work**: Charter page must show amount below "Contribution"

---

## 📊 Data Flow Verification

### Payment Page → Storage

```javascript
// Payment page stores:
wixStorage.setItem('hingecraft_donation', JSON.stringify({
  amount: 50.00,
  timestamp: '2025-11-29T...',
  source: 'payment_page'
}));

sessionStorage.setItem('hingecraft_donation', JSON.stringify({
  amount: 50.00,
  timestamp: '2025-11-29T...',
  source: 'payment_page'
}));
```

### Charter Page ← Retrieval

```javascript
// Charter page retrieves (in priority order):
1. URL: ?donationAmount=50.00
2. wixStorage.getItem('hingecraft_donation')
3. sessionStorage.getItem('hingecraft_donation')
4. Database API: /_functions/getLatestDonation
```

---

## 🎨 Display Location

The donation amount displays in the charter page at:

**Location**: Below "Contribution" section
**Code**: Line 243 in `charter-page.html`

```javascript
<div className="mt-6 flex items-center justify-between gap-4">
  <div>
    <div className="text-sm uppercase text-slate-500">Contribution</div>
    <div className="text-2xl font-bold">{formatUSD(finalAmount)}</div>
    
    {/* THIS IS WHERE DONATION AMOUNT APPEARS */}
    {donationAmount && donationAmount > 0 && (
      <div className="mt-2 text-lg font-semibold text-emerald-600">
        Donation Amount: {formatUSD(donationAmount)}
      </div>
    )}
    
    {multiplier !== 1 && (
      <div className="text-xs text-slate-500">
        Base {formatUSD(amount)} × {multiplier.toFixed(3)} (rail multiplier)
      </div>
    )}
  </div>
  {/* ... rest of component ... */}
</div>
```

---

## ✅ Final Checklist

- [ ] Payment page code added to Wix
- [ ] CONFIG values updated (API_ENDPOINT, SECRET_KEY, CHARTER_PAGE_URL)
- [ ] "Other" amount field has correct ID/name
- [ ] Charter page code added to Wix
- [ ] Redirect logic added (if needed)
- [ ] Test: Payment page captures amount
- [ ] Test: Amount stored in Wix Storage
- [ ] Test: Amount stored in sessionStorage
- [ ] Test: Amount saved to database
- [ ] Test: Redirect to charter page with ?donationAmount parameter
- [ ] Test: Charter page displays amount below "Contribution"
- [ ] Test: Amount persists if user navigates away and returns

---

## 📚 Files Reference

- **Payment Page Code**: `payment-page-integration.js` (276 lines)
- **Charter Page Code**: `charter-page.html` (412 lines)
- **Database Schema**: `database/init.sql`
- **API Documentation**: `DATABASE_OPERATIONAL_COMPLETE.md`

---

## 🔗 Related Documentation

- **Complete Setup**: `COMPLETE_SETUP_PROCESS.md`
- **Wix Setup**: `WIX_SETUP.md`
- **Database Config**: `DATABASE_CONFIG.md`
- **Project Setup**: `PROJECT_SETUP.md`

---

**Status**: ✅ Code is ready - Only configuration and redirect logic needed
**Last Updated**: 2025-11-29
**Version**: 1.0.0

