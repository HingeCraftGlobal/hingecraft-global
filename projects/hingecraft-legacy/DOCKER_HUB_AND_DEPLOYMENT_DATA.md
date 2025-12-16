# Docker Hub and Deployment Data - Complete Reference

## 🐳 Docker Hub Information

### Docker Hub Account
- **Username**: `departmentsai`
- **Repository**: `departmentsai/wix`
- **Docker Hub URL**: https://hub.docker.com/u/departmentsai

### Docker Images on Docker Hub

#### 1. Database Adaptor Image
- **Image Name**: `departmentsai/wix-db-adaptor:latest`
- **Docker Hub URL**: https://hub.docker.com/r/departmentsai/wix-db-adaptor
- **Size**: ~205MB
- **Description**: Node.js/Express API for database adaptor
- **Port**: 3000

#### 2. Python Server Image
- **Image Name**: `departmentsai/wix-python-server:latest`
- **Docker Hub URL**: https://hub.docker.com/r/departmentsai/wix-python-server
- **Size**: ~270MB
- **Description**: Python FastAPI server
- **Port**: 8000

### Pull Images from Docker Hub

```bash
# Pull Database Adaptor
docker pull departmentsai/wix-db-adaptor:latest

# Pull Python Server
docker pull departmentsai/wix-python-server:latest

# Pull PostgreSQL (base image)
docker pull postgres:15-alpine
```

---

## 🌐 Deployment Status

### Current Deployment Status

**Local Development:**
- ✅ Docker images built and available on Docker Hub
- ✅ Docker Compose configuration ready
- ✅ Local endpoint: `http://localhost:3000`

**Production Deployment:**
- ⏳ **Not yet deployed to cloud service**
- ⏳ **No production URL available yet**

### Deployment Options Available

#### Option 1: Railway (Recommended)
- **Status**: Ready to deploy
- **Guide**: See `RAILWAY_DEPLOY.md`
- **Expected URL Format**: `https://hingecraft-api.railway.app`
- **Steps**: 
  1. Push code to GitHub
  2. Connect Railway to GitHub repo
  3. Deploy
  4. Get Railway URL

#### Option 2: Render
- **Status**: Ready to deploy
- **Expected URL Format**: `https://hingecraft-api.onrender.com`
- **Steps**: Similar to Railway

#### Option 3: Fly.io
- **Status**: Ready to deploy
- **Expected URL Format**: `https://hingecraft-api.fly.dev`
- **Steps**: Deploy via Fly.io CLI

---

## 📋 Actual Configuration Values

### From .env File (Confirmed)

```env
# Docker Hub
DOCKER_USERNAME=departmentsai
DOCKER_REPOSITORY=departmentsai/wix

# Database Adaptor
ADAPTOR_SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
EXTERNAL_DB_ENDPOINT=http://localhost:3000

# Secret Keys
SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

### Database Connection Details

- **Connection Name**: `HingeCraftDonationsDB`
- **Local Endpoint**: `http://localhost:3000`
- **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🔍 How to Find Production URL

### If Deployed to Railway

1. **Login to Railway**: https://railway.app
2. **Go to your project**
3. **Click on API service**
4. **Go to Settings tab**
5. **Click "Generate Domain"** or view existing domain
6. **Copy the URL** (e.g., `https://hingecraft-api.railway.app`)

### If Deployed to Render

1. **Login to Render**: https://render.com
2. **Go to your service**
3. **View service details**
4. **Copy the URL** from service overview

### If Deployed to Fly.io

1. **Login to Fly.io**: https://fly.io
2. **Run**: `flyctl status`
3. **View URL** in output

---

## 📊 Current Status Summary

### ✅ What's Available

1. **Docker Images on Docker Hub**:
   - ✅ `departmentsai/wix-db-adaptor:latest`
   - ✅ `departmentsai/wix-python-server:latest`

2. **Local Development**:
   - ✅ Docker Compose ready
   - ✅ Local endpoint: `http://localhost:3000`
   - ✅ All configuration files ready

3. **Configuration Values**:
   - ✅ Connection Name: HingeCraftDonationsDB
   - ✅ Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
   - ✅ Local Endpoint: `http://localhost:3000`

### ⏳ What's Needed

1. **Production Deployment**:
   - ⏳ Deploy to Railway/Render/Fly.io
   - ⏳ Get production URL
   - ⏳ Update Wix configuration with production URL

2. **Production URL**:
   - ⏳ Not yet deployed
   - ⏳ Will be available after deployment

---

## 🚀 Next Steps to Get Production URL

### Deploy to Railway (Recommended)

1. **Push to GitHub** (if not already):
   ```bash
   cd [PROJECT_ROOT]/HingeCraft
   git push origin main
   ```

2. **Deploy to Railway**:
   - Go to https://railway.app
   - Create new project
   - Connect GitHub repo
   - Deploy
   - Get URL

3. **Update Wix**:
   - Use Railway URL in Wix External Database configuration
   - Update `payment-page-integration.js` with production URL

---

## 📝 Wix Configuration (Current)

### For Local Development

```
Connection Name: HingeCraftDonationsDB
Endpoint URL: http://localhost:3000
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

### For Production (After Deployment)

```
Connection Name: HingeCraftDonationsDB
Endpoint URL: https://your-production-url.com (to be determined)
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 🔗 Docker Hub Links

- **Account**: https://hub.docker.com/u/departmentsai
- **DB Adaptor**: https://hub.docker.com/r/departmentsai/wix-db-adaptor
- **Python Server**: https://hub.docker.com/r/departmentsai/wix-python-server

---

## ✅ Summary

**Docker Hub**: ✅ Images available
**Local Development**: ✅ Ready
**Production Deployment**: ⏳ Not yet deployed
**Production URL**: ⏳ To be determined after deployment

**Action Required**: Deploy to Railway/Render to get production URL

---

**Last Updated**: 2025-11-29
**Status**: Ready for deployment, awaiting production URL














