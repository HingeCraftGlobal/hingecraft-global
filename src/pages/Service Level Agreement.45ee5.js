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
      <h1 class="text-4xl font-bold mb-4">Service Level Agreement (SLA)</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">For Enterprise, Schools, Governments</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>SERVICE LEVEL AGREEMENT</h2>
      <p>This Service Level Agreement ("SLA") defines service commitments for enterprise, educational, and government customers.</p>

      <h2>I. SERVICE AVAILABILITY</h2>
      
      <h3>1.1 Uptime Commitment</h3>
      <ul>
        <li><strong>Standard:</strong> 99.0% uptime</li>
        <li><strong>Premium:</strong> 99.9% uptime</li>
        <li><strong>Enterprise:</strong> 99.95% uptime</li>
      </ul>

      <h3>1.2 Scheduled Maintenance</h3>
      <p>Maintenance windows are scheduled during low-usage periods with advance notice.</p>

      <h2>II. SUPPORT LEVELS</h2>
      
      <h3>2.1 Response Times</h3>
      <ul>
        <li><strong>Critical:</strong> 1 hour</li>
        <li><strong>High:</strong> 4 hours</li>
        <li><strong>Medium:</strong> 24 hours</li>
        <li><strong>Low:</strong> 48 hours</li>
      </ul>

      <h3>2.2 Support Channels</h3>
      <ul>
        <li>Email support</li>
        <li>Phone support (Enterprise)</li>
        <li>Dedicated account manager (Enterprise)</li>
        <li>24/7 support (Enterprise)</li>
      </ul>

      <h2>III. PERFORMANCE METRICS</h2>
      <ul>
        <li>API response time: < 200ms (p95)</li>
        <li>Page load time: < 2 seconds</li>
        <li>Data processing: Real-time or < 1 hour</li>
      </ul>

      <h2>IV. REMEDIES</h2>
      <p>Service credits are provided for SLA violations as specified in your service agreement.</p>
        
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
