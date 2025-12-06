// SEO Configuration
$w.onReady(function () {
    // Set page title
    if (typeof document !== 'undefined') {
        document.title = 'Materials Sourcing & Ethical Compliance Agreement | HingeCraft Global | HingeCraft Global';
    }
    
    // Set meta tags via Wix SEO (if available)
    try {
        import({ seo } from 'wix-seo').then(seoModule => {
            seoModule.seo.setTitle('Materials Sourcing & Ethical Compliance Agreement | HingeCraft Global | HingeCraft Global');
            seoModule.seo.setDescription('HingeCraft Global Materials Sourcing & Ethical Compliance Agreement - Agreement ensuring ethical sourcing and sustainability compliance');
            seoModule.seo.setKeywords('HingeCraft, Ethical Sourcing, Sustainability, Recycled Materials, Supply Chain Ethics');
            seoModule.seo.setOgTitle('Materials Sourcing & Ethical Compliance Agreement | HingeCraft Global');
            seoModule.seo.setOgDescription('HingeCraft Global Materials Sourcing & Ethical Compliance Agreement - Agreement ensuring ethical sourcing and sustainability compliance');
        }).catch(() => {
            // Fallback: Use page settings API
            console.log('SEO module not available, using page settings');
        });
    } catch(e) {
        console.log('SEO setup:', e);
    }
});

// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

// SEO Configuration for Privacy Policy
    import wixSeo from 'wix-seo';
    
    $w.onReady(function () {
        // Set SEO meta tags
        wixSeo.setTitle('Privacy Policy (GDPR/CCPA/COPPA Compliant) | HingeCraft Global');
        wixSeo.setDescription('HingeCraft Global Privacy Policy - GDPR, CCPA, and COPPA compliant privacy policy covering global data collection and user rights');
        wixSeo.setKeywords('HingeCraft, Privacy Policy, GDPR, CCPA, COPPA, Data Protection, Privacy Rights');
        
        // Set Open Graph tags
        wixSeo.setOgTitle('Privacy Policy (GDPR/CCPA/COPPA Compliant) | HingeCraft Global');
        wixSeo.setOgDescription('HingeCraft Global Privacy Policy - GDPR, CCPA, and COPPA compliant privacy policy covering global data collection and user rights');
        wixSeo.setOgImage('https://hingecraft-global.ai/og-image.jpg');
        wixSeo.setOgUrl('https://hingecraft-global.ai/legal/privacy-policy-gdpr-ccpa-coppa');
        
        // Set canonical URL
        wixSeo.setCanonicalUrl('https://hingecraft-global.ai/legal/privacy-policy-gdpr-ccpa-coppa');
        
        // Set robots meta
        wixSeo.setRobots('index, follow');
        
        // Load legal page content
        loadLegalPageContent();
    });
    
    /**
     * Load legal page HTML content
     */
    function loadLegalPageContent() {
        // HTML content will be loaded from the HTML element
        // Make sure HTML element with ID 'legalContent' exists on the page
        const htmlElement = $w('#legalContent');
        if (htmlElement) {
            console.log('Legal content element found');
        } else {
            console.log('Legal content element not found. Add HTML element with ID: legalContent');
        }
    }
