// HingeCraft Global - Mission Support Page
// Updated: December 12, 2025 - Integrated with unified middleware
// API Reference: https://www.wix.com/velo/reference/api-overview/introduction

import wixSeo from 'wix-seo';

// Velo API Configuration - Use HTTP endpoints
const VELO_CONFIG = {
    MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware',
    PAYMENT_INFO_SERVICE: '/_functions/payment-info-service',
    CHAT_NOTIFICATIONS: '/_functions/chat-notifications'
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
    
    console.log('✅ Mission Support page initialized with unified middleware');
    
    // Form submission is handled by embedded HTML
    // HTML uses callVeloFunction() helper to call backend functions
});
