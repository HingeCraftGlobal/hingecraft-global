#!/usr/bin/env python3
"""
Collect API References for All Pages
Verify All Pages Are Optimized and Ready
Ensure All Pages Are Live
"""

import json
import re
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src/pages"
OUTPUT_FILE = BASE_DIR / "ALL_PAGES_API_REFERENCES.json"
VERIFICATION_FILE = BASE_DIR / "PAGES_VERIFICATION_REPORT.json"

def collect_api_references(js_file):
    """Collect API references from JS file"""
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        apis = {
            'wix_apis': [],
            'velo_apis': [],
            'external_apis': [],
            'functions': [],
            'imports': [],
            'seo_present': False,
            'html_content_present': False,
            'schema_present': False
        }
        
        # Wix/Velo APIs
        wix_patterns = [
            r'\$w\.(\w+)',
            r'wix(\w+)\.(\w+)',
            r'import.*from\s+[\'"]wix-(\w+)[\'"]',
            r'wixSeo',
            r'wixData',
            r'wixStorage',
            r'wixLocation',
            r'wixFetch',
            r'wixStores',
            r'wixMembers',
            r'wixForms',
            r'wixPayments'
        ]
        
        for pattern in wix_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                apis['wix_apis'].extend([str(m) if isinstance(m, tuple) else m for m in matches])
        
        # External APIs
        external_patterns = [
            r'https?://[^\s\'"]+',
            r'fetch\([\'"](https?://[^\'"]+)[\'"]',
            r'axios\.(get|post|put|delete)\([\'"]([^\'"]+)[\'"]'
        ]
        
        for pattern in external_patterns:
            matches = re.findall(pattern, content)
            if matches:
                apis['external_apis'].extend([str(m) if isinstance(m, tuple) else m for m in matches])
        
        # Functions
        function_pattern = r'function\s+(\w+)\s*\('
        functions = re.findall(function_pattern, content)
        apis['functions'] = functions
        
        # Imports
        import_pattern = r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]'
        imports = re.findall(import_pattern, content)
        apis['imports'] = imports
        
        # Check for SEO
        apis['seo_present'] = bool(re.search(r'SEO|seo|meta|og:|twitter:', content, re.IGNORECASE))
        apis['html_content_present'] = bool(re.search(r'loadLegalPageContent|legalContent|htmlContent', content, re.IGNORECASE))
        apis['schema_present'] = bool(re.search(r'schema\.org|application/ld\+json|@context', content, re.IGNORECASE))
        
        # Remove duplicates
        apis['wix_apis'] = list(set(apis['wix_apis']))
        apis['external_apis'] = list(set(apis['external_apis']))
        apis['functions'] = list(set(apis['functions']))
        apis['imports'] = list(set(apis['imports']))
        
        return apis
    except Exception as e:
        return {'error': str(e)}

def verify_page_optimization(js_file):
    """Verify page is fully optimized"""
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        checks = {
            'has_seo_code': bool(re.search(r'Comprehensive SEO|SEO Optimization', content)),
            'has_meta_tags': bool(re.search(r'meta.*description|meta.*keywords|og:title', content)),
            'has_schema': bool(re.search(r'schema\.org|application/ld\+json', content)),
            'has_open_graph': bool(re.search(r'og:title|og:description|og:image', content)),
            'has_twitter_cards': bool(re.search(r'twitter:card|twitter:title', content)),
            'has_canonical': bool(re.search(r'canonical|rel="canonical"', content)),
            'has_robots': bool(re.search(r'robots.*meta|meta.*robots', content)),
            'has_html_content': bool(re.search(r'loadLegalPageContent|legalContent', content)),
            'has_keywords': bool(re.search(r'keywords|hingecraft', content, re.IGNORECASE)),
            'is_ready': False
        }
        
        # Page is ready if it has SEO code and meta tags
        checks['is_ready'] = checks['has_seo_code'] and checks['has_meta_tags'] and checks['has_schema']
        
        return checks
    except Exception as e:
        return {'error': str(e)}

def main():
    """Main collection and verification"""
    print("=" * 80)
    print("🔍 COLLECTING API REFERENCES & VERIFYING ALL PAGES")
    print("=" * 80)
    print()
    
    # Get all pages
    all_js_files = list(PAGES_DIR.glob("*.js"))
    all_js_files = [f for f in all_js_files if f.name != 'masterPage.js']
    
    print(f"Found {len(all_js_files)} pages to process")
    print()
    
    all_api_refs = {}
    all_verifications = {}
    ready_count = 0
    not_ready_count = 0
    
    for js_file in all_js_files:
        page_name = js_file.name
        print(f"Processing: {page_name}")
        
        # Collect API references
        api_refs = collect_api_references(js_file)
        all_api_refs[page_name] = api_refs
        
        # Verify optimization
        verification = verify_page_optimization(js_file)
        all_verifications[page_name] = verification
        
        if verification.get('is_ready', False):
            print(f"  ✅ Ready")
            ready_count += 1
        else:
            missing = [k for k, v in verification.items() if k != 'is_ready' and not v]
            print(f"  ⚠️  Missing: {', '.join(missing[:3])}")
            not_ready_count += 1
    
    print()
    print("=" * 80)
    print(f"✅ Ready: {ready_count} pages")
    print(f"⚠️  Not Ready: {not_ready_count} pages")
    print("=" * 80)
    print()
    
    # Save API references
    with open(OUTPUT_FILE, 'w') as f:
        json.dump({
            'total_pages': len(all_js_files),
            'pages': all_api_refs
        }, f, indent=2)
    
    print(f"✅ API references saved to: {OUTPUT_FILE}")
    
    # Save verification report
    with open(VERIFICATION_FILE, 'w') as f:
        json.dump({
            'total_pages': len(all_js_files),
            'ready': ready_count,
            'not_ready': not_ready_count,
            'verifications': all_verifications
        }, f, indent=2)
    
    print(f"✅ Verification report saved to: {VERIFICATION_FILE}")
    
    # Summary
    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print()
    
    # Count API usage
    all_wix_apis = set()
    all_external_apis = set()
    all_functions = set()
    
    for page_refs in all_api_refs.values():
        all_wix_apis.update(page_refs.get('wix_apis', []))
        all_external_apis.update(page_refs.get('external_apis', []))
        all_functions.update(page_refs.get('functions', []))
    
    print(f"Wix/Velo APIs Used: {len(all_wix_apis)}")
    print(f"External APIs: {len(all_external_apis)}")
    print(f"Custom Functions: {len(all_functions)}")
    print()
    
    # Pages needing attention
    if not_ready_count > 0:
        print("⚠️  Pages Needing Attention:")
        for page_name, verification in all_verifications.items():
            if not verification.get('is_ready', False):
                missing = [k.replace('has_', '') for k, v in verification.items() 
                          if k.startswith('has_') and not v]
                print(f"  - {page_name}: Missing {', '.join(missing[:3])}")
    
    print()
    print("📋 Next: Fix any missing optimizations and republish")

if __name__ == "__main__":
    main()




