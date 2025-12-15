#!/usr/bin/env python3
"""
Enhanced Notion Organization Script
Creates better UX/UI and organization for team collaboration
"""

import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
from notion_client import Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notion-enhance")

load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

notion = Client(auth=NOTION_TOKEN)

def create_team_homepage():
    """Create beautiful team homepage"""
    logger.info("Creating team homepage...")
    
    try:
        homepage = notion.pages.create(
            parent={"page_id": PARENT_PAGE},
            properties={
                "title": {
                    "title": [{"text": {"content": "🏠 HingeCraft Team Home"}}]
                }
            },
            icon={"type": "emoji", "emoji": "🏠"},
            cover={
                "type": "external",
                "external": {
                    "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1500"
                }
            }
        )
        
        homepage_id = homepage["id"]
        
        # Add welcome message
        notion.blocks.children.append(
            block_id=homepage_id,
            children=[
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"type": "text", "text": {"content": "Welcome to HingeCraft! 🚀"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "This is your central hub for all HingeCraft projects, tasks, and collaboration. Everything is organized and synced in real-time."
                                }
                            }
                        ]
                    }
                }
            ]
        )
        
        logger.info(f"✅ Homepage created: {homepage_id}")
        return homepage_id
    except Exception as e:
        logger.error(f"Error creating homepage: {e}")
        return None

def create_project_views():
    """Create organized project views"""
    logger.info("Creating project views...")
    
    views = [
        {
            "name": "📊 Active Projects",
            "description": "Projects currently in progress"
        },
        {
            "name": "✅ Completed Projects",
            "description": "Successfully completed projects"
        },
        {
            "name": "🎯 Priority Projects",
            "description": "High-priority projects"
        }
    ]
    
    for view in views:
        try:
            page = notion.pages.create(
                parent={"page_id": PARENT_PAGE},
                properties={
                    "title": {
                        "title": [{"text": {"content": view["name"]}}]
                    }
                }
            )
            
            notion.blocks.children.append(
                block_id=page["id"],
                children=[
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": view["description"]}}]
                        }
                    }
                ]
            )
            
            logger.info(f"✅ Created view: {view['name']}")
        except Exception as e:
            logger.warning(f"Could not create view {view['name']}: {e}")

def create_team_resources():
    """Create team resources page"""
    logger.info("Creating team resources...")
    
    try:
        resources = notion.pages.create(
            parent={"page_id": PARENT_PAGE},
            properties={
                "title": {
                    "title": [{"text": {"content": "📚 Team Resources"}}]
                }
            }
        )
        
        resource_sections = [
            {"title": "🔗 Quick Links", "items": [
                "Main Dashboard",
                "Wix Editor",
                "GitHub Repository",
                "Documentation"
            ]},
            {"title": "📖 Documentation", "items": [
                "Setup Guide",
                "API Documentation",
                "Deployment Guide"
            ]},
            {"title": "🛠️ Tools", "items": [
                "Notion Sync",
                "Wix Dev",
                "Database Tools"
            ]}
        ]
        
        for section in resource_sections:
            children = [
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": section["title"]}}]
                    }
                }
            ]
            
            for item in section["items"]:
                children.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [
                            {"type": "text", "text": {"content": item}}
                        ]
                    }
                })
            
            notion.blocks.children.append(
                block_id=resources["id"],
                children=children
            )
        
        logger.info("✅ Team resources created")
        return True
    except Exception as e:
        logger.error(f"Error creating resources: {e}")
        return False

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("🎨 Enhancing Notion Organization")
    logger.info("=" * 80)
    
    create_team_homepage()
    create_project_views()
    create_team_resources()
    
    logger.info("=" * 80)
    logger.info("✅ Enhancement Complete!")
    logger.info("=" * 80)

if __name__ == "__main__":
    main()

