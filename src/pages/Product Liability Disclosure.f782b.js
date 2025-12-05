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
      <h1 class="text-4xl font-bold mb-4">Product Liability & Safety Disclosure</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Required for Any Product Users Sit/Stand On</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>PRODUCT LIABILITY & SAFETY DISCLOSURE</h2>
      <p>This disclosure addresses product liability and safety considerations for HingeCraft Global physical products, particularly furniture and items users sit or stand on.</p>

      <h2>I. PRODUCT SAFETY STANDARDS</h2>
      <p>Our products comply with:</p>
      <ul>
        <li>Applicable safety regulations</li>
        <li>Industry standards</li>
        <li>Load-bearing requirements</li>
        <li>Material safety standards</li>
      </ul>

      <h2>II. SAFETY WARNINGS</h2>
      <p>Users must:</p>
      <ul>
        <li>Follow assembly instructions</li>
        <li>Use products as intended</li>
        <li>Check weight capacity</li>
        <li>Inspect products regularly</li>
        <li>Not exceed recommended limits</li>
      </ul>

      <h2>III. LIABILITY LIMITATIONS</h2>
      <p>HingeCraft Global's liability is limited to:</p>
      <ul>
        <li>Product replacement or repair</li>
        <li>Refund of purchase price</li>
        <li>As permitted by applicable law</li>
      </ul>
      <p>We are not liable for:</p>
      <ul>
        <li>Misuse or modification</li>
        <li>Consequential damages</li>
        <li>Injury from improper use</li>
      </ul>

      <h2>IV. RECALL PROCEDURES</h2>
      <p>In the event of a safety issue, we will:</p>
      <ul>
        <li>Notify affected customers</li>
        <li>Provide repair or replacement</li>
        <li>Coordinate recalls if necessary</li>
      </ul>

      <h2>V. REPORTING SAFETY ISSUES</h2>
      <p>Report safety concerns to: <a href="mailto:safety@hingecraft-global.ai">safety@hingecraft-global.ai</a></p>
        
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
