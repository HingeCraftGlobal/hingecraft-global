#!/usr/bin/env python3
"""
Simple SEO Addition - Adds meta tags directly via document manipulation
Works with all Wix Velo pages
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent.parent
LEGAL_HTML_DIR = BASE_DIR / "src/pages/legal"
PAGES_DIR = BASE_DIR / "src/pages"

def extract_seo(html_file):
    """Extract SEO from HTML"""
    try:
        with open(html_file, 'r') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        title = soup.find('title')
        title = title.text.strip() if title else ""
        
        desc = soup.find('meta', attrs={'name': 'description'})
        desc = desc.get('content', '') if desc else ""
        
        keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = keywords.get('content', '') if keywords else ""
        
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_title = og_title.get('content', '') if og_title else title
        
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        og_desc = og_desc.get('content', '') if og_desc else desc
        
        return {
            'title': title.replace("'", "\\'"),
            'description': desc.replace("'", "\\'"),
            'keywords': keywords.replace("'", "\\'"),
            'og_title': og_title.replace("'", "\\'"),
            'og_description': og_desc.replace("'", "\\'")
        }
    except:
        return None

def add_seo_code(js_file, seo_data):
    """Add SEO code to JS file"""
    try:
        with open(js_file, 'r') as f:
            content = f.read()
        
        if 'setSEO' in content or 'document.title' in content:
            return False
        
        page_name = js_file.stem.split('.')[0]
        
        # Use document manipulation (works in Wix Velo)
        seo_script = f"""
// SEO Configuration for {page_name}
$w.onReady(function () {{
    // Set page title
    if (typeof document !== 'undefined') {{
        document.title = '{seo_data['title']} | HingeCraft Global';
        
        // Set meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {{
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }}
        metaDesc.setAttribute('content', '{seo_data['description']}');
        
        // Set meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {{
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }}
        metaKeywords.setAttribute('content', '{seo_data['keywords']}');
        
        // Set Open Graph tags
        ['og:title', 'og:description', 'og:image'].forEach(prop => {{
            let ogMeta = document.querySelector(`meta[property="${{prop}}"]`);
            if (!ogMeta) {{
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', prop);
                document.head.appendChild(ogMeta);
            }}
            if (prop === 'og:title') ogMeta.setAttribute('content', '{seo_data['og_title']}');
            if (prop === 'og:description') ogMeta.setAttribute('content', '{seo_data['og_description']}');
            if (prop === 'og:image') ogMeta.setAttribute('content', 'https://hingecraft-global.ai/og-image.jpg');
        }});
    }}
}});
"""
        
        if '$w.onReady' in content:
            # Insert before existing onReady
            content = seo_script.strip() + '\n\n' + content
        else:
            content = seo_script.strip() + '\n\n' + content
        
        with open(js_file, 'w') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# Find legal pages
legal_keywords = ['privacy', 'terms', 'cookie', 'corporate', 'charter', 'bylaws', 'legal']

js_files = list(PAGES_DIR.glob("*.js"))
legal_files = [f for f in js_files if any(kw in f.name.lower() for kw in legal_keywords)]

print(f"Found {len(legal_files)} legal pages")

for js_file in legal_files:
    # Find matching HTML
    html_files = list(LEGAL_HTML_DIR.glob("*.html"))
    matched = None
    
    js_clean = re.sub(r'[^a-z0-9]', '', js_file.name.lower())
    for html_file in html_files:
        html_clean = re.sub(r'[^a-z0-9]', '', html_file.name.lower())
        if len(set(js_clean) & set(html_clean)) > 5:
            matched = html_file
            break
    
    if matched:
        seo = extract_seo(matched)
        if seo and add_seo_code(js_file, seo):
            print(f"✅ {js_file.name}")
        else:
            print(f"⚠️  {js_file.name}")

print("\nDone! Now run: wix publish")

