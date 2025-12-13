// HingeCraft Global - Mission Support Page
// Updated: December 13, 2025 - Fully synced with Charter page
// Using direct imports from .jsw files (no HTTP overhead, works immediately)

import wixSeo from 'wix-seo';
import { onReady } from 'backend/mission-support-middleware';

$w.onReady(async function () {
    // Set SEO
    wixSeo.setTitle("Mission Support | HingeCraft Global");
    wixSeo.setMetaTags([
        { name: "description", content: "Support HingeCraft's mission. Fill out the Mission Support form to contribute." }
    ]);
    
    // Initialize middleware via direct import (no HTTP overhead)
    const middlewareResult = await onReady();
    
    if (middlewareResult.success) {
        console.log('✅ Mission Support page initialized');
        console.log('💰 Cumulative total:', middlewareResult.cumulativeTotal);
    } else {
        console.error('❌ Mission Support middleware initialization failed:', middlewareResult.error);
    }
    
    // Form submission is handled by embedded HTML
    // HTML uses HTTP endpoints (.web.js files) for cross-origin compatibility
});
