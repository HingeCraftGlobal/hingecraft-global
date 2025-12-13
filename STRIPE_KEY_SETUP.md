# Stripe Key Setup - Secure Configuration

## ⚠️ IMPORTANT SECURITY NOTE

**DO NOT** paste your Stripe key directly in code. Always use Wix Secrets Manager.

## Your Stripe Key

You provided:
```
sk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy
```

This is a **LIVE** key (starts with `sk_live`). Handle it securely.

## Setup Steps

### 1. Add to Wix Secrets Manager

1. **Open Wix Editor**
2. **Go to:** Settings → Secrets Manager
3. **Click:** "Add Secret"
4. **Name:** `STRIPE_SECRET_KEY_LIVE`
5. **Value:** `sk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy`
6. **Click:** "Save"

### 2. Get Publishable Key

Your publishable key should be:
```
pk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy
```

(Replace `sk_live` with `pk_live`)

**Add to Wix Secrets:**
- Name: `STRIPE_PUBLISHABLE_KEY_LIVE`
- Value: `pk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy`

### 3. Backend Environment Variable (Docker)

**For the Docker backend**, add to `backend/.env`:

```bash
STRIPE_SECRET=sk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy
STRIPE_PUBLISHABLE=pk_live51SSLTfB6IrLBi7R1bVy3pngb9CsfgIFfzu4ckLKKuuvxwjkQ2HPTwEEbjIWq6GMuI6o2SAHc53wDZsGSHeiuaadj00Kej7ixoy
```

**⚠️ DO NOT commit `.env` to git!**

### 4. Verify Setup

After adding secrets:
1. **Deploy** your Wix backend functions
2. **Test** by creating a payment
3. **Check logs** to confirm Stripe is initialized in LIVE mode

## Security Checklist

- [ ] Stripe key added to Wix Secrets Manager (not in code)
- [ ] Publishable key added to Wix Secrets Manager
- [ ] Backend `.env` file has key (if using Docker backend)
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] No keys visible in code files
- [ ] No keys in console logs (masked)

## Testing

After setup, test with a small amount ($1) to verify:
- ✅ Stripe session creates successfully
- ✅ Redirects to Stripe checkout
- ✅ Payment processes correctly

**Note:** This is a LIVE key, so real payments will be processed. Use test mode for development if needed.
