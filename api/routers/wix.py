"""
Wix Integration Endpoints
Handles webhooks and API calls from Wix
"""

from fastapi import APIRouter, Request, Header, HTTPException
from typing import Optional
import hmac
import hashlib
import os
import logging

from api.database import get_db
from api.auth import verify_hmac_signature

router = APIRouter()
logger = logging.getLogger(__name__)

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "your-webhook-secret")


@router.post("/webhooks/wix")
async def receive_wix_webhook(
    request: Request,
    x_wix_signature: Optional[str] = Header(None)
):
    """
    Receive webhook from Wix
    Example payload:
    {
        "event": "form_submit",
        "source": "wix:donate_form",
        "data": {
            "name": "Chandler Ferguson",
            "email": "chandler@hingecraft.ai",
            "amount_usd": 25,
            "chain": "solana",
            "project": "microfactory-aiken"
        },
        "timestamp": "2025-12-03T15:03:00Z"
    }
    """
    body = await request.body()
    
    # Verify HMAC signature if provided
    if x_wix_signature:
        if not verify_hmac_signature(body, x_wix_signature, WEBHOOK_SECRET):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    payload = await request.json()
    
    # Log webhook
    db = next(get_db())
    webhook_query = """
        INSERT INTO webhooks (provider, payload, received_at, processed)
        VALUES ('wix', :payload, NOW(), false)
        RETURNING id
    """
    result = db.execute(webhook_query, {"payload": payload})
    webhook_id = result.fetchone()[0]
    db.commit()
    
    # Process webhook based on event type
    event_type = payload.get("event")
    
    if event_type == "form_submit":
        # Handle donation form submission
        data = payload.get("data", {})
        # Create donation invoice
        # Return success
        return {"status": "received", "webhook_id": str(webhook_id)}
    
    return {"status": "received", "webhook_id": str(webhook_id)}


@router.post("/api/wix/donate")
async def wix_donate_endpoint(
    request: Request,
    x_api_key: Optional[str] = Header(None)
):
    """
    Wix donation endpoint
    Called from Wix Velo code
    """
    API_KEY = os.getenv("WC_API_KEY", "changeme")
    
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    payload = await request.json()
    
    # Create donation invoice
    # This will be handled by the donations router
    return {"status": "processing", "message": "Donation request received"}

