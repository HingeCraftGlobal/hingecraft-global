# 🚀 Wix Deployment Guide - Legal Pages

## ✅ Files Deployed to Wix Structure

**Status:** All 34 legal pages copied to Wix folders  
**Location:** 
- `src/pages/legal/` - For Wix Editor integration
- `public/pages/legal/` - For public access

---

## 📁 Wix Folder Structure

```
hingecraft-global/
├── src/
│   └── pages/
│       └── legal/              ← NEW FOLDER
│           ├── *.html (34 files)
│           ├── README.md
│           └── deployment_manifest.json
└── public/
    └── pages/
        └── legal/              ← NEW FOLDER
            └── *.html (34 files)
```

---

## 🔧 Handling CLI Server Issues

### Option 1: Direct File Deployment (Recommended if CLI is down)

The files are already in the Wix structure. You can:

1. **Manual Upload via Wix Editor:**
   - Open Wix Editor: https://editor.wix.com
   - Go to Pages → Add Page
   - For each legal page:
     - Create new page
     - Add HTML element
     - Copy content from `src/pages/legal/[filename].html`
     - Set URL slug: `/legal/[page-name]`

2. **Use Wix File Manager:**
   - Upload HTML files directly via Wix File Manager
   - Files are in `public/pages/legal/`

### Option 2: Fix CLI Server

If you want to use CLI:

```bash
# Check Wix CLI status
wix --version

# Try restarting Wix dev
pkill -f "wix dev"
wix dev

# If still having issues, try:
npm install -g @wix/cli@latest
wix login
wix dev
```

### Option 3: Use Wix API (Advanced)

If CLI continues to fail, use Wix REST API to upload pages programmatically.

---

## 📋 Deployment Steps

### Step 1: Verify Files Are in Place

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
ls -la src/pages/legal/*.html | wc -l  # Should show 34
ls -la public/pages/legal/*.html | wc -l  # Should show 34
```

### Step 2: Start Wix Dev (If CLI Works)

```bash
wix dev
```

If CLI server is having issues, skip to Step 3.

### Step 3: Manual Deployment via Wix Editor

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Site ID: `450f03ec-e8b6-4373-b1b4-5d44459a7e08`

2. **Create Legal Pages Folder:**
   - Go to Pages menu
   - Create folder: "Legal"
   - Move all legal pages into this folder

3. **For Each Page:**
   - Click "Add Page" → "Blank Page"
   - Name: Use page name from `deployment_manifest.json`
   - URL: `/legal/[page-slug]`
   - Add HTML element/widget
   - Copy HTML from `src/pages/legal/[filename].html`
   - Paste into HTML element
   - Configure SEO (from HTML meta tags)
   - Save

### Step 4: Add to Navigation

- **Main Menu:** Add "Legal" dropdown with all pages
- **Footer:** Add legal links section

---

## 📊 Page List (34 Pages)

All pages are in `src/pages/legal/`:

1. Corporate Formation Charter
2. Corporate Bylaws
3. Stakeholder Ethos & Ethics Charter
4. Board Member Agreement
5. Corporate Risk Register
6. Corporate Social Responsibility
7. Cookie Policy
8. Terms of Service
9. End User License Agreement
10. Acceptable Use Policy
11. Export Compliance
12. Service Level Agreement
13. Refunds & Warranty Policy
14. Privacy Policy
15. Data Processing Agreement
16. AI Training Consent
17. Sensitive Data Consent
18. Algorithmic Transparency
19. AI Safety & Governance
20. Creator Licensing Agreement
21. Marketplace Merchant Agreement
22. Manufacturing Agreement
23. Attribution & Derivative Rights
24. Digital Asset & NFT Ownership
25. Product Liability Disclosure
26. Warranty & Repair Policy
27. Materials Sourcing Compliance
28. Membership Terms & Rights
29. Community Code of Conduct
30. Academic Integrity Policy
31. Global Compliance Framework
32. Cross-Border Data Transfer
33. Charter of Abundance
34. Pledge & Participation Agreement

---

## 🔍 Verification

After deployment, verify:

- [ ] All 34 pages are accessible
- [ ] URLs are correct (`/legal/[page-name]`)
- [ ] SEO tags are working
- [ ] Mobile responsive
- [ ] Navigation links work
- [ ] Footer links work

---

## 📧 Troubleshooting

### CLI Server Issues

**Symptoms:**
- `wix dev` fails to connect
- Timeout errors
- Server not responding

**Solutions:**
1. Check internet connection
2. Try: `wix logout` then `wix login`
3. Update CLI: `npm install -g @wix/cli@latest`
4. Use manual deployment (Option 1 above)
5. Check Wix status: https://status.wix.com

### Files Not Syncing

**If files don't appear in Wix Editor:**
1. Check file permissions
2. Verify files are in correct folders
3. Try manual upload via File Manager
4. Restart Wix dev mode

---

## ✅ Success Checklist

- [x] All 34 files copied to Wix structure
- [x] Files in `src/pages/legal/`
- [x] Files in `public/pages/legal/`
- [x] Deployment manifest created
- [ ] Wix dev mode started (or manual deployment)
- [ ] Pages added to Wix Editor
- [ ] Navigation configured
- [ ] SEO configured
- [ ] Testing complete
- [ ] Published live

---

**Status:** ✅ Files Ready in Wix Structure  
**Next:** Deploy via Wix Editor or fix CLI and run `wix dev`



