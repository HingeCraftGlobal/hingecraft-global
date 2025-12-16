# WDE0116 Complete Troubleshooting - Final Solution

## 🔍 Current Status

**Error**: WDE0116 - External Database Connection Error  
**Status**: All backend fixes applied, troubleshooting Wix configuration

---

## ✅ Backend Fixes Applied

### 1. Database Schema ✅
- ✅ All 4 Wix required columns present: `_id`, `_createdDate`, `_updatedDate`, `_owner`
- ✅ Triggers configured for auto-updates
- ✅ Indexes created for performance

### 2. API Endpoints ✅
- ✅ GET `/donations` returns Wix SPI format (`items`, `totalCount`, `hasNext`, `hasPrev`)
- ✅ GET `/v1/collections/donations/items` - Wix SPI collection endpoint added
- ✅ GET `/v1/collections/donations/schema` - Schema endpoint added
- ✅ All endpoints return Wix required fields
- ✅ Authentication required on all endpoints

### 3. Response Format ✅
All endpoints return:
```json
{
  "_id": "uuid",
  "_createdDate": "2025-12-01T...",
  "_updatedDate": "2025-12-01T...",
  "_owner": "system",
  "id": "uuid",
  "amount": 50.00,
  ...
}
```

---

## 🔧 Wix Configuration Steps (CRITICAL)

### Step 1: Verify Connection Settings

**Go to**: Wix Editor → Database → External Database

**Connection Name**: `HingeCraftDonationsDB`

**Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`
- ⚠️ Must be HTTPS (not HTTP)
- ⚠️ Do NOT include `/donations` or `/v1` in the URL
- ⚠️ Use the base ngrok URL only

**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

### Step 2: Test Connection

1. Click **"Test Connection"** in Wix
2. Should return: ✅ "Connection successful"
3. If fails:
   - Verify ngrok is running: `curl http://127.0.0.1:4040/api/tunnels`
   - Test API directly: 
     ```bash
     curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
          -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
          https://multiracial-zavier-acculturative.ngrok-free.dev/health
     ```

### Step 3: Refresh Schema (MOST CRITICAL!)

**This is the #1 cause of WDE0116 errors!**

1. Go to **Content Manager** → **Collections**
2. Find **"HingeCraftDonationsDB"** collection
3. Click **"More Actions"** (three dots menu)
4. Click **"Refresh Schema"**
5. Wait 10-30 seconds for schema refresh to complete

**Why this is critical**: 
- Wix caches the database schema
- Without refreshing, Wix won't see the Wix required columns
- WDE0116 will persist until schema is refreshed

### Step 4: Verify Schema Detection

After refreshing, verify Wix detected the columns:

1. Go to **Content Manager** → **Collections** → **HingeCraftDonationsDB**
2. Click **"Fields"** or **"Schema"**
3. Verify these fields are present:
   - ✅ `_id` (Text, Primary Key)
   - ✅ `_createdDate` (Date & Time)
   - ✅ `_updatedDate` (Date & Time)
   - ✅ `_owner` (Text)
   - ✅ `amount` (Number)
   - ✅ `currency` (Text)
   - ✅ Other custom fields

If these fields are NOT visible:
- Schema refresh didn't work
- Check API response format
- Verify database has the columns

### Step 5: Configure Permissions

1. Go to **Content Manager** → **Collections** → **HingeCraftDonationsDB**
2. Click **"Permissions & Privacy"**
3. Configure:
   - **Read**: Who can view (e.g., "Anyone")
   - **Write**: Who can create/update (e.g., "Anyone can submit")
   - **Owner**: Set owner permissions

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection Failed" or "Cannot Connect"

**Causes**:
- ngrok not running
- Docker services not running
- Wrong endpoint URL
- Firewall blocking connection

**Solutions**:
```bash
# 1. Check ngrok
curl http://127.0.0.1:4040/api/tunnels

# 2. Check Docker
docker-compose ps

# 3. Test API directly
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     https://YOUR_NGROK_URL/health
```

### Issue 2: "Schema Not Detected" or "Fields Missing"

**Causes**:
- Schema not refreshed
- API not returning Wix required fields
- Wrong response format

**Solutions**:
1. **Refresh schema** (Step 3 above)
2. Verify API response:
   ```bash
   curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
        https://YOUR_NGROK_URL/donations | jq '.[0] | {_id, _createdDate, _updatedDate, _owner}'
   ```
3. Check database schema:
   ```sql
   SELECT "_id", "_createdDate", "_updatedDate", "_owner" FROM donations LIMIT 1;
   ```

### Issue 3: "WDE0116 Still Occurs After All Fixes"

**Causes**:
- Schema not refreshed (most common)
- Using `wixData.aggregate()` (not supported)
- Field name mismatches
- Unsupported operations

**Solutions**:
1. **Refresh schema** again
2. Don't use `wixData.aggregate()` - use direct API calls:
   ```javascript
   // ❌ Don't use this
   wixData.aggregate("HingeCraftDonationsDB/Donations", ...)
   
   // ✅ Use this instead
   import { getAllDonations } from 'backend/hingecraft-api';
   const result = await getAllDonations(100, 0);
   ```
3. Verify field names match exactly (case-sensitive)
4. Check Wix console for specific error messages

### Issue 4: "Collection Not Found" or "Collection Not Shared"

**Causes**:
- Collection not properly connected
- Collection not shared with site

**Solutions**:
1. Re-connect external database
2. Go to **Content Manager** → **Collections** → **HingeCraftDonationsDB**
3. Click **"More Actions"** → **"Share Collection"**
4. Ensure collection is shared with your site

---

## 📋 Verification Checklist

Before reporting WDE0116 as unresolved, verify:

- [ ] ngrok is running and accessible
- [ ] Docker services are running (`docker-compose ps`)
- [ ] API health endpoint returns success
- [ ] Connection test in Wix succeeds
- [ ] Schema has been refreshed in Wix
- [ ] Wix required fields (`_id`, `_createdDate`, `_updatedDate`, `_owner`) are visible in Wix
- [ ] Permissions are configured
- [ ] Not using `wixData.aggregate()`
- [ ] Field names match exactly (case-sensitive)
- [ ] API returns Wix SPI format (`items`, `totalCount`, etc.)

---

## 🔗 API Endpoints Reference

### Health Check
```
GET /health
Headers: Authorization: Bearer {SECRET_KEY}, X-API-Key: {SECRET_KEY}
```

### Get All Donations (Wix Format)
```
GET /donations?limit=100&offset=0
Headers: Authorization: Bearer {SECRET_KEY}, X-API-Key: {SECRET_KEY}
Response: { items: [...], totalCount: N, hasNext: bool, hasPrev: bool }
```

### Wix SPI Collection Endpoint
```
GET /v1/collections/donations/items?limit=100&offset=0
Headers: Authorization: Bearer {SECRET_KEY}, X-API-Key: {SECRET_KEY}
Response: { items: [...], totalCount: N, hasNext: bool, hasPrev: bool }
```

### Get Schema
```
GET /v1/collections/donations/schema
Headers: Authorization: Bearer {SECRET_KEY}, X-API-Key: {SECRET_KEY}
Response: { collectionName: "donations", fields: [...] }
```

---

## 📞 Next Steps

If WDE0116 persists after all steps:

1. **Check Wix Console Logs**:
   - Go to Wix Editor → Dev Mode → Console
   - Look for specific error messages
   - Note the exact operation that fails

2. **Test API Directly**:
   ```bash
   # Test health
   curl -H "Authorization: Bearer SECRET_KEY" \
        -H "X-API-Key: SECRET_KEY" \
        https://YOUR_NGROK_URL/health
   
   # Test donations endpoint
   curl -H "Authorization: Bearer SECRET_KEY" \
        -H "X-API-Key: SECRET_KEY" \
        https://YOUR_NGROK_URL/donations | jq '.items[0]'
   ```

3. **Contact Wix Support**:
   - Provide connection details
   - Share API response examples
   - Include error logs from Wix console

---

**Last Updated**: 2025-12-01  
**Status**: All backend fixes applied, awaiting Wix schema refresh








