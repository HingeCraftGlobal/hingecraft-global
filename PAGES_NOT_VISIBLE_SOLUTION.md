# ⚠️ Pages Not Visible in Wix Editor - Solution

## Problem
The 34 legal pages were created as .js files, but they don't appear in the Wix Editor page tree.

## Root Cause
**Wix pages must be created through the Wix Editor UI**, not just by creating .js files. The .js files are code files that attach to pages, but the pages themselves need to be created first.

---

## ✅ Solution: Create Pages in Wix Editor

### Method 1: Manual Creation (Recommended)

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Open your site

2. **Create Legal Folder:**
   - Click **Pages** in left sidebar
   - Click **Add Page** → **Add Folder**
   - Name: **Legal**

3. **Create Each Page:**
   - Click **Add Page** → **Blank Page**
   - Name: [Page Name]
   - URL: `/legal/[url-slug]`
   - Save

4. **Repeat for all 34 pages**

**See:** `ADD_PAGES_TO_WIX_EDITOR.md` for complete list

---

### Method 2: Use Wix CLI (If Available)

```bash
# Check if Wix CLI supports page creation
wix pages --help

# If available, create pages programmatically
# (This may not be available in current Wix CLI)
```

---

### Method 3: Wix REST API (Advanced)

If you have Wix API access, you can create pages programmatically:

```javascript
// Using Wix REST API
const response = await fetch('https://www.wix.com/_api/wix-pages/v1/pages', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: 'Corporate Formation Charter',
        url: '/legal/corporate_formation_charter',
        pageType: 'blank'
    })
});
```

**Note:** This requires Wix API credentials and may not be available for all Wix plans.

---

## 📋 Quick Checklist

For each of the 34 pages:

- [ ] Page created in Wix Editor
- [ ] URL set to `/legal/[page-slug]`
- [ ] HTML element added (ID: `legalContent`)
- [ ] HTML content copied from `src/pages/legal/[file].html`
- [ ] SEO configured
- [ ] Page saved
- [ ] Page published

---

## 🚀 Automated Helper Script

I've created a helper script you can use:

1. **Open Wix Editor Console:**
   - Press **F12** in Wix Editor
   - Go to **Console** tab

2. **Run Helper Script:**
   - Open: `scripts/wix_editor_page_creation.js`
   - Copy the script
   - Paste in console
   - This will list all 34 pages to create

---

## 📁 Files Ready

All files are ready:
- ✅ 34 HTML files in `src/pages/legal/`
- ✅ 34 .js code files in `src/pages/`
- ✅ Complete documentation

**What's Missing:**
- ⚠️ Pages need to be created in Wix Editor
- ⚠️ Pages need to be added to navigation
- ⚠️ Pages need to be published

---

## ✅ Next Steps

1. **Open Wix Editor:** https://editor.wix.com
2. **Follow instructions in:** `ADD_PAGES_TO_WIX_EDITOR.md`
3. **Create all 34 pages manually**
4. **Attach HTML content to each page**
5. **Configure SEO**
6. **Add to navigation**
7. **Publish**

---

## 📞 Summary

**Status:** Files ready, pages need to be created in Wix Editor  
**Action:** Follow `ADD_PAGES_TO_WIX_EDITOR.md` for step-by-step instructions  
**Time Estimate:** 30-60 minutes to create all 34 pages

**The .js files will automatically attach once pages are created in Wix Editor.**




