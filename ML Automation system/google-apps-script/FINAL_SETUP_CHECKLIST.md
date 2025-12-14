# ✅ Google Apps Script - Final Setup Checklist

## 🎯 Complete Setup Guide

Follow these steps in order to complete your Google Apps Script automation setup.

---

## Step 1: Install clasp (Local Development)

```bash
npm install -g @google/clasp
clasp login
```

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 2: Clone Script to Local

```bash
cd "hingecraft-global/ML Automation system/google-apps-script"
clasp clone 1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS
```

**OR use the auto-router:**
```bash
node ../../angelofwill/route-command.js "clone google scripts"
```

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 3: Configure Script Properties

1. Open: https://script.google.com/home/projects/1KO0ZyapRwk0k0kc42q0V6P8avc1s5TM7P24XmWR1DNGAavfIO44HR7Y_/edit
2. Go to: Project Settings (gear icon) → Script Properties
3. Add all 4 properties (see `SCRIPT_PROPERTIES_SETUP.md`)

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 4: Create HubSpot Properties (One-Time)

1. In Apps Script editor, select function: `createHubSpotProperties`
2. Click "Run"
3. Check execution logs for success messages
4. Verify properties in HubSpot UI: Settings → Properties

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 5: Set Up Time-Driven Trigger

1. Go to: Triggers (clock icon)
2. Add trigger for `checkFolderForNewFiles`
3. Set to run every 5 minutes
4. See `TRIGGER_SETUP.md` for details

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 6: Test Connection

Run these test functions in Apps Script editor:

1. `testHubSpotConnection()` - Verify HubSpot API access
2. `checkFolderForNewFiles()` - Test file detection manually

**Status**: ⬜ Not Started | ✅ Complete

---

## Step 7: Push Changes (After Local Edits)

After making changes in Cursor:

```bash
clasp push
```

**Status**: ⬜ Not Started | ✅ Complete

---

## 📋 File Structure

```
google-apps-script/
├── .clasp.json                    # clasp configuration
├── Code.gs                        # Main automation code
├── Templates.gs                   # Email templates (separated)
├── HubSpotSetup.gs               # Property creation functions
├── README_CLASP_SETUP.md         # clasp setup guide
├── SCRIPT_PROPERTIES_SETUP.md    # Properties configuration
├── TRIGGER_SETUP.md              # Trigger setup guide
└── FINAL_SETUP_CHECKLIST.md      # This file
```

---

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined"
- **Fix**: Ensure Script Properties are set correctly
- **Check**: Run `testScriptProperties()` function

### Error: "Invalid argument: marketingecraft@gmail.com"
- **Fix**: Verify Gmail API is enabled in Google Cloud Console
- **Check**: OAuth scopes are granted

### Error: "List 'Ready to Send' not found"
- **Fix**: Create the list in HubSpot first
- **Check**: List name matches exactly (case-sensitive)

### Trigger Not Running
- **Fix**: Verify trigger is set to "Time-driven"
- **Check**: Execution logs for errors

---

## ✅ Completion Status

- [ ] clasp installed and logged in
- [ ] Script cloned locally
- [ ] Script Properties configured
- [ ] HubSpot properties created
- [ ] Time-driven trigger set up
- [ ] Test functions passed
- [ ] Ready for production

---

**Last Updated**: Ready for setup! 🚀
