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
      <h1 class="text-4xl font-bold mb-4">Corporate Risk Register & Mitigation Protocol</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Defines Risk Classes and Mitigation Procedures</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>RISK REGISTER OVERVIEW</h2>
      <p>This document defines the risk management framework for HINGECRAFT GLOBAL, INC., including risk classification, assessment procedures, and mitigation protocols.</p>

      <h2>I. RISK CLASSIFICATION</h2>
      
      <h3>1.1 Strategic Risks</h3>
      <ul>
        <li>Market competition and disruption</li>
        <li>Technology obsolescence</li>
        <li>Regulatory changes</li>
        <li>Mission misalignment</li>
      </ul>

      <h3>1.2 Operational Risks</h3>
      <ul>
        <li>Supply chain disruptions</li>
        <li>Production failures</li>
        <li>Cybersecurity breaches</li>
        <li>Key personnel loss</li>
      </ul>

      <h3>1.3 Financial Risks</h3>
      <ul>
        <li>Cash flow issues</li>
        <li>Currency fluctuations</li>
        <li>Investment losses</li>
        <li>Payment processing failures</li>
      </ul>

      <h3>1.4 Compliance Risks</h3>
      <ul>
        <li>Regulatory violations</li>
        <li>Data privacy breaches</li>
        <li>Export control violations</li>
        <li>Tax compliance issues</li>
      </ul>

      <h3>1.5 Reputational Risks</h3>
      <ul>
        <li>Public relations crises</li>
        <li>Social media backlash</li>
        <li>Product recalls</li>
        <li>Ethics violations</li>
      </ul>

      <h2>II. RISK ASSESSMENT</h2>
      
      <h3>2.1 Risk Scoring</h3>
      <p>Risks are scored on:</p>
      <ul>
        <li><strong>Probability:</strong> Likelihood of occurrence (1-5 scale)</li>
        <li><strong>Impact:</strong> Severity of consequences (1-5 scale)</li>
        <li><strong>Risk Score:</strong> Probability × Impact</li>
      </ul>

      <h3>2.2 Risk Levels</h3>
      <ul>
        <li><strong>Critical (20-25):</strong> Immediate action required</li>
        <li><strong>High (12-19):</strong> Action plan needed</li>
        <li><strong>Medium (6-11):</strong> Monitor and mitigate</li>
        <li><strong>Low (1-5):</strong> Accept or transfer</li>
      </ul>

      <h2>III. MITIGATION PROCEDURES</h2>
      
      <h3>3.1 Risk Mitigation Strategies</h3>
      <ul>
        <li><strong>Avoid:</strong> Eliminate the risk entirely</li>
        <li><strong>Mitigate:</strong> Reduce probability or impact</li>
        <li><strong>Transfer:</strong> Insurance or contracts</li>
        <li><strong>Accept:</strong> Acknowledge and monitor</li>
      </ul>

      <h3>3.2 Implementation</h3>
      <p>Mitigation plans include:</p>
      <ul>
        <li>Specific actions and timelines</li>
        <li>Responsible parties</li>
        <li>Resource requirements</li>
        <li>Success metrics</li>
      </ul>

      <h2>IV. MONITORING AND REVIEW</h2>
      <p>The Risk Register is reviewed quarterly by the Board of Directors and updated as needed based on:</p>
      <ul>
        <li>New risk identification</li>
        <li>Changes in risk levels</li>
        <li>Mitigation effectiveness</li>
        <li>External environment changes</li>
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
