# Wix CLI Backend Deployment - Complete Guide

## Overview

This guide covers deploying Velo backend code using Wix CLI. Wix CLI manages code through git integration and local development environment.

## Wix CLI Commands Reference

**Official Documentation:**  
https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/wix-cli-for-sites-commands

## Key Commands

### `wix dev`
Opens local development environment for your Wix site.

**Usage:**
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
```

**What it does:**
- Opens Local Editor
- Syncs local code with Wix
- Enables hot-reload for development

### `wix publish`
Publishes your site to production.

**Usage:**
```bash
wix publish --source remote  # Publish from git repo
wix publish --source local    # Publish from local code
```

**Options:**
- `--source <local|remote>` - Source of files to publish
- `--approve-preview` - Auto-approve preview
- `--force` - Skip build errors

### `wix whoami`
Shows currently logged-in user.

### `wix login`
Logs in to Wix account.

## Backend Functions (8 Total)

All backend functions are `.jsw` files (HTTP-accessible):

1. **`payment-info-service.jsw`** ⭐ (NEW - must be first)
   - Unified payment data access
   - Functions: `getPaymentInfo`, `formatPaymentInfoForEmail`, `getPaymentSummary`

2. **`mission-support-middleware.jsw`** ⭐ (PRIMARY)
   - Mission Support form backend
   - Functions: `submitMissionSupportForm`, `microPayment`, `otherAmount`, `getPrefill`, `sendPaymentReceiptEmail`

3. **`charter-page-middleware.jsw`**
   - Charter page backend
   - Functions: `onReady`, `cryptoButtonClick`, `fiatButtonClick`, `getCumulativeTotal`

4. **`stripe.api.jsw`**
   - Stripe integration
   - Functions: `createCheckoutSession`, `getPublishableKey`, `handleWebhook`

5. **`nowpayments.api.jsw`**
   - Crypto payments
   - Functions: `createNowPaymentsInvoice`, `getInvoiceStatus`

6. **`chat-notifications.jsw`**
   - Chat notifications
   - Functions: `notifyMarketingOnQuestion`, `saveChatMessage`, `getChatHistory`

7. **`gpt-form-config.jsw`**
   - GPT form configuration
   - Functions: `configureFormFromPrompt`, `updateFormConfiguration`, `getFormConfiguration`

8. **`receipts-hook.jsw`**
   - Receipts management
   - Functions: `saveReceipt`, `getReceipt`, `resendReceipt`

## Page-Level Code Updated

All pages now use HTTP endpoints instead of direct imports:

1. **Charter of Abundance Invitation** (`pa3z2.js`)
   - ✅ Uses `callVeloFunction()` helper
   - ✅ Calls `/_functions/charter-page-middleware/*`

2. **Payment/Mission Support** (`xf66z.js`)
   - ✅ Uses `callVeloFunction()` helper
   - ✅ Calls `/_functions/mission-support-middleware/*`

3. **Mission Support** (`b6v8z.js`)
   - ✅ Uses `callVeloFunction()` helper
   - ✅ Integrated with all middleware

4. **Master Page** (`masterPage.js`)
   - ✅ Uses HTTP endpoints only

## Deployment Workflow

### Step 1: Start Wix Dev

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./DEPLOY_VELO_BACKEND.sh
```

This will:
- Stop any existing `wix dev` processes
- Start fresh `wix dev` instance
- Verify all backend files
- Verify all page-level code

### Step 2: Upload Backend Functions (Manual)

**Wix CLI does NOT automatically upload backend functions.**

You must upload via Wix Editor:

1. Open: https://editor.wix.com
2. Enable Dev Mode
3. Go to: **Backend → Functions**
4. Upload all 8 `.jsw` files from `src/backend/`

**Upload order:**
1. `payment-info-service.jsw` (must be first)
2. `mission-support-middleware.jsw`
3. `charter-page-middleware.jsw`
4. `stripe.api.jsw`
5. `nowpayments.api.jsw`
6. `chat-notifications.jsw`
7. `gpt-form-config.jsw`
8. `receipts-hook.jsw`

### Step 3: Configure Secrets

Go to: **Settings → Secrets**

Add:
- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_PUBLISHABLE_KEY_LIVE`
- `NOWPAYMENTS_API_KEY`
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`
- `MARKETING_EMAIL`
- `BASE_URL` (optional)

### Step 4: Create Database Collections

Go to: **Database → Collections**

Create:
- `ContributionIntent`
- `Donations`
- `CryptoPayments`
- `Receipts`
- `ChatMessages`
- `FormConfigurations`

### Step 5: Embed HTML Pages

1. **Mission Support Page:**
   - Add HTML element
   - Paste: `public/pages/mission-support-form.html`

2. **Charter Page:**
   - Add HTML element
   - Paste: `public/pages/charter-page-wix-ready.html`

### Step 6: Publish

**Option A: Via Wix Editor**
- Click "Publish" button

**Option B: Via Wix CLI**
```bash
wix publish --source remote  # From git repo
# or
wix publish --source local    # From local code
```

## Git Integration

Wix CLI uses git integration:

- **Local code** = Files in your workspace
- **Remote code** = Files in git repo (`origin/main`)

**Publishing from remote:**
- Uses code from `origin/main` branch
- Ensures consistency with git repo

**Publishing from local:**
- Uses code from your workspace
- May differ from git repo

## Status

✅ **Git:** All changes committed and pushed  
✅ **Wix Dev:** Running cleanly  
✅ **Backend Files:** All 8 verified  
✅ **Page Code:** All updated to use HTTP endpoints  
⏳ **Backend Upload:** Manual via Wix Editor required  
⏳ **Publish:** Ready via Wix Editor or CLI

---

**Last Updated:** $(date)  
**Wix CLI:** Running  
**Status:** ✅ Ready for deployment
