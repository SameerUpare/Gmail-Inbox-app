# app/oauth/routes.py
import os
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.db.base import get_async_session, User
from app.config import get_settings

router = APIRouter(prefix="/oauth", tags=["oauth"])

# Temporarily storing flow config via client_secret.json (or env vars)
# For this demo we'll dynamically construct it from settings if present
def build_client_config(settings):
    client_id = os.environ.get("GOOGLE_CLIENT_ID", settings.GOOGLE_CLIENT_ID)
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", settings.GOOGLE_CLIENT_SECRET)
    return {
        "web": {
            "client_id": client_id,
            "project_id": "antigravity-demo",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": client_secret,
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }

@router.get("/login")
async def login(request: Request):
    settings = get_settings()
    scopes = settings.GOOGLE_SCOPES.split(",")
    
    flow = Flow.from_client_config(
        build_client_config(settings),
        scopes=scopes,
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )
    
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    return RedirectResponse(auth_url)


@router.get("/callback")
async def callback(request: Request, db: AsyncSession = Depends(get_async_session)):
    try:
        settings = get_settings()
        scopes = settings.GOOGLE_SCOPES.split(",")
        
        flow = Flow.from_client_config(
            build_client_config(settings),
            scopes=scopes,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        
        # We must construct the full URL exactly as it was requested
        auth_response = str(request.url)
        # Bypassing http to https rewrite issues locally
        if "http://" in auth_response:
            auth_response = auth_response.replace("http://", "https://")
            
        flow.fetch_token(authorization_response=auth_response)
        
        creds = flow.credentials
        
        # Fetch user info to store in db
        service = build('oauth2', 'v2', credentials=creds)
        user_info = service.userinfo().get().execute()
        email = user_info['email']
        name = user_info.get('name', '')
        
        # Upsert User
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            user = User(email=email, name=name)
            db.add(user)
        
        current_expiry = None
        if creds.expiry:
            current_expiry = int(creds.expiry.replace(tzinfo=timezone.utc).timestamp())
            
        user.access_token = creds.token
        if creds.refresh_token:
            user.refresh_token = creds.refresh_token
        user.expires_at = current_expiry
        
        await db.commit()
        
        # Redirect back to UI dashboard
        return RedirectResponse("http://localhost:5173/")
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc(), "url": str(request.url)}

@router.get("/me")
async def get_current_user(db: AsyncSession = Depends(get_async_session)):
    settings = get_settings()
    result = await db.execute(select(User).where(User.email == settings.OWNER_EMAIL))
    user = result.scalars().first()
    if not user:
        return {"authenticated": False}
    return {"authenticated": True, "email": user.email, "name": user.name}
