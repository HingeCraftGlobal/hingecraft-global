/**
 * Master Page Code - Wix Site
 * Updated: December 13, 2025 - Fully Wix-compatible
 * 
 * IMPORTANT: This file should NOT import backend modules directly.
 * All initialization is handled by the embedded HTML on each page.
 * 
 * If you need page-level initialization, use HTTP endpoints instead of imports.
 * All backend calls must use: /_functions/[module-name]/[function-name]
 */

// Velo API Configuration - Use HTTP endpoints (not imports)
const VELO_CONFIG = {
    CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
    MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware',
    PAYMENT_INFO_SERVICE: '/_functions/payment-info-service'
};

// Helper to call Velo functions via HTTP (if needed)
async function callVeloFunction(modulePath, functionName, data = {}) {
    try {
        const fetchFn = typeof wixFetch !== 'undefined' ? wixFetch.fetch : fetch;
        const url = `${modulePath}/${functionName}`;
        
        const response = await fetchFn(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`❌ Error calling ${modulePath}/${functionName}:`, error);
        return { success: false, error: error.message };
    }
}

$w.onReady(function () {
    // Page initialization is handled by embedded HTML
    // No direct imports needed - HTML uses callVeloFunction() helper
    
    console.log('✅ Master page loaded - HTML handles all initialization');
    console.log('📋 All backend calls use HTTP endpoints: /_functions/[module]/[function]');
    
    // If you need to call backend functions, use callVeloFunction() helper above
    // Example: await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'onReady', {});
    // But this is not necessary - HTML already does this
});
