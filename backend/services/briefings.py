"""Briefing PDF render orchestration.

Resolves prospect branding (Brandfetch) → renders the co-branded PDF via
Playwright → persists audit fields on the lead document → returns the bytes
plus a download-safe filename + a generated briefing id.

The actual HTML→PDF rendering lives in /app/backend/briefing.py; this module
is just the resolver / orchestration layer that admin routes call.
"""
from __future__ import annotations

import logging
import re
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from brandfetch import domain_from_email, fetch_brand
from briefing import generate_briefing_pdf
from database import db
from models import BriefingGenerateRequest

logger = logging.getLogger(__name__)

# Strip filename-unsafe characters (whitespace, slashes, etc.) for the PDF
# download Content-Disposition. Kept tight so Levi's filesystem stays tidy.
_FILENAME_SAFE = re.compile(r"[^A-Za-z0-9._-]+")


async def render_briefing(payload: BriefingGenerateRequest) -> tuple[bytes, str, str, dict]:
    """Resolve prospect branding, render the PDF, persist audit fields.

    Returns (pdf_bytes, filename, briefing_id, lead_doc).
    Raises HTTPException on lookup or render failure.
    """
    doc = await db.pilot_requests.find_one({"id": payload.pilot_request_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Pilot request not found")

    email = doc.get("corporate_email") or ""
    domain = domain_from_email(email)
    lead_name = f"{doc.get('first_name','')} {doc.get('last_name','')}".strip() or "—"

    company = payload.prospect_company_override
    logo_url = payload.prospect_logo_url_override

    if (not company or not logo_url) and domain:
        inferred_name, inferred_logo = await fetch_brand(domain)
        company = company or inferred_name or (domain.split(".")[0].title() if domain else None)
        logo_url = logo_url or inferred_logo
    if not company:
        company = domain.split(".")[0].title() if domain else "Prospective Partner"

    briefing_id = f"EB-{uuid.uuid4().hex[:10].upper()}"

    try:
        pdf_bytes = await generate_briefing_pdf(
            lead_name=lead_name,
            prospect_company=company or "Prospective Partner",
            prospect_domain=domain,
            prospect_logo_url=logo_url,
            variant=payload.variant,
            briefing_id=briefing_id,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error(f"PDF generation failed for {payload.pilot_request_id}: {exc}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc

    try:
        await db.pilot_requests.update_one(
            {"id": payload.pilot_request_id},
            {
                "$set": {
                    "last_briefing_at": datetime.now(timezone.utc).isoformat(),
                    "last_briefing_id": briefing_id,
                    "last_briefing_variant": payload.variant,
                },
                "$inc": {"briefings_generated": 1},
            },
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to update briefing audit fields: {exc}")

    safe_company = _FILENAME_SAFE.sub("-", (company or "prospect")).strip("-") or "prospect"
    variant_tag = "ExecSummary" if payload.variant == "exec" else "FullMemo"
    filename = f"ThirdRail-{variant_tag}-{safe_company}-{briefing_id}.pdf"

    return pdf_bytes, filename, briefing_id, doc


# Backwards-compat alias — server.py used the leading-underscore name.
_render_briefing = render_briefing
