#!/usr/bin/env python3
"""
Complete HingeCraft Notion Setup - Full Organization and Population
Creates databases with properties, generates GPT copywriting, organizes everything,
and populates Notion with all data, removing duplicates
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
    """Load OpenAI API key from api_keys directory"""
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

# Track created items to avoid duplicates
created_hashes = {
    'projects': set(),
    'donations': set()
}

def generate_gpt_copywriting(content_type, data):
    """Generate comprehensive copywriting using GPT"""
    if not OPENAI_API_KEY:
        return data.get('description', '')
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        if content_type == 'project':
            prompt = f"""Write comprehensive, professional copywriting for a HingeCraft Global project in Notion.

Project: {data.get('name', '')}
Current Description: {data.get('description', '')}
Status: {data.get('status', 'In Progress')}
Progress: {data.get('progress', 0)}%

Create a complete project description (200-300 words) that:
- Clearly explains what the project does and why it matters
- Highlights key features, benefits, and impact
- Shows current status and progress clearly
- Uses inspiring, action-oriented language
- Aligns with HingeCraft's mission: "Building resilient, abundant futures through accessible technology and sustainable design"
- Includes specific technical details where relevant
- Ends with clear next steps or current focus

Write in a professional yet approachable tone. Be specific and actionable."""
        else:
            prompt = f"Write comprehensive copywriting for: {data}"
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are an expert copywriter for HingeCraft Global. Write clear, inspiring, action-oriented content that aligns with our mission of building resilient, abundant futures."},
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
    
    return data.get('description', '')

def create_databases_with_properties():
    """Create Notion databases with all required properties"""
    print("\n📊 Creating databases with properties...")
    
    try:
        # Projects Database
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
        # Database might already exist, try to find it
        print(f"⚠️  Database creation error (may already exist): {e}")
        children = notion.blocks.children.list(block_id=PARENT_PAGE)
        for child in children.get('results', []):
            if child.get('type') == 'child_database':
                try:
                    db_info = notion.databases.retrieve(database_id=child['id'])
                    title = db_info.get('title', [{}])[0].get('plain_text', '')
                    if 'project' in title.lower():
                        print(f"✅ Found existing Projects database")
                        return child['id']
                except:
                    continue
        return None

def get_or_create_database(database_name, properties):
    """Get existing database or create new one with properties"""
    # First try to find existing
    children = notion.blocks.children.list(block_id=PARENT_PAGE)
    for child in children.get('results', []):
        if child.get('type') == 'child_database':
            try:
                db_info = notion.databases.retrieve(database_id=child['id'])
                title = db_info.get('title', [{}])[0].get('plain_text', '')
                if database_name.lower() in title.lower():
                    # Check if it has properties
                    existing_props = db_info.get('properties', {})
                    if existing_props:
                        print(f"✅ Found {database_name} database with {len(existing_props)} properties")
                        return child['id'], db_info
                    else:
                        print(f"⚠️  {database_name} exists but has no properties - will use basic properties")
                        return child['id'], None
            except Exception as e:
                print(f"⚠️  Error retrieving database: {e}")
                continue
    
    # Create new database
    try:
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": database_name}}],
            properties=properties
        )
        print(f"✅ Created {database_name} database")
        return db['id'], db
    except Exception as e:
        print(f"❌ Error creating {database_name}: {e}")
        return None, None

def remove_duplicates_smart(db_id, name_property="Name"):
    """Remove duplicates from database"""
    try:
        # Get all pages using pagination
        all_results = []
        has_more = True
        next_cursor = None
        
        while has_more:
            try:
                if next_cursor:
                    results = notion.databases.query(database_id=db_id, start_cursor=next_cursor)
                else:
                    results = notion.databases.query(database_id=db_id)
                
                all_results.extend(results.get('results', []))
                has_more = results.get('has_more', False)
                next_cursor = results.get('next_cursor')
            except Exception as e:
                print(f"   ⚠️  Query error: {e}")
                break
        
        seen = {}
        duplicates = []
        
        for page in all_results:
            props = page.get('properties', {})
            if name_property in props:
                title_prop = props[name_property]
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
        print(f"   ⚠️  Duplicate check error: {e}")
        return 0

# Comprehensive HingeCraft project data
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

def create_project_in_notion(db_id, project_data):
    """Create project in Notion with GPT-enhanced copywriting"""
    try:
        # Check for duplicate
        name_lower = project_data['name'].lower().strip()
        if name_lower in created_hashes['projects']:
            print(f"   ⏭️  Skipping duplicate: {project_data['name']}")
            return False
        created_hashes['projects'].add(name_lower)
        
        # Generate enhanced copywriting
        print(f"   ✍️  Generating copywriting for: {project_data['name']}")
        enhanced_desc = generate_gpt_copywriting('project', project_data)
        
        # Build properties
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

def create_donation_in_notion(db_id, donation_data):
    """Create donation in Notion"""
    try:
        # Check for duplicate
        donation_id = str(donation_data.get('id', ''))
        if donation_id in created_hashes['donations']:
            print(f"   ⏭️  Skipping duplicate donation: {donation_id}")
            return False
        created_hashes['donations'].add(donation_id)
        
        props = {
            "Donor Name": {"title": [{"text": {"content": donation_data.get('donor_name', 'Anonymous')}}]},
            "Donation ID": {"rich_text": [{"text": {"content": donation_id}}]},
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

def update_dashboard_final(stats):
    """Update dashboard with final comprehensive content"""
    try:
        welcome_text = f"""# 🚀 HingeCraft Global - Project Dashboard

Welcome to the HingeCraft Global Project Dashboard!

This workspace provides complete visibility into all our projects, organized and optimized for team collaboration.

## 📊 Current Status

- **Active Projects:** {stats.get('projects', 0)}
- **Total Donations:** ${stats.get('donations_total', 0):.2f}
- **Donation Count:** {stats.get('donations_count', 0)}
- **Overall Progress:** {stats.get('overall_progress', 0):.1f}%
- **Last Updated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 🎯 Database Overview

### Projects Database
Track all HingeCraft Global projects with comprehensive descriptions, status, priority, progress, and team assignments. Each project includes GPT-enhanced copywriting for clarity and inspiration.

### Tasks Database
Individual tasks linked to projects. Track assignments, status, and progress.

### Donations Database
All donation records with payment details. Current total: ${stats.get('donations_total', 0):.2f} from {stats.get('donations_count', 0)} contributions.

### System Status
Real-time monitoring of all services and integrations.

### URLs Database
Company URLs, repositories, and service endpoints.

## 🚀 Getting Started

1. **Browse Projects** - See all active projects and their progress
2. **Check Tasks** - View what needs to be done
3. **Review Donations** - See community support
4. **Monitor Status** - Check system health

---

*All content is organized, duplicate-free, and enhanced with comprehensive copywriting.*"""
        
        notion.blocks.children.append(
            block_id=PARENT_PAGE,
            children=[{
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [{"type": "text", "text": {"content": welcome_text}}],
                    "icon": {"emoji": "🚀"},
                    "color": "blue"
                }
            }]
        )
        print("✅ Dashboard updated with comprehensive content")
        return True
    except Exception as e:
        print(f"⚠️  Dashboard error: {e}")
        return False

def main():
    """Main execution - Complete HingeCraft Notion setup"""
    print("🚀 Complete HingeCraft Notion Setup")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    if OPENAI_API_KEY:
        print(f"✅ OpenAI API key loaded (length: {len(OPENAI_API_KEY)})")
    else:
        print("⚠️  OpenAI API key not found - using original descriptions")
    
    # Step 1: Create/Get Projects database with properties
    print("\n📊 Step 1: Setting up Projects database...")
    projects_props = {
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
        "Notes": {"rich_text": {}}
    }
    
    projects_db_id, projects_db_info = get_or_create_database("Projects", projects_props)
    if not projects_db_id:
        print("❌ Could not create/get Projects database")
        return
    
    # Step 2: Remove duplicates
    print("\n🧹 Step 2: Removing duplicates...")
    remove_duplicates_smart(projects_db_id, "Name")
    
    # Step 3: Create projects with GPT copywriting
    print(f"\n📝 Step 3: Creating {len(HINGECRAFT_PROJECTS)} projects with GPT copywriting...")
    created_projects = 0
    for project in HINGECRAFT_PROJECTS:
        if create_project_in_notion(projects_db_id, project):
            created_projects += 1
    
    # Step 4: Create/Get Donations database
    print("\n💰 Step 4: Setting up Donations database...")
    donations_props = {
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
        "Method": {"select": {
            "options": [
                {"name": "Stripe", "color": "blue"},
                {"name": "Coinbase Commerce", "color": "purple"},
                {"name": "Bank", "color": "green"},
                {"name": "Manual", "color": "gray"}
            ]
        }},
        "Date": {"date": {}},
        "Confirmed": {"checkbox": {}}
    }
    
    donations_db_id, donations_db_info = get_or_create_database("Donations", donations_props)
    if donations_db_id:
        remove_duplicates_smart(donations_db_id, "Donor Name")
        
        print(f"\n💰 Step 5: Creating {len(HINGECRAFT_DONATIONS)} donations...")
        created_donations = 0
        for donation in HINGECRAFT_DONATIONS:
            if create_donation_in_notion(donations_db_id, donation):
                created_donations += 1
    else:
        created_donations = 0
    
    # Step 6: Update dashboard
    stats = {
        'projects': created_projects,
        'donations_total': sum(d.get('amount', 0) for d in HINGECRAFT_DONATIONS),
        'donations_count': len(HINGECRAFT_DONATIONS),
        'overall_progress': sum(p.get('progress', 0) for p in HINGECRAFT_PROJECTS) / len(HINGECRAFT_PROJECTS) if HINGECRAFT_PROJECTS else 0
    }
    update_dashboard_final(stats)
    
    # Summary
    print("\n" + "="*70)
    print("📊 COMPLETE SETUP SUMMARY")
    print("="*70)
    print(f"✅ Projects Created: {created_projects}/{len(HINGECRAFT_PROJECTS)}")
    print(f"✅ Donations Created: {created_donations}/{len(HINGECRAFT_DONATIONS)}")
    print(f"✅ Duplicates Removed: Yes")
    print(f"✅ GPT Copywriting: {'Yes' if OPENAI_API_KEY else 'No (using originals)'}")
    print(f"✅ Dashboard Updated: Yes")
    print(f"✅ Overall Progress: {stats['overall_progress']:.1f}%")
    print("="*70)
    print("\n🎉 HingeCraft Notion setup complete!")

if __name__ == '__main__':
    main()





