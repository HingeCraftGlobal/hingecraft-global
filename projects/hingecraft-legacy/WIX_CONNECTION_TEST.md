# Wix Database Adaptor Connection Test

## Production Configuration

**Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`  
**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## Test Endpoints

### 1. Health Check
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://multiracial-zavier-acculturative.ngrok-free.dev/health
```

**Expected**: `{"status":"healthy"}`

### 2. Schema Endpoint (CRITICAL for Wix)
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/schema
```

**Expected**: JSON with `collection` object containing `fields` with:
- `_id` (required)
- `_createdDate` (required)
- `_updatedDate` (required)
- `_owner` (required)

### 3. Items Endpoint (Wix SPI format)
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/items?limit=10
```

**Expected**: JSON with `items` array and `totalCount`

---

## Wix Connection Steps

1. **Go to**: Database → External Database → Connect
2. **Connection Name**: `HingeCraftDonationsDB`
3. **Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`
4. **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
5. **Click**: Connect

---

## Troubleshooting WDE0116 Error

### Common Causes:
1. **Schema endpoint not returning correct format**
   - Must return: `{"collection": {"id": "donations", "fields": {...}}}`
   - Must include: `_id`, `_createdDate`, `_updatedDate`, `_owner`

2. **Authentication failing**
   - Verify secret key matches exactly
   - Check headers: `Authorization: Bearer SECRET_KEY` or `X-API-Key: SECRET_KEY`

3. **Schema fields missing capabilities**
   - Each field must have: `capabilities: {sortable, queryable, settable}`

4. **Collection capabilities missing**
   - Must include: `capabilities: {query, count, insert, update, remove, get, find}`

### Fix Steps:
1. Test schema endpoint (see above)
2. Verify all required fields present
3. Check schema format matches Wix SPI exactly
4. Restart database adaptor: `docker-compose restart db-adaptor`
5. Try connecting again in Wix

---

## Current Schema Status

**Total Donations**: 3

**Schema Endpoint**: ✅ Working  
**Items Endpoint**: ✅ Working  
**Required Fields**: ✅ Present

---

**Status**: Ready for Wix connection
