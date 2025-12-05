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
      <h1 class="text-4xl font-bold mb-4">Stakeholder Ethos & Ethics Charter</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Embedded Resilience and Human-Purpose Doctrine</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>PREAMBLE</h2>
      <p>HingeCraft Global, Inc. operates under a foundational commitment to resilience, human purpose, and ethical stewardship. This charter defines our core values and ethical framework that guide all decisions, actions, and relationships.</p>

      <h2>I. RESILIENCE DOCTRINE</h2>
      
      <h3>1.1 Systems Resilience</h3>
      <p>We commit to building systems that:</p>
      <ul>
        <li>Withstand disruption and adapt to change</li>
        <li>Protect communities from cascading failures</li>
        <li>Enable rapid recovery and continuity</li>
        <li>Distribute risk and resources equitably</li>
      </ul>

      <h3>1.2 Economic Resilience</h3>
      <p>We prioritize:</p>
      <ul>
        <li>Localized production and supply chains</li>
        <li>Diversified revenue streams</li>
        <li>Worker protection and retraining</li>
        <li>Sustainable business models</li>
      </ul>

      <h2>II. HUMAN-PURPOSE COMMITMENT</h2>
      
      <h3>2.1 Human Dignity</h3>
      <p>All stakeholders—employees, users, partners, and communities—deserve:</p>
      <ul>
        <li>Respect and fair treatment</li>
        <li>Meaningful work and opportunity</li>
        <li>Access to tools and knowledge</li>
        <li>Voice in decisions affecting them</li>
      </ul>

      <h3>2.2 Purpose-Driven Innovation</h3>
      <p>Innovation must serve human needs and advance:</p>
      <ul>
        <li>Environmental sustainability</li>
        <li>Social equity</li>
        <li>Economic opportunity</li>
        <li>Community resilience</li>
      </ul>

      <h2>III. ETHICAL PRINCIPLES</h2>
      
      <h3>3.1 Transparency</h3>
      <p>We commit to open communication about:</p>
      <ul>
        <li>Business practices and decisions</li>
        <li>Data collection and use</li>
        <li>AI training and deployment</li>
        <li>Environmental impact</li>
      </ul>

      <h3>3.2 Accountability</h3>
      <p>We accept responsibility for:</p>
      <ul>
        <li>The impacts of our products and services</li>
        <li>Environmental consequences</li>
        <li>Data security and privacy</li>
        <li>Worker welfare</li>
      </ul>

      <h3>3.3 Stewardship</h3>
      <p>We act as stewards of:</p>
      <ul>
        <li>Natural resources</li>
        <li>User data and privacy</li>
        <li>Community trust</li>
        <li>Future generations</li>
      </ul>

      <h2>IV. STAKEHOLDER RIGHTS</h2>
      
      <h3>4.1 Employee Rights</h3>
      <ul>
        <li>Fair compensation and benefits</li>
        <li>Safe working conditions</li>
        <li>Professional development</li>
        <li>Work-life balance</li>
      </ul>

      <h3>4.2 User Rights</h3>
      <ul>
        <li>Data privacy and control</li>
        <li>Transparent terms and policies</li>
        <li>Access to their own data</li>
        <li>Fair dispute resolution</li>
      </ul>

      <h3>4.3 Community Rights</h3>
      <ul>
        <li>Environmental protection</li>
        <li>Economic opportunity</li>
        <li>Cultural respect</li>
        <li>Community engagement</li>
      </ul>

      <h2>V. PROHIBITED PRACTICES</h2>
      <p>HingeCraft shall not engage in:</p>
      <ul>
        <li>Exploitative labor practices</li>
        <li>Environmental degradation</li>
        <li>Data misuse or unauthorized sharing</li>
        <li>Weaponization of technology</li>
        <li>Discrimination or harassment</li>
        <li>Deceptive business practices</li>
      </ul>

      <h2>VI. ENFORCEMENT</h2>
      <p>Violations of this charter may result in:</p>
      <ul>
        <li>Internal review and corrective action</li>
        <li>Disciplinary measures</li>
        <li>Remediation efforts</li>
        <li>Public disclosure when appropriate</li>
      </ul>

      <h2>VII. REVIEW AND AMENDMENT</h2>
      <p>This charter shall be reviewed annually and may be amended by:</p>
      <ul>
        <li>Board of Directors approval</li>
        <li>Stakeholder input</li>
        <li>Mission Review Council confirmation</li>
      </ul>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
        <p class="text-sm text-gray-600">For questions about this charter, please contact: <a href="mailto:ethics@hingecraft-global.ai" class="text-purple-700 hover:underline">ethics@hingecraft-global.ai</a></p>
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
