# Charter Page Implementation Guide - Latest Version with Backend Integration

## ✅ Latest Version Ready to Implement

**File**: `CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html`

This is the **latest version** with:
- ✅ Updated backend integration via `/_functions/getLatestDonation`
- ✅ Velo API reference URL: `https://www.wix.com/velo/reference/api-overview/introduction`
- ✅ Donation amount retrieval from multiple sources (URL → Wix Storage → sessionStorage → Database API)
- ✅ Database download/share functionality
- ✅ All latest features and fixes

---

## 🚀 How to Implement in Wix

### Step 1: Deploy Backend API

1. **Open Wix Editor** → Go to **Dev Mode** (or **Velo**)

2. **Create Backend Function**:
   - Navigate to: `Backend` → `Functions` → `New Function`
   - Name: `getLatestDonation`
   - File: `backend/getLatestDonation.jsw` (or `backend/hingecraft-api.jsw`)

3. **Copy Backend Code**:
   - Open: `HingeCraft/velo-backend-api.js`
   - Copy the entire file content
   - Paste into the Wix backend function file
   - **Save**

4. **Set Up Wix Secrets** (Recommended):
   - Go to: **Settings** → **Secrets Manager**
   - Add Secret: `EXTERNAL_DB_ENDPOINT`
     - Value: Your database adaptor URL (e.g., `https://your-ngrok-url.ngrok-free.dev` or production URL)
   - Add Secret: `EXTERNAL_DB_SECRET_KEY`
     - Value: Your secret key (e.g., `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`)

   **OR** use fallback values in the code (not recommended for production)

---

### Step 2: Deploy Frontend (Charter Page)

1. **Open Charter Page** in Wix Editor

2. **Add Custom Code**:
   - Click on the page → **Settings** → **Custom Code**
   - Or: **Add** → **Embed Code** → **Custom Code**

3. **Add HTML Code**:
   - Select: **Add Code to Page** → **HTML**
   - Open: `CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html`
   - Copy **ALL** content (Cmd+A, Cmd+C)
   - Paste into the HTML code section
   - **Save**

4. **Verify Integration**:
   - The page should now:
     - Display donation amounts from the database
     - Show "Donation Amount" below "Contribution" when available
     - Connect to backend via `/_functions/getLatestDonation`

---

## 🔗 Backend Integration Details

### How It Works

1. **Frontend calls**: `/_functions/getLatestDonation`
2. **Wix routes to**: `backend/getLatestDonation.jsw` (or your backend function)
3. **Backend function** (`velo-backend-api.js`):
   - Calls external database adaptor API
   - Uses `EXTERNAL_DB_ENDPOINT` and `EXTERNAL_DB_SECRET_KEY` from Wix Secrets
   - Returns latest donation data
4. **Frontend receives**: `{ id, amount, currency, is_other_amount, created_at }`
5. **Frontend displays**: Donation amount below "Contribution"

### API Endpoint Flow

```
Charter Page (Frontend)
  ↓ fetch('/_functions/getLatestDonation')
Wix Velo Backend (getLatestDonation function)
  ↓ fetch(`${EXTERNAL_DB_ENDPOINT}/donations/latest`)
External Database Adaptor (Docker/Production)
  ↓ SELECT * FROM donations ORDER BY created_at DESC LIMIT 1
PostgreSQL Database
  ↓ Returns donation data
Back to Frontend → Display donation amount
```

---

## 📋 Key Features in Latest Version

### 1. Donation Amount Retrieval (Lines 70-97)

Retrieves donation amount from **4 sources** (in order):
1. **URL Parameter**: `?donationAmount=50.00`
2. **Wix Storage**: `wixStorage.getItem('hingecraft_donation')`
3. **Session Storage**: `sessionStorage.getItem('hingecraft_donation')`
4. **Database API**: `/_functions/getLatestDonation` → External database

### 2. Backend API Integration

```javascript
// Line 90: Calls Wix Velo backend function
const response = await fetch('/_functions/getLatestDonation', { 
  method: 'GET', 
  headers: { 'Content-Type': 'application/json' } 
});
```

### 3. Contribution Display (Line 243)

```javascript
{donationAmount && donationAmount > 0 && (
  <div className="mt-2 text-lg font-semibold text-emerald-600">
    Donation Amount: {formatUSD(donationAmount)}
  </div>
)}
```

### 4. Database Export/Share (Lines 139-236)

- **Download DB**: Downloads entire database as JSON
- **Share DB**: Uses Web Share API or clipboard fallback

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Backend function `getLatestDonation` is deployed in Wix
- [ ] Wix Secrets are configured (`EXTERNAL_DB_ENDPOINT`, `EXTERNAL_DB_SECRET_KEY`)
- [ ] Charter page HTML code is added
- [ ] External database adaptor is running and accessible
- [ ] Donation amount displays correctly on charter page
- [ ] Database connection works (check browser console for errors)

---

## 🔧 Troubleshooting

### Issue: Donation amount not showing

**Check:**
1. Browser console for errors
2. Backend function is deployed correctly
3. Wix Secrets are set correctly
4. External database adaptor is running
5. Database has donation records

### Issue: `/_functions/getLatestDonation` returns 404

**Solution:**
- Ensure backend function is named exactly `getLatestDonation`
- Check function is published/deployed
- Verify function path in Wix Velo

### Issue: Database connection fails

**Solution:**
- Verify `EXTERNAL_DB_ENDPOINT` in Wix Secrets
- Check `EXTERNAL_DB_SECRET_KEY` matches database adaptor
- Ensure database adaptor is running and accessible
- Check CORS settings in database adaptor

---

## 📚 Related Files

- **Backend API**: `HingeCraft/velo-backend-api.js`
- **Database Adaptor**: `HingeCraft/database-adaptor/server.js`
- **Payment Page**: `HingeCraft/payment-page-integration.js`
- **Original Version**: `HingeCraft/CHARTER_PAGE_FROM_ORIGINAL_PROMPT.html`

---

## 🎯 Next Steps

1. ✅ Deploy backend function in Wix
2. ✅ Configure Wix Secrets
3. ✅ Add charter page HTML code
4. ✅ Test donation amount display
5. ✅ Verify database connection
6. ✅ Push updates to Git repository

---

**Status**: ✅ Ready to Implement  
**Last Updated**: December 4, 2024  
**Version**: Latest with Backend Integration








