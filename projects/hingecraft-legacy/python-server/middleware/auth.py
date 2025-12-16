"""
Authentication middleware
"""

from fastapi import Header, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from python_server.config import settings

security = HTTPBearer()

async def verify_api_key(
    authorization: HTTPAuthorizationCredentials = Security(security),
    x_api_key: str = Header(None, alias="X-API-Key")
):
    """Verify API key from Authorization header or X-API-Key header"""
    provided_key = None
    
    if authorization:
        provided_key = authorization.credentials
    elif x_api_key:
        provided_key = x_api_key
    
    if not provided_key or provided_key != settings.API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized. Invalid API key."
        )
    
    return provided_key

