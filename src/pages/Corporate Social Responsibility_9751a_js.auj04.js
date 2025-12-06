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

$w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
