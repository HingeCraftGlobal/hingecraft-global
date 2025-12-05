"""Custom middleware"""
from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)


async def logging_middleware(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
    )
    return response


async def error_handler(request: Request, call_next):
    """Global error handler"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        raise

