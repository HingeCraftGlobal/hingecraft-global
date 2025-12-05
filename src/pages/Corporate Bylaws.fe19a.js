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
      <h1 class="text-4xl font-bold mb-4">Corporate Bylaws</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Effective Date: TBD</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>ARTICLE I — OFFICES</h2>
      <p>The principal office of the corporation shall be located in the State of Delaware, or at such other place as the Board of Directors may determine.</p>

      <h2>ARTICLE II — SHAREHOLDERS</h2>
      
      <h3>Section 1. Annual Meeting</h3>
      <p>The annual meeting of shareholders shall be held at such time and place as determined by the Board of Directors.</p>

      <h3>Section 2. Voting Rights</h3>
      <p>Each share of Class A Common Stock shall entitle the holder to one vote. Class B Foundational Mission Shares may have weighted voting rights as determined by the Board to protect the mission.</p>

      <h3>Section 3. Quorum</h3>
      <p>A majority of the outstanding shares entitled to vote, represented in person or by proxy, shall constitute a quorum.</p>

      <h2>ARTICLE III — BOARD OF DIRECTORS</h2>
      
      <h3>Section 1. Powers</h3>
      <p>The business and affairs of the corporation shall be managed by or under the direction of the Board of Directors.</p>

      <h3>Section 2. Number and Qualification</h3>
      <p>The Board shall consist of not less than three (3) nor more than fifteen (15) members, as determined by resolution of the Board or shareholders.</p>

      <h3>Section 3. Election and Term</h3>
      <p>Directors shall be elected at the annual meeting of shareholders and shall hold office until the next annual meeting or until their successors are elected.</p>

      <h3>Section 4. Mission Review Council</h3>
      <p>The Board shall maintain a Mission Review Council composed of Foundational Mission Shareholders to review actions for alignment with the Charter of Abundance & Resilience.</p>

      <h2>ARTICLE IV — OFFICERS</h2>
      
      <h3>Section 1. Officers</h3>
      <p>The officers of the corporation shall be a Chief Executive Officer, a Chief Financial Officer, a Secretary, and such other officers as the Board may determine.</p>

      <h3>Section 2. Election and Term</h3>
      <p>Officers shall be elected by the Board and shall hold office until their successors are elected or until their earlier resignation or removal.</p>

      <h2>ARTICLE V — CAPITAL STOCK</h2>
      
      <h3>Section 1. Classes of Stock</h3>
      <p>The corporation is authorized to issue:</p>
      <ul>
        <li>Class A Common Voting Shares</li>
        <li>Class B Foundational Mission Shares</li>
        <li>Preferred Shares (as designated by the Board)</li>
      </ul>

      <h3>Section 2. Transfer Restrictions</h3>
      <p>Class B Foundational Mission Shares may be subject to transfer restrictions to preserve mission alignment.</p>

      <h2>ARTICLE VI — AMENDMENTS</h2>
      <p>These Bylaws may be amended by:</p>
      <ul>
        <li>Affirmative vote of a majority of the Board of Directors, or</li>
        <li>Affirmative vote of shareholders holding a majority of outstanding shares entitled to vote</li>
      </ul>
      <p>Amendments affecting mission preservation require Mission Review Council approval.</p>

      <h2>ARTICLE VII — INDEMNIFICATION</h2>
      <p>The corporation shall indemnify directors and officers to the fullest extent permitted by Delaware law.</p>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600">Last Updated: December 4, 2025</p>
        <p class="text-sm text-gray-600">For questions about these bylaws, please contact: <a href="mailto:legal@hingecraft-global.ai" class="text-purple-700 hover:underline">legal@hingecraft-global.ai</a></p>
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
