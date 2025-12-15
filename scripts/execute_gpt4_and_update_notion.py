#!/usr/bin/env python3
"""
Execute GPT-4 Prompts and Update Notion
Runs all GPT-4 prompts, generates content, then updates Notion workspace
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Import our modules
from gpt4_notion_prompts import execute_gpt4_prompt, NOTION_PROJECT_PROMPTS, save_prompt_result, send_to_discord
from populate_notion_live import PROJECTS_DATA, get_database_id, create_or_update_project, notion, PARENT_PAGE

load_dotenv()

def update_notion_with_gpt4_content():
    """Update Notion projects with GPT-4 generated content"""
    print("\n" + "="*70)
    print("📝 Updating Notion with GPT-4 Generated Content")
    print("="*70)
    
    # Get Projects database
    projects_db_id = get_database_id("Projects")
    if not projects_db_id:
        print("❌ Could not find Projects database")
        return False
    
    # Generate enhanced descriptions using GPT-4
    print("\n🤖 Generating enhanced project descriptions with GPT-4...")
    
    enhanced_projects = []
    for project in PROJECTS_DATA:
        # Use GPT-4 to enhance the description
        prompt = f"""Enhance and expand this project description for HingeCraft Global's Notion workspace:

Project: {project['name']}
Current Description: {project.get('description', '')}
Status: {project.get('status', 'In Progress')}
Progress: {project.get('progress', 0)}%

Create a comprehensive, inspiring description (2-3 paragraphs, 200-300 words) that:
- Clearly explains what the project does
- Highlights key features and benefits
- Shows current status and progress
- Uses action-oriented, inspiring language
- Aligns with HingeCraft's mission of building resilient, abundant futures

Enhanced Description:"""
        
        enhanced_desc = execute_gpt4_prompt({
            'id': f"enhance_{project['name'].lower().replace(' ', '_')}",
            'title': f"Enhance {project['name']}",
            'prompt': prompt
        })
        
        if enhanced_desc:
            project['description'] = enhanced_desc
            enhanced_projects.append(project)
            print(f"✅ Enhanced: {project['name']}")
        else:
            enhanced_projects.append(project)
            print(f"⚠️  Using original description for: {project['name']}")
    
    # Update Notion with enhanced projects
    print(f"\n📊 Updating {len(enhanced_projects)} projects in Notion...")
    for project in enhanced_projects:
        create_or_update_project(projects_db_id, project)
    
    return True

def main():
    """Main execution"""
    print("🚀 Execute GPT-4 Prompts and Update Notion")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Step 1: Execute all GPT-4 prompts
    print("\n📋 Step 1: Executing GPT-4 Prompts")
    print("-"*70)
    
    results = []
    for prompt_data in NOTION_PROJECT_PROMPTS:
        print(f"\n🤖 Processing: {prompt_data['title']}")
        result = execute_gpt4_prompt(prompt_data)
        
        if result:
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
                discord_message += f"\n\n[Full response: {output_file.name}]"
            send_to_discord(discord_message, f"Notion Project: {prompt_data['title']}")
    
    print(f"\n✅ Completed {len(results)}/{len(NOTION_PROJECT_PROMPTS)} prompts")
    
    # Step 2: Update Notion with GPT-4 enhanced content
    print("\n📋 Step 2: Updating Notion Workspace")
    print("-"*70)
    
    success = update_notion_with_gpt4_content()
    
    # Summary
    print("\n" + "="*70)
    print("📊 EXECUTION SUMMARY")
    print("="*70)
    print(f"✅ GPT-4 Prompts Executed: {len(results)}/{len(NOTION_PROJECT_PROMPTS)}")
    print(f"{'✅' if success else '❌'} Notion Updated: {'Yes' if success else 'No'}")
    print(f"💾 Outputs saved to: notion/gpt4_outputs/")
    print("="*70)
    
    # Final Discord update
    send_to_discord(
        f"✅ Complete! Executed {len(results)} GPT-4 prompts and updated Notion workspace\n\n"
        f"All outputs saved to notion/gpt4_outputs/\n"
        f"Projects updated with enhanced descriptions.",
        "Notion Project: Complete Execution"
    )
    
    print("\n🎉 Complete!")

if __name__ == '__main__':
    main()





