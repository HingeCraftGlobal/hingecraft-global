"""
HingeCraft FastAPI Backend
Custom-built API with full control over schema/queries
"""

from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from typing import Optional

from api.routers import donations, wallets, compliance, receipts, admin, webhooks
from api.database import get_db, init_db
from api.auth import verify_token, get_current_user
from api.middleware import logging_middleware, error_handler

# Initialize FastAPI app
app = FastAPI(
    title="HingeCraft API",
    description="Custom-built API for HingeCraft platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.middleware("http")(logging_middleware)
app.middleware("http")(error_handler)

# Include routers
app.include_router(donations.router, prefix="/v1/donations", tags=["Donations"])
app.include_router(wallets.router, prefix="/v1/wallets", tags=["Wallets"])
app.include_router(compliance.router, prefix="/v1/compliance", tags=["Compliance"])
app.include_router(receipts.router, prefix="/v1/receipts", tags=["Receipts"])
app.include_router(admin.router, prefix="/v1/admin", tags=["Admin"])
app.include_router(webhooks.router, prefix="/v1/webhooks", tags=["Webhooks"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    print("✅ Database initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "HingeCraft API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db = next(get_db())
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Unhealthy: {str(e)}")


@app.get("/v1/info")
async def api_info():
    """API information"""
    return {
        "api_version": "v1",
        "endpoints": {
            "donations": "/v1/donations",
            "wallets": "/v1/wallets",
            "compliance": "/v1/compliance",
            "receipts": "/v1/receipts",
            "admin": "/v1/admin",
            "webhooks": "/v1/webhooks"
        }
    }

