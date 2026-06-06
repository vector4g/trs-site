"""All admin-gated routes under /api/admin/*.

Endpoints:
  - POST   /admin/login                   — set httpOnly session cookie
  - POST   /admin/logout                  — clear session cookie
  - POST   /admin/auth/verify             — confirm session validity
  - GET    /admin/pilot-requests          — paginated list + aggregate stats
  - GET    /admin/briefings/preview/{id}  — resolve prospect branding via Brandfetch
  - POST   /admin/briefings/generate      — generate + stream a co-branded PDF
  - POST   /admin/briefings/email-to-lead — generate + email the PDF to the lead

All routes except `/admin/login` require a valid session (validated by the
`require_admin` dependency, which accepts either the `trs_admin_session`
cookie or the legacy `X-Admin-Token` header).
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

from auth import (
    ADMIN_TOKEN,
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    create_session_token,
    require_admin,
)
from brandfetch import domain_from_email, fetch_brand
from database import db
from models import BriefingGenerateRequest, BriefingPreview
from services.briefings import render_briefing
from services.email import send_briefing_to_lead

logger = logging.getLogger(__name__)

router = APIRouter()


class AdminLoginRequest(BaseModel):
    token: str


@router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    """Exchange the shared admin secret for an httpOnly session cookie.

    The body's `token` is the static `ADMIN_TOKEN` env value. On success the
    response sets a signed JWT in `trs_admin_session` and the client never
    sees the secret again — subsequent requests just need
    `credentials: "include"` on fetch/axios.
    """
    if not ADMIN_TOKEN:
        # Admin surface is disabled — mirror require_admin's fail-closed behaviour.
        raise HTTPException(status_code=404, detail="Not found")
    if (payload.token or "").strip() != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")

    session_jwt = create_session_token()
    response = JSONResponse({"ok": True})
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_jwt,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/",
    )
    return response


@router.post("/admin/logout")
async def admin_logout():
    """Clear the session cookie. Idempotent — safe to call without an active
    session (e.g., when the cookie has already expired)."""
    response = JSONResponse({"ok": True})
    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
        secure=True,
        samesite="strict",
    )
    return response


@router.post("/admin/auth/verify")
async def admin_verify(_admin: str = Depends(require_admin)):
    """Lightweight endpoint used by the /admin UI to confirm the current
    session cookie (or legacy header) is still valid."""
    return {"ok": True}


@router.get("/admin/pilot-requests")
async def admin_list_pilot_requests(
    limit: int = 500,
    q: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    request_type: Optional[str] = None,
    _admin: str = Depends(require_admin),
):
    """Admin-gated list with filters/search."""
    query: dict = {}
    if status:
        query["email_status"] = status
    if role:
        query["role"] = {"$regex": f"^{role}", "$options": "i"}
    if request_type in ("pilot", "diagnostic"):
        query["request_type"] = request_type
    if q:
        qr = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"first_name": qr},
            {"last_name": qr},
            {"corporate_email": qr},
            {"role": qr},
        ]

    cursor = db.pilot_requests.find(query, {"_id": 0}).sort("submitted_at", -1).limit(max(1, min(limit, 1000)))
    docs = await cursor.to_list(length=limit)

    total = await db.pilot_requests.count_documents({})
    delivered = await db.pilot_requests.count_documents({"email_status": {"$in": ["sent", "stubbed"]}})
    memo_read = await db.pilot_requests.count_documents({"memo_read": True})
    catch22_read = await db.pilot_requests.count_documents({"catch22_read": True})
    both_read = await db.pilot_requests.count_documents(
        {"memo_read": True, "catch22_read": True}
    )
    diagnostic_count = await db.pilot_requests.count_documents({"request_type": "diagnostic"})

    return {
        "items": docs,
        "stats": {
            "total": total,
            "delivered": delivered,
            "memo_read": memo_read,
            "memo_read_rate": round((memo_read / total) * 100, 1) if total else 0.0,
            "catch22_read": catch22_read,
            "catch22_read_rate": round((catch22_read / total) * 100, 1) if total else 0.0,
            "both_read": both_read,
            "diagnostic_count": diagnostic_count,
        },
    }


@router.get("/admin/briefings/preview/{pilot_request_id}", response_model=BriefingPreview)
async def admin_briefing_preview(pilot_request_id: str, _admin: str = Depends(require_admin)):
    """Resolve the prospect's inferred company name + logo for the admin modal
    so Levi can confirm or override before generating the PDF."""
    doc = await db.pilot_requests.find_one({"id": pilot_request_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Pilot request not found")

    email = doc.get("corporate_email") or ""
    domain = domain_from_email(email)
    inferred_name, inferred_logo = await fetch_brand(domain) if domain else (None, None)

    return BriefingPreview(
        lead_name=f"{doc.get('first_name','')} {doc.get('last_name','')}".strip() or "—",
        lead_email=email,
        inferred_company=inferred_name,
        inferred_logo_url=inferred_logo,
        domain=domain,
    )


@router.post("/admin/briefings/generate")
async def admin_briefing_generate(payload: BriefingGenerateRequest, _admin: str = Depends(require_admin)):
    """Generate and stream a co-branded briefing PDF for the given pilot request."""
    pdf_bytes, filename, briefing_id, _doc = await render_briefing(payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Briefing-Id": briefing_id,
        },
    )


@router.post("/admin/briefings/email-to-lead")
async def admin_briefing_email_to_lead(payload: BriefingGenerateRequest, _admin: str = Depends(require_admin)):
    """Generate the PDF AND email it to the lead's corporate inbox.

    Reply-To routes to the founder so the prospect's reply lands directly
    in Levi's mailbox.
    """
    pdf_bytes, filename, briefing_id, doc = await render_briefing(payload)

    status, err = await send_briefing_to_lead(
        req_doc=doc,
        pdf_bytes=pdf_bytes,
        pdf_filename=filename,
        variant=payload.variant,
        briefing_id=briefing_id,
    )
    if err:
        raise HTTPException(status_code=502, detail=f"Email send failed: {err}")

    return {
        "ok": True,
        "email_status": status,
        "briefing_id": briefing_id,
        "filename": filename,
        "recipient": doc.get("corporate_email"),
    }
