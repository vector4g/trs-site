"""All transactional email logic for Third Rail Systems.

Three send paths:
  - send_notification          → internal alert when a lead submits a pilot/diagnostic form
  - send_prospect_confirmation → confirmation TO the prospect with Reply-To = Levi
  - send_briefing_to_lead      → exec/full briefing PDF as a Resend attachment

All send paths short-circuit synthetic test leads (`TEST_`-prefixed names or
example.{com,org,net} emails) so we never burn the Resend quota on automated
QA runs.

Resend config (RESEND_API_KEY, SENDER_EMAIL, REPLY_TO_EMAIL,
NOTIFICATION_RECIPIENT, FALLBACK_RECIPIENT) is read from the environment at
import time and configured on the resend SDK once.
"""
from __future__ import annotations

import asyncio
import base64
import logging
import os
from typing import Optional

import resend

from models import PilotRequest
from validation import strip_for_header

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()
REPLY_TO_EMAIL = os.environ.get("REPLY_TO_EMAIL", "").strip()
NOTIFICATION_RECIPIENT = os.environ.get("NOTIFICATION_RECIPIENT", "").strip()
FALLBACK_RECIPIENT = os.environ.get("FALLBACK_RECIPIENT", "").strip()

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


# --- Helpers --------------------------------------------------------------------
def escape_html(s: Optional[str]) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def is_test_lead(req: PilotRequest) -> bool:
    """Detect synthetic test leads so we never hit Resend / burn the daily quota.

    Signals: (a) first/last name starts with ``TEST_``; (b) the corporate
    email's local-part starts with ``test_``/``test-``; (c) the domain is one
    of the IETF-reserved example.* TLDs.
    """
    fn = (req.first_name or "").lstrip()
    ln = (req.last_name or "").lstrip()
    if fn.startswith("TEST_") or ln.startswith("TEST_"):
        return True
    email = (req.corporate_email or "").lower()
    local, _, domain = email.partition("@")
    if domain in ("example.com", "example.org", "example.net"):
        return True
    if local.startswith(("test_", "test-")):
        return True
    return False


def _is_test_doc(req_doc: dict) -> bool:
    """Same as is_test_lead() but for a raw Mongo document (no PilotRequest)."""
    fn = (req_doc.get("first_name") or "").lstrip()
    ln = (req_doc.get("last_name") or "").lstrip()
    if fn.startswith("TEST_") or ln.startswith("TEST_"):
        return True
    email = (req_doc.get("corporate_email") or "").lower()
    local, _, domain = email.partition("@")
    if domain in ("example.com", "example.org", "example.net"):
        return True
    if local.startswith(("test_", "test-")):
        return True
    return False


# --- HTML builders --------------------------------------------------------------
def build_notification_html(req: PilotRequest) -> str:
    """Inline-styled HTML email body for deliverability."""
    diag_rows = ""
    if req.request_type == "diagnostic":
        def _row(label: str, value: Optional[str]) -> str:
            if not value:
                return ""
            return (
                f'<tr><td style="padding:8px 0;color:#94a3b8;">{label}</td>'
                f'<td style="color:#e2e8f0;">{escape_html(value)}</td></tr>'
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


def build_prospect_confirmation_html(req: PilotRequest) -> str:
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


# --- Send paths -----------------------------------------------------------------
async def send_notification(req: PilotRequest) -> tuple[str, Optional[str]]:
    """Send the internal notification email. Returns (status, error)."""
    if is_test_lead(req):
        logger.info(f"[EMAIL TEST-BYPASS] not sending notification for synthetic lead {req.id} ({req.first_name} / {req.corporate_email})")
        return ("test_bypass", None)
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL STUB] would notify {NOTIFICATION_RECIPIENT} of pilot request {req.id}")
        return ("stubbed", None)

    recipient = NOTIFICATION_RECIPIENT or FALLBACK_RECIPIENT
    if not recipient:
        return ("failed", "No recipient configured")

    subject_prefix = "[Third Rail] Diagnostic request" if req.request_type == "diagnostic" else "[Third Rail] Pilot request"
    safe_first = strip_for_header(req.first_name)
    safe_last = strip_for_header(req.last_name)
    safe_role = strip_for_header(req.role)
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient],
        "reply_to": req.corporate_email,
        "subject": f"{subject_prefix} — {safe_first} {safe_last} ({safe_role})",
        "html": build_notification_html(req),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend send failed for {req.id}: {exc}")
        return ("failed", str(exc))


async def send_prospect_confirmation(req: PilotRequest) -> tuple[str, Optional[str]]:
    """Confirmation email sent TO the prospect with Reply-To = Levi's inbox."""
    if is_test_lead(req):
        logger.info(f"[EMAIL TEST-BYPASS] not sending confirmation for synthetic lead {req.id} ({req.first_name} / {req.corporate_email})")
        return ("test_bypass", None)
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL STUB] would confirm pilot request {req.id} to {req.corporate_email}")
        return ("stubbed", None)

    reply_to = REPLY_TO_EMAIL or NOTIFICATION_RECIPIENT or FALLBACK_RECIPIENT
    params = {
        "from": SENDER_EMAIL,
        "to": [req.corporate_email],
        "subject": "Pilot request received — Third Rail Systems OÜ",
        "html": build_prospect_confirmation_html(req),
    }
    if reply_to:
        params["reply_to"] = reply_to

    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return ("sent", None)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Resend prospect-confirmation failed for {req.id}: {exc}")
        return ("failed", str(exc))


async def send_briefing_to_lead(
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
    if _is_test_doc(req_doc):
        logger.info(f"[EMAIL TEST-BYPASS] not emailing briefing {briefing_id} to synthetic lead {req_doc.get('corporate_email')}")
        return ("test_bypass", None)
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
            Hi {escape_html(first_name)},<br/><br/>
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


# Backwards-compat aliases — server.py & tests use the leading-underscore names.
_escape_html = escape_html
_is_test_lead = is_test_lead
_build_notification_html = build_notification_html
_build_prospect_confirmation_html = build_prospect_confirmation_html
_send_notification = send_notification
_send_prospect_confirmation = send_prospect_confirmation
_send_briefing_to_lead = send_briefing_to_lead

__all__ = [
    "RESEND_API_KEY",
    "SENDER_EMAIL",
    "REPLY_TO_EMAIL",
    "NOTIFICATION_RECIPIENT",
    "FALLBACK_RECIPIENT",
    "escape_html",
    "is_test_lead",
    "build_notification_html",
    "build_prospect_confirmation_html",
    "send_notification",
    "send_prospect_confirmation",
    "send_briefing_to_lead",
    "_escape_html",
    "_is_test_lead",
    "_build_notification_html",
    "_build_prospect_confirmation_html",
    "_send_notification",
    "_send_prospect_confirmation",
    "_send_briefing_to_lead",
]
