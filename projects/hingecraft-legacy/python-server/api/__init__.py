"""
API routes module
"""

from fastapi import APIRouter
from python_server.api import donations, health

router = APIRouter()

# Include sub-routers
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(donations.router, prefix="/donations", tags=["donations"])

