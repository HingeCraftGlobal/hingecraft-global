# 📋 Exact OAuth Scopes List - Copy & Paste

**Status**: Verification not required (Testing mode is fine)

---

## ✅ All 7 Required OAuth Scopes

Copy these **EXACT** scope URLs into your Google Cloud Console OAuth Consent Screen:

### 🔵 Gmail Scopes (3):

```
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.metadata
```

### 🟢 Google Sheets Scope (1):

```
https://www.googleapis.com/auth/spreadsheets
```

### 🟡 Google Drive Scopes (3):

```
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
```

---

## 📝 How to Add Scopes in Google Cloud Console

### Step 1: Go to OAuth Consent Screen

1. Visit: https://console.cloud.google.com/apis/credentials/consent
2. Select your project
3. Click **"Scopes"** tab

### Step 2: Add Scopes

1. Click **"+ ADD OR REMOVE SCOPES"**
2. In the search box, search for each scope one by one
3. Check the box next to each scope
4. Click **"UPDATE"**

### Step 3: Verify All 7 Are Listed

After adding, you should see all 7 scopes in the list:

1. ✅ `https://www.googleapis.com/auth/gmail.send`
2. ✅ `https://www.googleapis.com/auth/gmail.modify`
3. ✅ `https://www.googleapis.com/auth/gmail.metadata`
4. ✅ `https://www.googleapis.com/auth/spreadsheets`
5. ✅ `https://www.googleapis.com/auth/drive.file`
6. ✅ `https://www.googleapis.com/auth/drive.readonly`
7. ✅ `https://www.googleapis.com/auth/drive.metadata.readonly`

---

## 🔍 Quick Search Terms

When searching in Google Cloud Console, use these terms:

- **Gmail**: Search "gmail" → Select all 3 Gmail scopes
- **Sheets**: Search "spreadsheets" → Select `spreadsheets`
- **Drive**: Search "drive" → Select all 3 Drive scopes

---

## ⚠️ Important Notes

1. **Exact Match Required**: Copy the scope URLs exactly as shown above
2. **No Trailing Slashes**: Don't add `/` at the end
3. **Case Sensitive**: Must match exactly
4. **All 7 Required**: Missing any scope will cause authorization to fail

---

## ✅ Verification

After adding scopes:

1. Click **"SAVE AND CONTINUE"**
2. Go to **"Test users"** tab
3. Add: `marketinghingecraft@gmail.com`
4. Set **Publishing status**: **"Testing"**
5. Save all changes
6. Wait 2-3 minutes
7. Retry OAuth authorization

---

**Status**: ✅ **SCOPES LISTED ABOVE - COPY TO GOOGLE CLOUD CONSOLE**
