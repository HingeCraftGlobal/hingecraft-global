#!/usr/bin/env python3
"""
Generate comprehensive GPT prompt table with ~2000 sequences for HingeCraft Global Notion workspace.
This script creates a complete prompt library covering all aspects of the project.
"""

import json
from datetime import datetime

# Project data
PROJECTS = [
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

TEAMS = ['Engineering', 'DevOps', 'Marketing', 'Design', 'Community', 'Legal', 'Compliance', 'Content']
AUDIENCES = ['Team Members', 'Stakeholders', 'Community Members', 'External Partners', 'Future Team Members', 'Investors', 'Donors']
CONTENT_TYPES = ['Executive Summary', 'Detailed Description', 'Status Report', 'Impact Statement', 'Roadmap', 'Technical Details', 
                 'User Guide', 'FAQ', 'Case Study', 'Press Release', 'Blog Post', 'Social Media', 'Email', 'Presentation', 'Documentation']
TONE_VARIATIONS = ['Professional', 'Inspiring', 'Technical', 'Community-Focused', 'Casual', 'Authoritative', 'Welcoming', 'Action-Oriented']

def generate_prompt_table():
    """Generate comprehensive prompt table with ~2000 sequences"""
    
    prompts = []
    sequence = 1
    
    # 1. Project Documentation - All Projects × All Content Types × Multiple Variations (7 × 15 × 10 = 1050)
    for project in PROJECTS:
        for content_type in CONTENT_TYPES:
            for variation in range(10):  # 10 variations per content type
                for tone in TONE_VARIATIONS[:3]:  # 3 tones per variation
                    prompt = {
                        "prompt_id": f"PROJ_{project['name'][:3].upper().replace(' ', '')}_{content_type[:3].upper()}_{variation:03d}_{tone[:3].upper()}",
                        "sequence": sequence,
                        "title": f"{project['name']} - {content_type} - Variation {variation+1} - {tone}",
                        "system_prompt": f"You are an expert {content_type.lower()} specialist for HingeCraft Global. Create comprehensive, {tone.lower()} content that aligns with our mission of building resilient, abundant futures through accessible technology and sustainable design.",
                        "user_prompt": f"Write a comprehensive {content_type.lower()} for the {project['name']} project. Project details: {project['description']}. Status: {project['status']} ({project['progress']}%). Team: {', '.join(project['team'])}. Priority: {project['priority']}. Category: {project['category']}. Use {tone.lower()} tone. Include specific details, examples, and actionable information. Variation focus: {['Technical depth', 'User benefits', 'Mission alignment', 'Progress details', 'Future roadmap', 'Impact metrics', 'Team collaboration', 'Stakeholder value', 'Community impact', 'Innovation highlights'][variation]}.",
                        "expected_output_length": 150 + (variation * 50),
                        "tokens": 200 + (variation * 100),
                        "template": content_type.lower().replace(' ', '_'),
                        "project": project['name'],
                        "content_type": content_type,
                        "tone": tone,
                        "variation": variation + 1
                    }
                    prompts.append(prompt)
                    sequence += 1
                    if sequence > 2000:
                        break
                if sequence > 2000:
                    break
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 2. Dashboard Content - Multiple Variations (100)
    dashboard_prompts = [
        "Welcome Message", "Status Overview", "Navigation Guide", "Quick Start Guide", 
        "Feature Highlights", "Recent Updates", "Team Spotlight", "Metrics Dashboard",
        "Getting Started", "FAQ Section"
    ]
    for dash_type in dashboard_prompts:
        for variation in range(10):
            prompt = {
                "prompt_id": f"DASH_{dash_type[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Dashboard - {dash_type} - Variation {variation+1}",
                "system_prompt": "You are a workspace architect creating compelling dashboard content for HingeCraft Global. Create welcoming, inspiring, and informative dashboard messages.",
                "user_prompt": f"Write comprehensive dashboard content for {dash_type} in the HingeCraft Global Notion workspace. Include current project count (7), overall progress (84.3%), donation totals ($175.50), team information, and navigation guidance. Variation focus: {['Welcome tone', 'Status details', 'Navigation clarity', 'Quick access', 'Feature highlights', 'Recent activity', 'Team collaboration', 'Metrics display', 'Getting started', 'Help resources'][variation]}. Use inspiring, clear, action-oriented language.",
                "expected_output_length": 200 + (variation * 30),
                "tokens": 300 + (variation * 50),
                "template": "dashboard_content",
                "content_type": dash_type,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 3. Team Workspace Content - All Teams × Multiple Content Types (8 × 10 = 80)
    team_content_types = ["Welcome Message", "Team Overview", "Project Links", "Resources", "Collaboration Guide", 
                         "Communication Guidelines", "Tools & Access", "Team Goals", "Recent Achievements", "Next Steps"]
    for team in TEAMS:
        for content_type in team_content_types:
            prompt = {
                "prompt_id": f"TEAM_{team[:3].upper()}_{content_type[:3].upper()}",
                "sequence": sequence,
                "title": f"{team} Team - {content_type}",
                "system_prompt": f"You are a team workspace architect for HingeCraft Global. Create welcoming, functional team workspace content for the {team} team.",
                "user_prompt": f"Write comprehensive {content_type.lower()} for the {team} team workspace in HingeCraft Global Notion. Include team purpose, key projects, collaboration tools, communication guidelines, and resources. Use team-appropriate language that matches the {team} team's focus and responsibilities.",
                "expected_output_length": 200,
                "tokens": 300,
                "template": "team_workspace",
                "team": team,
                "content_type": content_type
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 4. Donation Content - Multiple Variations (50)
    donation_types = ["Thank You Message", "Impact Statement", "Receipt Template", "Donor Update", "Impact Report"]
    for don_type in donation_types:
        for variation in range(10):
            prompt = {
                "prompt_id": f"DON_{don_type[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Donation - {don_type} - Variation {variation+1}",
                "system_prompt": "You are a community engagement specialist for HingeCraft Global. Create heartfelt, inspiring content for donors and community supporters.",
                "user_prompt": f"Write comprehensive {don_type.lower()} for HingeCraft Global donors. Current total: $175.50 from 3 donations. Include appreciation, impact explanation, mission reminder, community connection, and future impact. Variation focus: {['Gratitude', 'Impact details', 'Mission alignment', 'Community building', 'Future vision', 'Transparency', 'Personal connection', 'Success stories', 'Growth metrics', 'Call to action'][variation]}. Use warm, grateful, inspiring language.",
                "expected_output_length": 150 + (variation * 20),
                "tokens": 200 + (variation * 50),
                "template": "donation_content",
                "content_type": don_type,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 5. Documentation - Multiple Types (100)
    doc_types = ["Setup Guide", "User Manual", "API Documentation", "Troubleshooting Guide", "Best Practices", 
                "FAQ", "Tutorial", "Reference Guide", "Quick Start", "Advanced Guide"]
    for doc_type in doc_types:
        for variation in range(10):
            prompt = {
                "prompt_id": f"DOC_{doc_type[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Documentation - {doc_type} - Variation {variation+1}",
                "system_prompt": "You are a documentation specialist for HingeCraft Global. Create clear, comprehensive documentation guides.",
                "user_prompt": f"Write comprehensive {doc_type.lower()} for HingeCraft Global systems and processes. Include step-by-step instructions, examples, troubleshooting tips, and best practices. Variation focus: {['Beginner friendly', 'Advanced features', 'Common issues', 'Best practices', 'Examples', 'Troubleshooting', 'Integration', 'Configuration', 'Optimization', 'Security'][variation]}. Use clear, instructional, helpful language.",
                "expected_output_length": 300 + (variation * 50),
                "tokens": 400 + (variation * 100),
                "template": "documentation",
                "content_type": doc_type,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 6. Communication Templates - Multiple Types (100)
    comm_types = ["Welcome Email", "Project Update Email", "Donation Receipt", "Newsletter", "Announcement",
                 "Meeting Invitation", "Status Update", "Thank You Note", "Follow-up", "Reminder"]
    for comm_type in comm_types:
        for variation in range(10):
            prompt = {
                "prompt_id": f"COMM_{comm_type[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Communication - {comm_type} - Variation {variation+1}",
                "system_prompt": "You are a communication specialist for HingeCraft Global. Create professional, engaging communication templates.",
                "user_prompt": f"Write a comprehensive {comm_type.lower()} template for HingeCraft Global. Include appropriate greeting, main content, call to action, and closing. Variation focus: {['Formal tone', 'Casual tone', 'Urgent', 'Informative', 'Inspiring', 'Action-oriented', 'Community-focused', 'Professional', 'Welcoming', 'Grateful'][variation]}. Use appropriate tone and language for the context.",
                "expected_output_length": 200 + (variation * 30),
                "tokens": 300 + (variation * 50),
                "template": "communication_template",
                "content_type": comm_type,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 7. Brand Voice & Content Guidelines (50)
    brand_topics = ["Voice Guidelines", "Tone Variations", "Mission Statement", "Vision Statement", "Core Values",
                   "Brand Personality", "Messaging Framework", "Content Strategy", "Style Guide", "Writing Standards"]
    for topic in brand_topics:
        for variation in range(5):
            prompt = {
                "prompt_id": f"BRAND_{topic[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Brand - {topic} - Variation {variation+1}",
                "system_prompt": "You are a brand voice specialist for HingeCraft Global. Create comprehensive brand voice and content guidelines.",
                "user_prompt": f"Write comprehensive {topic.lower()} for HingeCraft Global. Mission: 'Building resilient, abundant futures through accessible technology and sustainable design.' Include principles, examples, do's and don'ts, and application guidelines. Variation focus: {['Principles', 'Examples', 'Guidelines', 'Application', 'Best practices'][variation]}. Use authoritative, brand-focused language.",
                "expected_output_length": 300 + (variation * 50),
                "tokens": 400 + (variation * 100),
                "template": "brand_guidelines",
                "content_type": topic,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 8. Onboarding & Training (50)
    onboarding_topics = ["New Team Member Guide", "Notion Workspace Onboarding", "Project Overview", "Tools Introduction",
                        "Process Documentation", "Role-Specific Training", "Team Introduction", "Resource Access", 
                        "First Week Checklist", "Getting Started"]
    for topic in onboarding_topics:
        for variation in range(5):
            prompt = {
                "prompt_id": f"ONBOARD_{topic[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Onboarding - {topic} - Variation {variation+1}",
                "system_prompt": "You are an onboarding specialist for HingeCraft Global. Create comprehensive onboarding and training guides.",
                "user_prompt": f"Write comprehensive {topic.lower()} for new HingeCraft Global team members. Include welcome message, key information, step-by-step instructions, resources, and next steps. Variation focus: {['Welcome', 'Instructions', 'Resources', 'Checklist', 'Support'][variation]}. Use welcoming, instructional, supportive language.",
                "expected_output_length": 300 + (variation * 50),
                "tokens": 400 + (variation * 100),
                "template": "onboarding_guide",
                "content_type": topic,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 9. Metrics & Reporting (50)
    metrics_topics = ["Project Metrics Dashboard", "Weekly Status Report", "Monthly Summary", "Progress Tracking",
                     "Success Metrics", "KPI Dashboard", "Performance Report", "Analytics Overview", 
                     "Data Visualization Guide", "Reporting Standards"]
    for topic in metrics_topics:
        for variation in range(5):
            prompt = {
                "prompt_id": f"MET_{topic[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Metrics - {topic} - Variation {variation+1}",
                "system_prompt": "You are an analytics specialist for HingeCraft Global. Create clear, informative metrics and reporting content.",
                "user_prompt": f"Write comprehensive {topic.lower()} for HingeCraft Global. Include metrics tracked, calculation methods, interpretation guidelines, action items, and best practices. Variation focus: {['Metrics definition', 'Calculation', 'Interpretation', 'Action items', 'Best practices'][variation]}. Use data-focused, analytical, actionable language.",
                "expected_output_length": 250 + (variation * 50),
                "tokens": 350 + (variation * 100),
                "template": "metrics_reporting",
                "content_type": topic,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # 10. Integration & Technical (50)
    tech_topics = ["API Documentation", "Integration Guide", "System Architecture", "Technical Specifications",
                  "Deployment Guide", "Configuration Guide", "Security Documentation", "Performance Optimization",
                  "Troubleshooting", "Best Practices"]
    for topic in tech_topics:
        for variation in range(5):
            prompt = {
                "prompt_id": f"TECH_{topic[:3].upper()}_{variation:03d}",
                "sequence": sequence,
                "title": f"Technical - {topic} - Variation {variation+1}",
                "system_prompt": "You are a technical specialist for HingeCraft Global. Create comprehensive technical documentation.",
                "user_prompt": f"Write comprehensive {topic.lower()} for HingeCraft Global systems. Include technical details, architecture, implementation, configuration, and best practices. Variation focus: {['Overview', 'Architecture', 'Implementation', 'Configuration', 'Best practices'][variation]}. Use technical, precise, developer-friendly language.",
                "expected_output_length": 300 + (variation * 50),
                "tokens": 400 + (variation * 100),
                "template": "technical_documentation",
                "content_type": topic,
                "variation": variation + 1
            }
            prompts.append(prompt)
            sequence += 1
            if sequence > 2000:
                break
        if sequence > 2000:
            break
    
    # Limit to 2000 sequences
    prompts = prompts[:2000]
    
    # Organize into categories
    categories = {}
    for prompt in prompts:
        cat_key = prompt.get('template', 'general')
        if cat_key not in categories:
            categories[cat_key] = {
                "category_id": f"CAT_{cat_key.upper()}",
                "category_name": cat_key.replace('_', ' ').title(),
                "purpose": f"Generate {cat_key.replace('_', ' ')} content for HingeCraft Global",
                "prompts": []
            }
        categories[cat_key]["prompts"].append(prompt)
    
    # Create final structure
    result = {
        "project_metadata": {
            "name": "HingeCraft Global Notion Workspace",
            "purpose": "Complete project management, team collaboration, and data tracking workspace for HingeCraft Global initiatives",
            "mission": "Building resilient, abundant futures through accessible technology and sustainable design",
            "vision": "A world where every community has the tools, knowledge, and connections to create sustainable abundance locally",
            "total_prompts": len(prompts),
            "total_sequences": len(prompts),
            "categories": len(categories),
            "created": datetime.now().strftime("%Y-%m-%d"),
            "version": "2.0.0"
        },
        "prompt_categories": list(categories.values()),
        "work_templates": {
            "executive_summary": {
                "structure": ["Project Overview", "Key Value Proposition", "Mission Alignment", "Current Progress", "Immediate Impact"],
                "word_count": "150-200",
                "tone": "Professional, inspiring, action-oriented"
            },
            "detailed_description": {
                "structure": ["Functionality Overview", "Key Features", "Technical Architecture", "Integration Points", "User Benefits"],
                "word_count": "300-400",
                "tone": "Technical but accessible, comprehensive"
            },
            "status_report": {
                "structure": ["Current State", "Completed Milestones", "Progress Breakdown", "Current Focus", "Recent Achievements"],
                "word_count": "100-150",
                "tone": "Clear, transparent, progress-focused"
            }
        },
        "intended_purpose": {
            "primary_purpose": "Comprehensive GPT prompt system with ~2000 sequences for generating all HingeCraft Global Notion workspace content with consistent voice, tone, and quality",
            "use_cases": [
                "Automated content generation for all project documentation",
                "Consistent brand voice across all Notion content",
                "Comprehensive documentation for team collaboration",
                "Scalable content creation for workspace expansion",
                "Quality assurance for all written content"
            ],
            "target_audience": TEAMS + AUDIENCES,
            "content_goals": [
                "Inspire action and engagement",
                "Provide clear, actionable information",
                "Maintain brand consistency",
                "Support team collaboration",
                "Enable scalable content creation"
            ]
        },
        "usage_instructions": {
            "how_to_use": "Load this JSON file into GPT-powered scripts to generate comprehensive content for all HingeCraft Global Notion workspace elements",
            "execution_order": f"Prompts are numbered by sequence (1-{len(prompts)}) and should be executed in order for comprehensive content generation",
            "customization": "Prompts can be customized with project-specific data before execution",
            "output_format": "All prompts generate markdown-formatted content ready for Notion",
            "quality_assurance": "All content should be reviewed for brand voice alignment and accuracy before publishing"
        }
    }
    
    return result

if __name__ == "__main__":
    print("Generating comprehensive prompt table with ~2000 sequences...")
    prompt_table = generate_prompt_table()
    
    output_file = "/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/notion/gpt_prompt_table_complete.json"
    with open(output_file, 'w') as f:
        json.dump(prompt_table, f, indent=2)
    
    total_prompts = prompt_table['project_metadata']['total_prompts']
    total_categories = prompt_table['project_metadata']['categories']
    
    print(f"✅ Generated comprehensive prompt table!")
    print(f"   Total prompts: {total_prompts}")
    print(f"   Total categories: {total_categories}")
    print(f"   Output file: {output_file}")
    print(f"\n📊 Prompt Distribution:")
    for cat in prompt_table['prompt_categories']:
        print(f"   - {cat['category_name']}: {len(cat['prompts'])} prompts")
