# Original Charter Page HTML - Found

## ✅ Original File Identified

**Original File**: `HingeCraft/charter-page.html`  
**Date Created/Modified**: November 27, 2024 at 18:33  
**File Size**: 44KB  
**Status**: ✅ This is the ORIGINAL copy

---

## 📊 File Comparison Results

### File Analysis

| File | Date Modified | MD5 Hash | Status |
|------|---------------|----------|--------|
| **`charter-page.html`** | **Nov 27 18:33** | `9bf5f6a47e5ac8dc6b355053a0418973` | ✅ **ORIGINAL** |
| `wix-project/public/pages/charter-page.html` | Nov 29 13:08 | `9bf5f6a47e5ac8dc6b355053a0418973` | ✅ Identical copy |
| `CHARTER_PAGE_ORIGINAL_INPUT_CODE.html` | Dec 4 11:51 | `151ecad7a87fab2761c94a2774f90b7d` | 📝 Recently created |

### Key Findings

1. **`charter-page.html`** is the **OLDEST** file (Nov 27) - This is the original
2. **`wix-project/public/pages/charter-page.html`** is an **identical copy** (same MD5 hash)
3. **`CHARTER_PAGE_ORIGINAL_INPUT_CODE.html`** was just created today (different content)

---

## 📍 Original File Location

```
[PROJECT_ROOT]/HingeCraft/charter-page.html
```

**Full Path**: `[PROJECT_ROOT]/HingeCraft/charter-page.html`

---

## 🔍 File Details

### Original File: `charter-page.html`

- **Location**: Root of HingeCraft directory
- **Type**: Standalone HTML file
- **Content**: Complete React component for HingeCraft membership widget
- **Features**:
  - Contribution number display (line 243)
  - Donation amount retrieval (lines 70-97)
  - Membership tier selection
  - Payment processing
  - Charter letter functionality

### Identical Copy: `wix-project/public/pages/charter-page.html`

- **Location**: Wix project structure
- **Status**: Identical to original (same MD5 hash)
- **Purpose**: Organized copy for Wix project structure

---

## 📋 Key Code Sections in Original

### Contribution Display (Line 243)
```javascript
{!quote && (
  <div className="mt-6 flex items-center justify-between gap-4">
    <div>
      <div className="text-sm uppercase text-slate-500">Contribution</div>
      <div className="text-2xl font-bold">{formatUSD(finalAmount)}</div>
      {donationAmount && donationAmount > 0 && (
        <div className="mt-2 text-lg font-semibold text-emerald-600">
          Donation Amount: {formatUSD(donationAmount)}
        </div>
      )}
      ...
    </div>
  </div>
)}
```

### Donation Amount Retrieval (Lines 70-97)
```javascript
useEffect(() => {
  const retrieveDonationAmount = async () => {
    let amount = 0;
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('donationAmount');
    if (urlAmount) { amount = parseFloat(urlAmount) || 0; }
    
    // 2. Check Wix Storage
    if (!amount && typeof wixStorage !== 'undefined') {
      try {
        const stored = wixStorage.getItem('hingecraft_donation');
        if (stored) { const data = JSON.parse(stored); amount = parseFloat(data.amount) || 0; }
      } catch (error) { console.log("Could not retrieve from Wix Storage:", error); }
    }
    
    // 3. Check sessionStorage
    if (!amount && typeof sessionStorage !== 'undefined') {
      try {
        const sessionData = sessionStorage.getItem('hingecraft_donation');
        if (sessionData) { const data = JSON.parse(sessionData); amount = parseFloat(data.amount) || 0; }
      } catch (error) { console.log("Could not retrieve from sessionStorage:", error); }
    }
    
    // 4. Check database API
    if (!amount) {
      try {
        const response = await fetch('/_functions/getLatestDonation', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (response.ok) { const data = await response.json(); if (data && data.amount) { amount = parseFloat(data.amount) || 0; } }
      } catch (error) { console.log("Could not retrieve from database API:", error); }
    }
    
    if (amount > 0) { setDonationAmount(amount); }
  };
  retrieveDonationAmount();
}, []);
```

---

## ✅ Verification

**Original File**: `HingeCraft/charter-page.html`  
**Verified**: ✅ MD5 hash matches identical copy  
**Status**: ✅ Confirmed as original  
**Ready to Use**: ✅ Yes

---

**Last Verified**: December 4, 2024








