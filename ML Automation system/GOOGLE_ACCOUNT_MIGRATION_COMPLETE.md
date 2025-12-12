# 🔄 Complete Google Account Migration Guide

**New Account**: `marketinghingecraft@gmail.com`  
**Status**: ✅ **MIGRATION GUIDE READY**

---

## 📋 Required Google Cloud Console Setup

### 1. OAuth 2.0 Client ID Configuration

**Location**: https://console.cloud.google.com/apis/credentials

**Current Client ID**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`

**Required Settings**:
- **Application type**: Web application
- **Name**: HingeCraft ML Automation
- **Authorized redirect URIs**: 
  ```
  http://localhost:7101/oauth2callback
  ```
- **Authorized JavaScript origins**: (optional, not required for this setup)

---

### 2. OAuth Consent Screen Configuration

**Location**: https://console.cloud.google.com/apis/credentials/consent

#### App Information Tab:
- **App name**: HingeCraft ML Automation
- **User support email**: `marketinghingecraft@gmail.com`
- **App logo**: (optional)
- **Application home page**: (optional)
- **Application privacy policy link**: (optional)
- **Application terms of service link**: (optional)
- **Authorized domains**: (optional)
- **Developer contact information**: `marketinghingecraft@gmail.com`

#### Scopes Tab:
Add all 7 required scopes:

```
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.metadata
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
```

#### Test Users Tab:
**Publishing status**: Testing

Add test user:
- `marketinghingecraft@gmail.com`

**Note**: In Testing mode, only test users can authorize the app.

---

### 3. Required APIs (Enable All)

**Location**: https://console.cloud.google.com/apis/library

Enable these APIs:

1. **Gmail API**
   - URL: https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - Status: ✅ Must be enabled

2. **Google Sheets API**
   - URL: https://console.cloud.google.com/apis/library/sheets.googleapis.com
   - Status: ✅ Must be enabled

3. **Google Drive API**
   - URL: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Status: ✅ Must be enabled

4. **People API**
   - URL: https://console.cloud.google.com/apis/library/people.googleapis.com
   - Status: ✅ Must be enabled (required by Gmail)

5. **Cloud Resource Manager API**
   - URL: https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com
   - Status: ✅ Must be enabled (backend OAuth requirement)

---

## 🔑 Required Credentials from Google Cloud Console

### OAuth 2.0 Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find or create OAuth 2.0 Client ID
3. Copy:
   - **Client ID**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej` (or new one if creating)
   - **Client Secret**: (Click "Reset secret" if needed, copy immediately)

### Update in Code

File: `config/api_keys.js`

```javascript
google: {
  clientId: 'YOUR_CLIENT_ID_HERE',
  clientSecret: 'YOUR_CLIENT_SECRET_HERE',
  // ... rest of config
}
```

---

## 📧 Email Configuration

**Primary Account**: `marketinghingecraft@gmail.com`

**Email Settings** (in `config/api_keys.js`):
```javascript
email: {
  fromAddress: 'marketinghingecraft@gmail.com',  // Update if needed
  fromName: 'HingeCraft',
  replyTo: 'marketinghingecraft@gmail.com',     // Update if needed
}
```

---

## 🔐 Complete OAuth Scopes List

All 7 scopes required for the automation system:

### Gmail Scopes (3):
1. `https://www.googleapis.com/auth/gmail.send`
   - **Purpose**: Send email on behalf of the connected inbox
   
2. `https://www.googleapis.com/auth/gmail.modify`
   - **Purpose**: Modify and track threads, replies, opens, routing conditions
   
3. `https://www.googleapis.com/auth/gmail.metadata`
   - **Purpose**: Read inbox metadata for lead-status logic (no full read)

### Google Sheets Scope (1):
4. `https://www.googleapis.com/auth/spreadsheets`
   - **Purpose**: Full read/write to Sheets used for lead import, enrichment, validation

### Google Drive Scopes (3):
5. `https://www.googleapis.com/auth/drive.file`
   - **Purpose**: Create & manage ONLY files created by the automation system
   
6. `https://www.googleapis.com/auth/drive.readonly`
   - **Purpose**: Read uploaded CSV/XLSX lead files from Drive "drop folder"
   
7. `https://www.googleapis.com/auth/drive.metadata.readonly`
   - **Purpose**: View folder structure and metadata for Drive upload watcher

---

## 🔄 Redirect URI Configuration

**Redirect URI**: `http://localhost:7101/oauth2callback`

**Where to Add**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej`
3. Click "Edit"
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:7101/oauth2callback
   ```
5. Click "SAVE"

**Important**:
- ✅ Must be `http` (not `https`)
- ✅ Must be `localhost` (not `127.0.0.1`)
- ✅ No trailing slash
- ✅ Exact match required

---

## ✅ Google Compliance Checklist

### OAuth Client Configuration
- [ ] Application type: "Web application"
- [ ] Client ID created/verified
- [ ] Client Secret obtained
- [ ] Redirect URI added: `http://localhost:7101/oauth2callback`

### OAuth Consent Screen
- [ ] App name set: "HingeCraft ML Automation"
- [ ] User support email: `marketinghingecraft@gmail.com`
- [ ] Developer contact: `marketinghingecraft@gmail.com`
- [ ] Publishing status: "Testing"
- [ ] All 7 scopes added
- [ ] Test user added: `marketinghingecraft@gmail.com`

### APIs Enabled
- [ ] Gmail API enabled
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] People API enabled
- [ ] Cloud Resource Manager API enabled

### Code Configuration
- [ ] `config/api_keys.js` updated with Client ID
- [ ] `config/api_keys.js` updated with Client Secret
- [ ] `docker-compose.yml` has `OAUTH_REDIRECT_URI` set
- [ ] All email references updated to `marketinghingecraft@gmail.com`

---

## 🚀 Migration Steps

### Step 1: Update Google Cloud Console

1. **Sign in** to Google Cloud Console with `marketinghingecraft@gmail.com`
2. **Select or create** a Google Cloud Project
3. **Enable all 5 required APIs**
4. **Configure OAuth Consent Screen**:
   - Set to Testing mode
   - Add all 7 scopes
   - Add `marketinghingecraft@gmail.com` as test user
5. **Create/Update OAuth Client**:
   - Type: Web application
   - Add redirect URI: `http://localhost:7101/oauth2callback`
   - Copy Client ID and Client Secret

### Step 2: Update Code Configuration

1. **Update `config/api_keys.js`**:
   - Set `clientId` to new Client ID
   - Set `clientSecret` to new Client Secret
   - Update email addresses if needed

2. **Restart Docker**:
   ```bash
   docker-compose restart automation
   ```

### Step 3: Complete OAuth Authorization

1. **Sign into Google** with `marketinghingecraft@gmail.com`
2. **Get authorization URL**:
   ```bash
   curl http://localhost:7101/auth/google
   ```
3. **Open the `authUrl`** in browser
4. **Click "Allow"** to grant permissions
5. **Verify** redirect to callback URL

---

## 📊 Current System Configuration

### Redirect URI
- **Code**: `http://localhost:7101/oauth2callback`
- **Docker**: `OAUTH_REDIRECT_URI=http://localhost:7101/oauth2callback`
- **Google Cloud Console**: Must match exactly

### Client ID Format
- **Current**: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej` (without `.apps` suffix)
- **Both formats work**: With or without `.apps.googleusercontent.com` suffix

### Account
- **Primary**: `marketinghingecraft@gmail.com`
- **Test User**: `marketinghingecraft@gmail.com`

---

## 🔍 Verification Commands

### Check Current Configuration:
```bash
docker-compose exec automation node -e "const c=require('./config/api_keys'); console.log('Client ID:', c.google.clientId); console.log('Client Secret:', c.google.clientSecret ? 'SET' : 'MISSING');"
```

### Check Redirect URI:
```bash
docker-compose exec automation printenv OAUTH_REDIRECT_URI
```

### Test OAuth Flow:
```bash
curl http://localhost:7101/auth/google
```

---

## 📝 Quick Reference

**Google Cloud Console Links**:
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent
- APIs Library: https://console.cloud.google.com/apis/library

**Required Data from Google**:
1. OAuth Client ID
2. OAuth Client Secret
3. All 7 scopes configured
4. Redirect URI: `http://localhost:7101/oauth2callback`
5. Test user: `marketinghingecraft@gmail.com`

**System Files to Update**:
1. `config/api_keys.js` - Client ID, Secret, email addresses
2. `docker-compose.yml` - Already configured correctly
3. All documentation files - Updated to use `marketinghingecraft@gmail.com`

---

**Status**: ✅ **MIGRATION GUIDE COMPLETE**  
**Next Step**: Update Google Cloud Console with `marketinghingecraft@gmail.com` account
