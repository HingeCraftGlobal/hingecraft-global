"""
API Keys Manager
Secure management of API keys and credentials
"""

import json
from pathlib import Path
from typing import Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)


class APIKeysManager:
    """Manage API keys and credentials"""
    
    def __init__(self, keys_dir: Optional[Path] = None):
        if keys_dir is None:
            keys_dir = Path(__file__).parent / "api_keys"
        self.keys_dir = Path(keys_dir)
        self.keys_dir.mkdir(exist_ok=True)
    
    def save_credentials(self, service: str, credentials: Dict[str, Any]) -> bool:
        """
        Save credentials for a service
        
        Args:
            service: Service name (e.g., 'indeed', 'headhunter')
            credentials: Dictionary of credentials
        
        Returns:
            True if saved successfully
        """
        try:
            cred_file = self.keys_dir / f"{service}.json"
            with open(cred_file, 'w') as f:
                json.dump(credentials, f, indent=2)
            logger.info(f"Saved credentials for {service}")
            return True
        except Exception as e:
            logger.error(f"Failed to save credentials for {service}: {e}")
            return False
    
    def load_credentials(self, service: str) -> Optional[Dict[str, Any]]:
        """
        Load credentials for a service
        
        Args:
            service: Service name
        
        Returns:
            Credentials dictionary or None
        """
        cred_file = self.keys_dir / f"{service}.json"
        
        # Try actual file first
        if cred_file.exists():
            try:
                with open(cred_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load credentials for {service}: {e}")
        
        # Try template file
        template_file = self.keys_dir / f"{service}.json.template"
        if template_file.exists():
            logger.warning(f"Using template file for {service}. Please fill in actual credentials.")
            try:
                with open(template_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load template for {service}: {e}")
        
        return None
    
    def get_api_key(self, service: str, key_name: str = "api_key") -> Optional[str]:
        """Get a specific API key"""
        creds = self.load_credentials(service)
        if creds:
            return creds.get(key_name)
        return None
    
    def get_client_id(self, service: str) -> Optional[str]:
        """Get client ID for OAuth services"""
        return self.get_api_key(service, "client_id")
    
    def get_client_secret(self, service: str) -> Optional[str]:
        """Get client secret for OAuth services"""
        return self.get_api_key(service, "client_secret")
    
    def list_services(self) -> List[str]:
        """List all services with credentials"""
        services = []
        for file in self.keys_dir.glob("*.json"):
            if not file.name.endswith(".template"):
                services.append(file.stem)
        return services

