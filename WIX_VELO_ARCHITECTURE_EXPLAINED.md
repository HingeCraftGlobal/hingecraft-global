# Wix Velo Architecture - .jsw vs .web.js Files

## Understanding the Two Approaches

### Option 1: `.jsw` Files (Direct Imports)
**Use Case:** Page-level Velo code (`pa3z2.js`, `b6v8z.js`)  
**How it works:** Direct import in Velo code  
**Example:**
```javascript
// In pa3z2.js (page-level Velo)
import { fiatButtonClick } from 'backend/charter-page-middleware';

$w.onReady(async function() {
    const result = await fiatButtonClick({ amount: 30, tier: 'VIP' });
});
```

**Pros:**
- ✅ Type-safe
- ✅ No HTTP overhead
- ✅ Works immediately (no upload needed)
- ✅ Better error handling

**Cons:**
- ❌ Can't be called from embedded HTML
- ❌ Can't be called from external sites

---

### Option 2: `.web.js` Files (HTTP Endpoints)
**Use Case:** Embedded HTML, external calls  
**How it works:** HTTP endpoint at `/_functions/module-name/function-name`  
**Example:**
```javascript
// In embedded HTML (charter-page-final.html)
fetch('/_functions/charter-page-middleware/fiatButtonClick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 30, tier: 'VIP' })
});
```

**Pros:**
- ✅ Can be called from embedded HTML
- ✅ Can be called from external sites
- ✅ Works with any frontend framework

**Cons:**
- ❌ Requires file upload to Wix
- ❌ HTTP overhead
- ❌ Less type-safe

---

## Current Architecture

**We're using BOTH approaches:**

1. **Page-level Velo code** (`pa3z2.js`) → Uses HTTP endpoints (`.web.js`)
2. **Embedded HTML** (`charter-page-final.html`) → Uses HTTP endpoints (`.web.js`)

**Problem:** `.web.js` files must be uploaded to Wix Dev Mode manually.

---

## Solution Options

### Option A: Keep Current Architecture (HTTP Endpoints)
**Action:** Upload `.web.js` files to Wix Dev Mode

**Files to upload:**
- `charter-page-middleware.web.js`
- `mission-support-middleware.web.js`
- `stripe.api.jsw` (already HTTP-callable)
- `nowpayments.api.jsw` (already HTTP-callable)

**Pros:**
- ✅ Works with embedded HTML
- ✅ No code changes needed

**Cons:**
- ❌ Requires manual upload
- ❌ HTTP overhead for page-level code

---

### Option B: Hybrid Approach (Recommended)
**Action:** Use `.jsw` for page-level code, `.web.js` for embedded HTML

**Changes needed:**

1. **Page-level Velo code** (`pa3z2.js`):
   ```javascript
   // Change from HTTP endpoint to direct import
   import { fiatButtonClick, onReady, getCumulativeTotal } from 'backend/charter-page-middleware';
   
   $w.onReady(async function() {
       // Direct call - no HTTP
       const result = await onReady();
       
       // Button handler
       $w('#fiatButton').onClick(async () => {
           const invoice = await fiatButtonClick({ amount: 30, tier: 'VIP' });
       });
   });
   ```

2. **Embedded HTML** (`charter-page-final.html`):
   ```javascript
   // Keep HTTP endpoints (can't use direct imports)
   fetch('/_functions/charter-page-middleware/fiatButtonClick', { ... });
   ```

**Pros:**
- ✅ Page-level code works immediately (no upload)
- ✅ Better performance for page-level code
- ✅ Embedded HTML still works via HTTP

**Cons:**
- ❌ Need to maintain both `.jsw` and `.web.js` versions
- ❌ Still need to upload `.web.js` for embedded HTML

---

### Option C: Convert Everything to `.jsw` (Simplest)
**Action:** Use only `.jsw` files, remove `.web.js` files

**Changes needed:**

1. **Remove `.web.js` files** (or keep for future use)
2. **Update page-level Velo code** to use direct imports
3. **Update embedded HTML** to call page-level Velo functions via `$w` API

**Example:**
```javascript
// In pa3z2.js
import { fiatButtonClick } from 'backend/charter-page-middleware';

export function handleFiatPayment(data) {
    return fiatButtonClick(data);
}

// In embedded HTML
window.handleFiatPayment = async (data) => {
    // Call via Wix API
    const result = await wixCodeApi.callFunction('handleFiatPayment', data);
    return result;
};
```

**Pros:**
- ✅ No HTTP endpoints needed
- ✅ Works immediately
- ✅ Better performance

**Cons:**
- ❌ Requires refactoring embedded HTML
- ❌ More complex integration

---

## Recommended Solution

**Use Option B (Hybrid Approach):**

1. **For page-level Velo code** → Use `.jsw` files with direct imports
2. **For embedded HTML** → Keep `.web.js` files with HTTP endpoints
3. **Upload `.web.js` files** to Wix Dev Mode for embedded HTML

This gives you:
- ✅ Immediate functionality for page-level code (no upload needed)
- ✅ HTTP endpoints for embedded HTML (upload required)
- ✅ Best of both worlds

---

## Implementation Steps

### Step 1: Update Page-Level Velo Code

**File:** `src/pages/Charter of Abundance Invitation.pa3z2.js`

**Change from:**
```javascript
const VELO_CONFIG = {
    CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
    // ...
};

async function callVeloFunction(modulePath, functionName, data = {}) {
    const response = await fetch(`${modulePath}/${functionName}`, { ... });
}
```

**Change to:**
```javascript
import { 
    onReady, 
    fiatButtonClick, 
    cryptoButtonClick, 
    getCumulativeTotal 
} from 'backend/charter-page-middleware';

$w.onReady(async function() {
    // Direct call - no HTTP
    const result = await onReady();
    
    if (result.success) {
        console.log('✅ Charter page initialized');
    }
});

export async function handleFiatButtonClick(data) {
    return await fiatButtonClick(data);
}

export async function handleCryptoButtonClick(amount, coin) {
    return await cryptoButtonClick(amount, coin);
}
```

### Step 2: Keep Embedded HTML Using HTTP Endpoints

**File:** `public/pages/charter-page-final.html`

**Keep as-is:**
```javascript
const VELO_CONFIG = {
    CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
    // ...
};

// HTTP endpoint calls (can't use direct imports in HTML)
const data = await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'fiatButtonClick', {...});
```

### Step 3: Upload `.web.js` Files to Wix

**Still required for embedded HTML:**
- Upload `charter-page-middleware.web.js` to Wix Dev Mode
- Upload `mission-support-middleware.web.js` to Wix Dev Mode

---

## Quick Decision Matrix

| Scenario | Use `.jsw` | Use `.web.js` |
|----------|------------|---------------|
| Page-level Velo code | ✅ Yes | ❌ No |
| Embedded HTML | ❌ No | ✅ Yes |
| External API calls | ❌ No | ✅ Yes |
| Type safety needed | ✅ Yes | ❌ No |
| Immediate deployment | ✅ Yes | ❌ No (needs upload) |

---

## Current Status

**We have both:**
- ✅ `charter-page-middleware.jsw` (for direct imports)
- ✅ `charter-page-middleware.web.js` (for HTTP endpoints)

**Recommendation:** 
- Use `.jsw` for page-level code (immediate, no upload)
- Keep `.web.js` for embedded HTML (upload required)

---

**Next Step:** Choose an option and I'll help implement it!





