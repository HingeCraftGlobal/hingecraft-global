#!/usr/bin/env python3
"""
Fix Notion Database Schema Mismatches
Queries actual databases and fixes property names
"""

import os
import json
from dotenv import load_dotenv
from notion_client import Client

load_dotenv()

notion = Client(auth=os.getenv("NOTION_TOKEN"))

# Database IDs from .env or log
DB_IDS = {
    'donations': '995f71ca-8eed-49a4-80ac-286d888f3a7f',
    'urls': '72603be0-0ead-446f-8c05-451141fe26dd',
    'projects': 'addba9ed-7cd4-49e0-a00e-30860ad03c97',
    'tasks': 'af0b9a0a-0da6-4052-8725-9bc37754605d',
    'system_status': '5a966b49-af4f-449d-9c9b-e616d5373982'
}

print("🔍 Checking database schemas...\n")

for db_name, db_id in DB_IDS.items():
    try:
        db_info = notion.databases.retrieve(database_id=db_id)
        props = db_info.get('properties', {})
        print(f"📊 {db_name.upper()} Database:")
        print(f"   Properties: {', '.join(props.keys())}")
        print()
    except Exception as e:
        print(f"❌ Error checking {db_name}: {e}\n")

print("✅ Schema check complete")

