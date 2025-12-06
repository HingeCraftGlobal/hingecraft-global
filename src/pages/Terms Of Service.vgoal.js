// SEO Configuration
$w.onReady(function () {
    // Set page title
    if (typeof document !== 'undefined') {
        document.title = ' | HingeCraft Global';
    }
    
    // Set meta tags via Wix SEO (if available)
    try {
        import({ seo } from 'wix-seo').then(seoModule => {
            seoModule.seo.setTitle(' | HingeCraft Global');
            seoModule.seo.setDescription('');
            seoModule.seo.setKeywords('');
            seoModule.seo.setOgTitle('');
            seoModule.seo.setOgDescription('');
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

// SEO Configuration for Terms of Service
    import wixSeo from 'wix-seo';
    
    $w.onReady(function () {
        // Set SEO meta tags
        wixSeo.setTitle('Universal Terms of Service | HingeCraft Global');
        wixSeo.setDescription('HingeCraft Global Universal Terms of Service - Master contract covering platform access, user rights, and responsibilities');
        wixSeo.setKeywords('HingeCraft, Terms of Service, User Agreement, Platform Terms, Legal Contract');
        
        // Set Open Graph tags
        wixSeo.setOgTitle('Universal Terms of Service | HingeCraft Global');
        wixSeo.setOgDescription('HingeCraft Global Universal Terms of Service - Master contract covering platform access, user rights, and responsibilities');
        wixSeo.setOgImage('https://hingecraft-global.ai/og-image.jpg');
        wixSeo.setOgUrl('https://hingecraft-global.ai/legal/universal-terms-of-service');
        
        // Set canonical URL
        wixSeo.setCanonicalUrl('https://hingecraft-global.ai/legal/universal-terms-of-service');
        
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
