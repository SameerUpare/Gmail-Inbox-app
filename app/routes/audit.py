# app/routes/audit.py
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter(prefix="/audit", tags=["audit"])

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends
from app.db.base import get_async_session, AuditLog

@router.get("/logs")
async def get_audit_logs(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50))
    logs = result.scalars().all()
    
    if not logs:
        return []
        
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp,
            "event_type": log.event_type,
            "details": log.details
        }
        for log in logs
    ]
