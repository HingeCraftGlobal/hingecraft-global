#!/usr/bin/env python3
"""
Simple HingeCraft Notion Population
Uses only Name property (which exists) and adds full content in page body
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

# Load OpenAI key
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

PROJECTS_DB_ID = "54737597-cd5a-4e8b-ba1a-f43db17649b2"
DONATIONS_DB_ID = "ff2a0969-7d34-42b5-afac-795e030b7259"

def generate_gpt_copywriting(project_data):
    """Generate comprehensive copywriting"""
    if not OPENAI_API_KEY:
        return project_data.get('description', '')
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Write comprehensive copywriting for HingeCraft Global project in Notion.

Project: {project_data.get('name', '')}
Description: {project_data.get('description', '')}
Status: {project_data.get('status', 'In Progress')}
Progress: {project_data.get('progress', 0)}%
Team: {', '.join(project_data.get('team', []))}

Create a complete description (250-350 words) with:
1. Clear explanation of what it does
2. Key features and benefits
3. Current status and progress
4. Impact on HingeCraft's mission
5. Next steps

Use inspiring, action-oriented language aligned with: Building resilient, abundant futures through accessible technology and sustainable design."""
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "Expert copywriter for HingeCraft Global. Write clear, inspiring content."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content'].strip()
        elif response.status_code == 429:
            print(f"   ⚠️  API quota exceeded")
    except:
        pass
    
    return project_data.get('description', '')

# Projects
PROJECTS = [
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

DONATIONS = [
    {'id': '14ae821b-7915-46bc-bd5d-f5c60264f47a', 'amount': 25.50, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Verification Test', 'date': '2025-12-01'},
    {'id': '489d10f6-b022-4825-b757-2b334fe08f35', 'amount': 100.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'pending', 'donor_name': 'Test User 2', 'date': '2025-12-01'},
    {'id': 'a74af7be-08a4-4296-b451-60e61c903c4b', 'amount': 50.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Test User', 'date': '2025-12-01'}
]

def create_project_with_content(db_id, project_data):
    """Create project page with full content in body"""
    try:
        # Generate copywriting
        print(f"   ✍️  Generating copywriting: {project_data['name']}")
        enhanced_desc = generate_gpt_copywriting(project_data)
        
        # Build full content
        full_content = f"""## Project Overview

{enhanced_desc}

## Project Details

**Status:** {project_data.get('status', 'In Progress')}
**Priority:** {project_data.get('priority', 'Medium')}
**Progress:** {project_data.get('progress', 0)}%
**Owner:** {project_data.get('owner', 'Team')}
**Team:** {', '.join(project_data.get('team', []))}

## Description

{project_data.get('description', '')}

---

*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""
        
        # Create page with just Name
        page = notion.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {"title": [{"text": {"content": project_data['name']}}]}
            }
        )
        
        # Add content to page body
        notion.blocks.children.append(
            block_id=page['id'],
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": full_content}}]
                    }
                }
            ]
        )
        
        print(f"   ✅ Created: {project_data['name']}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
        return False

def create_donation_with_content(db_id, donation_data):
    """Create donation page"""
    try:
        content = f"""**Amount:** ${donation_data.get('amount', 0):.2f} {donation_data.get('currency', 'USD')}
**Method:** {donation_data.get('method', 'Manual')}
**Status:** {donation_data.get('status', 'pending')}
**Date:** {donation_data.get('date', '')}
**Donation ID:** {donation_data.get('id', '')}"""
        
        page = notion.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {"title": [{"text": {"content": donation_data.get('donor_name', 'Anonymous')}}]}
            }
        )
        
        notion.blocks.children.append(
            block_id=page['id'],
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}]
                    }
                }
            ]
        )
        
        print(f"   ✅ Created: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
        return False

def main():
    """Main execution"""
    print("🚀 HingeCraft Notion Population - Simple Method")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    if OPENAI_API_KEY:
        print(f"✅ OpenAI API key loaded")
    else:
        print("⚠️  OpenAI API key not found - using original descriptions")
    
    # Create projects
    print(f"\n📊 Creating {len(PROJECTS)} projects...")
    created_projects = 0
    for project in PROJECTS:
        if create_project_with_content(PROJECTS_DB_ID, project):
            created_projects += 1
    
    # Create donations
    print(f"\n💰 Creating {len(DONATIONS)} donations...")
    created_donations = 0
    for donation in DONATIONS:
        if create_donation_with_content(DONATIONS_DB_ID, donation):
            created_donations += 1
    
    # Summary
    print("\n" + "="*70)
    print("📊 SUMMARY")
    print("="*70)
    print(f"✅ Projects: {created_projects}/{len(PROJECTS)}")
    print(f"✅ Donations: {created_donations}/{len(DONATIONS)}")
    print(f"✅ GPT Copywriting: {'Yes' if OPENAI_API_KEY else 'No'}")
    print("="*70)
    print("\n🎉 Complete!")

if __name__ == '__main__':
    main()
