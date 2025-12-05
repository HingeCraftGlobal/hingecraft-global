"""
Authentication and authorization
"""

from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import hmac
import hashlib
import os

security = HTTPBearer()


def verify_hmac_signature(
    body: bytes,
    signature: str,
    secret: Optional[str] = None
) -> bool:
    """Verify HMAC signature for webhooks"""
    secret = secret or os.getenv("WEBHOOK_SECRET", "")
    expected_signature = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify JWT token"""
    token = credentials.credentials
    # Implement JWT verification here
    # For now, return a mock user
    return {"user_id": "system", "role": "admin"}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Get current authenticated user"""
    return await verify_token(credentials)

