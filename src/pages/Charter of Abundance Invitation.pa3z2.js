// HingeCraft Global - Charter Page Velo Code
// T10 Implementation: Full middleware binding + dynamic totals + crypto payments
// Updated: December 13, 2025 - Fully synced with Mission Support form
// Using direct imports from .jsw files (no HTTP overhead, works immediately)

import wixSeo from 'wix-seo';
import { 
    onReady, 
    fiatButtonClick, 
    cryptoButtonClick, 
    getCumulativeTotal 
} from 'backend/charter-page-middleware';

$w.onReady(async function () {
    // Set SEO for Charter Page
    wixSeo.setTitle("Charter of Abundance & Resilience | HingeCraft Global");
    
    // Set meta tags
    wixSeo.setMetaTags([
        { name: "description", content: "Join HingeCraft's Charter of Abundance & Resilience. Support our mission with crypto or card payments." },
        { name: "keywords", content: "charter, abundance, resilience, hingecraft, donation, crypto payment, mission support" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Charter of Abundance & Resilience | HingeCraft Global" },
        { property: "og:description", content: "Join HingeCraft's Charter of Abundance & Resilience. Support our mission with crypto or card payments." },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HingeCraft Global" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: "Charter of Abundance & Resilience | HingeCraft Global" },
        { property: "twitter:description", content: "Join HingeCraft's Charter of Abundance & Resilience. Support our mission with crypto or card payments." }
    ]);
    
    // Set structured data (JSON-LD)
    wixSeo.setStructuredData([
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Charter of Abundance & Resilience | HingeCraft Global",
            "description": "Join HingeCraft's Charter of Abundance & Resilience. Support our mission with crypto or card payments.",
            "url": "https://www.hingecraft-global.ai/charter",
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
                    "name": "Charter",
                    "item": "https://www.hingecraft-global.ai/charter"
                }
            ]
        }
    ]);
    
    // Initialize middleware via HTTP endpoint
    const middlewareResult = await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'onReady', {});
    
    if (middlewareResult.success) {
        console.log('✅ Charter page middleware initialized');
        console.log('💰 Cumulative total:', middlewareResult.cumulativeTotal);
        
        // Update contributions display if element exists
        const contributionsElement = $w('#contributionsTotal');
        if (contributionsElement) {
            contributionsElement.text = `$${middlewareResult.cumulativeTotal.toFixed(2)}`;
        }
        
        // Get donation amount from URL or storage
        const urlParams = new URLSearchParams(window.location.search);
        const donationAmount = urlParams.get('donationAmount') || urlParams.get('amount');
        
        if (donationAmount) {
            const amount = parseFloat(donationAmount);
            if (!isNaN(amount) && amount > 0) {
                console.log('💰 Donation amount from URL:', amount);
                
                // Store donation amount
                if (typeof wixStorage !== 'undefined' && wixStorage.session) {
                    wixStorage.session.setItem('hingecraft_donation', JSON.stringify({
                        amount: amount,
                        timestamp: new Date().toISOString(),
                        source: 'charter_page_url'
                    }));
                }
            }
        }
    } else {
        console.error('❌ Charter page middleware initialization failed:', middlewareResult.error);
    }
    
    // Load charter page HTML content
    loadCharterPageContent();
});

/**
 * Load Charter Page HTML Content
 * This embeds the React-based charter page into the Wix page
 * The HTML content will be embedded via HTML element in Wix Editor with ID: charterPageContent
 */
function loadCharterPageContent() {
    // Get the HTML element (must be added in Wix Editor with ID: charterPageContent)
    const contentElement = $w('#charterPageContent');
    
    if (contentElement) {
        // Content will be embedded via HTML element in Wix Editor
        // Content is in: public/pages/charter-page-final.html
        console.log('✅ Charter page content element found. Content should be embedded via HTML element.');
    } else {
        console.log('⚠️ Charter page content element not found. Add HTML element with ID: charterPageContent');
        console.log('📋 Instructions: Add HTML element → Set ID to "charterPageContent" → Paste content from public/pages/charter-page-final.html');
    }
}

/**
 * Handle crypto button click (called from frontend)
 * Uses HTTP endpoint for full stack sync
 */
export async function handleCryptoButtonClick(amount, coin) {
    try {
        const result = await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'cryptoButtonClick', {
            amount: amount,
            coin: coin
        });
        return result;
    } catch (error) {
        console.error('❌ Crypto button click error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle fiat button click (called from frontend)
 * Uses HTTP endpoint for full stack sync
 */
export async function handleFiatButtonClick(preset) {
    try {
        const result = await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'fiatButtonClick', {
            amount: preset.amount || preset,
            paymentMethod: 'card'
        });
        return result;
    } catch (error) {
        console.error('❌ Fiat button click error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get cumulative total (called from frontend)
 * Uses HTTP endpoint for full stack sync
 */
export async function getCumulativeTotalFromDB() {
    try {
        const result = await callVeloFunction(VELO_CONFIG.CHARTER_MIDDLEWARE, 'getCumulativeTotal', {});
        return result;
    } catch (error) {
        console.error('❌ Get cumulative total error:', error);
        return {
            success: false,
            total: 0,
            error: error.message
        };
    }
}
