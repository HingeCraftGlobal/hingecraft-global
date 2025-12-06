"""
Authentication and Login API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from api.database import get_db
from api.auth import verify_token

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    role: Optional[str] = "user"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    role: str


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    role: str
    created_at: datetime


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user
    """
    import uuid
    
    # Check if user already exists
    query = "SELECT id FROM users WHERE email = :email"
    result = db.execute(query, {"email": user_data.email})
    if result.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    password_hash = get_password_hash(user_data.password)
    
    insert_query = """
        INSERT INTO users (
            id, email, display_name, role, created_at, updated_at,
            "_id", "_createdDate", "_updatedDate", "_owner"
        ) VALUES (
            :id, :email, :display_name, :role, NOW(), NOW(),
            :_id, NOW(), NOW(), 'system'
        )
        RETURNING id, email, display_name, role, created_at
    """
    
    result = db.execute(insert_query, {
        "id": user_id,
        "_id": user_id,
        "email": user_data.email,
        "display_name": user_data.display_name or user_data.email.split("@")[0],
        "role": user_data.role
    })
    
    # Create authentication record
    auth_query = """
        INSERT INTO user_authentication (
            "_id", "_createdDate", "_updatedDate", user_id, username,
            password_hash, email, is_active
        ) VALUES (
            :_id, NOW(), NOW(), :user_id, :username,
            :password_hash, :email, true
        )
    """
    
    db.execute(auth_query, {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "username": user_data.email,
        "password_hash": password_hash,
        "email": user_data.email
    })
    
    db.commit()
    row = result.fetchone()
    
    return UserResponse(
        id=row[0],
        email=row[1],
        display_name=row[2],
        role=row[3],
        created_at=row[4]
    )


@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT token
    """
    # Find user by email
    query = """
        SELECT ua.user_id, ua.password_hash, ua.is_active, ua.is_locked,
               u.email, u.role
        FROM user_authentication ua
        JOIN users u ON u.id = ua.user_id
        WHERE ua.email = :email
    """
    
    result = db.execute(query, {"email": login_data.email})
    user = result.fetchone()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id, password_hash, is_active, is_locked, email, role = user
    
    # Check if account is locked
    if is_locked:
        raise HTTPException(status_code=403, detail="Account is locked")
    
    # Check if account is active
    if not is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    # Verify password
    if not verify_password(login_data.password, password_hash):
        # Update failed login attempts
        update_query = """
            UPDATE user_authentication
            SET failed_login_attempts = failed_login_attempts + 1,
                last_failed_login = NOW()
            WHERE user_id = :user_id
        """
        db.execute(update_query, {"user_id": user_id})
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Reset failed login attempts on successful login
    update_query = """
        UPDATE user_authentication
        SET failed_login_attempts = 0,
            last_login = NOW()
        WHERE user_id = :user_id
    """
    db.execute(update_query, {"user_id": user_id})
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id, "email": email, "role": role},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user_id,
        email=email,
        role=role
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    query = """
        SELECT id, email, display_name, role, created_at
        FROM users
        WHERE id = :user_id
    """
    
    result = db.execute(query, {"user_id": user_id})
    user = result.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user[0],
        email=user[1],
        display_name=user[2],
        role=user[3],
        created_at=user[4]
    )


@router.post("/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Logout user (token invalidation handled client-side)
    """
    return {"message": "Successfully logged out"}



