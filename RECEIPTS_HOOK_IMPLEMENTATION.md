# Receipts Database Hook - Implementation Complete ✅

## Overview

A database hook has been implemented to automatically save all email receipts to a dedicated `Receipts` collection in the database. This provides a complete audit trail and allows for receipt management, resending, and analytics.

## Implementation Details

### Automatic Hook Integration

The hook is **automatically called** whenever a receipt email is sent:

```javascript
// In sendPaymentReceiptEmail() function
await saveReceiptToDatabase(email, paymentData, receiptEmail, emailResult, isGPTGenerated);
```

### Hook Flow

1. **Receipt Generation**
   - GPT-generated receipt (if OpenAI key available)
   - OR template-based receipt (fallback)

2. **Email Sending**
   - Send via SendGrid (if configured)
   - Track success/failure

3. **Database Save** (Automatic Hook) ✅
   - Generate unique receipt ID
   - Create complete receipt record
   - Save to `Receipts` collection
   - Link to submission via `submissionId`
   - **Non-blocking** - doesn't break email flow if save fails

## Receipts Collection Schema

### Collection Name: `Receipts`

**Location:** Database → Collections → Receipts

**Schema:**
```javascript
{
  _id: string,                    // Unique receipt ID
  receiptNumber: string,          // Receipt number (e.g., "MS-1234567890")
  recipientEmail: string,         // Recipient email
  recipientName: string,          // Full name
  firstName: string,             // First name
  lastName: string,              // Last name
  address: string,               // Address
  missionSupportName: string,    // Optional
  amount: number,                // Donation amount
  currency: string,              // "USD"
  paymentMethod: string,         // "card" or "crypto"
  paymentStatus: string,         // "pending", "completed", "failed"
  transactionId: string,         // Transaction ID
  invoiceId: string,             // Invoice ID (crypto)
  source: string,                // Source identifier
  emailSubject: string,          // Email subject line
  emailHtml: string,             // Complete HTML email
  emailText: string,             // Plain text email
  isGPTGenerated: boolean,       // GPT vs template
  emailSent: boolean,            // Send success
  emailSentAt: Date,            // Send timestamp
  emailError: string,           // Error message (if any)
  submissionId: string,         // Link to submission
  created_at: Date,             // Creation timestamp
  metadata: {
    paymentData: object,
    emailService: string,
    gptModel: string,
    templateVersion: string
  }
}
```

## Functions Available

### 1. Automatic Hook (Built-in)
- **Function:** `saveReceiptToDatabase()` (internal)
- **Called:** Automatically when `sendPaymentReceiptEmail()` is called
- **Location:** `mission-support-middleware.jsw`

### 2. Standalone Receipt Management
- **File:** `receipts-hook.jsw`
- **Functions:**
  - `saveReceipt()` - Save receipt manually
  - `getReceipt(receiptId)` - Get receipt by ID
  - `getReceiptsByEmail(email)` - Get all receipts for email
  - `getReceiptsBySubmissionId(submissionId)` - Get receipt for submission
  - `resendReceipt(receiptId)` - Resend receipt email
  - `getReceiptStatistics()` - Get receipt statistics

## Database Setup

### Step 1: Create Receipts Collection

1. Go to: **Wix Editor → Database → Collections**
2. Click **"Add Collection"**
3. Name: **`Receipts`**
4. Add all fields from schema above

### Step 2: Set Up Indexes

Recommended indexes:
- `_id` (primary key) - Auto-indexed
- `receiptNumber` - For lookups
- `recipientEmail` - For email queries
- `submissionId` - For linking to submissions
- `created_at` - For sorting
- `emailSent` - For filtering

### Step 3: Configure Permissions

- **Read:** Staff only (or public if needed)
- **Write:** System only (via backend functions)
- **Delete:** Staff only

## Usage Examples

### Query Receipts by Email

```javascript
// Via API
POST /_functions/receipts-hook/getReceiptsByEmail
Body: { email: "donor@example.com" }
```

### Get Receipt by ID

```javascript
// Via API
POST /_functions/receipts-hook/getReceipt
Body: { receiptId: "receipt_123abc..." }
```

### Resend Receipt

```javascript
// Via API
POST /_functions/receipts-hook/resendReceipt
Body: { receiptId: "receipt_123abc..." }
```

### Get Statistics

```javascript
// Via API
POST /_functions/receipts-hook/getReceiptStatistics
```

## Integration Points

### 1. Mission Support Form Submission
```javascript
submitMissionSupportForm() 
  → sendPaymentReceiptEmail() 
  → saveReceiptToDatabase() ✅ (automatic hook)
```

### 2. Micro Payments
```javascript
microPayment() 
  → processMicroPayment() 
  → sendPaymentReceiptEmail() 
  → saveReceiptToDatabase() ✅ (automatic hook)
```

### 3. Payment Webhooks
```javascript
Stripe/NOWPayments webhook 
  → Update payment status 
  → sendPaymentReceiptEmail() 
  → saveReceiptToDatabase() ✅ (automatic hook)
```

## Benefits

1. **Complete Audit Trail**
   - Every receipt is stored
   - Track email delivery
   - Monitor GPT vs template usage

2. **Receipt Management**
   - Resend failed receipts
   - Retrieve original content
   - Maintain receipt history

3. **Compliance**
   - Proof of receipt delivery
   - Tax record keeping
   - Legal documentation

4. **Analytics**
   - Track receipt generation methods
   - Monitor email delivery rates
   - Analyze receipt content

5. **Error Recovery**
   - Identify failed sends
   - Retry failed receipts
   - Track resend attempts

## Error Handling

- **Non-blocking:** Database save doesn't break email flow
- **Graceful degradation:** Email still sends if database save fails
- **Error logging:** All errors are logged for debugging
- **Retry capability:** Failed receipts can be resent

## Testing Checklist

- [ ] Create `Receipts` collection in Wix
- [ ] Test receipt saving on form submission
- [ ] Test receipt saving on micro payment
- [ ] Test receipt saving on crypto payment
- [ ] Verify all fields are populated
- [ ] Test receipt retrieval by email
- [ ] Test receipt retrieval by submission ID
- [ ] Test receipt resend functionality
- [ ] Test receipt statistics
- [ ] Verify error handling

## Files Created/Updated

1. ✅ `src/backend/mission-support-middleware.jsw` - Updated with hook
2. ✅ `src/backend/receipts-hook.jsw` - Standalone receipt management
3. ✅ `DATABASE_RECEIPTS_COLLECTION.md` - Complete documentation
4. ✅ `RECEIPTS_HOOK_IMPLEMENTATION.md` - This file

## Deployment Steps

1. **Upload Backend Functions:**
   - Upload `mission-support-middleware.jsw` (updated with hook)
   - Upload `receipts-hook.jsw` (optional, for management functions)

2. **Create Database Collection:**
   - Create `Receipts` collection
   - Add all fields from schema
   - Set up indexes

3. **Test Hook:**
   - Submit a test form
   - Verify receipt is saved
   - Check all fields populated

4. **Monitor:**
   - Check receipt creation
   - Monitor error rates
   - Verify email delivery

## Status

✅ **Receipts Hook Implemented and Ready**

- Automatic saving on email send
- Complete receipt data stored
- Linked to submissions
- Error handling in place
- Management functions available
- Documentation complete

**Ready for deployment!**

---

**Last Updated:** $(date)
**Status:** ✅ Complete
