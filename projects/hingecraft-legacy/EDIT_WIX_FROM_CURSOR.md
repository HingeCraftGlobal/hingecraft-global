# Edit Entire Wix Website from Cursor - Complete Guide

## ✅ You Can Now Edit Your Entire Wix Website from Cursor!

All your Wix code is in this directory and ready to edit.

---

## 📍 Where Everything Is

### Your Wix Code Files (Edit These in Cursor)

```
/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft/
├── payment-page-integration.js    ← Payment page code
├── charter-page.html              ← Charter/contributions page code
├── wix-project/                   ← Organized Wix project structure
│   ├── public/pages/
│   │   ├── payment-page.js        ← Same as payment-page-integration.js
│   │   └── charter-page.html      ← Same as charter-page.html
│   └── README.md
└── [all other files]
```

---

## 🚀 How to Edit Wix from Cursor

### Method 1: Direct Editing (Simplest)

1. **Open file in Cursor:**
   - `payment-page-integration.js` - Edit payment page
   - `charter-page.html` - Edit charter page

2. **Make your changes**

3. **Copy code to Wix:**
   - Select all (Cmd+A)
   - Copy (Cmd+C)
   - Open Wix Editor
   - Paste into Custom Code section
   - Save

### Method 2: Use wix-project/ Structure

1. **Edit organized files:**
   - `wix-project/public/pages/payment-page.js`
   - `wix-project/public/pages/charter-page.html`

2. **Same copy-paste workflow**

---

## 📋 Complete File Mapping

### Payment Page

**Cursor File:**
```
HingeCraft/payment-page-integration.js
OR
HingeCraft/wix-project/public/pages/payment-page.js
```

**Wix Location:**
- Payment Page → Settings → Custom Code → JavaScript
- Or: Velo → Page Code → `payment-page.js`

**What It Does:**
- Captures "Other" amount from payment form
- Stores in Wix Storage, sessionStorage, and database
- Redirects to charter page with amount

### Charter/Contributions Page

**Cursor File:**
```
HingeCraft/charter-page.html
OR
HingeCraft/wix-project/public/pages/charter-page.html
```

**Wix Location:**
- Charter Page → Settings → Custom Code → HTML
- Or: Velo → Page Code → `charter-page.html`

**What It Does:**
- Retrieves donation amount from URL, storage, or database
- Displays amount below "Contribution" section
- Auto-fills contribution amount

---

## 🔄 Workflow: Edit → Sync → Deploy

### Step 1: Edit in Cursor

```bash
# Open project
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Edit files in Cursor
# - payment-page-integration.js
# - charter-page.html
# - Any other files
```

### Step 2: Test Locally (Optional)

If you have a local server running:
- Test code changes
- Verify functionality

### Step 3: Sync to Wix

1. **Copy code from Cursor**
2. **Open Wix Editor**
3. **Navigate to page**
4. **Paste code**
5. **Save**

### Step 4: Version Control

```bash
git add .
git commit -m "Update Wix payment page integration"
git push
```

---

## 🎯 Quick Reference

### Edit Payment Page

1. Open: `payment-page-integration.js`
2. Edit code
3. Copy all
4. Paste in Wix → Payment Page → Custom Code

### Edit Charter Page

1. Open: `charter-page.html`
2. Edit code
3. Copy all
4. Paste in Wix → Charter Page → Custom Code

### Update Configuration

In `payment-page-integration.js`, update:
```javascript
const CONFIG = {
  API_ENDPOINT: 'https://your-api-url.com',  // Update this
  SECRET_KEY: 'your-secret-key',              // Update this
  CHARTER_PAGE_URL: '/charter',               // Update if needed
};
```

---

## 📚 Documentation Files

- **`WIX_CURSOR_EDITING_GUIDE.md`** - Complete editing guide
- **`WIX_IMPLEMENTATION_BLUEPRINT.md`** - Implementation details
- **`QUICK_START_CURSOR_EDITING.md`** - Quick start guide
- **`EDIT_WIX_FROM_CURSOR.md`** - This file

---

## ✅ You're All Set!

You can now:
- ✅ Edit all Wix code in Cursor
- ✅ Use Git for version control
- ✅ Copy-paste to Wix when ready
- ✅ Keep everything organized

**Start editing now!** Open any file in Cursor and make your changes.

