"""
Health check endpoints
"""

from fastapi import APIRouter
from datetime import datetime
from python_server.database import get_pool

router = APIRouter()

@router.get("")
async def health_check():
    """Health check endpoint (no auth required)"""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT NOW()")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": result.isoformat() if result else datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/ready")
async def readiness_check():
    """Readiness check"""
    return {"status": "ready"}

@router.get("/live")
async def liveness_check():
    """Liveness check"""
    return {"status": "alive"}

