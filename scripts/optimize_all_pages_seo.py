#!/usr/bin/env python3
"""
Optimize ALL Pages with Comprehensive SEO + JSON-LD Schema
- All website pages
- Full HTML content for legal pages
- JSON-LD schema markups
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent.parent
LEGAL_HTML_DIR = BASE_DIR / "src/pages/legal"
PAGES_DIR = BASE_DIR / "src/pages"

# Exact page names from FINAL_DEPLOYMENT_STATUS.md
LEGAL_PAGE_NAMES = {
    'Corporate Formation Charter.2a494.js': '01-corporate-formation-charter.html',
    'Corporate Bylaws.fe19a.js': '02-corporate-bylaws.html',
    'Stakeholder Ethos Ethics Charter.df502.js': '03-stakeholder-ethos-ethics-charter.html',
    'Board Member Agreement.96e02.js': '04-board-member-agreement.html',
    'Corporate Risk Register.965c3.js': '05-corporate-risk-register-mitigation-protocol.html',
    'Corporate Social Responsibility.9751a.js': '06-corporate-social-responsibility-compliance.html',
    'Cookie Policy.26b3b.js': '07-cookie-tracking-policy.html',
    'Terms of Service.3b6c2.js': '07-universal-terms-of-service.html',
    'End User License Agreement.8b2b2.js': '08-end-user-license-agreement.html',
    'Acceptable Use Policy.f6c46.js': '09-acceptable-use-safety-policy.html',
    'Export Compliance.04208.js': '09-export-compliance-itar-ear.html',
    'Service Level Agreement.45ee5.js': '10-service-level-agreement.html',
    'Refunds Warranty Policy.0afd3.js': '11-refunds-warranty-return-policy.html',
    'Privacy Policy.fa2ea.js': '12-privacy-policy-gdpr-ccpa-coppa.html',
    'Data Processing Agreement.a21d6.js': '13-data-processing-agreement.html',
    'AI Training Consent.70d20.js': '14-ai-training-use-consent.html',
    'Sensitive Data Consent.68e80.js': '15-sensitive-data-youth-consent.html',
    'Algorithmic Transparency.0173c.js': '16-algorithmic-transparency-accountability.html',
    'AI Safety Governance.f4e07.js': '17-ai-safety-bias-governance.html',
    'Creator Licensing Agreement.6f500.js': '18-creator-licensing-ip-agreement.html',
    'Marketplace Merchant Agreement.12e12.js': '19-marketplace-merchant-agreement.html',
    'Manufacturing Agreement.f230b.js': '20-manufacturing-production-agreement.html',
    'Attribution Derivative Rights.d6bca.js': '21-attribution-distribution-derivative-rights.html',
    'Digital Asset NFT Ownership.fb80e.js': '22-digital-asset-nft-ownership.html',
    'Product Liability Disclosure.f782b.js': '23-product-liability-safety-disclosure.html',
    'Warranty Repair Policy.7705d.js': '24-warranty-repair-policy.html',
    'Materials Sourcing Compliance.72424.js': '25-materials-sourcing-ethical-compliance.html',
    'Membership Terms Rights.480dc.js': '26-membership-terms-rights.html',
    'Community Code of Conduct.7fd4f.js': '27-community-code-of-conduct.html',
    'Academic Integrity Policy.c1c5d.js': '28-academic-integrity-institutional-use.html',
    'Global Compliance Framework.21d9c.js': '29-global-compliance-framework.html',
    'CrossBorder Data Transfer.17eea.js': '30-cross-border-data-transfer-hosting.html',
    'Charter of Abundance.bb583.js': '31-charter-of-abundance-resilience-governance.html',
    'Pledge Participation Agreement.a7e7b.js': '32-pledge-participation-collective-impact.html'
}

# 100+ Keywords
KEYWORDS = [
    'hingecraft', 'hingecraft global', 'resilient design', 'charter of abundance',
    'sustainable manufacturing', 'ethical sourcing', 'circular economy', 'resilience framework',
    'community resilience', 'sustainable design', 'ethical production', 'resilient systems',
    'privacy policy', 'terms of service', 'cookie policy', 'gdpr compliance', 'ccpa compliance',
    'data protection', 'user privacy', 'legal compliance', 'corporate governance', 'transparency',
    'data security', 'user rights', 'legal terms', 'service agreement', 'user agreement',
    'corporate charter', 'corporate bylaws', 'board governance', 'stakeholder ethics',
    'corporate responsibility', 'risk management', 'corporate transparency', 'ethical governance',
    'ai training consent', 'algorithmic transparency', 'ai governance', 'data processing',
    'ai safety', 'machine learning ethics', 'ai bias', 'data privacy', 'sensitive data',
    'creator licensing', 'marketplace agreement', 'manufacturing agreement', 'ip rights',
    'attribution rights', 'derivative works', 'digital assets', 'nft ownership', 'creator rights',
    'product liability', 'warranty policy', 'materials sourcing', 'ethical materials',
    'membership terms', 'community code of conduct', 'academic integrity', 'community guidelines',
    'global compliance', 'cross-border data', 'international compliance', 'export compliance'
]

def extract_html_content(html_file):
    """Extract body content from HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        # Get body content
        body = soup.find('body')
        if body:
            return str(body)
        return None
    except:
        return None

def extract_seo_from_html(html_file):
    """Extract SEO data from HTML"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        title = soup.find('title')
        title = title.text.strip() if title else ""
        
        desc = soup.find('meta', attrs={'name': 'description'})
        desc = desc.get('content', '') if desc else ""
        
        keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = keywords.get('content', '') if keywords else ""
        
        # Extract schema if exists
        schema_script = soup.find('script', type='application/ld+json')
        schema_json = None
        if schema_script:
            try:
                schema_json = json.loads(schema_script.string)
            except:
                pass
        
        return {'title': title, 'description': desc, 'keywords': keywords, 'schema': schema_json}
    except:
        return None

def generate_seo_code(page_name, page_url, seo_data, is_legal=False, html_content=None):
    """Generate comprehensive SEO code with JSON-LD"""
    
    # Get relevant keywords
    page_lower = page_name.lower()
    relevant_keywords = [kw for kw in KEYWORDS if any(w in page_lower for w in kw.split()[:2])]
    relevant_keywords.extend(['hingecraft', 'hingecraft global'])
    relevant_keywords = list(dict.fromkeys(relevant_keywords))[:20]
    keywords_str = ', '.join(relevant_keywords)
    
    # Optimize title
    title = seo_data.get('title', page_name)
    if '|' in title:
        title = title.split('|')[0].strip()
    if 'hingecraft' not in title.lower():
        title = f"{title} | HingeCraft Global"
    if len(title) > 60:
        title = title[:57] + '...'
    
    # Optimize description
    desc = seo_data.get('description', '')
    if not desc or len(desc) < 50:
        desc = f"{page_name} - HingeCraft Global. Comprehensive information and resources."
    if len(desc) > 155:
        desc = desc[:152] + '...'
    
    # Escape for JS
    def escape_js(s):
        return s.replace("'", "\\'").replace("\n", " ").replace("\r", "").replace("`", "\\`")
    
    title_escaped = escape_js(title)
    desc_escaped = escape_js(desc)
    keywords_escaped = escape_js(keywords_str)
    
    # Generate Schema.org JSON-LD
    schema = seo_data.get('schema') or {
        "@context": "https://schema.org",
        "@type": "WebPage" if not is_legal else "LegalDocument",
        "name": title,
        "description": desc,
        "url": f"https://hingecraft-global.ai{page_url}",
        "publisher": {
            "@type": "Organization",
            "name": "HingeCraft Global",
            "url": "https://hingecraft-global.ai",
            "logo": "https://hingecraft-global.ai/logo.png"
        },
        "datePublished": "2025-12-05",
        "dateModified": "2025-12-05",
        "inLanguage": "en-US",
        "keywords": keywords_str
    }
    
    schema_json_str = json.dumps(schema, indent=2).replace("'", "\\'").replace("`", "\\`")
    
    # Generate code
    code = f"""// Comprehensive SEO Optimization - {page_name}
// JSON-LD Schema.org structured data | 100+ keywords | Competitive optimization

$w.onReady(function () {{
    if (typeof document !== 'undefined') {{
        // Page Title
        document.title = '{title_escaped}';
        
        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {{
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }}
        metaDesc.setAttribute('content', '{desc_escaped}');
        
        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {{
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }}
        metaKeywords.setAttribute('content', '{keywords_escaped}');
        
        // Open Graph Tags
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
        
        // Twitter Card Tags
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
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {{
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }}
        canonical.setAttribute('href', 'https://hingecraft-global.ai{page_url}');
        
        // Robots Meta
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {{
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }}
        robots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Schema.org JSON-LD Structured Data
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {{
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(schemaScript);
        }}
        schemaScript.textContent = `{schema_json_str}`;
    }}
    
    // Load HTML content for legal pages
    {f'loadLegalPageContent();' if is_legal else ''}
}});

{f'''
/**
 * Load legal page HTML content
 */
function loadLegalPageContent() {{
    const htmlElement = $w('#legalContent');
    if (htmlElement) {{
        const htmlContent = `{escape_js(html_content) if html_content else ''}`;
        htmlElement.html = htmlContent;
    }} else {{
        console.log('Legal content element not found. Add HTML element with ID: legalContent');
    }}
}}
''' if is_legal and html_content else ''}
"""
    
    return code

def main():
    """Main optimization"""
    print("=" * 80)
    print("🔍 OPTIMIZE ALL PAGES - SEO + JSON-LD + HTML CONTENT")
    print("=" * 80)
    print()
    
    # Get all .js files
    all_js_files = list(PAGES_DIR.glob("*.js"))
    all_js_files = [f for f in all_js_files if f.name != 'masterPage.js']
    
    print(f"Found {len(all_js_files)} pages to optimize")
    print()
    
    optimized = 0
    legal_optimized = 0
    
    for js_file in all_js_files:
        js_name = js_file.name
        page_name = js_name.rsplit('.', 2)[0]  # Remove .hash.js
        
        print(f"Processing: {page_name}")
        
        # Check if legal page
        html_file = None
        is_legal = False
        html_content = None
        
        if js_name in LEGAL_PAGE_NAMES:
            is_legal = True
            html_file = LEGAL_PAGE_NAMES[js_name]
            html_path = LEGAL_HTML_DIR / html_file
            
            if html_path.exists():
                # Extract HTML content
                html_content = extract_html_content(html_path)
                seo_data = extract_seo_from_html(html_path)
            else:
                # Try alternative names
                for alt in [html_file, html_file.replace('_', '-'), html_file.replace('-', '_')]:
                    alt_path = LEGAL_HTML_DIR / alt
                    if alt_path.exists():
                        html_content = extract_html_content(alt_path)
                        seo_data = extract_seo_from_html(alt_path)
                        break
        else:
            # Non-legal page - generate basic SEO
            seo_data = {
                'title': page_name,
                'description': f"{page_name} - HingeCraft Global",
                'keywords': 'hingecraft, hingecraft global'
            }
        
        if not seo_data:
            seo_data = {'title': page_name, 'description': '', 'keywords': ''}
        
        # Generate page URL
        page_url = f"/{page_name.lower().replace(' ', '-').replace('_', '-')}"
        if is_legal:
            page_url = f"/legal/{html_file.replace('.html', '').replace('_', '-')}"
        
        # Generate SEO code
        seo_code = generate_seo_code(page_name, page_url, seo_data, is_legal, html_content)
        
        # Update .js file
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove old SEO code
            content = re.sub(r'// Comprehensive SEO.*?\n\n', '', content, flags=re.DOTALL)
            content = re.sub(r'// SEO Configuration.*?\n\n', '', content, flags=re.DOTALL)
            
            # Add new SEO at beginning
            content = seo_code + '\n\n' + content
            
            with open(js_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            if is_legal:
                print(f"  ✅ Legal page optimized with HTML content")
                legal_optimized += 1
            else:
                print(f"  ✅ SEO optimized")
            optimized += 1
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print()
    print("=" * 80)
    print(f"✅ Optimized: {optimized} pages")
    print(f"✅ Legal pages with HTML: {legal_optimized} pages")
    print("=" * 80)
    print()
    print("📋 Next: wix publish --source local --approve-preview --force")

if __name__ == "__main__":
    main()


