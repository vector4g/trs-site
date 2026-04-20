"""Backend tests for Third Rail Systems OÜ API: root + pilot-requests + anti-spam (iter 3)."""
import os
import time
import uuid
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"


def _unique_ip(prefix: str = "203.0.113") -> str:
    """Return a unique X-Forwarded-For IP within the TEST-NET-3 range so we
    don't collide with prior test buckets in the in-memory rate limiter."""
    last = uuid.uuid4().int % 250 + 2
    return f"{prefix}.{last}"


def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200, r.text
    assert r.json() == {"message": "Third Rail Systems OÜ API"}


# ---------- happy path (regression from iteration 2) ----------

def test_create_pilot_request_valid_and_persists():
    headers = {"X-Forwarded-For": _unique_ip()}
    payload = {
        "first_name": "TEST_Levi",
        "last_name": "TEST_Hankins",
        "corporate_email": f"test_{int(time.time())}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 5000,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["first_name"] == payload["first_name"]
    assert data["email_status"] == "stubbed", data
    assert data.get("email_error") in (None, "")
    assert "id" in data and data["id"]


def test_create_pilot_request_invalid_email():
    headers = {"X-Forwarded-For": _unique_ip()}
    r = requests.post(
        f"{API}/pilot-requests",
        json={"first_name": "F", "last_name": "B", "corporate_email": "bad", "role": "CISO"},
        headers=headers, timeout=15,
    )
    assert r.status_code == 422, r.text


def test_create_pilot_request_missing_required():
    headers = {"X-Forwarded-For": _unique_ip()}
    r = requests.post(
        f"{API}/pilot-requests",
        json={"first_name": "F", "corporate_email": "ok@example.com", "role": "CISO"},
        headers=headers, timeout=15,
    )
    assert r.status_code == 422, r.text


# ---------- iteration 3: anti-spam guards ----------

def test_honeypot_rejects_silently():
    """company_website filled => 201 with email_status='rejected', email_error='honeypot'."""
    headers = {"X-Forwarded-For": _unique_ip()}
    payload = {
        "first_name": "Bot",
        "last_name": "Bot",
        "corporate_email": "bot@example.com",
        "role": "CISO",
        "company_website": "https://spammer.example.com",
        "submission_ms": 8000,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["email_status"] == "rejected", data
    assert data["email_error"] == "honeypot", data


def test_submission_too_fast_rejected():
    headers = {"X-Forwarded-For": _unique_ip()}
    payload = {
        "first_name": "Quick",
        "last_name": "Draw",
        "corporate_email": "q@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 100,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["email_status"] == "rejected", data
    assert data["email_error"] == "submission_too_fast", data


def test_normal_submission_passes_anti_spam():
    headers = {"X-Forwarded-For": _unique_ip()}
    payload = {
        "first_name": "TEST_Real",
        "last_name": "TEST_Human",
        "corporate_email": f"human_{int(time.time())}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 2400,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["email_status"] == "stubbed", data


def test_rate_limit_5_then_429():
    """6 rapid POSTs from same IP — first 5 succeed, 6th returns 429 with Retry-After."""
    ip = _unique_ip("198.51.100")
    headers = {"X-Forwarded-For": ip}

    for i in range(5):
        payload = {
            "first_name": f"TEST_R{i}",
            "last_name": "Limit",
            "corporate_email": f"rl_{i}_{int(time.time())}@example.com",
            "role": "CISO",
            "company_website": "",
            "submission_ms": 3000,
        }
        r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
        assert r.status_code == 201, f"Request {i+1} failed: {r.status_code} {r.text}"

    # 6th must be 429
    payload = {
        "first_name": "TEST_R6",
        "last_name": "Limit",
        "corporate_email": f"rl_6_{int(time.time())}@example.com",
        "role": "CISO",
        "company_website": "",
        "submission_ms": 3000,
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, headers=headers, timeout=15)
    assert r.status_code == 429, f"Expected 429, got {r.status_code}: {r.text}"
    assert "Retry-After" in r.headers, f"Missing Retry-After header: {dict(r.headers)}"
    assert int(r.headers["Retry-After"]) > 0


def test_rate_limit_buckets_are_per_ip():
    """Different X-Forwarded-For IPs must NOT share a bucket."""
    ip_a = _unique_ip("198.51.101")
    ip_b = _unique_ip("198.51.102")

    # Burn 5 on IP_A
    for i in range(5):
        r = requests.post(
            f"{API}/pilot-requests",
            json={
                "first_name": f"TEST_A{i}", "last_name": "X",
                "corporate_email": f"a_{i}_{int(time.time())}@example.com",
                "role": "CISO", "company_website": "", "submission_ms": 3000,
            },
            headers={"X-Forwarded-For": ip_a}, timeout=15,
        )
        assert r.status_code == 201

    # IP_A should now be blocked
    r = requests.post(
        f"{API}/pilot-requests",
        json={"first_name": "TEST_A6", "last_name": "X",
              "corporate_email": f"a_6_{int(time.time())}@example.com",
              "role": "CISO", "company_website": "", "submission_ms": 3000},
        headers={"X-Forwarded-For": ip_a}, timeout=15,
    )
    assert r.status_code == 429, f"IP_A should be blocked, got {r.status_code}"

    # IP_B should still succeed
    r = requests.post(
        f"{API}/pilot-requests",
        json={"first_name": "TEST_B1", "last_name": "Y",
              "corporate_email": f"b_1_{int(time.time())}@example.com",
              "role": "CISO", "company_website": "", "submission_ms": 3000},
        headers={"X-Forwarded-For": ip_b}, timeout=15,
    )
    assert r.status_code == 201, f"IP_B should not be blocked: {r.status_code} {r.text}"


# ---------- admin GET gating (regression iteration 2 + iter3 expectation) ----------

def test_get_pilot_requests_returns_404_without_admin_token_env():
    """ADMIN_TOKEN env is not set in this environment → endpoint must 404 (fail-closed)."""
    r = requests.get(f"{API}/pilot-requests", timeout=15)
    # If ADMIN_TOKEN is unset → 404. If somehow set → must be 401 without header.
    assert r.status_code in (404, 401), r.text


# ---------- SEO regression ----------

def test_seo_assets():
    r = requests.get(f"{BASE_URL}/og.png", timeout=15)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/")
    r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
    assert r.status_code == 200
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
    assert r.status_code == 200
    assert "<urlset" in r.text or "<sitemapindex" in r.text


def test_index_html_seo_tags():
    r = requests.get(f"{BASE_URL}/", timeout=15)
    assert r.status_code == 200
    html = r.text
    assert "application/ld+json" in html
    assert "og:" in html
