"""Webhooks API endpoints"""
from fastapi import APIRouter, Request, Header
from typing import Optional
router = APIRouter()

@router.post("/{provider}")
async def receive_webhook(
    provider: str,
    request: Request,
    x_hc_signature: Optional[str] = Header(None)
):
    """Authenticated webhook ingest (HMAC)"""
    body = await request.body()
    # Verify HMAC signature
    # Process webhook
    pass

