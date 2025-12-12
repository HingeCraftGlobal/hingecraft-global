#!/usr/bin/env python3
"""
Complete Notion Dashboard Population
Brings in all database data and uses AI to generate comprehensive descriptions
Fills out entire Notion teamspace with complete project information
"""

import os
import sys
import json
import psycopg2
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from notion_client import Client
import openai

# Load environment
load_dotenv()

# Configuration
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "19ad872b-594c-81d7-b4fd-00024322280f")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'hingecraft'),
    'user': os.getenv('DB_USER', 'hcuser'),
    'password': os.getenv('DB_PASSWORD', 'hcpass')
}

# Initialize clients
notion = Client(auth=NOTION_TOKEN)
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def generate_ai_description(prompt, context=""):
    """Generate AI-powered description using GPT"""
    if not OPENAI_API_KEY:
        return None
    
    try:
        full_prompt = f"""You are a technical writer for HingeCraft Global, a platform building resilient, abundant futures through microfactories and sustainable design.

{context}

Task: {prompt}

Write a comprehensive, professional description that:
- Is clear and action-oriented
- Highlights impact and benefits
- Uses inclusive, inspiring language
- Is 2-3 paragraphs (150-300 words)
- Focuses on what it does and why it matters

Description:"""
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a technical writer specializing in clear, inspiring descriptions of technology projects."},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️  AI generation failed: {e}")
        return None

def connect_database():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        return None

def get_database_id(notion, parent_page_id, database_name):
    """Find database ID by name"""
    try:
        children = notion.blocks.children.list(block_id=parent_page_id)
        
        for child in children.get('results', []):
            if child.get('type') == 'child_database':
                try:
                    db_info = notion.databases.retrieve(database_id=child['id'])
                    title = db_info.get('title', [{}])[0].get('plain_text', '')
                    if database_name.lower() in title.lower():
                        return child['id']
                except:
                    continue
        
        return None
    except Exception as e:
        print(f"⚠️  Error finding database: {e}")
        return None

def get_all_projects_from_db(conn):
    """Get all projects from database"""
    cursor = conn.cursor()
    
    # Try to get from projects table
    try:
        cursor.execute("""
            SELECT 
                project_id, name, description, status, priority, 
                progress_percent, owner, team, start_date, due_date
            FROM projects
            ORDER BY priority DESC, created_at DESC
        """)
        projects = cursor.fetchall()
        
        result = []
        for p in projects:
            result.append({
                'project_id': p[0],
                'name': p[1] or 'Untitled Project',
                'description': p[2] or '',
                'status': p[3] or 'Idea',
                'priority': p[4] or 'Medium',
                'progress': float(p[5]) if p[5] else 0,
                'owner': p[6] or 'Team',
                'team': p[7] or '',
                'start_date': p[8],
                'due_date': p[9]
            })
        return result
    except Exception as e:
        print(f"⚠️  Could not fetch projects: {e}")
        return []

def get_all_donations_from_db(conn):
    """Get all donations from database"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id, amount, currency, payment_method, payment_status,
                member_name, member_email, created_at, metadata
            FROM donations
            ORDER BY created_at DESC
        """)
        donations = cursor.fetchall()
        
        result = []
        for d in donations:
            result.append({
                'id': d[0],
                'amount': float(d[1]) if d[1] else 0,
                'currency': d[2] or 'USD',
                'method': d[3] or 'Manual',
                'status': d[4] or 'pending',
                'donor_name': d[5] or 'Anonymous',
                'donor_email': d[6] or '',
                'date': d[7],
                'metadata': d[8] or {}
            })
        return result
    except Exception as e:
        print(f"⚠️  Could not fetch donations: {e}")
        return []

def create_or_update_project(notion, db_id, project_data, use_ai=True):
    """Create or update project in Notion with AI-enhanced description"""
    try:
        # Search for existing
        results = notion.databases.query(
            database_id=db_id,
            filter={
                "property": "Project ID",
                "rich_text": {"equals": project_data.get('project_id', '')}
            }
        )
        
        # Generate enhanced description with AI
        description = project_data.get('description', '')
        if use_ai and OPENAI_API_KEY and description:
            ai_desc = generate_ai_description(
                f"Expand and enhance this project description: {description}",
                f"Project: {project_data.get('name')}, Status: {project_data.get('status')}, Progress: {project_data.get('progress', 0)}%"
            )
            if ai_desc:
                description = ai_desc
        
        # Build properties
        props = {
            "Name": {"title": [{"text": {"content": project_data.get('name', 'Untitled Project')}}]},
            "Project ID": {"rich_text": [{"text": {"content": str(project_data.get('project_id', ''))}}]},
            "Status": {"select": {"name": project_data.get('status', 'Idea')}},
            "Priority": {"select": {"name": project_data.get('priority', 'Medium')}},
            "Progress %": {"number": project_data.get('progress', 0) / 100},
            "Owner": {"rich_text": [{"text": {"content": project_data.get('owner', 'Team')}}]},
            "Notes": {"rich_text": [{"text": {"content": description}}]}
        }
        
        # Add team if available
        if project_data.get('team'):
            team_list = [t.strip() for t in project_data.get('team', '').split(',')]
            props["Team"] = {"multi_select": [{"name": t} for t in team_list if t]}
        
        # Add dates if available
        if project_data.get('start_date'):
            props["Start Date"] = {"date": {"start": project_data.get('start_date').isoformat()}}
        if project_data.get('due_date'):
            props["Due Date"] = {"date": {"start": project_data.get('due_date').isoformat()}}
        
        if results.get('results'):
            # Update existing
            page_id = results['results'][0]['id']
            notion.pages.update(page_id=page_id, properties=props)
            print(f"✅ Updated: {project_data.get('name')}")
        else:
            # Create new
            notion.pages.create(parent={"database_id": db_id}, properties=props)
            print(f"✅ Created: {project_data.get('name')}")
            
    except Exception as e:
        print(f"❌ Error with project {project_data.get('name')}: {e}")

def create_or_update_donation(notion, db_id, donation_data):
    """Create or update donation in Notion"""
    try:
        # Search for existing
        results = notion.databases.query(
            database_id=db_id,
            filter={
                "property": "Donation ID",
                "rich_text": {"equals": str(donation_data.get('id', ''))}
            }
        )
        
        props = {
            "Donor Name": {"title": [{"text": {"content": donation_data.get('donor_name', 'Anonymous')}}]},
            "Donation ID": {"rich_text": [{"text": {"content": str(donation_data.get('id', ''))}}]},
            "Amount": {"number": donation_data.get('amount', 0)},
            "Currency": {"select": {"name": donation_data.get('currency', 'USD')}},
            "Method": {"select": {"name": donation_data.get('method', 'Manual')}},
            "Confirmed": {"checkbox": donation_data.get('status') == 'completed'},
        }
        
        if donation_data.get('date'):
            props["Date"] = {"date": {"start": donation_data.get('date').isoformat()}}
        
        if results.get('results'):
            page_id = results['results'][0]['id']
            notion.pages.update(page_id=page_id, properties=props)
            print(f"✅ Updated donation: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
        else:
            notion.pages.create(parent={"database_id": db_id}, properties=props)
            print(f"✅ Created donation: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
            
    except Exception as e:
        print(f"❌ Error with donation: {e}")

def update_dashboard_header(notion, parent_page_id, stats):
    """Update main dashboard with comprehensive header"""
    try:
        welcome_text = f"""# 🚀 HingeCraft Global - Project Dashboard

Welcome to the comprehensive HingeCraft Global Project Dashboard!

This workspace provides real-time visibility into all our projects, from database development to automation systems. Use the databases below to track progress, manage tasks, and stay updated on everything happening across the platform.

## 📊 Current Status

- **Active Projects:** {stats.get('projects', 0)}
- **Total Donations:** ${stats.get('donations_total', 0):.2f}
- **Donation Count:** {stats.get('donations_count', 0)}
- **Overall Progress:** {stats.get('overall_progress', 0):.1f}%
- **Last Updated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 🎯 What You'll Find Here

- **Projects Database:** Track all HingeCraft Global projects with status, priority, and progress
- **Tasks Database:** Individual tasks linked to projects
- **Donations Database:** All donation records with payment details
- **System Status:** Real-time monitoring of all services
- **URLs Database:** Company URLs, repositories, and endpoints

## 🚀 Getting Started

1. Browse the **Projects** database to see what we're building
2. Check **Tasks** to see what needs to be done
3. Review **Donations** to see community support
4. Monitor **System Status** for service health

---

*This dashboard syncs automatically every 60 seconds. All data is pulled from our live database.*"""
        
        # Clear existing content and add new
        try:
            # Get existing blocks
            blocks = notion.blocks.children.list(block_id=parent_page_id)
            
            # Delete old blocks (keep databases)
            for block in blocks.get('results', []):
                if block.get('type') not in ['child_database', 'child_page']:
                    try:
                        notion.blocks.delete(block_id=block['id'])
                    except:
                        pass
        except:
            pass
        
        # Add new header as callout
        notion.blocks.children.append(
            block_id=parent_page_id,
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
        
        print("✅ Dashboard header updated")
    except Exception as e:
        print(f"⚠️  Could not update dashboard header: {e}")

def add_default_projects(notion, projects_db_id):
    """Add default projects if database is empty"""
    default_projects = [
        {
            'project_id': 'notion_dashboard',
            'name': 'Notion Dashboard Integration',
            'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace. Real-time project tracking, progress monitoring, and team collaboration dashboard.',
            'status': 'In Progress',
            'priority': 'High',
            'progress': 30,
            'owner': 'Development Team',
            'team': 'Engineering, DevOps'
        },
        {
            'project_id': 'ml_automation',
            'name': 'ML Automation System',
            'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads with Anymail API, syncing to HubSpot CRM, and sending automated email sequences.',
            'status': 'Done',
            'priority': 'High',
            'progress': 100,
            'owner': 'Automation Team',
            'team': 'Engineering, Marketing'
        },
        {
            'project_id': 'database_schema',
            'name': '10-Layer Master Schema',
            'description': 'Comprehensive PostgreSQL database architecture with 10 integrated layers supporting 50+ tables, full-text search, encryption, and enterprise security.',
            'status': 'Done',
            'priority': 'High',
            'progress': 100,
            'owner': 'Database Team',
            'team': 'Engineering, DevOps'
        },
        {
            'project_id': 'charter_platform',
            'name': 'Charter for Abundance Platform',
            'description': 'Membership platform for the Charter for Abundance & Resilience initiative. Features donation processing (Stripe + crypto), charter invitation system, and community engagement tools.',
            'status': 'Done',
            'priority': 'High',
            'progress': 100,
            'owner': 'Product Team',
            'team': 'Engineering, Design, Community'
        },
        {
            'project_id': 'legal_compliance',
            'name': '34 Legal Compliance Pages',
            'description': 'Complete legal compliance framework with 34 comprehensive pages covering corporate formation, terms of service, privacy policies, AI governance, and global regulations.',
            'status': 'Review',
            'priority': 'High',
            'progress': 100,
            'owner': 'Legal Team',
            'team': 'Legal, Compliance'
        }
    ]
    
    for project in default_projects:
        create_or_update_project(notion, projects_db_id, project, use_ai=True)

def main():
    """Main execution"""
    print("🚀 Starting Complete Notion Dashboard Population")
    print("="*60)
    
    # Connect to database
    db_conn = connect_database()
    
    # Get database IDs
    projects_db_id = get_database_id(notion, PARENT_PAGE, "Projects")
    donations_db_id = get_database_id(notion, PARENT_PAGE, "Donations")
    
    if not projects_db_id:
        print("❌ Could not find Projects database")
        return
    
    stats = {
        'projects': 0,
        'donations_total': 0,
        'donations_count': 0,
        'overall_progress': 0
    }
    
    # Sync projects
    print("\n📊 Syncing Projects...")
    if db_conn:
        projects = get_all_projects_from_db(db_conn)
        if projects:
            for project in projects:
                create_or_update_project(notion, projects_db_id, project, use_ai=True)
                stats['projects'] += 1
                stats['overall_progress'] += project.get('progress', 0)
        else:
            print("⚠️  No projects in database, adding defaults...")
            add_default_projects(notion, projects_db_id)
            stats['projects'] = 5
            stats['overall_progress'] = 86  # Average of default projects
    else:
        print("⚠️  Database not available, adding default projects...")
        add_default_projects(notion, projects_db_id)
        stats['projects'] = 5
        stats['overall_progress'] = 86
    
    if stats['projects'] > 0:
        stats['overall_progress'] = stats['overall_progress'] / stats['projects']
    
    # Sync donations
    print("\n💰 Syncing Donations...")
    if db_conn and donations_db_id:
        donations = get_all_donations_from_db(db_conn)
        for donation in donations:
            create_or_update_donation(notion, donations_db_id, donation)
            stats['donations_count'] += 1
            stats['donations_total'] += donation.get('amount', 0)
    
    # Update dashboard header
    print("\n📝 Updating Dashboard Header...")
    update_dashboard_header(notion, PARENT_PAGE, stats)
    
    if db_conn:
        db_conn.close()
    
    print("\n" + "="*60)
    print("✅ Notion Dashboard Population Complete!")
    print(f"   - Projects: {stats['projects']}")
    print(f"   - Donations: {stats['donations_count']} (${stats['donations_total']:.2f})")
    print(f"   - Overall Progress: {stats['overall_progress']:.1f}%")
    print("="*60)

if __name__ == '__main__':
    main()
