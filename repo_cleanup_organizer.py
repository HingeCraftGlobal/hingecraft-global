#!/usr/bin/env python3
"""
HingeCraft Repository Cleanup and Organization
==============================================

Organizes entire git repo, removes duplicates, cleans up files,
and ensures proper project structure.
"""

import os
import json
import hashlib
import shutil
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict
from datetime import datetime


class RepoCleanupOrganizer:
    """Cleanup and organize the entire repository"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent
        self.duplicates: Dict[str, List[str]] = {}
        self.file_hashes: Dict[str, str] = {}
        self.unnecessary_files: List[str] = []
        self.organization_plan: Dict[str, List[str]] = defaultdict(list)
        
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of file"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception:
            return ""
    
    def find_duplicates(self):
        """Find duplicate files"""
        print("🔍 Finding duplicate files...")
        
        hash_to_files: Dict[str, List[str]] = defaultdict(list)
        
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                # Skip certain directories
                if any(skip in str(file_path) for skip in [
                    "__pycache__", ".git", "node_modules", ".pyc", 
                    "pgdata", ".wix"
                ]):
                    continue
                
                file_hash = self.calculate_file_hash(file_path)
                if file_hash:
                    rel_path = str(file_path.relative_to(self.base_path))
                    hash_to_files[file_hash].append(rel_path)
                    self.file_hashes[rel_path] = file_hash
        
        # Find duplicates
        for file_hash, files in hash_to_files.items():
            if len(files) > 1:
                # Keep the shortest path, mark others as duplicates
                files.sort(key=len)
                self.duplicates[files[0]] = files[1:]
        
        print(f"✅ Found {len(self.duplicates)} sets of duplicates")
        return self.duplicates
    
    def identify_unnecessary_files(self):
        """Identify unnecessary files"""
        print("🔍 Identifying unnecessary files...")
        
        unnecessary_patterns = [
            "*.pyc",
            "*.pyo",
            "__pycache__",
            ".DS_Store",
            "*.log",
            "*.tmp",
            "*.bak",
            "*.backup",
            "*.swp",
            "*.swo",
            "*~",
            ".pytest_cache",
            ".mypy_cache",
            ".coverage",
            "htmlcov",
            ".tox",
            "dist",
            "build",
            "*.egg-info"
        ]
        
        unnecessary_dirs = [
            "__pycache__",
            ".pytest_cache",
            ".mypy_cache",
            "htmlcov",
            ".tox",
            "dist",
            "build",
            ".eggs",
            "*.egg-info"
        ]
        
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                rel_path = str(file_path.relative_to(self.base_path))
                
                # Skip git and important dirs
                if any(skip in rel_path for skip in [".git", ".wix"]):
                    continue
                
                # Check if unnecessary
                if any(file_path.match(pattern) for pattern in unnecessary_patterns):
                    self.unnecessary_files.append(rel_path)
                elif file_path.name.startswith('.') and file_path.name != '.gitignore':
                    self.unnecessary_files.append(rel_path)
        
        print(f"✅ Found {len(self.unnecessary_files)} unnecessary files")
        return self.unnecessary_files
    
    def organize_by_project(self):
        """Organize files by project"""
        print("📁 Organizing files by project...")
        
        project_structure = {
            "database": {
                "dirs": ["database/", "database-schema/"],
                "extensions": [".sql", ".py"],
                "files": []
            },
            "agents": {
                "dirs": ["agents/"],
                "extensions": [".py", ".yaml", ".json"],
                "files": []
            },
            "api": {
                "dirs": ["api/"],
                "extensions": [".py", ".txt"],
                "files": []
            },
            "wix": {
                "dirs": ["backend-functions/", "deployment-ready/", "wix_integration/"],
                "extensions": [".jsw", ".js"],
                "files": []
            },
            "frontend": {
                "dirs": ["public/", "src/", "frontend-pages/"],
                "extensions": [".html", ".js", ".css"],
                "files": []
            },
            "legal": {
                "dirs": ["legal-pages/", "ALL_LEGAL_PAGES_HTML/", "COMPLETE_LEGAL_DOCS_SC/"],
                "extensions": [".html"],
                "files": []
            },
            "notion": {
                "dirs": ["notion/"],
                "extensions": [".py", ".json", ".md"],
                "files": []
            },
            "scripts": {
                "dirs": ["scripts/", "deployment-scripts/"],
                "extensions": [".py", ".sh"],
                "files": []
            },
            "docs": {
                "dirs": ["docs/", "documentation/"],
                "extensions": [".md", ".json"],
                "files": []
            },
            "config": {
                "dirs": ["config/"],
                "extensions": [".py", ".json"],
                "files": []
            },
            "tests": {
                "dirs": ["tests/", "test-scripts/"],
                "extensions": [".py", ".js"],
                "files": []
            },
            "monitoring": {
                "dirs": ["monitoring/"],
                "extensions": [".js", ".md"],
                "files": []
            }
        }
        
        # Scan and categorize files
        for file_path in self.base_path.rglob("*"):
            if file_path.is_file():
                rel_path = str(file_path.relative_to(self.base_path))
                
                # Skip unnecessary
                if rel_path in self.unnecessary_files:
                    continue
                
                # Skip git and cache
                if any(skip in rel_path for skip in [
                    ".git", "__pycache__", ".pyc", "node_modules"
                ]):
                    continue
                
                # Categorize
                for project_name, project_info in project_structure.items():
                    if any(rel_path.startswith(d) for d in project_info["dirs"]):
                        if file_path.suffix in project_info["extensions"] or not file_path.suffix:
                            project_info["files"].append(rel_path)
                            break
        
        self.organization_plan = {
            project: info["files"] 
            for project, info in project_structure.items()
        }
        
        print(f"✅ Organized {sum(len(files) for files in self.organization_plan.values())} files")
        return self.organization_plan
    
    def create_cleanup_report(self):
        """Create cleanup report"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "duplicates": {
                "count": len(self.duplicates),
                "files": self.duplicates
            },
            "unnecessary_files": {
                "count": len(self.unnecessary_files),
                "files": self.unnecessary_files[:100]  # First 100
            },
            "organization": {
                "projects": len(self.organization_plan),
                "files_per_project": {
                    project: len(files)
                    for project, files in self.organization_plan.items()
                }
            },
            "recommendations": []
        }
        
        # Add recommendations
        if self.duplicates:
            report["recommendations"].append(
                f"Remove {sum(len(dups) for dups in self.duplicates.values())} duplicate files"
            )
        
        if self.unnecessary_files:
            report["recommendations"].append(
                f"Remove {len(self.unnecessary_files)} unnecessary files"
            )
        
        return report
    
    def save_cleanup_report(self, report: Dict):
        """Save cleanup report"""
        report_file = self.base_path / "REPO_CLEANUP_REPORT.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        print(f"💾 Saved cleanup report to {report_file}")
        return report_file


def main():
    """Main execution"""
    print("=" * 70)
    print("HingeCraft Repository Cleanup and Organization")
    print("=" * 70)
    print()
    
    organizer = RepoCleanupOrganizer()
    
    # 1. Find duplicates
    duplicates = organizer.find_duplicates()
    
    # 2. Identify unnecessary files
    unnecessary = organizer.identify_unnecessary_files()
    
    # 3. Organize by project
    organization = organizer.organize_by_project()
    
    # 4. Create report
    report = organizer.create_cleanup_report()
    organizer.save_cleanup_report(report)
    
    # Print summary
    print("\n" + "=" * 70)
    print("CLEANUP ANALYSIS COMPLETE")
    print("=" * 70)
    print(f"\n📊 Summary:")
    print(f"   - Duplicate sets: {len(duplicates)}")
    print(f"   - Unnecessary files: {len(unnecessary)}")
    print(f"   - Projects organized: {len(organization)}")
    print(f"\n💾 Report saved to: REPO_CLEANUP_REPORT.json")
    print("\n⚠️  Review report before removing files!")


if __name__ == "__main__":
    main()
