# Wix Connection Troubleshooting - Complete Guide

## 🔍 Current Connection Configuration

### Wix Database Connection Settings

**Connection Name:**
```
HingeCraftDonationsDB
```

**Endpoint URL:**
```
http://localhost:3000
```
*⚠️ Important: Use `http://` (NOT `https://`) for localhost*

**Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## ❌ Common Connection Issues

### Issue 1: "Unable to Connect" from Wix

**Possible Causes:**

1. **Docker services not running**
   - Solution: Start Docker services
   ```bash
   cd [PROJECT_ROOT]/HingeCraft
   docker-compose up -d
   ```

2. **Wrong endpoint URL format**
   - ❌ Wrong: `https://localhost:3000`
   - ✅ Correct: `http://localhost:3000`
   - Note: Wix cannot access `localhost` from the cloud - you need a tunnel or production URL

3. **Wix cannot access localhost**
   - Wix runs in the cloud, so `localhost` won't work directly
   - Solutions:
     - Use ngrok tunnel: `ngrok http 3000`
     - Deploy to Railway/Render and use production URL
     - Use Wix Dev Mode (if available)

4. **Service not responding**
   - Check if service is running: `docker-compose ps`
   - Check health: `curl http://localhost:3000/health`
   - Check logs: `docker-compose logs db-adaptor`

5. **Secret key mismatch**
   - Verify secret key in Wix matches `.env` file
   - Current key: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## ✅ Step-by-Step Connection Fix

### Step 1: Verify Docker Services Are Running

```bash
cd [PROJECT_ROOT]/HingeCraft

# Check Docker is running
docker info

# Start services
docker-compose up -d

# Check status
docker-compose ps

# Should show:
# - hingecraft-postgres (healthy)
# - hingecraft-db-adaptor (running)
# - hingecraft-python-server (running)
```

### Step 2: Test Health Endpoint Locally

```bash
# Test health endpoint (no auth required)
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 3: Test with Authentication

```bash
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Test latest donation endpoint
curl -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest
```

### Step 4: Set Up Tunnel for Wix (If Using Localhost)

Since Wix runs in the cloud, you need a tunnel to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the ngrok URL in Wix (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
```

**Then in Wix:**
- Endpoint URL: `https://multiracial-zavier-acculturative.ngrok-free.dev` (use the ngrok HTTPS URL)

### Step 5: Verify Wix Configuration

In Wix Editor:
1. Go to **Database** → **External Database**
2. Click **"Connect External Database"**
3. Select **"Custom"**
4. Enter:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: 
     - Local with tunnel: `https://multiracial-zavier-acculturative.ngrok-free.dev`
     - Production: `https://your-deployed-url.com`
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
5. Click **"Test Connection"**

---

## 🔧 Quick Fixes

### Fix 1: Restart Services

```bash
cd [PROJECT_ROOT]/HingeCraft
docker-compose restart
```

### Fix 2: Check Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs db-adaptor
docker-compose logs postgres
```

### Fix 3: Verify Environment Variables

```bash
# Check .env file has correct values
cat .env | grep ADAPTOR_SECRET_KEY
cat .env | grep EXTERNAL_DB_ENDPOINT
```

### Fix 4: Rebuild Services

```bash
docker-compose down
docker-compose up -d --build
```

---

## 🌐 Production Deployment (Recommended)

For production use, deploy to Railway/Render:

### Deploy to Railway

1. **Push to GitHub**
2. **Go to Railway**: https://railway.app
3. **Deploy from GitHub**
4. **Get production URL** (e.g., `https://hingecraft-api.railway.app`)
5. **Use in Wix**:
   - Endpoint URL: `https://hingecraft-api.railway.app`
   - Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

---

## 📋 Connection Checklist

Before testing in Wix:

- [ ] Docker Desktop is running
- [ ] Services are started: `docker-compose ps`
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] Secret key matches in `.env` and Wix
- [ ] Endpoint URL is correct (http:// for localhost, https:// for production)
- [ ] If using localhost, tunnel is set up (ngrok)
- [ ] Connection name is correct: `HingeCraftDonationsDB`

---

## 🧪 Test Connection Script

```bash
#!/bin/bash
# Test Wix connection

ENDPOINT="http://localhost:3000"
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo "Testing health endpoint..."
curl -s "$ENDPOINT/health" | jq .

echo ""
echo "Testing authenticated endpoint..."
curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     "$ENDPOINT/donations/latest" | jq .
```

---

## ✅ Correct Configuration Summary

| Setting | Value |
|---------|-------|
| **Connection Name** | `HingeCraftDonationsDB` |
| **Endpoint URL (Local)** | `http://localhost:3000` |
| **Endpoint URL (With Tunnel)** | `https://multiracial-zavier-acculturative.ngrok-free.dev` |
| **Endpoint URL (Production)** | `https://your-deployed-url.com` |
| **Secret Key** | `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b` |

---

**Status**: Ready for troubleshooting
**Last Updated**: 2025-11-29














