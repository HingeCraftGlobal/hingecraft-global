// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

// SEO Configuration for HC Global Core
import { seo } from 'wix-seo';

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
