"""Admin API endpoints"""
from fastapi import APIRouter, Depends
from api.auth import get_current_user
router = APIRouter()

@router.get("/ledger")
async def get_ledger(user: dict = Depends(get_current_user)):
    """Admin-only ledger export"""
    pass






