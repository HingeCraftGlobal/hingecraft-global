# 🚀 Wix Collections Quick Setup Guide

## Quick Reference for Creating Collections

### Step-by-Step Instructions

1. **Open Wix Editor**
   - Go to your Wix site editor
   - Navigate to **Database** → **Collections**

2. **Create Each Collection**
   - Click **+ New Collection**
   - Name the collection (exact names below)
   - Add all fields listed
   - Save collection

3. **Add Indexes**
   - Go to collection settings → **Indexes**
   - Add indexes for fields marked with ⭐

4. **Set Permissions**
   - Go to collection settings → **Permissions**
   - **Read:** Anyone
   - **Write:** Site Owner Only

---

## 📊 Collection 1: ContributionIntent

**Fields:**
- `_id` (Text) - Auto-generated
- `donationAmount` (Number) ⭐
- `paymentMethod` (Text)
- `intentStatus` (Text) ⭐
- `source` (Text)
- `session_id` (Text) ⭐
- `timestamp` (Date & Time)
- `name` (Text) - Optional
- `email` (Text) ⭐ - Optional
- `first_name` (Text) - Optional
- `last_name` (Text) - Optional
- `address` (Text) - Optional
- `mission_support_name` (Text) - Optional
- `isSubscription` (Boolean)
- `wix_user_id` (Text) - Optional
- `metadata` (JSON) - Optional

**Indexes:** `intentStatus`, `session_id`, `email`

---

## 📊 Collection 2: Donations

**Fields:**
- `_id` (Text) - Auto-generated
- `intentId` (Text) ⭐
- `paymentType` (Text)
- `amount` (Number)
- `currency` (Text)
- `datePaid` (Date & Time)
- `isSubscription` (Boolean)
- `transaction_id` (Text) ⭐
- `payment_status` (Text) ⭐
- `payment_method` (Text)
- `source` (Text)
- `member_email` (Text) ⭐
- `member_name` (Text)
- `wix_user_id` (Text) - Optional
- `metadata` (JSON) - Optional

**Indexes:** `payment_status`, `intentId`, `transaction_id`, `member_email`

---

## 📊 Collection 3: CryptoPayments

**Fields:**
- `_id` (Text) - Auto-generated
- `intent_id` (Text) ⭐
- `order_id` (Text) ⭐⭐ (CRITICAL - used in webhooks)
- `invoice_id` (Text) ⭐
- `payment_url` (Text)
- `pay_address` (Text)
- `pay_amount_crypto` (Number)
- `pay_currency` (Text)
- `price_amount` (Number)
- `price_currency` (Text)
- `status` (Text) ⭐
- `nowpayments_status` (Text)
- `invoice_created_at` (Date & Time)
- `invoice_expires_at` (Date & Time)
- `payment_detected_at` (Date & Time)
- `payment_confirmed_at` (Date & Time)
- `confirmations` (Number)
- `tx_hash` (Text) - Optional
- `email` (Text) - Optional
- `first_name` (Text) - Optional
- `last_name` (Text) - Optional
- `mission_support_name` (Text) - Optional
- `session_id` (Text)
- `created_at` (Date & Time)
- `updated_at` (Date & Time)
- `raw_response` (JSON) - Optional
- `raw_webhook` (JSON) - Optional
- `metadata` (JSON) - Optional

**Indexes:** `order_id` (CRITICAL), `status`, `intent_id`, `invoice_id`

---

## 📊 Collection 4: StripePayments

**Fields:**
- `_id` (Text) - Auto-generated
- `invoice_id` (Text) ⭐
- `session_id` (Text) ⭐
- `amount` (Number)
- `currency` (Text)
- `status` (Text) ⭐
- `payment_method` (Text)
- `donation_id` (Text) - Optional
- `email` (Text) - Optional
- `name` (Text) - Optional
- `customer_id` (Text) - Optional
- `created_at` (Date & Time)
- `updated_at` (Date & Time)
- `completed_at` (Date & Time) - Optional
- `failed_at` (Date & Time) - Optional
- `metadata` (JSON) - Optional

**Indexes:** `session_id`, `invoice_id`, `status`

---

## 📊 Collection 5: WebhookLogs

**Fields:**
- `_id` (Text) - Auto-generated
- `event_id` (Text)
- `event_type` (Text) ⭐
- `source` (Text) ⭐
- `signature_valid` (Boolean)
- `signature_header` (Text)
- `payload_json` (JSON)
- `processing_status` (Text) ⭐
- `processing_error` (Text) - Optional
- `processed_at` (Date & Time) - Optional
- `created_at` (Date & Time)

**Indexes:** `source`, `processing_status`, `event_type`

---

## 📊 Collection 6: Members (Optional)

**Fields:**
- `_id` (Text) - Auto-generated
- `email` (Text) ⭐ (Unique recommended)
- `first_name` (Text)
- `last_name` (Text)
- `total_contributed` (Number)
- `status` (Text)
- `wix_user_id` (Text) ⭐ - Optional
- `created_at` (Date & Time)
- `updated_at` (Date & Time)
- `metadata` (JSON) - Optional

**Indexes:** `email` (unique), `wix_user_id`

---

## ✅ Verification

After creating all collections, test with this backend function:

```javascript
// In Wix Velo backend (create a test file)
import wixData from 'wix-data';

export async function verifyCollections() {
    const collections = [
        'ContributionIntent',
        'Donations',
        'CryptoPayments',
        'StripePayments',
        'WebhookLogs',
        'Members'
    ];
    
    const results = {};
    
    for (const collection of collections) {
        try {
            await wixData.query(collection).limit(1).find();
            results[collection] = '✅ Exists';
        } catch (error) {
            results[collection] = `❌ Error: ${error.message}`;
        }
    }
    
    return results;
}
```

Call this function from the frontend or Wix Dev Tools to verify all collections exist.

---

## 🎯 Priority Order

If you need to create collections incrementally:

1. **First Priority:**
   - `ContributionIntent` (needed for payment intents)
   - `Donations` (needed for completed payments)

2. **Second Priority:**
   - `StripePayments` (needed for Stripe flow)
   - `CryptoPayments` (needed for crypto flow)

3. **Third Priority:**
   - `WebhookLogs` (helpful for debugging)
   - `Members` (optional, for member tracking)

---

**Status:** Ready to Create  
**Estimated Time:** 15-20 minutes for all 6 collections



