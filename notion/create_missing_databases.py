#!/usr/bin/env python3
"""
Create Missing Notion Databases
Ensures all 10 required databases exist
"""

import os
import logging
from dotenv import load_dotenv
from notion_client import Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("create-dbs")

load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "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")
PARENT_PAGE = os.getenv("NOTION_PARENT_PAGE_ID", "2c1993783a3480e7b13be279941b67e0")

notion = Client(auth=NOTION_TOKEN)

def create_leads_database():
    """Create Leads database"""
    logger.info("Creating Leads database...")
    try:
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Leads"}}],
            properties={
                "Name": {"title": {}},
                "Email": {"email": {}},
                "Status": {"select": {
                    "options": [
                        {"name": "New", "color": "gray"},
                        {"name": "Contacted", "color": "blue"},
                        {"name": "Qualified", "color": "yellow"},
                        {"name": "Converted", "color": "green"},
                        {"name": "Lost", "color": "red"}
                    ]
                }},
                "Source": {"select": {
                    "options": [
                        {"name": "Website", "color": "blue"},
                        {"name": "Referral", "color": "green"},
                        {"name": "Social Media", "color": "pink"},
                        {"name": "Other", "color": "gray"}
                    ]
                }},
                "Priority": {"select": {
                    "options": [
                        {"name": "High", "color": "red"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "Low", "color": "gray"}
                    ]
                }},
                "Notes": {"rich_text": {}},
                "Date Added": {"date": {}}
            }
        )
        logger.info(f"✅ Created Leads database: {db['id']}")
        return db['id']
    except Exception as e:
        logger.error(f"Error creating Leads database: {e}")
        return None

def create_content_pipeline_database():
    """Create Content Pipeline database"""
    logger.info("Creating Content Pipeline database...")
    try:
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Content Pipeline"}}],
            properties={
                "Title": {"title": {}},
                "Type": {"select": {
                    "options": [
                        {"name": "Blog Post", "color": "blue"},
                        {"name": "Documentation", "color": "green"},
                        {"name": "Video", "color": "purple"},
                        {"name": "Social Media", "color": "pink"},
                        {"name": "Other", "color": "gray"}
                    ]
                }},
                "Status": {"select": {
                    "options": [
                        {"name": "Draft", "color": "gray"},
                        {"name": "In Review", "color": "yellow"},
                        {"name": "Published", "color": "green"},
                        {"name": "Archived", "color": "red"}
                    ]
                }},
                "Author": {"rich_text": {}},
                "Publish Date": {"date": {}},
                "Tags": {"multi_select": {
                    "options": [
                        {"name": "Technical", "color": "blue"},
                        {"name": "Marketing", "color": "pink"},
                        {"name": "Legal", "color": "purple"},
                        {"name": "Community", "color": "green"}
                    ]
                }},
                "Content Link": {"url": {}}
            }
        )
        logger.info(f"✅ Created Content Pipeline database: {db['id']}")
        return db['id']
    except Exception as e:
        logger.error(f"Error creating Content Pipeline database: {e}")
        return None

def create_team_tracker_database():
    """Create Team Tracker database"""
    logger.info("Creating Team Tracker database...")
    try:
        projects_db_id = os.getenv("NOTION_PROJECT_DB_ID", "")
        tasks_db_id = os.getenv("NOTION_TASK_DB_ID", "")
        
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Team Tracker"}}],
            properties={
                "Name": {"title": {}},
                "Role": {"select": {
                    "options": [
                        {"name": "Developer", "color": "blue"},
                        {"name": "Designer", "color": "orange"},
                        {"name": "Manager", "color": "purple"},
                        {"name": "Marketing", "color": "pink"},
                        {"name": "Legal", "color": "red"},
                        {"name": "Other", "color": "gray"}
                    ]
                }},
                "Status": {"select": {
                    "options": [
                        {"name": "Active", "color": "green"},
                        {"name": "On Leave", "color": "yellow"},
                        {"name": "Inactive", "color": "red"}
                    ]
                }},
                "Email": {"email": {}},
                "Availability": {"select": {
                    "options": [
                        {"name": "Full Time", "color": "green"},
                        {"name": "Part Time", "color": "yellow"},
                        {"name": "Contract", "color": "blue"}
                    ]
                }}
            }
        )
        
        # Add relations if databases exist
        if projects_db_id:
            try:
                notion.databases.update(
                    database_id=db['id'],
                    properties={
                        "Projects": {"relation": {"database_id": projects_db_id}}
                    }
                )
            except:
                pass
        
        if tasks_db_id:
            try:
                notion.databases.update(
                    database_id=db['id'],
                    properties={
                        "Tasks": {"relation": {"database_id": tasks_db_id}}
                    }
                )
            except:
                pass
        
        logger.info(f"✅ Created Team Tracker database: {db['id']}")
        return db['id']
    except Exception as e:
        logger.error(f"Error creating Team Tracker database: {e}")
        return None

def create_chat_history_database():
    """Create Chat History database"""
    logger.info("Creating Chat History database...")
    try:
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Chat History"}}],
            properties={
                "Chat ID": {"title": {}},
                "Date": {"date": {}},
                "Participants": {"multi_select": {
                    "options": [
                        {"name": "Team", "color": "blue"},
                        {"name": "Client", "color": "green"},
                        {"name": "AI Assistant", "color": "purple"}
                    ]
                }},
                "Summary": {"rich_text": {}},
                "Key Points": {"rich_text": {}},
                "Links": {"url": {}},
                "Keywords": {"rich_text": {}}
            }
        )
        logger.info(f"✅ Created Chat History database: {db['id']}")
        return db['id']
    except Exception as e:
        logger.error(f"Error creating Chat History database: {e}")
        return None

def create_timeline_database():
    """Create Timeline database"""
    logger.info("Creating Timeline database...")
    try:
        projects_db_id = os.getenv("NOTION_PROJECT_DB_ID", "")
        
        db = notion.databases.create(
            parent={"type": "page_id", "page_id": PARENT_PAGE},
            title=[{"type": "text", "text": {"content": "Timeline"}}],
            properties={
                "Event Name": {"title": {}},
                "Date": {"date": {}},
                "Type": {"select": {
                    "options": [
                        {"name": "Deadline", "color": "red"},
                        {"name": "Milestone", "color": "green"},
                        {"name": "Meeting", "color": "blue"},
                        {"name": "Launch", "color": "purple"},
                        {"name": "Other", "color": "gray"}
                    ]
                }},
                "Status": {"select": {
                    "options": [
                        {"name": "Upcoming", "color": "blue"},
                        {"name": "In Progress", "color": "yellow"},
                        {"name": "Completed", "color": "green"},
                        {"name": "Cancelled", "color": "red"}
                    ]
                }},
                "Description": {"rich_text": {}}
            }
        )
        
        # Add relation to Projects if exists
        if projects_db_id:
            try:
                notion.databases.update(
                    database_id=db['id'],
                    properties={
                        "Related Project": {"relation": {"database_id": projects_db_id}}
                    }
                )
            except:
                pass
        
        logger.info(f"✅ Created Timeline database: {db['id']}")
        return db['id']
    except Exception as e:
        logger.error(f"Error creating Timeline database: {e}")
        return None

def main():
    """Create all missing databases"""
    logger.info("=" * 80)
    logger.info("Creating Missing Notion Databases")
    logger.info("=" * 80)
    
    created = []
    
    # Check which databases exist
    try:
        # Try to retrieve known databases
        known_dbs = {
            "leads": os.getenv("NOTION_LEADS_DB_ID", ""),
            "content": os.getenv("NOTION_CONTENT_DB_ID", ""),
            "team": os.getenv("NOTION_TEAM_DB_ID", ""),
            "chat": os.getenv("NOTION_CHAT_HISTORY_DB_ID", ""),
            "timeline": os.getenv("NOTION_TIMELINE_DB_ID", "")
        }
        
        for name, db_id in known_dbs.items():
            if not db_id:
                logger.info(f"Creating {name} database...")
                if name == "leads":
                    new_id = create_leads_database()
                elif name == "content":
                    new_id = create_content_pipeline_database()
                elif name == "team":
                    new_id = create_team_tracker_database()
                elif name == "chat":
                    new_id = create_chat_history_database()
                elif name == "timeline":
                    new_id = create_timeline_database()
                
                if new_id:
                    created.append((name, new_id))
            else:
                logger.info(f"✅ {name} database already exists: {db_id[:8]}...")
    except Exception as e:
        logger.error(f"Error checking databases: {e}")
    
    logger.info("\n" + "=" * 80)
    logger.info(f"✅ Created {len(created)} databases")
    logger.info("=" * 80)
    
    if created:
        logger.info("\nNew Database IDs:")
        for name, db_id in created:
            logger.info(f"  {name}: {db_id}")

if __name__ == "__main__":
    main()



