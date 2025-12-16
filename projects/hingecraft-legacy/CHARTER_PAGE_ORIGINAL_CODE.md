# Charter Page Original Code

This document contains the original code for the charter page where the contribution number shows up.

## File Location
- **Original File**: `charter-page.html`
- **Wix Project File**: `wix-project/public/pages/charter-page.html`

## Key Section: Contribution Display

The donation amount appears below the "Contribution" section at **line 243**:

```javascript
{!quote && (
  <div className="mt-6 flex items-center justify-between gap-4">
    <div>
      <div className="text-sm uppercase text-slate-500">Contribution</div>
      <div className="text-2xl font-bold">{formatUSD(finalAmount)}</div>
      
      {/* THIS IS WHERE DONATION AMOUNT APPEARS */}
      {donationAmount && donationAmount > 0 && (
        <div className="mt-2 text-lg font-semibold text-emerald-600">
          Donation Amount: {formatUSD(donationAmount)}
        </div>
      )}
      
      {multiplier !== 1 && (
        <div className="text-xs text-slate-500">
          Base {formatUSD(amount)} × {multiplier.toFixed(3)} (rail multiplier)
        </div>
      )}
    </div>
    <div className="text-xl text-rose-800 font-medium whitespace-nowrap">
      Help hinge the world to craft the future.
    </div>
    <button onClick={handleGoToPayment} className="px-5 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-700">
      Continue → Payment
    </button>
  </div>
)}
```

## Donation Amount Retrieval

The donation amount is retrieved in the `useEffect` hook starting at **line 70**:

```javascript
useEffect(() => {
  const retrieveDonationAmount = async () => {
    let amount = 0;
    
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('donationAmount');
    if (urlAmount) { 
      amount = parseFloat(urlAmount) || 0; 
    }
    
    // 2. Check Wix Storage
    if (!amount && typeof wixStorage !== 'undefined') {
      try {
        const stored = wixStorage.getItem('hingecraft_donation');
        if (stored) { 
          const data = JSON.parse(stored); 
          amount = parseFloat(data.amount) || 0; 
        }
      } catch (error) { 
        console.log("Could not retrieve from Wix Storage:", error); 
      }
    }
    
    // 3. Check sessionStorage
    if (!amount && typeof sessionStorage !== 'undefined') {
      try {
        const sessionData = sessionStorage.getItem('hingecraft_donation');
        if (sessionData) { 
          const data = JSON.parse(sessionData); 
          amount = parseFloat(data.amount) || 0; 
        }
      } catch (error) { 
        console.log("Could not retrieve from sessionStorage:", error); 
      }
    }
    
    // 4. Check database API
    if (!amount) {
      try {
        const response = await fetch('/_functions/getLatestDonation', { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        });
        if (response.ok) { 
          const data = await response.json(); 
          if (data && data.amount) { 
            amount = parseFloat(data.amount) || 0; 
          } 
        }
      } catch (error) { 
        console.log("Could not retrieve from database API:", error); 
      }
    }
    
    if (amount > 0) { 
      setDonationAmount(amount); 
    }
  };
  retrieveDonationAmount();
}, []);
```

## Velo API Reference

**Current Reference URL**: `https://www.wix.com/velo/reference/api-overview/introduction`

This reference is used in:
- `database-adaptor/server.js` (line 423)
- `docker-compose.yml` (line 45)
- `payment-page-integration.js` (line 31)
- `wix-project/public/pages/payment-page.js` (line 31)

## Complete File

The complete original charter page code is available in:
- `charter-page.html` (standalone version)
- `wix-project/public/pages/charter-page.html` (Wix project version)

Both files are identical and contain the full React component for the HingeCraft membership widget.








