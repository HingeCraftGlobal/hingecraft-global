# 🔧 OAuth Testing Mode Setup - Complete Guide

**Status**: OAuth Consent Screen configured, but needs Testing mode setup

**Reference**: [Google OAuth App Branding](https://support.google.com/cloud/answer/15549049)

---

## ✅ Current Status

- ✅ OAuth Consent Screen: Configured
- ✅ Verification Status: "Verification not required" (for development)
- ⚠️ **Issue**: App may not be in Testing mode OR user not added as test user

---

## 🎯 Solution: Configure Testing Mode

### Step 1: Check Publishing Status

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Audience"** tab (or "Publishing status")
3. Verify **"User Type"** is set to:
   - ✅ **"External"** (for personal Google accounts)
   - OR **"Internal"** (if using Google Workspace)

### Step 2: Set Publishing Status to Testing

1. In the **"Publishing status"** section:
   - Set to: **"Testing"**
   - Click **"SAVE"**

**Important**: In Testing mode, only test users can authorize the app.

### Step 3: Add Test Users (CRITICAL)

1. Scroll to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add these emails (one per line):
   ```
   marketinghingecraft@gmail.com
   aiguardian01@gmail.com
   ```
4. Click **"ADD"**
5. Click **"SAVE"**

**Note**: Only emails listed as test users can authorize the app in Testing mode.

### Step 4: Verify Scopes Configuration

1. Go to **"Scopes"** tab
2. Verify all 7 scopes are listed:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.metadata`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

3. If any are missing, click **"+ ADD OR REMOVE SCOPES"**
4. Add the missing scopes
5. Click **"UPDATE"**

### Step 5: Verify App Information

1. Go to **"OAuth consent screen"** → **"App information"** tab
2. Verify:
   - **App name**: Set (e.g., "HingeCraft ML Automation")
   - **User support email**: `marketinghingecraft@gmail.com`
   - **Developer contact information**: Your email
3. Click **"SAVE AND CONTINUE"**

---

## 🔍 Verification Checklist

After configuration, verify:

- [ ] **Publishing status**: "Testing"
- [ ] **User type**: "External" (or "Internal" if Workspace)
- [ ] **Test users**: `marketinghingecraft@gmail.com` added
- [ ] **All 7 scopes**: Listed in Scopes tab
- [ ] **App name**: Set
- [ ] **Support email**: Set
- [ ] **Redirect URI**: `http://localhost:7101/oauth2callback` added to OAuth client

---

## ⚠️ Common Issues

### Issue: "App doesn't comply with OAuth 2.0 policy"

**Causes**:
1. App not in Testing mode
2. User email not in test users list
3. Scopes not properly configured

**Solution**:
- Set Publishing status to "Testing"
- Add user email to test users
- Verify all scopes are listed

### Issue: "Verification not required" but still getting errors

**Solution**:
- This is normal for development/testing
- Ensure app is in Testing mode
- Ensure test users are added
- Wait 2-3 minutes after changes

---

## 🎯 After Configuration

1. **Wait 2-3 minutes** for changes to propagate
2. **Clear browser cache** or use incognito mode
3. **Get fresh authUrl**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
4. **Open the `authUrl`** in browser
5. **Sign in** with `marketinghingecraft@gmail.com`
6. **Click "Allow"**

---

## 📋 Quick Reference Links

**OAuth Consent Screen**:
https://console.cloud.google.com/apis/credentials/consent

**OAuth Clients**:
https://console.cloud.google.com/apis/credentials

**Verification Center**:
https://console.cloud.google.com/apis/credentials/consent/verification

---

## ✅ Success Indicators

After proper configuration:
- ✅ No "policy compliance" errors
- ✅ OAuth authorization page shows app name
- ✅ User can click "Allow" successfully
- ✅ Redirects to callback successfully
- ✅ Tokens saved and system working

---

**Status**: ⚠️ **TESTING MODE CONFIGURATION REQUIRED**  
**Action**: Set to Testing mode and add test users


