// HingeCraft Global - Mission Support Form Page
// T10 Implementation: Mission Support Form with Database Integration
// Generated: January 27, 2025

import wixSeo from 'wix-seo';
import { logMissionSupportIntent } from 'backend/hingecraft.api.web.jsw';

$w.onReady(function () {
    // Set SEO
    wixSeo.setTitle("Mission Support | HingeCraft Global");
    wixSeo.setMetaTags([
        { name: "description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." },
        { name: "keywords", content: "mission support, donation, charter, abundance, resilience, hingecraft" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Mission Support | HingeCraft Global" },
        { property: "og:description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute to our Charter of Abundance & Resilience initiative." },
        { property: "og:type", content: "website" }
    ]);
    
    // Load Mission Support form
    loadMissionSupportForm();
});

/**
 * Load Mission Support Form HTML Content
 * This embeds the React-based form into the page
 */
function loadMissionSupportForm() {
    // Get the HTML element (must be added in Wix Editor with ID: missionSupportForm)
    const formElement = $w('#missionSupportForm');
    
    if (formElement) {
        // Load form HTML content
        // The form will be embedded via HTML element in Wix Editor
        // Content is in: public/pages/mission-support-form.html
        console.log('Mission Support form element found. Form content should be embedded via HTML element.');
    } else {
        console.log('Mission Support form element not found. Add HTML element with ID: missionSupportForm');
    }
    
    // Initialize form handlers
    initializeFormHandlers();
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
async function handleFormSubmission(formData) {
    try {
        // Call backend function to log Mission Support intent
        const result = await logMissionSupportIntent({
            formData: formData,
            amountEntered: formData.amount,
            timestamp: new Date().toISOString(),
            sessionID: getSessionId(),
            anonymousFingerprint: getAnonymousFingerprint(),
            referrerSource: document.referrer || 'direct',
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        });
        
        if (result.success) {
            console.log('✅ Mission Support intent logged:', result.intentId);
        } else {
            console.error('❌ Error logging intent:', result.error);
        }
    } catch (error) {
        console.error('❌ Error in form submission:', error);
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

