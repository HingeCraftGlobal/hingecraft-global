# Module Load Error Fix ✅

## Error Fixed

**Error:** `ModuleLoadError: Identifier 'createCustomInvoice' has already been declared`

**Cause:** Duplicate imports of `createCustomInvoice` in `.jsw` files

---

## Problem

The `.jsw` files had:
1. Top-level import: `import { createCustomInvoice } from 'backend/stripe.api';`
2. Dynamic import inside function: `const { createCustomInvoice } = await import('backend/stripe.api');`

This caused a duplicate declaration error.

---

## Fix Applied

### charter-page-middleware.jsw

**Before:**
```javascript
// Top-level import
import { createCheckoutSession, createCustomInvoice } from 'backend/stripe.api';

// Inside function (DUPLICATE)
const { createCustomInvoice } = await import('backend/stripe.api');
```

**After:**
```javascript
// Top-level import (only one)
import { createCheckoutSession, createCustomInvoice } from 'backend/stripe.api';

// Inside function (removed duplicate)
// createCustomInvoice is already imported at the top
const invoiceResult = await createCustomInvoice({...});
```

### mission-support-middleware.jsw

**Before:**
```javascript
// No top-level import

// Inside function (only import)
const { createCustomInvoice } = await import('backend/stripe.api');
```

**After:**
```javascript
// Top-level import (added)
import { createCustomInvoice } from 'backend/stripe.api';

// Inside function (removed duplicate)
// createCustomInvoice is already imported at the top
const invoiceResult = await createCustomInvoice({...});
```

---

## Verification

After this fix, the module should load without errors:

1. **Check Wix Editor:**
   - No red error indicators on `charter-page-middleware.jsw`
   - No red error indicators on `mission-support-middleware.jsw`

2. **Test Import:**
   ```javascript
   import { fiatButtonClick } from 'backend/charter-page-middleware';
   // Should work without errors
   ```

3. **Test Function:**
   ```javascript
   const result = await fiatButtonClick({ amount: 30, tier: 'VIP' });
   // Should work without "Function not accessible" error
   ```

---

## Status

✅ **Fixed** - Duplicate imports removed  
✅ **Committed** - Changes pushed to git (commit `c0899d4`)  
✅ **Ready** - Module should load correctly now

---

**Next Step:** Test in Wix Editor - the ModuleLoadError should be resolved!
