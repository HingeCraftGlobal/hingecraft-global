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
      <h1 class="text-4xl font-bold mb-4">Membership Terms & Rights</h1>
      <p class="text-lg opacity-90">HINGECRAFT GLOBAL, INC.</p>
      <p class="text-sm opacity-75 mt-2">Access Levels, Perks, Cancellation</p>
    </div>
  </section>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="prose max-w-none bg-white p-8 rounded-lg shadow-sm">
      
      <h2>MEMBERSHIP TERMS & RIGHTS</h2>
      <p>This document outlines membership terms, access levels, benefits, and cancellation policies for HingeCraft Global members.</p>

      <h2>I. MEMBERSHIP TIERS</h2>
      
      <h3>1.1 Basic Membership</h3>
      <ul>
        <li>Free access to basic features</li>
        <li>Limited design storage</li>
        <li>Community access</li>
        <li>Basic support</li>
      </ul>

      <h3>1.2 Premium Membership</h3>
      <ul>
        <li>All basic features</li>
        <li>Unlimited design storage</li>
        <li>Advanced AI tools</li>
        <li>Priority support</li>
        <li>Exclusive content</li>
      </ul>

      <h3>1.3 Enterprise Membership</h3>
      <ul>
        <li>All premium features</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
        <li>Volume discounts</li>
        <li>SLA guarantees</li>
      </ul>

      <h2>II. MEMBER RIGHTS</h2>
      <ul>
        <li>Access to platform features per tier</li>
        <li>Data privacy and control</li>
        <li>Fair treatment</li>
        <li>Dispute resolution</li>
        <li>Account cancellation</li>
      </ul>

      <h2>III. MEMBER OBLIGATIONS</h2>
      <ul>
        <li>Comply with Terms of Service</li>
        <li>Maintain account security</li>
        <li>Pay fees when due</li>
        <li>Respect other members</li>
      </ul>

      <h2>IV. CANCELLATION</h2>
      
      <h3>4.1 Cancellation Rights</h3>
      <p>Members may cancel at any time through account settings or by contacting support.</p>

      <h3>4.2 Refund Policy</h3>
      <p>Refunds provided per our Refund Policy. Annual memberships may be prorated.</p>

      <h3>4.3 Effect of Cancellation</h3>
      <p>Upon cancellation:</p>
      <ul>
        <li>Access continues until period end</li>
        <li>Data available for export</li>
        <li>No further charges</li>
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
    

      <div class="mt-8 pt-8 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
        <p class="text-lg text-gray-700 mb-6">Join thousands of creators building resilient systems with HingeCraft Global.</p>
        <div class="flex flex-wrap gap-4">
          <a href="/membership" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg">
            Join Now
          </a>
          <a href="/contact" class="bg-white border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition">
            Contact Us
          </a>
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
