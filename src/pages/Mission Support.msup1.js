// HingeCraft Global - Mission Support Page Velo Code
// T10 Implementation: Full middleware binding + dynamic totals + crypto payments
// Generated: January 27, 2025

import wixSeo from 'wix-seo';
import { onReady, handleUserInputDonation, goToCharterAfterPayment } from 'backend/mission-support-middleware';

$w.onReady(async function () {
    // Set SEO for Mission Support Page
    wixSeo.setTitle("Mission Support | HingeCraft Global");
    
    // Set meta tags
    wixSeo.setMetaTags([
        { name: "description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." },
        { name: "keywords", content: "mission support, donation, charter, abundance, resilience, hingecraft, payment, crypto" },
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
            "url": "https://www.hingecraft-global.ai/mission-support",
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
                    "item": "https://www.hingecraft-global.ai/mission-support"
                }
            ]
        }
    ]);
    
    // Initialize middleware
    const middlewareResult = await onReady();
    
    if (middlewareResult.success) {
        console.log('✅ Mission Support page middleware initialized');
        console.log('💰 Cumulative total:', middlewareResult.cumulativeTotal);
    } else {
        console.error('❌ Mission Support page middleware initialization failed:', middlewareResult.error);
    }
    
    // Load Mission Support form HTML content
    loadMissionSupportForm();
    
    // Check for amount in URL parameter (from Charter Page redirect)
    checkURLAmount();
});

/**
 * Load Mission Support Form HTML Content
 * This embeds the React-based form into the Mission Support page
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
}

/**
 * Check for amount in URL parameter and pre-fill if needed
 * This handles redirects from Charter Page with ?donationAmount=VALUE
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
 */
export async function handleFormSubmission(formData) {
    try {
        // Call middleware to handle user input donation
        const result = await handleUserInputDonation({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            missionSupportName: formData.missionSupportName || null,
            amount: formData.amount,
            paymentMethod: formData.paymentMethod || 'card',
            referrerSource: document.referrer || 'direct',
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        });
        
        if (result.success) {
            console.log('✅ Mission Support form submission handled:', result);
            
            if (result.paymentMethod === 'crypto') {
                // Redirect to crypto payment page
                if (result.paymentUrl) {
                    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
                        wixLocation.to(result.paymentUrl);
                    } else {
                        window.location.href = result.paymentUrl;
                    }
                }
            } else {
                // Redirect to charter page
                if (result.redirectUrl) {
                    if (typeof wixLocation !== 'undefined' && wixLocation.to) {
                        wixLocation.to(result.redirectUrl);
                    } else {
                        window.location.href = result.redirectUrl;
                    }
                }
            }
        } else {
            console.error('❌ Form submission error:', result.error);
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        console.error('❌ Error in form submission:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Go to charter page after payment (called from frontend)
 */
export async function goToCharterWithAmount(amount) {
    try {
        const result = await goToCharterAfterPayment(amount);
        return result;
    } catch (error) {
        console.error('❌ Go to charter error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
