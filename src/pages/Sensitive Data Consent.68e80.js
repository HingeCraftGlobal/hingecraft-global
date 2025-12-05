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
      <h1 class="text-4xl font-bold mb-4">Sensitive Data & Youth Data Consent</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">For Minors, Biometrics, Education Data</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>SENSITIVE DATA & YOUTH DATA CONSENT</h2>
      <p>This policy addresses special protections for sensitive data, including information from minors, biometric data, and educational records.</p>

      <h2>I. MINOR DATA PROTECTION (COPPA)</h2>
      
      <h3>1.1 Parental Consent</h3>
      <p>For users under 13, we require:</p>
      <ul>
        <li>Verifiable parental consent</li>
        <li>Parental access to child's account</li>
        <li>Limited data collection</li>
        <li>No behavioral advertising</li>
      </ul>

      <h3>1.2 Teen Privacy (13-17)</h3>
      <p>For users 13-17:</p>
      <ul>
        <li>Enhanced privacy protections</li>
        <li>Limited data sharing</li>
        <li>Age-appropriate content</li>
        <li>Parental notification options</li>
      </ul>

      <h2>II. BIOMETRIC DATA</h2>
      <p>If we collect biometric data:</p>
      <ul>
        <li>Explicit consent required</li>
        <li>Limited use and retention</li>
        <li>Secure storage</li>
        <li>Right to deletion</li>
      </ul>

      <h2>III. EDUCATIONAL DATA (FERPA)</h2>
      <p>For educational institutions:</p>
      <ul>
        <li>FERPA-compliant handling</li>
        <li>Limited disclosure</li>
        <li>Student record protection</li>
        <li>Institutional consent</li>
      </ul>

      <h2>IV. SENSITIVE PERSONAL DATA</h2>
      <p>Special protections apply to:</p>
      <ul>
        <li>Health information</li>
        <li>Financial data</li>
        <li>Location data</li>
        <li>Political or religious beliefs</li>
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
