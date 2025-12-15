"""
Database connection and management
"""

import asyncpg
import logging
from typing import Optional
from .config import settings

logger = logging.getLogger(__name__)

# Global connection pool
_pool: Optional[asyncpg.Pool] = None

async def init_db():
    """Initialize database connection pool"""
    global _pool
    try:
        _pool = await asyncpg.create_pool(
            settings.database_url,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        logger.info(f"Database pool created: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}")
        raise

async def close_db():
    """Close database connection pool"""
    global _pool
    if _pool:
        await _pool.close()
        logger.info("Database pool closed")
        _pool = None

def get_pool() -> asyncpg.Pool:
    """Get database connection pool"""
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_db() first.")
    return _pool

async def execute_query(query: str, *args):
    """Execute a query and return results"""
    pool = get_pool()
    async with pool.acquire() as connection:
        return await connection.fetch(query, *args)

async def execute_one(query: str, *args):
    """Execute a query and return one result"""
    pool = get_pool()
    async with pool.acquire() as connection:
        return await connection.fetchrow(query, *args)

async def execute_command(query: str, *args):
    """Execute a command (INSERT, UPDATE, DELETE)"""
    pool = get_pool()
    async with pool.acquire() as connection:
        return await connection.execute(query, *args)



