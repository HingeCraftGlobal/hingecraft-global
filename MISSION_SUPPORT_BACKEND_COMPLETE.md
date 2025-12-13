# Mission Support Backend - Complete Implementation

## Overview

The Mission Support backend has been completely rebuilt to handle:
- ✅ All form fields (firstName, lastName, email, address, missionSupportName, amount)
- ✅ Complete database synchronization (ContributionIntent, Donations, CryptoPayments)
- ✅ Payment processing (micro payments, other amounts, crypto)
- ✅ GPT-generated email receipts (highest most detailed form)
- ✅ Template-based email fallback
- ✅ Full data collection and user flow tracking

## Backend Functions

### 1. `submitMissionSupportForm(formData)` - Main Submission Function

**Purpose:** Complete form submission with all fields, database sync, and email receipt

**Parameters:**
```javascript
{
  firstName: string,        // Required
  lastName: string,         // Required
  email: string,            // Required
  address: string,          // Required
  missionSupportName: string, // Optional
  amount: number,           // Required (1.00 - 25000.00)
  paymentMethod: string,    // 'card' or 'crypto'
  sessionId: string,        // Optional
  anonymousFingerprint: string, // Optional
  referrerSource: string,   // Optional
  pageUrl: string,          // Optional
  userAgent: string         // Optional
}
```

**Returns:**
```javascript
{
  success: boolean,
  submissionId: string,
  paymentResult: object,
  message: string
}
```

**Database Collections Updated:**
- `ContributionIntent` - Primary submission record
- `Donations` - Payment tracking record
- `CryptoPayments` - Crypto payment record (if crypto method)

**Email:** Automatically sends GPT-generated receipt email

### 2. `microPayment(amount, userInfo)` - Micro Payment Handler

**Purpose:** Creates Stripe checkout for $1, $2, or $5 payments

**Parameters:**
```javascript
amount: 1 | 2 | 5,
userInfo: {
  email: string,
  firstName: string,
  lastName: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  url: string,           // Stripe checkout URL
  sessionId: string,
  amount: number
}
```

**Database:** Saves to `Donations` collection

**Email:** Sends receipt email after payment

### 3. `otherAmount(amount, userInfo)` - Other Amount Handler

**Purpose:** Creates prefill token for custom amounts and redirects to Charter page

**Parameters:**
```javascript
amount: number,          // 1.00 - 25000.00
userInfo: {
  email: string,
  firstName: string,
  lastName: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  redirectUrl: string,   // Charter page URL with prefill
  prefillId: string,
  amount: number
}
```

**Database:** Saves to `ContributionIntent` collection with prefill token

### 4. `getPrefill(prefillId)` - Prefill Retrieval

**Purpose:** Retrieves prefill data for Charter page

**Parameters:**
```javascript
prefillId: string
```

**Returns:**
```javascript
{
  success: boolean,
  amount: number,
  prefillId: string,
  userInfo: object
}
```

### 5. `sendPaymentReceiptEmail(email, paymentData)` - Email Receipt

**Purpose:** Sends GPT-generated detailed receipt email

**Parameters:**
```javascript
email: string,
paymentData: {
  firstName: string,
  lastName: string,
  email: string,
  address: string,
  missionSupportName: string,
  amount: number,
  paymentMethod: string,
  paymentResult: object,
  created_at: Date,
  _id: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string (if failed)
}
```

## Database Schema

### ContributionIntent Collection

**Fields:**
```javascript
{
  _id: string,                    // Unique submission ID
  firstName: string,              // Donor first name
  lastName: string,               // Donor last name
  email: string,                  // Donor email
  address: string,                // Donor address
  missionSupportName: string,     // Optional mission support name
  amount: number,                 // Donation amount
  currency: string,               // 'USD'
  paymentMethod: string,          // 'card' or 'crypto'
  paymentStatus: string,          // 'pending', 'completed', 'failed'
  source: string,                 // 'mission_support_form'
  created_at: Date,               // Submission timestamp
  updated_at: Date,               // Last update timestamp
  expires_at: Date,               // For prefill tokens (10 min expiry)
  used: boolean,                  // For prefill tokens
  metadata: {
    sessionId: string,
    anonymousFingerprint: string,
    referrerSource: string,
    pageUrl: string,
    userAgent: string
  }
}
```

### Donations Collection

**Fields:**
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  address: string,
  amount: number,
  currency: string,               // 'USD'
  payment_method: string,         // 'stripe', 'crypto', etc.
  payment_status: string,         // 'pending', 'completed', 'failed'
  source: string,                 // 'mission_support_micro', 'mission_support_form', etc.
  gateway: string,                // 'stripe', 'nowpayments', etc.
  provider: string,               // Payment provider
  provider_id: string,            // Session ID or invoice ID
  provider_url: string,           // Payment URL
  created_at: Date,
  metadata: {
    submissionId: string,
    missionSupportName: string,
    preset_amount: number,
    user_info: object,
    stripe_session_id: string
  }
}
```

### CryptoPayments Collection

**Fields:**
```javascript
{
  invoice_id: string,             // NOWPayments invoice ID
  order_id: string,               // Order ID
  price_amount: number,           // USD amount
  price_currency: string,         // 'USD'
  pay_currency: string,           // Crypto currency (USDT, BTC, etc.)
  pay_amount: number,             // Crypto amount
  payment_address: string,        // Crypto wallet address
  payment_url: string,            // Payment page URL
  status: string,                 // 'waiting', 'confirmed', 'failed'
  email: string,
  firstName: string,
  lastName: string,
  created_at: Date,
  metadata: {
    submissionId: string,
    missionSupportName: string
  }
}
```

## Email Receipt System

### GPT-Generated Receipts

The system uses GPT-4 Turbo to generate highly detailed, professional receipt emails with:

1. **Professional Design:**
   - HTML email with inline CSS
   - Responsive layout
   - Brand colors and styling
   - Clear visual hierarchy

2. **Complete Information:**
   - Receipt number
   - Payment date
   - Amount (formatted)
   - Payment method
   - Transaction ID
   - Donor information
   - Mission support name (if provided)

3. **Compliance:**
   - Tax-deductibility notice
   - CAN-SPAM compliance
   - GDPR considerations
   - Unsubscribe links
   - Preference management

4. **Impact Statement:**
   - How the contribution is used
   - Mission impact details
   - Community benefits

5. **Contact Information:**
   - Support email
   - Website link
   - Clear call-to-action

### Template Fallback

If GPT is unavailable, the system uses a detailed template-based receipt with all the same information.

### Email Service

- **Primary:** SendGrid (if configured)
- **Fallback:** Template-based (logs email for manual sending)

## API Endpoints

### Submit Complete Form
```
POST /_functions/mission-support-middleware/submitMissionSupportForm
Content-Type: application/json

Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  address: "123 Main St",
  missionSupportName: "Education Initiative",
  amount: 50.00,
  paymentMethod: "card",
  sessionId: "session_123",
  anonymousFingerprint: "fp_123",
  referrerSource: "direct",
  pageUrl: "https://...",
  userAgent: "Mozilla/5.0..."
}
```

### Micro Payment
```
POST /_functions/mission-support-middleware/microPayment
Content-Type: application/json

Body: {
  amount: 5,
  userInfo: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe"
  }
}
```

### Other Amount
```
POST /_functions/mission-support-middleware/otherAmount
Content-Type: application/json

Body: {
  amount: 100.00,
  userInfo: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe"
  }
}
```

### Get Prefill
```
POST /_functions/mission-support-middleware/getPrefill
Content-Type: application/json

Body: {
  prefillId: "prefill_abc123"
}
```

### Send Receipt Email
```
POST /_functions/mission-support-middleware/sendPaymentReceiptEmail
Content-Type: application/json

Body: {
  email: "john@example.com",
  paymentData: { ... }
}
```

## Required Secrets

Configure in Wix Secrets Manager:

- `STRIPE_SECRET_KEY_LIVE` - Stripe live secret key
- `STRIPE_PUBLISHABLE_KEY_LIVE` - Stripe live publishable key
- `NOWPAYMENTS_API_KEY` - NOWPayments API key
- `OPENAI_API_KEY` - OpenAI API key (for GPT receipts)
- `SENDGRID_API_KEY` - SendGrid API key (for email sending)
- `BASE_URL` - Base URL (default: https://www.hingecraft-global.ai)

## Frontend Integration

The frontend should call `submitMissionSupportForm` for complete form submissions:

```javascript
const response = await fetch('/_functions/mission-support-middleware/submitMissionSupportForm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    address: formData.address,
    missionSupportName: formData.missionSupportName,
    amount: formData.amount,
    paymentMethod: paymentMethod,
    sessionId: generateSessionId(),
    anonymousFingerprint: getAnonymousFingerprint(),
    referrerSource: document.referrer || 'direct',
    pageUrl: window.location.href,
    userAgent: navigator.userAgent
  })
});
```

## Testing Checklist

- [ ] Test form submission with all fields
- [ ] Verify database records are created correctly
- [ ] Test micro payments ($1, $2, $5)
- [ ] Test other amounts (redirect to Charter)
- [ ] Test crypto payments
- [ ] Verify email receipts are sent
- [ ] Test GPT receipt generation
- [ ] Test template fallback
- [ ] Verify prefill tokens work
- [ ] Test form validation
- [ ] Verify session storage
- [ ] Test error handling

## Deployment

1. **Upload Backend Function:**
   - Upload `mission-support-middleware.jsw` to Wix Editor → Backend → Functions

2. **Configure Secrets:**
   - Add all required secrets in Wix Secrets Manager

3. **Verify Database Collections:**
   - Ensure `ContributionIntent`, `Donations`, and `CryptoPayments` exist

4. **Test Endpoints:**
   - Test all API endpoints
   - Verify email sending works
   - Check database records

5. **Update Frontend:**
   - Update form submission to use `submitMissionSupportForm`
   - Test all payment flows

## Status

✅ **Backend Complete**
- All functions implemented
- Database integration complete
- Email receipt system ready
- GPT integration ready
- Template fallback ready

**Ready for deployment and testing!**
