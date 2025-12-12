#!/usr/bin/env python3
"""
Start Testing Process for HingeCraft Project
Comprehensive testing of all integrations and systems
"""

import os
import sys
import json
import subprocess
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configuration
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'hingecraft'),
    'user': os.getenv('DB_USER', 'hcuser'),
    'password': os.getenv('DB_PASSWORD', 'hcpass')
}

def test_database_connection():
    """Test database connectivity"""
    print("🔍 Testing database connection...")
    try:
        import psycopg2
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ Database connected: {version[:50]}...")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_notion_connection():
    """Test Notion API connection"""
    print("🔍 Testing Notion API connection...")
    try:
        from notion_client import Client
        notion = Client(auth=NOTION_TOKEN)
        # Try to retrieve a page
        page = notion.pages.retrieve(page_id="19ad872b-594c-81d7-b4fd-00024322280f")
        print("✅ Notion API connected")
        return True
    except Exception as e:
        print(f"❌ Notion API connection failed: {e}")
        return False

def test_git_repo():
    """Test git repository status"""
    print("🔍 Testing git repository...")
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd='/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global',
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✅ Git repository accessible")
            return True
        else:
            print(f"⚠️  Git status check returned: {result.returncode}")
            return False
    except Exception as e:
        print(f"❌ Git repository test failed: {e}")
        return False

def test_file_structure():
    """Test that key files exist"""
    print("🔍 Testing file structure...")
    key_files = [
        'COPYWRITING_MASTER_BLUEPRINT.md',
        'notion/sync/hingecraft_notion_sync.py',
        'database/master_schema/00_master_schema_init.sql',
        'ML Automation system/README.md'
    ]
    
    base_path = Path('/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global')
    all_exist = True
    
    for file_path in key_files:
        full_path = base_path / file_path
        if full_path.exists():
            print(f"✅ Found: {file_path}")
        else:
            print(f"❌ Missing: {file_path}")
            all_exist = False
    
    return all_exist

def test_scripts():
    """Test that update scripts exist and are executable"""
    print("🔍 Testing update scripts...")
    scripts = [
        'scripts/update_database_copywriting.py',
        'scripts/update_notion_teamspace.py'
    ]
    
    base_path = Path('/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global')
    all_exist = True
    
    for script_path in scripts:
        full_path = base_path / script_path
        if full_path.exists():
            print(f"✅ Found: {script_path}")
            # Check if executable
            if os.access(full_path, os.X_OK):
                print(f"   ✅ Executable")
            else:
                print(f"   ⚠️  Not executable (run: chmod +x {script_path})")
        else:
            print(f"❌ Missing: {script_path}")
            all_exist = False
    
    return all_exist

def run_integration_tests():
    """Run integration tests"""
    print("\n🧪 Running integration tests...")
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Notion API Connection", test_notion_connection),
        ("Git Repository", test_git_repo),
        ("File Structure", test_file_structure),
        ("Update Scripts", test_scripts)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test error: {e}")
            results[test_name] = False
    
    return results

def generate_test_report(results):
    """Generate test report"""
    print("\n" + "="*60)
    print("📊 TEST REPORT")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("="*60)
    print(f"Results: {passed}/{total} tests passed ({passed*100//total}%)")
    print("="*60)
    
    # Save report
    report_path = Path('/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/TEST_REPORT.json')
    with open(report_path, 'w') as f:
        json.dump({
            'timestamp': str(datetime.now()),
            'results': results,
            'summary': {
                'passed': passed,
                'total': total,
                'percentage': passed*100//total
            }
        }, f, indent=2)
    
    print(f"\n📄 Test report saved to: {report_path}")

def main():
    """Main execution"""
    print("🚀 Starting HingeCraft Testing Process")
    print("="*60)
    
    from datetime import datetime
    print(f"Test started: {datetime.now()}\n")
    
    # Run tests
    results = run_integration_tests()
    
    # Generate report
    generate_test_report(results)
    
    # Next steps
    print("\n📋 Next Steps:")
    print("1. Review test report")
    print("2. Fix any failing tests")
    print("3. Run update scripts:")
    print("   - python scripts/update_database_copywriting.py")
    print("   - python scripts/update_notion_teamspace.py")
    print("4. Verify updates in database and Notion")
    print("5. Run tests again to verify fixes")

if __name__ == '__main__':
    main()
