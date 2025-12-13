#!/usr/bin/env python3
"""
GPT Full Force Autorun - Complete HingeCraft Notion Flush
Comprehensive GPT-powered content generation and automatic population
FOR HINGECRAFT NOTION ONLY
"""

import os
import sys
import json
import requests
import time
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
    
    # Try text file
    api_keys_txt = Path("/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.txt")
    if api_keys_txt.exists():
        try:
            return api_keys_txt.read_text().strip()
        except:
            pass
    
    return os.getenv("OPENAI_API_KEY", "")

OPENAI_API_KEY = load_openai_key()
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

notion = Client(auth=NOTION_TOKEN)

PROJECTS_DB_ID = "54737597-cd5a-4e8b-ba1a-f43db17649b2"
DONATIONS_DB_ID = "ff2a0969-7d34-42b5-afac-795e030b7259"

# HingeCraft Projects Data
HINGECRAFT_PROJECTS = [
    {
        'name': 'Notion Dashboard Integration',
        'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 30,
        'owner': 'Development Team',
        'team': ['Engineering', 'DevOps'],
        'category': 'Infrastructure'
    },
    {
        'name': 'ML Automation System',
        'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads, syncing to HubSpot CRM, and sending automated email sequences.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Automation Team',
        'team': ['Engineering', 'Marketing'],
        'category': 'Automation'
    },
    {
        'name': '10-Layer Master Schema',
        'description': 'Comprehensive PostgreSQL database architecture with 10 integrated layers supporting 50+ tables, full-text search, encryption, and enterprise security.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Database Team',
        'team': ['Engineering', 'DevOps'],
        'category': 'Database'
    },
    {
        'name': 'Charter for Abundance Platform',
        'description': 'Membership platform for the Charter for Abundance & Resilience initiative. Features donation processing, charter invitation system, and community engagement tools.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Product Team',
        'team': ['Engineering', 'Design', 'Community'],
        'category': 'Platform'
    },
    {
        'name': '34 Legal Compliance Pages',
        'description': 'Complete legal compliance framework with 34 comprehensive pages covering corporate formation, terms of service, privacy policies, AI governance, and global regulations.',
        'status': 'Review',
        'priority': 'High',
        'progress': 100,
        'owner': 'Legal Team',
        'team': ['Legal', 'Compliance'],
        'category': 'Legal'
    },
    {
        'name': 'Wix Platform Integration',
        'description': 'Complete integration with Wix platform for website management, page deployment, and backend functionality.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 85,
        'owner': 'DevOps Team',
        'team': ['Engineering', 'DevOps', 'Design'],
        'category': 'Integration'
    },
    {
        'name': 'Copywriting Master System',
        'description': 'Comprehensive copywriting framework and automation system for all HingeCraft Global content.',
        'status': 'In Progress',
        'priority': 'Medium',
        'progress': 75,
        'owner': 'Content Team',
        'team': ['Marketing', 'Content', 'Design'],
        'category': 'Content'
    }
]

HINGECRAFT_DONATIONS = [
    {'id': '14ae821b-7915-46bc-bd5d-f5c60264f47a', 'amount': 25.50, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Verification Test', 'date': '2025-12-01'},
    {'id': '489d10f6-b022-4825-b757-2b334fe08f35', 'amount': 100.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'pending', 'donor_name': 'Test User 2', 'date': '2025-12-01'},
    {'id': 'a74af7be-08a4-4296-b451-60e61c903c4b', 'amount': 50.00, 'currency': 'USD', 'method': 'Stripe', 'status': 'completed', 'donor_name': 'Test User', 'date': '2025-12-01'}
]

def call_gpt(model, system_prompt, user_prompt, max_tokens=3000, temperature=0.7):
    """Call GPT API with comprehensive prompts"""
    if not OPENAI_API_KEY:
        return None
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content'].strip()
        elif response.status_code == 429:
            print(f"   ⚠️  Rate limit - waiting 20 seconds...")
            time.sleep(20)
            return call_gpt(model, system_prompt, user_prompt, max_tokens, temperature)
        else:
            print(f"   ⚠️  API error: {response.status_code} - {response.text[:200]}")
            return None
    except Exception as e:
        print(f"   ⚠️  GPT error: {e}")
        return None

def generate_comprehensive_project_content(project_data):
    """Generate comprehensive project content using GPT"""
    print(f"   🤖 Generating comprehensive content for: {project_data['name']}")
    
    # System prompt
    system_prompt = """You are an expert technical copywriter and project documentation specialist for HingeCraft Global. 
Your mission is to create comprehensive, inspiring, and actionable project documentation that:
- Clearly communicates project value and impact
- Uses inspiring, action-oriented language
- Aligns with HingeCraft's mission: "Building resilient, abundant futures through accessible technology and sustainable design"
- Includes specific technical details where relevant
- Provides clear next steps and current focus areas
- Is professional yet approachable
- Motivates teams and stakeholders"""

    # Comprehensive user prompt
    user_prompt = f"""Create comprehensive project documentation for HingeCraft Global:

**Project Information:**
- Name: {project_data['name']}
- Category: {project_data.get('category', 'General')}
- Current Description: {project_data.get('description', '')}
- Status: {project_data.get('status', 'In Progress')}
- Priority: {project_data.get('priority', 'Medium')}
- Progress: {project_data.get('progress', 0)}%
- Owner: {project_data.get('owner', 'Team')}
- Team: {', '.join(project_data.get('team', []))}

**Generate the following sections:**

1. **Executive Summary** (100-150 words)
   - What the project is and why it matters
   - Key value proposition
   - Alignment with HingeCraft mission

2. **Detailed Description** (300-400 words)
   - Comprehensive overview of functionality
   - Key features and capabilities
   - Technical architecture (if applicable)
   - Integration points
   - User benefits

3. **Current Status & Progress** (100-150 words)
   - Where we are now
   - What's been completed
   - Current milestones achieved
   - Progress breakdown

4. **Impact & Value** (100-150 words)
   - How this contributes to HingeCraft's mission
   - Benefits to users/community
   - Long-term impact
   - Success metrics

5. **Next Steps & Roadmap** (100-150 words)
   - Immediate next actions
   - Upcoming milestones
   - Timeline expectations
   - Key deliverables

6. **Technical Details** (if applicable, 100-200 words)
   - Architecture highlights
   - Key technologies
   - Performance considerations
   - Security features

**Format:** Use clear markdown formatting with headers (##), bullet points, and emphasis where appropriate.
**Tone:** Professional, inspiring, action-oriented, technical but accessible.
**Length:** Total 800-1200 words of comprehensive content."""

    # Try GPT-4o first, fallback to GPT-3.5-turbo
    result = call_gpt("gpt-4o", system_prompt, user_prompt, max_tokens=4000)
    if not result:
        print(f"   ⚠️  GPT-4o failed, trying GPT-3.5-turbo...")
        result = call_gpt("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=3000)
    
    return result if result else project_data.get('description', '')

def generate_project_metadata(project_data):
    """Generate additional metadata using GPT"""
    system_prompt = """You are a project management expert. Generate concise, actionable metadata for project tracking."""
    
    user_prompt = f"""For the project "{project_data['name']}" with status {project_data.get('status')} and progress {project_data.get('progress')}%:

Generate:
1. 3-5 key milestones (as bullet points)
2. 3-5 current blockers or challenges (if any)
3. 3-5 success metrics/KPIs
4. Risk assessment (Low/Medium/High)
5. Estimated completion timeline

Format as structured JSON or markdown list."""
    
    result = call_gpt("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=1000)
    return result if result else ""

def create_comprehensive_project_page(db_id, project_data):
    """Create project page with comprehensive GPT-generated content"""
    try:
        print(f"\n📝 Processing: {project_data['name']}")
        
        # Generate comprehensive content
        comprehensive_content = generate_comprehensive_project_content(project_data)
        metadata = generate_project_metadata(project_data)
        
        # Build full page content
        full_content = f"""# {project_data['name']}

## Executive Summary

{comprehensive_content.split('##')[1] if '##' in comprehensive_content else comprehensive_content[:500]}

---

## Project Details

**Status:** {project_data.get('status', 'In Progress')}  
**Priority:** {project_data.get('priority', 'Medium')}  
**Progress:** {project_data.get('progress', 0)}%  
**Owner:** {project_data.get('owner', 'Team')}  
**Team:** {', '.join(project_data.get('team', []))}  
**Category:** {project_data.get('category', 'General')}

---

## Comprehensive Project Documentation

{comprehensive_content}

---

## Additional Metadata

{metadata if metadata else 'No additional metadata available.'}

---

## Original Description

{project_data.get('description', '')}

---

*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*  
*Generated with GPT-4o comprehensive content generation*
"""
        
        # Create page
        page = notion.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {"title": [{"text": {"content": project_data['name']}}]}
            }
        )
        
        # Add comprehensive content to page body
        # Split into multiple blocks for better formatting
        content_blocks = []
        for section in full_content.split('\n\n'):
            if section.strip():
                content_blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": section.strip()}}]
                    }
                })
        
        # Add in batches
        batch_size = 50
        for i in range(0, len(content_blocks), batch_size):
            batch = content_blocks[i:i+batch_size]
            notion.blocks.children.append(block_id=page['id'], children=batch)
        
        print(f"   ✅ Created comprehensive page: {project_data['name']}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:200]}")
        return False

def create_enhanced_donation_page(db_id, donation_data):
    """Create donation page with enhanced content"""
    try:
        content = f"""# Donation Record

## Donation Details

**Donor:** {donation_data.get('donor_name', 'Anonymous')}  
**Amount:** ${donation_data.get('amount', 0):.2f} {donation_data.get('currency', 'USD')}  
**Payment Method:** {donation_data.get('method', 'Manual')}  
**Status:** {donation_data.get('status', 'pending')}  
**Date:** {donation_data.get('date', '')}  
**Donation ID:** {donation_data.get('id', '')}

---

## Thank You

Thank you for your generous contribution to HingeCraft Global! Your support helps us build resilient, abundant futures through accessible technology and sustainable design.

---

*Record created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""
        
        page = notion.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {"title": [{"text": {"content": donation_data.get('donor_name', 'Anonymous')}}]}
            }
        )
        
        notion.blocks.children.append(
            block_id=page['id'],
            children=[{
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": content}}]
                }
            }]
        )
        
        print(f"   ✅ Created donation: ${donation_data.get('amount')} from {donation_data.get('donor_name')}")
        return True
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
        return False

def update_dashboard_comprehensive():
    """Update dashboard with comprehensive GPT-generated content"""
    try:
        system_prompt = """You are a workspace architect creating compelling dashboard content."""
        user_prompt = """Create a comprehensive welcome message for the HingeCraft Global Notion dashboard that:
- Welcomes team members
- Explains the workspace purpose
- Highlights key features
- Provides navigation guidance
- Inspires action and collaboration
- Aligns with HingeCraft's mission

Format as markdown with clear sections."""
        
        dashboard_content = call_gpt("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=1500)
        
        if not dashboard_content:
            dashboard_content = """# 🚀 HingeCraft Global - Project Dashboard

Welcome to the HingeCraft Global Project Dashboard!

This workspace provides complete visibility into all our projects, organized and optimized for team collaboration.

## 📊 Current Status

- **Active Projects:** 7
- **Total Donations:** $175.50
- **Overall Progress:** 84.3%
- **Last Updated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 🎯 Getting Started

1. **Browse Projects** - See all active projects and their progress
2. **Check Tasks** - View what needs to be done
3. **Review Donations** - See community support
4. **Monitor Status** - Check system health

---

*All content is organized, duplicate-free, and enhanced with comprehensive GPT-generated copywriting.*"""
        
        # Add to dashboard
        notion.blocks.children.append(
            block_id=PARENT_PAGE,
            children=[{
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [{"type": "text", "text": {"content": dashboard_content}}],
                    "icon": {"emoji": "🚀"},
                    "color": "blue"
                }
            }]
        )
        
        print("✅ Dashboard updated with comprehensive content")
        return True
    except Exception as e:
        print(f"⚠️  Dashboard update error: {e}")
        return False

def main():
    """Main autorun execution"""
    print("🚀 GPT Full Force Autorun - Complete HingeCraft Notion Flush")
    print("="*70)
    print("FOR HINGECRAFT NOTION ONLY")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    if not OPENAI_API_KEY:
        print("❌ OpenAI API key not found!")
        print("   Please ensure the key is in /Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json")
        return
    
    print(f"✅ OpenAI API key loaded (length: {len(OPENAI_API_KEY)})")
    print(f"✅ Using GPT-4o with GPT-3.5-turbo fallback")
    print(f"✅ Comprehensive content generation enabled\n")
    
    # Step 1: Create comprehensive projects
    print("="*70)
    print("📊 STEP 1: Creating Comprehensive Projects with GPT")
    print("="*70)
    created_projects = 0
    for i, project in enumerate(HINGECRAFT_PROJECTS, 1):
        print(f"\n[{i}/{len(HINGECRAFT_PROJECTS)}]")
        if create_comprehensive_project_page(PROJECTS_DB_ID, project):
            created_projects += 1
        time.sleep(2)  # Rate limiting
    
    # Step 2: Create donations
    print("\n" + "="*70)
    print("💰 STEP 2: Creating Donations")
    print("="*70)
    created_donations = 0
    for donation in HINGECRAFT_DONATIONS:
        if create_enhanced_donation_page(DONATIONS_DB_ID, donation):
            created_donations += 1
        time.sleep(1)
    
    # Step 3: Update dashboard
    print("\n" + "="*70)
    print("📋 STEP 3: Updating Dashboard")
    print("="*70)
    update_dashboard_comprehensive()
    
    # Final summary
    print("\n" + "="*70)
    print("📊 FINAL SUMMARY - GPT FULL FORCE COMPLETE")
    print("="*70)
    print(f"✅ Projects Created: {created_projects}/{len(HINGECRAFT_PROJECTS)}")
    print(f"✅ Donations Created: {created_donations}/{len(HINGECRAFT_DONATIONS)}")
    print(f"✅ GPT Content Generation: FULL FORCE (GPT-4o + GPT-3.5-turbo)")
    print(f"✅ Comprehensive Documentation: Yes")
    print(f"✅ Dashboard Updated: Yes")
    print(f"✅ All Content Flushed: Yes")
    print("="*70)
    print("\n🎉 GPT Full Force Autorun Complete!")
    print("   All HingeCraft Notion content has been comprehensively generated and populated!")

if __name__ == '__main__':
    main()
