#!/usr/bin/env python3
"""
Recreate Notion Databases with Properties
Deletes existing databases and creates new ones with proper properties
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

def archive_existing_database(db_id):
    """Archive (delete) existing database"""
    try:
        notion.blocks.delete(block_id=db_id)
        print(f"   🗑️  Archived old database")
        return True
    except Exception as e:
        print(f"   ⚠️  Could not archive: {e}")
        return False

def create_projects_database():
    """Create Projects database with all properties"""
    try:
        # First, try to find and archive existing
        children = notion.blocks.children.list(block_id=PARENT_PAGE)
        for child in children.get('results', []):
            if child.get('type') == 'child_database':
                try:
                    db_info = notion.databases.retrieve(database_id=child['id'])
                    title = db_info.get('title', [{}])[0].get('plain_text', '')
                    if 'project' in title.lower():
                        print(f"   Found existing Projects database, archiving...")
                        archive_existing_database(child['id'])
                except:
                    pass
        
        # Create new database with properties
        projects_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Projects"}}],
            properties={
                "Name": {"title": {}},
                "Project ID": {"rich_text": {}},
                "Status": {"select": {
                    "options": [
                        {"name": "Idea", "color": "gray"},
                        {"name": "Planning", "color": "blue"},
                        {"name": "In Progress", "color": "yellow"},
                        {"name": "Blocked", "color": "red"},
                        {"name": "Review", "color": "orange"},
                        {"name": "Done", "color": "green"}
                    ]
                }},
                "Priority": {"select": {
                    "options": [
                        {"name": "Urgent", "color": "red"},
                        {"name": "High", "color": "orange"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "Low", "color": "gray"}
                    ]
                }},
                "Owner": {"rich_text": {}},
                "Team": {"multi_select": {
                    "options": [
                        {"name": "Engineering", "color": "blue"},
                        {"name": "Marketing", "color": "pink"},
                        {"name": "Legal", "color": "purple"},
                        {"name": "Community", "color": "green"},
                        {"name": "Education", "color": "yellow"},
                        {"name": "Design", "color": "orange"},
                        {"name": "DevOps", "color": "gray"}
                    ]
                }},
                "Progress %": {"number": {"format": "percent"}},
                "Start Date": {"date": {}},
                "Due Date": {"date": {}},
                "Notes": {"rich_text": {}}
            }
        )
        print(f"✅ Created Projects database: {projects_db['id']}")
        return projects_db['id']
    except Exception as e:
        print(f"❌ Error creating Projects database: {e}")
        return None

def create_donations_database():
    """Create Donations database with all properties"""
    try:
        # Archive existing if found
        children = notion.blocks.children.list(block_id=PARENT_PAGE)
        for child in children.get('results', []):
            if child.get('type') == 'child_database':
                try:
                    db_info = notion.databases.retrieve(database_id=child['id'])
                    title = db_info.get('title', [{}])[0].get('plain_text', '')
                    if 'donation' in title.lower():
                        print(f"   Found existing Donations database, archiving...")
                        archive_existing_database(child['id'])
                except:
                    pass
        
        donations_db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Donations"}}],
            properties={
                "Donor Name": {"title": {}},
                "Donation ID": {"rich_text": {}},
                "Amount": {"number": {"format": "dollar"}},
                "Currency": {"select": {
                    "options": [
                        {"name": "USD", "color": "green"},
                        {"name": "BTC", "color": "orange"},
                        {"name": "SOL", "color": "purple"},
                        {"name": "USDC", "color": "blue"}
                    ]
                }},
                "Date": {"date": {}},
                "Method": {"select": {
                    "options": [
                        {"name": "Stripe", "color": "blue"},
                        {"name": "Coinbase Commerce", "color": "purple"},
                        {"name": "Bank", "color": "green"},
                        {"name": "Manual", "color": "gray"}
                    ]
                }},
                "Designation": {"select": {
                    "options": [
                        {"name": "General", "color": "gray"},
                        {"name": "Student Funds", "color": "blue"},
                        {"name": "Microfactory", "color": "green"},
                        {"name": "Other", "color": "orange"}
                    ]
                }},
                "Confirmed": {"checkbox": {}},
                "Receipt Sent": {"checkbox": {}}
            }
        )
        print(f"✅ Created Donations database: {donations_db['id']}")
        return donations_db['id']
    except Exception as e:
        print(f"❌ Error creating Donations database: {e}")
        return None

def main():
    """Main execution"""
    print("🚀 Recreating Notion Databases with Properties")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    
    print("\n📊 Creating Projects database...")
    projects_id = create_projects_database()
    
    print("\n💰 Creating Donations database...")
    donations_id = create_donations_database()
    
    print("\n" + "="*70)
    if projects_id and donations_id:
        print("✅ Both databases created successfully!")
        print(f"   Projects DB ID: {projects_id}")
        print(f"   Donations DB ID: {donations_id}")
        print("\n📋 Next: Run populate script to add data")
    else:
        print("⚠️  Some databases may not have been created")
    print("="*70)

if __name__ == '__main__':
    main()
