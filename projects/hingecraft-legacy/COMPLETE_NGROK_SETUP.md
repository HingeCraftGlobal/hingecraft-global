# 🎯 Complete ngrok Setup for Wix Connection

## Current Status

- ✅ Docker Services: Running
- ✅ Database Adaptor: Healthy (http://localhost:3000)
- ⚠️ ngrok: Requires authentication

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Authenticate ngrok

**Option A: Use our setup script**
```bash
cd [PROJECT_ROOT]/HingeCraft
./SETUP_NGROK.sh
```

**Option B: Manual setup**
1. Sign up: https://dashboard.ngrok.com/signup
2. Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure: `ngrok config add-authtoken YOUR_AUTHTOKEN`

### Step 2: Start ngrok and Get URL

**Option A: Automated**
```bash
./START_NGROK_AND_GET_URL.sh
```

**Option B: Manual**
```bash
ngrok http 3000
# Then open: http://localhost:4040
# Copy the HTTPS URL
```

### Step 3: Configure Wix

Use these values in Wix Editor → Database → External Database:

| Setting | Value |
|---------|-------|
| **Connection Name** | `HingeCraftDonationsDB` |
| **Endpoint URL** | `https://multiracial-zavier-acculturative.ngrok-free.dev` |
| **Secret Key** | `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b` |

---

## 📋 Detailed Instructions

### 1. ngrok Authentication

ngrok requires a free account to create tunnels.

1. **Sign up** (free, no credit card):
   - Go to: https://dashboard.ngrok.com/signup
   - Create an account

2. **Get authtoken**:
   - Go to: https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your authtoken

3. **Configure ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

### 2. Start ngrok Tunnel

Once authenticated:

```bash
cd [PROJECT_ROOT]/HingeCraft
ngrok http 3000
```

This will:
- Create an HTTPS tunnel to `localhost:3000`
- Display the public URL
- Show web interface at http://localhost:4040

### 3. Get HTTPS URL

**From web interface:**
- Open: http://localhost:4040
- Look for the HTTPS URL (e.g., `https://multiracial-zavier-acculturative.ngrok-free.dev`)

**From command line:**
```bash
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

**Using our script:**
```bash
./GET_NGROK_URL.sh
```

### 4. Use in Wix

1. Go to Wix Editor
2. Navigate to: Database → External Database
3. Click: "Connect External Database"
4. Select: "Custom"
5. Enter:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: Your ngrok HTTPS URL
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
6. Click: "Test Connection"
7. If successful, click: "Save"

---

## ✅ Verification

### Check Docker Services
```bash
docker-compose ps
```

### Test Local Health
```bash
curl http://localhost:3000/health
```

### Test ngrok URL
```bash
curl https://multiracial-zavier-acculturative.ngrok-free.dev/health
```

---

## 🔧 Troubleshooting

### ngrok not starting
- Check authentication: `ngrok config check`
- Re-authenticate: `ngrok config add-authtoken YOUR_TOKEN`

### Can't get URL
- Check ngrok is running: `ps aux | grep ngrok`
- Check web interface: http://localhost:4040
- Check logs: `/tmp/ngrok.log`

### Connection fails in Wix
- Verify ngrok URL is HTTPS (not HTTP)
- Verify Docker services are running
- Test URL directly: `curl https://YOUR_URL/health`
- Check secret key matches

---

## 📝 Files Created

- `SETUP_NGROK.sh` - Interactive ngrok authentication setup
- `START_NGROK_AND_GET_URL.sh` - Automated ngrok start and URL retrieval
- `GET_NGROK_URL.sh` - Get ngrok URL from running instance
- `NGROK_SETUP_REQUIRED.md` - This guide

---

**Status**: ⏳ Waiting for ngrok authentication
**Next Step**: Run `./SETUP_NGROK.sh` or manually authenticate ngrok














