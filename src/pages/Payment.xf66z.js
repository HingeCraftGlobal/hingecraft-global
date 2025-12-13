// HingeCraft Global - Mission Support Form (REPLACES Payment Page)
// T10 Implementation: Mission Support Form with Database Integration
// Updated: December 13, 2025 - Fully synced with Charter page
// This page REPLACES the old Payment page - Mission Support form is now the Payment page

import wixSeo from 'wix-seo';

// Velo API Configuration - Use HTTP endpoints (not imports)
// IMPORTANT: Wix automatically strips .web.js from module names for HTTP endpoints
// So mission-support-middleware.web.js becomes /_functions/mission-support-middleware
const VELO_CONFIG = {
    MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware',
    CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
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
    // Initialize middleware via HTTP endpoint
    const middlewareResult = await callVeloFunction(VELO_CONFIG.MISSION_SUPPORT_MIDDLEWARE, 'onReady', {});
    
    if (middlewareResult.success) {
        console.log('✅ Mission Support middleware initialized');
        console.log('💰 Cumulative total:', middlewareResult.cumulativeTotal);
    } else {
        console.error('❌ Mission Support middleware initialization failed:', middlewareResult.error);
    }
    // Set SEO for Mission Support Form (on Payment page URL)
    wixSeo.setTitle("Mission Support | HingeCraft Global");
    
    // Set meta tags
    wixSeo.setMetaTags([
        { name: "description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." },
        { name: "keywords", content: "mission support, donation, charter, abundance, resilience, hingecraft, payment" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Mission Support | HingeCraft Global" },
        { property: "og:description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HingeCraft Global" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: "Mission Support | HingeCraft Global" },
        { property: "twitter:description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." }
    ]);
    
    // Set structured data (JSON-LD)
    wixSeo.setStructuredData([
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Mission Support | HingeCraft Global",
            "description": "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative.",
            "url": "https://www.hingecraft-global.ai/payment",
            "inLanguage": "en-US",
            "dateModified": "2025-01-27",
            "publisher": {
                "@type": "Organization",
                "name": "HingeCraft Global",
                "url": "https://www.hingecraft-global.ai",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.hingecraft-global.ai/logo.png"
                }
            }
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.hingecraft-global.ai"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Mission Support",
                    "item": "https://www.hingecraft-global.ai/payment"
                }
            ]
        }
    ]);
    
    // Load Mission Support form
    loadMissionSupportForm();
});

/**
 * Load Mission Support Form HTML Content
 * This embeds the React-based form into the Payment page
 * The form will be embedded via HTML element in Wix Editor with ID: missionSupportForm
 */
function loadMissionSupportForm() {
    // Get the HTML element (must be added in Wix Editor with ID: missionSupportForm)
    const formElement = $w('#missionSupportForm');
    
    if (formElement) {
        // Form content will be embedded via HTML element in Wix Editor
        // Content is in: public/pages/mission-support-form.html
        console.log('✅ Mission Support form element found. Form content should be embedded via HTML element.');
    } else {
        console.log('⚠️ Mission Support form element not found. Add HTML element with ID: missionSupportForm');
        console.log('📋 Instructions: Add HTML element → Set ID to "missionSupportForm" → Paste content from public/pages/mission-support-form.html');
    }
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // T10: Check for amount in URL parameter (from Charter Page redirect)
    checkURLAmount();
}

/**
 * T10: Check for amount in URL parameter and pre-fill if needed
 * This handles redirects from Charter Page with ?amt=VALUE
 */
function checkURLAmount() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAmount = urlParams.get('amt') || urlParams.get('donationAmount') || urlParams.get('amount');
        
        if (urlAmount) {
            const amount = parseFloat(urlAmount);
            if (!isNaN(amount) && amount >= 1.00 && amount <= 25000.00) {
                console.log('💰 T10: Amount found in URL, will pre-fill form:', amount);
                
                // Store amount for form to pick up
                if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                    wixStorage.session.setItem('hingecraft_donation', JSON.stringify({
                        amount: amount,
                        timestamp: new Date().toISOString(),
                        source: 'mission_support_form_url'
                    }));
                }
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('hingecraft_donation', JSON.stringify({
                        amount: amount,
                        timestamp: new Date().toISOString(),
                        source: 'mission_support_form_url'
                    }));
                }
            }
        }
    } catch (e) {
        console.error('Error checking URL amount:', e);
    }
}

/**
 * Initialize form submission handlers
 */
function initializeFormHandlers() {
    // Form submission will be handled by the React component in the HTML
    // This function can be extended for additional Wix-specific integrations
    
    // Listen for form data if needed
    if (typeof wixWindow !== 'undefined') {
        wixWindow.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'missionSupportSubmit') {
                handleFormSubmission(event.data.formData);
            }
        });
    }
}

/**
 * Handle form submission (called from embedded form)
 * Uses HTTP endpoint to submit form
 */
async function handleFormSubmission(formData) {
    try {
        // Call backend function via HTTP endpoint
        const result = await callVeloFunction(VELO_CONFIG.MISSION_SUPPORT_MIDDLEWARE, 'submitMissionSupportForm', {
            ...formData,
            sessionId: getSessionId(),
            anonymousFingerprint: getAnonymousFingerprint(),
            referrerSource: document.referrer || 'direct',
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        if (result.success) {
            console.log('✅ Mission Support form submitted:', result.submissionId);
        } else {
            console.error('❌ Error submitting form:', result.error);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error in form submission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get or create session ID
 */
function getSessionId() {
    try {
        if (typeof wixStorage !== 'undefined' && wixStorage.session) {
            let sessionId = wixStorage.session.getItem('hingecraft_session_id');
            if (sessionId) return sessionId;
            
            sessionId = 'hc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            wixStorage.session.setItem('hingecraft_session_id', sessionId);
            return sessionId;
        }
        
        // Fallback to sessionStorage
        if (typeof sessionStorage !== 'undefined') {
            let sessionId = sessionStorage.getItem('hingecraft_session_id');
            if (sessionId) return sessionId;
            
            sessionId = 'hc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('hingecraft_session_id', sessionId);
            return sessionId;
        }
        
        return 'hc_' + Date.now();
    } catch (e) {
        return 'hc_' + Date.now();
    }
}

/**
 * Get anonymous browser fingerprint
 */
function getAnonymousFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('HingeCraft', 2, 2);
        return btoa(canvas.toDataURL().substring(0, 50)).substring(0, 16);
    } catch (e) {
        return 'fp_' + Math.random().toString(36).substr(2, 9);
    }
}
