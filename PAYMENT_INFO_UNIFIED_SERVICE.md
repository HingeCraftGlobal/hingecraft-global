# Payment Info Unified Service - Implementation Guide

## Overview

The Payment Info Service provides a **unified way to access and format payment information** across all portions of the HingeCraft payment system, ensuring consistent payment data in emails, receipts, notifications, and database records.

## Problem Solved

Previously, payment information was scattered across multiple collections and formatted inconsistently. This service:

1. **Unifies Access** - Single function to get payment info from any source
2. **Standardizes Format** - Consistent payment data structure everywhere
3. **Enriches Data** - Automatically pulls related data from all collections
4. **Email Integration** - Works seamlessly with Gmail service and email templates

## Service Location

**File:** `src/backend/payment-info-service.jsw`

**HTTP Endpoint:** `/_functions/payment-info-service/[function-name]`

## Core Functions

### 1. `getPaymentInfo(paymentId, source)`

Get complete payment information from any source, automatically enriching with related data.

**Parameters:**
- `paymentId` - Payment ID (submission ID, donation ID, invoice ID, receipt number, etc.)
- `source` - Source type: `'contribution'`, `'donation'`, `'crypto'`, `'receipt'`, or `'auto'` (default)

**Returns:**
```javascript
{
  success: true,
  paymentInfo: {
    // Base payment data
    _id: "...",
    amount: 50.00,
    currency: "USD",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    // ... all payment fields
    
    // Enriched data
    contributionData: {...},  // From ContributionIntent
    donationData: {...},      // From Donations
    cryptoPaymentData: {...}, // From CryptoPayments
    receiptData: {...}        // From Receipts
  },
  source: "contribution"
}
```

**Usage:**
```javascript
// Auto-detect source
const result = await getPaymentInfo('ms_123abc...');

// Specify source
const result = await getPaymentInfo('np_invoice123', 'crypto');
```

### 2. `formatPaymentInfoForEmail(paymentData)`

Format payment information for email templates with standardized structure.

**Returns:**
```javascript
{
  receiptNumber: "ms_123abc...",
  paymentDate: "December 12, 2025, 06:00 PM",
  amount: "$50.00",
  currency: "USD",
  donorName: "John Doe",
  donorEmail: "john@example.com",
  donorAddress: "123 Main St",
  paymentMethod: "Credit/Debit Card",
  paymentStatus: "Completed",
  transactionId: "cs_test_123...",
  invoiceId: "np_123...",
  source: "mission_support_form",
  missionSupportName: "Education Initiative",
  provider: "Stripe",
  providerUrl: "https://...",
  metadata: {...}
}
```

**Usage:**
```javascript
const formatted = await formatPaymentInfoForEmail(paymentData);
// Use in email templates
```

### 3. `getPaymentSummary(paymentData)`

Get concise payment summary for quick reference.

**Returns:**
```javascript
{
  amount: "$50.00",
  donorName: "John Doe",
  paymentMethod: "Credit/Debit Card",
  paymentDate: "December 12, 2025, 06:00 PM",
  receiptNumber: "ms_123abc...",
  status: "Completed"
}
```

## Integration Points

### 1. Mission Support Middleware

**File:** `src/backend/mission-support-middleware.jsw`

**Integration:**
```javascript
import { formatPaymentInfoForEmail } from 'backend/payment-info-service';

// In sendPaymentReceiptEmail function
const formattedPayment = await formatPaymentInfoForEmail(paymentData);
// Use formattedPayment in email generation
```

### 2. Gmail Service

**File:** `ML Automation system/src/services/gmail.js`

**Integration:**
```javascript
// New method: sendPaymentReceipt()
await gmailService.sendPaymentReceipt({
  paymentId: 'ms_123abc...',
  to: 'donor@example.com'
});

// Uses formatPaymentInfoForEmail() internally
// Generates complete receipt email
```

### 3. Email Templates

All email templates can now use the unified payment format:

```javascript
// Get payment info
const paymentInfo = await getPaymentInfo(paymentId);

// Format for email
const formatted = await formatPaymentInfoForEmail(paymentInfo.paymentInfo);

// Use in template
const emailHtml = `
  <h1>Receipt #${formatted.receiptNumber}</h1>
  <p>Amount: ${formatted.amount}</p>
  <p>Donor: ${formatted.donorName}</p>
  ...
`;
```

### 4. Database Collections

The service automatically queries and enriches data from:
- **ContributionIntent** - Primary submission data
- **Donations** - Payment tracking
- **CryptoPayments** - Crypto payment data
- **Receipts** - Receipt records

## Payment Data Sources

### Source Detection

The service automatically detects payment source from ID format:
- `ms_...` → ContributionIntent
- `donation_...` → Donations
- `crypto_...` → CryptoPayments
- `receipt_...` → Receipts
- `np_...` → CryptoPayments (NOWPayments invoice)

### Cross-Collection Enrichment

When getting payment info, the service:
1. Gets base data from specified source
2. Extracts submission ID from metadata
3. Queries all related collections
4. Merges data into enriched object

## Email Integration

### Gmail Service Updates

**New Methods:**
1. `sendPaymentReceipt({ paymentId, paymentData, to, from, replyTo })`
   - Sends complete payment receipt email
   - Uses unified payment info format
   - Generates HTML and text versions

2. `formatPaymentInfoForEmail(paymentData)`
   - Formats payment data for email
   - Falls back to local formatting if service unavailable

3. `generateReceiptEmail(paymentInfo)`
   - Generates complete receipt email HTML/text
   - Includes all payment information
   - Professional formatting

### Email Template Structure

All payment emails now include:
- **Receipt Header** - Receipt number, date
- **Payment Details** - Amount, method, status, transaction ID
- **Donor Information** - Name, email, address
- **Mission Support** - Mission name (if applicable)
- **Tax Notice** - Tax-deductibility information

## Usage Examples

### Example 1: Get Payment Info

```javascript
// Auto-detect source
const result = await getPaymentInfo('ms_123abc...');

if (result.success) {
  const payment = result.paymentInfo;
  console.log(`Payment: ${payment.amount} from ${payment.firstName} ${payment.lastName}`);
}
```

### Example 2: Format for Email

```javascript
const paymentData = {
  _id: 'ms_123abc...',
  amount: 50.00,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  paymentMethod: 'card',
  paymentStatus: 'completed'
};

const formatted = await formatPaymentInfoForEmail(paymentData);
// formatted.amount = "$50.00"
// formatted.donorName = "John Doe"
// formatted.paymentMethod = "Credit/Debit Card"
```

### Example 3: Send Receipt via Gmail

```javascript
// Using Gmail service
await gmailService.sendPaymentReceipt({
  paymentId: 'ms_123abc...',
  to: 'donor@example.com'
});

// Or with payment data
await gmailService.sendPaymentReceipt({
  paymentData: paymentData,
  to: 'donor@example.com'
});
```

### Example 4: Get Payment Summary

```javascript
const summary = await getPaymentSummary(paymentData);
// {
//   amount: "$50.00",
//   donorName: "John Doe",
//   paymentMethod: "Credit/Debit Card",
//   ...
// }
```

## Benefits

1. **Consistency** - Same payment format everywhere
2. **Completeness** - All related data automatically included
3. **Efficiency** - Single function to get all payment info
4. **Maintainability** - Centralized payment formatting logic
5. **Email Integration** - Seamless email receipt generation

## Status

✅ **Payment Info Service Complete**

- Unified payment info access
- Standardized formatting
- Email integration
- Cross-collection enrichment
- Gmail service integration

**Ready for deployment!**

---

**Last Updated:** $(date)
**Status:** ✅ Complete
