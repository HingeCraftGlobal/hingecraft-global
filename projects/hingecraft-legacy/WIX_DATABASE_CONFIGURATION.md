# Wix Database Configuration - Complete Setup Guide

## 🎯 Quick Answer: Wix Database Connection Settings

Use these **exact values** when configuring your Wix External Database connection:

---

## 📋 Wix External Database Configuration

### Step 1: Access Wix Database Settings

1. **Login to Wix Editor**
2. **Navigate to**: Database → Collections
3. **Click**: "Connect External Database" or "External Database" tab
4. **Click**: "Add Connection"
5. **Select**: "Custom"

---

### Step 2: Enter Connection Details

You'll see **3 fields** to fill. Use these values:

#### **Field 1: Connection Name**
```
HingeCraftDonationsDB
```

#### **Field 2: Endpoint URL**

**⚠️ REQUIRES HTTPS - Wix cannot access localhost!**

**For Local Development (MUST use ngrok tunnel):**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```
*Get this by running: `ngrok http 3000`*
*Then copy the HTTPS URL from ngrok web interface (http://localhost:4040)*
*Wix requires HTTPS - localhost will NOT work*

**For Production (Deployed API):**
```
https://your-deployed-api-url.com
```
*Examples:*
- `https://hingecraft-api.railway.app`
- `https://api.hingecraft-global.ai`
- `https://your-server.com:3000`

**If using Docker locally with tunnel:**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```
*Use ngrok or similar tunnel service to expose localhost:3000*

#### **Field 3: Secret Key (Database Adaptor Secret Key)**

**From your project configuration:**
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

*This is the `ADAPTOR_SECRET_KEY` from your `.env` file*

---

## ✅ Complete Configuration Summary

| Field | Value |
|-------|-------|
| **Connection Name** | `HingeCraftDonationsDB` |
| **Endpoint URL (Local with ngrok)** | `https://multiracial-zavier-acculturative.ngrok-free.dev` |
| **Endpoint URL (Production)** | `https://your-deployed-api-url.com` |
| **Secret Key** | `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b` |

---

## 🔍 Where These Values Come From

### Connection Name
- **Source**: Standardized across all HingeCraft documentation
- **Value**: `HingeCraftDonationsDB`
- **Used in**: All database connection setups

### Endpoint URL
- **Local**: `http://localhost:3000` (Database Adaptor API port)
- **Source**: `docker-compose.yml` - db-adaptor service runs on port 3000
- **Production**: Your deployed API URL (Railway, Render, etc.)

### Secret Key
- **Source**: `.env` file - `ADAPTOR_SECRET_KEY` variable
- **Current Value**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
- **Also used in**: `payment-page-integration.js` as `SECRET_KEY`
- **Format**: 64-character hexadecimal string

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Start Your Database Adaptor

**If using Docker (Local):**
```bash
cd [PROJECT_ROOT]/HingeCraft
docker-compose up -d
```

**Verify it's running:**
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"healthy",...}`

### Step 2: Configure Wix External Database

1. **Open Wix Editor**
2. **Go to**: Database → External Database
3. **Click**: "Connect External Database"
4. **Select**: "Custom"
5. **Fill in the 3 fields**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `http://localhost:3000` (or your production URL)
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
6. **Click**: "Test Connection"
7. **If successful**: Click "Save"

### Step 3: Configure Wix Secrets Manager (Optional but Recommended)

Instead of hardcoding in your code, use Wix Secrets Manager:

1. **Go to**: Settings → Secrets Manager
2. **Add Secret 1**:
   - **Name**: `EXTERNAL_DB_ENDPOINT`
   - **Value**: `http://localhost:3000` (or production URL)
3. **Add Secret 2**:
   - **Name**: `EXTERNAL_DB_SECRET_KEY`
   - **Value**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🔐 Security Notes

### Secret Key Security
- ✅ **Never commit** `.env` file to Git
- ✅ **Use Wix Secrets Manager** for production
- ✅ **Rotate keys** periodically
- ✅ **Use different keys** for development and production

### Endpoint URL Security
- ✅ **Use HTTPS** in production
- ✅ **Configure CORS** if needed
- ✅ **Use firewall rules** to restrict access
- ✅ **Monitor API logs** for unauthorized access

---

## 🧪 Testing the Connection

### Test from Wix Backend Console

```javascript
// In Wix backend console
import { getLatestDonation } from 'backend/hingecraft-api';
const result = await getLatestDonation();
console.log('Connection test:', result);
```

### Test from Command Line

```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Get latest donation (requires auth)
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     http://localhost:3000/donations/latest
```

---

## 📊 Database Schema

Your external database must have a `donations` table with these fields:

- `id` (VARCHAR) - Primary key
- `amount` (DECIMAL) - Donation amount
- `currency` (VARCHAR) - Currency code (default: USD)
- `is_other_amount` (BOOLEAN) - True if custom amount
- `source` (VARCHAR) - Source of donation
- `payment_status` (VARCHAR) - Payment status
- `payment_method` (VARCHAR) - Payment method
- `transaction_id` (VARCHAR) - Unique transaction ID
- `member_email` (VARCHAR) - Member email
- `member_name` (VARCHAR) - Member name
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp
- `metadata` (JSONB) - Additional data

**If using Docker**, the schema is automatically created from `database/init.sql`.

---

## 🔄 API Endpoints Required

Your database adaptor must implement these endpoints:

1. **GET** `/donations/latest` - Get latest donation
2. **POST** `/donations` - Create new donation
3. **GET** `/donations?limit={limit}` - Get all donations
4. **GET** `/donations/{id}` - Get donation by ID
5. **PATCH** `/donations/{id}` - Update donation

**All endpoints require authentication:**
- Header: `Authorization: Bearer {SECRET_KEY}`
- OR Header: `X-API-Key: {SECRET_KEY}`

---

## 🌐 Production Deployment

### If Deploying to Cloud (Railway, Render, etc.)

1. **Deploy your database adaptor** to cloud service
2. **Get your production URL** (e.g., `https://hingecraft-api.railway.app`)
3. **Update Wix configuration**:
   - **Endpoint URL**: Your production URL
   - **Secret Key**: Same secret key (or generate new one for production)
4. **Update `.env` file** with production values
5. **Test connection** from Wix

### If Using Local Development with Wix

Since Wix runs in the cloud, `localhost` won't work directly. Options:

**Option 1: Use Tunnel Service**
```bash
# Install ngrok
npm install -g ngrok

# Expose local API
ngrok http 3000

# Use ngrok URL in Wix: https://multiracial-zavier-acculturative.ngrok-free.dev
```

**Option 2: Deploy to Cloud**
- Deploy API to Railway, Render, or similar service
- Use production URL in Wix

---

## 🐛 Troubleshooting

### Connection Failed

**Check:**
1. ✅ Database adaptor is running: `docker-compose ps`
2. ✅ API is accessible: `curl http://localhost:3000/health`
3. ✅ Secret key matches in `.env` and Wix
4. ✅ Endpoint URL is correct
5. ✅ CORS is configured (if needed)

### Authentication Error

**Check:**
1. ✅ Secret key format matches (64-character hex string)
2. ✅ Secret key in Wix matches `.env` file
3. ✅ Headers are correct: `Authorization: Bearer {KEY}`
4. ✅ API accepts both `Authorization` and `X-API-Key` headers

### Database Not Found

**Check:**
1. ✅ Database/table exists
2. ✅ Table name matches (`donations`)
3. ✅ Schema matches `database-schema.sql`
4. ✅ For Docker: Check logs: `docker-compose logs postgres`

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Database adaptor is running
- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] Wix External Database connection configured
- [ ] Connection test passes in Wix
- [ ] Secret key matches in Wix and `.env`
- [ ] Endpoint URL is correct
- [ ] Wix Secrets Manager configured (optional)
- [ ] Test donation creation works
- [ ] Test donation retrieval works

---

## 📝 Quick Reference Card

**Copy this for quick reference:**

```
Connection Name: HingeCraftDonationsDB
Endpoint URL (Local): http://localhost:3000
Endpoint URL (Production): https://your-deployed-api-url.com
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

**Status**: ✅ Ready to configure in Wix
**Last Updated**: 2025-11-29

