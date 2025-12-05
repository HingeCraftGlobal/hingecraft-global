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
  <!-- Hero Section -->
  <section class="hero-gradient text-white py-12 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl font-bold mb-4">Corporate Formation Charter</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Effective Date: TBD | Delaware C-Corporation</p>
    </div>
  </section>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>ARTICLE I — NAME AND LEGAL ENTITY</h2>
      <p>The legal name of the corporation shall be:</p>
      <p><strong>HINGECRAFT GLOBAL, INC.</strong></p>
      <p>This entity shall operate as a Delaware C-Corporation with the ability to maintain domestic and international subsidiaries, Joint Ventures (JVs), strategic alliances, licensing bodies, research centers, regional microfactory governance units, and non-profit extensions aligned with the organizational mission.</p>

      <h2>ARTICLE II — PURPOSE OF THE ENTITY</h2>
      <p>HINGECRAFT GLOBAL, INC. exists for a dual purpose model:</p>
      
      <h3>(A) PRIMARY COMMERCIAL FUNCTION</h3>
      <p>To design, operate, and scale:</p>
      <ul>
        <li>A cloud-based Platform-as-a-Service (PaaS) enabling AI-assisted design tools, 3D modeling and fabrication workflows, user-driven customization of furniture and physical products, marketplace participation and licensing, manufacturing coordination with distributed microfactories, and physical production through approved fabrication partners and resilience-based microfactory networks.</li>
        <li>Digital membership, learning portals, and community systems enabling global participation in design, innovation, and sustainability.</li>
      </ul>

      <h3>(B) PURPOSE-DRIVEN SOCIETAL FUNCTION</h3>
      <p>HingeCraft shall also operate as a mission-aligned organization committed to:</p>
      <ul>
        <li>The advancement of sustainable manufacturing</li>
        <li>Reduction of material waste through recycled plastics, circular economy inputs, and localized production</li>
        <li>Empowerment of future generations through education, skill advancement, AI literacy, and open access tools</li>
        <li>Support of the Charter of Abundance & Resilience, a global initiative advocating for equitable access to tools, knowledge, community, and infrastructure.</li>
      </ul>

      <h2>ARTICLE III — POWERS OF THE CORPORATION</h2>
      <p>HINGECRAFT GLOBAL, INC. shall have the power to:</p>
      <ul>
        <li>License intellectual property</li>
        <li>Produce and distribute physical and digital products</li>
        <li>Operate marketplaces and commerce platforms</li>
        <li>Train proprietary and federated AI models</li>
        <li>Collect, store, and process user data in compliance with local and international laws</li>
        <li>Partner with educational institutions, governments, corporate entities, and NGOs</li>
        <li>Globally scale operations through subsidiaries or independent operators</li>
      </ul>

      <h2>ARTICLE IV — SHARE STRUCTURE</h2>
      <p>The corporation is authorized to issue shares classified as:</p>
      <ul>
        <li><strong>Class A Common Voting Shares</strong></li>
        <li><strong>Class B Foundational Mission Shares</strong></li>
        <li><strong>Preferred Shares</strong> (Investor or Institutional)</li>
      </ul>
      <p>Voting rights may be weighted to protect the mission and prevent hostile acquisition misalignment.</p>

      <h2>ARTICLE V — PRESERVATION OF MISSION</h2>
      <p>HINGECRAFT GLOBAL, INC. shall not participate in:</p>
      <ul>
        <li>Extraction-based business models</li>
        <li>Environmental harm beyond reasonable manufacturing risk</li>
        <li>Unauthorized exploitation of user data</li>
        <li>Weaponization or destabilizing applications of AI or manufacturing outputs</li>
      </ul>
      <p>A <strong>Mission Override Clause</strong> grants Foundational Mission Shareholders veto rights over actions that materially violate the organizational purpose.</p>

      <h2>ARTICLE VI — REGISTERED ADDRESS & OPERATING SCOPE</h2>
      <p>Primary incorporation shall be in the State of Delaware with operational capability in:</p>
      <ul>
        <li>All U.S. States</li>
        <li>Regions compliant with GDPR</li>
        <li>Strategic partner nations in accordance with export, trade, and dual-use regulations.</li>
      </ul>

      <h2>ARTICLE VII — DURATION</h2>
      <p>The corporation is formed to exist perpetually unless legally dissolved or transitioned to a cooperative, public-benefit model, or UN-aligned framework per Article XII provisions.</p>

      <h2>ARTICLE VIII — LIABILITY</h2>
      <p>No officer, director, advisor, or founding entity shall be personally liable for corporate obligations beyond lawful exceptions such as:</p>
      <ul>
        <li>Criminal misconduct</li>
        <li>Fraud</li>
        <li>Gross negligence</li>
        <li>Federally regulated violations</li>
      </ul>

      <h2>ARTICLE IX — MODIFICATIONS</h2>
      <p>This Charter may only be amended through:</p>
      <ul>
        <li>70% shareholder approval</li>
        <li>AND</li>
        <li>Mission Review Council confirmation to ensure alignment with the Charter of Abundance & Resilience.</li>
      </ul>

      <h2>ARTICLE X — RATIFICATION</h2>
      <p>Upon signing by founders and acceptance by the Secretary of State, this Charter becomes the governing document of HingeCraft Global, Inc.</p>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <h3>SIGNATURES</h3>
        <table class="w-full mt-4">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Name</th>
              <th class="text-left py-2">Role</th>
              <th class="text-left py-2">Signature</th>
              <th class="text-left py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-2">Chandler William Ferguson</td>
              <td class="py-2">Founder / Chief Architect</td>
              <td class="py-2">__________________</td>
              <td class="py-2">____</td>
            </tr>
            <tr>
              <td class="py-2">Additional Founders</td>
              <td class="py-2">TBD</td>
              <td class="py-2">__________________</td>
              <td class="py-2">____</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
        <p class="text-sm text-gray-600">For questions about this charter, please contact: <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></p>
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

  <!-- Footer -->
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
