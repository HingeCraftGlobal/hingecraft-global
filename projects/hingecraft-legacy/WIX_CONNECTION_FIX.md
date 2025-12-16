# Fix Wix Connection - WDE0116 Error Resolution

## ✅ All Endpoints Verified

**Production URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`  
**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🔧 Connection Steps (Follow Exactly)

### Step 1: Disconnect Existing Connection (if any)
1. Go to: **Database → External Database**
2. If you see `HingeCraftDonationsDB`, click **Disconnect**
3. Wait for disconnection to complete

### Step 2: Clear Wix Cache
1. Go to: **Settings → Advanced → Clear Cache**
2. Or refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

### Step 3: Connect Fresh
1. Go to: **Database → External Database**
2. Click: **+ Connect External Database**
3. Fill in **EXACTLY**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
4. **DO NOT** click Connect yet

### Step 4: Verify Endpoint (Before Connecting)
Test the endpoint in a new browser tab:
```
https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/schema
```

You should see JSON with `collection` object.

### Step 5: Connect
1. Click **Connect**
2. **Wait 30-60 seconds** for schema to load
3. **DO NOT** refresh or navigate away

### Step 6: Verify Connection
1. You should see: **Collection: `donations`**
2. Click on `donations` collection
3. Verify fields:
   - `_id` (Text) ✅
   - `_createdDate` (Date & Time) ✅
   - `_updatedDate` (Date & Time) ✅
   - `_owner` (Text) ✅
   - `amount` (Number) ✅
   - Other fields...

---

## 🐛 Troubleshooting WDE0116 Error

### Error: "Schema endpoint not accessible"
**Fix**:
1. Verify ngrok is running: `curl http://localhost:4040/api/tunnels`
2. Test endpoint: `curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/schema`
3. Restart adaptor: `docker-compose restart db-adaptor`

### Error: "Authentication failed"
**Fix**:
1. Verify secret key matches **EXACTLY** (no spaces, no extra characters)
2. Test with: `curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/health`
3. Should return: `{"status":"healthy"}`

### Error: "Schema format invalid"
**Fix**:
1. Schema must return: `{"collection": {"id": "donations", "fields": {...}}}`
2. Must include: `_id`, `_createdDate`, `_updatedDate`, `_owner`
3. Each field must have: `capabilities: {sortable, queryable, settable}`

### Error: "Collection not found"
**Fix**:
1. Wait longer (60+ seconds) for schema to load
2. Check adaptor logs: `docker-compose logs db-adaptor`
3. Verify endpoint is accessible from internet (not localhost)

---

## ✅ Current Status

**Schema Endpoint**: ✅ Working  
**Items Endpoint**: ✅ Working  
**Required Fields**: ✅ Present  
**Wix SPI Format**: ✅ Valid

---

## 📋 Test Commands

```bash
# Test health
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/health

# Test schema
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/schema

# Test items
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/items?limit=1
```

---

**Status**: ✅ Ready for Wix connection
