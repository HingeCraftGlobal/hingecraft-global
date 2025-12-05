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
      <h1 class="text-4xl font-bold mb-4">AI Safety, Bias, and Governance Framework</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Comprehensive AI Safety and Bias Mitigation</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>AI SAFETY, BIAS, AND GOVERNANCE FRAMEWORK</h2>
      <p>This framework establishes comprehensive guidelines for AI safety, bias mitigation, and ethical governance at HingeCraft Global.</p>

      <h2>I. AI SAFETY</h2>
      
      <h3>1.1 Safety Standards</h3>
      <ul>
        <li>Robust testing and validation</li>
        <li>Fail-safe mechanisms</li>
        <li>Error handling and recovery</li>
        <li>Security measures</li>
      </ul>

      <h3>1.2 Risk Assessment</h3>
      <p>We assess risks associated with:</p>
      <ul>
        <li>AI system failures</li>
        <li>Adversarial attacks</li>
        <li>Unintended consequences</li>
        <li>Systemic risks</li>
      </ul>

      <h2>II. BIAS MITIGATION</h2>
      
      <h3>2.1 Bias Detection</h3>
      <ul>
        <li>Regular bias audits</li>
        <li>Diverse training data</li>
        <li>Fairness metrics</li>
        <li>Representation analysis</li>
      </ul>

      <h3>2.2 Bias Remediation</h3>
      <ul>
        <li>Data balancing</li>
        <li>Algorithm adjustments</li>
        <li>Post-processing corrections</li>
        <li>Continuous monitoring</li>
      </ul>

      <h2>III. GOVERNANCE STRUCTURE</h2>
      
      <h3>3.1 Ethics Board</h3>
      <p>An independent ethics board reviews AI systems and policies.</p>

      <h3>3.2 Review Process</h3>
      <ul>
        <li>Pre-deployment review</li>
        <li>Ongoing monitoring</li>
        <li>Incident response</li>
        <li>Stakeholder feedback</li>
      </ul>

      <h2>IV. COMPLIANCE</h2>
      <p>We comply with:</p>
      <ul>
        <li>EU AI Act</li>
        <li>Algorithmic accountability laws</li>
        <li>Industry best practices</li>
        <li>Ethical AI principles</li>
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
