#!/usr/bin/env python3
"""
Troubleshooting Fixes for Notion Sync
Fixes identified errors and validates setup
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "notion-client", "python-dotenv", "requests"], check=True)
        print("✅ Dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_env_file():
    """Check .env file exists and has required values"""
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ .env file not found")
        if Path("env.example").exists():
            print("📝 Copying env.example to .env")
            import shutil
            shutil.copy("env.example", ".env")
            print("✅ Created .env file - please update with your Notion token")
        return False
    
    print("✅ .env file exists")
    return True

def validate_notion_token():
    """Validate Notion token format"""
    from dotenv import load_dotenv
    load_dotenv()
    
    token = os.getenv("NOTION_TOKEN", "")
    if not token or not token.startswith("ntn_"):
        print("❌ Invalid Notion token format")
        return False
    print("✅ Notion token format valid")
    return True

def test_notion_connection():
    """Test Notion API connection"""
    try:
        from notion_client import Client
        from dotenv import load_dotenv
        load_dotenv()
        
        token = os.getenv("NOTION_TOKEN", "")
        if not token:
            print("❌ Notion token not set")
            return False
        
        client = Client(auth=token)
        # Try to list users to test connection
        client.users.me()
        print("✅ Notion API connection successful")
        return True
    except Exception as e:
        print(f"❌ Notion API connection failed: {e}")
        return False

def check_directories():
    """Check required directories exist"""
    dirs = ["sync", "monitoring", "webhooks", "triggers", "data"]
    for dir_name in dirs:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created directory: {dir_name}")
        else:
            print(f"✅ Directory exists: {dir_name}")
    return True

def validate_sync_script():
    """Validate sync script syntax"""
    script_path = Path("sync/hingecraft_notion_sync.py")
    if not script_path.exists():
        print("❌ Sync script not found")
        return False
    
    try:
        compile(open(script_path).read(), script_path, 'exec')
        print("✅ Sync script syntax valid")
        return True
    except SyntaxError as e:
        print(f"❌ Sync script syntax error: {e}")
        return False

def main():
    """Run all troubleshooting checks"""
    print("🔍 Running troubleshooting checks...\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", install_dependencies),
        ("Environment File", check_env_file),
        ("Notion Token", validate_notion_token),
        ("Notion Connection", test_notion_connection),
        ("Directories", check_directories),
        ("Sync Script", validate_sync_script),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 {name}:")
        result = check_func()
        results.append((name, result))
    
    print("\n" + "="*50)
    print("📊 Troubleshooting Summary:")
    print("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\n✅ Passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All checks passed! Ready to run sync.")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please fix issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

