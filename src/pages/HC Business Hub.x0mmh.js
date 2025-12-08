// HingeCraft Global - SEO Optimized
// HingeCraft Business Hub | Enterprise Manufacturing Solutions
// Generated: December 6, 2025

import wixSeo from 'wix-seo';

$w.onReady(function () {
    // Set page title
    wixSeo.setTitle("HingeCraft Business Hub | Enterprise Manufacturing Solutions");
    
    // Set meta tags
    wixSeo.setMetaTags([
        { name: "description", content: "HingeCraft Business Hub - your central portal for enterprise manufacturing, B2B partnerships, and scalable production solutions worldwide." },
        { name: "keywords", content: "business hub, enterprise manufacturing, B2B solutions, manufacturing portal, business platform" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "HingeCraft Business Hub | Enterprise Manufacturing Solutions" },
        { property: "og:description", content: "HingeCraft Business Hub - your central portal for enterprise manufacturing, B2B partnerships, and scalable production solutions worldwide." },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HingeCraft Global" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: "HingeCraft Business Hub | Enterprise Manufacturing Solutions" },
        { property: "twitter:description", content: "HingeCraft Business Hub - your central portal for enterprise manufacturing, B2B partnerships, and scalable production solutions worldwide." }
    ]);
    
    // Set structured data (JSON-LD)
    wixSeo.setStructuredData([
        {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "HingeCraft Business Hub | Enterprise Manufacturing Solutions",
        "description": "HingeCraft Business Hub - your central portal for enterprise manufacturing, B2B partnerships, and scalable production solutions worldwide.",
        "url": "https://www.hingecraft.com/hc-business-hub.x0mmh",
        "inLanguage": "en-US",
        "dateModified": "2025-12-06",
        "publisher": {
                "@type": "Organization",
                "name": "HingeCraft Global",
                "url": "https://www.hingecraft.com",
                "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.hingecraft.com/logo.png"
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
                        "item": "https://www.hingecraft.com"
                },
                {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "HingeCraft Business Hub",
                        "item": "https://www.hingecraft.com/hc-business-hub.x0mmh"
                }
        ]
}
    ]);
});


// Original page code below
// Comprehensive SEO Optimization - HC Business Hub
// JSON-LD Schema.org | 100+ Keywords | Competitive Optimization

$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'HC Business Hub | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HC Business Hub - HingeCraft Global. Comprehensive information, resources, and services.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'HC Business Hub | HingeCraft Global',
            'og:description': 'HC Business Hub - HingeCraft Global. Comprehensive information, resources, and services.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/hc-business-hub',
            'og:type': 'website',
            'og:site_name': 'HingeCraft Global'
        };
        
        Object.keys(ogTags).forEach(prop => {
            let ogMeta = document.querySelector(`meta[property="${prop}"]`);
            if (!ogMeta) {
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', prop);
                document.head.appendChild(ogMeta);
            }
            ogMeta.setAttribute('content', ogTags[prop]);
        });
        
        // Twitter Card Tags
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'HC Business Hub | HingeCraft Global',
            'twitter:description': 'HC Business Hub - HingeCraft Global. Comprehensive information, resources, and services.',
            'twitter:image': 'https://hingecraft-global.ai/og-image.jpg'
        };
        
        Object.keys(twitterTags).forEach(name => {
            let twitterMeta = document.querySelector(`meta[name="${name}"]`);
            if (!twitterMeta) {
                twitterMeta = document.createElement('meta');
                twitterMeta.setAttribute('name', name);
                document.head.appendChild(twitterMeta);
            }
            twitterMeta.setAttribute('content', twitterTags[name]);
        });
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://hingecraft-global.ai/hc-business-hub');
        
        // Robots Meta
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Additional Meta Tags
        const additionalTags = {
            'author': 'HingeCraft Global',
            'language': 'en-US',
            'revisit-after': '7 days',
            'distribution': 'global',
            'rating': 'general'
        };
        
        Object.keys(additionalTags).forEach(name => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', additionalTags[name]);
        });
        
        // Schema.org JSON-LD Structured Data
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "HC Business Hub | HingeCraft Global",
  "description": "HC Business Hub - HingeCraft Global. Comprehensive information, resources, and services.",
  "url": "https://hingecraft-global.ai/hc-business-hub",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "hingecraft, hingecraft global, resilient design"
}`;
    }

});


$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'HC Business Hub | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'HC Business Hub | HingeCraft Global',
            'og:description': 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/hc-business-hub',
            'og:type': 'website',
            'og:site_name': 'HingeCraft Global'
        };
        
        Object.keys(ogTags).forEach(prop => {
            let ogMeta = document.querySelector(`meta[property="${prop}"]`);
            if (!ogMeta) {
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', prop);
                document.head.appendChild(ogMeta);
            }
            ogMeta.setAttribute('content', ogTags[prop]);
        });
        
        // Twitter Card Tags
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'HC Business Hub | HingeCraft Global',
            'twitter:description': 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.',
            'twitter:image': 'https://hingecraft-global.ai/og-image.jpg'
        };
        
        Object.keys(twitterTags).forEach(name => {
            let twitterMeta = document.querySelector(`meta[name="${name}"]`);
            if (!twitterMeta) {
                twitterMeta = document.createElement('meta');
                twitterMeta.setAttribute('name', name);
                document.head.appendChild(twitterMeta);
            }
            twitterMeta.setAttribute('content', twitterTags[name]);
        });
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://hingecraft-global.ai/hc-business-hub');
        
        // Robots Meta
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Schema.org JSON-LD Structured Data
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "HC Business Hub | HingeCraft Global",
  "description": "HC Business Hub - HingeCraft Global. Comprehensive information and resources.",
  "url": "https://hingecraft-global.ai/hc-business-hub",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'HC Business Hub | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'HC Business Hub | HingeCraft Global',
            'og:description': 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/hc-business-hub',
            'og:type': 'website',
            'og:site_name': 'HingeCraft Global'
        };
        
        Object.keys(ogTags).forEach(prop => {
            let ogMeta = document.querySelector(`meta[property="${prop}"]`);
            if (!ogMeta) {
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', prop);
                document.head.appendChild(ogMeta);
            }
            ogMeta.setAttribute('content', ogTags[prop]);
        });
        
        // Twitter Card Tags
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'HC Business Hub | HingeCraft Global',
            'twitter:description': 'HC Business Hub - HingeCraft Global. Comprehensive information and resources.',
            'twitter:image': 'https://hingecraft-global.ai/og-image.jpg'
        };
        
        Object.keys(twitterTags).forEach(name => {
            let twitterMeta = document.querySelector(`meta[name="${name}"]`);
            if (!twitterMeta) {
                twitterMeta = document.createElement('meta');
                twitterMeta.setAttribute('name', name);
                document.head.appendChild(twitterMeta);
            }
            twitterMeta.setAttribute('content', twitterTags[name]);
        });
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://hingecraft-global.ai/hc-business-hub');
        
        // Robots Meta
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Schema.org JSON-LD Structured Data
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "HC Business Hub | HingeCraft Global",
  "description": "HC Business Hub - HingeCraft Global. Comprehensive information and resources.",
  "url": "https://hingecraft-global.ai/hc-business-hub",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
