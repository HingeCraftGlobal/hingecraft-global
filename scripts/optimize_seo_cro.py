#!/usr/bin/env python3
"""
SEO and CRO Optimization Script for Legal Pages
Adds conversion optimization elements to all legal pages
"""

import os
from pathlib import Path
import re

LEGAL_DIR = Path(__file__).parent.parent / "legal-pages"

# CRO enhancements to add
CRO_ENHANCEMENTS = {
    "cta_section": """
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
    """,
    "trust_badges": """
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
    """,
    "schema_markup": """
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    "name": "{title}",
    "description": "{description}",
    "publisher": {{
      "@type": "Organization",
      "name": "HingeCraft Global",
      "url": "https://hingecraft-global.ai"
    }},
    "datePublished": "2025-12-04",
    "dateModified": "2025-12-04"
  }}
  </script>
    """
}

def enhance_page(filepath):
    """Add CRO and SEO enhancements to a page"""
    content = filepath.read_text(encoding='utf-8')
    original_content = content
    
    # Add schema markup before </head>
    if '</head>' in content and 'application/ld+json' not in content:
        # Extract title and description
        title_match = re.search(r'<title>(.*?)</title>', content)
        desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
        
        title = title_match.group(1) if title_match else "Legal Document"
        description = desc_match.group(1) if desc_match else ""
        
        schema = CRO_ENHANCEMENTS["schema_markup"].format(
            title=title,
            description=description
        )
        content = content.replace('</head>', f'{schema}\n</head>')
    
    # Add trust badges before footer (if not already present)
    if 'Trust Badges' not in content and '</main>' in content:
        content = content.replace('</main>', f'{CRO_ENHANCEMENTS["trust_badges"]}\n</main>')
    
    # Add CTA section before last div in main (if appropriate and not present)
    # Only add to key pages
    key_pages = ['privacy', 'terms', 'membership', 'cookie']
    if any(key in str(filepath) for key in key_pages):
        if 'Ready to Get Started?' not in content and '</main>' in content:
            # Insert before closing main tag
            content = content.replace('</main>', f'{CRO_ENHANCEMENTS["cta_section"]}\n</main>')
    
    # Add Open Graph tags if not present
    if 'og:title' not in content and '<meta name="description"' in content:
        og_tags = """
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://hingecraft-global.ai{url}" />
  <meta property="og:image" content="https://hingecraft-global.ai/og-image.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
        """.strip()
        
        title_match = re.search(r'<title>(.*?)</title>', content)
        desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
        url_match = re.search(r'(\d+)-([\w-]+)\.html', str(filepath))
        
        title = title_match.group(1) if title_match else "Legal Document"
        description = desc_match.group(1) if desc_match else ""
        url = f"/legal/{url_match.group(2)}" if url_match else ""
        
        og_tags_formatted = og_tags.format(title=title, description=description, url=url)
        
        # Insert after description meta tag
        if '<meta name="description"' in content:
            content = re.sub(
                r'(<meta name="description"[^>]*>)',
                r'\1\n  ' + og_tags_formatted.replace('\n', '\n  '),
                content,
                count=1
            )
    
    # Only write if content changed
    if content != original_content:
        filepath.write_text(content, encoding='utf-8')
        return True
    return False

def main():
    """Optimize all legal pages"""
    html_files = list(LEGAL_DIR.glob("*.html"))
    
    print(f"🔍 Found {len(html_files)} HTML files")
    print("🚀 Optimizing for SEO and CRO...\n")
    
    optimized = 0
    for filepath in html_files:
        if enhance_page(filepath):
            optimized += 1
            print(f"✅ Optimized: {filepath.name}")
    
    print(f"\n✨ Optimization complete!")
    print(f"📊 Optimized {optimized} out of {len(html_files)} files")

if __name__ == "__main__":
    main()

