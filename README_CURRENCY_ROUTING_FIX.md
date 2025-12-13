# Currency Routing Fix - Complete Implementation

## Problem Summary
The currency selector was not updating the main CTA button URL when different payment methods were selected. Additionally, there was a `TypeError: (0 , charter_page_middleware_web.onReady) is not a function` error.

## Solutions Implemented

### 1. Fixed onReady TypeError
- Changed from direct module import to HTTP endpoint call
- The page now calls `/_functions/charter-page-middleware/onReady` via `fetch` instead of trying to import the module directly
- This is the correct pattern for Wix Velo web modules called from embedded HTML

### 2. Dynamic Payment Button URL Updates
- Added `paymentButtonUrl` and `paymentButtonText` state variables
- Created `updatePaymentButtonForRail()` function that updates button URL/text based on selected currency
- Button now changes dynamically:
  - **Crypto (SOL/XLM/BTC)**: Shows "Pay with {Currency} ⚡" initially, then "💳 Pay with NOWPayments →" after invoice creation
  - **Stripe (Card/ACH)**: Shows "Pay with Card 💳" or "Pay with ACH 🏦" initially, then "💳 Pay with Stripe →" after session creation

### 3. Payment Routes Map
- Added `PAYMENT_ROUTES` constant that maps each currency/rail to its payment configuration
- This will be populated from database exports (see `scripts/extract_database_urls.sql`)
- Currently uses placeholder structure - will be filled with real URLs from HingeCraft database

### 4. Button Behavior
- When a payment URL is available, the button becomes an `<a>` tag that redirects to the payment provider
- When no URL is available yet, it's a `<button>` that triggers payment creation
- Button styling changes based on payment type (blue for crypto, purple for Stripe)

## Files Modified

1. **`charter-page-wix-ready.html`**
   - Added `PAYMENT_ROUTES` constant
   - Added `paymentButtonUrl` and `paymentButtonText` state
   - Added `updatePaymentButtonForRail()` function
   - Updated `useEffect` to call `updatePaymentButtonForRail` when rail changes
   - Updated currency selector `onClick` to call `updatePaymentButtonForRail`
   - Updated `handleCryptoPayment` to set button URL after invoice creation
   - Updated `handleStripePayment` to set button URL after session creation
   - Updated button rendering to use `<a>` tag when URL is available

## Next Steps

### 1. Extract Database URLs
Run the database extraction scripts to get real payment URLs:
```bash
# For PostgreSQL
psql -h YOUR_HOST -U YOUR_USER -d hingecraft -f scripts/extract_database_urls.sql

# For MongoDB
node scripts/extract_database_urls_mongo.js
```

### 2. Populate Payment Routes
After extracting URLs, update `PAYMENT_ROUTES` in `charter-page-wix-ready.html` with real URLs from:
- `/tmp/hingecraft_payments.csv`
- `/tmp/hingecraft_external_payments.csv`
- `/tmp/hingecraft_crypto_payments.csv`
- `/tmp/hingecraft_stripe_payments.csv`

### 3. Test Currency Routing
1. Open Charter page
2. Select each currency (SOL, XLM, BTC, Card, ACH)
3. Verify button text changes: "Pay with Solana ⚡", "Pay with Card 💳", etc.
4. Click button and verify it redirects to correct payment provider URL

### 4. Enable Stripe Test Mode
1. Set `STRIPE_SECRET_TEST` in Wix Secrets Manager
2. Use Stripe CLI to test webhooks: `stripe listen --forward-to localhost:3000/_functions/webhooks/stripe`
3. Create test checkout sessions using `scripts/stripe_test_mode_setup.js`

### 5. Create NOWPayments Invoices
1. Set `NOWPAYMENTS_API_KEY` in Wix Secrets Manager
2. Test invoice creation using `scripts/nowpayments_invoice_creator.js`
3. Verify invoice URLs are stored in database and used by currency router

## Testing Checklist

- [ ] Currency selector updates button text when clicked
- [ ] Button URL updates when payment is created (crypto invoice or Stripe session)
- [ ] Button redirects to correct payment provider URL
- [ ] No `TypeError: onReady` errors in console
- [ ] All currencies have working payment flows
- [ ] Error messages display correctly if payment creation fails
- [ ] Button styling changes based on payment type

## Documentation

See `docs/T10-T30_PROMPTS.md` for comprehensive implementation guide with:
- T10-T30 detailed prompts for full system implementation
- Database extraction procedures
- Testing and deployment checklists
- Monitoring and alerting setup
- Security and compliance guidelines

## Support

If issues persist:
1. Check browser console for errors
2. Verify Wix Secrets are configured correctly
3. Check database exports for valid payment URLs
4. Review `docs/T10-T30_PROMPTS.md` for troubleshooting steps
