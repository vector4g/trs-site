from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
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


class PilotRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    corporate_email: EmailStr
    role: str
    email_status: str = "queued"  # queued | sent | stubbed | failed
    email_error: Optional[str] = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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
async def create_pilot_request(payload: PilotRequestCreate):
    req = PilotRequest(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        corporate_email=payload.corporate_email,
        role=payload.role.strip(),
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
async def list_pilot_requests(limit: int = 100, x_admin_token: Optional[str] = Header(default=None)):
    # Gate this endpoint — it contains lead PII. If ADMIN_TOKEN is unset the
    # endpoint is disabled entirely (fail-closed).
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    cursor = db.pilot_requests.find({}, {"_id": 0}).sort("submitted_at", -1).limit(limit)
    docs = await cursor.to_list(limit)
    for d in docs:
        ts = d.get("submitted_at")
        if isinstance(ts, str):
            d["submitted_at"] = datetime.fromisoformat(ts)
    return docs


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
