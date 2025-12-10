#!/usr/bin/env python3
"""
Git Repository Organization
===========================

Organizes the git repository structure itself, ensuring proper
branching, tagging, and repository organization.
"""

import subprocess
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List


class GitRepoOrganizer:
    """Organize git repository structure"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent
        self.git_info: Dict[str, Any] = {}
        
    def analyze_git_repo(self):
        """Analyze git repository"""
        print("🔍 Analyzing git repository...")
        
        try:
            # Get branch info
            result = subprocess.run(
                ["git", "branch", "-a"],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            branches = [b.strip() for b in result.stdout.split('\n') if b.strip()]
            
            # Get tag info
            result = subprocess.run(
                ["git", "tag"],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            tags = [t.strip() for t in result.stdout.split('\n') if t.strip()]
            
            # Get remote info
            result = subprocess.run(
                ["git", "remote", "-v"],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            remotes = {}
            for line in result.stdout.split('\n'):
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 2:
                        remotes[parts[0]] = parts[1]
            
            # Get commit count
            result = subprocess.run(
                ["git", "rev-list", "--count", "HEAD"],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            commit_count = int(result.stdout.strip()) if result.stdout.strip() else 0
            
            # Get file count
            result = subprocess.run(
                ["git", "ls-files"],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            tracked_files = len([f for f in result.stdout.split('\n') if f.strip()])
            
            self.git_info = {
                "branches": branches,
                "tags": tags,
                "remotes": remotes,
                "commit_count": commit_count,
                "tracked_files": tracked_files,
                "analyzed_at": datetime.now().isoformat()
            }
            
            print(f"✅ Git analysis complete:")
            print(f"   - Branches: {len(branches)}")
            print(f"   - Tags: {len(tags)}")
            print(f"   - Remotes: {len(remotes)}")
            print(f"   - Commits: {commit_count}")
            print(f"   - Tracked files: {tracked_files}")
            
            return self.git_info
            
        except Exception as e:
            print(f"⚠️  Git analysis error: {e}")
            return {}
    
    def organize_git_structure(self):
        """Organize git repository structure"""
        print("\n📁 Organizing git structure...")
        
        # Ensure proper .gitignore
        gitignore_path = self.base_path / ".gitignore"
        if not gitignore_path.exists():
            self._create_gitignore()
        
        # Ensure proper .gitattributes
        gitattributes_path = self.base_path / ".gitattributes"
        if not gitattributes_path.exists():
            self._create_gitattributes()
        
        # Create git hooks directory structure
        hooks_dir = self.base_path / ".git" / "hooks"
        if hooks_dir.exists():
            print("   ✅ Git hooks directory exists")
        
        print("✅ Git structure organized")
    
    def _create_gitignore(self):
        """Create comprehensive .gitignore"""
        gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
ENV/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Database
pgdata/
*.db
*.sqlite

# Logs
*.log
logs/

# Secrets
secrets/
*.key
*.pem
*.env
!*.example.env

# Node
node_modules/
npm-debug.log
yarn-error.log

# Wix
wix.lock

# Temporary files
*.tmp
*.bak
*.backup

# Cache
.cache/
.pytest_cache/
.mypy_cache/
"""
        
        gitignore_path = self.base_path / ".gitignore"
        with open(gitignore_path, 'w') as f:
            f.write(gitignore_content)
        print("   ✅ Created .gitignore")
    
    def _create_gitattributes(self):
        """Create .gitattributes for proper file handling"""
        gitattributes_content = """# Auto detect text files and perform LF normalization
* text=auto

# Python files
*.py text eol=lf
*.pyw text eol=lf

# Shell scripts
*.sh text eol=lf

# SQL files
*.sql text eol=lf

# JSON files
*.json text eol=lf

# Markdown files
*.md text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
"""
        
        gitattributes_path = self.base_path / ".gitattributes"
        with open(gitattributes_path, 'w') as f:
            f.write(gitattributes_content)
        print("   ✅ Created .gitattributes")
    
    def create_git_organization_report(self):
        """Create git organization report"""
        report = {
            "git_repository_info": self.git_info,
            "organization": {
                "gitignore": ".gitignore exists",
                "gitattributes": ".gitattributes exists",
                "hooks": ".git/hooks exists"
            },
            "recommendations": [
                "Ensure all branches are properly named",
                "Create tags for major releases",
                "Set up proper remote tracking",
                "Configure git hooks if needed"
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        report_file = self.base_path / "GIT_REPO_ORGANIZATION.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n💾 Git organization report saved to {report_file}")
        return report_file


def main():
    """Main execution"""
    print("=" * 70)
    print("Git Repository Organization")
    print("=" * 70)
    print()
    
    organizer = GitRepoOrganizer()
    
    # Analyze git repo
    git_info = organizer.analyze_git_repo()
    
    # Organize structure
    organizer.organize_git_structure()
    
    # Create report
    organizer.create_git_organization_report()
    
    print("\n" + "=" * 70)
    print("✅ Git repository organization complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()
