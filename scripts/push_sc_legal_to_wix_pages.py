#!/usr/bin/env python3
"""
Push South Carolina Legal Documents to Wix Pages
Updates the existing Wix page .js files with the new SC legal content
"""

import os
import json
import re
from pathlib import Path

# Directories
BASE_DIR = Path("../hingecraft-global")
SC_DOCS_DIR = BASE_DIR / "COMPLETE_LEGAL_DOCS_SC"
WIX_PAGES_DIR = BASE_DIR / "src" / "pages"

# Mapping of SC documents to existing Wix pages
PAGE_MAPPING = {
    "01-Corporate-Formation-Charter.html": None,  # No direct page yet
    "02-Operating-Agreement-Bylaws.html": "Corporate Bylaws_fe19a_js.tr26u.js",
    "03-Stakeholder-Ethos-Ethics-Charter.html": "Ethos.e4ras.js",
    "04-Board-Member-Agreement.html": None,
    "05-Corporate-Risk-Register-Mitigation-Protocol.html": None,
    "06-Corporate-Social-Responsibility-Compliance.html": "Corporate Social Responsibility_9751a_js.auj04.js",
    "07-Universal-Terms-of-Service.html": "Terms Of Service.vgoal.js",
    "08-End-User-License-Agreement.html": "End User License Agreement_8b2b2_js.k0kt5.js",
    "09-Acceptable-Use-Safety-Policy.html": "Acceptable Use Policy_f6c46_js.htlsm.js",
    "10-Export-Compliance-ITAR-EAR.html": None,
    "11-Service-Level-Agreement.html": None,
    "12-Privacy-Policy-GDPR-CCPA-COPPA.html": "Privacy Policy.wp2xl.js",
    "13-Data-Processing-Agreement.html": "Data Processing Agreement_a21d6_js.c9lo8.js",
    "14-Cookie-Tracking-Policy.html": None,
    "15-AI-Training-Use-Consent.html": "AI Training Consent_70d20_js.pl3ff.js",
    "16-Refunds-Warranty-Return-Policy.html": "Refunds Warranty Policy_0afd3_js.o6f0e.js",
    "17-Intellectual-Property-Creator-Licensing.html": "Licensing Agreement_6f500_js.g2cna.js",
    "18-Community-Code-of-Conduct.html": "Community Code of Conduct_7fd4f_js.hh404.js",
    "19-Product-Liability-Safety-Disclosure.html": None,
    "20-Membership-Terms-Rights.html": "Membership Terms Rights_480dc_js.uhgf0.js",
    "21-Manufacturing-Production-Agreement.html": None,
    "22-Marketplace-Merchant-Agreement.html": None,
    "23-Materials-Sourcing-Ethical-Compliance.html": None,
    "24-AI-Safety-Bias-Governance.html": "AI Safety Governance_f4e07_js.f8x76.js",
    "25-Algorithmic-Transparency-Accountability.html": "Algorithmic Transparency_0173c_js.azbxk.js",
    "26-Digital-Asset-NFT-Ownership.html": None,
    "27-Attribution-Distribution-Derivative-Rights.html": "Attribution Derivative Rights_d6bca_js.bzocp.js",
    "28-Academic-Integrity-Institutional-Use.html": "Academic Integrity Policy_c1c5d_js.za1av.js",
    "29-Sensitive-Data-Youth-Consent.html": "Sensitive Data Consent_68e80_js.gpfrg.js",
    "30-Global-Compliance-Framework.html": "Global Compliance Framework_21d9c_js.a0hnk.js",
    "31-Cross-Border-Data-Transfer-Hosting.html": "CrossBorder Data Transfer_17eea_js.onmtb.js",
    "32-Charter-of-Abundance-Resilience-Governance.html": "Charter of Abundance Invitation.pa3z2.js",
    "33-Pledge-Participation-Collective-Impact.html": None,
    "34-Employee-Handbook-Policies.html": None
}

def escape_js_string(content):
    """Escape content for use in JavaScript template literal"""
    # Escape backticks and ${} for template literals
    content = content.replace('\\', '\\\\')
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')
    return content

def read_html_content(filepath):
    """Read and prepare HTML content"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def generate_page_code(html_content, page_title):
    """Generate Wix page code with embedded HTML content"""
    escaped_content = escape_js_string(html_content)
    
    code = f'''// HingeCraft Global, LLC - Legal Document
// {page_title}
// State of South Carolina | December 2024
// Auto-generated - All URLs are HTTPS only

import wixSeo from 'wix-seo';

$w.onReady(function () {{
    // Set SEO
    wixSeo.setTitle("{page_title} | HingeCraft Global");
    wixSeo.setMetaTags([
        {{ name: "description", content: "{page_title} - HingeCraft Global, LLC legal document for South Carolina" }},
        {{ name: "robots", content: "index, follow" }},
        {{ property: "og:title", content: "{page_title} | HingeCraft Global" }},
        {{ property: "og:type", content: "website" }}
    ]);
    
    // Load legal document content
    loadLegalContent();
}});

function loadLegalContent() {{
    const legalContent = `{escaped_content}`;
    
    // Try to find the legalContent element
    if ($w('#legalContent')) {{
        try {{
            $w('#legalContent').html = legalContent;
        }} catch (e) {{
            console.log("HTML element not configured - content ready for manual embed");
        }}
    }}
    
    // Also try text element fallback
    if ($w('#legalText')) {{
        try {{
            $w('#legalText').html = legalContent;
        }} catch (e) {{
            console.log("Using text element fallback");
        }}
    }}
}}

// Export for potential use in other contexts
export function getLegalDocumentHTML() {{
    return `{escaped_content}`;
}}
'''
    return code

def update_wix_page(wix_page_path, html_content, page_title):
    """Update an existing Wix page with new content"""
    new_code = generate_page_code(html_content, page_title)
    
    with open(wix_page_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
    
    return True

def main():
    """Main function to process all documents"""
    print("=" * 60)
    print("PUSHING SC LEGAL DOCUMENTS TO WIX PAGES")
    print("=" * 60)
    
    updated = []
    skipped = []
    errors = []
    
    for sc_doc, wix_page in PAGE_MAPPING.items():
        sc_path = SC_DOCS_DIR / sc_doc
        
        if not sc_path.exists():
            errors.append(f"SC doc not found: {sc_doc}")
            continue
            
        if wix_page is None:
            skipped.append(sc_doc)
            continue
            
        wix_path = WIX_PAGES_DIR / wix_page
        
        if not wix_path.exists():
            errors.append(f"Wix page not found: {wix_page}")
            continue
        
        try:
            html_content = read_html_content(sc_path)
            page_title = sc_doc.replace('.html', '').replace('-', ' ').title()
            page_title = re.sub(r'^\d+\s+', '', page_title)  # Remove leading numbers
            
            update_wix_page(wix_path, html_content, page_title)
            updated.append((sc_doc, wix_page))
            print(f"✓ Updated: {wix_page}")
            
        except Exception as e:
            errors.append(f"Error updating {wix_page}: {str(e)}")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Updated: {len(updated)} pages")
    print(f"Skipped (no mapping): {len(skipped)} pages")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  ✗ {e}")
    
    # Save manifest
    manifest = {
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "timestamp": "2024-12-06"
    }
    
    manifest_path = BASE_DIR / "SC_LEGAL_UPDATE_MANIFEST.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\nManifest saved to: {manifest_path}")
    print("\nNext steps:")
    print("1. Run: cd hingecraft-global && wix dev")
    print("2. Verify pages in Wix Editor")
    print("3. Run: wix publish")

if __name__ == "__main__":
    main()



