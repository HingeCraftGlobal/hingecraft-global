# Complete Fix and Deployment Guide

## ✅ Issues Fixed

### 1. Fixed: `TypeError: otherAmountButton.onClick is not a function`

**Problem**: The payment page was trying to access `otherAmountButton.onClick` which doesn't exist in Wix's payment form structure.

**Solution**: 
- Removed all references to `otherAmountButton.onClick`
- Created proper event listeners for Wix payment forms
- Added multiple fallback methods for form detection
- Uses Wix Velo backend API instead of direct API calls

**File**: `payment-page-integration-FIXED.js`

---

## 🔄 Payment ↔ Charter Page Sync

### How It Works

1. **Payment Page** (`payment-page-integration-FIXED.js`):
   - Captures "Other" amount from payment form
   - Stores in: Wix Storage, sessionStorage, Database (via Velo)
   - Redirects to charter page with `?donationAmount=XX.XX`

2. **Charter Page** (`CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html`):
   - Retrieves amount from: URL → Wix Storage → sessionStorage → Database API
   - Displays donation amount below "Contribution"
   - Shows: `Donation Amount: $XX.XX` in green

### Sync Flow

```
Payment Page
  ↓ User enters "Other" amount
  ↓ Form submission
  ↓ Store in Wix Storage
  ↓ Store in sessionStorage  
  ↓ Save to Database (via Velo backend)
  ↓ Redirect to Charter Page with ?donationAmount=XX.XX
Charter Page
  ↓ Check URL parameter
  ↓ Check Wix Storage
  ↓ Check sessionStorage
  ↓ Check Database API (via /_functions/getLatestDonation)
  ↓ Display donation amount
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend API in Wix

1. **Open Wix Editor** → **Dev Mode** (or **Velo**)

2. **Create Backend Function**:
   - Navigate to: `Backend` → `Functions` → `New Function`
   - Name: `hingecraft-api` (or `getLatestDonation` and `saveDonation` separately)
   - File: `backend/hingecraft-api.jsw`

3. **Copy Backend Code**:
   - Open: `HingeCraft/velo-backend-api.js`
   - Copy entire file content
   - Paste into Wix backend function
   - **Save** and **Publish**

4. **Set Up Wix Secrets**:
   - Go to: **Settings** → **Secrets Manager**
   - Add Secret: `EXTERNAL_DB_ENDPOINT`
     - Value: Your database adaptor URL
     - Example: `https://your-ngrok-url.ngrok-free.dev` or production URL
   - Add Secret: `EXTERNAL_DB_SECRET_KEY`
     - Value: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

### Step 2: Deploy Payment Page Code

1. **Open Payment Page** in Wix Editor

2. **Add Custom Code**:
   - Click on page → **Settings** → **Custom Code**
   - Or: **Add** → **Embed Code** → **Custom Code**

3. **Add JavaScript Code**:
   - Select: **Add Code to Page** → **JavaScript**
   - Open: `HingeCraft/payment-page-integration-FIXED.js`
   - Copy **ALL** content
   - Paste into JavaScript code section
   - **Update** `CHARTER_PAGE_URL` to your actual charter page URL
   - **Save**

---

### Step 3: Deploy Charter Page Code

1. **Open Charter Page** in Wix Editor

2. **Add Custom Code**:
   - Click on page → **Settings** → **Custom Code**
   - Or: **Add** → **Embed Code** → **Custom Code**

3. **Add HTML Code**:
   - Select: **Add Code to Page** → **HTML**
   - Open: `HingeCraft/CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html`
   - Copy **ALL** content
   - Paste into HTML code section
   - **Save**

---

## 🧪 Testing Checklist

### Test Payment Page

- [ ] Payment page loads without errors
- [ ] "Other" amount input field is detected
- [ ] Form submission captures amount correctly
- [ ] Amount is stored in Wix Storage
- [ ] Amount is stored in sessionStorage
- [ ] Amount is saved to database via Velo backend
- [ ] No `otherAmountButton.onClick` errors in console

### Test Charter Page

- [ ] Charter page loads without errors
- [ ] Donation amount displays when coming from payment page
- [ ] Donation amount displays from URL parameter
- [ ] Donation amount displays from Wix Storage
- [ ] Donation amount displays from sessionStorage
- [ ] Donation amount displays from database API
- [ ] "Donation Amount: $XX.XX" shows in green below "Contribution"

### Test Sync

- [ ] Enter amount on payment page → redirects to charter page
- [ ] Amount appears on charter page immediately
- [ ] Amount persists across page refreshes (from database)
- [ ] Multiple donations work correctly (shows latest)

---

## 📊 Database Details for Wix CMS

### External Database Connection

**Connection Name**: `HingeCraftDonationsDB`

**Endpoint URL**: 
- Local (ngrok): `https://your-ngrok-url.ngrok-free.dev`
- Production: `https://your-production-api-url.com`

**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

**Connection Type**: Custom (External Database)

### Database Schema

**Collection Name**: `donations`

**Required Fields** (for Wix read-write access):
- `_id` (Text) - Primary key
- `_createdDate` (Date & Time) - Auto-set on create
- `_updatedDate` (Date & Time) - Auto-updated on change
- `_owner` (Text) - Default: 'system'

**Custom Fields**:
- `id` (Text) - Unique identifier
- `amount` (Number) - Donation amount
- `currency` (Text) - Default: 'USD'
- `is_other_amount` (Boolean) - True if custom amount
- `source` (Text) - Source identifier (e.g., 'payment_page')
- `payment_status` (Text) - Payment status
- `payment_method` (Text) - Payment method
- `transaction_id` (Text) - Transaction ID
- `member_email` (Text) - Member email
- `member_name` (Text) - Member name
- `created_at` (Date & Time) - Creation timestamp
- `updated_at` (Date & Time) - Update timestamp
- `metadata` (JSON) - Additional metadata

### Wix CMS Setup

1. **Go to**: Wix Editor → **Database** → **External Database**

2. **Click**: "Connect External Database"

3. **Select**: "Custom"

4. **Enter**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: Your database adaptor URL
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

5. **Click**: "Connect"

6. **Wait**: Wix will fetch schema from `/v1/collections/donations/schema`

7. **Verify**: All fields are detected correctly

8. **Enable**: Read-Write access (should be automatic if `_id`, `_createdDate`, `_updatedDate`, `_owner` are present)

---

## 🔧 Troubleshooting

### Error: `otherAmountButton.onClick is not a function`

**Solution**: Use `payment-page-integration-FIXED.js` instead of the old version.

### Error: Donation amount not showing on charter page

**Check**:
1. Backend function `getLatestDonation` is deployed
2. Wix Secrets are configured correctly
3. Database adaptor is running and accessible
4. Browser console for errors

### Error: Payment page not capturing amount

**Check**:
1. Payment form selectors match your Wix payment form structure
2. Update selectors in `getDonationAmount()` function if needed
3. Check browser console for detection logs

### Error: Database connection fails

**Check**:
1. `EXTERNAL_DB_ENDPOINT` in Wix Secrets is correct
2. `EXTERNAL_DB_SECRET_KEY` matches database adaptor
3. Database adaptor is running
4. CORS is enabled in database adaptor

---

## 📦 Files to Deploy

1. **Backend**: `velo-backend-api.js` → Wix Velo Backend
2. **Payment Page**: `payment-page-integration-FIXED.js` → Payment Page Custom Code
3. **Charter Page**: `CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html` → Charter Page Custom Code

---

## ✅ Final Verification

After deployment, verify:

- [ ] No errors in browser console
- [ ] Payment page captures "Other" amount
- [ ] Charter page displays donation amount
- [ ] Database connection works
- [ ] Wix CMS shows donations collection
- [ ] All sync methods work (URL, Storage, Database)

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: December 4, 2024  
**Version**: Fixed with Velo Backend Integration








