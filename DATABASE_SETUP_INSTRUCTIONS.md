# Database Setup Instructions for Wix

## Required Collections

You need to create **7 collections** in Wix Database:

### 1. Donations
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `amount` (number)
- `currency` (text)
- `is_other_amount` (boolean)
- `source` (text)
- `payment_status` (text)
- `payment_method` (text)
- `transaction_id` (text)
- `member_email` (text)
- `member_name` (text)
- `created_at` (dateTime)
- `updated_at` (dateTime)
- `metadata` (object)

### 2. CryptoPayments
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `invoice_id` (text)
- `order_id` (text)
- `price_amount` (number)
- `price_currency` (text)
- `pay_amount` (number)
- `pay_currency` (text)
- `pay_address` (text)
- `payment_url` (text)
- `status` (text)
- `email` (text)
- `first_name` (text)
- `last_name` (text)
- `mission_support_name` (text)
- `session_id` (text)
- `created_at` (dateTime)
- `updated_at` (dateTime)
- `metadata` (object)

### 3. StripePayments
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `invoice_id` (text)
- `customer_id` (text)
- `amount` (number)
- `currency` (text)
- `status` (text)
- `payment_method` (text)
- `email` (text)
- `name` (text)
- `created_at` (dateTime)
- `updated_at` (dateTime)
- `metadata` (object)

### 4. ContributionIntent
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `amount_entered` (number)
- `status` (text)
- `source` (text)
- `first_name` (text)
- `last_name` (text)
- `email` (text)
- `address` (text)
- `mission_support_name` (text)
- `session_id` (text)
- `anonymous_fingerprint` (text)
- `timestamp` (dateTime)
- `metadata` (object)

### 5. Members
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `email` (text)
- `first_name` (text)
- `last_name` (text)
- `membership_tier` (text)
- `membership_years` (number)
- `total_contributed` (number)
- `status` (text)
- `created_at` (dateTime)
- `updated_at` (dateTime)
- `metadata` (object)

### 6. PaymentRoutes
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `route_key` (text)
- `payment_method` (text)
- `enabled` (boolean)
- `min_amount` (number)
- `max_amount` (number)
- `config` (object)
- `created_at` (dateTime)
- `updated_at` (dateTime)

### 7. PageContent
- `_id` (text, primary key)
- `_createdDate` (dateTime)
- `_updatedDate` (dateTime)
- `_owner` (text)
- `page_url` (text)
- `page_title` (text)
- `content` (text)
- `content_type` (text)
- `indexed_at` (dateTime)
- `metadata` (object)

## How to Create Collections

### Option 1: Wix Editor (Recommended)
1. Go to your Wix site editor
2. Click **Database** in the left sidebar
3. Click **Collections**
4. Click **+ Add Collection**
5. Name the collection exactly as shown above
6. Add each field with the correct type
7. Set permissions:
   - **Read:** Anyone
   - **Write:** Only site members (or adjust as needed)
8. Repeat for all 7 collections

### Option 2: Wix CLI
```bash
# Create collections programmatically
wix data collections create --name "Donations" --fields "amount:number,currency:text,..."
```

## Permissions

For most collections, use:
- **Read:** Anyone
- **Write:** Only site members (or specific roles)

For sensitive data (Members, PaymentRoutes), consider:
- **Read:** Only site members
- **Write:** Only site members

## Verification

After creating collections, verify they exist:
1. Go to Database → Collections
2. Confirm all 7 collections are listed
3. Check that each has the required fields

## Next Steps

Once collections are created:
1. Backend functions will automatically use them
2. Test by submitting the Mission Support form
3. Check that data appears in the collections
