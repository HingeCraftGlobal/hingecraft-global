#!/usr/bin/env python3
"""
Clean all personal paths and information from hingecraft-global repository
Remove all references to personal computer paths and usernames
"""

import os
import re
from pathlib import Path

# Personal information to remove
PERSONAL_PATTERNS = [
    (r'[PROJECT_ROOT]', '[PROJECT_ROOT]'),
    (r'[USER_HOME]', '[USER_HOME]'),
    (r'[USER]', '[USER]'),
    (r'[PROJECT_ROOT]', '[PROJECT_ROOT]'),
]

# File types to process
FILE_EXTENSIONS = ['.md', '.py', '.sh', '.js', '.json', '.yaml', '.yml', '.txt', '.sql', '.html', '.css']

def should_process_file(filepath):
    """Check if file should be processed"""
    # Skip git, node_modules, and other system directories
    skip_dirs = {'.git', 'node_modules', '.venv', '__pycache__', '.pytest_cache', 'pgdata'}
    parts = Path(filepath).parts
    if any(skip_dir in parts for skip_dir in skip_dirs):
        return False
    
    # Check file extension
    return any(str(filepath).endswith(ext) for ext in FILE_EXTENSIONS)

def clean_file(filepath):
    """Clean personal information from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        original_content = content
        
        # Replace all personal patterns
        for pattern, replacement in PERSONAL_PATTERNS:
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def main():
    """Main cleanup function"""
    repo_root = Path(__file__).parent.parent
    cleaned_count = 0
    total_files = 0
    
    print("=" * 60)
    print("CLEANING PERSONAL PATHS FROM HINGECRAFT-GLOBAL")
    print("=" * 60)
    print()
    
    # Process all files
    for root, dirs, files in os.walk(repo_root):
        # Skip .git directory
        if '.git' in root:
            continue
            
        for file in files:
            filepath = Path(root) / file
            
            if should_process_file(filepath):
                total_files += 1
                if clean_file(filepath):
                    cleaned_count += 1
                    print(f"  ✅ Cleaned: {filepath.relative_to(repo_root)}")
    
    print()
    print("=" * 60)
    print(f"✅ CLEANUP COMPLETE")
    print(f"   Files processed: {total_files}")
    print(f"   Files cleaned: {cleaned_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()

