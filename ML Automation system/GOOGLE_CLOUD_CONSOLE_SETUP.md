# 🔧 Complete Google Cloud Console Setup Guide

**Account**: `marketinghingecraft@gmail.com`  
**Status**: ✅ **SETUP GUIDE READY**

---

## 📋 All Required Data from Google Cloud Console

### 1. OAuth 2.0 Client ID & Secret

**Location**: https://console.cloud.google.com/apis/credentials

**Steps**:
1. Sign in with `marketinghingecraft@gmail.com`
2. Select or create a Google Cloud Project
3. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
4. Application type: **Web application**
5. Name: `HingeCraft ML Automation`
6. Authorized redirect URIs: `http://localhost:7101/oauth2callback`
7. Click "Create"
8. **Copy immediately**:
   - **Client ID**: (e.g., `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`)
   - **Client Secret**: (shown only once!)

**Update in Code**: `config/api_keys.js`
```javascript
google: {
  clientId: 'YOUR_CLIENT_ID_HERE',
  clientSecret: 'YOUR_CLIENT_SECRET_HERE',
}
```

---

### 2. OAuth Consent Screen Configuration

**Location**: https://console.cloud.google.com/apis/credentials/consent

#### App Information:
- **App name**: `HingeCraft ML Automation`
- **User support email**: `marketinghingecraft@gmail.com`
- **Developer contact information**: `marketinghingecraft@gmail.com`

#### Scopes:
Add all 7 scopes (copy-paste ready):

```
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.metadata
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
```

#### Test Users:
- **Publishing status**: Testing
- **Test users**: Add `marketinghingecraft@gmail.com`

---

### 3. Enable Required APIs

**Location**: https://console.cloud.google.com/apis/library

Enable all 5 APIs:

1. **Gmail API**
   - URL: https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - Click "Enable"

2. **Google Sheets API**
   - URL: https://console.cloud.google.com/apis/library/sheets.googleapis.com
   - Click "Enable"

3. **Google Drive API**
   - URL: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click "Enable"

4. **People API**
   - URL: https://console.cloud.google.com/apis/library/people.googleapis.com
   - Click "Enable"

5. **Cloud Resource Manager API**
   - URL: https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com
   - Click "Enable"

---

## 🔐 Redirect URI Configuration

**Redirect URI**: `http://localhost:7101/oauth2callback`

**Where to Configure**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click "Edit"
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:7101/oauth2callback
   ```
5. Click "SAVE"

**Critical Requirements**:
- ✅ Must be `http` (not `https`)
- ✅ Must be `localhost` (not `127.0.0.1`)
- ✅ No trailing slash
- ✅ Exact match (case-sensitive)

---

## 📧 Email Configuration

**Primary Account**: `marketinghingecraft@gmail.com`

**Current Configuration** (in `config/api_keys.js`):
```javascript
email: {
  fromAddress: 'marketinghingecraft@gmail.com',
  fromName: 'HingeCraft',
  replyTo: 'marketinghingecraft@gmail.com',
}
```

**Note**: Email addresses are configured to use `marketinghingecraft@gmail.com` for sending emails through Gmail API.

---

## ✅ Complete Setup Checklist

### Google Cloud Console:
- [ ] Signed in with `marketinghingecraft@gmail.com`
- [ ] Google Cloud Project selected/created
- [ ] Gmail API enabled
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] People API enabled
- [ ] Cloud Resource Manager API enabled
- [ ] OAuth Consent Screen configured:
  - [ ] App name set
  - [ ] User support email: `marketinghingecraft@gmail.com`
  - [ ] Developer contact: `marketinghingecraft@gmail.com`
  - [ ] Publishing status: Testing
  - [ ] All 7 scopes added
  - [ ] Test user: `marketinghingecraft@gmail.com` added
- [ ] OAuth Client ID created:
  - [ ] Application type: Web application
  - [ ] Redirect URI: `http://localhost:7101/oauth2callback` added
  - [ ] Client ID copied
  - [ ] Client Secret copied

### Code Configuration:
- [ ] `config/api_keys.js` updated with Client ID
- [ ] `config/api_keys.js` updated with Client Secret
- [ ] `docker-compose.yml` verified (already correct)
- [ ] All documentation updated to use `marketinghingecraft@gmail.com`

---

## 🚀 Quick Setup Steps

1. **Sign in** to Google Cloud Console: https://console.cloud.google.com
2. **Select project** or create new one
3. **Enable APIs** (all 5 listed above)
4. **Configure OAuth Consent Screen**:
   - Set to Testing
   - Add all 7 scopes
   - Add test user: `marketinghingecraft@gmail.com`
5. **Create OAuth Client**:
   - Type: Web application
   - Redirect URI: `http://localhost:7101/oauth2callback`
   - Copy Client ID and Secret
6. **Update `config/api_keys.js`** with credentials
7. **Restart Docker**: `docker-compose restart automation`
8. **Complete OAuth authorization**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
   Open the `authUrl` and authorize with `marketinghingecraft@gmail.com`

---

## 📊 Summary of Required Data

**From Google Cloud Console, you need**:

1. ✅ **OAuth Client ID**: (e.g., `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`)
2. ✅ **OAuth Client Secret**: (e.g., `4B9IiBGxsKK8zkBXtzqMREO2hXNe`)
3. ✅ **Redirect URI**: `http://localhost:7101/oauth2callback`
4. ✅ **All 7 scopes**: (listed above)
5. ✅ **Test user email**: `marketinghingecraft@gmail.com`

**All of this data is now documented and ready to configure!**

---

**Status**: ✅ **COMPLETE SETUP GUIDE READY**  
**Next Step**: Configure Google Cloud Console with `marketinghingecraft@gmail.com`
