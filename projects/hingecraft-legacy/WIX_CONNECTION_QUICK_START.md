# Wix External Database Connection - Quick Start Guide

## 🎯 Quick Steps to Connect

### 1. Go to Wix Database Settings
- **Wix Editor** → **Database** (left sidebar)
- Click **"External Database"** tab
- Click **"Connect External Database"** button

### 2. Select "Custom"
- Choose **"Custom"** option
- Click **"Next"**

### 3. Enter These EXACT Values

**Connection Name:**
```
HingeCraftDonationsDB
```

**Endpoint URL:**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```

**Secret Key:**
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

### 4. Test & Save
- Click **"Test Connection"**
- If successful, click **"Save"**

### 5. Refresh Schema (CRITICAL!)
- Go to **Content Manager** → **Collections**
- Find **"HingeCraftDonationsDB"**
- Click **"More Actions"** (three dots) → **"Refresh Schema"**

---

## ✅ That's It!

After these steps, the collection will be available and WDE0116 should be resolved.

---

## 🔍 Where to Find Database Settings

**Option 1:**
- Wix Editor → Left Sidebar → **"Database"** → **"External Database"** tab

**Option 2:**
- Wix Editor → **"Settings"** (gear icon) → **"Database"** → **"External Database"**

**Option 3:**
- Wix Editor → **"Content Manager"** → **"Collections"** → **"Connect External Database"** button

---

## ⚠️ Before Connecting

**Make sure:**
1. ✅ ngrok is running (`ngrok http 3000`)
2. ✅ Docker services are running (`docker-compose ps`)
3. ✅ API is accessible (test with curl)

---

**Need help?** See `WIX_CONNECT_EXTERNAL_DATABASE.md` for detailed instructions.














