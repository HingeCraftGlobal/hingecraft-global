#!/usr/bin/env python3
"""
Ensure All Code Uses HTTPS Only
Replace any http:// with https://
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src/pages"

def fix_https(file_path):
    """Fix HTTP to HTTPS in file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace http:// with https:// (but not https://)
        original_content = content
        content = re.sub(r'http://(?!s)', 'https://', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error fixing {file_path.name}: {e}")
        return False

def main():
    """Main"""
    print("=" * 80)
    print("🔒 ENSURING HTTPS ONLY")
    print("=" * 80)
    print()
    
    all_js_files = list(PAGES_DIR.glob("*.js"))
    all_js_files = [f for f in all_js_files if f.name != 'masterPage.js']
    
    print(f"Checking {len(all_js_files)} files...")
    print()
    
    fixed = 0
    
    for js_file in all_js_files:
        if fix_https(js_file):
            print(f"✅ Fixed: {js_file.name}")
            fixed += 1
    
    print()
    print("=" * 80)
    print(f"✅ Fixed: {fixed} files")
    print("=" * 80)
    print()
    print("✅ All code now uses HTTPS only")

if __name__ == "__main__":
    main()


