"""Iteration 4 backend tests: admin auth/list endpoints + memo_read field + legal SEO assets."""
import os
import time
import uuid
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = os.environ.get("TEST_ADMIN_TOKEN") or "test-admin-xyz"  # override via TEST_ADMIN_TOKEN if the running env rotates


def _ip(prefix: str = "203.0.114") -> str:
    return f"{prefix}.{uuid.uuid4().int % 250 + 2}"


# ---------- Admin auth verify ----------

def test_admin_verify_wrong_token_returns_401():
    r = requests.post(f"{API}/admin/auth/verify", headers={"X-Admin-Token": "WRONG"}, timeout=15)
    assert r.status_code == 401, r.text


def test_admin_verify_missing_token_returns_401():
    r = requests.post(f"{API}/admin/auth/verify", timeout=15)
    assert r.status_code == 401, r.text


def test_admin_verify_correct_token_returns_ok():
    r = requests.post(f"{API}/admin/auth/verify", headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}


# ---------- Admin pilot-requests list ----------

def test_admin_list_wrong_token_401():
    r = requests.get(f"{API}/admin/pilot-requests", headers={"X-Admin-Token": "WRONG"}, timeout=15)
    assert r.status_code == 401, r.text


def test_admin_list_returns_items_and_stats():
    # Seed one record so memo_read=true exists
    headers = {"X-Forwarded-For": _ip()}
    payload = {
        "first_name": "TEST_AdminSeedA",
        "last_name": "Reader",
        "corporate_email": f"adm_a_{int(time.time())}@example.com",
        "role": "CSO",
        "company_website": "",
        "submission_ms": 3000,
        "memo_read": True,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["memo_read"] is True, body
    assert body["role"] == "CSO"

    # Seed a second record with memo_read False to ensure both states present
    headers2 = {"X-Forwarded-For": _ip()}
    p2 = {
        "first_name": "TEST_AdminSeedB",
        "last_name": "NonReader",
        "corporate_email": f"adm_b_{int(time.time())}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 3000,
        "memo_read": False,
    }
    r2 = requests.post(f"{API}/pilot-requests", json=p2, headers=headers2, timeout=15)
    assert r2.status_code == 201, r2.text
    assert r2.json()["memo_read"] is False

    # Now list with admin token
    r = requests.get(f"{API}/admin/pilot-requests",
                     headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "items" in data and isinstance(data["items"], list)
    assert "stats" in data
    s = data["stats"]
    for k in ("total", "delivered", "rejected", "memo_read", "memo_read_rate"):
        assert k in s, f"missing stat key {k}: {s}"
    assert s["total"] >= 2
    assert s["memo_read"] >= 1
    # rejected should always be 0 since rejected ones aren't persisted
    assert s["rejected"] == 0, s


def test_admin_list_filter_by_role_cso():
    r = requests.get(f"{API}/admin/pilot-requests?role=CSO",
                     headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    assert len(items) >= 1
    for it in items:
        assert it["role"].upper().startswith("CSO"), it


def test_admin_list_filter_by_status_stubbed():
    r = requests.get(f"{API}/admin/pilot-requests?status=stubbed",
                     headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    assert len(items) >= 1
    for it in items:
        assert it["email_status"] == "stubbed", it


def test_admin_list_filter_q_email():
    # Search for the seeded email partial (TEST_AdminSeedA - by first_name)
    r = requests.get(f"{API}/admin/pilot-requests?q=AdminSeedA",
                     headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    assert len(items) >= 1
    assert any("AdminSeedA" in it["first_name"] for it in items)


def test_admin_list_limit_honored():
    r = requests.get(f"{API}/admin/pilot-requests?limit=1",
                     headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15)
    assert r.status_code == 200, r.text
    assert len(r.json()["items"]) <= 1


# ---------- memo_read field round-trip ----------

def test_create_pilot_request_memo_read_true_round_trip():
    headers = {"X-Forwarded-For": _ip()}
    payload = {
        "first_name": "TEST_MemoTrue",
        "last_name": "Reader",
        "corporate_email": f"mt_{int(time.time())}@example.com",
        "role": "CTO",
        "company_website": "",
        "submission_ms": 3500,
        "memo_read": True,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    assert r.json()["memo_read"] is True


def test_create_pilot_request_memo_read_default_false():
    headers = {"X-Forwarded-For": _ip()}
    payload = {
        "first_name": "TEST_MemoDef",
        "last_name": "X",
        "corporate_email": f"md_{int(time.time())}@example.com",
        "role": "VP Eng",
        "company_website": "",
        "submission_ms": 3500,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    assert r.json()["memo_read"] is False


# ---------- legal page assets / SEO ----------

def test_robots_disallows_admin():
    r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
    assert r.status_code == 200
    assert "Disallow: /admin" in r.text


def test_sitemap_lists_six_urls_with_legal():
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
    assert r.status_code == 200
    body = r.text
    for path in ("/", "/memo", "/legal/privacy", "/legal/terms", "/legal/cookies", "/legal/imprint"):
        assert path in body, f"sitemap missing {path}"
    # Roughly 6 <loc> entries
    assert body.count("<loc>") == 6, f"expected 6 <loc> entries, got {body.count('<loc>')}"
