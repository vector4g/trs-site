"""Iteration 11 deltas: /diagnostic intake + admin Type column + PDF endpoint.
  - POST /api/pilot-requests accepts request_type ('pilot'|'diagnostic') + 3 qualifier fields
  - Defaults request_type='pilot' when omitted
  - Rejects invalid request_type values with 422
  - GET /api/admin/pilot-requests has 'diagnostic_count' stat + ?request_type=diagnostic filter
  - GET /api/public/briefs/shadow-hr.pdf returns 200, application/pdf, size > 100KB
  - Legacy intake (no request_type / qualifier fields) still works (back-compat)
"""
import os
import time
import uuid
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "dev-admin-trs-2026")
HDR_ADMIN = {"X-Admin-Token": ADMIN_TOKEN}


def _ip() -> str:
    # Unique TEST-NET-1 IP per call to dodge per-IP rate limiter
    return f"198.51.100.{uuid.uuid4().int % 250 + 2}"


def _base_payload(prefix="TEST_Diag") -> dict:
    return {
        "first_name": f"{prefix}_First",
        "last_name": f"{prefix}_Last",
        "corporate_email": f"diag_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 4500,
    }


# ---------- Diagnostic intake accepts new fields and persists them ----------
def test_diagnostic_post_persists_new_fields():
    payload = _base_payload("TEST_DiagFields")
    payload.update({
        "request_type": "diagnostic",
        "org_scale_band": "5,000 – 25,000 employees",
        "workforce_composition": "EU + UK",
        "current_vendor": "International SOS",
    })
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["request_type"] == "diagnostic"
    assert body["org_scale_band"] == "5,000 – 25,000 employees"
    assert body["workforce_composition"] == "EU + UK"
    assert body["current_vendor"] == "International SOS"
    pr_id = body["id"]

    # Verify via admin listing
    r2 = requests.get(f"{API}/admin/pilot-requests?limit=1000",
                      headers=HDR_ADMIN, timeout=30)
    assert r2.status_code == 200
    items = {x["id"]: x for x in r2.json()["items"]}
    assert pr_id in items
    assert items[pr_id]["request_type"] == "diagnostic"
    assert items[pr_id]["org_scale_band"] == "5,000 – 25,000 employees"


# ---------- Default request_type when omitted ----------
def test_default_request_type_is_pilot():
    payload = _base_payload("TEST_DefaultPilot")
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["request_type"] == "pilot"
    # qualifier fields should be None / absent
    assert body.get("org_scale_band") in (None, "")
    assert body.get("workforce_composition") in (None, "")
    assert body.get("current_vendor") in (None, "")


# ---------- Invalid request_type rejected ----------
def test_invalid_request_type_returns_422():
    payload = _base_payload("TEST_InvalidType")
    payload["request_type"] = "spam"
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert r.status_code == 422, r.text


# ---------- Admin stats includes diagnostic_count ----------
def test_admin_stats_has_diagnostic_count():
    # First, seed a diagnostic record so count > 0 is guaranteed
    seed = _base_payload("TEST_StatsSeed")
    seed.update({
        "request_type": "diagnostic",
        "org_scale_band": "Under 1,000 employees",
        "workforce_composition": "EU / EEA only",
        "current_vendor": "No travel-risk vendor",
    })
    r = requests.post(f"{API}/pilot-requests", json=seed,
                      headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert r.status_code == 201

    r = requests.get(f"{API}/admin/pilot-requests?limit=1",
                     headers=HDR_ADMIN, timeout=30)
    assert r.status_code == 200
    stats = r.json()["stats"]
    assert "diagnostic_count" in stats, stats
    assert isinstance(stats["diagnostic_count"], int)
    assert stats["diagnostic_count"] >= 1


# ---------- Admin ?request_type=diagnostic filter ----------
def test_admin_filter_request_type_diagnostic():
    # Seed at least one diagnostic
    seed = _base_payload("TEST_FilterSeed")
    seed.update({
        "request_type": "diagnostic",
        "org_scale_band": "Global with major EU footprint",
        "workforce_composition": "EU + UK",
        "current_vendor": "Other",
    })
    rs = requests.post(f"{API}/pilot-requests", json=seed,
                       headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert rs.status_code == 201

    r = requests.get(f"{API}/admin/pilot-requests?request_type=diagnostic&limit=500",
                     headers=HDR_ADMIN, timeout=30)
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) >= 1
    for it in items:
        assert it["request_type"] == "diagnostic", it

    # And filter for pilot returns only pilots
    r2 = requests.get(f"{API}/admin/pilot-requests?request_type=pilot&limit=500",
                      headers=HDR_ADMIN, timeout=30)
    assert r2.status_code == 200
    for it in r2.json()["items"]:
        assert it["request_type"] == "pilot", it


# ---------- Public brief PDF still works ----------
def test_public_brief_pdf_returns_valid_pdf():
    # Use unique IP to dodge the briefs rate limiter (4/15min)
    r = requests.get(f"{API}/public/briefs/shadow-hr.pdf",
                     headers={"X-Forwarded-For": _ip()}, timeout=120)
    assert r.status_code == 200, r.text[:500]
    assert r.headers.get("content-type", "").startswith("application/pdf"), r.headers
    size = len(r.content)
    assert size > 100_000, f"PDF too small: {size} bytes"
    # PDF magic header
    assert r.content[:4] == b"%PDF", r.content[:8]


# ---------- Back-compat: legacy intake without new fields still works ----------
def test_legacy_intake_back_compat():
    payload = {
        "first_name": "TEST_Legacy",
        "last_name": "TEST_Lead",
        "corporate_email": f"legacy_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 4500,
        "memo_read": True,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": _ip()}, timeout=30)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["request_type"] == "pilot"
    assert body["memo_read"] is True
