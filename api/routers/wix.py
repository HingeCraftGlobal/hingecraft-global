"""
Wix Integration Endpoints
Handles webhooks and API calls from Wix
"""

from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import uuid
import hmac
import hashlib
import os
from datetime import datetime

from api.database import get_db

router = APIRouter()

# Get API key from environment
WC_API_KEY = os.getenv("WC_API_KEY", "changeme")


class WixDonationRequest(BaseModel):
    chain: str
    amountUsd: float
    source: Optional[str] = "wix:homepage"
    donorInfo: Optional[dict] = None
    earmark: Optional[str] = "general"
    memo: Optional[str] = None


class WixWebhookPayload(BaseModel):
    event: str
    source: str
    data: dict
    timestamp: Optional[str] = None


def verify_wix_signature(request_body: bytes, signature: str) -> bool:
    """Verify Wix webhook signature"""
    webhook_secret = os.getenv("WEBHOOK_SECRET", "")
    expected_signature = hmac.new(
        webhook_secret.encode(),
        request_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


@router.post("/v1/donations/create")
async def create_donation_from_wix(
    donation_data: WixDonationRequest,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create donation invoice from Wix
    Returns address, memo, QR code for crypto payment
    """
    # Verify API key
    if x_api_key != WC_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Generate invoice ID
    invoice_id = str(uuid.uuid4())
    donation_id = str(uuid.uuid4())
    
    # Get wallet address (simplified - in production, use wallet service)
    # For now, use a placeholder or get from wallets table
    to_address = "XxxSampleAddressFromWalletPool"  # Replace with actual wallet logic
    memo = donation_data.memo or f"HingeCraft-{invoice_id[:8]}"
    
    # Generate QR code (simplified - in production, use qrcode library)
    qr_content = f"{to_address}{(':' + memo) if memo else ''}"
    qr_b64 = generate_qr_base64(qr_content)
    
    # Insert donation record
    query = """
        INSERT INTO donations (
            id, created_at, created_by, donor_name, donor_email,
            chain, token, amount_crypto, amount_usd,
            to_address, memo, status, earmark,
            "_id", "_createdDate", "_updatedDate", "_owner"
        ) VALUES (
            :id, NOW(), NULL, :donor_name, :donor_email,
            :chain, :token, :amount_crypto, :amount_usd,
            :to_address, :memo, 'created', :earmark,
            :_id, NOW(), NOW(), 'system'
        )
        RETURNING id, invoice_id
    """
    
    # Determine token from chain
    token_map = {
        "solana": "SOL",
        "stellar": "XLM",
        "bitcoin": "BTC",
        "ethereum": "ETH"
    }
    token = token_map.get(donation_data.chain.lower(), "USDC")
    
    # Extract donor info
    donor_name = None
    donor_email = None
    if donation_data.donorInfo:
        donor_name = donation_data.donorInfo.get("name")
        donor_email = donation_data.donorInfo.get("email")
    
    # For now, assume 1:1 crypto:USD (in production, use exchange rate API)
    amount_crypto = donation_data.amountUsd
    
    db.execute(query, {
        "id": donation_id,
        "_id": donation_id,
        "donor_name": donor_name,
        "donor_email": donor_email,
        "chain": donation_data.chain,
        "token": token,
        "amount_crypto": amount_crypto,
        "amount_usd": donation_data.amountUsd,
        "to_address": to_address,
        "memo": memo,
        "earmark": donation_data.earmark
    })
    db.commit()
    
    return {
        "invoice_id": invoice_id,
        "address": to_address,
        "memo": memo,
        "qr_url": f"data:image/png;base64,{qr_b64}",
        "chain": donation_data.chain,
        "token": token,
        "amount_usd": donation_data.amountUsd
    }


@router.post("/webhooks/wix")
async def receive_wix_webhook(
    request: Request,
    x_wix_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Receive webhook from Wix
    Example payload: {"event":"form_submit","source":"wix:donate_form","data":{...}}
    """
    body = await request.body()
    
    # Verify signature if provided
    if x_wix_signature:
        if not verify_wix_signature(body, x_wix_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    import json
    payload = json.loads(body)
    
    # Store webhook
    webhook_id = str(uuid.uuid4())
    query = """
        INSERT INTO webhooks (
            id, provider, payload, received_at, processed
        ) VALUES (
            :id, 'wix', :payload, NOW(), false
        )
    """
    
    db.execute(query, {
        "id": webhook_id,
        "payload": json.dumps(payload)
    })
    db.commit()
    
    # Process webhook based on event type
    event_type = payload.get("event")
    if event_type == "form_submit":
        # Handle form submission
        data = payload.get("data", {})
        # Process donation or other form data
        pass
    
    return {"status": "received", "webhook_id": webhook_id}


def generate_qr_base64(content: str) -> str:
    """Generate QR code and return as base64"""
    try:
        import qrcode
        import io
        import base64
        
        img = qrcode.make(content)
        buff = io.BytesIO()
        img.save(buff, format='PNG')
        return base64.b64encode(buff.getvalue()).decode()
    except ImportError:
        # Fallback if qrcode not installed
        return ""


@router.get("/v1/wix/sync")
async def sync_wix_content(
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Sync content from Wix CMS to database
    """
    if x_api_key != WC_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # In production, fetch from Wix API and sync to cms_posts table
    return {"status": "sync_initiated", "message": "Content sync started"}
