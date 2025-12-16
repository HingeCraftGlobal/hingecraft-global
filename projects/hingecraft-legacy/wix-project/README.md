# Wix Project - Local Development Workspace

This directory contains the Wix website code that can be edited in Cursor and synced to Wix.

## Structure

```
wix-project/
├── public/
│   └── pages/
│       ├── payment-page.js      # Payment page integration code
│       └── charter-page.html    # Charter/contributions page code
├── backend/
│   └── functions/
│       └── (backend functions go here)
└── README.md
```

## How to Use

1. **Edit files in Cursor:**
   - Open files in `wix-project/`
   - Make your changes
   - Save

2. **Sync to Wix:**
   - Copy code from files
   - Paste into Wix Editor → Custom Code
   - Save in Wix

3. **Version Control:**
   - All changes tracked in Git
   - Commit and push as needed

## Files

### payment-page.js
Payment page integration that captures "Other" amount and redirects to charter page.

**Wix Location:** Payment Page → Custom Code → JavaScript

### charter-page.html
Charter/contributions page that displays donation amount.

**Wix Location:** Charter Page → Custom Code → HTML

## Quick Sync Commands

```bash
# View files
cat public/pages/payment-page.js
cat public/pages/charter-page.html

# Copy to clipboard (macOS)
cat public/pages/payment-page.js | pbcopy
cat public/pages/charter-page.html | pbcopy
```

