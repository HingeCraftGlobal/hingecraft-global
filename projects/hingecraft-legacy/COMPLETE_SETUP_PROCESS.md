# HingeCraft Complete Setup Process

## 📋 Overview

This document provides the complete step-by-step process to set up HingeCraft with Docker Hub deployment and the full donation-to-charter page data flow.

---

## 🎯 Complete Data Flow

```
Payment Page ("Other" Amount)
    ↓
User enters amount (e.g., $50.00)
    ↓
payment-page-integration.js captures amount
    ↓
Stores in 3 locations:
    1. Wix Storage
    2. sessionStorage
    3. Database (via API)
    ↓
Redirects to Charter Page
    ↓
charter-page.html retrieves amount from:
    1. URL parameter (?donationAmount=50.00)
    2. Wix Storage
    3. sessionStorage
    4. Database API (latest donation)
    ↓
Displays amount below "Contribution" section
```

---

## 🔑 Required Credentials

You need to provide:
1. **Docker Hub Username** - Your Docker Hub account username
2. **Docker Personal Access Token** - Created Nov 27, 2025 (use this instead of password)
3. **Webhook URL** - (Optional) Your webhook endpoint URL
4. **Webhook Secret** - (Optional) Secret key for webhook authentication

---

## 📝 Step-by-Step Setup

### Phase 1: Environment Configuration

#### 1.1 Create .env File

```bash
cd [PROJECT_ROOT]/HingeCraft
cp .env.example .env
```

#### 1.2 Edit .env File

Open `.env` and configure with YOUR values:

```env
# Docker Hub Configuration
DOCKER_USERNAME=departmentsai
DOCKER_TOKEN=your_docker_personal_access_token_here
DOCKER_REPOSITORY=departmentsai/wix

# Database Configuration
DB_PASSWORD=generate_secure_password_here

# API Authentication (generate secure keys)
ADAPTOR_SECRET_KEY=generate_with_openssl_rand_hex_32
API_KEY=generate_with_openssl_rand_hex_32
SECRET_KEY=generate_with_openssl_rand_hex_32

# Webhook Configuration
WEBHOOK_URL=https://www.wix.com/velo/reference/api-overview/introduction
WEBHOOK_SECRET=63e22733255b2953c56157238c167fb62b4c68f282f81b07c15b70aa766e2620

# External Database Adaptor Endpoint
EXTERNAL_DB_ENDPOINT=http://localhost:3000
# For production: https://your-deployed-api-url.com
```

**Generate Secure Keys:**
```bash
# Run these commands to generate secure keys
openssl rand -hex 32  # Use for ADAPTOR_SECRET_KEY
openssl rand -hex 32  # Use for API_KEY
openssl rand -hex 32  # Use for SECRET_KEY
openssl rand -hex 32  # Use for WEBHOOK_SECRET
```

---

### Phase 2: Docker Hub Deployment

#### 2.1 Login to Docker Hub

```bash
docker login -u YOUR_DOCKER_USERNAME
# When prompted for password, enter your Personal Access Token
# (NOT your Docker Hub account password)
```

**Example:**
```bash
docker login -u departmentsai
# Password: [Enter your Personal Access Token from Nov 27, 2025]
```

#### 2.2 Deploy Images to Docker Hub

```bash
# Run the deployment script
./deploy-to-docker.sh

# Or specify a version tag
./deploy-to-docker.sh v1.0.0
```

This will:
- Build database adaptor image
- Build Python server image
- Tag images with version and latest
- Push all images to Docker Hub

#### 2.3 Verify Images on Docker Hub

Visit:
- `https://hub.docker.com/r/departmentsai/wix-db-adaptor`
- `https://hub.docker.com/r/departmentsai/wix-python-server`

---

### Phase 3: Local Services Setup

#### 3.1 Start Docker Services

```bash
docker-compose up -d
```

#### 3.2 Verify Services

```bash
# Check all services are running
docker-compose ps

# Should show:
# - hingecraft-postgres (healthy)
# - hingecraft-db-adaptor (running)
# - hingecraft-python-server (running)
```

#### 3.3 Test Health Endpoints

```bash
# Database Adaptor
curl http://localhost:3000/health

# Python Server
curl http://localhost:8000/api/v1/health
```

Both should return `{"status":"healthy",...}`

---

### Phase 4: Wix Configuration

#### 4.1 Configure Wix Secrets Manager

1. Go to **Wix Editor** → **Settings** → **Secrets Manager**
2. Click **"Add Secret"**
3. Add these secrets:

   **Secret 1:**
   - **Name:** `EXTERNAL_DB_ENDPOINT`
   - **Value:** `http://localhost:3000` (for local) or your production URL
   
   **Secret 2:**
   - **Name:** `EXTERNAL_DB_SECRET_KEY`
   - **Value:** Your `ADAPTOR_SECRET_KEY` from `.env` file

#### 4.2 Configure External Database Connection

1. Go to **Wix Editor** → **Database** → **External Database**
2. Click **"Connect External Database"**
3. Select **"Custom"**
4. Enter configuration:
   - **Connection Name: HingeCraftDonationsDB
   - **Endpoint URL:** `http://localhost:3000` (or production URL)
   - **Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
5. Click **"Test Connection"**
6. If successful, click **"Save"**

#### 4.3 Update velo-backend-api.js

The file `velo-backend-api.js` is already configured to use Wix Secrets Manager. It will automatically load:
- `EXTERNAL_DB_ENDPOINT` from secrets
- `EXTERNAL_DB_SECRET_KEY` from secrets

No code changes needed if secrets are configured correctly.

---

### Phase 5: Payment Page Integration

#### 5.1 Add Payment Page Code

1. Go to your **Payment Page** in Wix Editor
2. Add **Custom Code** element (or use Code Panel)
3. Open `payment-page-integration.js`
4. Update these values in the code:

```javascript
const CONFIG = {
  // Update to your API endpoint
  API_ENDPOINT: 'http://localhost:3000', // or production URL
  
  // Update to match your ADAPTOR_SECRET_KEY from .env
  SECRET_KEY: 'your_secret_key_here',
  
  // Update to your charter page URL
  CHARTER_PAGE_URL: '/charter',
};
```

5. Paste the updated code into your payment page
6. Ensure your "Other" amount input field has one of these:
   - `id="other-amount"`
   - `name="otherAmount"`
   - Or update the selector in the code

#### 5.2 Test Payment Page

1. Navigate to payment page
2. Select "Other" amount option
3. Enter an amount (e.g., $50.00)
4. Open browser console (F12)
5. Submit payment
6. Check console for:
   - "Stored in Wix Storage: ..."
   - "Stored in sessionStorage: ..."
   - "Donation saved to database: ..."

---

### Phase 6: Charter Page Verification

#### 6.1 Verify Charter Page Code

The `charter-page.html` file already includes code to:
1. Retrieve donation amount from URL parameter
2. Retrieve from Wix Storage
3. Retrieve from sessionStorage
4. Retrieve from database API (latest donation)
5. Display amount below "Contribution" section

#### 6.2 Test Charter Page Display

1. Navigate directly to charter page with amount:
   - `/charter?donationAmount=50.00`
2. Verify amount displays below "Contribution"
3. Check browser console for any errors

---

### Phase 7: Complete Flow Test

#### 7.1 End-to-End Test

1. **Start at Payment Page:**
   - Navigate to payment page
   - Select "Other" amount
   - Enter: $50.00
   - Submit payment

2. **Verify Storage:**
   - Check browser console
   - Should see: "Stored in Wix Storage", "Stored in sessionStorage", "Donation saved to database"

3. **Verify Redirect:**
   - Should redirect to: `/charter?donationAmount=50.00`

4. **Verify Display:**
   - Charter page should show: "Donation Amount: $50.00" below "Contribution"

5. **Verify Database:**
   ```bash
   curl -X GET http://localhost:3000/donations/latest \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "X-API-Key: YOUR_SECRET_KEY"
   ```
   Should return the donation with amount: 50.00

---

## 🔍 Verification Commands

### Check Services
```bash
docker-compose ps
docker-compose logs -f
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Create donation
curl -X POST http://localhost:3000/donations \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "X-API-Key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.00, "is_other_amount": true}'

# Get latest donation
curl -X GET http://localhost:3000/donations/latest \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "X-API-Key: YOUR_SECRET_KEY"

# Export database
curl -X GET http://localhost:3000/export/json \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "X-API-Key: YOUR_SECRET_KEY"
```

### Check Database
```bash
# Connect to PostgreSQL
docker exec -it hingecraft-postgres psql -U hingecraft_user -d hingecraft_db

# Query donations
SELECT * FROM donations ORDER BY created_at DESC LIMIT 5;
```

---

## 🐛 Troubleshooting

### Issue: Docker Login Fails
**Solution:** 
- Use Personal Access Token, NOT password
- Token created: Nov 27, 2025
- Never expires

### Issue: Images Won't Push
**Solution:**
- Verify Docker Hub repository exists
- Check you have write permissions
- Verify token is correct

### Issue: Services Won't Start
**Solution:**
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### Issue: Database Connection Fails
**Solution:**
- Check `.env` file has correct `DB_PASSWORD`
- Verify PostgreSQL is running: `docker-compose ps postgres`
- Check network: `docker network ls`

### Issue: Donation Amount Not Displaying
**Solution:**
1. Check browser console (F12) for errors
2. Verify API endpoint is accessible
3. Check secret keys match in Wix and `.env`
4. Verify payment page code is running
5. Check database has the donation:
   ```bash
   curl -X GET http://localhost:3000/donations/latest \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "X-API-Key: YOUR_SECRET_KEY"
   ```

### Issue: Payment Page Not Capturing Amount
**Solution:**
1. Check browser console for errors
2. Verify "Other" amount input selector matches code
3. Update selector in `payment-page-integration.js` if needed
4. Verify API endpoint URL is correct
5. Check secret key matches

---

## 📊 Files Created/Updated

### New Files:
1. ✅ `.env.example` - Environment variables template
2. ✅ `DOCKER_DEPLOYMENT_COMPLETE.md` - Complete deployment guide
3. ✅ `deploy-to-docker.sh` - Automated deployment script
4. ✅ `payment-page-integration.js` - Payment page code (updated)
5. ✅ `QUICK_START_DEPLOYMENT.md` - Quick start guide
6. ✅ `COMPLETE_SETUP_PROCESS.md` - This file

### Updated Files:
1. ✅ `database-adaptor/server.js` - Added webhook endpoint
2. ✅ `docker-compose.yml` - Already configured

---

## ✅ Final Checklist

Before going live, verify:

- [ ] `.env` file created and configured
- [ ] Docker Hub credentials set in `.env`
- [ ] Secure keys generated (use `openssl rand -hex 32`)
- [ ] Docker images built and pushed
- [ ] Services running locally: `docker-compose ps`
- [ ] Health checks passing
- [ ] Wix Secrets Manager configured
- [ ] Wix External Database connected
- [ ] Payment page code added and configured
- [ ] Charter page code verified
- [ ] Test donation flow works end-to-end
- [ ] Donation amount displays on charter page
- [ ] Database export works
- [ ] Database share works

---

## 🚀 Next Steps

1. **Configure `.env`** with your Docker Hub credentials
2. **Run deployment script:** `./deploy-to-docker.sh`
3. **Start services:** `docker-compose up -d`
4. **Configure Wix** (Secrets Manager + External Database)
5. **Add payment page code** to Wix
6. **Test complete flow**

---

## 📞 Support

If you encounter issues:
1. Check Docker logs: `docker-compose logs`
2. Check browser console (F12)
3. Verify environment variables: `cat .env`
4. Test API endpoints with curl commands above
5. Check Wix backend logs in Wix Editor

---

**Status:** ✅ Complete Setup Process Ready

**Your Docker Credentials:**
- Username: `departmentsai`
- Repository: `departmentsai/wix`
- Personal Access Token: [Created Nov 27, 2025 - Never expires - Enter in .env file]
- Webhook URL: `https://www.wix.com/velo/reference/api-overview/introduction`

**Auto-Generated Secure Keys:**
- Database Password: `bf0d1ab9a94bfdb34634e7d2d1672569e90ce20a62e66b813182d9ae5daf61cf`
- API Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
- Webhook Secret: `63e22733255b2953c56157238c167fb62b4c68f282f81b07c15b70aa766e2620`

**Ready to proceed!** 🎉

