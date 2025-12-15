#!/usr/bin/env python3
"""
Complete Notion System Runner
Executes all Notion project tasks: GPT-4 prompts, Discord updates, Notion population
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def run_script(script_path, description):
    """Run a script and handle output"""
    print(f"\n{'='*70}")
    print(f"🚀 {description}")
    print(f"{'='*70}")
    
    script = Path(script_path)
    if not script.exists():
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        result = subprocess.run(
            ['python3', str(script)],
            cwd=script.parent.parent,
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        if result.returncode == 0:
            print(result.stdout)
            print(f"✅ {description} - Complete")
            return True
        else:
            print(result.stderr)
            print(f"❌ {description} - Failed")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏱️  {description} - Timeout")
        return False
    except Exception as e:
        print(f"❌ {description} - Error: {e}")
        return False

def main():
    """Main execution"""
    print("🚀 Complete Notion System Runner")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    scripts = [
        {
            'path': 'scripts/discord_notion_updates.py',
            'description': 'Discord Integration Test',
            'required': False
        },
        {
            'path': 'scripts/gpt4_notion_prompts.py',
            'description': 'GPT-4 Multi-Prompt System',
            'required': True
        },
        {
            'path': 'scripts/populate_notion_live.py',
            'description': 'Notion Population',
            'required': False
        }
    ]
    
    results = {}
    
    for script_info in scripts:
        success = run_script(script_info['path'], script_info['description'])
        results[script_info['description']] = success
        
        if script_info['required'] and not success:
            print(f"\n⚠️  Required script failed: {script_info['description']}")
            print("   Continuing with other scripts...")
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 EXECUTION SUMMARY")
    print(f"{'='*70}")
    
    for desc, success in results.items():
        status = "✅" if success else "❌"
        print(f"{status} {desc}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    print(f"\nResults: {passed}/{total} scripts completed successfully")
    
    print(f"\n{'='*70}")
    print("🎉 Complete Notion System Execution Finished")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}")

if __name__ == '__main__':
    main()





