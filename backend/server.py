from fastapi import FastAPI, APIRouter, HTTPException, Header, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
import time
from collections import deque
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
NOTIFICATION_RECIPIENT = os.environ.get('NOTIFICATION_RECIPIENT', '').strip()
FALLBACK_RECIPIENT = os.environ.get('FALLBACK_RECIPIENT', '').strip()
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Create the main app without a prefix
app = FastAPI(title="Third Rail Systems OÜ API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ---- Existing status models ----
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# ---- Pilot Request models ----
class PilotRequestCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    corporate_email: EmailStr
    role: str = Field(..., min_length=1, max_length=80)
    # Honeypot: genuine users leave this blank. Bots that fill every field
    # will populate it. Named innocuously so scrapers don't skip it.
    company_website: Optional[str] = Field(default="", max_length=200)
    # Client-side time-to-submit in milliseconds. Humans rarely submit in <1.5s.
    submission_ms: Optional[int] = Field(default=None, ge=0, le=60 * 60 * 1000)
    # Whether the user completed reading /memo before submitting (tracked in
    # localStorage when `memo_read_completed` fires). Helps qualify leads.
    memo_read: Optional[bool] = Field(default=False)


class PilotRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    corporate_email: EmailStr
    role: str
    email_status: str = "queued"  # queued | sent | stubbed | failed | rejected
    email_error: Optional[str] = None
    memo_read: bool = False
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---- In-memory sliding-window rate limiter (per-IP) ----
# 5 submissions per 15 minutes per IP. Good enough for a single-process uvicorn
# deployment. Swap for Redis if horizontally scaling.
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_S = 15 * 60
_rate_buckets: dict[str, deque] = {}


def _rate_limit_check(ip: str) -> tuple[bool, int]:
    """Return (allowed, retry_after_seconds)."""
    now = time.time()
    bucket = _rate_buckets.setdefault(ip, deque())
    # Drop expired entries
    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_S:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_MAX:
        retry_after = int(RATE_LIMIT_WINDOW_S - (now - bucket[0])) + 1
        return False, max(retry_after, 1)
    bucket.append(now)
    return True, 0


def _client_ip(request: Request) -> str:
    # Honour the common proxy headers first, then fall back to the direct peer.
    fwd = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


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
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:32px 0;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #1f2937;border-radius:8px;padding:28px;">
          <tr><td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#22d3ee;">Pilot Assessment Request</td></tr>
          <tr><td style="padding-top:12px;font-size:22px;font-weight:600;color:#ffffff;">
            New enterprise pilot intake
          </td></tr>
          <tr><td style="padding-top:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:8px 0;color:#94a3b8;width:160px;">First name</td><td style="color:#e2e8f0;">{req.first_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Last name</td><td style="color:#e2e8f0;">{req.last_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Corporate email</td><td style="color:#e2e8f0;"><a href="mailto:{req.corporate_email}" style="color:#22d3ee;text-decoration:none;">{req.corporate_email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Role</td><td style="color:#e2e8f0;">{req.role}</td></tr>
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

    params = {
        "from": SENDER_EMAIL,
        "to": [recipient],
        "reply_to": req.corporate_email,
        "subject": f"[Third Rail] Pilot request — {req.first_name} {req.last_name} ({req.role})",
        "html": _build_notification_html(req),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend send failed for {req.id}: {exc}")
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
    )

    status, err = await _send_notification(req)
    req.email_status = status
    req.email_error = err

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
    _admin: str = Depends(require_admin),
):
    """Admin-gated list with filters/search."""
    query: dict = {}
    if status:
        query["email_status"] = status
    if role:
        query["role"] = {"$regex": f"^{role}", "$options": "i"}
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

    return {
        "items": docs,
        "stats": {
            "total": total,
            "delivered": delivered,
            "memo_read": memo_read,
            "memo_read_rate": round((memo_read / total) * 100, 1) if total else 0.0,
        },
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
