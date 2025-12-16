"""
Donation API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

from python_server.database import execute_query, execute_one, execute_command
from python_server.middleware.auth import verify_api_key
from python_server.services.donation_service import DonationService

router = APIRouter()

# Request/Response models
class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Donation amount")
    currency: str = Field(default="USD", description="Currency code")
    is_other_amount: bool = Field(default=False, description="Is custom amount")
    source: str = Field(default="payment_page", description="Source of donation")
    payment_status: str = Field(default="completed", description="Payment status")
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    member_email: Optional[str] = None
    member_name: Optional[str] = None
    metadata: Optional[dict] = None

class DonationResponse(BaseModel):
    id: str
    amount: float
    currency: str
    is_other_amount: bool
    created_at: datetime

class DonationUpdate(BaseModel):
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    member_email: Optional[str] = None
    member_name: Optional[str] = None
    metadata: Optional[dict] = None

@router.get("/latest", dependencies=[Depends(verify_api_key)])
async def get_latest_donation():
    """Get the latest donation"""
    service = DonationService()
    donation = await service.get_latest()
    if not donation:
        raise HTTPException(status_code=404, detail="No donations found")
    return donation

@router.post("", dependencies=[Depends(verify_api_key)], status_code=201)
async def create_donation(donation: DonationCreate):
    """Create a new donation"""
    service = DonationService()
    result = await service.create(donation.dict())
    return result

@router.get("", dependencies=[Depends(verify_api_key)])
async def list_donations(limit: int = 100, offset: int = 0):
    """List all donations with pagination"""
    service = DonationService()
    result = await service.list_all(limit=limit, offset=offset)
    return result

@router.get("/{donation_id}", dependencies=[Depends(verify_api_key)])
async def get_donation(donation_id: str):
    """Get donation by ID"""
    service = DonationService()
    donation = await service.get_by_id(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation

@router.patch("/{donation_id}", dependencies=[Depends(verify_api_key)])
async def update_donation(donation_id: str, update: DonationUpdate):
    """Update donation"""
    service = DonationService()
    result = await service.update(donation_id, update.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Donation not found")
    return result

