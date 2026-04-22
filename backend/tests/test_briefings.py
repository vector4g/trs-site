"""Iteration 5 backend tests: Executive briefing PDF generation + Brandfetch preview.

Covers:
- POST /api/admin/briefings/generate auth (401), 404, 422, 200 exec/full
- GET /api/admin/briefings/preview/{id} (Stripe live + gmail short-circuit)
- briefings_generated audit increment
- override fields for company + logo
"""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "e2e-test-token-7321"
HDR = {"X-Admin-Token": ADMIN_TOKEN}

STRIPE_LEAD_EMAIL = "patrick@stripe.com"


def _ip(prefix: str = "203.0.115") -> str:
    return f"{prefix}.{uuid.uuid4().int % 250 + 2}"


def _seed_pilot(email: str | None = None, first: str = "TEST_Brief", last: str = "Lead", role: str = "CSO") -> str:
    """POST /api/pilot-requests, return id."""
    payload = {
        "first_name": first,
        "last_name": last,
        "corporate_email": email or f"brief_{uuid.uuid4().hex[:8]}@example.com",
        "role": role,
        "company_website": "",
        "submission_ms": 3000,
        "memo_read": True,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers={"X-Forwarded-For": _ip()}, timeout=15)
    assert r.status_code == 201, r.text
    return r.json()["id"]


@pytest.fixture(scope="module")
def stripe_lead_id():
    """Find or create a patrick@stripe.com pilot request for Brandfetch tests."""
    r = requests.get(f"{API}/admin/pilot-requests", headers=HDR, params={"q": "stripe.com", "limit": 100}, timeout=15)
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    for it in items:
        if it.get("corporate_email", "").lower() == STRIPE_LEAD_EMAIL:
            return it["id"]
    # Seed if missing
    return _seed_pilot(email=STRIPE_LEAD_EMAIL, first="Patrick", last="Collison", role="C-Suite")


@pytest.fixture(scope="module")
def gmail_lead_id():
    return _seed_pilot(email=f"freeuser_{uuid.uuid4().hex[:8]}@gmail.com")


# ---------- AUTH ----------

def test_generate_wrong_token_401():
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": "x", "variant": "exec"},
                      headers={"X-Admin-Token": "WRONG"}, timeout=15)
    assert r.status_code == 401, r.text


def test_generate_no_token_401():
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": "x", "variant": "exec"}, timeout=15)
    assert r.status_code == 401, r.text


def test_preview_wrong_token_401():
    r = requests.get(f"{API}/admin/briefings/preview/anyid", headers={"X-Admin-Token": "WRONG"}, timeout=15)
    assert r.status_code == 401, r.text


# ---------- VALIDATION ----------

def test_generate_unknown_pilot_id_404(stripe_lead_id):
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": "no-such-id-xyz", "variant": "exec"},
                      headers=HDR, timeout=30)
    assert r.status_code == 404, r.text


def test_generate_bogus_variant_422(stripe_lead_id):
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": stripe_lead_id, "variant": "bogus"},
                      headers=HDR, timeout=15)
    assert r.status_code == 422, r.text


def test_preview_unknown_pilot_id_404():
    r = requests.get(f"{API}/admin/briefings/preview/no-such-id-xyz", headers=HDR, timeout=15)
    assert r.status_code == 404, r.text


# ---------- PREVIEW (Brandfetch live) ----------

def test_preview_stripe_resolves_company(stripe_lead_id):
    r = requests.get(f"{API}/admin/briefings/preview/{stripe_lead_id}", headers=HDR, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["lead_email"].lower() == STRIPE_LEAD_EMAIL
    assert data["domain"] == "stripe.com"
    # Brandfetch lookup — should resolve to "Stripe" (case-insensitive contains)
    assert data["inferred_company"] is not None, f"Brandfetch returned no company: {data}"
    assert "stripe" in data["inferred_company"].lower(), data
    # Logo URL likely populated; allow None tolerance but warn
    assert data["inferred_logo_url"] is None or data["inferred_logo_url"].startswith(("http://", "https://"))


def test_preview_gmail_short_circuits(gmail_lead_id):
    r = requests.get(f"{API}/admin/briefings/preview/{gmail_lead_id}", headers=HDR, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["domain"] == "gmail.com"
    assert data["inferred_company"] is None
    assert data["inferred_logo_url"] is None


# ---------- GENERATE (PDF rendering) ----------

def test_generate_exec_pdf(stripe_lead_id):
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": stripe_lead_id, "variant": "exec"},
                      headers=HDR, timeout=60)
    assert r.status_code == 200, r.text[:500]
    assert r.headers.get("content-type", "").startswith("application/pdf"), r.headers
    assert r.content.startswith(b"%PDF-"), r.content[:10]
    cd = r.headers.get("content-disposition", "")
    assert 'attachment;' in cd.lower() and 'filename=' in cd, cd
    assert "ThirdRail-ExecSummary-" in cd, cd
    assert r.headers.get("x-briefing-id", "").startswith("EB-"), r.headers
    # Stash size for comparison
    pytest.exec_pdf_size = len(r.content)
    assert pytest.exec_pdf_size > 5000, f"PDF suspiciously small: {pytest.exec_pdf_size} bytes"


def test_generate_full_pdf_larger_than_exec(stripe_lead_id):
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={"pilot_request_id": stripe_lead_id, "variant": "full"},
                      headers=HDR, timeout=60)
    assert r.status_code == 200, r.text[:500]
    assert r.content.startswith(b"%PDF-"), r.content[:10]
    cd = r.headers.get("content-disposition", "")
    assert "ThirdRail-FullMemo-" in cd, cd
    full_size = len(r.content)
    exec_size = getattr(pytest, "exec_pdf_size", 0)
    assert full_size > exec_size, f"full ({full_size}) should be > exec ({exec_size})"


# ---------- AUDIT ----------

def test_briefings_generated_increment(stripe_lead_id):
    """After 2 generations above, the lead row should have briefings_generated >= 2 and last_briefing_id set."""
    r = requests.get(f"{API}/admin/pilot-requests", headers=HDR,
                     params={"q": "stripe.com", "limit": 50}, timeout=15)
    assert r.status_code == 200, r.text
    items = [it for it in r.json()["items"] if it["id"] == stripe_lead_id]
    assert items, f"Stripe lead not found in admin list"
    row = items[0]
    assert row.get("briefings_generated", 0) >= 2, row
    assert row.get("last_briefing_id", "").startswith("EB-"), row


# ---------- OVERRIDE FIELDS ----------

def test_generate_with_company_override(stripe_lead_id):
    """Passing prospect_company_override should appear in filename slug."""
    r = requests.post(f"{API}/admin/briefings/generate",
                      json={
                          "pilot_request_id": stripe_lead_id,
                          "variant": "exec",
                          "prospect_company_override": "My Co.",
                      },
                      headers=HDR, timeout=60)
    assert r.status_code == 200, r.text[:500]
    cd = r.headers.get("content-disposition", "")
    # "My Co." → filename-safe → "My-Co"
    assert "My-Co" in cd, f"Override company missing from filename: {cd}"
    # PDF body text is FlateDecode-compressed. The /Title metadata is stored as
    # a hex-encoded UTF-16BE string with FEFF BOM, e.g. "My Co." →
    # ASCII hex chars "004D0079002000430 06F002E". Try multiple detection paths.
    utf16be_hex_my_co = b"004D007900200043006F002E"  # "My Co."
    found_metadata = utf16be_hex_my_co in r.content or utf16be_hex_my_co.lower() in r.content
    found_text = False
    try:
        import io, pdfplumber  # type: ignore
        with pdfplumber.open(io.BytesIO(r.content)) as pdf:
            text = "\n".join((p.extract_text() or "") for p in pdf.pages)
        found_text = "My Co" in text
    except Exception:
        pass
    assert found_metadata or found_text, (
        "Override company not found in PDF metadata or extracted text"
    )
