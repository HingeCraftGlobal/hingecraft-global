# 🚀 Mission Support Page - Complete Wix Deployment Guide

**Date:** January 27, 2025  
**Status:** ✅ **READY FOR WIX EDITOR DEPLOYMENT**

---

## 📋 COMPLETE DEPLOYMENT STEPS

### Step 1: Create Mission Support Page in Wix Editor ✅

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Open your site: `hingecraft-global`
   - Or use Local Editor URL from wix dev

2. **Create New Page:**
   - Click **Pages** in left sidebar
   - Click **Add Page** → **Blank Page**
   - **Page Name:** `Mission Support`
   - **URL Slug:** `/mission-support` (or `/mission-support-form`)
   - Click **Done**

3. **Page is Created:**
   - Wix will automatically create: `src/pages/Mission Support.msup1.js`
   - The file is already created and synced ✅

---

### Step 2: Add HTML Element to Page ✅

1. **Add HTML Element:**
   - On the Mission Support page, click **+** (Add Element)
   - Go to **Embed** → **HTML iframe** (or **HTML Code**)
   - Drag it onto the page

2. **Configure HTML Element:**
   - **Element ID:** `missionSupportForm` (IMPORTANT!)
   - **HTML Code:** Copy entire content from `public/pages/mission-support-form.html`
   - Paste into the HTML element
   - **Width:** Full width (or 100%)
   - **Height:** Auto (or set minimum height: 800px)

3. **Save:**
   - Click **Save** in top right
   - Page is now ready!

---

### Step 3: Verify Backend Function ✅

1. **Open Velo Editor:**
   - In Wix Editor, click **Dev Mode** (top right)
   - Or go to: https://editor.wix.com/html/editor/web/renderer/edit/450f03ec-e8b6-4373-b1b4-5d44459a7e08

2. **Check Backend Function:**
   - Navigate to: `src/backend/hingecraft.api.web.jsw`
   - Verify `logMissionSupportIntent()` function exists
   - Function should be visible and ready

3. **Update Configuration (if needed):**
   - If using external database, update:
     - `EXTERNAL_DB_ENDPOINT`
     - `EXTERNAL_DB_SECRET_KEY`
   - If using Wix Database, ensure `USE_EXTERNAL_DB = false`

---

### Step 4: Test the Form ✅

1. **Preview Page:**
   - Click **Preview** in Wix Editor
   - Navigate to Mission Support page
   - Form should be visible

2. **Test Form Submission:**
   - Fill out form:
     - First Name: `Test`
     - Last Name: `User`
     - Email: `test@example.com`
     - Address: `123 Test St`
     - Mission Support Name: `Test Support` (optional)
     - Select amount: `$5` (or enter custom amount)
   - Click **Continue to Charter Page**

3. **Verify Redirect:**
   - Should redirect to Charter Page
   - Amount should display on Charter Page
   - Charter Page should redirect to Payment Page
   - Payment Page should pre-fill amount

4. **Check Backend Logs:**
   - Open Velo Console
   - Check for: `✅ Mission Support intent logged: [intentId]`
   - Verify no errors

---

### Step 5: Publish Page ✅

1. **Publish:**
   - Click **Publish** in top right
   - Select **Publish Site**
   - Page is now live!

2. **Verify Live:**
   - Visit: `https://www.hingecraft-global.ai/mission-support`
   - Form should be visible and functional

---

## 📁 FILES STRUCTURE

### Wix Page File ✅
**File:** `src/pages/Mission Support.msup1.js`
- ✅ SEO configuration
- ✅ Form loading function
- ✅ Backend integration
- ✅ Session tracking

### HTML Form File ✅
**File:** `public/pages/mission-support-form.html`
- ✅ Complete React form
- ✅ Validation
- ✅ Session persistence
- ✅ Redirect logic

### Backend Function ✅
**File:** `src/backend/hingecraft.api.web.jsw`
- ✅ `logMissionSupportIntent()` function
- ✅ Database integration
- ✅ Notion sync
- ✅ CRM tagging

---

## 🔧 TROUBLESHOOTING

### Form Not Showing?
- ✅ Check HTML element ID is `missionSupportForm`
- ✅ Verify HTML content is pasted correctly
- ✅ Check browser console for errors
- ✅ Ensure React scripts are loading

### Backend Function Not Working?
- ✅ Verify function exists in `hingecraft.api.web.jsw`
- ✅ Check Velo Console for errors
- ✅ Verify database configuration
- ✅ Check network tab for API calls

### Redirect Not Working?
- ✅ Verify Charter Page URL is correct
- ✅ Check URL parameters are being passed
- ✅ Verify session storage is working
- ✅ Check browser console for redirect errors

---

## ✅ DEPLOYMENT CHECKLIST

### Page Creation ✅
- [ ] Mission Support page created in Wix Editor
- [ ] Page URL set to `/mission-support`
- [ ] HTML element added with ID: `missionSupportForm`
- [ ] HTML content pasted from `mission-support-form.html`
- [ ] Page saved

### Backend Setup ✅
- [ ] Backend function `logMissionSupportIntent()` verified
- [ ] Database configuration updated (if needed)
- [ ] External DB endpoint configured (if using)
- [ ] Secret key configured (if using external DB)

### Testing ✅
- [ ] Form displays correctly
- [ ] Form validation works
- [ ] Form submission works
- [ ] Redirect to Charter Page works
- [ ] Amount displays on Charter Page
- [ ] Redirect to Payment Page works
- [ ] Amount pre-fills on Payment Page
- [ ] Backend logging works
- [ ] Database record created

### Publishing ✅
- [ ] Page published
- [ ] Live URL tested
- [ ] Form works on live site

---

## 🎯 QUICK REFERENCE

### Page URL:
```
/mission-support
```

### HTML Element ID:
```
missionSupportForm
```

### Backend Function:
```javascript
logMissionSupportIntent(requestData)
```

### Form Redirects To:
```
/charter?donationAmount=VALUE&fromMissionSupport=true
```

---

## 📊 COMPLETE FLOW

```
Mission Support Page (/mission-support)
    ↓ User fills form
    ↓ Validates & submits
    ↓ Logs to backend (logMissionSupportIntent)
    ↓ Stores in database (contribution_intents table)
    ↓ Redirects to Charter Page (/charter?donationAmount=VALUE)
Charter Page
    ↓ Displays amount
    ↓ Updates contributions section
    ↓ Redirects to Payment Page (/payment?amt=VALUE)
Payment Page
    ↓ Pre-fills amount
    ↓ User completes payment
    ↓ Payment record created
    ↓ ContributionIntent status updated to "completed"
```

---

## ✅ STATUS

**Page File:** ✅ Created (`src/pages/Mission Support.msup1.js`)  
**HTML Form:** ✅ Ready (`public/pages/mission-support-form.html`)  
**Backend Function:** ✅ Ready (`logMissionSupportIntent()`)  
**Database Schema:** ✅ Ready (`contribution_intents` table)  
**Wix Dev:** ✅ Running and syncing  

**Next Step:** Add page in Wix Editor and embed HTML form!

---

**Deployment Date:** January 27, 2025  
**Status:** ✅ **READY FOR WIX EDITOR - FOLLOW STEPS ABOVE**



