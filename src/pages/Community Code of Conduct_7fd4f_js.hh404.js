// Comprehensive SEO Optimization - Community Code of Conduct_7fd4f_js
// JSON-LD Schema.org | 100+ Keywords | Competitive Optimization

$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Community Code of Conduct | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, code of conduct, hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Community Code of Conduct | HingeCraft Global',
            'og:description': 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/legal/27-community-code-of-conduct',
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
            'twitter:title': 'Community Code of Conduct | HingeCraft Global',
            'twitter:description': 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/legal/27-community-code-of-conduct');
        
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
  "@type": "LegalDocument",
  "name": "Community Code of Conduct | HingeCraft Global",
  "description": "HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines",
  "url": "https://hingecraft-global.ai/legal/27-community-code-of-conduct",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, code of conduct, hingecraft, hingecraft global, resilient design"
}`;
    }

    // Load Legal Page HTML Content
    function loadLegalPageContent() {
        const htmlElement = $w('#legalContent');
        if (htmlElement) {
            const htmlContent = `<body class="bg-slate-50">
<section class="hero-gradient text-white py-12 px-6">
<div class="max-w-4xl mx-auto text-center">
<h1 class="text-4xl font-bold mb-4">Community Code of Conduct</h1>
<p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
<p class="text-sm opacity-75 mt-2">Gen-Z Aligned Rules, Moderation, Safety</p>
</div>
</section>
<main class="max-w-4xl mx-auto px-6 py-16">
<div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
<h2>COMMUNITY CODE OF CONDUCT</h2>
<p>This Code of Conduct establishes expectations for respectful, inclusive, and safe participation in the HingeCraft Global community.</p>
<h2>I. OUR VALUES</h2>
<ul>
<li><strong>Respect:</strong> Treat everyone with dignity</li>
<li><strong>Inclusion:</strong> Welcome diverse perspectives</li>
<li><strong>Safety:</strong> Create safe spaces</li>
<li><strong>Integrity:</strong> Be honest and authentic</li>
<li><strong>Collaboration:</strong> Work together constructively</li>
</ul>
<h2>II. EXPECTED BEHAVIOR</h2>
<ul>
<li>Be respectful and kind</li>
<li>Listen to different viewpoints</li>
<li>Give constructive feedback</li>
<li>Help others learn</li>
<li>Celebrate diversity</li>
<li>Take responsibility for your actions</li>
</ul>
<h2>III. PROHIBITED BEHAVIOR</h2>
<p>Do not:</p>
<ul>
<li>Harass, bully, or threaten</li>
<li>Discriminate or use hate speech</li>
<li>Share harmful or illegal content</li>
<li>Spam or self-promote excessively</li>
<li>Impersonate others</li>
<li>Violate privacy</li>
</ul>
<h2>IV. MODERATION</h2>
<p>Moderators may:</p>
<ul>
<li>Remove violating content</li>
<li>Warn or suspend accounts</li>
<li>Ban repeat offenders</li>
<li>Report to authorities when necessary</li>
</ul>
<h2>V. REPORTING</h2>
<p>Report violations to: <a href="mailto:community@hingecraft-global.ai">community@hingecraft-global.ai</a></p>
<p>All reports are reviewed confidentially.</p>
<h2>VI. CONSEQUENCES</h2>
<p>Violations may result in:</p>
<ul>
<li>Warning</li>
<li>Temporary suspension</li>
<li>Permanent ban</li>
<li>Legal action if warranted</li>
</ul>
<div class="mt-8 pt-8 border-t border-gray-200">
<p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
<p class="text-sm text-gray-600">For questions about this document, please contact: <a class="text-purple-700 hover:underline" href="mailto:legal@hingecraft-global.ai">legal@hingecraft-global.ai</a></p>
</div>
</div>
<div class="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
<div class="flex items-center gap-2">
<svg class="w-5 h-5 text-green-600" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill-rule="evenodd"></path>
</svg>
<span>GDPR Compliant</span>
</div>
<div class="flex items-center gap-2">
<svg class="w-5 h-5 text-green-600" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill-rule="evenodd"></path>
</svg>
<span>CCPA Compliant</span>
</div>
<div class="flex items-center gap-2">
<svg class="w-5 h-5 text-green-600" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill-rule="evenodd"></path>
</svg>
<span>Secure &amp; Encrypted</span>
</div>
</div>
</main>
<footer class="bg-gray-900 text-white py-12 px-6 mt-16">
<div class="max-w-4xl mx-auto text-center">
<p class="mb-4">© 2025 HingeCraft Global. All rights reserved.</p>
<p class="text-gray-400 text-sm">
<a class="hover:text-white" href="/legal">Legal</a> | 
        <a class="hover:text-white" href="/privacy">Privacy</a> | 
        <a class="hover:text-white" href="/terms">Terms</a>
</p>
</div>
</footer>
</body>`;
            htmlElement.html = htmlContent;
            console.log('Legal page content loaded successfully');
        } else {
            console.log('Legal content element not found. Add HTML element with ID: legalContent');
        }
    }
    
    loadLegalPageContent();

});


$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Community Code of Conduct_7fd4f_js | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Community Code of Conduct_7fd4f_js - HingeCraft Global');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Community Code of Conduct_7fd4f_js | HingeCraft Global',
            'og:description': 'Community Code of Conduct_7fd4f_js - HingeCraft Global',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js',
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
            'twitter:title': 'Community Code of Conduct_7fd4f_js | HingeCraft Global',
            'twitter:description': 'Community Code of Conduct_7fd4f_js - HingeCraft Global',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js');
        
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
  "name": "Community Code of Conduct_7fd4f_js | HingeCraft Global",
  "description": "Community Code of Conduct_7fd4f_js - HingeCraft Global",
  "url": "https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Community Code of Conduct_7fd4f_js | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Community Code of Conduct_7fd4f_js - HingeCraft Global');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Community Code of Conduct_7fd4f_js | HingeCraft Global',
            'og:description': 'Community Code of Conduct_7fd4f_js - HingeCraft Global',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js',
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
            'twitter:title': 'Community Code of Conduct_7fd4f_js | HingeCraft Global',
            'twitter:description': 'Community Code of Conduct_7fd4f_js - HingeCraft Global',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js');
        
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
  "name": "Community Code of Conduct_7fd4f_js | HingeCraft Global",
  "description": "Community Code of Conduct_7fd4f_js - HingeCraft Global",
  "url": "https://hingecraft-global.ai/community-code-of-conduct-7fd4f-js",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Community Code of Conduct | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, community standards, code of conduct, community resilience framework, charter of abundance sign, hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Community Code of Conduct | HingeCraft Global',
            'og:description': 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/legal/community_code_of_conduct',
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
            'twitter:title': 'Community Code of Conduct | HingeCraft Global',
            'twitter:description': 'HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/legal/community_code_of_conduct');
        
        // Robots Meta
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Schema.org JSON-LD
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalDocument",
            "name": "Community Code of Conduct | HingeCraft Global",
            "description": "HingeCraft Global Community Code of Conduct - Gen-Z aligned community rules, moderation policies, and safety guidelines",
            "url": "https://hingecraft-global.ai/legal/community_code_of_conduct",
            "publisher": {
                "@type": "Organization",
                "name": "HingeCraft Global",
                "url": "https://hingecraft-global.ai",
                "logo": "https://hingecraft-global.ai/logo.png"
            },
            "datePublished": "2025-12-05",
            "dateModified": "2025-12-05",
            "inLanguage": "en-US",
            "keywords": "charter of abundance, community resilience, terms of service, community code of conduct, community guidelines, community standards, code of conduct, community resilience framework, charter of abundance sign, hingecraft, hingecraft global, resilient design"
        });
    }
});


// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});


// Load Legal Page HTML Content

$w.onReady(function () {
    loadLegalPageContent();
});
