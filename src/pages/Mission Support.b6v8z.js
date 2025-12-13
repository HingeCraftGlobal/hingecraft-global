// HingeCraft Global - Mission Support Page
// Updated: December 13, 2025 - Fully synced with Charter page
// API Reference: https://www.wix.com/velo/reference/api-overview/introduction

import wixSeo from 'wix-seo';

// Velo API Configuration - Use HTTP endpoints (not imports)
const VELO_CONFIG = {
    MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware.web',
    CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware.web',
    STRIPE_API: '/_functions/stripe.api',
    NOWPAYMENTS_API: '/_functions/nowpayments.api',
    HINGECRAFT_API: '/_functions/hingecraft.api'
};

// Helper to call Velo functions via HTTP
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

$w.onReady(async function () {
    // Set SEO
    wixSeo.setTitle("Mission Support | HingeCraft Global");
    wixSeo.setMetaTags([
        { name: "description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute." }
    ]);
    
    // Initialize middleware via HTTP endpoint
    const middlewareResult = await callVeloFunction(VELO_CONFIG.MISSION_SUPPORT_MIDDLEWARE, 'onReady', {});
    
    if (middlewareResult.success) {
        console.log('✅ Mission Support page initialized');
        console.log('💰 Cumulative total:', middlewareResult.cumulativeTotal);
    } else {
        console.error('❌ Mission Support middleware initialization failed:', middlewareResult.error);
    }
    
    // Form submission is handled by embedded HTML
    // HTML uses callVeloFunction() helper to call backend functions
});
