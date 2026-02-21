import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Provide defaults so `Settings()` is mypy-safe; env will override at runtime.
    APP_NAME: str = "Gmail Inbox Cleaner"
    OWNER_EMAIL: str = "owner@example.com"
    GOOGLE_CLIENT_ID: str = "dummy-client-id"
    GOOGLE_CLIENT_SECRET: str = "dummy-client-secret"
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/oauth/callback"
    GOOGLE_SCOPES: str = "https://www.googleapis.com/auth/gmail.modify,openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile"
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    # Enable/disable dev auto-creation of tables at startup (migrations in prod)
    DEV_CREATE_ALL: bool = True

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

@lru_cache
def get_settings() -> Settings:
    return Settings()
