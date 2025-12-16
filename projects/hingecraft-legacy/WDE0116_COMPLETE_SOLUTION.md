# Wix Error WDE0116 - Complete Solution Guide

## 🔍 Understanding WDE0116

**Error Code:** WDE0116  
**Type:** Data/Connection Error  
**Meaning:** Field names referenced in code do not exist in the specified collection, OR connection issues preventing field access.

---

## ❌ Common Causes

### Cause 1: Connection Not Established

**Symptom:** Wix cannot reach your database adaptor endpoint.

**Why it happens:**
- Using `localhost:3000` (Wix runs in cloud, can't access localhost)
- Endpoint URL is incorrect
- Service is not running
- Network/firewall blocking connection

**Solution:**
1. Use ngrok tunnel for local development
2. Deploy to production (Railway/Render) for permanent solution
3. Verify endpoint is accessible: `curl https://your-endpoint.com/health`

### Cause 2: Field Name Mismatch

**Symptom:** Code references fields that don't exist in database.

**Why it happens:**
- Field names are case-sensitive
- Using wrong field names (e.g., `_id` instead of `id`)
- Field names changed but code not updated

**Solution:**
- Verify field names match database schema exactly
- Use lowercase with underscores (snake_case)
- Check database schema: `database-schema.sql`

### Cause 3: Aggregation Not Supported

**Symptom:** `wixData.aggregate()` fails with external database.

**Why it happens:**
- External databases may not support all Wix aggregation operations
- Field names in aggregation don't match schema

**Solution:**
- Use direct API calls instead of `wixData.aggregate()`
- Use `getAllDonations()` from backend API
- Process data in code instead of database

---

## ✅ Step-by-Step Fix

### Step 1: Verify Connection Endpoint

```bash
cd [PROJECT_ROOT]/HingeCraft

# Start Docker services
docker-compose up -d

# Test health endpoint
curl http://localhost:3000/health

# Should return: {"status":"healthy","database":"connected",...}
```

### Step 2: Set Up Public Access

**Option A: ngrok (Quick Fix)**

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
```

**Option B: Deploy to Production (Recommended)**

1. Push to GitHub
2. Deploy to Railway.app or Render.com
3. Get production HTTPS URL
4. Use in Wix configuration

### Step 3: Configure Wix External Database

1. Go to **Wix Editor** → **Database** → **External Database**
2. Click **"Connect External Database"**
3. Select **"Custom"**
4. Enter:
   - **Connection Name: HingeCraftDonationsDB
   - **Endpoint URL:** 
     - ngrok: `https://multiracial-zavier-acculturative.ngrok-free.dev`
     - Production: `https://hingecraft-api.railway.app`
   - **Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
5. Click **"Test Connection"**

### Step 4: Verify Field Names

**Database Schema (Correct Field Names):**
```sql
CREATE TABLE donations (
    id VARCHAR PRIMARY KEY,              -- ✅ Use: id
    amount DECIMAL NOT NULL,              -- ✅ Use: amount
    currency VARCHAR DEFAULT 'USD',       -- ✅ Use: currency
    is_other_amount BOOLEAN,              -- ✅ Use: is_other_amount
    source VARCHAR,                       -- ✅ Use: source
    payment_status VARCHAR,               -- ✅ Use: payment_status
    payment_method VARCHAR,               -- ✅ Use: payment_method
    transaction_id VARCHAR UNIQUE,        -- ✅ Use: transaction_id
    member_email VARCHAR,                 -- ✅ Use: member_email
    member_name VARCHAR,                  -- ✅ Use: member_name
    created_at TIMESTAMP,                 -- ✅ Use: created_at
    updated_at TIMESTAMP,                 -- ✅ Use: updated_at
    metadata JSONB                        -- ✅ Use: metadata
);
```

**❌ Wrong Field Names (Will Cause WDE0116):**
```javascript
// Don't use these:
{
    _id: "...",              // ❌ Wrong: use 'id'
    ID: "...",               // ❌ Wrong: use 'id'
    Amount: 50.00,           // ❌ Wrong: use 'amount'
    Currency: "USD",         // ❌ Wrong: use 'currency'
    isOtherAmount: true,     // ❌ Wrong: use 'is_other_amount'
    is_other: true,          // ❌ Wrong: use 'is_other_amount'
    dateCreated: "...",      // ❌ Wrong: use 'created_at'
    createdAt: "...",        // ❌ Wrong: use 'created_at'
    paymentStatus: "...",    // ❌ Wrong: use 'payment_status'
    memberEmail: "...",      // ❌ Wrong: use 'member_email'
}
```

**✅ Correct Field Names:**
```javascript
// Use these:
{
    id: "...",               // ✅ Correct
    amount: 50.00,           // ✅ Correct
    currency: "USD",         // ✅ Correct
    is_other_amount: true,   // ✅ Correct
    source: "...",           // ✅ Correct
    payment_status: "...",   // ✅ Correct
    payment_method: "...",    // ✅ Correct
    transaction_id: "...",   // ✅ Correct
    member_email: "...",     // ✅ Correct
    member_name: "...",      // ✅ Correct
    created_at: "...",       // ✅ Correct
    updated_at: "...",       // ✅ Correct
    metadata: {...}          // ✅ Correct
}
```

### Step 5: Fix Wix Code

**❌ Don't Use This (Causes WDE0116):**
```javascript
// Wrong: Using wixData.aggregate() with external database
import wixData from 'wix-data';

export async function getDonationStats() {
    const result = await wixData.aggregate("HingeCraftDonationsDB/Donations", {
        fields: [
            { $sum: "Amount" }  // ❌ Wrong field name
        ]
    });
    return result;
}
```

**✅ Use This Instead:**
```javascript
// Correct: Use direct API calls
import { getAllDonations } from 'backend/hingecraft-api';

export async function getDonationStats() {
    const result = await getAllDonations(1000, 0);
    
    // Process in code
    const total = result.donations.reduce((sum, d) => sum + d.amount, 0);
    const count = result.donations.length;
    
    return { total, count, donations: result.donations };
}
```

**✅ Correct Wix Velo Backend Code:**
```javascript
// backend/hingecraft-api.jsw
import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';

let EXTERNAL_DB_ENDPOINT;
let EXTERNAL_DB_SECRET_KEY;

async function initConfig() {
    try {
        EXTERNAL_DB_ENDPOINT = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
        EXTERNAL_DB_SECRET_KEY = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
    } catch (error) {
        // Fallback
        EXTERNAL_DB_ENDPOINT = 'https://your-production-url.com';
        EXTERNAL_DB_SECRET_KEY = '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b';
    }
}

initConfig();

async function makeRequest(method, path, body = null) {
    const url = `${EXTERNAL_DB_ENDPOINT}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
        'X-API-Key': EXTERNAL_DB_SECRET_KEY
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`API Error (${response.status})`);
    }
    return await response.json();
}

export async function getLatestDonation() {
    return await makeRequest('GET', '/donations/latest');
}

export async function saveDonation(amount, options = {}) {
    return await makeRequest('POST', '/donations', {
        amount: parseFloat(amount),
        currency: options.currency || 'USD',
        is_other_amount: options.isOtherAmount || false,  // ✅ Correct field name
        source: options.source || 'payment_page',
        payment_status: options.paymentStatus || 'completed',
        payment_method: options.paymentMethod || null,
        transaction_id: options.transactionId || null,
        member_email: options.memberEmail || null,
        member_name: options.memberName || null,
        metadata: options.metadata || null
    });
}

export async function getAllDonations(limit = 100, offset = 0) {
    return await makeRequest('GET', `/donations?limit=${limit}&offset=${offset}`);
}
```

**✅ Correct Wix Velo Frontend Code:**
```javascript
// Frontend code
import { getLatestDonation, saveDonation } from 'backend/hingecraft-api';

$w.onReady(async function () {
    try {
        // Get latest donation
        const donation = await getLatestDonation();
        
        if (donation) {
            // ✅ Use correct field names
            console.log('ID:', donation.id);
            console.log('Amount:', donation.amount);
            console.log('Currency:', donation.currency);
            console.log('Is Other Amount:', donation.is_other_amount);
            console.log('Created At:', donation.created_at);
            
            // Display in UI
            $w('#donationAmount').text = `$${donation.amount}`;
            $w('#donationDate').text = new Date(donation.created_at).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

export async function saveNewDonation(amount) {
    try {
        const donation = await saveDonation(amount, {
            isOtherAmount: true,
            paymentMethod: 'card',
            memberEmail: 'user@example.com'
        });
        
        // ✅ Use correct field names
        console.log('Saved donation ID:', donation.id);
        console.log('Saved amount:', donation.amount);
        
        return donation;
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}
```

### Step 6: Test Connection

**Test in Wix Velo:**
```javascript
// Test connection
import { testConnection } from 'backend/hingecraft-api';

export async function testDbConnection() {
    try {
        const health = await testConnection();
        console.log('✅ Connection successful:', health);
        return health;
    } catch (error) {
        console.error('❌ Connection failed:', error);
        return { status: 'error', error: error.message };
    }
}
```

---

## 🔧 Quick Fix Checklist

- [ ] Docker services running: `docker-compose ps`
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] Public endpoint accessible (ngrok or production)
- [ ] Wix connection configured with correct endpoint URL
- [ ] Secret key matches in Wix and `.env` file
- [ ] Field names in code match database schema exactly
- [ ] Using direct API calls instead of `wixData.aggregate()`
- [ ] Tested connection in Wix Velo

---

## 📋 Configuration Summary

**Wix External Database:**
- Connection Name: HingeCraftDonationsDB
- Endpoint URL: `https://multiracial-zavier-acculturative.ngrok-free.dev` or production URL
- Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

**Database Schema:**
- Table: `donations`
- Fields: `id`, `amount`, `currency`, `is_other_amount`, `source`, `payment_status`, `payment_method`, `transaction_id`, `member_email`, `member_name`, `created_at`, `updated_at`, `metadata`

**API Endpoints:**
- Health: `GET /health` (no auth)
- Latest: `GET /donations/latest` (auth required)
- Create: `POST /donations` (auth required)
- List: `GET /donations?limit=100&offset=0` (auth required)

---

## 🎯 Summary

**WDE0116 is caused by:**
1. Connection not accessible from Wix (localhost won't work)
2. Field names don't match database schema
3. Using unsupported operations (aggregate) with external database

**Solution:**
1. Use ngrok or deploy to production for public endpoint
2. Verify field names match schema exactly (snake_case)
3. Use direct API calls instead of `wixData.aggregate()`
4. Test connection before using in code

**Status:** ✅ Complete solution ready

---

**Last Updated:** $(date)
**Error Code:** WDE0116
**Solution Version:** 1.0














