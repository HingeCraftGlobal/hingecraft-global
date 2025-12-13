# 🚀 Final Deployment Guide - HingeCraft Payment System

## ✅ Complete System Status

**All components are built and ready:**
- ✅ Backend Node.js server (Docker)
- ✅ Database migrations (Postgres)
- ✅ Wix Velo middleware (updated)
- ✅ Frontend HTML pages (updated)
- ✅ Payment routing logic (complete)
- ✅ Sync mechanisms (LISTEN/NOTIFY)

---

## 📋 Step-by-Step Deployment

### Step 1: Backend Setup (Docker)

**1.1 Create environment file:**
```bash
cd backend
cp .env.example .env
```

**1.2 Edit `.env` and add your keys:**
```bash
# Database (already configured in docker-compose.yml)
DATABASE_URL=postgresql://hingecraft_user:changeme@db:5432/hingecraft

# Stripe (YOUR Stripe dev key - get from Stripe Dashboard → Developers → API keys → Test mode)
STRIPE_SECRET=sk_test_51...  # YOUR KEY HERE
STRIPE_PUBLISHABLE=pk_test_51...  # Optional

# NowPayments (YOUR NowPayments key)
NOWPAYMENTS_API_KEY=your_nowpayments_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# Base URL
BASE_URL=https://www.hingecraft-global.ai

# Wix Webhooks (optional - for real-time updates)
WIX_WEBHOOK_ENDPOINTS=https://your-site.wixsite.com/_functions/hingecraftRoutesUpdate
WEBHOOK_SECRET=your_webhook_secret
```

**1.3 Start Docker services:**
```bash
docker-compose up --build -d
```

**1.4 Run migrations:**
```bash
./scripts/run-migrations.sh
```

**1.5 Verify backend is running:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

### Step 2: Wix Deployment

**2.1 Upload Backend Modules:**

In Wix Editor → Dev Mode → Backend:

1. **Web Modules:**
   - Upload `src/backend/charter-page-middleware.web.js`
   - Upload `src/backend/mission-support-middleware.web.js`

2. **Backend Functions:**
   - Upload `src/backend/stripe.api.jsw`
   - Upload `src/backend/nowpayments.api.jsw`

**2.2 Configure Secrets:**

Wix Editor → Settings → Secrets Manager:

Add these secrets:
- `STRIPE_SECRET_KEY_TEST` = `sk_test_...` (your Stripe test key)
- `STRIPE_PUBLISHABLE_KEY_TEST` = `pk_test_...` (optional)
- `NOWPAYMENTS_API_KEY` = your NowPayments key
- `NOWPAYMENTS_IPN_SECRET` = your IPN secret
- `BASE_URL` = `https://www.hingecraft-global.ai`

**2.3 Update HTML Pages:**

1. **Charter Page:**
   - Wix Editor → Pages → Charter of Abundance
   - Replace embedded HTML with content from `public/pages/charter-page-wix-ready.html`

2. **Mission Support Page:**
   - Wix Editor → Pages → Mission Support
   - Update embedded HTML with content from `public/pages/mission-support-form.html`

---

### Step 3: Database Setup

**3.1 Verify tables exist:**
```sql
-- Connect to Docker Postgres
docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft

-- Check tables
\dt

-- Should show:
-- payments
-- external_payments
-- wallets
-- payment_routes
-- payment_audit
-- contribution_intent
```

**3.2 Verify triggers:**
```sql
-- Check trigger function exists
\df notify_hc_routes

-- Should show: notify_hc_routes() returns trigger
```

**3.3 Test trigger:**
```sql
-- Insert test row
INSERT INTO external_payments (gateway, provider_url, currency, amount) 
VALUES ('stripe', 'https://checkout.stripe.com/test', 'USD', 1);

-- Check logs for NOTIFY message
-- Backend should receive notification and rebuild routes
```

---

### Step 4: Testing

**4.1 Test Backend Endpoints:**

```bash
# Health check
curl http://localhost:3000/health

# Get routes
curl http://localhost:3000/routes

# Test micro payment
curl -X POST http://localhost:3000/mission-support/micro-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 1, "userInfo": {"email": "test@example.com"}}'

# Test "Other" amount
curl -X POST http://localhost:3000/mission-support/other \
  -H "Content-Type: application/json" \
  -d '{"amount": 15, "userInfo": {"email": "test@example.com"}}'
```

**4.2 Test Wix Functions:**

Open browser console on your Wix site:

```javascript
// Test onReady
fetch('/_functions/charter-page-middleware/onReady', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log);

// Test micro payment
fetch('/_functions/mission-support-middleware/microPayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1 })
})
.then(r => r.json())
.then(console.log);
```

**4.3 Test End-to-End Flows:**

1. **Mission Support → Micro Payment:**
   - Go to Mission Support page
   - Click $1 button
   - Should redirect to Stripe checkout

2. **Mission Support → Other → Charter:**
   - Go to Mission Support page
   - Enter "Other" amount (e.g., $15)
   - Click Submit
   - Should redirect to Charter page
   - Charter page should show $15 in Contribution selector

3. **Charter → Currency → Payment:**
   - On Charter page, select currency (e.g., BTC)
   - Button should update to "Pay with Bitcoin ⚡"
   - Click button
   - Should create NowPayments invoice and show payment URL

---

## 🔍 Verification

### Check Backend Logs:
```bash
docker logs -f hingecraft-payment-api
```

Look for:
- ✅ "HingeCraft Payment Backend listening on port 3000"
- ✅ "Database listener started"
- ✅ "Payment routes built - version X"

### Check Database:
```sql
-- Check payment_routes has data
SELECT version, generated_at FROM payment_routes ORDER BY version DESC LIMIT 1;

-- Check external_payments has URLs
SELECT gateway, provider_url, currency FROM external_payments LIMIT 10;
```

### Check Wix Console:
- Open browser DevTools on Charter page
- Check Console for errors
- Should see: "✅ Charter page initialized"
- Should see: "✅ Stripe initialized"
- No 403 CloudFront errors

---

## 🎯 Success Indicators

After deployment, you should see:

1. **Mission Support Form:**
   - ✅ $1/$2/$5 buttons create Stripe sessions
   - ✅ "Other" amount redirects to Charter with prefill
   - ✅ No errors in console

2. **Charter Page:**
   - ✅ Loads without TypeError
   - ✅ Prefill amount appears if coming from Mission Support
   - ✅ Currency selector updates button URL
   - ✅ Button redirects to correct payment provider

3. **Backend:**
   - ✅ Routes rebuild when database changes
   - ✅ Webhooks notify Wix (if configured)
   - ✅ Reconciliation job runs every 15 minutes

---

## 📝 Files to Deploy

### Backend (Docker):
- `backend/src/server.js`
- `backend/src/db.js`
- `backend/src/routesBuilder.js`
- `backend/src/listener.js`
- `backend/src/stripe.js`
- `backend/src/nowpayments.js`
- `backend/src/reconcile.js`
- `backend/worker.js`
- `backend/docker-compose.yml`
- `backend/Dockerfile`
- `backend/package.json`
- `backend/migrations/*.sql`

### Wix:
- `src/backend/charter-page-middleware.web.js`
- `src/backend/mission-support-middleware.web.js`
- `src/backend/stripe.api.jsw`
- `src/backend/nowpayments.api.jsw`
- `public/pages/charter-page-wix-ready.html` (update Charter page)
- `public/pages/mission-support-form.html` (update Mission Support page)

---

## 🚨 Important Notes

1. **Stripe Key:** You must add your Stripe dev key to `.env` file. The code reads from `STRIPE_SECRET` environment variable.

2. **NowPayments Key:** Add your NowPayments API key to `.env` and Wix Secrets.

3. **Database:** Ensure your Docker Postgres has all required tables. Run migrations if needed.

4. **Wix Secrets:** All API keys must be in Wix Secrets Manager, not in code.

5. **Testing:** Use Stripe test mode for development. Test cards: `4242 4242 4242 4242`

---

**Everything is ready. Just add your API keys and deploy!** 🎉
