# Complete Deployment Guide - HingeCraft Global

## Overview

This guide covers the **complete deployment** of all HingeCraft components including:
- ✅ All backend Velo functions
- ✅ HTML pages (Mission Support & Charter)
- ✅ Live chat with marketing notifications
- ✅ GPT form configuration system
- ✅ Receipts database hook
- ✅ Full database setup

## New Features Added

### 1. Live Chat Marketing Notifications ✅

**File:** `src/backend/chat-notifications.jsw`

**Functions:**
- `notifyMarketingOnQuestion(chatData)` - Analyzes chat with GPT and notifies marketing if question needs human response
- `saveChatMessage(chatData)` - Saves chat messages to database
- `getChatHistory(userId)` - Retrieves chat history

**How It Works:**
1. User sends message in live chat
2. GPT analyzes message intent
3. If question needs human response → Notify marketing email
4. Save message to `ChatMessages` collection
5. Marketing receives detailed notification email

**Integration:**
- Automatically hooked into `handleSendMessage()` in mission-support-form.html
- Non-blocking - doesn't break chat if notification fails

### 2. GPT Form Configuration ✅

**File:** `src/backend/gpt-form-config.jsw`

**Functions:**
- `configureFormFromPrompt(prompt, formId)` - Uses GPT to configure form based on prompt
- `updateFormConfiguration(formId, config)` - Update form configuration
- `getFormConfiguration(formId)` - Get current configuration

**How It Works:**
1. Send prompt describing desired form configuration
2. GPT analyzes prompt and generates complete form config
3. Config saved to `FormConfigurations` collection
4. Form can be updated based on GPT recommendations

### 3. Receipts Database Hook ✅

**File:** `src/backend/receipts-hook.jsw`

**Functions:**
- `saveReceipt()` - Save receipt to database (automatic hook)
- `getReceipt(receiptId)` - Get receipt by ID
- `resendReceipt(receiptId)` - Resend receipt email

**How It Works:**
- Automatically saves all receipts to `Receipts` collection
- Tracks GPT vs template generation
- Tracks email delivery status
- Enables receipt management and resending

## Database Collections Required

### 1. ContributionIntent
- All form submissions
- Prefill tokens
- User flow tracking

### 2. Donations
- Payment tracking
- Stripe sessions
- Payment reconciliation

### 3. CryptoPayments
- Crypto invoice tracking
- NOWPayments integration

### 4. Receipts (NEW)
- All email receipts
- Complete email content (HTML & text)
- GPT vs template tracking
- Email delivery status

### 5. ChatMessages (NEW)
- All chat messages
- GPT intent analysis
- Marketing notification status
- User information

### 6. FormConfigurations (NEW)
- GPT-generated form configs
- Version history
- Active configurations

## Backend Functions to Deploy

### Core Functions
1. **mission-support-middleware.jsw** ✅
   - Complete form submission
   - Payment processing
   - Email receipts
   - Database sync

2. **charter-page-middleware.jsw** ✅
   - Page initialization
   - Payment processing
   - Cumulative totals

3. **stripe.api.jsw** ✅
   - Stripe checkout sessions
   - Webhook handling

4. **nowpayments.api.jsw** ✅
   - Crypto invoice creation
   - Payment status

### New Functions
5. **chat-notifications.jsw** ✅ (NEW)
   - Chat message analysis
   - Marketing notifications
   - Chat history

6. **gpt-form-config.jsw** ✅ (NEW)
   - GPT form configuration
   - Config management

7. **receipts-hook.jsw** ✅ (NEW)
   - Receipt management
   - Resend capability

## Secrets Configuration

### Required Secrets

Configure in **Wix Editor → Settings → Secrets**:

1. **STRIPE_SECRET_KEY_LIVE**
   - Your Stripe live secret key
   - Format: `sk_live...`

2. **STRIPE_PUBLISHABLE_KEY_LIVE**
   - Your Stripe live publishable key
   - Format: `pk_live...`

3. **NOWPAYMENTS_API_KEY**
   - Your NOWPayments API key

4. **OPENAI_API_KEY** (NEW)
   - OpenAI API key for GPT features
   - Used for: Receipt generation, chat analysis, form configuration

5. **SENDGRID_API_KEY** (NEW)
   - SendGrid API key for email sending
   - Used for: Receipt emails, marketing notifications

6. **MARKETING_EMAIL** (NEW)
   - Marketing team email address
   - Default: `marketing@hingecraft-global.ai`
   - Receives chat question notifications

7. **BASE_URL** (Optional)
   - Base URL for redirects
   - Default: `https://www.hingecraft-global.ai`

## Deployment Steps

### Step 1: Start Wix Dev Mode

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./FULL_DEPLOYMENT_COMPLETE.sh
```

Or manually:
```bash
wix dev
```

### Step 2: Upload Backend Functions

1. Open Wix Editor: https://editor.wix.com
2. Enable Dev Mode (toggle in top bar)
3. Go to: **Backend → Functions**
4. Upload all 7 backend functions:
   - `mission-support-middleware.jsw`
   - `charter-page-middleware.jsw`
   - `stripe.api.jsw`
   - `nowpayments.api.jsw`
   - `chat-notifications.jsw` (NEW)
   - `gpt-form-config.jsw` (NEW)
   - `receipts-hook.jsw` (NEW)

### Step 3: Configure Secrets

Go to: **Settings → Secrets** and add all required secrets listed above.

### Step 4: Create Database Collections

Go to: **Database → Collections** and create:

1. **ContributionIntent**
   - Fields: firstName, lastName, email, address, missionSupportName, amount, currency, paymentMethod, paymentStatus, source, created_at, updated_at, expires_at, used, metadata

2. **Donations**
   - Fields: firstName, lastName, email, address, amount, currency, payment_method, payment_status, source, gateway, provider, provider_id, provider_url, created_at, metadata

3. **CryptoPayments**
   - Fields: invoice_id, order_id, price_amount, price_currency, pay_currency, pay_amount, payment_address, payment_url, status, email, firstName, lastName, created_at, metadata

4. **Receipts** (NEW)
   - Fields: receiptNumber, recipientEmail, recipientName, firstName, lastName, address, missionSupportName, amount, currency, paymentMethod, paymentStatus, transactionId, invoiceId, source, emailSubject, emailHtml, emailText, isGPTGenerated, emailSent, emailSentAt, emailError, submissionId, created_at, metadata

5. **ChatMessages** (NEW)
   - Fields: message, userId, userEmail, userName, sessionId, pageUrl, source, intent, needsHumanResponse, priority, category, notified, notifiedAt, created_at, metadata

6. **FormConfigurations** (NEW)
   - Fields: formId, configuration, prompt, version, isActive, created_at, updated_at, metadata

### Step 5: Embed HTML Pages

#### Mission Support Page
1. Open Mission Support page in Wix Editor
2. Add HTML element
3. Paste contents of: `public/pages/mission-support-form.html`
4. Configure: Width 100%, Height Auto

#### Charter Page
1. Open Charter page in Wix Editor
2. Add HTML element
3. Paste contents of: `public/pages/charter-page-wix-ready.html`
4. Configure: Width 100%, Height Auto

### Step 6: Test Everything

#### Test Form Submission
- Fill out all fields
- Submit form
- Verify database records created
- Verify email receipt sent

#### Test Payments
- Test micro payments ($1, $2, $5)
- Test other amounts (redirect to Charter)
- Test crypto payments
- Verify payment records in database

#### Test Live Chat
- Send a question in chat
- Verify marketing email notification
- Verify chat message saved to database
- Check GPT intent analysis

#### Test Email Receipts
- Complete a payment
- Verify receipt email sent
- Verify receipt saved to database
- Check GPT vs template generation

#### Test GPT Form Configuration
```javascript
POST /_functions/gpt-form-config/configureFormFromPrompt
Body: {
  prompt: "Make the form more user-friendly with better validation",
  formId: "mission-support-form"
}
```

### Step 7: Publish

When all tests pass:
1. Review all changes
2. Test on preview site
3. Publish to production

## Live Chat Integration

### How It Works

1. **User sends message** in live chat
2. **Message sent** via WebSocket
3. **Notification hook triggered** (non-blocking)
4. **GPT analyzes** message intent
5. **If question** → Notify marketing email
6. **Save to database** → ChatMessages collection

### Marketing Notification Email Includes:
- User information (name, email, page)
- Full message text
- GPT intent analysis
- Priority level
- Suggested response
- Quick action buttons

### Chat Message Storage

All chat messages are saved to `ChatMessages` collection with:
- Complete message text
- User information
- GPT intent analysis
- Notification status
- Timestamps

## GPT Form Configuration

### Usage

```javascript
// Configure form from prompt
POST /_functions/gpt-form-config/configureFormFromPrompt
Body: {
  prompt: "Add better validation and improve user experience",
  formId: "mission-support-form"
}
```

### What GPT Configures:
- Field configurations (required/optional, validation)
- Payment options
- Form layout suggestions
- Validation rules
- Error messages
- Success messages

### Configuration Storage:
- Saved to `FormConfigurations` collection
- Version history maintained
- Active configuration tracked

## Receipts Management

### Automatic Saving
- All receipts automatically saved when emails sent
- Complete email content stored (HTML & text)
- GPT vs template tracking
- Email delivery status

### Receipt Retrieval
```javascript
// Get receipt by ID
POST /_functions/receipts-hook/getReceipt
Body: { receiptId: "receipt_123..." }

// Get receipts by email
POST /_functions/receipts-hook/getReceiptsByEmail
Body: { email: "donor@example.com" }

// Resend receipt
POST /_functions/receipts-hook/resendReceipt
Body: { receiptId: "receipt_123..." }
```

## Testing Checklist

- [ ] All backend functions uploaded
- [ ] All secrets configured
- [ ] All database collections created
- [ ] HTML pages embedded
- [ ] Form submission works
- [ ] Payments work (micro, other, crypto)
- [ ] Email receipts sent
- [ ] Receipts saved to database
- [ ] Live chat works
- [ ] Marketing notifications sent
- [ ] Chat messages saved to database
- [ ] GPT form configuration works
- [ ] All error handling works

## Troubleshooting

### Chat Notifications Not Working
- Verify `MARKETING_EMAIL` secret is set
- Check `OPENAI_API_KEY` is configured
- Verify `chat-notifications.jsw` is uploaded
- Check browser console for errors

### Receipts Not Saving
- Verify `Receipts` collection exists
- Check database permissions
- Verify `mission-support-middleware.jsw` is updated
- Check logs for errors

### GPT Features Not Working
- Verify `OPENAI_API_KEY` is set
- Check API key is valid
- Verify functions are uploaded
- Check error logs

## Status

✅ **Full Deployment Ready**

- All backend functions complete
- All HTML pages ready
- Database schemas defined
- Live chat integrated
- Marketing notifications ready
- GPT features ready
- Receipts system ready

**Ready for deployment!**

---

**Last Updated:** $(date)
**Status:** ✅ Complete and Ready for Deployment
