# Editing Wix Website from Cursor - Complete Guide

## 🎯 Overview

This guide shows you how to edit your entire Wix website directly from Cursor IDE, without needing to use the Wix Editor interface.

---

## 📁 Project Structure Setup

### Option 1: Use Existing HingeCraft Directory (Recommended)

Since we already have all the code in `[PROJECT_ROOT]/HingeCraft`, we can use this as our Wix development workspace.

**Current Structure:**
```
HingeCraft/
├── payment-page-integration.js    # Payment page code
├── charter-page.html              # Charter/contributions page
├── database-adaptor/              # Backend API
├── python-server/                 # Python API
└── [other files]
```

### Option 2: Create Wix Project Structure

Create a `wix-project/` directory that mirrors Wix's structure:

```
wix-project/
├── public/
│   ├── pages/
│   │   ├── payment-page.js        # Payment page code
│   │   └── charter-page.html      # Charter page code
│   └── components/
├── backend/
│   └── functions/
│       └── getLatestDonation.jsw  # Backend function
└── wix.config.json
```

---

## 🔧 Method 1: Wix CLI Development (When Available)

### Setup

```bash
# Install Wix CLI (when npm is available)
npm install -g @wix/cli

# Login to Wix
wix login

# Link to your Wix site
wix link

# Start development server
wix dev
```

### Workflow

1. **Edit files in Cursor** → Files sync to Wix automatically
2. **Changes reflect immediately** in Wix preview
3. **Deploy when ready**: `wix deploy`

---

## 🔧 Method 2: Manual File Sync (Current Workaround)

Since npm/Wix CLI may not be available, use this manual sync method:

### Step 1: Create Local Wix Project Structure

```bash
cd [PROJECT_ROOT]/HingeCraft
mkdir -p wix-project/{public/pages,backend/functions}
```

### Step 2: Copy Files to Wix Project Structure

```bash
# Copy payment page code
cp payment-page-integration.js wix-project/public/pages/payment-page.js

# Copy charter page code
cp charter-page.html wix-project/public/pages/charter-page.html
```

### Step 3: Edit in Cursor

Edit files in `wix-project/` directory:
- All changes made in Cursor
- Use Cursor's full editing capabilities
- Git version control

### Step 4: Sync to Wix

**Option A: Copy-Paste Method**
1. Open file in Cursor
2. Copy entire code
3. Go to Wix Editor → Page → Custom Code
4. Paste code
5. Save in Wix

**Option B: Wix File Manager (If Available)**
1. Export files from Cursor
2. Upload to Wix via File Manager
3. Reference in Wix Editor

---

## 🔧 Method 3: Wix Velo Code Editor (Recommended for Full Control)

### Setup Wix Velo Development

1. **Enable Velo in Wix:**
   - Go to Wix Editor
   - Click "Dev Mode" (top right)
   - Enable "Velo by Wix"

2. **Access Code Files:**
   - Click "Code" tab in left sidebar
   - See file structure:
     ```
     Page Code/
     ├── payment-page.js
     └── charter-page.html
     
     Backend/
     └── http-functions/
         └── getLatestDonation.js
     ```

3. **Edit in Wix Code Editor:**
   - Files are editable directly in Wix
   - But you can also copy from Cursor

### Sync Workflow: Cursor → Wix Velo

1. **Edit in Cursor:**
   ```bash
   # Edit files in HingeCraft/
   code payment-page-integration.js
   code charter-page.html
   ```

2. **Copy to Wix Velo:**
   - Open Wix Editor → Code tab
   - Create/Edit file: `payment-page.js`
   - Copy code from Cursor
   - Paste into Wix
   - Save

3. **Version Control:**
   - Keep master copy in Cursor (Git)
   - Sync changes to Wix as needed
   - Use Git for version history

---

## 📝 File Mapping: Cursor → Wix

### Payment Page

**Cursor File:**
```
[PROJECT_ROOT]/HingeCraft/payment-page-integration.js
```

**Wix Location:**
- **Method 1**: Page → Custom Code → Add to `<head>` or `<body>`
- **Method 2**: Velo → Page Code → `payment-page.js`
- **Method 3**: Page Settings → Custom Code → JavaScript

**Implementation:**
1. Copy entire content of `payment-page-integration.js`
2. Paste into Wix Custom Code section
3. Update `CONFIG` values if needed
4. Save

### Charter/Contributions Page

**Cursor File:**
```
[PROJECT_ROOT]/HingeCraft/charter-page.html
```

**Wix Location:**
- **Method 1**: Page → Custom Code → Add as HTML embed
- **Method 2**: Velo → Page Code → `charter-page.html`
- **Method 3**: Page Settings → Custom Code → HTML

**Implementation:**
1. Copy entire content of `charter-page.html`
2. Paste into Wix Custom Code section
3. Save

### Backend Functions

**Cursor File:**
```
[PROJECT_ROOT]/HingeCraft/database-adaptor/server.js
```

**Wix Location:**
- Velo → Backend → HTTP Functions → `getLatestDonation.js`

**Implementation:**
1. Create HTTP function in Wix
2. Copy relevant code from `server.js`
3. Adapt for Wix Velo environment
4. Save

---

## 🔄 Recommended Workflow

### Daily Development

1. **Edit in Cursor:**
   ```bash
   cd [PROJECT_ROOT]/HingeCraft
   # Edit files with Cursor
   ```

2. **Test Locally (if possible):**
   - Use local server to test code
   - Verify functionality

3. **Sync to Wix:**
   - Copy code from Cursor
   - Paste into Wix Editor
   - Test in Wix preview
   - Publish when ready

### Version Control

```bash
# Commit changes in Cursor
cd [PROJECT_ROOT]/HingeCraft
git add .
git commit -m "Update payment page integration"
git push
```

### Sync Checklist

- [ ] Edit code in Cursor
- [ ] Test locally (if possible)
- [ ] Copy code to clipboard
- [ ] Open Wix Editor
- [ ] Navigate to page/code section
- [ ] Paste code
- [ ] Update configuration if needed
- [ ] Save in Wix
- [ ] Test in Wix preview
- [ ] Commit changes to Git
- [ ] Push to repository

---

## 🛠️ Advanced: Automated Sync Script

Create a sync script to automate copying:

```bash
#!/bin/bash
# sync-to-wix.sh

SOURCE_DIR="[PROJECT_ROOT]/HingeCraft"
WIX_PROJECT="[PROJECT_ROOT]/HingeCraft/wix-project"

# Copy payment page
cp "$SOURCE_DIR/payment-page-integration.js" \
   "$WIX_PROJECT/public/pages/payment-page.js"

# Copy charter page
cp "$SOURCE_DIR/charter-page.html" \
   "$WIX_PROJECT/public/pages/charter-page.html"

echo "Files synced to wix-project/"
echo "Next: Copy from wix-project/ to Wix Editor"
```

---

## 📚 Wix File Locations Reference

### Frontend Code (Public Pages)

**Payment Page:**
- Wix Editor → Payment Page → Settings → Custom Code
- Or: Velo → Page Code → `payment-page.js`

**Charter Page:**
- Wix Editor → Charter Page → Settings → Custom Code
- Or: Velo → Page Code → `charter-page.html`

### Backend Code

**HTTP Functions:**
- Velo → Backend → HTTP Functions
- Create: `getLatestDonation.js`

**Database Functions:**
- Velo → Backend → Database
- Or: External Database connection

### Configuration

**Secrets/Environment Variables:**
- Wix Editor → Settings → Secrets
- Add: `EXTERNAL_DB_ENDPOINT`
- Add: `EXTERNAL_DB_SECRET_KEY`

---

## 🎯 Quick Start: Edit Wix from Cursor

### Right Now (Without Wix CLI)

1. **Open Cursor:**
   ```bash
   cd [PROJECT_ROOT]/HingeCraft
   code .
   ```

2. **Edit Files:**
   - `payment-page-integration.js` - Payment page code
   - `charter-page.html` - Charter page code
   - Any other files

3. **Copy Code:**
   - Select all (Cmd+A)
   - Copy (Cmd+C)

4. **Paste to Wix:**
   - Open Wix Editor
   - Navigate to page
   - Add Custom Code
   - Paste code
   - Save

5. **Version Control:**
   ```bash
   git add .
   git commit -m "Update Wix code"
   git push
   ```

---

## 🔍 Finding Your Wix Site Files

### In Wix Editor

1. **Pages:**
   - Left sidebar → Pages
   - Click page → Settings → Custom Code

2. **Velo Code:**
   - Left sidebar → Code
   - See all code files

3. **Backend:**
   - Code → Backend
   - HTTP Functions, Database, etc.

### File Types in Wix

- **Page Code**: JavaScript/HTML for specific pages
- **Master Page Code**: Code that runs on all pages
- **Backend Functions**: Server-side code
- **Public Files**: Static assets

---

## ✅ Best Practices

1. **Keep Master Copy in Cursor:**
   - All code in Git repository
   - Cursor for editing
   - Wix for deployment

2. **Document Changes:**
   - Commit messages describe changes
   - Update documentation

3. **Test Before Deploy:**
   - Test locally if possible
   - Test in Wix preview
   - Then publish

4. **Backup Wix Code:**
   - Export code from Wix periodically
   - Store in Git repository

---

## 🚀 Next Steps

1. ✅ Set up local project structure
2. ✅ Edit code in Cursor
3. ✅ Sync to Wix manually (for now)
4. ⏳ Set up Wix CLI when npm available
5. ⏳ Automate sync process

---

**Status**: Ready to edit Wix website from Cursor
**Last Updated**: 2025-11-29

