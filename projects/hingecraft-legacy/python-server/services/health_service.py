"""
Health service - System health monitoring
"""

from python_server.database import get_pool

class HealthService:
    """Service for health checks"""
    
    async def check_database(self) -> bool:
        """Check database connectivity"""
        try:
            pool = get_pool()
            async with pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return True
        except Exception:
            return False

