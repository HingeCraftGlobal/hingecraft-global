#!/usr/bin/env python3
"""
Check if Legal Pages are Actually Deployed in Wix Page Tree
Looks for .js files which indicate actual Wix pages
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
WIX_PAGES_DIR = BASE_DIR / "src" / "pages"
LEGAL_DIR = WIX_PAGES_DIR / "legal"

# Legal page names from deployment manifest
LEGAL_PAGE_NAMES = [
    "Corporate Formation Charter",
    "Corporate Bylaws",
    "Stakeholder Ethos & Ethics Charter",
    "Board Member Agreement",
    "Corporate Risk Register",
    "Corporate Social Responsibility",
    "Cookie Policy",
    "Terms of Service",
    "End User License Agreement",
    "Acceptable Use Policy",
    "Export Compliance",
    "Service Level Agreement",
    "Refunds & Warranty Policy",
    "Privacy Policy",
    "Data Processing Agreement",
    "AI Training Consent",
    "Sensitive Data Consent",
    "Algorithmic Transparency",
    "AI Safety & Governance",
    "Creator Licensing Agreement",
    "Marketplace Merchant Agreement",
    "Manufacturing Agreement",
    "Attribution & Derivative Rights",
    "Digital Asset & NFT Ownership",
    "Product Liability Disclosure",
    "Warranty & Repair Policy",
    "Materials Sourcing Compliance",
    "Membership Terms & Rights",
    "Community Code of Conduct",
    "Academic Integrity Policy",
    "Global Compliance Framework",
    "Cross-Border Data Transfer",
    "Charter of Abundance",
    "Pledge & Participation Agreement",
]

def check_wix_pages():
    """Check if legal pages exist as actual Wix pages (.js files)"""
    
    print("🔍 Checking Wix Page Tree for Legal Compliance Pages")
    print("=" * 60)
    print("")
    
    # Get all .js files in src/pages (these are actual Wix pages)
    all_js_files = list(WIX_PAGES_DIR.glob("*.js"))
    
    print(f"📊 Total Wix Pages Found: {len(all_js_files)}")
    print("")
    
    # Check for legal-related pages
    legal_pages_found = []
    other_pages = []
    
    for js_file in all_js_files:
        filename = js_file.name.lower()
        # Check if it's a legal page
        is_legal = False
        for legal_name in LEGAL_PAGE_NAMES:
            # Create search terms from legal name
            search_terms = legal_name.lower().replace('&', '').split()
            if any(term in filename for term in search_terms if len(term) > 3):
                is_legal = True
                break
        
        # Also check for common legal terms
        legal_keywords = ['legal', 'privacy', 'terms', 'cookie', 'policy', 'agreement', 
                         'charter', 'bylaws', 'compliance', 'governance', 'consent']
        if any(keyword in filename for keyword in legal_keywords):
            is_legal = True
        
        if is_legal:
            legal_pages_found.append(js_file.name)
        else:
            other_pages.append(js_file.name)
    
    print("=" * 60)
    print("LEGAL PAGES STATUS IN WIX PAGE TREE")
    print("=" * 60)
    print("")
    
    if legal_pages_found:
        print(f"✅ Found {len(legal_pages_found)} Legal-Related Pages:")
        for page in sorted(legal_pages_found):
            print(f"   - {page}")
    else:
        print("❌ NO Legal Pages Found in Wix Page Tree")
        print("")
        print("⚠️  Legal pages exist as HTML files but NOT as Wix pages yet!")
        print("")
        print("📁 HTML Files Location: src/pages/legal/")
        print(f"📊 HTML Files Count: {len(list(LEGAL_DIR.glob('*.html')))}")
        print("")
        print("🔧 To Deploy:")
        print("   1. Open Wix Editor: https://editor.wix.com")
        print("   2. Create pages from HTML files in src/pages/legal/")
        print("   3. Or run: wix dev (if CLI is working)")
    
    print("")
    print("=" * 60)
    print("HTML FILES STATUS")
    print("=" * 60)
    print("")
    
    html_files = list(LEGAL_DIR.glob("*.html"))
    print(f"📁 HTML Files in src/pages/legal/: {len(html_files)}")
    print("")
    
    # Count unique pages (excluding duplicates)
    numbered_files = [f for f in html_files if f.name[0].isdigit()]
    clean_files = [f for f in html_files if not f.name[0].isdigit()]
    
    print(f"   - Numbered files (01-, 02-, etc.): {len(numbered_files)}")
    print(f"   - Clean named files: {len(clean_files)}")
    print("")
    
    if numbered_files:
        print("✅ Original Legal Pages Found:")
        for f in sorted(numbered_files)[:10]:
            print(f"   - {f.name}")
        if len(numbered_files) > 10:
            print(f"   ... and {len(numbered_files) - 10} more")
    
    print("")
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("")
    print(f"Wix Pages (.js files): {len(legal_pages_found)} legal pages")
    print(f"HTML Files: {len(html_files)} files in src/pages/legal/")
    print(f"Expected: 34 legal pages")
    print("")
    
    if len(legal_pages_found) == 0:
        print("❌ STATUS: Legal pages NOT deployed to Wix page tree")
        print("   → HTML files exist but need to be created as Wix pages")
    elif len(legal_pages_found) < 34:
        print(f"⚠️  STATUS: Partial deployment ({len(legal_pages_found)}/{34} pages)")
    else:
        print("✅ STATUS: All legal pages deployed to Wix page tree")

if __name__ == "__main__":
    check_wix_pages()




