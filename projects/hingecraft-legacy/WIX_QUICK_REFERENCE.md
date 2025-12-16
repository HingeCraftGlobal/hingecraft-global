# 🎯 Wix Database Configuration - Quick Reference

## Copy These Values Directly Into Wix

---

## 📋 Wix External Database Connection Settings

When you see these 3 fields in Wix, use these exact values:

### **Field 1: Connection Name**
```
HingeCraftDonationsDB
```

### **Field 2: Endpoint URL**

**⚠️ REQUIRES HTTPS - localhost will NOT work!**

**For Local Development (with ngrok tunnel):**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```
*Get this by running: `ngrok http 3000`*

**For Production (Deployed):**
```
https://your-deployed-api-url.com
```
*(Replace with your actual production URL when deployed)*

**❌ DO NOT USE**: `http://localhost:3000` (Wix cannot access localhost)

### **Field 3: Secret Key (Database Adaptor Secret Key)**
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## ✅ Quick Setup Steps

1. **Go to Wix Editor** → **Database** → **External Database**
2. **Click**: "Connect External Database"
3. **Select**: "Custom"
4. **Enter the 3 values above**
5. **Click**: "Test Connection"
6. **If successful**: Click "Save"

---

## 📊 Summary Table

| Setting | Value |
|---------|-------|
| **Connection Name** | `HingeCraftDonationsDB` |
| **Endpoint URL (Local)** | `http://localhost:3000` |
| **Endpoint URL (Production)** | `https://your-deployed-api-url.com` |
| **Secret Key** | `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b` |

---

## 🔍 Where to Find These in Wix

1. **Login to Wix Editor**
2. **Click**: Database (left sidebar)
3. **Click**: External Database tab
4. **Click**: "Connect External Database" button
5. **Select**: "Custom" option
6. **Fill in the 3 fields** with values above

---

## 🧪 Test Connection

After saving, test the connection:

```bash
# From command line (verify API is running)
curl http://localhost:3000/health
```

Should return: `{"status":"healthy",...}`

---

**Ready to configure!** Copy the values above into Wix.

