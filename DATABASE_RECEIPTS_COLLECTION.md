# Receipts Database Collection - Implementation Guide

## Overview

The Receipts collection stores all email receipts sent to donors, organized in their own dedicated collection for easy management and retrieval.

## Collection Name

**`Receipts`** - Dedicated collection for all payment receipts

## Schema

```javascript
{
  _id: string,                    // Unique receipt ID (e.g., "receipt_123abc...")
  receiptNumber: string,          // Receipt number (e.g., "MS-1234567890" or submission ID)
  recipientEmail: string,         // Recipient email address
  recipientName: string,          // Full name: "FirstName LastName"
  firstName: string,             // Donor first name
  lastName: string,              // Donor last name
  address: string,               // Donor address
  missionSupportName: string,    // Optional: Mission support name
  amount: number,                // Donation amount
  currency: string,              // Currency code (default: "USD")
  paymentMethod: string,         // Payment method: "card" or "crypto"
  paymentStatus: string,         // Payment status: "pending", "completed", "failed"
  transactionId: string,         // Transaction ID (Stripe session ID or invoice ID)
  invoiceId: string,             // Invoice ID (for crypto payments)
  source: string,                // Source: "mission_support_form", "mission_support_micro", etc.
  emailSubject: string,           // Email subject line
  emailHtml: string,             // Complete HTML email content
  emailText: string,             // Plain text email content
  isGPTGenerated: boolean,       // Whether receipt was GPT-generated (true) or template-based (false)
  emailSent: boolean,            // Whether email was successfully sent
  emailSentAt: Date,            // Timestamp when email was sent (if successful)
  emailError: string,           // Error message if email failed (if any)
  submissionId: string,         // Reference to ContributionIntent submission ID
  created_at: Date,             // Receipt creation timestamp
  metadata: {
    paymentData: {
      paymentMethod: string,
      paymentResult: object,
      created_at: Date
    },
    emailService: string,       // Email service used: "sendgrid", "wix", "none"
    gptModel: string,          // GPT model used (if GPT-generated): "gpt-4-turbo-preview"
    templateVersion: string    // Template version (if template-based): "v1.0"
  }
}
```

## Indexes

Recommended indexes for optimal performance:

- `_id` (primary key) - Auto-indexed
- `receiptNumber` - For receipt lookups
- `recipientEmail` - For finding receipts by email
- `submissionId` - For linking to submissions
- `created_at` - For sorting and date range queries
- `emailSent` - For filtering sent/unsent receipts
- `isGPTGenerated` - For filtering GPT vs template receipts

## Database Hook Implementation

The hook is automatically called whenever a receipt email is sent:

```javascript
// Automatically called in sendPaymentReceiptEmail()
await saveReceiptToDatabase(email, paymentData, receiptEmail, emailResult, isGPTGenerated);
```

### Hook Flow

1. **Receipt Generation**
   - GPT-generated receipt (if OpenAI key available)
   - OR template-based receipt (fallback)

2. **Email Sending**
   - Send via SendGrid (if configured)
   - OR log for manual sending (if not configured)

3. **Database Save** (Automatic Hook)
   - Generate unique receipt ID
   - Create receipt record with all data
   - Save to `Receipts` collection
   - Link to submission via `submissionId`

4. **Error Handling**
   - Database save is non-blocking
   - Email sending continues even if database save fails
   - Errors are logged but don't break the flow

## Usage Examples

### Query Receipts by Email

```javascript
const receipts = await wixData.query('Receipts')
    .eq('recipientEmail', 'donor@example.com')
    .descending('created_at')
    .find();
```

### Query Receipts by Submission ID

```javascript
const receipt = await wixData.query('Receipts')
    .eq('submissionId', 'ms_123abc...')
    .find();
```

### Query GPT-Generated Receipts

```javascript
const gptReceipts = await wixData.query('Receipts')
    .eq('isGPTGenerated', true)
    .descending('created_at')
    .find();
```

### Query Failed Email Sends

```javascript
const failedReceipts = await wixData.query('Receipts')
    .eq('emailSent', false)
    .find();
```

### Get Receipt by Receipt Number

```javascript
const receipt = await wixData.query('Receipts')
    .eq('receiptNumber', 'MS-1234567890')
    .find();
```

## Benefits of Dedicated Collection

1. **Organization**
   - All receipts in one place
   - Easy to find and manage
   - Separate from payment/submission data

2. **Audit Trail**
   - Complete record of all receipts sent
   - Track email delivery status
   - Monitor GPT vs template usage

3. **Compliance**
   - Proof of receipt delivery
   - Tax record keeping
   - Legal documentation

4. **Analytics**
   - Track receipt generation methods
   - Monitor email delivery rates
   - Analyze receipt content

5. **Resend Capability**
   - Retrieve original receipt content
   - Resend if needed
   - Maintain receipt history

## Integration Points

### 1. Mission Support Form Submission
- Receipt saved when `submitMissionSupportForm()` completes
- Linked to submission via `submissionId`

### 2. Micro Payments
- Receipt saved when micro payment is processed
- Linked to payment via transaction ID

### 3. Crypto Payments
- Receipt saved when crypto payment is confirmed
- Linked to invoice via `invoiceId`

### 4. Payment Webhooks
- Receipt can be updated when payment status changes
- Update `paymentStatus` field
- Update `emailSent` if receipt needs to be resent

## Data Retention

### Recommended Retention Policy

- **Active Receipts:** Keep indefinitely (for tax/legal purposes)
- **Failed Sends:** Keep for 90 days (for retry attempts)
- **Draft Receipts:** Clean up after 30 days if never sent

### Cleanup Query Example

```javascript
// Find receipts that failed to send and are older than 90 days
const oldFailedReceipts = await wixData.query('Receipts')
    .eq('emailSent', false)
    .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    .find();
```

## Security Considerations

1. **Email Content**
   - Contains sensitive donor information
   - Should be encrypted at rest
   - Access should be restricted

2. **Access Control**
   - Only authorized staff should access
   - Implement role-based access
   - Log all access attempts

3. **Data Privacy**
   - Comply with GDPR
   - Allow data deletion requests
   - Anonymize after retention period

## Backup Strategy

1. **Regular Backups**
   - Daily backups of Receipts collection
   - Store backups separately
   - Test restore procedures

2. **Export Capability**
   - Export receipts for external storage
   - CSV/JSON export for accounting
   - PDF generation for records

## Status

✅ **Receipts Collection Hook Implemented**

- Automatic saving on email send
- Complete receipt data stored
- Linked to submissions
- Error handling in place
- Ready for use

## Next Steps

1. **Create Collection in Wix:**
   - Go to: Database → Collections
   - Create new collection: `Receipts`
   - Add all fields from schema above

2. **Set Up Indexes:**
   - Create indexes for common queries
   - Optimize for performance

3. **Test Hook:**
   - Send test receipt
   - Verify database record
   - Check all fields populated

4. **Monitor:**
   - Check receipt creation
   - Monitor error rates
   - Verify email delivery

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Implementation
