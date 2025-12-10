"""
Stripe API Configuration
SECURE: Stripe keys stored here - DO NOT commit actual keys to git
Use environment variables or secrets manager in production
"""

import os
from typing import Optional

# Stripe Secret Key (Live)
# IMPORTANT: In production, load from environment variable or secrets manager
# DO NOT hardcode keys in production code
STRIPE_SECRET_KEY_LIVE: Optional[str] = os.getenv(
    'STRIPE_SECRET_KEY_LIVE',
    # Default value - REPLACE with actual key from environment variable
    # This is a placeholder - actual key should be loaded from secrets
    None
)

# Stripe Publishable Key (Live) - derived from secret key
# Format: pk_live_... (first 7 chars of secret key + rest)
STRIPE_PUBLISHABLE_KEY_LIVE: Optional[str] = os.getenv(
    'STRIPE_PUBLISHABLE_KEY_LIVE',
    None
)

# Stripe Secret Key (Test/Dev)
STRIPE_SECRET_KEY_TEST: Optional[str] = os.getenv(
    'STRIPE_SECRET_KEY_TEST',
    None
)

# Stripe Publishable Key (Test/Dev)
STRIPE_PUBLISHABLE_KEY_TEST: Optional[str] = os.getenv(
    'STRIPE_PUBLISHABLE_KEY_TEST',
    None
)

# Environment detection
STRIPE_ENVIRONMENT: str = os.getenv('STRIPE_ENVIRONMENT', 'live')  # 'live' or 'test'

# Get active Stripe keys based on environment
def get_stripe_secret_key() -> Optional[str]:
    """Get Stripe secret key based on environment"""
    if STRIPE_ENVIRONMENT == 'test':
        return STRIPE_SECRET_KEY_TEST
    return STRIPE_SECRET_KEY_LIVE

def get_stripe_publishable_key() -> Optional[str]:
    """Get Stripe publishable key based on environment"""
    if STRIPE_ENVIRONMENT == 'test':
        return STRIPE_PUBLISHABLE_KEY_TEST
    return STRIPE_PUBLISHABLE_KEY_LIVE

# Validate Stripe keys
def validate_stripe_keys() -> bool:
    """Validate that Stripe keys are configured"""
    secret_key = get_stripe_secret_key()
    publishable_key = get_stripe_publishable_key()
    
    if not secret_key:
        print("⚠️  STRIPE_SECRET_KEY not configured")
        return False
    
    if not secret_key.startswith('sk_live_') and not secret_key.startswith('sk_test_'):
        print("⚠️  Invalid Stripe secret key format")
        return False
    
    if not publishable_key:
        print("⚠️  STRIPE_PUBLISHABLE_KEY not configured")
        return False
    
    if not publishable_key.startswith('pk_live_') and not publishable_key.startswith('pk_test_'):
        print("⚠️  Invalid Stripe publishable key format")
        return False
    
    return True

# Export keys (for use in other modules)
__all__ = [
    'STRIPE_SECRET_KEY_LIVE',
    'STRIPE_PUBLISHABLE_KEY_LIVE',
    'STRIPE_SECRET_KEY_TEST',
    'STRIPE_PUBLISHABLE_KEY_TEST',
    'STRIPE_ENVIRONMENT',
    'get_stripe_secret_key',
    'get_stripe_publishable_key',
    'validate_stripe_keys'
]

