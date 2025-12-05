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
      <h1 class="text-4xl font-bold mb-4">Refunds, Warranty & Return Policy</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Consumer Rights, Refund Logic, Product Guarantee</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>REFUNDS, WARRANTY & RETURN POLICY</h2>
      <p>This policy outlines refund procedures, warranty coverage, and return processes for HingeCraft Global products and services.</p>

      <h2>I. REFUND POLICY</h2>
      
      <h3>1.1 Digital Products</h3>
      <ul>
        <li>Refunds available within 30 days of purchase</li>
        <li>No refunds for downloaded or used digital products</li>
        <li>Refunds processed within 10 business days</li>
      </ul>

      <h3>1.2 Physical Products</h3>
      <ul>
        <li>Returns accepted within 30 days of delivery</li>
        <li>Products must be unused and in original packaging</li>
        <li>Customer responsible for return shipping</li>
      </ul>

      <h3>1.3 Services</h3>
      <ul>
        <li>Pro-rated refunds for unused service periods</li>
        <li>No refunds for completed services</li>
        <li>Refunds processed within 14 business days</li>
      </ul>

      <h2>II. WARRANTY</h2>
      
      <h3>2.1 Product Warranty</h3>
      <p>Physical products are warranted against defects in materials and workmanship for:</p>
      <ul>
        <li><strong>Standard:</strong> 1 year from purchase</li>
        <li><strong>Premium:</strong> 2 years from purchase</li>
      </ul>

      <h3>2.2 Warranty Exclusions</h3>
      <p>Warranty does not cover:</p>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from misuse</li>
        <li>Modifications or repairs by unauthorized parties</li>
        <li>Acts of nature</li>
      </ul>

      <h3>2.3 Warranty Claims</h3>
      <p>Submit warranty claims to: <a href="mailto:warranty@hingecraft-global.ai">warranty@hingecraft-global.ai</a></p>

      <h2>III. RETURN PROCESS</h2>
      <ol>
        <li>Contact customer service for return authorization</li>
        <li>Receive return shipping label (if applicable)</li>
        <li>Package product securely</li>
        <li>Ship to designated return address</li>
        <li>Receive refund or replacement</li>
      </ol>

      <h2>IV. CONSUMER RIGHTS</h2>
      <p>This policy does not affect your statutory consumer rights under applicable law.</p>
        
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
