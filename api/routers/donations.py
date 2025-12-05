"""
Donations API endpoints
Enhanced with QR code generation and Wix integration
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime
import qrcode
import io
import base64
import os

from api.database import get_db
from api.auth import verify_hmac_signature, get_current_user

router = APIRouter()


class DonationCreate(BaseModel):
    chain: str
    token: str
    amount_crypto: float
    amount_usd: float
    to_address: Optional[str] = None
    from_address: Optional[str] = None
    memo: Optional[str] = None
    earmark: Optional[str] = "general"
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    anonymous: Optional[bool] = False
    source: Optional[str] = "api"  # api|wix|webhook


class DonationResponse(BaseModel):
    id: str
    invoice_id: str
    chain: str
    token: str
    amount_crypto: float
    amount_usd: float
    to_address: str
    memo: Optional[str]
    qr_url: str
    status: str
    created_at: datetime


def generate_qr_base64(content: str) -> str:
    """Generate QR code and return as base64"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(content)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buff = io.BytesIO()
    img.save(buff, format='PNG')
    return base64.b64encode(buff.getvalue()).decode()


@router.post("/create", response_model=DonationResponse)
async def create_donation(
    donation: DonationCreate,
    request: Request,
    x_hc_signature: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create a new donation invoice
    Returns invoice_id, address, memo, qr_url
    """
    # Verify API key or HMAC signature
    API_KEY = os.getenv("WC_API_KEY", "changeme")
    if x_api_key and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if x_hc_signature:
        body = await request.body()
        if not verify_hmac_signature(body, x_hc_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Generate invoice ID
    invoice_id = f"INV-{uuid.uuid4().hex[:12].upper()}"
    
    # Get or create wallet address
    if not donation.to_address:
        # Query for available wallet address for this chain
        wallet_query = """
            SELECT address FROM wallets
            WHERE chain = :chain AND active = true
            LIMIT 1
        """
        result = db.execute(wallet_query, {"chain": donation.chain})
        wallet = result.fetchone()
        if wallet:
            donation.to_address = wallet[0]
        else:
            # Generate or derive address (implement wallet derivation logic)
            donation.to_address = f"PLACEHOLDER_ADDRESS_{donation.chain.upper()}"
    
    # Create donation record
    donation_id = str(uuid.uuid4())
    
    # Generate QR code
    qr_content = donation.to_address
    if donation.memo:
        qr_content = f"{donation.to_address}:{donation.memo}"
    qr_base64 = generate_qr_base64(qr_content)
    qr_url = f"data:image/png;base64,{qr_base64}"
    
    # Insert into database
    query = """
        INSERT INTO donations (
            id, "_id", created_at, created_by, donor_name, donor_email,
            anonymous, chain, token, amount_crypto, amount_usd,
            to_address, from_address, memo, earmark, status,
            "_createdDate", "_updatedDate", "_owner", metadata
        ) VALUES (
            :id, :_id, NOW(), :created_by, :donor_name, :donor_email,
            :anonymous, :chain, :token, :amount_crypto, :amount_usd,
            :to_address, :from_address, :memo, :earmark, 'created',
            NOW(), NOW(), 'system', :metadata
        )
        RETURNING id, created_at
    """
    
    result = db.execute(query, {
        "id": donation_id,
        "_id": donation_id,
        "created_by": None,  # Will be set if user is authenticated
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "anonymous": donation.anonymous,
        "chain": donation.chain,
        "token": donation.token,
        "amount_crypto": donation.amount_crypto,
        "amount_usd": donation.amount_usd,
        "to_address": donation.to_address,
        "from_address": donation.from_address,
        "memo": donation.memo,
        "earmark": donation.earmark,
        "metadata": {"source": donation.source, "invoice_id": invoice_id}
    })
    
    db.commit()
    row = result.fetchone()
    
    return DonationResponse(
        id=row[0],
        invoice_id=invoice_id,
        chain=donation.chain,
        token=donation.token,
        amount_crypto=donation.amount_crypto,
        amount_usd=donation.amount_usd,
        to_address=donation.to_address,
        memo=donation.memo,
        qr_url=qr_url,
        status="created",
        created_at=row[1]
    )


@router.get("/{invoice_id}")
async def get_donation(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Get donation record by invoice_id"""
    query = """
        SELECT id, created_at, donor_name, donor_email, chain, token,
               amount_crypto, amount_usd, to_address, from_address, memo,
               txid, confirmations, status, earmark
        FROM donations
        WHERE metadata->>'invoice_id' = :invoice_id
    """
    
    result = db.execute(query, {"invoice_id": invoice_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    return {
        "id": row[0],
        "created_at": row[1],
        "donor_name": row[2],
        "donor_email": row[3],
        "chain": row[4],
        "token": row[5],
        "amount_crypto": float(row[6]),
        "amount_usd": float(row[7]),
        "to_address": row[8],
        "from_address": row[9],
        "memo": row[10],
        "txid": row[11],
        "confirmations": row[12],
        "status": row[13],
        "earmark": row[14]
    }


@router.get("/tx/{txid}")
async def get_donation_by_txid(
    txid: str,
    db: Session = Depends(get_db)
):
    """Lookup donation by transaction ID"""
    query = """
        SELECT id, created_at, chain, token, amount_crypto, amount_usd,
               to_address, from_address, memo, txid, confirmations, status
        FROM donations
        WHERE txid = :txid
    """
    
    result = db.execute(query, {"txid": txid})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    return {
        "id": row[0],
        "created_at": row[1],
        "chain": row[2],
        "token": row[3],
        "amount_crypto": float(row[4]),
        "amount_usd": float(row[5]),
        "to_address": row[6],
        "from_address": row[7],
        "memo": row[8],
        "txid": row[9],
        "confirmations": row[10],
        "status": row[11]
    }
