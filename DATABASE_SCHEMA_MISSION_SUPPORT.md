# Mission Support - Database Schema

## Collections Required

### 1. ContributionIntent

**Purpose:** Primary storage for all Mission Support form submissions

**Schema:**
```javascript
{
  _id: string,                    // Unique submission ID (e.g., "ms_123abc...")
  firstName: string,              // Required: Donor first name
  lastName: string,               // Required: Donor last name
  email: string,                  // Required: Donor email (lowercase)
  address: string,                // Required: Donor address
  missionSupportName: string,     // Optional: Mission support name
  amount: number,                 // Required: Donation amount (1.00 - 25000.00)
  currency: string,               // Default: "USD"
  paymentMethod: string,          // "card" or "crypto"
  paymentStatus: string,          // "pending", "completed", "failed"
  source: string,                 // "mission_support_form", "mission_support_micro", "mission_support_other"
  created_at: Date,               // Submission timestamp
  updated_at: Date,               // Last update timestamp
  expires_at: Date,               // For prefill tokens (10 minutes from creation)
  used: boolean,                  // For prefill tokens (false initially)
  used_at: Date,                  // When prefill token was used
  user_info: object,              // Optional: Additional user information
  metadata: {
    sessionId: string,            // Session ID
    anonymousFingerprint: string, // Anonymous fingerprint
    referrerSource: string,       // Referrer source
    pageUrl: string,              // Page URL
    userAgent: string,            // User agent
    submissionId: string,         // Submission ID reference
    missionSupportName: string    // Mission support name
  }
}
```

**Indexes:**
- `_id` (primary key)
- `email` (for lookups)
- `created_at` (for sorting)
- `expires_at` (for cleanup)

**Use Cases:**
- Store complete form submissions
- Store prefill tokens for Charter page redirects
- Track user flow and data collection
- Reference for email receipts

### 2. Donations

**Purpose:** Payment tracking and reconciliation

**Schema:**
```javascript
{
  _id: string,                    // Auto-generated or custom ID
  firstName: string,              // Donor first name
  lastName: string,              // Donor last name
  email: string,                  // Donor email
  address: string,                // Donor address
  amount: number,                 // Donation amount
  currency: string,               // "USD"
  payment_method: string,         // "stripe", "crypto", etc.
  payment_status: string,         // "pending", "completed", "failed"
  source: string,                 // "mission_support_micro", "mission_support_form", etc.
  gateway: string,               // "stripe", "nowpayments", etc.
  provider: string,               // Payment provider name
  provider_id: string,           // Session ID, invoice ID, etc.
  provider_url: string,          // Payment URL
  created_at: Date,              // Creation timestamp
  completed_at: Date,            // Completion timestamp (if completed)
  failed_at: Date,               // Failure timestamp (if failed)
  metadata: {
    submissionId: string,        // Reference to ContributionIntent
    missionSupportName: string,  // Mission support name
    preset_amount: number,       // For micro payments
    user_info: object,           // User information
    stripe_session_id: string,   // Stripe session ID
    transaction_id: string       // Transaction ID
  }
}
```

**Indexes:**
- `_id` (primary key)
- `email` (for lookups)
- `payment_status` (for filtering)
- `created_at` (for sorting)
- `provider_id` (for payment reconciliation)

**Use Cases:**
- Track all payment attempts
- Reconcile with payment providers
- Calculate cumulative totals
- Generate payment reports

### 3. CryptoPayments

**Purpose:** Cryptocurrency payment tracking

**Schema:**
```javascript
{
  _id: string,                    // Auto-generated ID
  invoice_id: string,            // NOWPayments invoice ID
  order_id: string,              // Order ID
  price_amount: number,          // USD amount
  price_currency: string,       // "USD"
  pay_currency: string,          // Crypto currency (USDT, BTC, SOL, etc.)
  pay_amount: number,            // Crypto amount
  payment_address: string,       // Crypto wallet address
  payment_url: string,           // Payment page URL
  status: string,                // "waiting", "confirmed", "failed"
  email: string,                 // Donor email
  firstName: string,             // Donor first name
  lastName: string,              // Donor last name
  created_at: Date,             // Creation timestamp
  confirmed_at: Date,           // Confirmation timestamp
  metadata: {
    submissionId: string,       // Reference to ContributionIntent
    missionSupportName: string,  // Mission support name
    transaction_hash: string,   // Blockchain transaction hash
    confirmations: number       // Number of confirmations
  }
}
```

**Indexes:**
- `_id` (primary key)
- `invoice_id` (for lookups)
- `status` (for filtering)
- `created_at` (for sorting)

**Use Cases:**
- Track crypto payments
- Monitor payment status
- Reconcile with NOWPayments
- Generate crypto payment reports

## Data Flow

### 1. Form Submission Flow

```
User submits form
  ↓
submitMissionSupportForm() called
  ↓
Validate all fields
  ↓
Save to ContributionIntent (primary record)
  ↓
Save to Donations (payment tracking)
  ↓
Process payment (micro/other/crypto)
  ↓
Send email receipt (GPT or template)
  ↓
Return success with submissionId
```

### 2. Micro Payment Flow

```
User selects $1/$2/$5
  ↓
microPayment() called
  ↓
Create Stripe checkout session
  ↓
Save to Donations (pending)
  ↓
Return Stripe checkout URL
  ↓
User completes payment
  ↓
Stripe webhook updates Donations (completed)
  ↓
Send email receipt
```

### 3. Other Amount Flow

```
User enters custom amount
  ↓
otherAmount() called
  ↓
Generate prefill token
  ↓
Save to ContributionIntent (with expires_at)
  ↓
Return redirect URL to Charter page
  ↓
Charter page calls getPrefill()
  ↓
Retrieve prefill data
  ↓
Mark prefill as used
```

### 4. Crypto Payment Flow

```
User selects crypto payment
  ↓
processCryptoPayment() called
  ↓
Create NOWPayments invoice
  ↓
Save to CryptoPayments (waiting)
  ↓
Save to ContributionIntent
  ↓
Return payment URL
  ↓
User completes payment
  ↓
NOWPayments webhook updates CryptoPayments (confirmed)
  ↓
Send email receipt
```

## Data Collection Fields

### Required Fields
- `firstName` - First name
- `lastName` - Last name
- `email` - Email address
- `address` - Address
- `amount` - Donation amount

### Optional Fields
- `missionSupportName` - Mission support name
- `sessionId` - Session tracking
- `anonymousFingerprint` - Anonymous tracking
- `referrerSource` - Traffic source
- `pageUrl` - Page URL
- `userAgent` - User agent

## User Flow Tracking

All submissions include metadata for tracking:
- **Session ID:** Unique session identifier
- **Anonymous Fingerprint:** Browser fingerprint
- **Referrer Source:** Where user came from
- **Page URL:** Current page URL
- **User Agent:** Browser information

This data enables:
- User journey analysis
- Conversion tracking
- A/B testing
- Analytics reporting

## Email Receipt Data

Email receipts include:
- Receipt number (submission ID)
- Payment date
- Amount (formatted)
- Payment method
- Transaction ID
- Donor information
- Mission support name (if provided)
- Tax-deductibility notice
- Impact statement
- Contact information

## Cleanup Tasks

### Prefill Token Cleanup
- Tokens expire after 10 minutes
- Marked as used when retrieved
- Can be cleaned up after 24 hours

### Pending Payment Cleanup
- Payments pending > 7 days can be marked as failed
- Can be cleaned up after 30 days

## Migration Notes

If upgrading from old system:
1. Migrate existing records to new schema
2. Update field names if needed
3. Add missing metadata fields
4. Verify indexes are created
5. Test data retrieval

## Status

✅ **Schema Complete**
- All collections defined
- All fields documented
- Indexes specified
- Use cases documented

**Ready for database setup!**
