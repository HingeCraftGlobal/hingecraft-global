#!/usr/bin/env python3
"""
Fix Missing Optimizations
Ensure All Pages Are Ready
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src/pages"
LEGAL_HTML_DIR = BASE_DIR / "src/pages/legal"
VERIFICATION_FILE = BASE_DIR / "PAGES_VERIFICATION_REPORT.json"

# Hash to HTML mapping
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

KEYWORDS = [
    'hingecraft', 'hingecraft global', 'resilient design', 'charter of abundance',
    'sustainable manufacturing', 'ethical sourcing', 'circular economy', 'resilience framework',
    'community resilience', 'sustainable design', 'ethical production', 'resilient systems'
]

def generate_seo_code(page_name, page_url, seo_data=None, is_legal=False, html_content=None):
    """Generate SEO code"""
    if not seo_data:
        seo_data = {'title': page_name, 'description': '', 'keywords': ''}
    
    title = seo_data.get('title', page_name)
    if '|' in title:
        title = title.split('|')[0].strip()
    if 'hingecraft' not in title.lower():
        title = f"{title} | HingeCraft Global"
    if len(title) > 60:
        title = title[:57] + '...'
    
    desc = seo_data.get('description', '')
    if not desc or len(desc) < 50:
        desc = f"{page_name} - HingeCraft Global. Comprehensive information and resources."
    if len(desc) > 155:
        desc = desc[:152] + '...'
    
    keywords_str = ', '.join(KEYWORDS[:20])
    
    def escape_js(s):
        return s.replace("'", "\\'").replace("\n", " ").replace("\r", "").replace("`", "\\`").replace("$", "\\$")
    
    title_escaped = escape_js(title)
    desc_escaped = escape_js(desc)
    keywords_escaped = escape_js(keywords_str)
    
    schema = {
        "@context": "https://schema.org",
        "@type": "LegalDocument" if is_legal else "WebPage",
        "name": title,
        "description": desc,
        "url": f"https://hingecraft-global.ai{page_url}",
        "publisher": {
            "@type": "Organization",
            "name": "HingeCraft Global",
            "url": "https://hingecraft-global.ai"
        }
    }
    
    schema_json_str = json.dumps(schema, indent=2).replace("'", "\\'").replace("`", "\\`")
    
    html_loading = ""
    if is_legal and html_content:
        html_escaped = html_content.replace('`', '\\`').replace('${', '\\${').replace('\\', '\\\\')
        html_loading = f"""
    function loadLegalPageContent() {{
        const htmlElement = $w('#legalContent');
        if (htmlElement) {{
            htmlElement.html = `{html_escaped}`;
        }}
    }}
    loadLegalPageContent();
"""
    
    return f"""// Comprehensive SEO Optimization - {page_name}
$w.onReady(function () {{
    if (typeof document !== 'undefined') {{
        document.title = '{title_escaped}';
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {{
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }}
        metaDesc.setAttribute('content', '{desc_escaped}');
        
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {{
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }}
        metaKeywords.setAttribute('content', '{keywords_escaped}');
        
        const ogTags = {{
            'og:title': '{title_escaped}',
            'og:description': '{desc_escaped}',
            'og:image': 'https://hingecraft-global.ai/og-image.jpg',
            'og:url': 'https://hingecraft-global.ai{page_url}',
            'og:type': 'website',
            'og:site_name': 'HingeCraft Global'
        }};
        
        Object.keys(ogTags).forEach(prop => {{
            let ogMeta = document.querySelector(`meta[property="${{prop}}"]`);
            if (!ogMeta) {{
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', prop);
                document.head.appendChild(ogMeta);
            }}
            ogMeta.setAttribute('content', ogTags[prop]);
        }});
        
        const twitterTags = {{
            'twitter:card': 'summary_large_image',
            'twitter:title': '{title_escaped}',
            'twitter:description': '{desc_escaped}',
            'twitter:image': 'https://hingecraft-global.ai/og-image.jpg'
        }};
        
        Object.keys(twitterTags).forEach(name => {{
            let twitterMeta = document.querySelector(`meta[name="${{name}}"]`);
            if (!twitterMeta) {{
                twitterMeta = document.createElement('meta');
                twitterMeta.setAttribute('name', name);
                document.head.appendChild(twitterMeta);
            }}
            twitterMeta.setAttribute('content', twitterTags[name]);
        }});
        
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {{
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }}
        canonical.setAttribute('href', 'https://hingecraft-global.ai{page_url}');
        
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {{
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }}
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large');
        
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {{
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }}
        schemaScript.textContent = `{schema_json_str}`;
    }}
{html_loading}
}});
"""

def fix_page(js_file):
    """Fix page if missing optimizations"""
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if SEO code exists
        if 'Comprehensive SEO Optimization' in content:
            return False  # Already optimized
        
        # Get page info
        page_name = js_file.stem.split('.')[0]
        
        # Check if legal page
        is_legal = False
        html_content = None
        seo_data = None
        
        for hash_code, html_file in HASH_TO_HTML.items():
            if hash_code in js_file.name:
                is_legal = True
                html_path = LEGAL_HTML_DIR / html_file
                if html_path.exists():
                    with open(html_path, 'r') as f:
                        soup = BeautifulSoup(f.read(), 'html.parser')
                    body = soup.find('body')
                    if body:
                        for script in body.find_all('script'):
                            script.decompose()
                        html_content = str(body)
                    
                    title = soup.find('title')
                    desc = soup.find('meta', attrs={'name': 'description'})
                    seo_data = {
                        'title': title.text.strip() if title else page_name,
                        'description': desc.get('content', '') if desc else '',
                        'keywords': ''
                    }
                break
        
        # Generate URL
        page_url = f"/{page_name.lower().replace(' ', '-').replace('_', '-')}"
        if is_legal:
            page_url = f"/legal/{page_name.lower().replace(' ', '-')}"
        
        # Generate SEO code
        seo_code = generate_seo_code(page_name, page_url, seo_data, is_legal, html_content)
        
        # Add to file
        content = seo_code + '\n\n' + content
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error fixing {js_file.name}: {e}")
        return False

def main():
    """Main"""
    print("=" * 80)
    print("🔧 FIXING MISSING OPTIMIZATIONS")
    print("=" * 80)
    print()
    
    # Load verification report
    if VERIFICATION_FILE.exists():
        with open(VERIFICATION_FILE, 'r') as f:
            report = json.load(f)
        
        not_ready_pages = [name for name, verif in report['verifications'].items() 
                          if not verif.get('is_ready', False)]
        
        print(f"Found {len(not_ready_pages)} pages needing fixes")
        print()
    else:
        # Get all pages
        all_js_files = list(PAGES_DIR.glob("*.js"))
        all_js_files = [f for f in all_js_files if f.name != 'masterPage.js']
        not_ready_pages = [f.name for f in all_js_files]
    
    fixed = 0
    
    for page_name in not_ready_pages:
        js_file = PAGES_DIR / page_name
        if js_file.exists():
            print(f"Fixing: {page_name}")
            if fix_page(js_file):
                print(f"  ✅ Fixed")
                fixed += 1
            else:
                print(f"  ✅ Already optimized")
        else:
            print(f"  ⚠️  File not found")
    
    print()
    print("=" * 80)
    print(f"✅ Fixed: {fixed} pages")
    print("=" * 80)
    print()
    print("📋 Next: wix publish --source local --approve-preview --force")

if __name__ == "__main__":
    main()


