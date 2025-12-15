"""
Stripe API Configuration
SECURE: Stripe keys loaded from environment variables
DO NOT commit actual keys to git - use .env file or secrets manager
"""

import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()

class StripeConfig:
    # Stripe Secret Key (Live) - Load from environment variable
    # Set STRIPE_SECRET_KEY_LIVE environment variable or use .env file
    SECRET_KEY: Optional[str] = os.getenv(
        'STRIPE_SECRET_KEY_LIVE',
        os.getenv('STRIPE_SECRET_KEY', None)  # Fallback to old env var name
    )
    
    # Stripe Publishable Key (Live) - Load from environment variable
    # Set STRIPE_PUBLISHABLE_KEY_LIVE environment variable or use .env file
    PUBLISHABLE_KEY: Optional[str] = os.getenv(
        'STRIPE_PUBLISHABLE_KEY_LIVE',
        os.getenv('STRIPE_PUBLISHABLE_KEY', '')  # Fallback to old env var name
    )
    
    # Stripe Webhook Secret - Load from environment variable
    WEBHOOK_SECRET: Optional[str] = os.getenv('STRIPE_WEBHOOK_SECRET', '')
    
    # Stripe API Version
    API_VERSION: str = os.getenv('STRIPE_API_VERSION', '2023-10-16')
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that Stripe keys are configured"""
        if not cls.SECRET_KEY:
            print("⚠️  STRIPE_SECRET_KEY_LIVE not configured")
            return False
        
        if not cls.SECRET_KEY.startswith('sk_live_') and not cls.SECRET_KEY.startswith('sk_test_'):
            print("⚠️  Invalid Stripe secret key format")
            return False
        
        return True
    
    @classmethod
    def get_publishable_key(cls) -> str:
        """Get publishable key, derive from secret key if not set"""
        if cls.PUBLISHABLE_KEY:
            return cls.PUBLISHABLE_KEY
        
        # Derive publishable key from secret key
        if cls.SECRET_KEY:
            if cls.SECRET_KEY.startswith('sk_live_'):
                # Extract the part after sk_live_ and construct pk_live_
                return cls.SECRET_KEY.replace('sk_live_', 'pk_live_')
            elif cls.SECRET_KEY.startswith('sk_test_'):
                return cls.SECRET_KEY.replace('sk_test_', 'pk_test_')
        
        return ''

