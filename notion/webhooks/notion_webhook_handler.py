#!/usr/bin/env python3
"""
Notion Webhook Handler
Receives and processes webhook events from Notion
"""

import os
import json
import hmac
import hashlib
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notion-webhook")

@app.route('/webhooks/notion', methods=['POST'])
def handle_notion_webhook():
    """Handle incoming Notion webhook events"""
    try:
        # Verify webhook signature
        signature = request.headers.get('X-Notion-Signature', '')
        if not verify_signature(request.data, signature):
            logger.warning("Invalid webhook signature")
            return jsonify({"error": "Invalid signature"}), 401
        
        # Process webhook event
        event = request.json
        event_type = event.get('type')
        
        logger.info(f"Received Notion webhook: {event_type}")
        
        # Handle different event types
        if event_type == 'page.updated':
            handle_page_update(event)
        elif event_type == 'database.updated':
            handle_database_update(event)
        elif event_type == 'block.updated':
            handle_block_update(event)
        
        return jsonify({"status": "ok"}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({"error": str(e)}), 500

def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify webhook signature"""
    if not WEBHOOK_SECRET:
        return True  # Skip verification if no secret set
    
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected, signature)

def handle_page_update(event: dict):
    """Handle page update event"""
    logger.info(f"Page updated: {event.get('object_id')}")

def handle_database_update(event: dict):
    """Handle database update event"""
    logger.info(f"Database updated: {event.get('object_id')}")

def handle_block_update(event: dict):
    """Handle block update event"""
    logger.info(f"Block updated: {event.get('object_id')}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


