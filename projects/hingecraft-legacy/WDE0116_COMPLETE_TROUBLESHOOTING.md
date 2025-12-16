# WDE0116 Complete Troubleshooting Guide

Based on [Wix External Database Documentation](https://dev.wix.com/docs/develop-websites/articles/databases/external-databases/overview/integrating-external-databases-with-your-wix-site) and comprehensive error analysis.

## ✅ Current Status

**API Response:** ✅ All Wix required fields are being returned:
- `_id` ✅
- `_createdDate` ✅
- `_updatedDate` ✅
- `_owner` ✅

**Database:** ✅ All 4 Wix required columns exist

**Issue:** WDE0116 error persists in Wix

---

## 🔍 Root Cause Analysis

According to Wix documentation, WDE0116 is a **generic "unknown error"** that occurs when:
1. External database responds with an error Wix can't interpret
2. Schema mismatch between Wix expectations and database
3. Unsupported operations (like `wixData.aggregate()`)
4. Authentication/permission issues
5. Payload size limits

---

## ✅ Step-by-Step Fix (Based on Wix Documentation)

### Step 1: Verify API Returns Wix Format ✅

**Status:** ✅ COMPLETE
- API returns `_id`, `_createdDate`, `_updatedDate`, `_owner`
- All endpoints updated

### Step 2: Refresh Schema in Wix (CRITICAL!)

**This is the MOST IMPORTANT step according to Wix documentation:**

1. Go to **Wix Editor** → **Content Manager** → **Collections**
2. Find your external database collection (`HingeCraftDonationsDB`)
3. Click **"More Actions"** (three dots menu)
4. Select **"Refresh Schema"**
   - This tells Wix to re-detect the Wix required columns
   - **Without this, Wix won't see `_id`, `_createdDate`, `_updatedDate`, `_owner`**
   - **WDE0116 will persist if schema is not refreshed!**

### Step 3: Verify ngrok Configuration

**Check ngrok is running and accessible:**

```bash
# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Verify public URL is accessible
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     https://YOUR_NGROK_URL/health
```

**Common ngrok issues:**
- ERR_NGROK_3200: Endpoint not found - ensure local server is running
- ERR_NGROK_108: Account limit - upgrade ngrok plan
- 502 Bad Gateway: Wrong port or local server not running

### Step 4: Check for Unsupported Operations

**According to Wix documentation, these operations may not work with external databases:**

❌ **Don't use:**
- `wixData.aggregate()` - Not supported with external databases
- Complex filters on `_publishStatus` (only `.eq()` and `.ne()` work)
- Invalid query operations

✅ **Use instead:**
- Direct API calls via backend functions
- Simple `.find()` queries
- `.eq()`, `.ne()` filters only

### Step 5: Verify Authentication

**Check API authentication is working:**

```bash
# Test with authentication
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://YOUR_NGROK_URL/health
```

**Should return:** `{"status":"healthy","database":"connected"}`

### Step 6: Check Payload Size

**If sending large data, split into smaller requests:**

- Maximum collection item size: 512 KB (per Wix documentation)
- Consider pagination for large datasets
- Use `.limit()` in queries

### Step 7: Review Wix Code

**Ensure your Wix Velo code doesn't use unsupported operations:**

```javascript
// ❌ DON'T USE (not supported with external databases)
wixData.aggregate("HingeCraftDonationsDB")
  .group("amount")
  .run();

// ✅ USE INSTEAD (direct API call)
import { getAllDonations } from 'backend/hingecraft-api';
const donations = await getAllDonations();
// Process data in code
```

---

## 📋 Wix Configuration (Final)

**Connection Name:**
```
HingeCraftDonationsDB
```

**Endpoint URL:**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```
*(Update if ngrok URL changed)*

**Secret Key:**
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 🔧 Troubleshooting Checklist

### Database
- [x] `_id` column exists
- [x] `_createdDate` column exists
- [x] `_updatedDate` column exists
- [x] `_owner` column exists
- [x] API returns all Wix fields

### API
- [x] All endpoints return Wix format
- [x] All endpoints require authentication
- [x] Health endpoint working
- [ ] ngrok URL accessible from internet
- [ ] No payload size issues

### Wix Configuration
- [ ] External database connected
- [ ] **Schema refreshed in Wix (CRITICAL!)**
- [ ] Permissions configured
- [ ] No unsupported operations in code
- [ ] Test connection successful

---

## 🎯 Most Critical Steps

1. **Refresh Schema in Wix** - This is the #1 fix according to Wix documentation
2. **Verify ngrok is running** - Check tunnel is active
3. **Remove unsupported operations** - No `wixData.aggregate()` calls
4. **Check Wix code** - Ensure field names match exactly (case-sensitive)

---

## 📚 References

- **Wix External Database Docs:** https://dev.wix.com/docs/develop-websites/articles/databases/external-databases/overview/integrating-external-databases-with-your-wix-site
- **Wix Data Error Codes:** https://dev.wix.com/docs/velo/apis/wix-data/error-codes
- **Required Columns:** `_id`, `_createdDate`, `_updatedDate`, `_owner`

---

**Last Updated:** $(date)
**Status:** API fixed - Schema refresh in Wix required














