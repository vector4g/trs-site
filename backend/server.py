"""Third Rail Systems OÜ — FastAPI entrypoint.

Thin orchestration layer. Concerns delegated to:
  - models.py          Pydantic models (StatusCheck, PilotRequest, …)
  - database.py        Mongo client + db handle
  - auth.py            ADMIN_TOKEN + require_admin dependency
  - validation.py      qualifier allowlists + CR/LF strip
  - rate_limit.py      per-IP sliding-window limiter (Redis + in-memory fallback)
  - services/email.py  All Resend send paths (notification, confirmation, briefing)
  - services/briefings.py  Briefing PDF render orchestration
  - routers/admin.py   All /api/admin/* routes
  - brandfetch.py      Brandfetch logo/name resolver
  - briefing.py        Playwright HTML→PDF for admin briefings
  - public_brief.py    Playwright HTML→PDF for /public/briefs/{slug}.pdf

This file owns only:
  - app + api_router setup
  - load_dotenv(.env) (must happen BEFORE any module that reads env vars at import)
  - the public + form-handling routes (status, pilot-requests, public briefs)
  - CORS middleware + shutdown hook
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware

# load_dotenv MUST run before any module reads os.environ.* at import time.
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --- Internal imports (env-dependent must come AFTER load_dotenv) ---------------
from auth import require_admin  # noqa: E402
from database import client, db  # noqa: E402
from models import (  # noqa: E402, F401
    BriefingGenerateRequest,  # re-export for legacy `from server import ...` callers
    BriefingPreview,
    PilotRequest,
    PilotRequestCreate,
    StatusCheck,
    StatusCheckCreate,
)
from public_brief import render_public_brief_pdf  # noqa: E402
from rate_limit import (  # noqa: E402
    check_brief_pdf_rate as _brief_pdf_rate_check,
    check_pilot_rate as _rate_limit_check,
    get_client_ip as _client_ip,
)
from routers.admin import router as admin_router  # noqa: E402
from services.email import (  # noqa: E402
    _send_notification,
    _send_prospect_confirmation,
)
from validation import (  # noqa: E402
    CURRENT_VENDOR_ALLOWLIST,
    ORG_SCALE_ALLOWLIST,
    WORKFORCE_ALLOWLIST,
    _sanitize_qualifier,
    _strip_for_header,
)

app = FastAPI(title="Third Rail Systems OÜ API")
api_router = APIRouter(prefix="/api")


# --- Trivial / demo routes ------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


# --- Pilot / diagnostic intake --------------------------------------------------
@api_router.post("/pilot-requests", response_model=PilotRequest, status_code=201)
async def create_pilot_request(payload: PilotRequestCreate, request: Request):
    # Guard 1: per-IP sliding-window rate limit. Applied FIRST so honeypot/
    # fast-submit bots can't spam rejected payloads indefinitely.
    ip = _client_ip(request)
    allowed, retry_after = _rate_limit_check(ip)
    if not allowed:
        logger.warning(f"Rate limit hit from {ip}; retry after {retry_after}s")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    # Guard 2: honeypot. Tarpit — looks like success to the bot, no persistence.
    if payload.company_website and payload.company_website.strip():
        logger.warning(f"Honeypot triggered from {ip}")
        return PilotRequest(
            first_name=payload.first_name.strip() or "honeypot",
            last_name=payload.last_name.strip() or "honeypot",
            corporate_email=payload.corporate_email,
            role=payload.role.strip() or "honeypot",
            email_status="rejected",
            email_error="honeypot",
        )

    # Guard 3: time-to-submit. Humans rarely submit in <1.2s.
    if payload.submission_ms is not None and payload.submission_ms < 1200:
        logger.warning(f"Fast-submit blocked from {ip} ({payload.submission_ms}ms)")
        return PilotRequest(
            first_name=payload.first_name.strip() or "fast",
            last_name=payload.last_name.strip() or "fast",
            corporate_email=payload.corporate_email,
            role=payload.role.strip() or "fast",
            email_status="rejected",
            email_error="submission_too_fast",
        )

    req = PilotRequest(
        first_name=_strip_for_header(payload.first_name),
        last_name=_strip_for_header(payload.last_name),
        corporate_email=payload.corporate_email,
        role=_strip_for_header(payload.role),
        memo_read=bool(payload.memo_read),
        catch22_read=bool(payload.catch22_read),
        exposure1_read=bool(payload.exposure1_read),
        exposure2_read=bool(payload.exposure2_read),
        exposure3_read=bool(payload.exposure3_read),
        request_type=payload.request_type or "pilot",
        org_scale_band=_sanitize_qualifier(payload.org_scale_band, ORG_SCALE_ALLOWLIST),
        workforce_composition=_sanitize_qualifier(payload.workforce_composition, WORKFORCE_ALLOWLIST),
        current_vendor=_sanitize_qualifier(payload.current_vendor, CURRENT_VENDOR_ALLOWLIST),
    )

    status, err = await _send_notification(req)
    req.email_status = status
    req.email_error = err

    # Prospect-facing confirmation. Fire after the internal notification so a
    # confirmation failure (e.g., transient Resend hiccup) never blocks the
    # primary lead-capture path.
    confirm_status, confirm_err = await _send_prospect_confirmation(req)
    if confirm_err:
        logger.warning(
            f"Prospect confirmation status={confirm_status} for {req.id}: {confirm_err}"
        )

    doc = req.model_dump()
    doc["submitted_at"] = doc["submitted_at"].isoformat()
    try:
        await db.pilot_requests.insert_one(doc)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Mongo insert failed for pilot request: {exc}")
        raise HTTPException(status_code=500, detail="Failed to persist pilot request") from exc

    return req


@api_router.get("/pilot-requests", response_model=List[PilotRequest])
async def list_pilot_requests(limit: int = 100, _admin: str = Depends(require_admin)):
    cursor = db.pilot_requests.find({}, {"_id": 0}).sort("submitted_at", -1).limit(limit)
    docs = await cursor.to_list(limit)
    for d in docs:
        ts = d.get("submitted_at")
        if isinstance(ts, str):
            d["submitted_at"] = datetime.fromisoformat(ts)
    return docs


# --- Public brief PDF -----------------------------------------------------------
# Slug -> (frontend route slug, download filename)
_PUBLIC_BRIEFS = {
    "shadow-hr": ("catch-22", "TRS_Shadow_HR_Liability_Brief_v1.0.pdf"),
}


@api_router.get("/public/briefs/{slug}.pdf")
async def public_brief_pdf(slug: str, request: Request):
    """Render a published brief to a print-ready PDF on demand."""
    if slug not in _PUBLIC_BRIEFS:
        raise HTTPException(status_code=404, detail="Unknown brief")

    ip = _client_ip(request)
    allowed, retry_after = _brief_pdf_rate_check(ip)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many PDF requests. Please retry shortly.",
            headers={"Retry-After": str(retry_after)},
        )

    frontend_slug, filename = _PUBLIC_BRIEFS[slug]
    try:
        pdf_bytes = await render_public_brief_pdf(frontend_slug)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Public brief PDF render failed for {slug}: {exc}")
        raise HTTPException(status_code=500, detail="PDF render failed") from exc

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "public, max-age=300",
        },
    )


# --- Router composition + CORS + shutdown ---------------------------------------
api_router.include_router(admin_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
