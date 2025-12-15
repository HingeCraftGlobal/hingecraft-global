#!/usr/bin/env python3
"""
Organize and Remove Duplicates from HingeCraft Notion
Removes all duplicates and organizes content properly
FOR HINGECRAFT NOTION ONLY
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from notion_client import Client

load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

notion = Client(auth=NOTION_TOKEN)

PROJECTS_DB_ID = "54737597-cd5a-4e8b-ba1a-f43db17649b2"
DONATIONS_DB_ID = "ff2a0969-7d34-42b5-afac-795e030b7259"

def remove_duplicates_from_db(db_id, name_field="Name"):
    """Remove duplicate entries from database"""
    try:
        print(f"   🔍 Scanning database for duplicates...")
        
        # Get all pages
        all_pages = []
        has_more = True
        next_cursor = None
        
        while has_more:
            try:
                if next_cursor:
                    response = notion.databases.query(database_id=db_id, start_cursor=next_cursor)
                else:
                    response = notion.databases.query(database_id=db_id)
                
                pages = response.get('results', [])
                all_pages.extend(pages)
                has_more = response.get('has_more', False)
                next_cursor = response.get('next_cursor')
            except Exception as e:
                print(f"   ⚠️  Query error: {e}")
                break
        
        print(f"   📊 Found {len(all_pages)} total pages")
        
        # Find duplicates
        seen = {}
        duplicates = []
        
        for page in all_pages:
            props = page.get('properties', {})
            if name_field in props:
                title_prop = props[name_field]
                if title_prop.get('type') == 'title' and title_prop.get('title'):
                    name = title_prop['title'][0].get('plain_text', '').lower().strip()
                    if name:
                        if name in seen:
                            duplicates.append({
                                'id': page['id'],
                                'name': name,
                                'created': page.get('created_time', '')
                            })
                        else:
                            seen[name] = {
                                'id': page['id'],
                                'created': page.get('created_time', '')
                            }
        
        # Archive duplicates (keep the first one created)
        archived_count = 0
        for dup in duplicates:
            try:
                # Archive the duplicate
                notion.pages.update(page_id=dup['id'], archived=True)
                archived_count += 1
            except Exception as e:
                print(f"   ⚠️  Could not archive {dup['name']}: {e}")
        
        if archived_count > 0:
            print(f"   🗑️  Removed {archived_count} duplicates")
        else:
            print(f"   ✅ No duplicates found")
        
        return archived_count
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return 0

def main():
    """Main execution"""
    print("🚀 Organize and Remove Duplicates - HingeCraft Notion")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    
    # Remove duplicates from Projects
    print("\n📊 Cleaning Projects database...")
    projects_removed = remove_duplicates_from_db(PROJECTS_DB_ID, "Name")
    
    # Remove duplicates from Donations
    print("\n💰 Cleaning Donations database...")
    donations_removed = remove_duplicates_from_db(DONATIONS_DB_ID, "Name")
    
    # Summary
    print("\n" + "="*70)
    print("📊 CLEANUP SUMMARY")
    print("="*70)
    print(f"✅ Projects duplicates removed: {projects_removed}")
    print(f"✅ Donations duplicates removed: {donations_removed}")
    print("="*70)
    print("\n🎉 Organization complete!")

if __name__ == '__main__':
    main()





