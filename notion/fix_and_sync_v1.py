#!/usr/bin/env python3
"""
V1 Testing: Fix Schema Issues and Complete Full Sync
This script fixes all database schema mismatches and completes full data upload
"""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from notion_client import Client

load_dotenv()

notion = Client(auth=os.getenv("NOTION_TOKEN"))
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

print("🔧 V1 Testing: Fixing Schema and Completing Sync\n")

# Step 1: Query all databases and get actual properties
print("📊 Step 1: Querying database schemas...")
db_schemas = {}

# Get all databases from parent page
try:
    # Query databases in parent page
    results = notion.search(filter={"property": "object", "value": "database"})
    
    for db in results.get('results', []):
        db_id = db['id']
        db_title = db.get('title', [{}])[0].get('plain_text', 'Unknown')
        db_info = notion.databases.retrieve(database_id=db_id)
        props = db_info.get('properties', {})
        db_schemas[db_title.lower()] = {
            'id': db_id,
            'title': db_title,
            'properties': list(props.keys()),
            'property_details': props
        }
        print(f"   ✅ {db_title}: {len(props)} properties")
except Exception as e:
    print(f"   ⚠️  Error querying databases: {e}")

# Step 2: Recreate databases with correct schemas if needed
print("\n🔨 Step 2: Ensuring databases have correct schemas...")

def ensure_donations_db():
    """Ensure Donations database exists with correct schema"""
    db_id = os.getenv("NOTION_DONATION_DB_ID", "")
    
    if db_id and db_id in [s['id'] for s in db_schemas.values()]:
        print("   ✅ Donations DB exists")
        return db_id
    
    # Create Donations database
    try:
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
                        {"name": "SOL", "color": "purple"}
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
                "Confirmed": {"checkbox": {}},
                "Receipt Sent": {"checkbox": {}}
            }
        )
        print(f"   ✅ Created Donations DB: {donations_db['id']}")
        return donations_db['id']
    except Exception as e:
        print(f"   ❌ Error creating Donations DB: {e}")
        return None

donations_db_id = ensure_donations_db()

# Step 3: Load and sync donations
print("\n📤 Step 3: Syncing donations...")
db_export_path = Path("../database/COMPLETE_DATABASE_EXPORT.json")
if db_export_path.exists():
    with open(db_export_path, 'r') as f:
        db_data = json.load(f)
        donations = db_data.get('data', {}).get('donations', [])
        print(f"   📊 Found {len(donations)} donations")
        
        if donations_db_id:
            synced = 0
            for donation in donations:
                try:
                    # Get payment method - ensure it's a valid option
                    payment_method = donation.get('payment_method', 'Manual')
                    if payment_method not in ['Stripe', 'Coinbase Commerce', 'Bank', 'Manual']:
                        payment_method = 'Manual'
                    
                    # Get currency - ensure it's valid
                    currency = donation.get('currency', 'USD')
                    if currency not in ['USD', 'BTC', 'SOL']:
                        currency = 'USD'
                    
                    props = {
                        "Donor Name": {"title": [{"text": {"content": donation.get('member_name', 'Anonymous')}}]},
                        "Donation ID": {"rich_text": [{"text": {"content": str(donation.get('id', donation.get('_id', '')))}}]},
                        "Amount": {"number": float(donation.get('amount', 0))},
                        "Currency": {"select": {"name": currency}},
                        "Date": {"date": {"start": donation.get('created_at', '')}},
                        "Method": {"select": {"name": payment_method}},
                        "Confirmed": {"checkbox": donation.get('payment_status') == 'completed'},
                        "Receipt Sent": {"checkbox": False}
                    }
                    
                    notion.pages.create(
                        parent={"database_id": donations_db_id},
                        properties=props
                    )
                    synced += 1
                    if synced % 10 == 0:
                        print(f"   ✅ Synced {synced}/{len(donations)} donations")
                    time.sleep(0.3)  # Rate limiting
                except Exception as e:
                    print(f"   ⚠️  Error syncing donation {donation.get('id')}: {e}")
            
            print(f"   ✅ Successfully synced {synced}/{len(donations)} donations")
else:
    print("   ⚠️  Database export not found")

print("\n✅ V1 Testing Phase 1 Complete!")
print("   Next: Continue with remaining 500 tasks...")

