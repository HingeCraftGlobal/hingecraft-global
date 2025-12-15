#!/usr/bin/env python3
"""
Add SEO to ALL Pages - Finds pages by name matching and adds SEO
Uses Wix SEO settings API correctly
"""

import json
import re
import os
from pathlib import Path
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent.parent
LEGAL_HTML_DIR = BASE_DIR / "src/pages/legal"
PAGES_DIR = BASE_DIR / "src/pages"
MANIFEST_FILE = BASE_DIR / "LEGAL_PAGES_WIX_DEPLOYMENT_SUMMARY.json"

# Legal page keywords for matching
LEGAL_KEYWORDS = [
    'corporate', 'bylaws', 'charter', 'stakeholder', 'board', 'risk', 'social',
    'cookie', 'privacy', 'terms', 'eula', 'acceptable', 'export', 'service',
    'refund', 'warranty', 'data', 'processing', 'ai', 'training', 'consent',
    'sensitive', 'algorithmic', 'transparency', 'safety', 'governance',
    'creator', 'licensing', 'marketplace', 'merchant', 'manufacturing',
    'attribution', 'derivative', 'digital', 'asset', 'nft', 'product', 'liability',
    'materials', 'sourcing', 'membership', 'community', 'code', 'conduct',
    'academic', 'integrity', 'global', 'compliance', 'cross', 'border', 'transfer',
    'charter', 'abundance', 'pledge', 'participation'
]

def load_manifest():
    """Load deployment manifest"""
    try:
        with open(MANIFEST_FILE, 'r') as f:
            return json.load(f)
    except:
        return None

def extract_seo_from_html(html_file):
    """Extract SEO data from HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        title = soup.find('title')
        title_text = title.text.strip() if title else ""
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ""
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords.get('content', '') if meta_keywords else ""
        
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_title_text = og_title.get('content', '') if og_title else title_text
        
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        og_desc_text = og_desc.get('content', '') if og_desc else description
        
        og_image = soup.find('meta', attrs={'property': 'og:image'})
        og_image_url = og_image.get('content', '') if og_image else "https://hingecraft-global.ai/og-image.jpg"
        
        return {
            'title': title_text,
            'description': description,
            'keywords': keywords,
            'og_title': og_title_text,
            'og_description': og_desc_text,
            'og_image': og_image_url
        }
    except Exception as e:
        return None

def is_legal_page(filename):
    """Check if filename suggests it's a legal page"""
    filename_lower = filename.lower()
    return any(keyword in filename_lower for keyword in LEGAL_KEYWORDS)

def find_matching_html(js_filename):
    """Find matching HTML file for a JS filename"""
    # Try to match by name
    js_name_clean = re.sub(r'\.[a-z0-9]+\.js$', '', js_filename.lower())
    js_name_clean = re.sub(r'[^a-z0-9]', '', js_name_clean)
    
    # Check all HTML files
    for html_file in LEGAL_HTML_DIR.glob("*.html"):
        html_name_clean = re.sub(r'\.html$', '', html_file.name.lower())
        html_name_clean = re.sub(r'[^a-z0-9]', '', html_name_clean)
        
        # Check if significant overlap
        if len(js_name_clean) > 5 and len(html_name_clean) > 5:
            # Check for common words
            js_words = set(js_name_clean)
            html_words = set(html_name_clean)
            overlap = len(js_words & html_words) / max(len(js_words), len(html_words))
            if overlap > 0.3:
                return html_file
    
    return None

def generate_seo_code_v2(seo_data, page_name):
    """Generate SEO code using Wix SEO API (correct version)"""
    
    title = seo_data.get('title', page_name)
    if '|' in title:
        title = title.split('|')[0].strip()
    
    description = seo_data.get('description', '')
    keywords = seo_data.get('keywords', '')
    og_title = seo_data.get('og_title', title)
    og_desc = seo_data.get('og_description', description)
    og_image = seo_data.get('og_image', 'https://hingecraft-global.ai/og-image.jpg')
    
    # Escape quotes
    title = title.replace("'", "\\'")
    description = description.replace("'", "\\'")
    keywords = keywords.replace("'", "\\'")
    og_title = og_title.replace("'", "\\'")
    og_desc = og_desc.replace("'", "\\'")
    
    # Use Wix SEO API correctly
    seo_code = f"""// SEO Configuration for {page_name}
import {{ seo }} from 'wix-seo';

$w.onReady(function () {{
    // Set page SEO
    seo.setTitle('{title} | HingeCraft Global');
    seo.setDescription('{description}');
    seo.setKeywords('{keywords}');
    
    // Set Open Graph
    seo.setOgTitle('{og_title}');
    seo.setOgDescription('{og_desc}');
    seo.setOgImage('{og_image}');
    
    // Set canonical and robots
    seo.setCanonicalUrl(window.location.href);
    seo.setRobots('index, follow');
}});
"""
    
    return seo_code

def add_seo_to_file(js_file_path, seo_code):
    """Add SEO code to .js file"""
    try:
        with open(js_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if SEO already exists
        if 'seo.setTitle' in content or 'wixSeo' in content:
            return False
        
        # Find $w.onReady and replace or prepend
        if '$w.onReady' in content:
            # Insert SEO code before onReady
            pattern = r'(\$w\.onReady\s*\(function\s*\(\)\s*\{)'
            replacement = seo_code.strip() + '\n\n    ' + r'\1'
            new_content = re.sub(pattern, replacement, content, count=1)
        else:
            # Add at beginning
            new_content = seo_code.strip() + '\n\n' + content
        
        with open(js_file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("=" * 70)
    print("🔍 Finding ALL Legal Pages and Adding SEO")
    print("=" * 70)
    print()
    
    # Get all .js files
    all_js_files = list(PAGES_DIR.glob("*.js"))
    print(f"Found {len(all_js_files)} total .js files")
    print()
    
    # Filter legal pages
    legal_js_files = []
    for js_file in all_js_files:
        if is_legal_page(js_file.name):
            legal_js_files.append(js_file)
    
    print(f"Found {len(legal_js_files)} potential legal pages")
    print()
    
    updated = 0
    skipped = 0
    
    for js_file in legal_js_files:
        print(f"Processing: {js_file.name}")
        
        # Find matching HTML
        html_file = find_matching_html(js_file.name)
        
        if not html_file:
            print(f"  ⚠️  No matching HTML file found")
            skipped += 1
            continue
        
        # Extract SEO
        seo_data = extract_seo_from_html(html_file)
        if not seo_data:
            print(f"  ⚠️  Could not extract SEO data")
            skipped += 1
            continue
        
        # Generate SEO code
        page_name = js_file.stem.split('.')[0]  # Remove hash
        seo_code = generate_seo_code_v2(seo_data, page_name)
        
        # Add to file
        if add_seo_to_file(js_file, seo_code):
            print(f"  ✅ Added SEO")
            updated += 1
        else:
            print(f"  ⚠️  SEO already exists or error")
            skipped += 1
    
    print()
    print("=" * 70)
    print(f"✅ Updated: {updated} pages")
    print(f"⚠️  Skipped: {skipped} pages")
    print("=" * 70)

if __name__ == "__main__":
    main()




