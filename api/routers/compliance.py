"""Compliance API endpoints"""
from fastapi import APIRouter
router = APIRouter()

@router.post("/kyc/start")
async def start_kyc():
    """Start KYC via provider"""
    pass

@router.get("/kyc/{kyc_id}")
async def get_kyc_status(kyc_id: str):
    """Get KYC status"""
    pass



