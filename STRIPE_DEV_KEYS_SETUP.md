# Stripe Dev Keys Setup for HingeCraft

## 🔑 Finding Your Stripe Test Keys

### Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Log in with your HingeCraft account
3. **Toggle to "Test mode"** (switch in top right)

### Step 2: Get API Keys
1. Go to **Developers → API keys**
2. You'll see:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### Step 3: Add to Wix Secrets Manager
**In Wix Editor → Settings → Secrets:**

Add these secrets:
```
STRIPE_SECRET_KEY_TEST=sk_test_51... (your full secret key)
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51... (your full publishable key)
```

## 🧪 Test Mode Features

### Test Cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`
- **Any future expiry date**
- **Any 3-digit CVC**
- **Any ZIP code**

### Test Bank Account (ACH):
- Use Stripe's test bank account numbers
- See: https://stripe.com/docs/testing#ach-direct-debit

## ✅ Verification

After adding secrets, test:

```javascript
// In browser console on Charter page
fetch('/_functions/stripe.api/getPublishableKey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => {
  console.log('Stripe Key:', data);
  // Should show: { success: true, publishableKey: "pk_test_..." }
});
```

## 🔄 Auto-Detection

The code now:
1. ✅ Tries `STRIPE_SECRET_KEY_TEST` first
2. ✅ Falls back to `STRIPE_SECRET_KEY_LIVE` if test not found
3. ✅ Logs which mode is being used
4. ✅ Derives publishable key from secret if not in secrets

## 📝 Notes

- **Test mode** is safe - no real charges
- **Live mode** processes real payments
- Always use **test mode** for development
- Switch to **live mode** only in production
