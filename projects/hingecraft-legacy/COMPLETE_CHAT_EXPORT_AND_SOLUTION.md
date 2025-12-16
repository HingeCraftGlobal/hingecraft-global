# Complete HingeCraft Chat Export & WDE0116 Solution

## 📋 Complete Project Export - All Chat Data

This document contains the complete export of all HingeCraft project data, configurations, and solutions for the Wix connection error WDE0116.

**Generated:** $(date)
**Status:** ✅ Complete - Ready for deployment

---

## 🎯 Project Overview

**HingeCraft Global** is a membership platform for the Charter for Abundance & Resilience initiative.

### Core Components:
1. **PostgreSQL Database** - Stores donation/membership data
2. **Database Adaptor API** (Node.js/Express) - RESTful API for Wix integration
3. **Python Server** (FastAPI) - Optional additional API layer
4. **Wix Integration** - Frontend and backend Velo code
5. **Docker Deployment** - Offline/serverless capability

---

## 🔑 Critical Configuration Values

### Wix External Database Connection

**Connection Name:**
```
HingeCraftDonationsDB
```

**Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

**Endpoint URLs:**
- **Local (with ngrok):** `https://multiracial-zavier-acculturative.ngrok-free.dev`
- **Production (Railway):** `https://hingecraft-api.railway.app`
- **Production (Render):** `https://hingecraft-api.onrender.com`
- **Local (testing only):** `http://localhost:3000` ⚠️ Wix cannot access this directly

### Database Configuration

**PostgreSQL:**
- Host: `localhost` (Docker) or `postgres` (container)
- Port: `5432`
- Database: `hingecraft_db`
- User: `hingecraft_user`
- Password: `hingecraft_secure_password_123`

**API Endpoints:**
- Health: `GET /health` (no auth)
- Latest Donation: `GET /donations/latest` (auth required)
- Create Donation: `POST /donations` (auth required)
- List Donations: `GET /donations?limit=100&offset=0` (auth required)
- Export Database: `GET /export/json` (auth required)

---

## ❌ Wix Error WDE0116 - Complete Solution

### Understanding WDE0116

**WDE0116** indicates that:
1. **Field names referenced in code don't exist in the collection**
2. **Connection issues preventing field access**
3. **Aggregation operations not supported with external database**

### Root Causes & Solutions

#### Cause 1: Connection Not Established

**Problem:** Wix cannot reach your database adaptor endpoint.

**Solutions:**

**Option A: Use ngrok Tunnel (Quick Fix)**
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Start Docker services
docker-compose up -d

# Start ngrok tunnel
ngrok http 3000

# Use the HTTPS URL in Wix (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
```

**Option B: Deploy to Production (Recommended)**
1. Push to GitHub
2. Deploy to Railway.app or Render.com
3. Use production HTTPS URL in Wix

#### Cause 2: Field Name Mismatch

**Problem:** Field names in Wix code don't match database schema.

**Database Schema (Correct Field Names):**
```sql
CREATE TABLE donations (
    id VARCHAR PRIMARY KEY,
    amount DECIMAL NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR,
    payment_status VARCHAR,
    payment_method VARCHAR,
    transaction_id VARCHAR UNIQUE,
    member_email VARCHAR,
    member_name VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

**Wix Code Must Use:**
- `id` (not `_id` or `ID`)
- `amount` (not `Amount` or `AMOUNT`)
- `currency` (not `Currency`)
- `is_other_amount` (not `isOtherAmount` or `is_other`)
- `created_at` (not `createdAt` or `dateCreated`)

#### Cause 3: Aggregation Not Supported

**Problem:** `wixData.aggregate()` may not work with external databases.

**Solution:** Use direct API calls instead:
```javascript
// ❌ Don't use this with external database
wixData.aggregate("HingeCraftDonationsDB/Donations", ...)

// ✅ Use this instead
import { getAllDonations } from 'backend/hingecraft-api';
const result = await getAllDonations(100, 0);
```

---

## 🔧 Step-by-Step Fix for WDE0116

### Step 1: Verify Docker Services

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Check Docker is running
docker info

# Start services
docker-compose up -d

# Verify services
docker-compose ps

# Should show:
# - hingecraft-postgres (healthy)
# - hingecraft-db-adaptor (running)
# - hingecraft-python-server (running)
```

### Step 2: Test Health Endpoint

```bash
# Test locally
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 3: Set Up Public Access

**Option A: ngrok (Quick)**
```bash
# Install ngrok if needed
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
```

**Option B: Deploy to Production**
```bash
# Push to GitHub first (see Git Push section below)
git push origin main

# Then deploy to Railway or Render
# Get production URL and use in Wix
```

### Step 4: Configure Wix External Database

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

### Step 5: Verify Field Names in Wix Code

**Check your Wix Velo code uses correct field names:**

```javascript
// ✅ Correct field names
const donation = {
    id: "...",
    amount: 50.00,
    currency: "USD",
    is_other_amount: true,
    created_at: "..."
};

// ❌ Wrong field names (will cause WDE0116)
const donation = {
    _id: "...",           // Wrong: use 'id'
    Amount: 50.00,        // Wrong: use 'amount'
    isOtherAmount: true,  // Wrong: use 'is_other_amount'
    dateCreated: "..."    // Wrong: use 'created_at'
};
```

### Step 6: Test Connection in Wix

**In Wix Velo Backend:**
```javascript
import { testConnection } from 'backend/hingecraft-api';

export async function testDbConnection() {
    const health = await testConnection();
    console.log('Connection status:', health);
    return health;
}
```

**In Wix Velo Frontend:**
```javascript
import { getLatestDonation } from 'backend/hingecraft-api';

$w.onReady(async function () {
    try {
        const donation = await getLatestDonation();
        console.log('Latest donation:', donation);
    } catch (error) {
        console.error('Error:', error);
    }
});
```

---

## 🚀 Git Push with Access Token

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Name:** `HingeCraft-Deployment`
4. **Expiration:** 90 days, 1 year, or no expiration
5. **Scopes:** Check **`repo`** (full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token** (starts with `ghp_`)

### Step 2: Push Using Script

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Option 1: Run script and enter token when prompted
./push-with-token.sh

# Option 2: Provide token as argument
./push-with-token.sh YOUR_TOKEN_HERE
```

### Step 3: Manual Push (Alternative)

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Set remote with token
git remote set-url origin https://YOUR_TOKEN@github.com/departments-commits/website-path-for-backend-contribution.git

# Stage all changes
git add .

# Commit
git commit -m "HingeCraft: Complete project export and WDE0116 fix"

# Push
git push -u origin main

# Remove token from URL (security)
git remote set-url origin https://github.com/departments-commits/website-path-for-backend-contribution.git
```

### Repository Information

- **Organization:** departments-commits
- **Repository:** website-path-for-backend-contribution
- **Branch:** main
- **Remote:** https://github.com/departments-commits/website-path-for-backend-contribution.git

---

## 📁 Complete File Structure

```
HingeCraft/
├── docker-compose.yml              # Docker services configuration
├── .env                            # Environment variables (not in git)
├── database-schema.sql              # PostgreSQL schema
├── database/
│   └── init.sql                    # Database initialization
├── database-adaptor/
│   ├── server.js                   # Express API server
│   ├── package.json                # Node.js dependencies
│   ├── Dockerfile                  # Docker image
│   └── README.md                   # API documentation
├── python-server/                  # Optional Python server
│   ├── main.py                     # FastAPI application
│   └── ...
├── velo-backend-api.js             # Wix backend API
├── payment-page-integration.js      # Payment page code
├── charter-page.html               # Charter page code
├── push-with-token.sh              # Git push script
├── AUTOMATE_WITH_TOKEN.sh          # Automated setup script
└── [Documentation Files]           # 50+ markdown files
```

---

## 🔐 Environment Variables

**Required in `.env` file:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=hingecraft_secure_password_123

# API
PORT=3000
SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
API_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
ADAPTOR_SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

# Wix
WIX_SITE_URL=https://www.hingecraft-global.ai
WEBHOOK_URL=https://www.wix.com/velo/reference/api-overview/introduction
WEBHOOK_SECRET=63e22733255b2953c56157238c167fb62b4c68f282f81b07c15b70aa766e2620

# External DB Endpoint (for Wix)
EXTERNAL_DB_ENDPOINT=http://localhost:3000
```

---

## 📊 API Endpoints Reference

### Health Check (No Auth)
```
GET /health
Response: {"status":"healthy","database":"connected","timestamp":"..."}
```

### Latest Donation (Auth Required)
```
GET /donations/latest
Headers: Authorization: Bearer {SECRET_KEY}
Response: {"id":"...","amount":50.00,"currency":"USD","is_other_amount":true,"created_at":"..."}
```

### Create Donation (Auth Required)
```
POST /donations
Headers: Authorization: Bearer {SECRET_KEY}
Body: {
  "amount": 50.00,
  "currency": "USD",
  "is_other_amount": true,
  "payment_status": "completed",
  "member_email": "user@example.com"
}
Response: {"id":"...","amount":50.00,"created_at":"..."}
```

### List Donations (Auth Required)
```
GET /donations?limit=100&offset=0
Headers: Authorization: Bearer {SECRET_KEY}
Response: {"donations":[...],"total":10,"limit":100,"offset":0}
```

### Export Database (Auth Required)
```
GET /export/json
Headers: Authorization: Bearer {SECRET_KEY}
Response: {"timestamp":"...","donations":[...]}
```

---

## ✅ Complete Checklist

### Pre-Deployment
- [x] Docker services configured
- [x] Database schema created
- [x] API endpoints implemented
- [x] Wix integration code ready
- [x] Environment variables set
- [x] Documentation complete

### Deployment Steps
- [ ] Start Docker services: `docker-compose up -d`
- [ ] Verify health: `curl http://localhost:3000/health`
- [ ] Set up ngrok or deploy to production
- [ ] Configure Wix external database connection
- [ ] Test connection in Wix
- [ ] Verify field names match schema
- [ ] Test donation flow end-to-end

### Git Push
- [ ] Create GitHub Personal Access Token
- [ ] Run `./push-with-token.sh` or manual push
- [ ] Verify files on GitHub
- [ ] Remove token from remote URL (security)

### WDE0116 Fix
- [ ] Verify connection endpoint is accessible
- [ ] Check field names match database schema
- [ ] Avoid using `wixData.aggregate()` with external DB
- [ ] Use direct API calls instead
- [ ] Test connection in Wix Velo

---

## 🎯 Quick Reference

### Start Everything
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft
docker-compose up -d
ngrok http 3000
```

### Test Connection
```bash
curl http://localhost:3000/health
curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
     http://localhost:3000/donations/latest
```

### Push to GitHub
```bash
./push-with-token.sh YOUR_TOKEN
```

### Wix Configuration
- Connection Name: HingeCraftDonationsDB
- Endpoint URL: `https://multiracial-zavier-acculturative.ngrok-free.dev` or production URL
- Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

---

## 📝 Summary

**Status:** ✅ Complete project export ready

**Next Steps:**
1. Start Docker services
2. Set up ngrok or deploy to production
3. Configure Wix with correct endpoint URL
4. Verify field names in Wix code match database schema
5. Test connection and donation flow
6. Push changes to GitHub

**WDE0116 Solution:**
- Ensure connection endpoint is publicly accessible (ngrok or production)
- Verify field names match database schema exactly
- Use direct API calls instead of `wixData.aggregate()`
- Test connection before using in code

---

**Last Updated:** $(date)
**Project:** HingeCraft Global
**Version:** Complete Export v1.0














