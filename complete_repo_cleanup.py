#!/usr/bin/env python3
"""
Complete Repository Cleanup and Organization
============================================

Cleans up duplicates, removes unnecessary files, organizes by project,
and ensures proper git structure.
"""

import os
import json
import hashlib
import shutil
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict
from datetime import datetime


class CompleteRepoCleanup:
    """Complete repository cleanup"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent
        self.duplicates: Dict[str, List[str]] = {}
        self.unnecessary_files: List[str] = []
        self.files_to_remove: List[str] = []
        self.organization: Dict[str, List[str]] = defaultdict(list)
        
    def find_duplicates(self):
        """Find duplicate files by content hash"""
        print("🔍 Finding duplicate files...")
        
        hash_to_files = defaultdict(list)
        
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                if any(skip in str(file_path) for skip in [
                    "__pycache__", ".git", "node_modules", ".pyc", "pgdata"
                ]):
                    continue
                
                try:
                    with open(file_path, 'rb') as f:
                        file_hash = hashlib.md5(f.read()).hexdigest()
                    rel_path = str(file_path.relative_to(self.base_path))
                    hash_to_files[file_hash].append(rel_path)
                except:
                    pass
        
        # Find duplicates (keep shortest path)
        for file_hash, files in hash_to_files.items():
            if len(files) > 1:
                files.sort(key=len)
                self.duplicates[files[0]] = files[1:]
        
        print(f"✅ Found {len(self.duplicates)} duplicate sets")
        return self.duplicates
    
    def find_unnecessary_files(self):
        """Find unnecessary files"""
        print("🔍 Finding unnecessary files...")
        
        patterns = [
            "*.pyc", "*.pyo", "__pycache__", ".DS_Store", "*.log",
            "*.tmp", "*.bak", "*.backup", "*.swp", "*.swo", "*~"
        ]
        
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                rel_path = str(file_path.relative_to(self.base_path))
                
                if any(skip in rel_path for skip in [".git", ".wix"]):
                    continue
                
                # Check patterns
                if any(file_path.match(p) for p in patterns):
                    self.unnecessary_files.append(rel_path)
                elif file_path.name.startswith('.') and file_path.name not in ['.gitignore', '.dockerignore']:
                    if file_path.suffix not in ['.md', '.json', '.py']:
                        self.unnecessary_files.append(rel_path)
        
        print(f"✅ Found {len(self.unnecessary_files)} unnecessary files")
        return self.unnecessary_files
    
    def organize_files(self):
        """Organize files by project"""
        print("📁 Organizing files by project...")
        
        project_map = {
            "database": ["database/"],
            "agents": ["agents/"],
            "api": ["api/"],
            "wix": ["backend-functions/", "deployment-ready/", "wix_integration/"],
            "frontend": ["public/", "src/", "frontend-pages/"],
            "legal": ["legal-pages/", "ALL_LEGAL_PAGES_HTML/"],
            "notion": ["notion/"],
            "scripts": ["scripts/", "deployment-scripts/"],
            "docs": ["docs/", "documentation/"],
            "config": ["config/"],
            "tests": ["tests/", "test-scripts/"],
            "monitoring": ["monitoring/"]
        }
        
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                rel_path = str(file_path.relative_to(self.base_path))
                
                if rel_path in self.unnecessary_files:
                    continue
                
                if any(skip in rel_path for skip in [".git", "__pycache__"]):
                    continue
                
                for project, dirs in project_map.items():
                    if any(rel_path.startswith(d) for d in dirs):
                        self.organization[project].append(rel_path)
                        break
                else:
                    # Root level files
                    if "/" not in rel_path or rel_path.count("/") == 1:
                        self.organization["root"].append(rel_path)
        
        print(f"✅ Organized {sum(len(f) for f in self.organization.values())} files")
        return self.organization
    
    def create_cleanup_plan(self):
        """Create cleanup plan"""
        plan = {
            "duplicates_to_remove": sum(len(dups) for dups in self.duplicates.values()),
            "unnecessary_to_remove": len(self.unnecessary_files),
            "duplicates": self.duplicates,
            "unnecessary": self.unnecessary_files[:50],  # First 50
            "organization": {k: len(v) for k, v in self.organization.items()}
        }
        return plan
    
    def save_report(self, plan):
        """Save cleanup report"""
        report_file = self.base_path / "REPO_CLEANUP_PLAN.json"
        with open(report_file, 'w') as f:
            json.dump(plan, f, indent=2, default=str)
        print(f"💾 Saved cleanup plan to {report_file}")
        return report_file


def main():
    print("=" * 70)
    print("Complete Repository Cleanup")
    print("=" * 70)
    print()
    
    cleanup = CompleteRepoCleanup()
    
    # Find duplicates
    duplicates = cleanup.find_duplicates()
    
    # Find unnecessary
    unnecessary = cleanup.find_unnecessary_files()
    
    # Organize
    organization = cleanup.organize_files()
    
    # Create plan
    plan = cleanup.create_cleanup_plan()
    cleanup.save_report(plan)
    
    # Summary
    print("\n" + "=" * 70)
    print("CLEANUP ANALYSIS COMPLETE")
    print("=" * 70)
    print(f"\n📊 Summary:")
    print(f"   - Duplicate sets: {len(duplicates)}")
    print(f"   - Files to remove: {plan['duplicates_to_remove'] + plan['unnecessary_to_remove']}")
    print(f"   - Projects organized: {len(organization)}")
    print(f"\n⚠️  Review REPO_CLEANUP_PLAN.json before removing files!")


if __name__ == "__main__":
    main()
