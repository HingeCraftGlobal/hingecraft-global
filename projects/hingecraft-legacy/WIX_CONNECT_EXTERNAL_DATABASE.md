# How to Connect External Database in Wix - Step by Step

## 🔧 Step 1: Access External Database Settings

1. **Login to Wix Editor**
2. **Click on "Database"** in the left sidebar (or go to **Settings** → **Database**)
3. **Click on "External Database"** tab (at the top)
4. **Click "Connect External Database"** button

---

## 🔧 Step 2: Select Custom Database Type

1. You'll see options for different database types
2. **Select "Custom"** (this is for custom database adaptors like ours)
3. Click **"Next"** or **"Continue"**

---

## 🔧 Step 3: Enter Connection Details

You'll see **3 fields** to fill in. Use these **EXACT values**:

### **Field 1: Connection Name**
```
HingeCraftDonationsDB
```

### **Field 2: Endpoint URL**
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```

**⚠️ IMPORTANT:** 
- Must be HTTPS (not http://localhost:3000)
- This is your ngrok URL
- If ngrok URL changed, update it here

### **Field 3: Secret Key (Database Adaptor Secret Key)**
```
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
```

---

## 🔧 Step 4: Test Connection

1. **Click "Test Connection"** button
2. **Wait for result:**
   - ✅ **Success:** You'll see "Connection successful" or similar
   - ❌ **Error:** Check the error message

**If connection fails:**
- Verify ngrok is running: `curl http://127.0.0.1:4040/api/tunnels`
- Test API directly: `curl -H "Authorization: Bearer YOUR_SECRET_KEY" https://YOUR_NGROK_URL/health`
- Check Docker services are running: `docker-compose ps`

---

## 🔧 Step 5: Save Connection

1. If test is successful, **click "Save"** or **"Connect"**
2. Wix will now create the external database collection
3. You should see **"HingeCraftDonationsDB"** appear in your Collections list

---

## 🔧 Step 6: Refresh Schema (CRITICAL!)

**After connecting, you MUST refresh the schema:**

1. Go to **Content Manager** → **Collections**
2. Find **"HingeCraftDonationsDB"** (should now be visible)
3. Click **"More Actions"** (three dots menu) next to the collection
4. Select **"Refresh Schema"**
   - This tells Wix to detect the Wix required columns (`_id`, `_createdDate`, `_updatedDate`, `_owner`)
   - **Without this, WDE0116 error will persist!**

---

## 🔧 Step 7: Verify Schema

After refreshing, verify the schema includes:

- ✅ `_id` field
- ✅ `_createdDate` field
- ✅ `_updatedDate` field
- ✅ `_owner` field
- ✅ `amount` field
- ✅ `currency` field
- ✅ Other donation fields

---

## 🔧 Step 8: Configure Permissions

1. Go to **Content Manager** → **Collections**
2. Click on **"HingeCraftDonationsDB"**
3. Go to **"Permissions & Privacy"** tab
4. Configure:
   - **Read:** Who can view (e.g., "Anyone")
   - **Write:** Who can create/update (e.g., "Anyone can submit" for forms)
   - **Owner:** Set owner permissions

---

## ✅ Verification Checklist

- [ ] External database connection created
- [ ] Connection test successful
- [ ] Collection "HingeCraftDonationsDB" visible in Collections
- [ ] Schema refreshed (Most Important!)
- [ ] Wix required fields visible in schema (`_id`, `_createdDate`, `_updatedDate`, `_owner`)
- [ ] Permissions configured

---

## 🐛 Troubleshooting

### "Connection Failed" Error

**Check:**
1. ngrok is running: `ngrok http 3000`
2. Docker services are running: `docker-compose ps`
3. API is accessible: Test with curl command above
4. Secret key is correct
5. Endpoint URL is correct (must be HTTPS)

### "Collection Not Found" After Connecting

**Solution:**
1. Wait a few seconds for Wix to sync
2. Refresh the page
3. Check Content Manager → Collections
4. If still not visible, try disconnecting and reconnecting

### "Schema Refresh Failed"

**Solution:**
1. Verify API returns Wix fields (run test script)
2. Check database has Wix columns
3. Try refreshing schema again
4. Check Wix error logs for specific error

---

## 📋 Quick Reference

**Connection Name:** `HingeCraftDonationsDB`

**Endpoint URL:** `https://multiracial-zavier-acculturative.ngrok-free.dev`

**Secret Key:** `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

**Last Updated:** $(date)














