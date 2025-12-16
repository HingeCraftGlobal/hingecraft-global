"""
HingeCraft Modular Python Server Pipeline
Main entry point for the server
"""

import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from python_server.config import settings
from python_server.database import init_db, close_db
from python_server.api import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    logger.info("Starting HingeCraft Python Server...")
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down HingeCraft Python Server...")
    await close_db()
    logger.info("Database closed")

# Create FastAPI app
app = FastAPI(
    title="HingeCraft Backend API",
    description="Modular Python server pipeline for HingeCraft donations and membership",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "HingeCraft Backend API",
        "version": "1.0.0",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "python_server.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

