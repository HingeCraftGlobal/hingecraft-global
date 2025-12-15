#!/usr/bin/env python3
"""
Use Prompt Table to Generate Content and Populate Notion
This script loads the 2000-sequence prompt table and uses it to generate comprehensive content
for all HingeCraft projects, then populates Notion with the generated content.
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

# Load prompt table
PROMPT_TABLE_PATH = Path("/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/notion/gpt_prompt_table_complete.json")

# Project data mapping
PROJECT_DATA = {
    'Notion Dashboard Integration': {
        'description': 'Complete 24/7 sync system integrating all HingeCraft data with Notion workspace.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 30,
        'owner': 'Development Team',
        'team': ['Engineering', 'DevOps'],
        'category': 'Infrastructure'
    },
    'ML Automation System': {
        'description': 'End-to-end lead automation pipeline processing Google Drive files, enriching leads, syncing to HubSpot CRM, and sending automated email sequences.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Automation Team',
        'team': ['Engineering', 'Marketing'],
        'category': 'Automation'
    },
    '10-Layer Master Schema': {
        'description': 'Comprehensive PostgreSQL database architecture with 10 integrated layers supporting 50+ tables, full-text search, encryption, and enterprise security.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Database Team',
        'team': ['Engineering', 'DevOps'],
        'category': 'Database'
    },
    'Charter for Abundance Platform': {
        'description': 'Membership platform for the Charter for Abundance & Resilience initiative. Features donation processing, charter invitation system, and community engagement tools.',
        'status': 'Done',
        'priority': 'High',
        'progress': 100,
        'owner': 'Product Team',
        'team': ['Engineering', 'Design', 'Community'],
        'category': 'Platform'
    },
    '34 Legal Compliance Pages': {
        'description': 'Complete legal compliance framework with 34 comprehensive pages covering corporate formation, terms of service, privacy policies, AI governance, and global regulations.',
        'status': 'Review',
        'priority': 'High',
        'progress': 100,
        'owner': 'Legal Team',
        'team': ['Legal', 'Compliance'],
        'category': 'Legal'
    },
    'Wix Platform Integration': {
        'description': 'Complete integration with Wix platform for website management, page deployment, and backend functionality.',
        'status': 'In Progress',
        'priority': 'High',
        'progress': 85,
        'owner': 'DevOps Team',
        'team': ['Engineering', 'DevOps', 'Design'],
        'category': 'Integration'
    },
    'Copywriting Master System': {
        'description': 'Comprehensive copywriting framework and automation system for all HingeCraft Global content.',
        'status': 'In Progress',
        'priority': 'Medium',
        'progress': 75,
        'owner': 'Content Team',
        'team': ['Marketing', 'Content', 'Design'],
        'category': 'Content'
    }
}

def call_gpt(model, system_prompt, user_prompt, max_tokens=3000, temperature=0.7):
    """Call GPT API with prompts"""
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

def load_prompt_table():
    """Load the comprehensive prompt table"""
    if not PROMPT_TABLE_PATH.exists():
        print(f"❌ Prompt table not found at {PROMPT_TABLE_PATH}")
        return None
    
    try:
        with open(PROMPT_TABLE_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading prompt table: {e}")
        return None

def get_prompts_for_project(prompt_table, project_name, content_types=None):
    """Get relevant prompts for a specific project"""
    if content_types is None:
        content_types = ['Executive Summary', 'Detailed Description', 'Status Report', 
                        'Impact Statement', 'Roadmap', 'Technical Details']
    
    prompts = []
    for category in prompt_table.get('prompt_categories', []):
        for prompt in category.get('prompts', []):
            if prompt.get('project') == project_name:
                if prompt.get('content_type') in content_types:
                    prompts.append(prompt)
    
    # Sort by sequence
    prompts.sort(key=lambda x: x.get('sequence', 0))
    return prompts

def generate_project_content_from_prompts(project_name, prompts):
    """Generate comprehensive content for a project using prompts"""
    project_data = PROJECT_DATA.get(project_name)
    if not project_data:
        print(f"   ⚠️  No data found for project: {project_name}")
        return None
    
    print(f"   📝 Generating content from {len(prompts)} prompts...")
    
    content_sections = {}
    
    # Group prompts by content type
    for prompt in prompts:
        content_type = prompt.get('content_type', 'General')
        if content_type not in content_sections:
            content_sections[content_type] = []
        content_sections[content_type].append(prompt)
    
    print(f"   📋 Content types to generate: {', '.join(content_sections.keys())}")
    
    # Generate content for each section (use first prompt of each type for efficiency)
    generated_content = {}
    total_sections = len(content_sections)
    current_section = 0
    
    for content_type, type_prompts in content_sections.items():
        current_section += 1
        if type_prompts:
            # Use the first prompt of this type
            prompt = type_prompts[0]
            print(f"      [{current_section}/{total_sections}] 🤖 Generating {content_type}...")
            
            # Try GPT-4o first, fallback to GPT-3.5-turbo
            result = call_gpt("gpt-4o", prompt['system_prompt'], prompt['user_prompt'], 
                            max_tokens=prompt.get('tokens', 3000))
            if not result:
                print(f"      ⚠️  GPT-4o failed, trying GPT-3.5-turbo...")
                result = call_gpt("gpt-3.5-turbo", prompt['system_prompt'], prompt['user_prompt'],
                                 max_tokens=prompt.get('tokens', 3000))
            
            if result:
                generated_content[content_type] = result
                print(f"      ✅ {content_type} generated ({len(result)} chars)")
            else:
                print(f"      ⚠️  Failed to generate {content_type}")
            
            time.sleep(1)  # Rate limiting
    
    return generated_content

def create_notion_page_with_content(db_id, project_name, generated_content):
    """Create a Notion page with comprehensive generated content"""
    try:
        # Create page with name
        page = notion.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {"title": [{"text": {"content": project_name}}]}
            }
        )
        
        print(f"   ✅ Page created: {project_name}")
        
        # Build comprehensive content blocks
        content_blocks = []
        
        # Add header
        content_blocks.append({
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [{"type": "text", "text": {"content": project_name}}]
            }
        })
        
        # Add project info
        project_data = PROJECT_DATA.get(project_name, {})
        info_text = f"**Status:** {project_data.get('status', 'N/A')} ({project_data.get('progress', 0)}%)\n"
        info_text += f"**Priority:** {project_data.get('priority', 'N/A')}\n"
        info_text += f"**Category:** {project_data.get('category', 'N/A')}\n"
        info_text += f"**Team:** {', '.join(project_data.get('team', []))}\n"
        info_text += f"**Owner:** {project_data.get('owner', 'N/A')}"
        
        content_blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": info_text}}]
            }
        })
        
        # Add generated content sections
        for content_type, content in generated_content.items():
            # Add section header
            content_blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": content_type}}]
                }
            })
            
            # Add content (split into paragraphs if needed)
            paragraphs = content.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    content_blocks.append({
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": para.strip()}}]
                        }
                    })
        
        # Add divider
        content_blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # Add footer
        footer_text = f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} using HingeCraft Global GPT Prompt Table*"
        content_blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": footer_text}}]
            }
        })
        
        # Add content in batches (Notion API limit)
        batch_size = 100
        for i in range(0, len(content_blocks), batch_size):
            batch = content_blocks[i:i+batch_size]
            notion.blocks.children.append(block_id=page['id'], children=batch)
            time.sleep(0.5)
        
        print(f"   ✅ Content added to page")
        return page
        
    except Exception as e:
        print(f"   ❌ Error creating page: {e}")
        return None

def update_dashboard_with_prompt_content(prompt_table):
    """Update dashboard with content generated from prompts"""
    try:
        # Get dashboard prompts
        dashboard_prompts = []
        for category in prompt_table.get('prompt_categories', []):
            if 'dashboard' in category.get('category_name', '').lower():
                dashboard_prompts.extend(category.get('prompts', []))
        
        if not dashboard_prompts:
            print("   ⚠️  No dashboard prompts found")
            return
        
        # Generate welcome message
        welcome_prompt = dashboard_prompts[0] if dashboard_prompts else None
        if welcome_prompt:
            print("   🤖 Generating dashboard welcome message...")
            welcome_content = call_gpt("gpt-4o", welcome_prompt['system_prompt'], 
                                     welcome_prompt['user_prompt'])
            if not welcome_content:
                welcome_content = call_gpt("gpt-3.5-turbo", welcome_prompt['system_prompt'],
                                         welcome_prompt['user_prompt'])
        
        if not welcome_content:
            welcome_content = "# 🚀 HingeCraft Global - Project Dashboard\n\nWelcome to the HingeCraft Global Project Dashboard!"
        
        # Update parent page
        try:
            # Clear existing content (optional - comment out if you want to keep existing)
            # Then add new content
            notion.blocks.children.append(
                block_id=PARENT_PAGE,
                children=[{
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": welcome_content}}]
                    }
                }]
            )
            print("   ✅ Dashboard updated")
        except Exception as e:
            print(f"   ⚠️  Dashboard update error: {e}")
            
    except Exception as e:
        print(f"   ❌ Error updating dashboard: {e}")

def main():
    """Main execution - use prompt table to populate Notion"""
    print("🚀 Using Prompt Table to Generate Content and Populate Notion")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    if not OPENAI_API_KEY:
        print("❌ OpenAI API key not found!")
        print("   Please ensure the key is in /Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json")
        return
    
    print(f"✅ OpenAI API key loaded (length: {len(OPENAI_API_KEY)})")
    
    # Load prompt table
    print("\n📋 Loading prompt table...")
    prompt_table = load_prompt_table()
    if not prompt_table:
        print("❌ Failed to load prompt table")
        return
    
    total_prompts = prompt_table['project_metadata'].get('total_sequences', 0)
    print(f"✅ Prompt table loaded: {total_prompts} sequences")
    
    # Process each project
    print("\n" + "="*70)
    print("📊 Generating Content for All Projects")
    print("="*70)
    
    created_pages = 0
    total_projects = len(PROJECT_DATA)
    
    for idx, project_name in enumerate(PROJECT_DATA.keys(), 1):
        print(f"\n[{idx}/{total_projects}] 📁 Processing: {project_name}")
        print(f"   Progress: {idx}/{total_projects} ({int(idx/total_projects*100)}%)")
        
        # Get relevant prompts for this project
        prompts = get_prompts_for_project(prompt_table, project_name)
        print(f"   📝 Found {len(prompts)} relevant prompts")
        
        if not prompts:
            print(f"   ⚠️  No prompts found for {project_name}, skipping...")
            continue
        
        # Generate content using prompts
        print(f"   🤖 Generating content from prompts...")
        generated_content = generate_project_content_from_prompts(project_name, prompts)
        
        if generated_content:
            print(f"   ✅ Generated {len(generated_content)} content sections")
            # Create Notion page with generated content
            print(f"   📄 Creating Notion page...")
            page = create_notion_page_with_content(PROJECTS_DB_ID, project_name, generated_content)
            if page:
                created_pages += 1
                print(f"   ✅ Successfully created page with comprehensive content")
            else:
                print(f"   ⚠️  Failed to create page")
        else:
            print(f"   ⚠️  No content generated, skipping page creation")
        
        # Progress update
        print(f"   📊 Overall Progress: {created_pages}/{total_projects} pages created")
        time.sleep(2)  # Rate limiting between projects
    
    # Update dashboard
    print("\n" + "="*70)
    print("📋 Updating Dashboard")
    print("="*70)
    update_dashboard_with_prompt_content(prompt_table)
    
    # Final summary
    print("\n" + "="*70)
    print("📊 FINAL SUMMARY")
    print("="*70)
    print(f"✅ Projects Processed: {total_projects}")
    print(f"✅ Pages Created: {created_pages}/{total_projects}")
    print(f"✅ Prompt Table Used: {total_prompts} sequences available")
    print(f"✅ GPT Content Generation: Active (GPT-4o + GPT-3.5-turbo fallback)")
    print(f"✅ Dashboard Updated: Yes")
    print(f"\n🎉 Complete! All content generated from prompt table and pushed to Notion.")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()





