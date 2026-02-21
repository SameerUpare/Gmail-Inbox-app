from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_async_session
from app.routes.senders import get_senders

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/unsubscribe-candidates")
async def get_unsubscribe_candidates(db: AsyncSession = Depends(get_async_session)):
    payload = await get_senders(db=db)
    senders = payload.get("senders", [])
    return [s for s in senders if s["suggested_action"] == "unsubscribe"]