#!/usr/bin/env python3
"""
Verify Complete HingeCraft Organization
======================================

Verifies that all organization files exist and contain expected data.
"""

import json
import sys
from pathlib import Path


def verify_organization():
    """Verify complete organization"""
    
    print("=" * 70)
    print("HingeCraft Organization Verification")
    print("=" * 70)
    print()
    
    base_path = Path(__file__).parent
    errors = []
    warnings = []
    
    # Check main organization file
    print("📋 Checking main organization file...")
    org_file = base_path / "HINGECRAFT_COMPLETE_ORGANIZATION.py"
    if org_file.exists():
        print("  ✅ HINGECRAFT_COMPLETE_ORGANIZATION.py exists")
        
        # Try to import it
        try:
            sys.path.insert(0, str(base_path))
            from HINGECRAFT_COMPLETE_ORGANIZATION import (
                ALL_HINGECRAFT_PROJECTS,
                ALL_DATABASE_DATA,
                ORGANIZATION_SUMMARY
            )
            print(f"  ✅ Contains {len(ALL_HINGECRAFT_PROJECTS)} projects")
            print(f"  ✅ Contains {len(ALL_DATABASE_DATA)} database tables")
            print(f"  ✅ Summary: {ORGANIZATION_SUMMARY['total_projects']} projects")
        except Exception as e:
            errors.append(f"Failed to import organization file: {e}")
    else:
        errors.append("HINGECRAFT_COMPLETE_ORGANIZATION.py not found")
    
    # Check organization script
    print("\n📋 Checking organization scripts...")
    scripts = [
        "organize_all_hingecraft_data.py",
        "extract_and_organize_database_data.py"
    ]
    
    for script in scripts:
        script_path = base_path / script
        if script_path.exists():
            print(f"  ✅ {script} exists")
        else:
            warnings.append(f"{script} not found")
    
    # Check JSON files
    print("\n📋 Checking JSON exports...")
    json_files = [
        "hingecraft_complete_organization.json",
        "hingecraft_database_data.json"
    ]
    
    for json_file in json_files:
        json_path = base_path / json_file
        if json_path.exists():
            print(f"  ✅ {json_file} exists")
            try:
                with open(json_path) as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    print(f"     Contains {len(data)} top-level keys")
            except Exception as e:
                warnings.append(f"Failed to parse {json_file}: {e}")
        else:
            warnings.append(f"{json_file} not found (optional)")
    
    # Check documentation
    print("\n📋 Checking documentation...")
    docs = [
        "COMPLETE_ORGANIZATION_README.md",
        "ORGANIZATION_COMPLETE_SUMMARY.md"
    ]
    
    for doc in docs:
        doc_path = base_path / doc
        if doc_path.exists():
            print(f"  ✅ {doc} exists")
        else:
            warnings.append(f"{doc} not found")
    
    # Check database file
    print("\n📋 Checking database file...")
    db_file = base_path / "database" / "init.sql"
    if db_file.exists():
        print(f"  ✅ database/init.sql exists")
        size = db_file.stat().st_size
        print(f"     Size: {size:,} bytes")
    else:
        errors.append("database/init.sql not found")
    
    # Summary
    print("\n" + "=" * 70)
    print("Verification Summary")
    print("=" * 70)
    
    if errors:
        print(f"\n❌ Errors: {len(errors)}")
        for error in errors:
            print(f"   - {error}")
    
    if warnings:
        print(f"\n⚠️  Warnings: {len(warnings)}")
        for warning in warnings:
            print(f"   - {warning}")
    
    if not errors and not warnings:
        print("\n✅ All checks passed! Organization is complete.")
        return True
    elif not errors:
        print("\n⚠️  Some optional files missing, but core organization is complete.")
        return True
    else:
        print("\n❌ Some required files are missing.")
        return False


if __name__ == "__main__":
    success = verify_organization()
    sys.exit(0 if success else 1)
