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
      <h1 class="text-4xl font-bold mb-4">Cross-Border Data Transfer & Hosting Agreement</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Required for EU → US Transfers & Multi-Region Scaling</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>CROSS-BORDER DATA TRANSFER & HOSTING AGREEMENT</h2>
      <p>This agreement governs cross-border data transfers, particularly EU to US transfers, and multi-region data hosting.</p>

      <h2>I. DATA TRANSFER FRAMEWORK</h2>
      
      <h3>1.1 Legal Basis</h3>
      <p>Transfers are based on:</p>
      <ul>
        <li>Standard Contractual Clauses (SCCs)</li>
        <li>Adequacy decisions</li>
        <li>Appropriate safeguards</li>
        <li>User consent when required</li>
      </ul>

      <h3>1.2 Transfer Mechanisms</h3>
      <ul>
        <li>EU-US Data Privacy Framework</li>
        <li>Standard Contractual Clauses</li>
        <li>Binding Corporate Rules</li>
        <li>Other approved mechanisms</li>
      </ul>

      <h2>II. DATA HOSTING</h2>
      
      <h3>2.1 Hosting Locations</h3>
      <p>Data may be hosted in:</p>
      <ul>
        <li>United States</li>
        <li>European Union</li>
        <li>Other regions as specified</li>
      </ul>

      <h3>2.2 Data Localization</h3>
      <p>Where required by law, data is localized to specific jurisdictions.</p>

      <h2>III. SAFEGUARDS</h2>
      <ul>
        <li>Encryption in transit and at rest</li>
        <li>Access controls</li>
        <li>Audit logs</li>
        <li>Security assessments</li>
      </ul>

      <h2>IV. USER RIGHTS</h2>
      <p>Users maintain rights to:</p>
      <ul>
        <li>Access their data</li>
        <li>Request data portability</li>
        <li>Request deletion</li>
        <li>Object to processing</li>
      </ul>

      <h2>V. NOTIFICATION</h2>
      <p>Users are notified of data transfers and hosting locations through our Privacy Policy.</p>
        
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
