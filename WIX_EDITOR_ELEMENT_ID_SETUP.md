# 📍 Where to Set Element ID: legalContent

## 🎯 Exact Location in Wix Editor

### Step-by-Step Instructions:

1. **Open Wix Editor:**
   - Go to: https://editor.wix.com
   - Log in to your account
   - Open your HingeCraft Global site

2. **Navigate to a Legal Page:**
   - Click **Pages** in the left sidebar
   - Find and click on a legal page (e.g., "Corporate Bylaws", "Privacy Policy", etc.)

3. **Add HTML Element:**
   - In the left sidebar, click **Add** (or the **+** button)
   - Scroll down to **Embed** section
   - Click **HTML Code** (or search for "HTML")
   - Drag the HTML element onto your page

4. **Set Element ID:**
   - Click on the HTML element you just added
   - In the **Settings Panel** (right side), look for **Element Settings**
   - Find **Element ID** field (may be under "Settings" → "Advanced")
   - Type: `legalContent` (exactly as shown, no spaces)
   - Press Enter or click outside to save

5. **Alternative Method (If ID field not visible):**
   - Right-click on the HTML element
   - Select **Settings** or **Properties**
   - Look for **ID** or **Element ID** field
   - Enter: `legalContent`

6. **Verify:**
   - The HTML element should now have ID: `legalContent`
   - Content will load automatically via JavaScript when page loads

---

## 📍 Visual Guide

```
Wix Editor Layout:
┌─────────────────────────────────────────┐
│  Left Sidebar    │  Canvas    │  Right Panel │
│                  │            │              │
│  Pages           │  [Page]    │  Settings    │
│  Add (+)         │            │  ┌──────────┐ │
│  └─ Embed        │  [HTML]    │  │ Element │ │
│     └─ HTML Code │  Element   │  │ ID:     │ │
│                  │            │  │legalCont│ │
│                  │            │  │ent      │ │
│                  │            │  └──────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ Important Notes

### HTTPS Only
- ✅ All URLs in code use `https://` (not `http://`)
- ✅ All external links are HTTPS
- ✅ All API calls use HTTPS
- ✅ All images use HTTPS

### Element ID Requirements
- ✅ Must be exactly: `legalContent` (case-sensitive)
- ✅ No spaces
- ✅ No special characters
- ✅ Must be unique on the page

### Content Loading
- ✅ JavaScript automatically finds element with ID `legalContent`
- ✅ HTML content loads when page loads
- ✅ No manual copy/paste needed (if JavaScript is working)

---

## 🔧 If Element ID Field Not Found

### Method 1: Via Code Panel
1. Click on HTML element
2. Click **Settings** → **Code**
3. Add: `id="legalContent"` to the HTML code

### Method 2: Via Developer Tools
1. Right-click HTML element
2. Select **Inspect** (if available)
3. Add `id="legalContent"` to the element

### Method 3: Manual HTML
1. Click HTML element
2. Click **Edit HTML**
3. Wrap content in: `<div id="legalContent">...</div>`

---

## 📋 Checklist for Each Legal Page

For each of the 34 legal pages:

- [ ] Page exists in Wix Editor
- [ ] HTML element added to page
- [ ] Element ID set to: `legalContent`
- [ ] Page saved
- [ ] Page published
- [ ] Content loads correctly

---

**Location:** Wix Editor → Page → HTML Element → Settings → Element ID  
**Value:** `legalContent`  
**Status:** Required for automatic content loading


