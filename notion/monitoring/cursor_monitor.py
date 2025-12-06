#!/usr/bin/env python3
"""
Cursor Activity Monitor
Monitors Cursor workspace for active development and updates Notion status
"""

import os
import time
import json
import subprocess
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cursor-monitor")

class CursorActivityHandler(FileSystemEventHandler):
    """Handle file system events for Cursor workspace"""
    
    def __init__(self, callback):
        self.callback = callback
        self.last_activity = None
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        # Filter for relevant files
        if event.src_path.endswith(('.py', '.js', '.ts', '.md', '.json', '.sql')):
            self.last_activity = datetime.now()
            logger.info(f"File modified: {event.src_path}")
            if self.callback:
                self.callback({
                    'type': 'file_modified',
                    'path': event.src_path,
                    'timestamp': self.last_activity.isoformat()
                })
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        self.last_activity = datetime.now()
        logger.info(f"File created: {event.src_path}")
        if self.callback:
            self.callback({
                'type': 'file_created',
                'path': event.src_path,
                'timestamp': self.last_activity.isoformat()
            })

def update_notion_status(activity_data: dict):
    """Update Notion with current activity status"""
    # This will be called by the sync script
    logger.info(f"Updating Notion status: {activity_data}")

def monitor_cursor_workspace(workspace_path: str):
    """Monitor Cursor workspace for changes"""
    path = Path(workspace_path)
    
    event_handler = CursorActivityHandler(update_notion_status)
    observer = Observer()
    observer.schedule(event_handler, str(path), recursive=True)
    observer.start()
    
    logger.info(f"Monitoring Cursor workspace: {workspace_path}")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    
    observer.join()

if __name__ == '__main__':
    workspace = os.getenv("CURSOR_WORKSPACE_PATH", "../")
    monitor_cursor_workspace(workspace)

