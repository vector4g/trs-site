from fastapi import FastAPI, APIRouter, HTTPException, Header, Request, Depends
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import base64
import logging
import re
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import resend

from brandfetch import domain_from_email, fetch_brand
from briefing import generate_briefing_pdf
from public_brief import render_public_brief_pdf
from models import (
    StatusCheck,
    StatusCheckCreate,
    PilotRequestCreate,
    PilotRequest,
    BriefingGenerateRequest,
    BriefingPreview,
)
from rate_limit import (
    check_pilot_rate as _rate_limit_check,
    check_brief_pdf_rate as _brief_pdf_rate_check,
    get_client_ip as _client_ip,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# --- Diagnostic qualifier allowlists --------------------------------------------
# Mirror the labels in /app/frontend/src/pages/DiagnosticIntake.jsx. The frontend
# only ever submits these exact strings — anything else is either a stale UI or a
# tampered request and must be silently dropped, NOT echoed into emails.
ORG_SCALE_ALLOWLIST = frozenset({
    "Under 1,000 employees",
    "1,000 – 5,000 employees",
    "5,000 – 25,000 employees",
    "25,000 – 100,000 employees",
    "100,000+ employees",
})
WORKFORCE_ALLOWLIST = frozenset({
    "EU / EEA only",
    "EU + UK",
    "Global with major EU footprint",
    "Global with minor EU footprint",
})
CURRENT_VENDOR_ALLOWLIST = frozenset({
    "No travel-risk vendor",
    "International SOS",
    "WTW / Crisis24",
    "Control Risks",
    "Anvil / GardaWorld",
    "In-house / internal",
    "Other (note in reply)",
})


def _sanitize_qualifier(value: Optional[str], allowlist: frozenset) -> Optional[str]:
    """Return the value only if it's an exact match for an allowlisted label.
    Free-text bypasses are silently dropped so they never reach Resend or Mongo.
    """
    if not value:
        return None
    v = value.strip()
    return v if v in allowlist else None


# Strip CR/LF and surrounding whitespace from anything that lands in an email
# subject line. Prevents header-injection via name/role/email.
_HEADER_STRIP_RE = re.compile(r"[\r\n\t]+")


def _strip_for_header(value: str) -> str:
    if not value:
        return ""
    return _HEADER_STRIP_RE.sub(" ", value).strip()[:200]



# Configure logging first so helpers below can use `logger`.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev').strip()
REPLY_TO_EMAIL = os.environ.get('REPLY_TO_EMAIL', '').strip()
NOTIFICATION_RECIPIENT = os.environ.get('NOTIFICATION_RECIPIENT', '').strip()
FALLBACK_RECIPIENT = os.environ.get('FALLBACK_RECIPIENT', '').strip()
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Create the main app without a prefix
app = FastAPI(title="Third Rail Systems OÜ API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def require_admin(x_admin_token: Optional[str] = Header(default=None)) -> str:
    """FastAPI dependency gating admin endpoints.

    Behavior:
      - ADMIN_TOKEN unset in env → 404 (endpoint appears not to exist; no info leak).
      - Token missing or incorrect → 401.
      - Correct token → returns the token (dependency is truthy).
    """
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_admin_token


# ---- Routes ----
@api_router.get("/")
async def root():
    return {"message": "Third Rail Systems OÜ API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


def _build_notification_html(req: PilotRequest) -> str:
    """Inline-styled HTML email body for deliverability."""
    diag_rows = ""
    if req.request_type == "diagnostic":
        def _row(label: str, value: Optional[str]) -> str:
            if not value:
                return ""
            return (
                f'<tr><td style="padding:8px 0;color:#94a3b8;">{label}</td>'
                f'<td style="color:#e2e8f0;">{_escape_html(value)}</td></tr>'
            )
        diag_rows = (
            _row("Org scale", req.org_scale_band)
            + _row("Workforce composition", req.workforce_composition)
            + _row("Current vendor", req.current_vendor)
        )
    intake_label = "Catch-22 Diagnostic Request" if req.request_type == "diagnostic" else "Pilot Assessment Request"
    intake_title = "New Catch-22 diagnostic intake" if req.request_type == "diagnostic" else "New enterprise pilot intake"
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:32px 0;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #1f2937;border-radius:8px;padding:28px;">
          <tr><td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#22d3ee;">{intake_label}</td></tr>
          <tr><td style="padding-top:12px;font-size:22px;font-weight:600;color:#ffffff;">
            {intake_title}
          </td></tr>
          <tr><td style="padding-top:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:8px 0;color:#94a3b8;width:160px;">First name</td><td style="color:#e2e8f0;">{req.first_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Last name</td><td style="color:#e2e8f0;">{req.last_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Corporate email</td><td style="color:#e2e8f0;"><a href="mailto:{req.corporate_email}" style="color:#22d3ee;text-decoration:none;">{req.corporate_email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Role</td><td style="color:#e2e8f0;">{req.role}</td></tr>
              {diag_rows}
              <tr><td style="padding:8px 0;color:#94a3b8;">Request ID</td><td style="color:#64748b;font-family:monospace;">{req.id}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Submitted</td><td style="color:#64748b;font-family:monospace;">{req.submitted_at.isoformat()}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding-top:24px;border-top:1px solid #1f2937;margin-top:20px;font-size:11px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">
            Third Rail Systems OÜ · Tallinn, Estonia
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def _send_notification(req: PilotRequest) -> tuple[str, Optional[str]]:
    """Send the notification email. Returns (status, error)."""
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL STUB] would notify {NOTIFICATION_RECIPIENT} of pilot request {req.id}")
        return ("stubbed", None)

    recipient = NOTIFICATION_RECIPIENT or FALLBACK_RECIPIENT
    if not recipient:
        return ("failed", "No recipient configured")

    subject_prefix = "[Third Rail] Diagnostic request" if req.request_type == "diagnostic" else "[Third Rail] Pilot request"
    # Resend headers must be CR/LF-free. Strip and cap before splicing user input.
    safe_first = _strip_for_header(req.first_name)
    safe_last = _strip_for_header(req.last_name)
    safe_role = _strip_for_header(req.role)
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient],
        "reply_to": req.corporate_email,
        "subject": f"{subject_prefix} — {safe_first} {safe_last} ({safe_role})",
        "html": _build_notification_html(req),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend send failed for {req.id}: {exc}")
        return ("failed", str(exc))


def _build_prospect_confirmation_html(req: PilotRequest) -> str:
    """Prospect-facing confirmation email — system tone, Reply-To routes to Levi."""
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:32px 0;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #1f2937;border-radius:8px;padding:32px;">
          <tr><td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#22d3ee;">Third Rail Systems · Intake</td></tr>
          <tr><td style="padding-top:14px;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">
            Pilot request received.
          </td></tr>
          <tr><td style="padding-top:18px;font-size:14px;line-height:1.7;color:#cbd5e1;">
            Hi {req.first_name},<br/><br/>
            This is an automated confirmation from the Third Rail Systems platform. Your pilot assessment request has been logged under reference <span style="font-family:monospace;color:#22d3ee;">{req.id[:8]}</span>.<br/><br/>
            A founding-team operator will reach out within one business day with a 20-minute architecture fit-call slot. No HRIS integration is required for the pilot.<br/><br/>
            In the meantime, you may find the published liability brief useful for your CSO / DPO conversations:
          </td></tr>
          <tr><td style="padding:18px 0 8px 0;">
            <a href="https://thirdrailsystems.ee/catch-22" style="display:inline-block;background:#22d3ee;color:#0b0f14;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
              Read · The Duty of Care vs. Data Privacy Catch-22
            </a>
          </td></tr>
          <tr><td style="padding-top:18px;font-size:13px;line-height:1.6;color:#94a3b8;">
            Reply directly to this email to reach the founding team.
          </td></tr>
          <tr><td style="padding-top:24px;border-top:1px solid #1f2937;font-size:11px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:0;">
            Third Rail Systems OÜ · Tallinn, Estonia · EU-Native
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def _send_briefing_to_lead(
    req_doc: dict,
    pdf_bytes: bytes,
    pdf_filename: str,
    variant: str,
    briefing_id: str,
) -> tuple[str, Optional[str]]:
    """Email the generated briefing PDF to the lead as a Resend attachment.

    Reply-To routes to Levi's inbox so a "Reply" from the prospect lands
    directly in the founder's mailbox.
    """
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL STUB] would email briefing {briefing_id} to {req_doc.get('corporate_email')}")
        return ("stubbed", None)

    first_name = (req_doc.get("first_name") or "there").strip()
    recipient = req_doc.get("corporate_email")
    if not recipient:
        return ("failed", "Lead has no corporate_email")

    variant_label = (
        "Executive Summary" if variant == "exec" else "Full Strategic Briefing"
    )
    subject = f"{variant_label} — Third Rail Systems OÜ"

    html_body = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:32px 0;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #1f2937;border-radius:8px;padding:32px;">
          <tr><td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#22d3ee;">Third Rail Systems · Briefing</td></tr>
          <tr><td style="padding-top:14px;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">
            Your {variant_label.lower()} is attached.
          </td></tr>
          <tr><td style="padding-top:18px;font-size:14px;line-height:1.7;color:#cbd5e1;">
            Hi {_escape_html(first_name)},<br/><br/>
            As discussed, please find attached your co-branded {variant_label.lower()}
            (briefing reference <span style="font-family:monospace;color:#22d3ee;">{briefing_id}</span>).<br/><br/>
            Reply directly to this email to schedule a 20-minute architecture fit-call —
            no HRIS integration is required for the pilot.
          </td></tr>
          <tr><td style="padding-top:24px;border-top:1px solid #1f2937;font-size:11px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">
            Third Rail Systems OÜ · Tallinn, Estonia · EU-Native
          </td></tr>
        </table>
      </td></tr>
    </table>
    """

    reply_to = REPLY_TO_EMAIL or NOTIFICATION_RECIPIENT or FALLBACK_RECIPIENT
    # Resend accepts the attachment `content` as a base64 string. Encoding once
    # here avoids materialising ~N Python ints from list(pdf_bytes) for a
    # multi-hundred-KB PDF.
    encoded_pdf = base64.b64encode(pdf_bytes).decode("ascii")
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient],
        "subject": subject,
        "html": html_body,
        "attachments": [
            {
                "filename": pdf_filename,
                "content": encoded_pdf,
            }
        ],
    }
    if reply_to:
        params["reply_to"] = reply_to

    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend briefing-to-lead failed for {briefing_id}: {exc}")
        return ("failed", str(exc))


def _escape_html(s: Optional[str]) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


async def _send_prospect_confirmation(req: PilotRequest) -> tuple[str, Optional[str]]:
    """Confirmation email sent TO the prospect with Reply-To = Levi's inbox."""
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL STUB] would confirm pilot request {req.id} to {req.corporate_email}")
        return ("stubbed", None)

    reply_to = REPLY_TO_EMAIL or NOTIFICATION_RECIPIENT or FALLBACK_RECIPIENT
    params = {
        "from": SENDER_EMAIL,
        "to": [req.corporate_email],
        "subject": "Pilot request received — Third Rail Systems OÜ",
        "html": _build_prospect_confirmation_html(req),
    }
    if reply_to:
        params["reply_to"] = reply_to

    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend prospect-confirmation failed for {req.id}: {exc}")
        return ("failed", str(exc))


@api_router.post("/pilot-requests", response_model=PilotRequest, status_code=201)
async def create_pilot_request(payload: PilotRequestCreate, request: Request):
    # --- Anti-spam guard 1: per-IP sliding-window rate limit.
    # Applied FIRST so honeypot/fast-submit bots can't spam rejected payloads
    # indefinitely to burn CPU / pollute logs.
    ip = _client_ip(request)
    allowed, retry_after = _rate_limit_check(ip)
    if not allowed:
        logger.warning(f"Rate limit hit from {ip}; retry after {retry_after}s")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    # --- Anti-spam guard 2: honeypot.
    # Tarpit response — looks like success to the bot, no persistence, no email.
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

    # --- Anti-spam guard 3: time-to-submit.
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
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        corporate_email=payload.corporate_email,
        role=payload.role.strip(),
        memo_read=bool(payload.memo_read),
        catch22_read=bool(payload.catch22_read),
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
    doc['submitted_at'] = doc['submitted_at'].isoformat()
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


# ---- Public brief PDF (Shadow HR Liability) ----
# Light per-IP rate limit (independent of the form limiter): 4 per 15 min.
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


# ---- Admin endpoints ----
@api_router.post("/admin/auth/verify")
async def admin_verify(_admin: str = Depends(require_admin)):
    """Lightweight endpoint used by the /admin UI to confirm a token is valid."""
    return {"ok": True}


@api_router.get("/admin/pilot-requests")
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


@api_router.get("/admin/briefings/preview/{pilot_request_id}", response_model=BriefingPreview)
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


_FILENAME_SAFE = re.compile(r"[^A-Za-z0-9._-]+")


async def _render_briefing(payload: BriefingGenerateRequest) -> tuple[bytes, str, str, dict]:
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


@api_router.post("/admin/briefings/generate")
async def admin_briefing_generate(payload: BriefingGenerateRequest, _admin: str = Depends(require_admin)):
    """Generate and stream a co-branded briefing PDF for the given pilot request."""
    pdf_bytes, filename, briefing_id, _doc = await _render_briefing(payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Briefing-Id": briefing_id,
        },
    )


@api_router.post("/admin/briefings/email-to-lead")
async def admin_briefing_email_to_lead(payload: BriefingGenerateRequest, _admin: str = Depends(require_admin)):
    """Generate the PDF AND email it to the lead's corporate inbox.

    Reply-To routes to the founder so the prospect's reply lands directly
    in Levi's mailbox.
    """
    pdf_bytes, filename, briefing_id, doc = await _render_briefing(payload)

    status, err = await _send_briefing_to_lead(
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




# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
