"""
Configuration management for HingeCraft Python Server
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "hingecraft_db"
    DB_USER: str = "hingecraft_user"
    DB_PASSWORD: str = "hingecraft_secure_password_123"
    
    # Security
    SECRET_KEY: str = "hingecraft_secret_key_change_in_production"
    API_KEY: str = "hingecraft_secret_key_change_in_production"
    
    # CORS - accept string and convert to list
    CORS_ORIGINS: Union[str, List[str]] = "*"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator('HOST', 'PORT', 'DEBUG', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'SECRET_KEY', 'API_KEY', 'LOG_LEVEL', mode='before')
    @classmethod
    def get_from_env(cls, v, info):
        """Get value from environment variable if not provided"""
        field_name = info.field_name
        env_value = os.getenv(field_name)
        if env_value is not None:
            if field_name in ['PORT', 'DB_PORT']:
                return int(env_value)
            elif field_name == 'DEBUG':
                return env_value.lower() == "true"
            return env_value
        return v
    
    @property
    def database_url(self) -> str:
        """Get database connection URL"""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()



