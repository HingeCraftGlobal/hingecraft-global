"""
Donations API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from api.database import get_db
from api.auth import verify_hmac_signature, get_current_user

router = APIRouter()


class DonationCreate(BaseModel):
    chain: str
    token: str
    amount_crypto: float
    amount_usd: float
    to_address: str
    from_address: Optional[str] = None
    memo: Optional[str] = None
    earmark: Optional[str] = "general"
    member_email: Optional[str] = None
    member_name: Optional[str] = None


class DonationResponse(BaseModel):
    id: str
    invoice_id: str
    chain: str
    token: str
    amount_crypto: float
    amount_usd: float
    to_address: str
    status: str
    created_at: datetime


@router.post("/create", response_model=DonationResponse)
async def create_donation(
    donation: DonationCreate,
    x_hc_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create a new donation invoice
    Returns invoice_id, address, memo, qr_url
    """
    # Verify HMAC signature if provided
    if x_hc_signature:
        # Verify signature logic here
        pass
    
    # Generate invoice ID
    invoice_id = f"INV-{uuid.uuid4().hex[:12].upper()}"
    
    # Create donation record
    donation_id = str(uuid.uuid4())
    
    # Insert into database
    query = """
        INSERT INTO donations (
            id, invoice_id, chain, token, amount_crypto, amount_usd,
            to_address, from_address, memo, earmark, status,
            created_at, updated_at, "_id", "_createdDate", "_updatedDate", "_owner"
        ) VALUES (
            :id, :invoice_id, :chain, :token, :amount_crypto, :amount_usd,
            :to_address, :from_address, :memo, :earmark, 'created',
            NOW(), NOW(), :_id, NOW(), NOW(), 'system'
        )
        RETURNING id, invoice_id, chain, token, amount_crypto, amount_usd,
                  to_address, status, created_at
    """
    
    result = db.execute(query, {
        "id": donation_id,
        "_id": donation_id,
        "invoice_id": invoice_id,
        "chain": donation.chain,
        "token": donation.token,
        "amount_crypto": donation.amount_crypto,
        "amount_usd": donation.amount_usd,
        "to_address": donation.to_address,
        "from_address": donation.from_address,
        "memo": donation.memo,
        "earmark": donation.earmark
    })
    
    db.commit()
    row = result.fetchone()
    
    return DonationResponse(
        id=row[0],
        invoice_id=row[1],
        chain=row[2],
        token=row[3],
        amount_crypto=float(row[4]),
        amount_usd=float(row[5]),
        to_address=row[6],
        status=row[7],
        created_at=row[8]
    )


@router.get("/{invoice_id}")
async def get_donation(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Get donation record by invoice_id"""
    query = """
        SELECT id, invoice_id, chain, token, amount_crypto, amount_usd,
               to_address, from_address, memo, txid, confirmations, status,
               created_at, updated_at
        FROM donations
        WHERE invoice_id = :invoice_id
    """
    
    result = db.execute(query, {"invoice_id": invoice_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    return {
        "id": row[0],
        "invoice_id": row[1],
        "chain": row[2],
        "token": row[3],
        "amount_crypto": float(row[4]),
        "amount_usd": float(row[5]),
        "to_address": row[6],
        "from_address": row[7],
        "memo": row[8],
        "txid": row[9],
        "confirmations": row[10],
        "status": row[11],
        "created_at": row[12],
        "updated_at": row[13]
    }


@router.get("/tx/{txid}")
async def get_donation_by_txid(
    txid: str,
    db: Session = Depends(get_db)
):
    """Lookup donation by transaction ID"""
    query = """
        SELECT id, invoice_id, chain, token, amount_crypto, amount_usd,
               to_address, from_address, memo, txid, confirmations, status,
               created_at
        FROM donations
        WHERE txid = :txid
    """
    
    result = db.execute(query, {"txid": txid})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    return {
        "id": row[0],
        "invoice_id": row[1],
        "chain": row[2],
        "token": row[3],
        "amount_crypto": float(row[4]),
        "amount_usd": float(row[5]),
        "to_address": row[6],
        "from_address": row[7],
        "memo": row[8],
        "txid": row[9],
        "confirmations": row[10],
        "status": row[11],
        "created_at": row[12]
    }

