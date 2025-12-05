// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Write your JavaScript here
    
    // Load legal page content
    loadLegalPageContent();
    
    // To select an element by ID use: $w('#elementID')
    
    // Click 'Preview' to run your code
});

/**
 * Load legal page HTML content
 */
function loadLegalPageContent() {
    // Get HTML content from file
    const htmlContent = `
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
        <p class="text-sm text-gray-600">For questions about this document, please contact: <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></p>
      </div>
    </div>
  
      <div class="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>GDPR Compliant</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>CCPA Compliant</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>Secure & Encrypted</span>
        </div>
      </div>
    
</main>

  <footer class="bg-gray-900 text-white py-12 px-6 mt-16">
    <div class="max-w-4xl mx-auto text-center">
      <p class="mb-4">&copy; 2025 HingeCraft Global. All rights reserved.</p>
      <p class="text-gray-400 text-sm">
        <a href="/legal" class="hover:text-white">Legal</a> | 
        <a href="/privacy" class="hover:text-white">Privacy</a> | 
        <a href="/terms" class="hover:text-white">Terms</a>
      </p>
    </div>
  </footer>
`;
    
    // Find HTML element on page (you'll need to add this in Wix Editor)
    const htmlElement = $w('#legalContent');
    
    if (htmlElement) {
        htmlElement.html = htmlContent;
    } else {
        console.log('Legal page content loaded. Add HTML element with ID: legalContent');
    }
}
