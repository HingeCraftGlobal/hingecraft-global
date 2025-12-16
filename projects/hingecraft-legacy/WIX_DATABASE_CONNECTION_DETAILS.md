# Wix Database Connection Details - Complete Setup

## 🔗 External Database Connection Configuration

### Connection Information

**Connection Name**: `HingeCraftDonationsDB`

**Connection Type**: Custom (External Database)

**Endpoint URL**: 
```
https://your-ngrok-url.ngrok-free.dev
```
OR for production:
```
https://your-production-api-url.com
```

**Secret Key**:
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 📋 Step-by-Step Wix CMS Setup

### Step 1: Connect External Database

1. **Open Wix Editor**
2. **Go to**: **Database** → **External Database**
3. **Click**: **"Connect External Database"**
4. **Select**: **"Custom"**
5. **Enter**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: Your database adaptor URL (see above)
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
6. **Click**: **"Connect"**

### Step 2: Wait for Schema Detection

Wix will automatically:
- Call `/v1/collections/donations/schema` endpoint
- Detect all fields and their types
- Set up read-write access (if `_id`, `_createdDate`, `_updatedDate`, `_owner` are present)

### Step 3: Verify Collection

1. **Go to**: **Database** → **Collections**
2. **Find**: `donations` collection
3. **Verify**: All fields are detected correctly
4. **Check**: Read-Write access is enabled

---

## 📊 Database Schema Details

### Collection: `donations`

#### Required Wix Fields (for read-write access)

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| `_id` | Text | Primary key | ✅ Yes |
| `_createdDate` | Date & Time | Creation timestamp | ✅ Yes |
| `_updatedDate` | Date & Time | Last update timestamp | ✅ Yes |
| `_owner` | Text | Owner identifier | ✅ Yes |

#### Custom Fields

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| `id` | Text | Unique identifier | No |
| `amount` | Number | Donation amount | ✅ Yes |
| `currency` | Text | Currency code (default: USD) | No |
| `is_other_amount` | Boolean | True if custom amount | No |
| `source` | Text | Source identifier | No |
| `payment_status` | Text | Payment status | No |
| `payment_method` | Text | Payment method | No |
| `transaction_id` | Text | Transaction ID | No |
| `member_email` | Text | Member email | No |
| `member_name` | Text | Member name | No |
| `created_at` | Date & Time | Creation timestamp | No |
| `updated_at` | Date & Time | Update timestamp | No |
| `metadata` | JSON | Additional metadata | No |

---

## 🔐 Wix Secrets Manager Configuration

### Required Secrets

Go to: **Settings** → **Secrets Manager**

#### Secret 1: `EXTERNAL_DB_ENDPOINT`

**Name**: `EXTERNAL_DB_ENDPOINT`  
**Value**: Your database adaptor endpoint URL
- Local: `https://your-ngrok-url.ngrok-free.dev`
- Production: `https://your-production-api-url.com`

#### Secret 2: `EXTERNAL_DB_SECRET_KEY`

**Name**: `EXTERNAL_DB_SECRET_KEY`  
**Value**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🧪 Testing Database Connection

### Test 1: Health Check

```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-04T12:00:00Z"
}
```

### Test 2: Schema Endpoint

```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/v1/collections/donations/schema
```

Expected response: Full schema JSON with all fields and capabilities

### Test 3: Latest Donation

```bash
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     https://your-endpoint-url/donations/latest
```

Expected response: Latest donation object or 404 if no donations

---

## 🔧 Troubleshooting

### Error: "Cannot connect to external database"

**Solutions**:
1. Verify endpoint URL is correct and accessible
2. Check secret key matches database adaptor configuration
3. Ensure database adaptor is running
4. Check CORS settings in database adaptor
5. Verify ngrok tunnel is active (if using local)

### Error: "Schema not found"

**Solutions**:
1. Verify `/v1/collections/donations/schema` endpoint exists
2. Check endpoint returns valid schema JSON
3. Ensure authentication headers are correct
4. Check database adaptor logs for errors

### Error: "Read-only access" (should be read-write)

**Solutions**:
1. Verify `_id`, `_createdDate`, `_updatedDate`, `_owner` fields exist in schema
2. Check schema endpoint returns these fields with correct capabilities
3. Refresh schema in Wix (disconnect and reconnect)
4. Verify database triggers are set up correctly

---

## 📝 Database Adaptor Endpoints

Your database adaptor must provide these endpoints:

### Required Endpoints

1. **GET `/health`** - Health check (with auth)
2. **GET `/v1/collections/donations/schema`** - Schema definition
3. **GET `/v1/collections/donations/items`** - List items (Wix SPI format)
4. **GET `/donations/latest`** - Latest donation
5. **POST `/donations`** - Create donation
6. **GET `/donations/:id`** - Get specific donation
7. **PATCH `/donations/:id`** - Update donation

### Response Format

All endpoints must:
- Require authentication (Bearer token or X-API-Key header)
- Return JSON
- Include Wix required fields (`_id`, `_createdDate`, `_updatedDate`, `_owner`)
- Handle errors gracefully

---

## ✅ Verification Checklist

After setup, verify:

- [ ] External database connection is active
- [ ] `donations` collection appears in Wix CMS
- [ ] All fields are detected correctly
- [ ] Read-Write access is enabled
- [ ] Wix Secrets are configured
- [ ] Backend functions can access database
- [ ] Test donation can be created
- [ ] Test donation can be retrieved

---

**Status**: ✅ Ready for Wix CMS Setup  
**Last Updated**: December 4, 2024








