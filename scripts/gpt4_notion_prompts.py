#!/usr/bin/env python3
"""
GPT-4 Multi-Prompt System for HingeCraft Notion Project
Generates and executes multiple prompts for complete Notion project development
"""

import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration - Load OpenAI key from api_keys directory (NOT ferguson-system)
def load_openai_key():
    """Load OpenAI API key from api_keys directory, avoiding ferguson-system"""
    # First try environment variable
    key = os.getenv("OPENAI_API_KEY")
    if key:
        return key
    
    # Try api_keys directory in CURSOR root (NOT ferguson-system)
    api_keys_path = Path("/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json")
    if api_keys_path.exists():
        try:
            with open(api_keys_path, 'r') as f:
                data = json.load(f)
                key = data.get("api_key") or data.get("OPENAI_API_KEY")
                if key:
                    print(f"✅ Loaded OpenAI key from: {api_keys_path}")
                    return key
        except Exception as e:
            print(f"⚠️  Could not read {api_keys_path}: {e}")
    
    # Try text file
    api_keys_txt = Path("/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.txt")
    if api_keys_txt.exists():
        try:
            key = api_keys_txt.read_text().strip()
            if key:
                print(f"✅ Loaded OpenAI key from: {api_keys_txt}")
                return key
        except Exception as e:
            print(f"⚠️  Could not read {api_keys_txt}: {e}")
    
    return None

OPENAI_API_KEY = load_openai_key()
DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK", "")
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

if OPENAI_API_KEY:
    print(f"✅ OpenAI API key configured (length: {len(OPENAI_API_KEY)})")
else:
    print("⚠️  OpenAI API key not found")

# Comprehensive prompt templates for Notion project
NOTION_PROJECT_PROMPTS = [
    {
        "id": "notion_architecture",
        "title": "Notion Architecture & Database Design",
        "prompt": """You are a Notion workspace architect for HingeCraft Global. Design a comprehensive Notion workspace architecture that includes:

1. **Database Structure**: Design 10 databases (Projects, Tasks, Donations, Leads, Content Pipeline, Team Tracker, Chat History, Timeline, System Status, URLs) with optimal property types, relations, and formulas.

2. **Page Hierarchy**: Create a logical page structure that makes it easy for team members to find information quickly.

3. **Views & Filters**: Design database views for different use cases (Active Projects, High Priority Tasks, Recent Donations, etc.)

4. **Automation**: Suggest Notion automation workflows for common tasks.

5. **Templates**: Create page templates for recurring project types.

Provide a detailed JSON structure with:
- Database schemas (properties, types, options)
- Page hierarchy structure
- View configurations
- Automation suggestions
- Template designs

Focus on: Scalability, Usability, Team Collaboration, Real-time Updates"""
    },
    {
        "id": "notion_content_generation",
        "title": "Content Generation for Notion Pages",
        "prompt": """Generate comprehensive content for all HingeCraft Global Notion pages:

**Projects Database Content:**
- Write detailed descriptions for each of the 7 major projects
- Include: Purpose, Current Status, Key Features, Technical Details, Impact, Next Steps
- Use inspiring, action-oriented language aligned with HingeCraft's mission

**Dashboard Content:**
- Welcome message for team members
- Getting started guide
- Quick links and resources
- Status overview with key metrics

**Documentation Pages:**
- Setup instructions
- API documentation
- Troubleshooting guides
- Best practices

**For each piece of content:**
- Use clear, professional language
- Include actionable information
- Add context and background
- Make it scannable with headers and lists
- Include examples where helpful

Generate content in markdown format ready for Notion."""
    },
    {
        "id": "notion_automation_workflows",
        "title": "Notion Automation Workflows",
        "prompt": """Design automation workflows for the HingeCraft Notion workspace:

1. **Project Status Updates**: Automatically update project status based on task completion
2. **Progress Calculation**: Auto-calculate project progress from task completion percentages
3. **Deadline Alerts**: Notify team members of approaching deadlines
4. **Donation Tracking**: Auto-update donation totals and send thank you notifications
5. **Task Assignment**: Automatically assign tasks based on team member availability
6. **Status Sync**: Sync status between Projects and Tasks databases
7. **Timeline Updates**: Auto-update timeline based on project milestones

For each workflow, provide:
- Trigger conditions
- Actions to perform
- Integration points (if external)
- Error handling
- Notification settings

Format as JSON with workflow definitions."""
    },
    {
        "id": "notion_data_migration",
        "title": "Data Migration & Population Strategy",
        "prompt": """Create a comprehensive data migration strategy for populating the HingeCraft Notion workspace:

**Data Sources:**
- PostgreSQL database (projects, donations, tasks)
- Git repository (commits, issues, documentation)
- Chat history files
- Task execution results
- System status from Docker

**Migration Tasks:**
1. Map database schema to Notion properties
2. Transform data formats (dates, numbers, relations)
3. Handle relationships between databases
4. Batch processing for large datasets
5. Error handling and retry logic
6. Progress tracking
7. Validation and verification

**Population Script:**
Generate Python code that:
- Connects to all data sources
- Transforms data appropriately
- Creates/updates Notion pages
- Handles errors gracefully
- Provides progress updates
- Logs all operations

Include: Code structure, error handling, rate limiting, batch processing."""
    },
    {
        "id": "notion_team_collaboration",
        "title": "Team Collaboration Features",
        "prompt": """Design team collaboration features for the HingeCraft Notion workspace:

1. **Team Workspaces**: Create dedicated spaces for different teams (Engineering, Marketing, Legal, etc.)
2. **Project Templates**: Standardized templates for new projects
3. **Meeting Notes**: Template for meeting notes with action items
4. **Status Reports**: Weekly/monthly status report templates
5. **Knowledge Base**: Organize documentation and resources
6. **Onboarding**: New team member onboarding checklist
7. **Communication**: Comment threads, mentions, notifications

For each feature:
- Design the structure
- Create templates
- Define workflows
- Set up permissions
- Add automation

Provide: Page structures, template content, workflow diagrams, permission settings."""
    },
    {
        "id": "notion_reporting_analytics",
        "title": "Reporting & Analytics Dashboard",
        "prompt": """Design reporting and analytics features for the HingeCraft Notion workspace:

**Metrics to Track:**
- Project completion rates
- Task velocity
- Donation trends
- Team productivity
- System health
- Timeline adherence

**Dashboard Views:**
1. Executive Summary: High-level KPIs
2. Project Status: All projects with progress
3. Team Performance: Individual and team metrics
4. Financial: Donations and budget tracking
5. System Health: Service status and uptime

**Reports:**
- Weekly project status
- Monthly team performance
- Quarterly impact report
- Annual summary

**Visualizations:**
- Progress charts
- Timeline views
- Status indicators
- Trend graphs

Generate: Dashboard layouts, formula configurations, view setups, report templates."""
    },
    {
        "id": "notion_integration_sync",
        "title": "External Integration & Sync Strategy",
        "prompt": """Design integration and sync strategy for connecting Notion with external systems:

**Integrations Needed:**
1. **PostgreSQL Database**: Real-time sync of projects, donations, tasks
2. **GitHub**: Commit tracking, issue sync, PR status
3. **Docker**: System status monitoring
4. **Wix**: Website content sync
5. **Email**: Notification system
6. **Discord**: Status updates and alerts

**Sync Architecture:**
- Polling intervals
- Webhook handlers
- Change detection
- Conflict resolution
- Error recovery
- Rate limiting

**Data Flow:**
- Source → Transform → Notion
- Notion → Transform → Destination
- Bidirectional sync where needed

**Implementation:**
Generate Python code for:
- API clients for each service
- Sync orchestrator
- Error handling
- Logging and monitoring
- Retry logic

Include: Architecture diagram, code structure, API endpoints, data mappings."""
    },
    {
        "id": "notion_ui_ux_optimization",
        "title": "Notion UI/UX Optimization",
        "prompt": """Optimize the Notion workspace UI/UX for maximum productivity and engagement:

**Design Principles:**
- Clean, organized layout
- Easy navigation
- Quick access to important info
- Visual hierarchy
- Consistent styling

**Page Design:**
1. **Dashboard**: Overview with key metrics and quick links
2. **Project Pages**: Rich content with embedded databases
3. **Task Boards**: Kanban-style views
4. **Timeline**: Calendar and Gantt views
5. **Resources**: Well-organized knowledge base

**Visual Elements:**
- Icons and emojis for quick scanning
- Color coding for status and priority
- Callout blocks for important info
- Dividers for organization
- Toggle lists for expandable content

**User Experience:**
- Onboarding flow for new users
- Tooltips and help text
- Keyboard shortcuts guide
- Mobile optimization tips

Generate: Page designs, styling guidelines, UX best practices, accessibility considerations."""
    }
]

def send_to_discord(message, title="HingeCraft Notion Update"):
    """Send message to Discord webhook"""
    if not DISCORD_WEBHOOK:
        print("⚠️  Discord webhook not configured")
        return False
    
    try:
        embed = {
            "title": title,
            "description": message,
            "color": 0x10b981,  # Green
            "timestamp": datetime.now().isoformat(),
            "footer": {
                "text": "HingeCraft Global - Notion Project"
            }
        }
        
        payload = {
            "embeds": [embed]
        }
        
        response = requests.post(DISCORD_WEBHOOK, json=payload)
        if response.status_code == 204:
            print(f"✅ Sent to Discord: {title}")
            return True
        else:
            print(f"⚠️  Discord error: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  Discord error: {e}")
        return False

def execute_gpt4_prompt(prompt_data):
    """Execute a GPT-4 prompt and get response using direct API calls"""
    if not OPENAI_API_KEY:
        print("⚠️  OpenAI API key not configured")
        return None
    
    try:
        print(f"\n🤖 Executing: {prompt_data['title']}")
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4o",  # Use gpt-4o (latest) or gpt-4-turbo-preview
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert Notion workspace architect and automation specialist working on the HingeCraft Global project. Provide detailed, actionable, and comprehensive responses."
                },
                {
                    "role": "user",
                    "content": prompt_data['prompt']
                }
            ],
            "max_tokens": 4000,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        
        data = response.json()
        result = data['choices'][0]['message']['content'].strip()
        print(f"✅ Generated response ({len(result)} chars)")
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"❌ API request error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_data = e.response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ GPT-4 error: {e}")
        return None

def save_prompt_result(prompt_id, result):
    """Save prompt result to file"""
    output_dir = Path(__file__).parent.parent / "notion" / "gpt4_outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / f"{prompt_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    with open(output_file, 'w') as f:
        f.write(f"# {prompt_id.replace('_', ' ').title()}\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write("---\n\n")
        f.write(result)
    
    print(f"💾 Saved to: {output_file}")
    return output_file

def main():
    """Main execution"""
    print("🚀 GPT-4 Multi-Prompt System for HingeCraft Notion Project")
    print("="*70)
    
    if not OPENAI_API_KEY:
        print("❌ OpenAI API key not found in environment")
        print("   Set OPENAI_API_KEY in .env file")
        return
    
    results = []
    
    # Execute all prompts
    for prompt_data in NOTION_PROJECT_PROMPTS:
        print(f"\n{'='*70}")
        print(f"📝 Processing: {prompt_data['title']}")
        print(f"{'='*70}")
        
        result = execute_gpt4_prompt(prompt_data)
        
        if result:
            # Save result
            output_file = save_prompt_result(prompt_data['id'], result)
            results.append({
                'id': prompt_data['id'],
                'title': prompt_data['title'],
                'result': result,
                'file': str(output_file)
            })
            
            # Send to Discord
            discord_message = f"**{prompt_data['title']}**\n\n{result[:500]}..."
            if len(result) > 500:
                discord_message += f"\n\n[Full response in file: {output_file.name}]"
            
            send_to_discord(discord_message, f"Notion Project: {prompt_data['title']}")
        else:
            print(f"⚠️  No result for {prompt_data['id']}")
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Processed: {len(results)}/{len(NOTION_PROJECT_PROMPTS)} prompts")
    print(f"💾 Outputs saved to: notion/gpt4_outputs/")
    
    # Save summary
    output_dir = Path(__file__).parent.parent / "notion" / "gpt4_outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    summary_file = output_dir / "SUMMARY.json"
    with open(summary_file, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_prompts': len(NOTION_PROJECT_PROMPTS),
            'completed': len(results),
            'results': [{'id': r['id'], 'title': r['title'], 'file': r['file']} for r in results]
        }, f, indent=2)
    
    print(f"📄 Summary saved to: {summary_file}")
    
    # Final Discord update
    send_to_discord(
        f"✅ Completed {len(results)}/{len(NOTION_PROJECT_PROMPTS)} GPT-4 prompts for Notion project\n\n"
        f"All outputs saved to notion/gpt4_outputs/\n"
        f"Check the files for detailed responses.",
        "Notion Project: GPT-4 Prompt Execution Complete"
    )
    
    print("\n🎉 Complete!")

if __name__ == '__main__':
    main()
