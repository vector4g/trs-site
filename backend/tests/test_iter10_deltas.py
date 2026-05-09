"""Iteration 10 deltas:
  - catch22_read persistence on POST /api/pilot-requests
  - GET /api/admin/pilot-requests stats schema (catch22_read, catch22_read_rate, both_read)
  - POST /api/admin/briefings/email-to-lead (200 / 401 / 404)
  - SEO/static assets (favicon family + /og.png 1200x630)
  - Rate limiter: 6th rapid POST on same X-Forwarded-For returns 429
"""
import os
import time
import uuid
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "dev-admin-trs-2026")
HDR_ADMIN = {"X-Admin-Token": ADMIN_TOKEN}


def _ip(prefix: str = "203.0.113") -> str:
    return f"{prefix}.{uuid.uuid4().int % 250 + 2}"


# ---------- catch22_read persistence ----------
def test_catch22_read_true_persists_and_admin_returns_it():
    ip = _ip()
    payload = {
        "first_name": "TEST_C22",
        "last_name": "TEST_Reader",
        "corporate_email": f"c22_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 4500,
        "memo_read": True,
        "catch22_read": True,
    }
    r = requests.post(
        f"{API}/pilot-requests", json=payload,
        headers={"X-Forwarded-For": ip}, timeout=20,
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["catch22_read"] is True, body
    assert body["memo_read"] is True, body
    pr_id = body["id"]

    # Confirm via admin list
    r = requests.get(f"{API}/admin/pilot-requests?limit=1000", headers=HDR_ADMIN, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    items = {x["id"]: x for x in data["items"]}
    assert pr_id in items, "newly created lead should appear in admin list"
    assert items[pr_id]["catch22_read"] is True
    assert items[pr_id]["memo_read"] is True


def test_catch22_read_false_default_when_omitted():
    ip = _ip()
    payload = {
        "first_name": "TEST_NoFlags",
        "last_name": "TEST_X",
        "corporate_email": f"nf_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 4500,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": ip}, timeout=20)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["catch22_read"] is False
    assert body["memo_read"] is False


# ---------- admin stats schema ----------
def test_admin_stats_includes_catch22_and_both_fields():
    r = requests.get(f"{API}/admin/pilot-requests?limit=1", headers=HDR_ADMIN, timeout=20)
    assert r.status_code == 200, r.text
    stats = r.json()["stats"]
    for key in ("total", "delivered", "memo_read", "memo_read_rate",
                "catch22_read", "catch22_read_rate", "both_read"):
        assert key in stats, f"missing {key} in stats: {stats}"
    assert isinstance(stats["catch22_read"], int)
    assert isinstance(stats["both_read"], int)
    assert isinstance(stats["catch22_read_rate"], (int, float))
    # both_read can never exceed min(memo_read, catch22_read)
    assert stats["both_read"] <= stats["memo_read"]
    assert stats["both_read"] <= stats["catch22_read"]


# ---------- email-to-lead ----------
def _seed_lead_for_email() -> str:
    ip = _ip()
    payload = {
        "first_name": "TEST_BriefLead",
        "last_name": "TEST_Reader",
        "corporate_email": f"brief.reader_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 4500,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload,
                      headers={"X-Forwarded-For": ip}, timeout=20)
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_email_to_lead_unauthorised_returns_401():
    r = requests.post(
        f"{API}/admin/briefings/email-to-lead",
        json={"pilot_request_id": "any", "variant": "exec"},
        timeout=20,
    )
    assert r.status_code == 401, r.text


def test_email_to_lead_404_for_unknown_pilot_request():
    r = requests.post(
        f"{API}/admin/briefings/email-to-lead",
        json={"pilot_request_id": "does-not-exist-" + uuid.uuid4().hex,
              "variant": "exec"},
        headers=HDR_ADMIN, timeout=45,
    )
    assert r.status_code == 404, r.text


def test_email_to_lead_exec_returns_sent():
    pr_id = _seed_lead_for_email()
    r = requests.post(
        f"{API}/admin/briefings/email-to-lead",
        json={"pilot_request_id": pr_id, "variant": "exec"},
        headers=HDR_ADMIN, timeout=60,  # PDF gen can take 8-12s
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True
    assert body["email_status"] in ("sent", "stubbed"), body
    assert body["briefing_id"].startswith("EB-"), body
    assert body["filename"].endswith(".pdf"), body
    assert "@" in body["recipient"]


# ---------- favicon + og.png ----------
def test_favicon_assets_200():
    for path in ("/favicon.ico", "/favicon-16.png", "/favicon-32.png", "/apple-touch-icon.png"):
        r = requests.get(f"{BASE_URL}{path}", timeout=15)
        assert r.status_code == 200, f"{path} -> {r.status_code}"


def test_index_html_has_favicon_and_apple_links():
    r = requests.get(f"{BASE_URL}/", timeout=15)
    assert r.status_code == 200
    html = r.text
    assert 'rel="icon"' in html
    assert 'rel="apple-touch-icon"' in html
    assert "favicon-32.png" in html
    assert "apple-touch-icon.png" in html


def test_og_image_meta():
    r = requests.get(f"{BASE_URL}/og.png", timeout=20)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/png")
    size = int(r.headers.get("content-length") or len(r.content))
    assert 50_000 < size < 2_000_000, f"og.png size unexpected: {size}"


# ---------- rate limiter ----------
def test_rate_limit_5_then_429_with_retry_after():
    ip = _ip("198.51.100")
    headers = {"X-Forwarded-For": ip}
    for i in range(5):
        r = requests.post(
            f"{API}/pilot-requests",
            json={
                "first_name": f"TEST_RL{i}", "last_name": "Z",
                "corporate_email": f"rl{i}_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
                "role": "CISO", "company_website": "", "submission_ms": 3000,
            },
            headers=headers, timeout=20,
        )
        assert r.status_code == 201, f"req {i+1} -> {r.status_code} {r.text}"

    r = requests.post(
        f"{API}/pilot-requests",
        json={
            "first_name": "TEST_RL6", "last_name": "Z",
            "corporate_email": f"rl6_{int(time.time())}_{uuid.uuid4().hex[:6]}@example.com",
            "role": "CISO", "company_website": "", "submission_ms": 3000,
        },
        headers=headers, timeout=20,
    )
    assert r.status_code == 429, r.text
    assert "Retry-After" in r.headers
    assert int(r.headers["Retry-After"]) > 0
