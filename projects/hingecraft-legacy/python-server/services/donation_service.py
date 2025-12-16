"""
Donation service - Business logic for donations
"""

import json
from typing import Optional, Dict, List
from datetime import datetime
import uuid

from python_server.database import execute_query, execute_one, execute_command

class DonationService:
    """Service for managing donations"""
    
    async def get_latest(self) -> Optional[Dict]:
        """Get the latest donation"""
        query = """
            SELECT id, amount, currency, is_other_amount, created_at
            FROM donations
            ORDER BY created_at DESC
            LIMIT 1
        """
        result = await execute_one(query)
        if result:
            return dict(result)
        return None
    
    async def get_by_id(self, donation_id: str) -> Optional[Dict]:
        """Get donation by ID"""
        query = "SELECT * FROM donations WHERE id = $1"
        result = await execute_one(query, donation_id)
        if result:
            return dict(result)
        return None
    
    async def create(self, data: Dict) -> Dict:
        """Create a new donation"""
        donation_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        query = """
            INSERT INTO donations (
                id, amount, currency, is_other_amount, source, payment_status,
                payment_method, transaction_id, member_email, member_name,
                created_at, updated_at, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, amount, currency, is_other_amount, created_at
        """
        
        metadata_json = json.dumps(data.get("metadata")) if data.get("metadata") else None
        
        result = await execute_one(
            query,
            donation_id,
            data["amount"],
            data.get("currency", "USD"),
            data.get("is_other_amount", False),
            data.get("source", "payment_page"),
            data.get("payment_status", "completed"),
            data.get("payment_method"),
            data.get("transaction_id"),
            data.get("member_email"),
            data.get("member_name"),
            now,
            now,
            metadata_json
        )
        
        return dict(result)
    
    async def update(self, donation_id: str, updates: Dict) -> Optional[Dict]:
        """Update donation"""
        allowed_fields = [
            "payment_status", "payment_method", "transaction_id",
            "member_email", "member_name", "metadata"
        ]
        
        update_fields = []
        values = []
        param_count = 1
        
        for field in allowed_fields:
            if field in updates:
                if field == "metadata":
                    update_fields.append(f"{field} = ${param_count}::jsonb")
                    values.append(json.dumps(updates[field]))
                else:
                    update_fields.append(f"{field} = ${param_count}")
                    values.append(updates[field])
                param_count += 1
        
        if not update_fields:
            return None
        
        # Always update updated_at
        update_fields.append(f"updated_at = ${param_count}")
        values.append(datetime.utcnow())
        param_count += 1
        
        values.append(donation_id)
        
        query = f"""
            UPDATE donations
            SET {', '.join(update_fields)}
            WHERE id = ${param_count}
            RETURNING id, payment_status, updated_at
        """
        
        result = await execute_one(query, *values)
        if result:
            return dict(result)
        return None
    
    async def list_all(self, limit: int = 100, offset: int = 0) -> Dict:
        """List all donations with pagination"""
        # Get total count
        count_query = "SELECT COUNT(*) FROM donations"
        total_result = await execute_one(count_query)
        total = total_result["count"] if total_result else 0
        
        # Get donations
        query = """
            SELECT * FROM donations
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        """
        donations = await execute_query(query, limit, offset)
        
        return {
            "donations": [dict(d) for d in donations],
            "total": total,
            "limit": limit,
            "offset": offset
        }

