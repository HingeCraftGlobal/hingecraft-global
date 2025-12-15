#!/usr/bin/env python3
"""
Create Wix pages for SC Legal Documents that don't have existing pages
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("../hingecraft-global")
SC_DOCS_DIR = BASE_DIR / "COMPLETE_LEGAL_DOCS_SC"
WIX_PAGES_DIR = BASE_DIR / "src" / "pages"
LEGAL_DIR = WIX_PAGES_DIR / "legal"

# Documents that need new pages
MISSING_PAGES = [
    "01-Corporate-Formation-Charter.html",
    "04-Board-Member-Agreement.html", 
    "05-Corporate-Risk-Register-Mitigation-Protocol.html",
    "10-Export-Compliance-ITAR-EAR.html",
    "11-Service-Level-Agreement.html",
    "14-Cookie-Tracking-Policy.html",
    "19-Product-Liability-Safety-Disclosure.html",
    "21-Manufacturing-Production-Agreement.html",
    "22-Marketplace-Merchant-Agreement.html",
    "23-Materials-Sourcing-Ethical-Compliance.html",
    "26-Digital-Asset-NFT-Ownership.html",
    "33-Pledge-Participation-Collective-Impact.html",
    "34-Employee-Handbook-Policies.html"
]

def escape_js_string(content):
    content = content.replace('\\', '\\\\')
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')
    return content

def read_html_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def generate_page_code(html_content, page_title):
    escaped_content = escape_js_string(html_content)
    
    code = f'''// HingeCraft Global, LLC - Legal Document
// {page_title}
// State of South Carolina | December 2024

import wixSeo from 'wix-seo';

$w.onReady(function () {{
    wixSeo.setTitle("{page_title} | HingeCraft Global");
    wixSeo.setMetaTags([
        {{ name: "description", content: "{page_title} - HingeCraft Global legal document" }},
        {{ name: "robots", content: "index, follow" }}
    ]);
    loadLegalContent();
}});

function loadLegalContent() {{
    const legalContent = `{escaped_content}`;
    if ($w('#legalContent')) {{
        try {{ $w('#legalContent').html = legalContent; }} catch (e) {{}}
    }}
}}
'''
    return code

def create_page_filename(doc_name):
    # Convert to safe filename
    name = doc_name.replace('.html', '').replace('-', '_')
    return f"{name}_SC.js"

def main():
    print("Creating missing SC legal pages...")
    LEGAL_DIR.mkdir(parents=True, exist_ok=True)
    
    created = []
    
    for doc in MISSING_PAGES:
        sc_path = SC_DOCS_DIR / doc
        if not sc_path.exists():
            print(f"✗ Not found: {doc}")
            continue
        
        html_content = read_html_content(sc_path)
        page_title = doc.replace('.html', '').replace('-', ' ').title()
        page_title = re.sub(r'^\d+\s+', '', page_title)
        
        new_filename = create_page_filename(doc)
        new_path = LEGAL_DIR / new_filename
        
        code = generate_page_code(html_content, page_title)
        
        with open(new_path, 'w', encoding='utf-8') as f:
            f.write(code)
        
        created.append(new_filename)
        print(f"✓ Created: legal/{new_filename}")
    
    print(f"\nCreated {len(created)} new pages in src/pages/legal/")

if __name__ == "__main__":
    main()



