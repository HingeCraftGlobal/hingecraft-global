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
      <h1 class="text-4xl font-bold mb-4">Export & Compliance Policy</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">ITAR/EAR Compliance for Manufacturing & Industrial Robotics</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <div class="warning-box">
        <p><strong>⚠️ Important:</strong> This policy addresses export compliance requirements that may apply if HingeCraft Global's manufacturing activities intersect with industrial robotics or dual-use technologies.</p>
      </div>

      <h2>INTRODUCTION</h2>
      <p>This Export & Compliance Policy outlines HingeCraft Global's commitment to compliance with U.S. export control laws, including the International Traffic in Arms Regulations (ITAR) and Export Administration Regulations (EAR).</p>

      <h2>I. EXPORT CONTROL OVERVIEW</h2>
      
      <h3>1.1 ITAR (International Traffic in Arms Regulations)</h3>
      <p>ITAR regulates defense articles, services, and technical data. Administered by the U.S. Department of State.</p>
      <p><strong>Applies if:</strong> Products or services involve defense-related technologies or military applications.</p>

      <h3>1.2 EAR (Export Administration Regulations)</h3>
      <p>EAR regulates dual-use items (commercial items with potential military applications). Administered by the U.S. Department of Commerce.</p>
      <p><strong>Applies if:</strong> Products involve controlled technologies, software, or equipment.</p>

      <h2>II. POTENTIAL APPLICABILITY</h2>
      
      <h3>2.1 Industrial Robotics</h3>
      <p>If HingeCraft Global's manufacturing involves:</p>
      <ul>
        <li>Industrial robotics systems</li>
        <li>Automated manufacturing equipment</li>
        <li>CNC machines or precision tools</li>
        <li>3D printing for industrial applications</li>
      </ul>
      <p>These may be subject to EAR controls.</p>

      <h3>2.2 Software and Technology</h3>
      <p>Controlled if involving:</p>
      <ul>
        <li>Encryption technology</li>
        <li>AI/ML for defense applications</li>
        <li>Design software for controlled items</li>
        <li>Technical data for controlled products</li>
      </ul>

      <h2>III. COMPLIANCE FRAMEWORK</h2>
      
      <h3>3.1 Classification</h3>
      <p>We will:</p>
      <ul>
        <li>Classify all products and technologies</li>
        <li>Determine export control jurisdiction</li>
        <li>Identify applicable regulations</li>
        <li>Document classification decisions</li>
      </ul>

      <h3>3.2 Licensing</h3>
      <p>When required, we will:</p>
      <ul>
        <li>Obtain appropriate export licenses</li>
        <li>Comply with license conditions</li>
        <li>Maintain license records</li>
        <li>Report as required</li>
      </ul>

      <h3>3.3 Restricted Parties Screening</h3>
      <p>We screen against:</p>
      <ul>
        <li>Denied Persons List (DPL)</li>
        <li>Entity List</li>
        <li>Specially Designated Nationals (SDN)</li>
        <li>Unverified List</li>
        <li>Military End User List</li>
      </ul>

      <h2>IV. PROHIBITED ACTIVITIES</h2>
      <p>HingeCraft Global will not:</p>
      <ul>
        <li>Export controlled items without authorization</li>
        <li>Provide technical assistance to restricted parties</li>
        <li>Re-export controlled items without authorization</li>
        <li>Violate embargo or sanctions</li>
        <li>Facilitate unauthorized exports</li>
      </ul>

      <h2>V. COMPLIANCE PROGRAM</h2>
      
      <h3>5.1 Training</h3>
      <p>All relevant employees receive export compliance training.</p>

      <h3>5.2 Procedures</h3>
      <p>Written procedures for:</p>
      <ul>
        <li>Product classification</li>
        <li>License determination</li>
        <li>Restricted party screening</li>
        <li>Record keeping</li>
      </ul>

      <h3>5.3 Record Keeping</h3>
      <p>We maintain records of:</p>
      <ul>
        <li>Export transactions</li>
        <li>Classification decisions</li>
        <li>License applications</li>
        <li>Screening results</li>
      </ul>

      <h2>VI. CURRENT STATUS</h2>
      <p><strong>As of December 2025:</strong> HingeCraft Global's current operations focus on consumer furniture and design tools, which are generally not subject to ITAR/EAR controls. However, this policy establishes our compliance framework for future activities.</p>

      <h2>VII. FUTURE CONSIDERATIONS</h2>
      <p>If we expand into areas that may trigger export controls, we will:</p>
      <ul>
        <li>Conduct compliance assessment</li>
        <li>Obtain necessary licenses</li>
        <li>Implement compliance procedures</li>
        <li>Train relevant personnel</li>
        <li>Update this policy as needed</li>
      </ul>

      <h2>VIII. REPORTING VIOLATIONS</h2>
      <p>Any suspected export control violations must be reported immediately to:</p>
      <ul>
        <li><strong>Compliance Officer:</strong> <a href="mailto:compliance@hingecraft-global.ai" class="text-purple-700 hover:underline">compliance@hingecraft-global.ai</a></li>
        <li><strong>Legal:</strong> <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></li>
      </ul>

      <h2>IX. PENALTIES</h2>
      <p>Violations of export control laws can result in:</p>
      <ul>
        <li>Civil penalties up to $1 million per violation</li>
        <li>Criminal penalties including fines and imprisonment</li>
        <li>Loss of export privileges</li>
        <li>Reputational damage</li>
      </ul>

      <h2>X. CONTACT</h2>
      <p>For export compliance questions:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:compliance@hingecraft-global.ai" class="text-purple-700 hover:underline">compliance@hingecraft-global.ai</a></li>
        <li><strong>Legal:</strong> <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></li>
      </ul>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
        <p class="text-sm text-gray-600"><strong>Note:</strong> This is an advisory policy. Consult legal counsel for specific export control questions.</p>
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
