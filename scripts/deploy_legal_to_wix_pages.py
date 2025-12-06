#!/usr/bin/env python3
"""
Deploy Legal Pages to Wix Pages Folder
Creates legal pages in Wix pages structure for deployment
"""

import os
import shutil
from pathlib import Path
import re

BASE_DIR = Path(__file__).parent.parent
LEGAL_DIR = BASE_DIR / "legal-pages"
WIX_PAGES_DIR = BASE_DIR / "src" / "pages" / "legal"
WIX_PUBLIC_DIR = BASE_DIR / "public" / "pages" / "legal"

# Page name mappings (filename to Wix page name)
PAGE_MAPPINGS = {
    "01-corporate-formation-charter.html": "Corporate Formation Charter",
    "02-corporate-bylaws.html": "Corporate Bylaws",
    "03-stakeholder-ethos-ethics-charter.html": "Stakeholder Ethos & Ethics Charter",
    "04-board-member-agreement.html": "Board Member Agreement",
    "05-corporate-risk-register-mitigation-protocol.html": "Corporate Risk Register",
    "06-corporate-social-responsibility-compliance.html": "Corporate Social Responsibility",
    "07-universal-terms-of-service.html": "Terms of Service",
    "07-cookie-tracking-policy.html": "Cookie Policy",
    "08-end-user-license-agreement.html": "End User License Agreement",
    "09-acceptable-use-safety-policy.html": "Acceptable Use Policy",
    "09-export-compliance-itar-ear.html": "Export Compliance",
    "10-service-level-agreement.html": "Service Level Agreement",
    "11-refunds-warranty-return-policy.html": "Refunds & Warranty Policy",
    "12-privacy-policy-gdpr-ccpa-coppa.html": "Privacy Policy",
    "13-data-processing-agreement.html": "Data Processing Agreement",
    "14-ai-training-use-consent.html": "AI Training Consent",
    "15-sensitive-data-youth-consent.html": "Sensitive Data Consent",
    "16-algorithmic-transparency-accountability.html": "Algorithmic Transparency",
    "17-ai-safety-bias-governance.html": "AI Safety & Governance",
    "18-creator-licensing-ip-agreement.html": "Creator Licensing Agreement",
    "19-marketplace-merchant-agreement.html": "Marketplace Merchant Agreement",
    "20-manufacturing-production-agreement.html": "Manufacturing Agreement",
    "21-attribution-distribution-derivative-rights.html": "Attribution & Derivative Rights",
    "22-digital-asset-nft-ownership.html": "Digital Asset & NFT Ownership",
    "23-product-liability-safety-disclosure.html": "Product Liability Disclosure",
    "24-warranty-repair-policy.html": "Warranty & Repair Policy",
    "25-materials-sourcing-ethical-compliance.html": "Materials Sourcing Compliance",
    "26-membership-terms-rights.html": "Membership Terms & Rights",
    "27-community-code-of-conduct.html": "Community Code of Conduct",
    "28-academic-integrity-institutional-use.html": "Academic Integrity Policy",
    "29-global-compliance-framework.html": "Global Compliance Framework",
    "30-cross-border-data-transfer-hosting.html": "Cross-Border Data Transfer",
    "31-charter-of-abundance-resilience-governance.html": "Charter of Abundance",
    "32-pledge-participation-collective-impact.html": "Pledge & Participation Agreement",
}

def create_wix_page_file(html_file, page_name):
    """Create a Wix page file from HTML"""
    # Read HTML content
    html_content = html_file.read_text(encoding='utf-8')
    
    # Extract just the body content (for Wix HTML widget)
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
    if body_match:
        body_content = body_match.group(1)
    else:
        body_content = html_content
    
    # Create a clean filename for Wix
    safe_name = re.sub(r'[^a-zA-Z0-9\s]', '', page_name)
    safe_name = re.sub(r'\s+', ' ', safe_name).strip()
    filename = safe_name.replace(' ', '_').lower()
    
    return filename, body_content

def deploy_to_wix_pages():
    """Deploy all legal pages to Wix pages folder"""
    
    # Create directories
    WIX_PAGES_DIR.mkdir(parents=True, exist_ok=True)
    WIX_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    print("🚀 Deploying Legal Pages to Wix")
    print("=" * 60)
    print(f"Source: {LEGAL_DIR}")
    print(f"Wix Pages: {WIX_PAGES_DIR}")
    print(f"Wix Public: {WIX_PUBLIC_DIR}")
    print("=" * 60 + "\n")
    
    deployed = []
    
    # Get all HTML files
    html_files = sorted(LEGAL_DIR.glob("*.html"))
    
    for html_file in html_files:
        filename = html_file.name
        
        # Get page name from mapping or generate from filename
        page_name = PAGE_MAPPINGS.get(filename, filename.replace('.html', '').replace('-', ' ').title())
        
        # Create Wix page file
        wix_filename, body_content = create_wix_page_file(html_file, page_name)
        
        # Copy full HTML to public folder (for direct access)
        public_file = WIX_PUBLIC_DIR / html_file.name
        shutil.copy2(html_file, public_file)
        
        # Create page content file for Wix
        page_file = WIX_PAGES_DIR / f"{wix_filename}.html"
        page_file.write_text(body_content, encoding='utf-8')
        
        # Also copy full HTML for reference
        full_html_file = WIX_PAGES_DIR / html_file.name
        shutil.copy2(html_file, full_html_file)
        
        deployed.append((page_name, wix_filename, html_file.name))
        print(f"✅ {page_name}")
        print(f"   → {wix_filename}.html")
        print(f"   → {html_file.name}")
    
    # Create index file
    index_content = f"""# Legal Pages Index
## Deployed: {len(deployed)} pages

"""
    for page_name, wix_filename, original_file in deployed:
        index_content += f"- **{page_name}**\n"
        index_content += f"  - Wix Page: `{wix_filename}.html`\n"
        index_content += f"  - Original: `{original_file}`\n\n"
    
    index_file = WIX_PAGES_DIR / "README.md"
    index_file.write_text(index_content, encoding='utf-8')
    
    # Create deployment manifest
    manifest = {
        "deployed_at": str(Path(__file__).stat().st_mtime),
        "total_pages": len(deployed),
        "pages": [
            {
                "name": page_name,
                "wix_filename": wix_filename,
                "original_file": original_file,
                "public_url": f"/legal/{wix_filename}"
            }
            for page_name, wix_filename, original_file in deployed
        ]
    }
    
    import json
    manifest_file = WIX_PAGES_DIR / "deployment_manifest.json"
    manifest_file.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    
    print("\n" + "=" * 60)
    print(f"✅ Deployed {len(deployed)} pages")
    print(f"📁 Wix Pages: {WIX_PAGES_DIR}")
    print(f"📁 Wix Public: {WIX_PUBLIC_DIR}")
    print("=" * 60)
    print("\n📋 Next Steps:")
    print("1. Run: wix dev")
    print("2. Pages will be available in Wix Editor")
    print("3. Add pages to navigation in Wix Editor")

if __name__ == "__main__":
    deploy_to_wix_pages()



