# 📊 Complete Database Schema
## All Collections with Full Field Definitions

**Date:** December 10, 2025  
**Status:** ✅ **COMPLETE SCHEMA**

---

## 📋 DATABASE COLLECTIONS

### **1. Donations Collection**

**Purpose:** Store all fiat (Stripe) payment records

**Fields:**
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `_id` | Text | ✅ | Auto-generated unique ID |
| `amount` | Number | ✅ | Donation amount in USD |
| `currency` | Text | ✅ | Currency code (default: "usd") |
| `payment_status` | Text | ✅ | Status: "pending", "completed", "failed", "refunded" |
| `payment_method` | Text | ✅ | Payment method: "stripe", "card", "ach" |
| `transaction_id` | Text | ❌ | Stripe transaction/session ID |
| `email` | Email | ❌ | Donor email address |
| `name` | Text | ❌ | Donor name (full name) |
| `first_name` | Text | ❌ | Donor first name |
| `last_name` | Text | ❌ | Donor last name |
| `address` | Text | ❌ | Donor address |
| `isOtherAmount` | Boolean | ❌ | Whether amount was custom |
| `source` | Text | ❌ | Source: "charter_page", "mission_support_form" |
| `createdAt` | Date & Time | ✅ | Auto-generated timestamp |
| `updatedAt` | Date & Time | ✅ | Auto-updated timestamp |
| `metadata` | Text (JSON) | ❌ | Additional metadata (JSON string) |

**Indexes:**
- `payment_status` (for filtering completed payments)
- `createdAt` (for sorting)
- `transaction_id` (for lookups)

---

### **2. CryptoPayments Collection**

**Purpose:** Store all cryptocurrency payment records from NOWPayments

**Fields:**
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `_id` | Text | ✅ | Auto-generated unique ID |
| `intent_id` | Text | ✅ | Contribution intent ID |
| `order_id` | Text | ✅ | NOWPayments order ID (same as intent_id) |
| `invoice_id` | Text | ✅ | NOWPayments invoice ID |
| `payment_url` | URL | ✅ | NOWPayments payment page URL |
| `pay_address` | Text | ✅ | Crypto wallet address to send to |
| `pay_amount_crypto` | Number | ✅ | Amount in cryptocurrency |
| `pay_currency` | Text | ✅ | Crypto currency: "SOL", "XLM", "BTC", "ETH" |
| `price_amount` | Number | ✅ | Original USD amount |
| `price_currency` | Text | ✅ | Price currency (default: "usd") |
| `status` | Text | ✅ | Status: "pending_invoice", "pending", "detected", "confirmed", "failed", "expired" |
| `nowpayments_status` | Text | ✅ | NOWPayments API status |
| `invoice_created_at` | Date & Time | ✅ | When invoice was created |
| `invoice_expires_at` | Date & Time | ❌ | When invoice expires |
| `payment_confirmed_at` | Date & Time | ❌ | When payment was confirmed |
| `raw_response` | Text (JSON) | ❌ | Full NOWPayments API response |
| `metadata` | Text (JSON) | ❌ | Additional metadata |
| `createdAt` | Date & Time | ✅ | Auto-generated timestamp |
| `updatedAt` | Date & Time | ✅ | Auto-updated timestamp |

**Indexes:**
- `status` (for filtering confirmed payments)
- `order_id` (for idempotency checks)
- `invoice_id` (for status lookups)
- `createdAt` (for sorting)

---

### **3. ContributionIntent Collection**

**Purpose:** Store form submissions and payment intents before payment completion

**Fields:**
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `_id` | Text | ✅ | Auto-generated unique ID |
| `amount_entered` | Number | ✅ | Amount user entered |
| `status` | Text | ✅ | Status: "intent", "pending", "completed", "abandoned" |
| `source` | Text | ✅ | Source: "missionSupportForm", "charter_page" |
| `first_name` | Text | ❌ | Donor first name |
| `last_name` | Text | ❌ | Donor last name |
| `email` | Email | ❌ | Donor email |
| `address` | Text | ❌ | Donor address |
| `mission_support_name` | Text | ❌ | Name for attribution/dedication |
| `session_id` | Text | ❌ | Session identifier |
| `anonymous_fingerprint` | Text | ❌ | Anonymous browser fingerprint |
| `timestamp` | Date & Time | ✅ | When intent was created |
| `metadata` | Text (JSON) | ❌ | Additional metadata |
| `createdAt` | Date & Time | ✅ | Auto-generated timestamp |
| `updatedAt` | Date & Time | ✅ | Auto-updated timestamp |

**Indexes:**
- `status` (for filtering)
- `timestamp` (for sorting)
- `session_id` (for session tracking)

---

## 🔗 RELATIONSHIPS

**Donations ↔ ContributionIntent:**
- `Donations.metadata.intentId` → `ContributionIntent._id`
- Link donations to original intents

**CryptoPayments ↔ ContributionIntent:**
- `CryptoPayments.intent_id` → `ContributionIntent._id`
- Link crypto payments to original intents

---

## 📊 CUMULATIVE TOTAL CALCULATION

**Formula:**
```javascript
total = (
  SUM(Donations.amount WHERE payment_status = 'completed' OR 'confirmed')
  +
  SUM(CryptoPayments.price_amount WHERE status = 'confirmed')
)
```

**Implementation:**
- Calculated in `charter-page-middleware.web.js` → `getCumulativeTotal()`
- Updates in real-time via database listeners
- Displayed on Charter page

---

## ✅ VERIFICATION

**All Collections:**
- ✅ Field types defined
- ✅ Required fields marked
- ✅ Indexes specified
- ✅ Relationships documented
- ✅ Calculation logic defined

---

**Last Updated:** December 10, 2025  
**Status:** ✅ **COMPLETE DATABASE SCHEMA**
