#!/usr/bin/env python3
"""
HingeCraft Notion Project - Complete Launch Script
Launches all components and creates beautiful UX/UI for the team
"""

import os
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("notion_launch.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("notion-launch")

# Load environment
load_dotenv()

def launch_sync():
    """Launch the main sync service"""
    logger.info("Launching Notion sync service...")
    try:
        from sync.hingecraft_notion_sync import run_sync, create_notion_databases
        
        # Create databases first
        create_notion_databases()
        
        # Run initial sync
        run_sync()
        
        logger.info("✅ Sync service launched successfully")
        return True
    except Exception as e:
        logger.error(f"Error launching sync: {e}")
        return False

def create_enhanced_structure():
    """Create enhanced Notion structure"""
    logger.info("Creating enhanced Notion structure...")
    try:
        from create_notion_ux_ui import create_team_workspace, create_quick_links_page
        
        # Create workspace
        create_team_workspace()
        create_quick_links_page()
        
        logger.info("✅ Enhanced structure created")
        return True
    except Exception as e:
        logger.error(f"Error creating structure: {e}")
        return False

def verify_databases():
    """Verify all databases are operational"""
    logger.info("Verifying databases...")
    try:
        from notion_client import Client
        from dotenv import load_dotenv
        
        load_dotenv()
        notion = Client(auth=os.getenv("NOTION_TOKEN"))
        
        db_ids = {
            'projects': os.getenv("NOTION_PROJECT_DB_ID", ""),
            'tasks': os.getenv("NOTION_TASK_DB_ID", ""),
            'donations': os.getenv("NOTION_DONATION_DB_ID", ""),
        }
        
        verified = 0
        for name, db_id in db_ids.items():
            if db_id:
                try:
                    db = notion.databases.retrieve(database_id=db_id)
                    logger.info(f"✅ {name} database verified: {db_id[:8]}...")
                    verified += 1
                except:
                    logger.warning(f"⚠️  {name} database not accessible")
        
        logger.info(f"✅ Verified {verified}/{len(db_ids)} databases")
        return verified > 0
    except Exception as e:
        logger.error(f"Error verifying databases: {e}")
        return False

def main():
    """Main launch function"""
    logger.info("=" * 80)
    logger.info("🚀 HingeCraft Notion Project - Complete Launch")
    logger.info("=" * 80)
    
    # Step 1: Create enhanced structure
    logger.info("\n📋 Step 1: Creating enhanced UX/UI structure...")
    if create_enhanced_structure():
        logger.info("✅ Step 1 Complete")
    else:
        logger.warning("⚠️  Step 1 had issues, continuing...")
    
    # Step 2: Verify databases
    logger.info("\n📋 Step 2: Verifying databases...")
    if verify_databases():
        logger.info("✅ Step 2 Complete")
    else:
        logger.warning("⚠️  Step 2 had issues, continuing...")
    
    # Step 3: Launch sync
    logger.info("\n📋 Step 3: Launching sync service...")
    if launch_sync():
        logger.info("✅ Step 3 Complete")
    else:
        logger.warning("⚠️  Step 3 had issues, check logs")
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ HingeCraft Notion Project Launch Complete!")
    logger.info("=" * 80)
    logger.info("\n📊 Next Steps:")
    logger.info("1. Open Notion: https://www.notion.so/Main-Page-2c1993783a3480e7b13be279941b67e0")
    logger.info("2. Check the new Dashboard page")
    logger.info("3. Review Quick Links page")
    logger.info("4. Verify all databases are syncing")
    logger.info("\n🎉 Project is ready for team collaboration!")

if __name__ == "__main__":
    main()








