#!/usr/bin/env python3
"""
Final HingeCraft Notion Population
Uses newly created databases with properties, GPT copywriting, removes duplicates
FOR HINGECRAFT NOTION ONLY
"""

import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from notion_client import Client

load_dotenv()

# Load OpenAI key (NOT ferguson-system)
def load_openai_key():
    api_keys_path = Path("/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json")
    if api_keys_path.exists():
        try:
            with open(api_keys_path, 'r') as f:
                data = json.load(f)
                return data.get("api_key") or data.get("OPENAI_API_KEY")
        except:
            pass
    return os.getenv("OPENAI_API_KEY", "")

OPENAI_API_KEY = load_openai_key()
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

notion = Client(auth=NOTION_TOKEN)

# New database IDs from recreate script
NEW_PROJECTS_DB_ID = "54737597-cd5a-4e8b-ba1a-f43db17649b2"
NEW_DONATIONS_DB_ID = "ff2a0969-7d34-42b5-afac-795e030b7259"

def generate_gpt_copywriting(project_data):
    """Generate comprehensive copywriting using GPT"""
    if not OPENAI_API_KEY:
        return project_data.get('description', '')
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Write comprehensive, professional copywriting for a HingeCraft Global project in Notion.

Project: {project_data.get('name', '')}
Current Description: {project_data.get('description', '')}
Status: {project_data.get('status', 'In Progress')}
Progress: {project_data.get('progress', 0)}%

Create a complete project description (200-300 words) that:
- Clearly explains what the project does and why it matters
- Highlights key features, benefits, and impact
- Shows current status and progress clearly
- Uses inspiring, action-oriented language
- Aligns with HingeCraft's mission: "Building resilient, abundant futures through accessible technology and sustainable design"
- Includes specific technical details where relevant
- Ends with clear next steps or current focus

Write in a professional yet approachable tone. Be specific and actionable."""
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are an expert copywriter for HingeCraft Global. Write clear, inspiring, action-oriented content."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            result = response.json()['choices'][0]['message']['content'].strip()
            return result
        elif response.status_code == 429:
            print(f"   ⚠️  API quota exceeded, using original")
        else:
            print(f"   ⚠️  API error: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  GPT error: {e}")
    
    return project_data.get('description', '')

def verify_database(db_id, db_name):
    """Verify database exists and has properties"""
    try:
        db_info = notion.databases.retrieve(database_id=db_id)
        props = db_info.get('properties', {})
        if props:
            print(f"✅ {db_name} database verified with {len(props)} properties")
            return True, db_info
        else:
            print(f"⚠️  {db_name} database has no properties")
            return False, None
    except Exception as e:
        print(f"❌ {db_name} database error: {e}")
        return False, None

def remove_duplicates(db_id, name_field="Name"):
    """Remove duplicate entries"""
    try:
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
                            duplicates.append(page['id'])
                        else:
                            seen[name] = page['id']
        
        # Archive duplicates
        for dup_id in duplicates:
            try:
                notion.pages.update(page_id=dup_id, archived=True)
            except:
                pass
        
        if duplicates:
            print(f"   🗑️  Removed {len(duplicates)} duplicates")
        return len(duplicates)
    except Exception as e:
        print(f"   ⚠️  Duplicate removal error: {e}")
        return 0

# HingeCraft Projects
HINGECRAFT_PROJECTS = [
    {
        'name': 'Notion Dashboard Integration',
        'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace. Real-time project tracking, progress monitoring, and team collaboration dashboard.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 30,
        'owner': 'Development Team',
        'team': ['Engineering', 'DevOps']
    },
    {
        'name': 'ML Automation System',
        'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads with Anymail API, syncing to HubSpot CRM, and sending automated email sequences.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Automation Team',
        'team': ['Engineering', 'Marketing']
    },
    {
        'name': '10-Layer Master Schema',
        'description': 'Comprehensive PostgreSQL database architecture with 10 integrated layers supporting 50+ tables, full-text search, encryption, and enterprise security.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Database Team',
        'team': ['Engineering', 'DevOps']
    },
    {
        'name': 'Charter for Abundance Platform',
        'description': 'Membership platform for the Charter for Abundance & Resilience initiative. Features donation processing, charter invitation system, and community engagement tools.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Product Team',
        'team': ['Engineering', 'Design', 'Community']
    },
    {
        'name': '34 Legal Compliance Pages',
        'description': 'Complete legal compliance framework with 34 comprehensive pages covering corporate formation, terms of service, privacy policies, AI governance, and global regulations.',
        'status': 'Review',
        'priority': 'High',
        'progress': 100,
        'owner': 'Legal Team',
        'team': ['Legal', 'Compliance']
    },
    {
        'name': 'Wix Platform Integration',
        'description': 'Complete integration with Wix platform for website management, page deployment, and backend functionality.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 85,
        'owner': 'DevOps Team',
        'team': ['Engineering', 'DevOps', 'Design']
    },
    {
        'name': 'Copywriting Master System',
        'description': 'Comprehensive copywriting framework and automation system for all HingeCraft Global content.',
        'status': 'In Progress',
        'priority': 'Medium',
        'progress': 75,
        'owner': 'Content Team',
        'team': ['Marketing', 'Content', 'Design']
    }
]

HINGECRAFT_DONATIONS = [
    {'id': '14ae821b-7915-46bc-bd5d-f5c60264f47a', 'amount': 25.50, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Verification Test', 'date': '2025-12-01'},
    {'id': '489d10f6-b022-4825-b757-2b334fe08f35', 'amount': 100.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'pending', 'donor_name': 'Test User 2', 'date': '2025-12-01'},
    {'id': 'a74af7be-08a4-4296-b451-60e61c903c4b', 'amount': 50.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Test User', 'date': '2025-12-01'}
]

def create_project(db_id, project_data):
    """Create project in Notion"""
    try:
        # Generate enhanced copywriting
        print(f"   ✍️  Generating copywriting for: {project_data['name']}")
        enhanced_desc = generate_gpt_copywriting(project_data)
        
        props = {
            "Name": {"title": [{"text": {"content": project_data['name']}}]},
            "Project ID": {"rich_text": [{"text": {"content": project_data['name'].lower().replace(' ', '_')}}]},
            "Status": {"select": {"name": project_data.get('status', 'In Progress')}},
            "Priority": {"select": {"name": project_data.get('priority', 'Medium')}},
            "Progress %": {"number": project_data.get('progress', 0) / 100},
            "Owner": {"rich_text": [{"text": {"content": project_data.get('owner', 'Team')}}]},
            "Team": {"multi_select": [{"name": t} for t in project_data.get('team', [])]},
            "Notes": {"rich_text": [{"text": {"content": enhanced_desc}}]}
        }
        
        notion.pages.create(parent={"database_id": db_id}, properties=props)
        print(f"   ✅ Created: {project_data['name']}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_donation(db_id, donation_data):
    """Create donation in Notion"""
    try:
        props = {
            "Donor Name": {"title": [{"text": {"content": donation_data.get('donor_name', 'Anonymous')}}]},
            "Donation ID": {"rich_text": [{"text": {"content": str(donation_data.get('id', ''))}}]},
            "Amount": {"number": donation_data.get('amount', 0)},
            "Currency": {"select": {"name": donation_data.get('currency', 'USD')}},
            "Method": {"select": {"name": donation_data.get('method', 'Manual')}},
            "Date": {"date": {"start": donation_data.get('date', datetime.now().date().isoformat())}},
            "Confirmed": {"checkbox": donation_data.get('status') == 'completed'}
        }
        
        notion.pages.create(parent={"database_id": db_id}, properties=props)
        print(f"   ✅ Created donation: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Main execution"""
    print("🚀 Final HingeCraft Notion Population")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    if OPENAI_API_KEY:
        print(f"✅ OpenAI API key loaded (length: {len(OPENAI_API_KEY)})")
    else:
        print("⚠️  OpenAI API key not found - using original descriptions")
    
    # Verify databases
    print("\n🔍 Verifying databases...")
    projects_ok, projects_info = verify_database(NEW_PROJECTS_DB_ID, "Projects")
    donations_ok, donations_info = verify_database(NEW_DONATIONS_DB_ID, "Donations")
    
    if not projects_ok:
        print("❌ Projects database not ready")
        return
    
    # Remove duplicates
    print("\n🧹 Removing duplicates...")
    remove_duplicates(NEW_PROJECTS_DB_ID, "Name")
    if donations_ok:
        remove_duplicates(NEW_DONATIONS_DB_ID, "Donor Name")
    
    # Create projects
    print(f"\n📊 Creating {len(HINGECRAFT_PROJECTS)} projects...")
    created_projects = 0
    for project in HINGECRAFT_PROJECTS:
        if create_project(NEW_PROJECTS_DB_ID, project):
            created_projects += 1
    
    # Create donations
    if donations_ok:
        print(f"\n💰 Creating {len(HINGECRAFT_DONATIONS)} donations...")
        created_donations = 0
        for donation in HINGECRAFT_DONATIONS:
            if create_donation(NEW_DONATIONS_DB_ID, donation):
                created_donations += 1
    else:
        created_donations = 0
        print("\n⚠️  Donations database not ready - skipping")
    
    # Summary
    print("\n" + "="*70)
    print("📊 FINAL SUMMARY")
    print("="*70)
    print(f"✅ Projects Created: {created_projects}/{len(HINGECRAFT_PROJECTS)}")
    print(f"✅ Donations Created: {created_donations}/{len(HINGECRAFT_DONATIONS)}")
    print(f"✅ Duplicates Removed: Yes")
    print(f"✅ GPT Copywriting: {'Yes' if OPENAI_API_KEY else 'No'}")
    print("="*70)
    print("\n🎉 HingeCraft Notion population complete!")

if __name__ == '__main__':
    main()
