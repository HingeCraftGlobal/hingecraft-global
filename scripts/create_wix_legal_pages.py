#!/usr/bin/env python3
"""
Create Wix Page Files (.js) for All 34 Legal Compliance Pages
Generates .js files that Wix can sync to create pages
"""

import json
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
LEGAL_DIR = BASE_DIR / "src" / "pages" / "legal"
WIX_PAGES_DIR = BASE_DIR / "src" / "pages"

# Wix page template (based on existing page structure)
WIX_PAGE_TEMPLATE = """// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {{
    // Write your JavaScript here
    
    // Load legal page content
    loadLegalPageContent();
    
    // To select an element by ID use: $w('#elementID')
    
    // Click 'Preview' to run your code
}});

/**
 * Load legal page HTML content
 */
function loadLegalPageContent() {{
    // Get HTML content from file
    const htmlContent = `{html_content}`;
    
    // Find HTML element on page (you'll need to add this in Wix Editor)
    const htmlElement = $w('#legalContent');
    
    if (htmlElement) {{
        htmlElement.html = htmlContent;
    }} else {{
        console.log('Legal page content loaded. Add HTML element with ID: legalContent');
    }}
}}
"""

# Read deployment manifest
def load_manifest():
    """Load deployment manifest"""
    manifest_file = LEGAL_DIR / "deployment_manifest.json"
    if manifest_file.exists():
        return json.loads(manifest_file.read_text())
    return None

def create_wix_page_filename(page_name):
    """Create Wix-compatible filename"""
    # Wix format: "Page Name.xxxxx.js" where xxxxx is random ID
    # For now, we'll use a hash-based approach
    import hashlib
    hash_id = hashlib.md5(page_name.encode()).hexdigest()[:5]
    safe_name = re.sub(r'[^a-zA-Z0-9\s]', '', page_name)
    safe_name = re.sub(r'\s+', ' ', safe_name).strip()
    return f"{safe_name}.{hash_id}.js"

def extract_body_content(html_file):
    """Extract body content from HTML file"""
    content = html_file.read_text(encoding='utf-8')
    
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    if body_match:
        body_content = body_match.group(1)
        # Escape backticks and $ for JavaScript template
        body_content = body_content.replace('`', '\\`').replace('${', '\\${')
        return body_content
    
    return content

def create_wix_pages():
    """Create Wix page files for all legal pages"""
    
    print("🚀 Creating Wix Page Files for All 34 Legal Compliance Pages")
    print("=" * 70)
    print("")
    
    # Load manifest
    manifest = load_manifest()
    if not manifest:
        print("❌ Deployment manifest not found!")
        return False
    
    pages = manifest.get('pages', [])
    print(f"📋 Found {len(pages)} pages in manifest")
    print("")
    
    created = []
    errors = []
    
    for page_data in pages:
        page_name = page_data['name']
        original_file = page_data['original_file']
        wix_filename_base = page_data['wix_filename']
        
        # Find HTML file
        html_file = LEGAL_DIR / original_file
        if not html_file.exists():
            # Try clean name version
            html_file = LEGAL_DIR / f"{wix_filename_base}.html"
        
        if not html_file.exists():
            errors.append(f"{page_name}: File not found ({original_file})")
            continue
        
        # Extract HTML content
        try:
            html_content = extract_body_content(html_file)
        except Exception as e:
            errors.append(f"{page_name}: Error reading file - {e}")
            continue
        
        # Create Wix page filename
        wix_filename = create_wix_page_filename(page_name)
        wix_file = WIX_PAGES_DIR / wix_filename
        
        # Generate page content
        page_content = WIX_PAGE_TEMPLATE.format(html_content=html_content)
        
        # Write file
        try:
            wix_file.write_text(page_content, encoding='utf-8')
            created.append({
                'name': page_name,
                'wix_file': wix_filename,
                'html_file': original_file,
                'url': page_data.get('public_url', f"/legal/{wix_filename_base}")
            })
            print(f"✅ Created: {wix_filename}")
            print(f"   → {page_name}")
        except Exception as e:
            errors.append(f"{page_name}: Error creating file - {e}")
    
    print("")
    print("=" * 70)
    print(f"✅ Created {len(created)} Wix page files")
    if errors:
        print(f"❌ {len(errors)} errors")
        for error in errors:
            print(f"   - {error}")
    print("=" * 70)
    print("")
    
    # Create deployment summary
    summary = {
        'created_at': datetime.now().isoformat(),
        'total_pages': len(created),
        'pages': created,
        'errors': errors
    }
    
    summary_file = BASE_DIR / "LEGAL_PAGES_WIX_DEPLOYMENT_SUMMARY.json"
    summary_file.write_text(json.dumps(summary, indent=2), encoding='utf-8')
    
    print("📄 Deployment summary saved to: LEGAL_PAGES_WIX_DEPLOYMENT_SUMMARY.json")
    print("")
    print("📋 Next Steps:")
    print("1. Run: wix dev (to sync pages to Wix)")
    print("2. Or manually create pages in Wix Editor")
    print("3. Pages will appear in Wix page tree")
    
    return len(created) == 34

if __name__ == "__main__":
    success = create_wix_pages()
    exit(0 if success else 1)






