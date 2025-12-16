# Complete Database Details for Wix CMS - Ready to Input

## 🔗 External Database Connection

### Connection Information

**Connection Name**: 
```
HingeCraftDonationsDB
```

**Connection Type**: 
```
Custom (External Database)
```

**Endpoint URL**: 
```
https://your-ngrok-url.ngrok-free.dev
```
OR for production:
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```

**Secret Key**: 
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 📋 Step-by-Step Wix CMS Setup

### Step 1: Open Wix Database Settings

1. **Open Wix Editor**
2. **Click**: **Database** (left sidebar)
3. **Click**: **External Database** (top menu)
4. **Click**: **"Connect External Database"** button

### Step 2: Select Connection Type

1. **Select**: **"Custom"** option
2. **Click**: **"Next"**

### Step 3: Enter Connection Details

**Connection Name**:
```
HingeCraftDonationsDB
```

**Endpoint URL**:
```
https://your-ngrok-url.ngrok-free.dev
```
*(Replace with your actual database adaptor URL)*

**Secret Key**:
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

**Click**: **"Connect"**

### Step 4: Wait for Schema Detection

Wix will automatically:
- Call `/v1/collections/donations/schema` endpoint
- Detect all fields and their types
- Set up read-write access (if required fields are present)

**Expected Time**: 10-30 seconds

### Step 5: Verify Collection

1. **Go to**: **Database** → **Collections**
2. **Find**: `donations` collection
3. **Verify**: All fields are detected correctly
4. **Check**: Read-Write access is enabled (should be automatic)

---

## 📊 Database Schema - Complete Field List

### Collection: `donations`

#### Required Wix Fields (for read-write access)

| Field Name | Type | Description | Auto-Generated |
|------------|------|-------------|----------------|
| `_id` | Text | Primary key | ✅ Yes (UUID) |
| `_createdDate` | Date & Time | Creation timestamp | ✅ Yes (on insert) |
| `_updatedDate` | Date & Time | Last update timestamp | ✅ Yes (on update) |
| `_owner` | Text | Owner identifier | ✅ Yes (default: 'system') |

#### Custom Fields

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| `id` | Text | Unique identifier | No | Auto-generated |
| `amount` | Number | Donation amount | ✅ Yes | - |
| `currency` | Text | Currency code | No | 'USD' |
| `is_other_amount` | Boolean | True if custom amount | No | false |
| `source` | Text | Source identifier | No | 'payment_page' |
| `payment_status` | Text | Payment status | No | 'completed' |
| `payment_method` | Text | Payment method | No | null |
| `transaction_id` | Text | Transaction ID | No | null |
| `member_email` | Text | Member email | No | null |
| `member_name` | Text | Member name | No | null |
| `created_at` | Date & Time | Creation timestamp | No | Current timestamp |
| `updated_at` | Date & Time | Update timestamp | No | Current timestamp |
| `metadata` | JSON | Additional metadata | No | null |

---

## 🔐 Wix Secrets Manager Configuration

### Required Secrets

**Go to**: **Settings** → **Secrets Manager** → **Add Secret**

#### Secret 1: `EXTERNAL_DB_ENDPOINT`

**Name**: 
```
EXTERNAL_DB_ENDPOINT
```

**Value**: 
```
https://your-ngrok-url.ngrok-free.dev
```
OR for production:
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```

**Description**: 
```
External database adaptor endpoint URL
```

#### Secret 2: `EXTERNAL_DB_SECRET_KEY`

**Name**: 
```
EXTERNAL_DB_SECRET_KEY
```

**Value**: 
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

**Description**: 
```
Secret key for authenticating with external database adaptor
```

---

## 🧪 Testing Database Connection

### Test 1: Health Check

**Endpoint**: `GET /health`

**Command**:
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-04T12:00:00Z"
}
```

### Test 2: Schema Endpoint

**Endpoint**: `GET /v1/collections/donations/schema`

**Command**:
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/v1/collections/donations/schema
```

**Expected Response**: Full schema JSON with all fields and capabilities

### Test 3: Latest Donation

**Endpoint**: `GET /donations/latest`

**Command**:
```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/donations/latest
```

**Expected Response**: Latest donation object or 404 if no donations

---

## 🔧 Troubleshooting

### Error: "Cannot connect to external database"

**Solutions**:
1. ✅ Verify endpoint URL is correct and accessible
2. ✅ Check secret key matches database adaptor configuration
3. ✅ Ensure database adaptor is running
4. ✅ Check CORS settings in database adaptor
5. ✅ Verify ngrok tunnel is active (if using local)

### Error: "Schema not found"

**Solutions**:
1. ✅ Verify `/v1/collections/donations/schema` endpoint exists
2. ✅ Check endpoint returns valid schema JSON
3. ✅ Ensure authentication headers are correct
4. ✅ Check database adaptor logs for errors

### Error: "Read-only access" (should be read-write)

**Solutions**:
1. ✅ Verify `_id`, `_createdDate`, `_updatedDate`, `_owner` fields exist in schema
2. ✅ Check schema endpoint returns these fields with correct capabilities
3. ✅ Refresh schema in Wix (disconnect and reconnect)
4. ✅ Verify database triggers are set up correctly

### Error: WDE0116

**Solutions**:
1. ✅ Ensure all required Wix fields are present (`_id`, `_createdDate`, `_updatedDate`, `_owner`)
2. ✅ Verify schema endpoint returns correct format
3. ✅ Check API responses include Wix required fields
4. ✅ Refresh schema in Wix CMS
5. ✅ See `WDE0116_COMPLETE_TROUBLESHOOTING_FINAL.md` for complete solution

---

## 📝 Database Adaptor Endpoints Required

Your database adaptor must provide these endpoints:

### Required Endpoints

1. **GET `/health`** - Health check (with auth)
2. **GET `/v1/collections/donations/schema`** - Schema definition (CRITICAL)
3. **GET `/v1/collections/donations/items`** - List items (Wix SPI format)
4. **GET `/donations/latest`** - Latest donation
5. **POST `/donations`** - Create donation
6. **GET `/donations/:id`** - Get specific donation
7. **PATCH `/donations/:id`** - Update donation

### Response Format

All endpoints must:
- ✅ Require authentication (Bearer token or X-API-Key header)
- ✅ Return JSON
- ✅ Include Wix required fields (`_id`, `_createdDate`, `_updatedDate`, `_owner`)
- ✅ Handle errors gracefully

---

## ✅ Verification Checklist

After setup, verify:

- [ ] External database connection is active
- [ ] `donations` collection appears in Wix CMS
- [ ] All fields are detected correctly
- [ ] Read-Write access is enabled
- [ ] Wix Secrets are configured (`EXTERNAL_DB_ENDPOINT`, `EXTERNAL_DB_SECRET_KEY`)
- [ ] Backend functions can access database
- [ ] Test donation can be created
- [ ] Test donation can be retrieved
- [ ] No WDE0116 errors

---

## 🔗 Quick Reference

**Connection Name**: `HingeCraftDonationsDB`  
**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`  
**Schema Endpoint**: `/v1/collections/donations/schema`  
**Collection**: `donations`

---

**Status**: ✅ Ready for Wix CMS Setup  
**Last Updated**: December 4, 2024  
**Version**: Complete Database Details v1.0








