# app/main.py
from __future__ import annotations

from functools import lru_cache

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic_settings import BaseSettings

from app.db.base import Base, engine
from app.routes.reports import router as reports_router  # ensure file exists
try:
    # Optional routers (only if you've added them)
    from app.routes.actions import router as actions_router  # type: ignore
except Exception:  # pragma: no cover
    actions_router = None  # type: ignore
try:
    from app.routes.insights import router as insights_router  # type: ignore
except Exception:  # pragma: no cover
    insights_router = None  # type: ignore

from app.routes.scan import router as scan_router
from app.routes.senders import router as senders_router
from app.routes.audit import router as audit_router
from app.oauth.routes import router as oauth_router


from app.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.APP_NAME)

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Must be explicit for credentials
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Required for OAuth flow state parameter
    app.add_middleware(
        SessionMiddleware,
        secret_key="secret-session-key-for-dev-only"
    )

    # Routers
    app.include_router(reports_router)
    if actions_router:
        app.include_router(actions_router)  # /actions/plan
    if insights_router:
        app.include_router(insights_router)  # /insights/unsubscribe_stats
    app.include_router(scan_router)
    app.include_router(senders_router)
    app.include_router(audit_router)
    app.include_router(oauth_router)

    @app.on_event("startup")
    async def startup_create_tables() -> None:
        # For dev/test convenience only; in prod rely on Alembic migrations.
        if settings.DEV_CREATE_ALL:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

    @app.get("/")
    def root() -> dict[str, str]:
        return {"app": settings.APP_NAME, "owner": settings.OWNER_EMAIL}

    return app


# Uvicorn/Gunicorn entrypoint
app = create_app()
