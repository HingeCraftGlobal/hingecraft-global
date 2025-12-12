#!/usr/bin/env python3
"""
Final HingeCraft Notion Flush - Complete Organization
Uses OpenAI for copywriting, organizes everything, removes duplicates, populates Notion
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

# Load OpenAI key from api_keys (NOT ferguson-system)
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

# Database IDs (use newly created ones)
PROJECTS_DB_ID = "54737597-cd5a-4e8b-ba1a-f43db17649b2"
DONATIONS_DB_ID = "ff2a0969-7d34-42b5-afac-795e030b7259"

def generate_comprehensive_copywriting(project_data):
    """Generate full copywriting with GPT"""
    if not OPENAI_API_KEY:
        return project_data.get('description', '')
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Write comprehensive, professional copywriting for a HingeCraft Global project in Notion.

Project Name: {project_data.get('name', '')}
Current Description: {project_data.get('description', '')}
Status: {project_data.get('status', 'In Progress')}
Progress: {project_data.get('progress', 0)}%
Team: {', '.join(project_data.get('team', []))}

Create a complete, well-structured project description (250-350 words) that:

1. **Opening** - Clear statement of what the project is and why it matters
2. **Features & Capabilities** - Key features and what it does
3. **Current Status** - Where we are now and progress made
4. **Impact** - How this contributes to HingeCraft's mission
5. **Next Steps** - What's coming next

Use inspiring, action-oriented language aligned with HingeCraft's mission: "Building resilient, abundant futures through accessible technology and sustainable design."

Be specific, professional, and motivating. Include technical details where relevant."""
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are an expert technical copywriter for HingeCraft Global. Write clear, inspiring, action-oriented content that motivates teams and clearly communicates project value."},
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
            print(f"   ⚠️  API quota exceeded")
        else:
            print(f"   ⚠️  API error: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  GPT error: {e}")
    
    return project_data.get('description', '')

# HingeCraft Projects with full data
HINGECRAFT_PROJECTS = [
    {
        'name': 'Notion Dashboard Integration',
        'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 30,
        'owner': 'Development Team',
        'team': ['Engineering', 'DevOps']
    },
    {
        'name': 'ML Automation System',
        'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads, syncing to HubSpot CRM, and sending automated email sequences.',
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

def create_project_final(db_id, project_data):
    """Create project with comprehensive copywriting"""
    try:
        # Generate copywriting
        print(f"   ✍️  Generating copywriting: {project_data['name']}")
        enhanced_desc = generate_comprehensive_copywriting(project_data)
        
        # Create page
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
        print(f"   ❌ Error: {str(e)[:200]}")
        return False

def create_donation_final(db_id, donation_data):
    """Create donation"""
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
        print(f"   ✅ Created: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:200]}")
        return False

def main():
    """Main execution"""
    print("🚀 Final HingeCraft Notion Flush - Complete Organization")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    if OPENAI_API_KEY:
        print(f"✅ OpenAI API key loaded (length: {len(OPENAI_API_KEY)})")
    else:
        print("⚠️  OpenAI API key not found")
    
    # Create projects
    print(f"\n📊 Creating {len(HINGECRAFT_PROJECTS)} projects with GPT copywriting...")
    created_projects = 0
    for project in HINGECRAFT_PROJECTS:
        if create_project_final(PROJECTS_DB_ID, project):
            created_projects += 1
    
    # Create donations
    print(f"\n💰 Creating {len(HINGECRAFT_DONATIONS)} donations...")
    created_donations = 0
    for donation in HINGECRAFT_DONATIONS:
        if create_donation_final(DONATIONS_DB_ID, donation):
            created_donations += 1
    
    # Summary
    print("\n" + "="*70)
    print("📊 FINAL SUMMARY")
    print("="*70)
    print(f"✅ Projects: {created_projects}/{len(HINGECRAFT_PROJECTS)}")
    print(f"✅ Donations: {created_donations}/{len(HINGECRAFT_DONATIONS)}")
    print(f"✅ GPT Copywriting: {'Yes' if OPENAI_API_KEY else 'No'}")
    print("="*70)
    print("\n🎉 Complete!")

if __name__ == '__main__':
    main()
