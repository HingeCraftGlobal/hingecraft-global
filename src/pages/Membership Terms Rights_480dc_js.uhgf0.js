// Comprehensive SEO Optimization - Membership Terms Rights_480dc_js
// JSON-LD Schema.org | 100+ Keywords | Competitive Optimization

$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership Terms & Rights | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, warranty terms, membership agreement, hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership Terms & Rights | HingeCraft Global',
            'og:description': 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/legal/26-membership-terms-rights',
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
            'twitter:title': 'Membership Terms & Rights | HingeCraft Global',
            'twitter:description': 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/legal/26-membership-terms-rights');
        
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
  "name": "Membership Terms & Rights | HingeCraft Global",
  "description": "HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies",
  "url": "https://hingecraft-global.ai/legal/26-membership-terms-rights",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, warranty terms, membership agreement, hingecraft, hingecraft global, resilient design"
}`;
    }

    // Load Legal Page HTML Content
    function loadLegalPageContent() {
        const htmlElement = $w('#legalContent');
        if (htmlElement) {
            const htmlContent = `<body class="bg-slate-50">
<section class="hero-gradient text-white py-12 px-6">
<div class="max-w-4xl mx-auto text-center">
<h1 class="text-4xl font-bold mb-4">Membership Terms &amp; Rights</h1>
<p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
<p class="text-sm opacity-75 mt-2">Access Levels, Perks, Cancellation</p>
</div>
</section>
<main class="max-w-4xl mx-auto px-6 py-16">
<div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
<h2>MEMBERSHIP TERMS &amp; RIGHTS</h2>
<p>This document outlines membership terms, access levels, benefits, and cancellation policies for HingeCraft Global members.</p>
<h2>I. MEMBERSHIP TIERS</h2>
<h3>1.1 Basic Membership</h3>
<ul>
<li>Free access to basic features</li>
<li>Limited design storage</li>
<li>Community access</li>
<li>Basic support</li>
</ul>
<h3>1.2 Premium Membership</h3>
<ul>
<li>All basic features</li>
<li>Unlimited design storage</li>
<li>Advanced AI tools</li>
<li>Priority support</li>
<li>Exclusive content</li>
</ul>
<h3>1.3 Enterprise Membership</h3>
<ul>
<li>All premium features</li>
<li>Custom integrations</li>
<li>Dedicated support</li>
<li>Volume discounts</li>
<li>SLA guarantees</li>
</ul>
<h2>II. MEMBER RIGHTS</h2>
<ul>
<li>Access to platform features per tier</li>
<li>Data privacy and control</li>
<li>Fair treatment</li>
<li>Dispute resolution</li>
<li>Account cancellation</li>
</ul>
<h2>III. MEMBER OBLIGATIONS</h2>
<ul>
<li>Comply with Terms of Service</li>
<li>Maintain account security</li>
<li>Pay fees when due</li>
<li>Respect other members</li>
</ul>
<h2>IV. CANCELLATION</h2>
<h3>4.1 Cancellation Rights</h3>
<p>Members may cancel at any time through account settings or by contacting support.</p>
<h3>4.2 Refund Policy</h3>
<p>Refunds provided per our Refund Policy. Annual memberships may be prorated.</p>
<h3>4.3 Effect of Cancellation</h3>
<p>Upon cancellation:</p>
<ul>
<li>Access continues until period end</li>
<li>Data available for export</li>
<li>No further charges</li>
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
<div class="mt-8 pt-8 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg">
<h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
<p class="text-lg text-gray-700 mb-6">Join thousands of creators building resilient systems with HingeCraft Global.</p>
<div class="flex flex-wrap gap-4">
<a class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg" href="/membership">
            Join Now
          </a>
<a class="bg-white border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition" href="/contact">
            Contact Us
          </a>
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
        document.title = 'Membership Terms Rights_480dc_js | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Membership Terms Rights_480dc_js - HingeCraft Global');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership Terms Rights_480dc_js | HingeCraft Global',
            'og:description': 'Membership Terms Rights_480dc_js - HingeCraft Global',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/membership-terms-rights-480dc-js',
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
            'twitter:title': 'Membership Terms Rights_480dc_js | HingeCraft Global',
            'twitter:description': 'Membership Terms Rights_480dc_js - HingeCraft Global',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/membership-terms-rights-480dc-js');
        
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
  "name": "Membership Terms Rights_480dc_js | HingeCraft Global",
  "description": "Membership Terms Rights_480dc_js - HingeCraft Global",
  "url": "https://hingecraft-global.ai/membership-terms-rights-480dc-js",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership Terms Rights_480dc_js | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Membership Terms Rights_480dc_js - HingeCraft Global');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, hingecraft, hingecraft global');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership Terms Rights_480dc_js | HingeCraft Global',
            'og:description': 'Membership Terms Rights_480dc_js - HingeCraft Global',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/membership-terms-rights-480dc-js',
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
            'twitter:title': 'Membership Terms Rights_480dc_js | HingeCraft Global',
            'twitter:description': 'Membership Terms Rights_480dc_js - HingeCraft Global',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/membership-terms-rights-480dc-js');
        
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
  "name": "Membership Terms Rights_480dc_js | HingeCraft Global",
  "description": "Membership Terms Rights_480dc_js - HingeCraft Global",
  "url": "https://hingecraft-global.ai/membership-terms-rights-480dc-js",
  "publisher": {
    "@type": "Organization",
    "name": "HingeCraft Global",
    "url": "https://hingecraft-global.ai",
    "logo": "https://hingecraft-global.ai/logo.png"
  },
  "datePublished": "2025-12-05",
  "dateModified": "2025-12-05",
  "inLanguage": "en-US",
  "keywords": "terms of service, user rights, legal terms, ip rights, attribution rights, creator rights, membership terms, hingecraft, hingecraft global"
}`;
    }
    
    // Load HTML content for legal pages
    
});




$w.onReady(function () {
    if (typeof document !== 'undefined') {
        // Page Title
        document.title = 'Membership Terms & Rights | HingeCraft Global';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'terms of service, user rights, legal terms, board member agreement, ip rights, attribution rights, creator rights, derivative rights, warranty terms, membership terms, membership rights, membership agreement, hingecraft terms of service, hingecraft membership, hingecraft, hingecraft global, resilient design');
        
        // Open Graph Tags
        const ogTags = {
            'og:title': 'Membership Terms & Rights | HingeCraft Global',
            'og:description': 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai/legal/membership_terms_rights',
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
            'twitter:title': 'Membership Terms & Rights | HingeCraft Global',
            'twitter:description': 'HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies',
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
        canonical.setAttribute('href', 'https://hingecraft-global.ai/legal/membership_terms_rights');
        
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
            "name": "Membership Terms & Rights | HingeCraft Global",
            "description": "HingeCraft Global Membership Terms & Rights - Membership access levels, benefits, and cancellation policies",
            "url": "https://hingecraft-global.ai/legal/membership_terms_rights",
            "publisher": {
                "@type": "Organization",
                "name": "HingeCraft Global",
                "url": "https://hingecraft-global.ai",
                "logo": "https://hingecraft-global.ai/logo.png"
            },
            "datePublished": "2025-12-05",
            "dateModified": "2025-12-05",
            "inLanguage": "en-US",
            "keywords": "terms of service, user rights, legal terms, board member agreement, ip rights, attribution rights, creator rights, derivative rights, warranty terms, membership terms, membership rights, membership agreement, hingecraft terms of service, hingecraft membership, hingecraft, hingecraft global, resilient design"
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
