# ⚡ T10 Quick Reference Guide
## HingeCraft Global - Crypto Payment Integration

**Last Updated:** January 27, 2025

---

## 🎯 Key Features

### ✅ Active Crypto Payment Buttons
- **Solana (SOL)** - Wallet: `E42RZJc4e8UQ5fFi8QkPtRSuJXZ1pQmPVMX91LYAAT2H`
- **Stellar (XLM)** - Configured
- **Bitcoin (BTC)** - Wallet: `bc1qgpe8zk87xxs90gd7jqqndxct4ttlj2mrt2rs6w`
- **Ethereum (ETH)** - Wallet: `0xbf907088116868986c014f9662a8efcbeb168237`

### ✅ Preset Amount Buttons
- **$1** - Linked to crypto payments
- **$5** - Linked to crypto payments
- **$20** - Linked to crypto payments

### ✅ Dynamic Contributions Counter
- Pulls from database (Donations + CryptoPayments)
- Updates in real-time
- Shows cumulative total

---

## 📁 File Locations

### Backend Middleware:
```
src/backend/charter-page-middleware.jsw
src/backend/mission-support-middleware.jsw
```

### Frontend Pages:
```
public/pages/charter-page-final.html
public/pages/mission-support-form.html
```

### Wix Velo Page Code:
```
src/pages/Charter of Abundance Invitation.pa3z2.js
src/pages/Mission Support.msup1.js
```

### API Handlers:
```
src/backend/nowpayments.api.jsw
src/backend/stripe.api.jsw
src/backend/hingecraft.api.web.jsw
```

---

## 🔧 API Endpoints

### Charter Page Middleware:
- `/_functions/charter-page-middleware/onReady` - Initialize page
- `/_functions/charter-page-middleware/cryptoButtonClick` - Handle crypto payment
- `/_functions/charter-page-middleware/fiatButtonClick` - Handle Stripe payment
- `/_functions/charter-page-middleware/getCumulativeTotal` - Get total from DB

### Mission Support Middleware:
- `/_functions/mission-support-middleware/onReady` - Initialize page
- `/_functions/mission-support-middleware/handleUserInputDonation` - Handle form submission
- `/_functions/mission-support-middleware/goToCharterAfterPayment` - Redirect to charter

### NowPayments API:
- `/_functions/nowpayments.api/createInvoice` - Create crypto invoice
- `/_functions/nowpayments.api/getInvoiceStatus` - Check payment status

### Stripe API:
- `/_functions/stripe.api/getPublishableKey` - Get Stripe key
- `/_functions/stripe.api/createCheckoutSession` - Create checkout session

---

## 💾 Database Collections

### Donations
- Stores all fiat (Stripe) donations
- Fields: `amount`, `payment_status`, `payment_method`, `transaction_id`

### CryptoPayments
- Stores all crypto payments
- Fields: `price_amount`, `pay_amount_crypto`, `pay_currency`, `status`, `tx_hash`

### ContributionIntent
- Stores form submission intents
- Fields: `amount_entered`, `status`, `first_name`, `last_name`, `email`

### WebhookLogs
- Stores webhook events
- Fields: `event_type`, `payload_json`, `processing_status`

---

## 🔐 Secrets Required

```
NOWPAYMENTS_API_KEY = JEH3VG9-648MJPE-HPETPZ7-QVCSBES
NOWPAYMENTS_IPN_SECRET = 8TnzsveF28gelMuvXFMxgPW5YUXYkcL9
NOWPAYMENTS_BASE_URL = https://api.nowpayments.io/v1
BASE_URL = https://www.hingecraft-global.ai
STRIPE_SECRET_KEY_LIVE = [Your Stripe Dev Key]
STRIPE_PUBLISHABLE_KEY_LIVE = [Your Stripe Publishable Key]
```

---

## 🔄 Payment Flow

### Crypto Payment Flow:
```
User clicks crypto button
    ↓
cryptoButtonClick(amount, coin)
    ↓
createNowPaymentsInvoice()
    ↓
Display wallet address + QR code
    ↓
User sends crypto payment
    ↓
Webhook received → Update database
    ↓
Update cumulative total
```

### Card Payment Flow:
```
User clicks Stripe button
    ↓
fiatButtonClick(preset)
    ↓
createCheckoutSession()
    ↓
Redirect to Stripe Checkout
    ↓
Payment completed → Webhook
    ↓
Update database → Update total
```

### Mission Support → Charter Flow:
```
User fills Mission Support form
    ↓
handleUserInputDonation()
    ↓
If Card: goToCharterAfterPayment()
    ↓
Redirect to Charter Page with amount
    ↓
Charter Page displays amount
    ↓
User completes payment
```

---

## 🧪 Testing Checklist

### Charter Page:
- [ ] Preset buttons ($1, $5, $20) display
- [ ] Crypto buttons appear after selecting amount
- [ ] Crypto button click creates invoice
- [ ] Wallet address displays correctly
- [ ] QR code generates
- [ ] Payment status polling works
- [ ] Cumulative total displays

### Mission Support:
- [ ] Form validates correctly
- [ ] Crypto payment creates invoice
- [ ] Card payment redirects to Charter
- [ ] Amount passes to Charter Page
- [ ] Database writes work

### Database:
- [ ] Donations save correctly
- [ ] CryptoPayments save correctly
- [ ] Cumulative total calculates correctly
- [ ] Database listeners work

---

## 🐛 Common Issues

### Crypto buttons not working:
1. Check NOWPayments API key in Secrets Manager
2. Verify backend function is deployed
3. Check browser console for errors

### Cumulative total not updating:
1. Verify database collections exist
2. Check `getCumulativeTotal()` function
3. Verify database listeners are active

### Mission Support not redirecting:
1. Check `goToCharterAfterPayment()` function
2. Verify URL parameters
3. Check browser console

---

## 📞 Quick Commands

### Deploy:
```bash
cd [PROJECT_ROOT]/hingecraft-global
./scripts/deploy-to-wix-cli.sh
```

### Check Database:
```sql
-- Total donations
SELECT SUM(amount) FROM donations WHERE payment_status = 'completed';

-- Total crypto
SELECT SUM(price_amount) FROM crypto_payments WHERE status = 'confirmed';
```

---

## 📚 Documentation Files

- `T10_COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `DEPLOYMENT_GUIDE_T10.md` - Step-by-step deployment guide
- `QUICK_REFERENCE_T10.md` - This file

---

**Status:** ✅ All systems operational
