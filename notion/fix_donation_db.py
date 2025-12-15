#!/usr/bin/env python3
"""
Fix Donations Database - Ensure properties exist and match sync script
"""
import os
import sys
from dotenv import load_dotenv
from notion_client import Client

load_dotenv()

notion = Client(auth=os.getenv('NOTION_TOKEN'))
PARENT_PAGE = os.getenv('NOTION_PARENT_PAGE_ID')

def find_or_create_donations_db():
    """Find existing donations DB or create new one"""
    # Search for existing databases
    try:
        children = notion.blocks.children.list(block_id=PARENT_PAGE)
        for child in children.get('results', []):
            if child.get('type') == 'child_database':
                db_id = child.get('id')
                try:
                    db = notion.databases.retrieve(database_id=db_id)
                    title = db.get('title', [{}])[0].get('plain_text', '').lower()
                    if 'donation' in title:
                        print(f"Found existing Donations DB: {db_id}")
                        return db_id, db
                except:
                    pass
    except Exception as e:
        print(f"Error searching: {e}")
    
    # Create new database
    print("Creating new Donations database...")
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
    print(f"Created Donations DB: {donations_db['id']}")
    return donations_db['id'], donations_db

def update_db_properties(db_id, db):
    """Update database properties if missing"""
    existing_props = set(db.get('properties', {}).keys())
    required_props = {
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
    
    props_to_add = {}
    for prop_name, prop_def in required_props.items():
        if prop_name not in existing_props:
            props_to_add[prop_name] = prop_def
    
    if props_to_add:
        print(f"Adding {len(props_to_add)} missing properties...")
        try:
            notion.databases.update(
                database_id=db_id,
                properties=props_to_add
            )
            print("Properties added successfully")
        except Exception as e:
            print(f"Error adding properties: {e}")
    else:
        print("All required properties exist")

if __name__ == "__main__":
    db_id, db = find_or_create_donations_db()
    print(f"\nDatabase ID: {db_id}")
    print(f"Existing properties: {list(db.get('properties', {}).keys())}")
    print("\nUpdating properties...")
    update_db_properties(db_id, db)
    print(f"\n✅ Donations database ready!")
    print(f"Add to .env: NOTION_DONATION_DB_ID={db_id}")

