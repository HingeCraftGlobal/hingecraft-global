# 🔧 OAuth Testing Mode Required - Critical Fix

**Error**: `Error 400: invalid_request - App doesn't comply with Google's OAuth 2.0 policy`  
**Issue**: App is NOT in Testing mode (or incorrectly configured)  
**Status**: ⚠️ **MUST BE IN TESTING MODE FOR LOCALHOST**

---

## 🔍 Critical Issue

According to [Google's OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation):

> **Redirect URIs must use the HTTPS scheme, not plain HTTP. Localhost URIs (including localhost IP address URIs) are exempt from this rule.**

**However**, this exemption **ONLY applies when the app is in Testing mode**. If your app is in Production mode, Google will reject `http://localhost` redirect URIs.

---

## ✅ Required Fix: Set App to Testing Mode

### Step 1: Go to OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Sign in with `marketinghingecraft@gmail.com`
3. Select your project

### Step 2: Set Publishing Status to Testing

1. Click **"Audience"** tab (or look for "Publishing status")
2. Under **"Publishing status"**, you should see:
   - **"Testing"** (correct for localhost)
   - **"In production"** (WRONG - will cause this error)
3. **If it says "In production"**:
   - Click **"BACK TO TESTING"** or **"PUBLISHING STATUS"** → **"TESTING"**
   - This will change it back to Testing mode
4. Click **"SAVE"**

### Step 3: Verify Test Users

1. Still in the **"Audience"** tab (or **"Test users"** tab)
2. Under **"Test users"**, verify:
   - `marketinghingecraft@gmail.com` is listed
3. If not listed:
   - Click **"+ ADD USERS"**
   - Add: `marketinghingecraft@gmail.com`
   - Click **"ADD"**
4. Click **"SAVE"**

### Step 4: Complete OAuth Consent Screen

1. Click **"Edit App"** or navigate through all tabs
2. **App information** tab:
   - App name: `HingeCraft ML Automation` ✅
   - User support email: `marketinghingecraft@gmail.com` ✅
   - Developer contact: `marketinghingecraft@gmail.com` ✅
   - Click **"SAVE AND CONTINUE"**
3. **Scopes** tab:
   - Verify all 7 scopes are listed
   - Click **"SAVE AND CONTINUE"**
4. **Test users** tab:
   - Publishing status: **Testing** ✅
   - Test users: `marketinghingecraft@gmail.com` ✅
   - Click **"SAVE"**

---

## ⚠️ Why Testing Mode is Required

According to Google's OAuth 2.0 Policies:

> **"Use secure JavaScript origins and redirect URIs"**
> 
> OAuth 2.0 clients for web apps must use redirect URIs and JavaScript origins that are compliant with Google's validation rules, **including using the HTTPS scheme**. Google may reject OAuth requests that don't originate from or resolve to a secure context.

**Exception for Testing Mode**:
- Localhost (`http://localhost`) is **exempt** from HTTPS requirement
- But **ONLY** when app is in **Testing mode**
- Production mode **requires HTTPS** with verified domain

---

## 🔍 Verification Checklist

### OAuth Consent Screen:
- [ ] **Publishing status**: **Testing** (NOT "In production")
- [ ] **Test users**: `marketinghingecraft@gmail.com` added
- [ ] **App name**: `HingeCraft ML Automation` (filled)
- [ ] **User support email**: `marketinghingecraft@gmail.com` (filled)
- [ ] **Developer contact**: `marketinghingecraft@gmail.com` (filled)
- [ ] **All 7 scopes**: Listed in Scopes tab

### OAuth Client:
- [ ] **Application type**: Web application
- [ ] **Redirect URI**: `http://localhost:7101/oauth2callback` (added)
- [ ] **JavaScript origins**: `http://localhost:7101` (optional but recommended)

---

## 🚀 Step-by-Step Fix Procedure

### Step 1: Change Publishing Status to Testing

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Audience"** tab
3. Look for **"Publishing status"**
4. **If it says "In production"**:
   - Click **"BACK TO TESTING"** button
   - OR click **"PUBLISHING STATUS"** dropdown → Select **"Testing"**
5. **Verify** it now says **"Testing"**
6. Click **"SAVE"**

### Step 2: Add Test User (If Not Added)

1. In the same **"Audience"** tab, scroll to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add: `marketinghingecraft@gmail.com`
4. Click **"ADD"**
5. Click **"SAVE"**

### Step 3: Verify All Settings

1. **App information** tab:
   - All required fields filled ✅
2. **Scopes** tab:
   - All 7 scopes listed ✅
3. **Test users** tab:
   - Publishing status: **Testing** ✅
   - Test user added ✅

### Step 4: Wait for Propagation

- **Wait 3-5 minutes** after changing to Testing mode
- Google's systems need time to update

### Step 5: Clear Browser Cache

- Use **incognito/private mode** OR
- Clear browser cache and cookies
- Sign out and sign back into Google

### Step 6: Retry OAuth Authorization

1. **Sign into Google** with `marketinghingecraft@gmail.com`
2. **Get authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Open the `authUrl`** in browser
4. **Should see OAuth consent screen** (not policy error)
5. **Complete authorization**

---

## 📊 Testing Mode vs Production Mode

### Testing Mode (Required for Localhost):
- ✅ Allows `http://localhost` redirect URIs
- ✅ Only test users can authorize
- ✅ No verification required
- ✅ Refresh tokens expire in 7 days (unless only basic scopes)

### Production Mode (Requires HTTPS):
- ❌ Does NOT allow `http://localhost` redirect URIs
- ❌ Requires HTTPS redirect URIs
- ❌ Requires verified domain
- ❌ May require app verification for sensitive scopes
- ✅ Any user can authorize

**Current Requirement**: Must be in **Testing mode** to use `http://localhost:7101/oauth2callback`

---

## 🔍 How to Check Current Status

### In Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Audience"** tab
3. Look at **"Publishing status"**:
   - Should say: **"Testing"**
   - If it says: **"In production"** → This is the problem!

### Visual Indicators:

- **Testing mode**: Shows "Testing" badge, test users section visible
- **Production mode**: Shows "In production" badge, may show verification status

---

## ⚠️ Common Mistakes

### Mistake 1: Accidentally Set to Production
- **Fix**: Change back to Testing mode
- **Location**: OAuth Consent Screen → Audience tab

### Mistake 2: Test User Not Added
- **Fix**: Add `marketinghingecraft@gmail.com` to test users
- **Location**: OAuth Consent Screen → Test users tab

### Mistake 3: Incomplete OAuth Consent Screen
- **Fix**: Fill in all required fields
- **Location**: OAuth Consent Screen → App information tab

---

## ✅ Complete Fix Checklist

### OAuth Consent Screen:
- [ ] Publishing status: **Testing** (NOT Production)
- [ ] Test user: `marketinghingecraft@gmail.com` added
- [ ] App name: `HingeCraft ML Automation` (filled)
- [ ] User support email: `marketinghingecraft@gmail.com` (filled)
- [ ] Developer contact: `marketinghingecraft@gmail.com` (filled)
- [ ] All 7 scopes: Listed

### OAuth Client:
- [ ] Application type: Web application
- [ ] Redirect URI: `http://localhost:7101/oauth2callback`
- [ ] JavaScript origins: `http://localhost:7101` (optional)

### After Changes:
- [ ] Waited 3-5 minutes for propagation
- [ ] Cleared browser cache
- [ ] Retried OAuth authorization

---

## 🎯 Quick Fix Summary

**The Problem**: App is in Production mode, but localhost requires Testing mode

**The Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Audience"** tab
3. Change **"Publishing status"** from **"In production"** to **"Testing"**
4. Add test user: `marketinghingecraft@gmail.com`
5. Click **"SAVE"**
6. Wait 3-5 minutes
7. Retry OAuth authorization

---

## 📚 Reference

According to [Google's OAuth 2.0 Web Server documentation](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation):

> **Redirect URI validation rules:**
> - Redirect URIs must use the HTTPS scheme, not plain HTTP
> - **Localhost URIs (including localhost IP address URIs) are exempt from this rule**

This exemption **only applies in Testing mode**. Production mode requires HTTPS.

---

**Status**: ⚠️ **MUST CHANGE TO TESTING MODE**  
**Action**: Set OAuth Consent Screen publishing status to "Testing" in Google Cloud Console
