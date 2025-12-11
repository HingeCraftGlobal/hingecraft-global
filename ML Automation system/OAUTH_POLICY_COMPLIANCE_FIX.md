# 🔒 OAuth 2.0 Policy Compliance Fix

**Error**: `Error 400: invalid_request - App doesn't comply with Google's OAuth 2.0 policy`

**Reference**: [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies#secure-response-handling)

---

## ⚠️ Issue: OAuth Consent Screen Configuration

The error indicates the app doesn't comply with Google's OAuth 2.0 policies. This typically means:

1. **OAuth Consent Screen not properly configured**
2. **App not in Testing mode** (for development)
3. **User email not added as test user**
4. **App verification required** (for production)

---

## ✅ Solution: Configure OAuth Consent Screen

### Step 1: Go to OAuth Consent Screen

1. Visit: https://console.cloud.google.com/apis/credentials/consent
2. Select your project
3. Click **"OAuth consent screen"** in the left menu

### Step 2: Configure App Information

**Required Fields**:
- **App name**: `HingeCraft ML Automation` (or your app name)
- **User support email**: Your email (e.g., `marketinghingecraft@gmail.com`)
- **Developer contact information**: Your email

**Optional but Recommended**:
- App logo (if you have one)
- App domain (if applicable)
- Privacy policy URL
- Terms of service URL

### Step 3: Set Publishing Status

**For Development/Testing**:
1. Set **Publishing status** to: **"Testing"**
2. Click **"SAVE AND CONTINUE"**

**For Production** (later):
- Must complete app verification
- Requires privacy policy and terms of service
- Must verify domain ownership

### Step 4: Add Test Users

**CRITICAL**: In Testing mode, you must add test users:

1. Scroll to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add your email: `marketinghingecraft@gmail.com`
4. Add any other emails that need access
5. Click **"ADD"**

**Note**: Only test users can authorize the app in Testing mode.

### Step 5: Configure Scopes

1. Go to **"Scopes"** tab
2. Verify all 7 scopes are listed:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.metadata`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

3. Click **"SAVE AND CONTINUE"**

### Step 6: Summary & Review

1. Review all settings
2. Click **"BACK TO DASHBOARD"**

---

## 🔍 Additional Requirements

### Redirect URI Validation

According to [Google's OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies#secure-response-handling):

- **Development**: `http://localhost` is allowed
- **Production**: Must use `https://` (HTTPS required)
- **Domain ownership**: Must own or be authorized to use the domain

**Current Configuration**:
- ✅ Using `http://localhost:7101/oauth2callback` (allowed for development)
- ✅ Redirect URI added to OAuth client

### App Verification (Production Only)

If you need to use this in production:
1. Complete OAuth consent screen configuration
2. Add privacy policy URL
3. Add terms of service URL
4. Submit for verification
5. Wait for Google's approval

**For now**: Use **Testing mode** for development.

---

## ✅ Verification Checklist

After configuring OAuth Consent Screen:

- [ ] App name set
- [ ] User support email set
- [ ] Publishing status: **Testing**
- [ ] Test users added (including `marketinghingecraft@gmail.com`)
- [ ] All 7 scopes configured
- [ ] Redirect URI: `http://localhost:7101/oauth2callback` added
- [ ] OAuth client ID matches: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`

---

## 🎯 After Configuration

1. **Wait 2-3 minutes** for changes to propagate
2. **Clear browser cache** (or use incognito mode)
3. **Retry OAuth**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
4. **Open the `authUrl`** in browser
5. **Sign in** and authorize

---

## 📋 Quick Reference

**OAuth Consent Screen**:
https://console.cloud.google.com/apis/credentials/consent

**OAuth Clients**:
https://console.cloud.google.com/apis/credentials

**Google OAuth 2.0 Policies**:
https://developers.google.com/identity/protocols/oauth2/policies

---

**Status**: ⚠️ **OAUTH CONSENT SCREEN NEEDS CONFIGURATION**  
**Action**: Configure OAuth consent screen and add test users
