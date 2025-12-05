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
      <h1 class="text-4xl font-bold mb-4">Charter of Abundance & Resilience – Governance Treaty</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Public-Facing Legal Declaration of Mission</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>CHARTER OF ABUNDANCE & RESILIENCE</h2>
      <p>This Governance Treaty is a public-facing legal declaration of HingeCraft Global's mission to build resilient systems that protect communities and create sustainable abundance for all.</p>

      <h2>I. MISSION STATEMENT</h2>
      <p>We commit to designing institutions, systems, and technologies that:</p>
      <ul>
        <li>Produce abundance without fragility</li>
        <li>Protect communities from cascading collapse</li>
        <li>Enable equitable access to tools and knowledge</li>
        <li>Support sustainable manufacturing</li>
        <li>Empower future generations</li>
      </ul>

      <h2>II. RESILIENCE PRINCIPLES</h2>
      
      <h3>2.1 Systems Resilience</h3>
      <ul>
        <li>Diversified supply chains</li>
        <li>Localized production</li>
        <li>Redundant systems</li>
        <li>Rapid recovery capabilities</li>
      </ul>

      <h3>2.2 Economic Resilience</h3>
      <ul>
        <li>Worker protection and retraining</li>
        <li>Fair compensation</li>
        <li>Community investment</li>
        <li>Sustainable business models</li>
      </ul>

      <h2>III. ABUNDANCE COMMITMENT</h2>
      <ul>
        <li>Open access to tools</li>
        <li>Knowledge sharing</li>
        <li>Resource efficiency</li>
        <li>Waste reduction</li>
        <li>Circular economy</li>
      </ul>

      <h2>IV. GOVERNANCE FRAMEWORK</h2>
      <ul>
        <li>Transparent decision-making</li>
        <li>Stakeholder engagement</li>
        <li>Mission preservation</li>
        <li>Ethical oversight</li>
      </ul>

      <h2>V. GLOBAL IMPACT</h2>
      <p>This Charter aligns with:</p>
      <ul>
        <li>United Nations Sustainable Development Goals</li>
        <li>Global resilience initiatives</li>
        <li>Climate action commitments</li>
        <li>Human rights principles</li>
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
