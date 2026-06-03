"""Iter 14 — backend refactor & SENDER_EMAIL switch coverage.

Covers:
  - module imports + SENDER_EMAIL value
  - POST /api/pilot-requests legacy + diagnostic + invalid qualifier + honeypot + fast-submit + rate-limit
  - GET /api/admin/pilot-requests (+ request_type filter)
  - POST /api/admin/auth/verify
  - GET /api/admin/briefings/preview/{id}
  - POST /api/admin/briefings/generate (PDF bytes)
  - POST /api/admin/briefings/email-to-lead (test_bypass)
  - GET /api/public/briefs/shadow-hr.pdf + 404 unknown
"""
from __future__ import annotations

import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://eu-travel-risk.preview.emergentagent.com").rstrip("/")
# Tests use the dev admin token by default; CI overrides via TEST_ADMIN_TOKEN env.
# Never hardcode production tokens here.
ADMIN_TOKEN = os.environ.get("TEST_ADMIN_TOKEN", "dev-admin-trs-2026")

API = f"{BASE_URL}/api"


def _ip() -> str:
    """Unique 198.51.100.0/24 IP per call to dodge the 5/15min per-IP limiter."""
    return f"198.51.100.{(int(time.time() * 1000) + uuid.uuid4().int) % 254 + 1}"


def _payload(**overrides):
    base = {
        "first_name": "TEST_Alice",
        "last_name": "TEST_Smith",
        "corporate_email": f"test_alice_{uuid.uuid4().hex[:8]}@example.com",
        "role": "CISO",
        "memo_read": True,
        "catch22_read": True,
        "submission_ms": 5000,
    }
    base.update(overrides)
    return base


# --- A. Module import sanity (in-process) ---------------------------------------
class TestImports:
    def test_module_imports_and_sender_email(self):
        import sys
        from pathlib import Path
        from dotenv import load_dotenv

        load_dotenv(Path("/app/backend/.env"))
        sys.path.insert(0, "/app/backend")
        # Re-import freshly
        from services.email import (
            RESEND_API_KEY, SENDER_EMAIL,
            send_notification, send_prospect_confirmation, send_briefing_to_lead,
        )
        from services.briefings import render_briefing  # noqa: F401
        from routers.admin import router  # noqa: F401
        from auth import require_admin, ADMIN_TOKEN as AT  # noqa: F401
        from database import client, db  # noqa: F401
        from validation import sanitize_qualifier, strip_for_header, ORG_SCALE_ALLOWLIST  # noqa: F401
        import server  # noqa: F401

        assert SENDER_EMAIL == "levi@thirdrailsystems.ee"
        assert callable(send_notification)
        assert callable(send_prospect_confirmation)
        assert callable(send_briefing_to_lead)


# --- B. POST /api/pilot-requests ------------------------------------------------
class TestPilotRequests:
    def test_legacy_pilot_intake(self):
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["request_type"] == "pilot"
        assert data["email_status"] == "test_bypass", data
        assert data["org_scale_band"] is None
        assert data["workforce_composition"] is None
        assert data["current_vendor"] is None

    def test_diagnostic_intake_with_qualifiers(self):
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(
                request_type="diagnostic",
                org_scale_band="5,000 – 25,000 employees",
                workforce_composition="EU + UK",
                current_vendor="International SOS",
            ),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["request_type"] == "diagnostic"
        assert data["org_scale_band"] == "5,000 – 25,000 employees"
        assert data["workforce_composition"] == "EU + UK"
        assert data["current_vendor"] == "International SOS"
        assert data["email_status"] == "test_bypass"

    def test_invalid_qualifiers_silently_dropped(self):
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(
                request_type="diagnostic",
                org_scale_band="<script>alert(1)</script>",
                workforce_composition="garbage value",
                current_vendor="not-in-allowlist",
            ),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["org_scale_band"] is None
        assert data["workforce_composition"] is None
        assert data["current_vendor"] is None

    def test_honeypot_triggers_rejection(self):
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(company_website="http://spammer.example"),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email_status"] == "rejected"
        assert data["email_error"] == "honeypot"

    def test_fast_submit_rejected(self):
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(submission_ms=400),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email_status"] == "rejected"
        assert data["email_error"] == "submission_too_fast"

    def test_rate_limit_429_after_5(self):
        ip = _ip()
        codes = []
        for i in range(6):
            r = requests.post(
                f"{API}/pilot-requests",
                json=_payload(corporate_email=f"test_rl_{uuid.uuid4().hex[:6]}@example.com"),
                headers={"X-Forwarded-For": ip},
                timeout=30,
            )
            codes.append(r.status_code)
            if r.status_code == 429:
                assert "Retry-After" in r.headers
                break
        assert 429 in codes, f"expected 429 in {codes}"


# --- C. Admin routes ------------------------------------------------------------
class TestAdmin:
    def test_auth_verify_unauthorized(self):
        r = requests.post(f"{API}/admin/auth/verify", timeout=15)
        assert r.status_code == 401

    def test_auth_verify_ok(self):
        r = requests.post(
            f"{API}/admin/auth/verify",
            headers={"X-Admin-Token": ADMIN_TOKEN},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    def test_admin_list_unauthorized(self):
        r = requests.get(f"{API}/admin/pilot-requests", timeout=15)
        assert r.status_code == 401

    def test_admin_list_returns_stats_with_diagnostic_count(self):
        r = requests.get(
            f"{API}/admin/pilot-requests",
            headers={"X-Admin-Token": ADMIN_TOKEN},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "items" in body and "stats" in body
        assert "diagnostic_count" in body["stats"], body["stats"]
        assert isinstance(body["items"], list)

    def test_admin_list_filter_by_request_type(self):
        r = requests.get(
            f"{API}/admin/pilot-requests?request_type=diagnostic",
            headers={"X-Admin-Token": ADMIN_TOKEN},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        for item in body["items"]:
            assert item.get("request_type") == "diagnostic"

    def test_admin_briefings_preview_404(self):
        r = requests.get(
            f"{API}/admin/briefings/preview/does-not-exist-{uuid.uuid4().hex[:6]}",
            headers={"X-Admin-Token": ADMIN_TOKEN},
            timeout=15,
        )
        assert r.status_code == 404


# --- D. Public briefs -----------------------------------------------------------
class TestPublicBriefs:
    def test_shadow_hr_pdf(self):
        r = requests.get(
            f"{API}/public/briefs/shadow-hr.pdf",
            headers={"X-Forwarded-For": _ip()},
            timeout=120,
        )
        assert r.status_code == 200, r.text[:200]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert len(r.content) > 100 * 1024
        assert r.content[:4] == b"%PDF"

    def test_unknown_brief_404(self):
        r = requests.get(
            f"{API}/public/briefs/does-not-exist.pdf",
            headers={"X-Forwarded-For": _ip()},
            timeout=15,
        )
        assert r.status_code == 404


# --- E. Briefing generation + email-to-lead bypass ------------------------------
class TestBriefings:
    @pytest.fixture(scope="class")
    def seed_diagnostic_lead(self):
        """Create a TEST_ diagnostic lead for briefing tests."""
        r = requests.post(
            f"{API}/pilot-requests",
            json=_payload(
                first_name="TEST_Briefing",
                last_name="TEST_Lead",
                corporate_email=f"test_brief_{uuid.uuid4().hex[:8]}@example.com",
                request_type="diagnostic",
                org_scale_band="1,000 – 5,000 employees",
                workforce_composition="Global with major EU footprint",
                current_vendor="WTW / Crisis24",
            ),
            headers={"X-Forwarded-For": _ip()},
            timeout=30,
        )
        assert r.status_code == 201, r.text
        return r.json()

    def test_preview_known_id(self, seed_diagnostic_lead):
        rid = seed_diagnostic_lead["id"]
        r = requests.get(
            f"{API}/admin/briefings/preview/{rid}",
            headers={"X-Admin-Token": ADMIN_TOKEN},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["lead_email"] == seed_diagnostic_lead["corporate_email"]

    def test_generate_pdf(self, seed_diagnostic_lead):
        rid = seed_diagnostic_lead["id"]
        r = requests.post(
            f"{API}/admin/briefings/generate",
            headers={"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"},
            json={"pilot_request_id": rid, "variant": "exec"},
            timeout=120,
        )
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert "X-Briefing-Id" in r.headers or "x-briefing-id" in {k.lower(): v for k, v in r.headers.items()}
        assert r.content[:4] == b"%PDF"

    def test_email_to_lead_test_bypass(self, seed_diagnostic_lead):
        rid = seed_diagnostic_lead["id"]
        r = requests.post(
            f"{API}/admin/briefings/email-to-lead",
            headers={"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"},
            json={"pilot_request_id": rid, "variant": "exec"},
            timeout=120,
        )
        assert r.status_code == 200, r.text[:300]
        body = r.json()
        assert body["ok"] is True
        assert body["email_status"] == "test_bypass", body
