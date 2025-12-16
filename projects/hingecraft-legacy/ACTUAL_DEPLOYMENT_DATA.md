# Actual Deployment Data - Complete Reference

## 🎯 Actual Values from Your Project

### Docker Hub Account (Confirmed)
- **Username**: `departmentsai`
- **Repository**: `departmentsai/wix`
- **Docker Hub Account URL**: https://hub.docker.com/u/departmentsai

### Docker Images (On Docker Hub)
1. **Database Adaptor**:
   - Image: `departmentsai/wix-db-adaptor:latest`
   - URL: https://hub.docker.com/r/departmentsai/wix-db-adaptor
   - Size: ~205MB
   - Port: 3000

2. **Python Server**:
   - Image: `departmentsai/wix-python-server:latest`
   - URL: https://hub.docker.com/r/departmentsai/wix-python-server
   - Size: ~270MB
   - Port: 8000

---

## 🔑 Actual Configuration Values (From .env)

### Database Adaptor Configuration
```
ADAPTOR_SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
EXTERNAL_DB_ENDPOINT=http://localhost:3000
```

### Secret Keys
```
SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

### Website URL
```
WIX_SITE_URL=https://www.hingecraft-global.ai
```

### Webhook Configuration
```
WEBHOOK_URL=https://www.wix.com/velo/reference/api-overview/introduction
```

---

## 📋 Wix Database Configuration (Actual Values)

### Connection Name
```
HingeCraftDonationsDB
```

### Endpoint URL

**For Local Development:**
```
http://localhost:3000
```

**For Production:**
```
⏳ NOT YET DEPLOYED
```
*Production URL will be available after deploying to Railway/Render/Fly.io*

### Secret Key
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 🌐 Deployment Status

### ✅ What's Deployed

1. **Docker Images on Docker Hub**:
   - ✅ `departmentsai/wix-db-adaptor:latest` - Available
   - ✅ `departmentsai/wix-python-server:latest` - Available

2. **Local Development**:
   - ✅ Docker Compose configuration ready
   - ✅ Local endpoint: `http://localhost:3000`
   - ✅ All services can run locally

### ⏳ What's NOT Deployed

1. **Production API**:
   - ⏳ Not yet deployed to Railway/Render/Fly.io
   - ⏳ No production URL available yet

2. **Production Endpoint**:
   - ⏳ Will be available after deployment
   - ⏳ Expected format: `https://hingecraft-api.railway.app` (if Railway)
   - ⏳ Or: `https://hingecraft-api.onrender.com` (if Render)

---

## 🚀 How to Get Production URL

### Option 1: Deploy to Railway (Recommended)

1. **Go to**: https://railway.app
2. **Login** with GitHub
3. **Create New Project**
4. **Deploy from GitHub** repo: `departments-commits/website-path-for-backend-contribution`
5. **Add PostgreSQL** database
6. **Get URL** from Railway dashboard
7. **Use URL** in Wix configuration

### Option 2: Deploy to Render

1. **Go to**: https://render.com
2. **Create New Web Service**
3. **Connect GitHub** repo
4. **Deploy**
5. **Get URL** from Render dashboard

### Option 3: Deploy to Fly.io

1. **Install Fly CLI**: `npm i -g flyctl`
2. **Login**: `flyctl auth login`
3. **Deploy**: `flyctl launch`
4. **Get URL** from Fly.io dashboard

---

## 📊 Complete Data Summary

### Docker Hub
- ✅ Account: `departmentsai`
- ✅ Images: 2 images available
- ✅ Repository: `departmentsai/wix`

### Configuration
- ✅ Connection Name: HingeCraftDonationsDB
- ✅ Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
- ✅ Local Endpoint: `http://localhost:3000`
- ✅ Website: `https://www.hingecraft-global.ai`

### Production
- ⏳ Production URL: **Not yet deployed**
- ⏳ Status: **Ready to deploy**
- ⏳ Action: **Deploy to Railway/Render to get production URL**

---

## ✅ For Wix Configuration RIGHT NOW

### Use These Values:

```
Connection Name: HingeCraftDonationsDB
Endpoint URL: http://localhost:3000 (for local testing)
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

**Note**: For production, you'll need to:
1. Deploy to Railway/Render
2. Get production URL
3. Update Wix configuration with production URL

---

## 🔗 Quick Links

- **Docker Hub**: https://hub.docker.com/u/departmentsai
- **DB Adaptor Image**: https://hub.docker.com/r/departmentsai/wix-db-adaptor
- **Python Server Image**: https://hub.docker.com/r/departmentsai/wix-python-server
- **Wix Site**: https://www.hingecraft-global.ai
- **Railway**: https://railway.app
- **Render**: https://render.com

---

**Last Updated**: 2025-11-29
**Status**: ✅ All local data confirmed, ⏳ Production deployment pending














