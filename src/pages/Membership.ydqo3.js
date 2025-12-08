// HingeCraft Global - SEO Optimized
// HingeCraft Membership | Join Our Network
// Generated: December 6, 2025

import wixSeo from 'wix-seo';

$w.onReady(function () {
    // Set page title
    wixSeo.setTitle("HingeCraft Membership | Join Our Network");
    
    // Set meta tags
    wixSeo.setMetaTags([
        { name: "description", content: "Become a HingeCraft member and access exclusive manufacturing resources, partner discounts, and community benefits." },
        { name: "keywords", content: "membership, join hingecraft, member benefits, manufacturing network, exclusive access" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "HingeCraft Membership | Join Our Network" },
        { property: "og:description", content: "Become a HingeCraft member and access exclusive manufacturing resources, partner discounts, and community benefits." },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HingeCraft Global" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: "HingeCraft Membership | Join Our Network" },
        { property: "twitter:description", content: "Become a HingeCraft member and access exclusive manufacturing resources, partner discounts, and community benefits." }
    ]);
    
    // Set structured data (JSON-LD)
    wixSeo.setStructuredData([
        {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "HingeCraft Membership | Join Our Network",
        "description": "Become a HingeCraft member and access exclusive manufacturing resources, partner discounts, and community benefits.",
        "url": "https://www.hingecraft.com/membership.ydqo3",
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
                        "name": "HingeCraft Membership",
                        "item": "https://www.hingecraft.com/membership.ydqo3"
                }
        ]
}
    ]);
});


// Original page code below
// Comprehensive SEO Optimization - Membership
// JSON-LD Schema.org | 100+ Keywords | Competitive Optimization

$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Membership - HingeCraft Global. Comprehensive information, resources, and services.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'ip rights, membership terms, membership agreement, hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership | HingeCraft Global',
            'og:description': 'Membership - HingeCraft Global. Comprehensive information, resources, and services.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/membership',
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
            'twitter:title': 'Membership | HingeCraft Global',
            'twitter:description': 'Membership - HingeCraft Global. Comprehensive information, resources, and services.',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/membership');
        
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
  "name": "Membership | HingeCraft Global",
  "description": "Membership - HingeCraft Global. Comprehensive information, resources, and services.",
  "url": "https://hingecraft-global.ai/membership",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "ip rights, membership terms, membership agreement, hingecraft, hingecraft global, resilient design"
}`;
    }

});


$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Membership - HingeCraft Global. Comprehensive information and resources.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'ip rights, membership terms, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership | HingeCraft Global',
            'og:description': 'Membership - HingeCraft Global. Comprehensive information and resources.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/membership',
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
            'twitter:title': 'Membership | HingeCraft Global',
            'twitter:description': 'Membership - HingeCraft Global. Comprehensive information and resources.',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/membership');
        
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
  "name": "Membership | HingeCraft Global",
  "description": "Membership - HingeCraft Global. Comprehensive information and resources.",
  "url": "https://hingecraft-global.ai/membership",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "ip rights, membership terms, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Membership - HingeCraft Global. Comprehensive information and resources.');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'ip rights, membership terms, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership | HingeCraft Global',
            'og:description': 'Membership - HingeCraft Global. Comprehensive information and resources.',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/membership',
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
            'twitter:title': 'Membership | HingeCraft Global',
            'twitter:description': 'Membership - HingeCraft Global. Comprehensive information and resources.',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/membership');
        
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
  "name": "Membership | HingeCraft Global",
  "description": "Membership - HingeCraft Global. Comprehensive information and resources.",
  "url": "https://hingecraft-global.ai/membership",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "ip rights, membership terms, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Set page SEO
    seo.setTitle('Materials Sourcing & Ethical Compliance Agreement | HingeCraft Global');
    seo.setDescription('HingeCraft Global Materials Sourcing & Ethical Compliance Agreement - Agreement ensuring ethical sourcing and sustainability compliance');
    seo.setKeywords('HingeCraft, Ethical Sourcing, Sustainability, Recycled Materials, Supply Chain Ethics');
    
    // Set Open Graph
    seo.setOgTitle('Materials Sourcing & Ethical Compliance Agreement | HingeCraft Global');
    seo.setOgDescription('HingeCraft Global Materials Sourcing & Ethical Compliance Agreement - Agreement ensuring ethical sourcing and sustainability compliance');
    seo.setOgImage('https://hingecraft-global.ai/og-image.jpg');
    
    // Set canonical and robots
    seo.setCanonicalUrl(window.location.href);
    seo.setRobots('index, follow');
});

    $w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
