#!/usr/bin/env python3
"""
HingeCraft Notion UX/UI Enhancement Script
Creates a beautifully organized Notion workspace for the team
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from notion_client import Client

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("notion-ux-ui")

# Load environment
load_dotenv()

# Configuration
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

# Initialize Notion client
notion = Client(auth=NOTION_TOKEN)

def create_dashboard_page():
    """Create main dashboard page with beautiful layout"""
    logger.info("Creating main dashboard page...")
    
    try:
        # Create dashboard page
        dashboard = notion.pages.create(
            parent={"page_id": PARENT_PAGE},
            properties={
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": "🎯 HingeCraft Dashboard"
                            }
                        }
                    ]
                }
            }
        )
        
        dashboard_id = dashboard["id"]
        logger.info(f"✅ Dashboard page created: {dashboard_id}")
        
        # Add cover image (if available)
        try:
            notion.pages.update(
                page_id=dashboard_id,
                cover={
                    "type": "external",
                    "external": {
                        "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1500"
                    }
                }
            )
        except:
            pass
        
        # Add icon
        try:
            notion.pages.update(
                page_id=dashboard_id,
                icon={
                    "type": "emoji",
                    "emoji": "🚀"
                }
            )
        except:
            pass
        
        return dashboard_id
    
    except Exception as e:
        logger.error(f"Error creating dashboard: {e}")
        return None

def create_section_headers(dashboard_id):
    """Create organized section headers"""
    sections = [
        {"title": "📊 Overview", "emoji": "📊"},
        {"title": "🎯 Projects", "emoji": "🎯"},
        {"title": "✅ Tasks", "emoji": "✅"},
        {"title": "💰 Donations", "emoji": "💰"},
        {"title": "👥 Team", "emoji": "👥"},
        {"title": "📝 Content", "emoji": "📝"},
        {"title": "💬 Chat History", "emoji": "💬"},
        {"title": "📅 Timeline", "emoji": "📅"},
        {"title": "🔧 System Status", "emoji": "🔧"},
        {"title": "🔗 Resources", "emoji": "🔗"}
    ]
    
    for section in sections:
        try:
            notion.blocks.children.append(
                block_id=dashboard_id,
                children=[
                    {
                        "object": "block",
                        "type": "heading_1",
                        "heading_1": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": f"{section['emoji']} {section['title']}"
                                    }
                                }
                            ]
                        }
                    }
                ]
            )
            logger.info(f"✅ Created section: {section['title']}")
        except Exception as e:
            logger.warning(f"Could not create section {section['title']}: {e}")

def create_callout_blocks(dashboard_id):
    """Create beautiful callout blocks for key metrics"""
    callouts = [
        {
            "icon": "🎯",
            "text": "**Total Projects:** Syncing from database...",
            "color": "blue"
        },
        {
            "icon": "✅",
            "text": "**Tasks Completed:** Tracking progress...",
            "color": "green"
        },
        {
            "icon": "💰",
            "text": "**Total Donations:** $175.50",
            "color": "yellow"
        },
        {
            "icon": "👥",
            "text": "**Team Members:** Active collaboration",
            "color": "purple"
        }
    ]
    
    for callout in callouts:
        try:
            notion.blocks.children.append(
                block_id=dashboard_id,
                children=[
                    {
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": callout["text"]
                                    },
                                    "annotations": {
                                        "bold": True
                                    }
                                }
                            ],
                            "icon": {
                                "type": "emoji",
                                "emoji": callout["icon"]
                            },
                            "color": callout["color"]
                        }
                    }
                ]
            )
        except Exception as e:
            logger.warning(f"Could not create callout: {e}")

def create_database_views(dashboard_id, db_id, db_name):
    """Create linked database views"""
    try:
        notion.blocks.children.append(
            block_id=dashboard_id,
            children=[
                {
                    "object": "block",
                    "type": "child_database",
                    "child_database": {
                        "title": db_name
                    }
                }
            ]
        )
        logger.info(f"✅ Added database view: {db_name}")
    except Exception as e:
        logger.warning(f"Could not add database view {db_name}: {e}")

def create_team_workspace():
    """Create organized team workspace structure"""
    logger.info("Creating team workspace structure...")
    
    try:
        # Create main dashboard
        dashboard_id = create_dashboard_page()
        if not dashboard_id:
            return False
        
        # Add sections
        create_section_headers(dashboard_id)
        
        # Add callouts
        create_callout_blocks(dashboard_id)
        
        # Add divider
        try:
            notion.blocks.children.append(
                block_id=dashboard_id,
                children=[
                    {
                        "object": "block",
                        "type": "divider",
                        "divider": {}
                    }
                ]
            )
        except:
            pass
        
        logger.info("✅ Team workspace structure created successfully")
        return True
    
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        return False

def create_quick_links_page():
    """Create quick links page for easy navigation"""
    logger.info("Creating quick links page...")
    
    try:
        quick_links = notion.pages.create(
            parent={"page_id": PARENT_PAGE},
            properties={
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": "🔗 Quick Links"
                            }
                        }
                    ]
                }
            }
        )
        
        links = [
            {"name": "Main Dashboard", "url": "https://www.notion.so/Main-Page-2c1993783a3480e7b13be279941b67e0"},
            {"name": "HingeCraft Website", "url": "https://www.hingecraft-global.ai"},
            {"name": "Wix Editor", "url": "https://editor.wix.com"},
            {"name": "GitHub Repository", "url": "https://github.com/departments-commits/hingecraft-global.git"}
        ]
        
        for link in links:
            try:
                notion.blocks.children.append(
                    block_id=quick_links["id"],
                    children=[
                        {
                            "object": "block",
                            "type": "bookmark",
                            "bookmark": {
                                "url": link["url"],
                                "caption": [
                                    {
                                        "type": "text",
                                        "text": {
                                            "content": link["name"]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                )
            except:
                pass
        
        logger.info("✅ Quick links page created")
        return True
    
    except Exception as e:
        logger.error(f"Error creating quick links: {e}")
        return False

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("🚀 HingeCraft Notion UX/UI Enhancement")
    logger.info("=" * 80)
    
    # Create team workspace
    if create_team_workspace():
        logger.info("✅ Team workspace created")
    
    # Create quick links
    if create_quick_links_page():
        logger.info("✅ Quick links page created")
    
    logger.info("=" * 80)
    logger.info("✅ UX/UI Enhancement Complete!")
    logger.info("=" * 80)

if __name__ == "__main__":
    main()








