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
      <h1 class="text-4xl font-bold mb-4">Warranty & Repair Policy</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Time-Based Coverage for Physical Items</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>WARRANTY & REPAIR POLICY</h2>
      <p>This policy outlines warranty coverage and repair procedures for HingeCraft Global physical products.</p>

      <h2>I. WARRANTY COVERAGE</h2>
      
      <h3>1.1 Standard Warranty</h3>
      <ul>
        <li><strong>Duration:</strong> 1 year from purchase</li>
        <li><strong>Coverage:</strong> Defects in materials and workmanship</li>
        <li><strong>Remedy:</strong> Repair or replacement</li>
      </ul>

      <h3>1.2 Extended Warranty</h3>
      <ul>
        <li><strong>Duration:</strong> 2-3 years (as purchased)</li>
        <li><strong>Coverage:</strong> Extended protection</li>
        <li><strong>Remedy:</strong> Repair, replacement, or refund</li>
      </ul>

      <h2>II. WARRANTY EXCLUSIONS</h2>
      <p>Warranty does not cover:</p>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from misuse</li>
        <li>Modifications or unauthorized repairs</li>
        <li>Acts of nature</li>
        <li>Cosmetic damage</li>
      </ul>

      <h2>III. WARRANTY CLAIMS</h2>
      <p>To make a warranty claim:</p>
      <ol>
        <li>Contact customer service</li>
        <li>Provide proof of purchase</li>
        <li>Describe the issue</li>
        <li>Provide photos if requested</li>
        <li>Follow return instructions</li>
      </ol>

      <h2>IV. REPAIR SERVICES</h2>
      <p>Repair services available for:</p>
      <ul>
        <li>Warranty-covered defects</li>
        <li>Out-of-warranty repairs (fee applies)</li>
        <li>Damage assessment</li>
      </ul>

      <h2>V. REPLACEMENT POLICY</h2>
      <p>If repair is not feasible, we will replace the product with the same or equivalent item.</p>
        
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
