"""Wallets API endpoints"""
from fastapi import APIRouter
router = APIRouter()

@router.post("/derive")
async def derive_wallet():
    """Admin: create/derive new receiving address"""
    pass

