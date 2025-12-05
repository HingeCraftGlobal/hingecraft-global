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
      <h1 class="text-4xl font-bold mb-4">Corporate Social Responsibility Compliance</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">ESG + UN SDG Alignment</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>CSR COMMITMENT</h2>
      <p>HINGECRAFT GLOBAL, INC. is committed to corporate social responsibility through environmental, social, and governance (ESG) excellence and alignment with the United Nations Sustainable Development Goals (UN SDGs).</p>

      <h2>I. ENVIRONMENTAL RESPONSIBILITY</h2>
      
      <h3>1.1 Sustainable Manufacturing</h3>
      <ul>
        <li>Use of recycled and sustainable materials</li>
        <li>Reduction of waste and emissions</li>
        <li>Localized production to reduce transportation</li>
        <li>Circular economy principles</li>
      </ul>

      <h3>1.2 Climate Action</h3>
      <ul>
        <li>Carbon footprint reduction</li>
        <li>Renewable energy use</li>
        <li>Carbon offset programs</li>
        <li>Climate risk assessment</li>
      </ul>

      <h2>II. SOCIAL RESPONSIBILITY</h2>
      
      <h3>2.1 Employee Welfare</h3>
      <ul>
        <li>Fair wages and benefits</li>
        <li>Safe working conditions</li>
        <li>Diversity and inclusion</li>
        <li>Professional development</li>
      </ul>

      <h3>2.2 Community Impact</h3>
      <ul>
        <li>Local community engagement</li>
        <li>Educational programs</li>
        <li>Skills training</li>
        <li>Access to tools and resources</li>
      </ul>

      <h3>2.3 Human Rights</h3>
      <ul>
        <li>Respect for human rights in operations</li>
        <li>Supply chain due diligence</li>
        <li>No forced or child labor</li>
        <li>Freedom of association</li>
      </ul>

      <h2>III. GOVERNANCE</h2>
      
      <h3>3.1 Ethical Governance</h3>
      <ul>
        <li>Transparent decision-making</li>
        <li>Stakeholder engagement</li>
        <li>Anti-corruption measures</li>
        <li>Board diversity</li>
      </ul>

      <h3>3.2 Data Governance</h3>
      <ul>
        <li>Privacy protection</li>
        <li>Data security</li>
        <li>Transparent data practices</li>
        <li>User control</li>
      </ul>

      <h2>IV. UN SUSTAINABLE DEVELOPMENT GOALS</h2>
      <p>HingeCraft aligns with the following UN SDGs:</p>
      <ul>
        <li><strong>SDG 4:</strong> Quality Education - Providing educational tools and resources</li>
        <li><strong>SDG 8:</strong> Decent Work - Creating meaningful employment opportunities</li>
        <li><strong>SDG 9:</strong> Industry Innovation - Advancing sustainable manufacturing</li>
        <li><strong>SDG 12:</strong> Responsible Consumption - Promoting circular economy</li>
        <li><strong>SDG 13:</strong> Climate Action - Reducing environmental impact</li>
        <li><strong>SDG 17:</strong> Partnerships - Collaborating for sustainable development</li>
      </ul>

      <h2>V. REPORTING AND ACCOUNTABILITY</h2>
      <p>HingeCraft commits to:</p>
      <ul>
        <li>Annual CSR reporting</li>
        <li>Third-party verification</li>
        <li>Stakeholder feedback</li>
        <li>Continuous improvement</li>
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
