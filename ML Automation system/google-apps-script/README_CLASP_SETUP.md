# 🔗 Google Apps Script - clasp Integration Setup

## 📋 Script Information

**Script ID:** `1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS`  
**Script URL:** https://script.google.com/home/projects/1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS/edit

---

## 🚀 clasp Setup (Command Line Interface)

### Step 1: Install clasp

```bash
npm install -g @google/clasp
```

### Step 2: Login to Google

```bash
clasp login
```

This will open a browser window for authentication.

### Step 3: Clone Existing Script

```bash
cd "hingecraft-global/ML Automation system/google-apps-script"
clasp clone 1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS
```

### Step 4: Push Changes

After making changes locally in Cursor:

```bash
clasp push
```

### Step 5: Pull Remote Changes

To get latest from Google Apps Script:

```bash
clasp pull
```

---

## 📁 File Structure

```
google-apps-script/
├── .clasp.json          # clasp configuration
├── Code.gs              # Main automation code
├── Templates.gs         # Email templates
├── HubSpotSetup.gs      # Property creation functions
└── README_CLASP_SETUP.md
```

---

## ✅ Workflow

1. **Develop Locally** in Cursor IDE
2. **Test** your changes
3. **Push** with `clasp push`
4. **Test** in Google Apps Script editor
5. **Deploy** triggers

---

**Status:** Ready for clasp integration ✅
