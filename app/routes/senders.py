from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.base import get_async_session, User
from app.jobs.scanner import GmailScanner
from app.config import get_settings

router = APIRouter(prefix="/senders", tags=["senders"])

@router.get("")
async def get_senders(category: Optional[str] = None, page_token: Optional[str] = None, db: AsyncSession = Depends(get_async_session)):
    settings = get_settings()
    result = await db.execute(select(User).where(User.email == settings.OWNER_EMAIL))
    user = result.scalars().first()
    
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authenticated")

    scanner = GmailScanner(user)
    import asyncio
    real_senders = await asyncio.to_thread(scanner.get_senders, 50, category, page_token)
    return real_senders

@router.get("/{sender_id}")
async def get_sender(sender_id: str, db: AsyncSession = Depends(get_async_session)):
    settings = get_settings()
    result = await db.execute(select(User).where(User.email == settings.OWNER_EMAIL))
    user = result.scalars().first()
    
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authenticated")

    scanner = GmailScanner(user)
    import asyncio
    real_senders = await asyncio.to_thread(scanner.get_senders, 50)
    
    for sender in real_senders:
        if sender["id"] == sender_id:
            return sender
            
    raise HTTPException(status_code=404, detail="Sender not found in recent history")
