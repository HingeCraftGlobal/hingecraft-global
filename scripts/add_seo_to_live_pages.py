#!/usr/bin/env python3
"""
Add SEO Markups to All Live Legal Pages
Scans HTML files, extracts SEO data, and adds to .js page files
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

def load_manifest():
    """Load deployment manifest"""
    with open(MANIFEST_FILE, 'r') as f:
        return json.load(f)

def extract_seo_from_html(html_file):
    """Extract SEO data from HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract meta tags
        title = soup.find('title')
        title_text = title.text.strip() if title else ""
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ""
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords.get('content', '') if meta_keywords else ""
        
        # Extract Open Graph
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_title_text = og_title.get('content', '') if og_title else title_text
        
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        og_desc_text = og_desc.get('content', '') if og_desc else description
        
        og_image = soup.find('meta', attrs={'property': 'og:image'})
        og_image_url = og_image.get('content', '') if og_image else ""
        
        og_url = soup.find('meta', attrs={'property': 'og:url'})
        og_url_text = og_url.get('content', '') if og_url else ""
        
        # Extract Schema.org JSON-LD
        schema_script = soup.find('script', type='application/ld+json')
        schema_json = None
        if schema_script:
            try:
                schema_json = json.loads(schema_script.string)
            except:
                pass
        
        return {
            'title': title_text,
            'description': description,
            'keywords': keywords,
            'og_title': og_title_text,
            'og_description': og_desc_text,
            'og_image': og_image_url,
            'og_url': og_url_text,
            'schema': schema_json
        }
    except Exception as e:
        print(f"Error extracting SEO from {html_file}: {e}")
        return None

def generate_seo_code(seo_data, page_name, page_url):
    """Generate Wix SEO code using wix-seo API"""
    
    # Clean up title (remove | HingeCraft Global if present, we'll add it properly)
    title = seo_data.get('title', page_name)
    if '|' in title:
        title = title.split('|')[0].strip()
    
    description = seo_data.get('description', '')
    keywords = seo_data.get('keywords', '')
    og_title = seo_data.get('og_title', title)
    og_desc = seo_data.get('og_description', description)
    og_image = seo_data.get('og_image', 'https://hingecraft-global.ai/og-image.jpg')
    og_url = seo_data.get('og_url', f'https://hingecraft-global.ai{page_url}')
    
    # Generate SEO code
    seo_code = f"""
    // SEO Configuration for {page_name}
    import wixSeo from 'wix-seo';
    
    $w.onReady(function () {{
        // Set SEO meta tags
        wixSeo.setTitle('{title} | HingeCraft Global');
        wixSeo.setDescription('{description}');
        wixSeo.setKeywords('{keywords}');
        
        // Set Open Graph tags
        wixSeo.setOgTitle('{og_title}');
        wixSeo.setOgDescription('{og_desc}');
        wixSeo.setOgImage('{og_image}');
        wixSeo.setOgUrl('{og_url}');
        
        // Set canonical URL
        wixSeo.setCanonicalUrl('{og_url}');
        
        // Set robots meta
        wixSeo.setRobots('index, follow');
        
        // Load legal page content
        loadLegalPageContent();
    }});
    
    /**
     * Load legal page HTML content
     */
    function loadLegalPageContent() {{
        // HTML content will be loaded from the HTML element
        // Make sure HTML element with ID 'legalContent' exists on the page
        const htmlElement = $w('#legalContent');
        if (htmlElement) {{
            console.log('Legal content element found');
        }} else {{
            console.log('Legal content element not found. Add HTML element with ID: legalContent');
        }}
    }}
    """
    
    return seo_code

def add_seo_to_js_file(js_file_path, seo_code):
    """Add SEO code to existing .js file"""
    try:
        with open(js_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if SEO code already exists
        if 'wixSeo' in content or 'setTitle' in content:
            print(f"  ⚠️  SEO already exists in {js_file_path.name}")
            return False
        
        # Replace the basic $w.onReady with SEO-enhanced version
        # Find the $w.onReady block
        pattern = r'\$w\.onReady\(function\s*\(\)\s*\{[^}]*\}\);'
        
        if re.search(pattern, content):
            # Replace existing onReady with SEO version
            new_content = re.sub(pattern, seo_code.strip(), content, count=1)
        else:
            # Append SEO code if no onReady found
            new_content = content + "\n\n" + seo_code
        
        # Write back
        with open(js_file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"  ❌ Error updating {js_file_path.name}: {e}")
        return False

def main():
    """Main function"""
    print("=" * 70)
    print("🔍 Scanning Live Pages and Adding SEO Markups")
    print("=" * 70)
    print()
    
    # Load manifest
    manifest = load_manifest()
    pages = manifest['pages']
    
    # Find existing .js files
    js_files = {}
    for js_file in PAGES_DIR.glob("*.js"):
        js_files[js_file.name] = js_file
    
    print(f"Found {len(js_files)} .js files in src/pages/")
    print()
    
    # Process each page
    updated_count = 0
    not_found_count = 0
    
    for page in pages:
        page_name = page['name']
        wix_file = page['wix_file']
        html_file = page['html_file']
        page_url = page['url']
        
        print(f"Processing: {page_name}")
        
        # Find matching .js file
        js_file_path = None
        for js_name, js_path in js_files.items():
            # Match by page name (remove special chars)
            clean_name = re.sub(r'[^a-zA-Z0-9]', '', page_name.lower())
            clean_js = re.sub(r'[^a-zA-Z0-9]', '', js_name.lower())
            if clean_name in clean_js or clean_js in clean_name:
                js_file_path = js_path
                break
        
        if not js_file_path:
            # Try exact filename match
            if wix_file in js_files:
                js_file_path = js_files[wix_file]
        
        if not js_file_path:
            print(f"  ⚠️  .js file not found for: {page_name}")
            not_found_count += 1
            continue
        
        # Extract SEO from HTML
        html_file_path = LEGAL_HTML_DIR / html_file
        if not html_file_path.exists():
            # Try alternative naming
            alt_names = [
                html_file,
                html_file.replace('_', '-'),
                html_file.replace('-', '_'),
            ]
            for alt in alt_names:
                alt_path = LEGAL_HTML_DIR / alt
                if alt_path.exists():
                    html_file_path = alt_path
                    break
        
        if not html_file_path.exists():
            print(f"  ⚠️  HTML file not found: {html_file}")
            continue
        
        seo_data = extract_seo_from_html(html_file_path)
        if not seo_data:
            print(f"  ⚠️  Could not extract SEO data")
            continue
        
        # Generate SEO code
        seo_code = generate_seo_code(seo_data, page_name, page_url)
        
        # Add to .js file
        if add_seo_to_js_file(js_file_path, seo_code):
            print(f"  ✅ Added SEO to: {js_file_path.name}")
            updated_count += 1
        else:
            print(f"  ⚠️  Skipped: {js_file_path.name}")
    
    print()
    print("=" * 70)
    print(f"✅ Updated: {updated_count} pages")
    print(f"⚠️  Not found: {not_found_count} pages")
    print("=" * 70)
    print()
    print("📋 Next Steps:")
    print("1. Run: wix dev (to sync changes)")
    print("2. Run: wix publish (to publish to production)")
    print()

if __name__ == "__main__":
    main()




