# 🤖 Automation Guide - Wix Connection Setup

## 🚀 Quick Start (Choose One)

### Option 1: Fully Automated (with authtoken)
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# If you have your ngrok authtoken:
./AUTOMATE_WITH_TOKEN.sh YOUR_AUTHTOKEN

# Or set as environment variable:
export NGROK_AUTHTOKEN=your_token_here
./AUTOMATE_WITH_TOKEN.sh
```

### Option 2: Check & Auto (if already authenticated)
```bash
./AUTOMATE_ALL.sh
```
This will check if ngrok is authenticated and proceed automatically.

### Option 3: Interactive Setup
```bash
./SETUP_NGROK.sh
# Then:
./START_NGROK_AND_GET_URL.sh
```

---

## 📋 What Each Script Does

### `AUTOMATE_WITH_TOKEN.sh`
**Fully automated - requires authtoken**

1. ✅ Checks Docker services
2. ✅ Starts Docker if needed
3. ✅ Authenticates ngrok with provided token
4. ✅ Starts ngrok tunnel
5. ✅ Gets HTTPS URL
6. ✅ Tests connection
7. ✅ Saves configuration to `WIX_FINAL_CONFIG.txt`
8. ✅ Displays complete Wix configuration

**Usage:**
```bash
./AUTOMATE_WITH_TOKEN.sh YOUR_NGROK_AUTHTOKEN
```

### `AUTOMATE_ALL.sh`
**Semi-automated - checks authentication first**

1. ✅ Checks Docker services
2. ✅ Starts Docker if needed
3. ⚠️ Checks ngrok authentication
4. ✅ If authenticated: starts ngrok and gets URL
5. ⚠️ If not authenticated: provides setup instructions

**Usage:**
```bash
./AUTOMATE_ALL.sh
```

### `SETUP_NGROK.sh`
**Interactive ngrok authentication**

- Guides you through ngrok signup
- Helps you get authtoken
- Configures ngrok

**Usage:**
```bash
./SETUP_NGROK.sh
```

### `START_NGROK_AND_GET_URL.sh`
**Start ngrok and get URL (if authenticated)**

- Starts ngrok tunnel
- Gets HTTPS URL
- Displays Wix configuration

**Usage:**
```bash
./START_NGROK_AND_GET_URL.sh
```

---

## 🎯 Recommended Workflow

### First Time Setup:
```bash
# 1. Get your ngrok authtoken from:
#    https://dashboard.ngrok.com/get-started/your-authtoken

# 2. Run fully automated:
./AUTOMATE_WITH_TOKEN.sh YOUR_AUTHTOKEN
```

### Subsequent Runs (if already authenticated):
```bash
./AUTOMATE_ALL.sh
```

---

## 📝 Output Files

After successful automation, you'll get:

- **WIX_FINAL_CONFIG.txt** - Complete configuration ready to copy/paste
- **NGROK_URL.txt** - Just the HTTPS URL

---

## ✅ What Gets Automated

- ✅ Docker service health checks
- ✅ Docker service startup (if needed)
- ✅ ngrok authentication (with token)
- ✅ ngrok tunnel creation
- ✅ HTTPS URL retrieval
- ✅ Connection testing
- ✅ Configuration file generation
- ✅ Wix configuration display

---

## 🔧 Troubleshooting

### Script fails at authentication
- Verify your authtoken is correct
- Get a new token: https://dashboard.ngrok.com/get-started/your-authtoken

### Script can't get URL
- Check ngrok is running: `ps aux | grep ngrok`
- Check ngrok web interface: http://localhost:4040
- Check logs: `cat /tmp/ngrok.log`

### Docker services not starting
- Check Docker Desktop is running
- Run: `docker-compose up -d`
- Check logs: `docker-compose logs`

---

## 🎉 Success Output

When automation succeeds, you'll see:

```
✅ SUCCESS! ngrok URL obtained

========================================
  WIX CONFIGURATION - READY TO USE
========================================

Connection Name:
HingeCraftDonationsDB

Endpoint URL:
https://multiracial-zavier-acculturative.ngrok-free.dev

Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

✅ Connection test successful!
✅ Configuration saved to WIX_FINAL_CONFIG.txt
```

---

**Ready to automate?** Run `./AUTOMATE_WITH_TOKEN.sh YOUR_TOKEN` for full automation!














