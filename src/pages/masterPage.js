/**
 * Master Page Code - Wix Site
 * 
 * IMPORTANT: This file should NOT import charter-page-middleware directly.
 * All initialization is handled by the embedded HTML on each page.
 * 
 * If you need page-level initialization, use HTTP endpoints instead of imports.
 */

$w.onReady(function () {
    // Page initialization is handled by embedded HTML
    // No direct imports needed - HTML uses callVeloFunction() helper
    
    console.log('✅ Master page loaded - HTML handles all initialization');
    
    // If you need to call backend functions, use fetch:
    // fetch('/_functions/charter-page-middleware/onReady', { method: 'POST', ... })
    // But this is not necessary - HTML already does this
});
