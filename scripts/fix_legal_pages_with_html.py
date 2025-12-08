#!/usr/bin/env python3
"""
Fix Legal Pages - Match by hash and load HTML content
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent.parent
LEGAL_HTML_DIR = BASE_DIR / "src/pages/legal"
PAGES_DIR = BASE_DIR / "src/pages"

# Map hash to HTML file
HASH_TO_HTML = {
    '2a494': '01-corporate-formation-charter.html',
    'fe19a': '02-corporate-bylaws.html',
    'df502': '03-stakeholder-ethos-ethics-charter.html',
    '96e02': '04-board-member-agreement.html',
    '965c3': '05-corporate-risk-register-mitigation-protocol.html',
    '9751a': '06-corporate-social-responsibility-compliance.html',
    '26b3b': '07-cookie-tracking-policy.html',
    '3b6c2': '07-universal-terms-of-service.html',
    '8b2b2': '08-end-user-license-agreement.html',
    'f6c46': '09-acceptable-use-safety-policy.html',
    '04208': '09-export-compliance-itar-ear.html',
    '45ee5': '10-service-level-agreement.html',
    '0afd3': '11-refunds-warranty-return-policy.html',
    'fa2ea': '12-privacy-policy-gdpr-ccpa-coppa.html',
    'a21d6': '13-data-processing-agreement.html',
    '70d20': '14-ai-training-use-consent.html',
    '68e80': '15-sensitive-data-youth-consent.html',
    '0173c': '16-algorithmic-transparency-accountability.html',
    'f4e07': '17-ai-safety-bias-governance.html',
    '6f500': '18-creator-licensing-ip-agreement.html',
    '12e12': '19-marketplace-merchant-agreement.html',
    'f230b': '20-manufacturing-production-agreement.html',
    'd6bca': '21-attribution-distribution-derivative-rights.html',
    'fb80e': '22-digital-asset-nft-ownership.html',
    'f782b': '23-product-liability-safety-disclosure.html',
    '7705d': '24-warranty-repair-policy.html',
    '72424': '25-materials-sourcing-ethical-compliance.html',
    '480dc': '26-membership-terms-rights.html',
    '7fd4f': '27-community-code-of-conduct.html',
    'c1c5d': '28-academic-integrity-institutional-use.html',
    '21d9c': '29-global-compliance-framework.html',
    '17eea': '30-cross-border-data-transfer-hosting.html',
    'bb583': '31-charter-of-abundance-resilience-governance.html',
    'a7e7b': '32-pledge-participation-collective-impact.html'
}

def extract_body_content(html_file):
    """Extract body content"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        body = soup.find('body')
        if body:
            # Remove script tags to avoid conflicts
            for script in body.find_all('script'):
                script.decompose()
            return str(body)
    except:
        pass
    return None

def extract_seo(html_file):
    """Extract SEO"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        title = soup.find('title')
        title = title.text.strip() if title else ""
        
        desc = soup.find('meta', attrs={'name': 'description'})
        desc = desc.get('content', '') if desc else ""
        
        keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = keywords.get('content', '') if keywords else ""
        
        return {'title': title, 'description': desc, 'keywords': keywords}
    except:
        return None

def add_html_content_to_js(js_file, html_content, seo_data):
    """Add HTML content loading code"""
    
    # Escape HTML for JS
    html_escaped = html_content.replace('`', '\\`').replace('${', '\\${').replace('\\', '\\\\')
    
    # Get page name
    page_name = js_file.stem.split('.')[0]
    
    code = f"""
// Load Legal Page HTML Content
function loadLegalPageContent() {{
    const htmlElement = $w('#legalContent');
    if (htmlElement) {{
        const htmlContent = `{html_escaped}`;
        htmlElement.html = htmlContent;
        console.log('Legal page content loaded successfully');
    }} else {{
        console.log('Legal content element not found. Add HTML element with ID: legalContent');
    }}
}}

$w.onReady(function () {{
    loadLegalPageContent();
}});
"""
    
    # Read existing file
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove old loadLegalPageContent if exists
        content = re.sub(r'function loadLegalPageContent.*?\n\}\n', '', content, flags=re.DOTALL)
        content = re.sub(r'\$w\.onReady\(function.*?loadLegalPageContent.*?\n\}\);', '', content, flags=re.DOTALL)
        
        # Add new code at end
        content = content.rstrip() + '\n\n' + code
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Main"""
    print("=" * 80)
    print("🔧 FIX LEGAL PAGES - Load HTML Content")
    print("=" * 80)
    print()
    
    # Find files by hash
    all_js_files = list(PAGES_DIR.glob("*.js"))
    
    fixed = 0
    
    for hash_code, html_file in HASH_TO_HTML.items():
        # Find .js file with this hash
        js_file = None
        for f in all_js_files:
            if hash_code in f.name:
                js_file = f
                break
        
        if not js_file:
            print(f"⚠️  No .js file found for hash: {hash_code}")
            continue
        
        # Get HTML file
        html_path = LEGAL_HTML_DIR / html_file
        if not html_path.exists():
            # Try alternatives
            for alt in [html_file, html_file.replace('_', '-'), html_file.replace('-', '_')]:
                alt_path = LEGAL_HTML_DIR / alt
                if alt_path.exists():
                    html_path = alt_path
                    break
        
        if not html_path.exists():
            print(f"⚠️  HTML not found: {html_file}")
            continue
        
        # Extract content
        html_content = extract_body_content(html_path)
        seo_data = extract_seo(html_path)
        
        if not html_content:
            print(f"⚠️  Could not extract HTML from: {html_file}")
            continue
        
        # Add to .js file
        if add_html_content_to_js(js_file, html_content, seo_data):
            print(f"✅ {js_file.name} → HTML content loaded")
            fixed += 1
        else:
            print(f"❌ Failed: {js_file.name}")
    
    print()
    print("=" * 80)
    print(f"✅ Fixed: {fixed} legal pages")
    print("=" * 80)

if __name__ == "__main__":
    main()




