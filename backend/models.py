"""Pydantic models for the Third Rail backend.

Extracted from server.py for clarity. Pure data classes — no I/O, no state.
Import from server.py (and any future router modules) via:

    from models import PilotRequest, PilotRequestCreate, ...
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---- Status check (legacy demo) ------------------------------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ---- Pilot / Diagnostic intake -------------------------------------------------
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
    # Whether the user completed reading the long-form Catch-22 brief.
    catch22_read: Optional[bool] = Field(default=False)
    # Intake variant. "pilot" = generic landing CTA. "diagnostic" = the
    # qualified Catch-22 brief CTA; carries the three qualifier fields below.
    request_type: Optional[str] = Field(default="pilot", pattern="^(pilot|diagnostic)$")
    # Diagnostic-only qualifier fields. All optional so the generic pilot
    # intake never has to send them. Free-text capped to keep storage tidy.
    org_scale_band: Optional[str] = Field(default=None, max_length=80)
    workforce_composition: Optional[str] = Field(default=None, max_length=80)
    current_vendor: Optional[str] = Field(default=None, max_length=200)


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
    catch22_read: bool = False
    request_type: str = "pilot"  # pilot | diagnostic
    org_scale_band: Optional[str] = None
    workforce_composition: Optional[str] = None
    current_vendor: Optional[str] = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---- Admin briefing generation -------------------------------------------------
class BriefingGenerateRequest(BaseModel):
    pilot_request_id: str
    variant: str = Field(default="exec", pattern="^(exec|full)$")
    prospect_company_override: Optional[str] = Field(default=None, max_length=200)
    prospect_logo_url_override: Optional[str] = Field(default=None, max_length=1000)


class BriefingPreview(BaseModel):
    lead_name: str
    lead_email: EmailStr
    inferred_company: Optional[str] = None
    inferred_logo_url: Optional[str] = None
    domain: Optional[str] = None
