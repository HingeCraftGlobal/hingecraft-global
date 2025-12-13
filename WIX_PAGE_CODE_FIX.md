# Wix Page Code Fix - onReady TypeError

## Problem

The error `TypeError: (0 , charter_page_middleware_web.onReady) is not a function` is coming from Wix's page-level code (masterPage.js or pa3z2.js), not from the HTML file.

## Solution

You need to update the Wix Page Code (not the HTML) to use HTTP endpoints instead of direct imports.

### Steps to Fix:

1. **Open Wix Editor** → Go to your Charter page
2. **Click "Page Code"** (or "Page Settings" → "Code")
3. **Find any code that looks like:**
   ```javascript
   import { onReady } from 'backend/charter-page-middleware';
   // or
   const { onReady } = require('backend/charter-page-middleware');
   ```

4. **Replace it with:**
   ```javascript
   $w.onReady(async function () {
     try {
       // Call the backend function via HTTP endpoint
       const response = await fetch('/_functions/charter-page-middleware/onReady', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({})
       });
       
       if (response.ok) {
         const data = await response.json();
         console.log('✅ Charter page initialized:', data);
       } else {
         console.warn('⚠️ Could not initialize charter page (non-blocking)');
       }
     } catch (error) {
       console.warn('⚠️ Error initializing page (non-blocking):', error);
       // Don't block page load
     }
   });
   ```

5. **Remove any direct imports** of `charter-page-middleware` from page code

6. **Save and publish** the page

## Alternative: Remove Page Code Entirely

If you don't need page-level initialization, you can simply remove all page code and let the HTML handle everything (which it already does).

### To Remove Page Code:
1. Open Wix Editor → Charter page
2. Click "Page Code" or "Page Settings" → "Code"
3. Delete all code
4. Save

The HTML file already handles all initialization via `callVeloFunction()`.

## Verification

After fixing:
- ✅ No more `TypeError: (0 , charter_page_middleware_web.onReady) is not a function`
- ✅ Page loads without errors
- ✅ Console shows: "✅ Charter page initialized"
