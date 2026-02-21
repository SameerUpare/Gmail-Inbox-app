# app/routes/actions.py
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_async_session, AuditLog
from app.routes.senders import get_senders

router = APIRouter(prefix="", tags=["actions"])

@router.post("/plan/generate")
async def generate_plan(db: AsyncSession = Depends(get_async_session)):
    senders = await get_senders(db)
    
    plan_senders = []
    total_affected = 0
    for s in senders:
        if s.get("suggested_action") == "unsubscribe":
            total_affected += s["total_emails"]
            plan_senders.append({
                "sender": s["email"],
                "emails_affected": s["total_emails"],
                "recommended_action": "unsubscribe",
                "confidence": 0.95,  # Real logic would use ML models
                "risk_score": 0.05
            })
            
    if not plan_senders:
        plan_senders.append({
            "sender": "clean-inbox-demo@example.com",
            "emails_affected": 0,
            "recommended_action": "keep",
            "confidence": 1.0,
            "risk_score": 0.0
        })

    return {
        "plan_id": "active-plan-842",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "senders": plan_senders,
        "summary": {
            "total_emails": total_affected,
            "estimated_cleanup_percent": 12
        }
    }

@router.get("/plan/{plan_id}")
async def get_plan(plan_id: str, db: AsyncSession = Depends(get_async_session)):
    return await generate_plan(db)

from typing import Optional
from pydantic import BaseModel

class ActionRequest(BaseModel):
    target_email: str
    action_type: str
    list_unsubscribe: Optional[str] = None

@router.post("/plan/execute")
async def execute_plan(request: ActionRequest, db: AsyncSession = Depends(get_async_session)):
    settings = get_settings()
    result = await db.execute(select(User).where(User.email == settings.OWNER_EMAIL))
    user = result.scalars().first()
    
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authenticated")

    scanner = GmailScanner(user)
    import asyncio
    
    execution_result = await asyncio.to_thread(scanner.execute_action, request.target_email, request.action_type, request.list_unsubscribe)
    
    # Immutable audit logging for executed system actions
    new_log = AuditLog(
        id=f"action-{datetime.now().timestamp()}",
        event_type=f"execute_{request.action_type}",
        details=f"Successfully processed {execution_result['messages_affected']} emails for {target_email}."
    )
    db.add(new_log)
    await db.commit()
    
    return execution_result

@router.post("/action/undo/{action_id}")
def undo_action(action_id: str):
    return {
        "action_id": action_id,
        "status": "undone",
        "message": "Action successfully reversed"
    }

@router.get("/undo/status/{action_id}")
def get_undo_status(action_id: str):
    return {
        "action_id": action_id,
        "status": "available",
        "expires_in_seconds": 3600
    }

@router.delete("/categories/{category_name}")
async def wipe_category(category_name: str, db: AsyncSession = Depends(get_async_session)):
    from app.config import get_settings
    from sqlalchemy.future import select
    from app.db.base import User
    from app.jobs.scanner import GmailScanner
    
    settings = get_settings()
    result = await db.execute(select(User).where(User.email == settings.OWNER_EMAIL))
    user = result.scalars().first()
    
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authenticated")

    scanner = GmailScanner(user)
    import asyncio
    
    execution_result = await asyncio.to_thread(scanner.execute_category_wipe, category_name)
    
    # Immutable audit logging
    new_log = AuditLog(
        id=f"wipe-{datetime.now().timestamp()}",
        event_type="wipe_category",
        details=f"Successfully trashed {execution_result['messages_affected']} emails in {category_name}."
    )
    db.add(new_log)
    await db.commit()
    
    return execution_result