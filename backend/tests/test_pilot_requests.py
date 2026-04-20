"""Backend tests for Third Rail Systems OÜ API: root + pilot-requests."""
import os
import time
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"


def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data == {"message": "Third Rail Systems OÜ API"}


def test_create_pilot_request_valid_and_persists():
    payload = {
        "first_name": "TEST_Levi",
        "last_name": "TEST_Hankins",
        "corporate_email": f"test_{int(time.time())}@example.com",
        "role": "CISO",
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and data["id"]
    assert data["first_name"] == payload["first_name"]
    assert data["last_name"] == payload["last_name"]
    assert data["corporate_email"] == payload["corporate_email"]
    assert data["role"] == payload["role"]
    # RESEND_API_KEY is empty → must be 'stubbed'
    assert data["email_status"] == "stubbed", f"Expected stubbed, got {data}"
    assert data.get("email_error") in (None, "")
    assert "submitted_at" in data
    created_id = data["id"]

    # Verify persistence via GET
    r2 = requests.get(f"{API}/pilot-requests", timeout=15)
    assert r2.status_code == 200
    items = r2.json()
    assert isinstance(items, list)
    ids = [i["id"] for i in items]
    assert created_id in ids


def test_create_pilot_request_invalid_email():
    payload = {
        "first_name": "Foo",
        "last_name": "Bar",
        "corporate_email": "not-an-email",
        "role": "CISO",
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, timeout=15)
    assert r.status_code == 422, r.text


def test_create_pilot_request_missing_required():
    payload = {
        "first_name": "Foo",
        # last_name missing
        "corporate_email": "valid@example.com",
        "role": "CISO",
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, timeout=15)
    assert r.status_code == 422, r.text


def test_create_pilot_request_empty_strings():
    payload = {
        "first_name": "",
        "last_name": "Bar",
        "corporate_email": "valid@example.com",
        "role": "CISO",
    }
    r = requests.post(f"{API}/pilot-requests", json=payload, timeout=15)
    assert r.status_code == 422, r.text


def test_seo_assets():
    # og.png
    r = requests.get(f"{BASE_URL}/og.png", timeout=15)
    assert r.status_code == 200, f"og.png status {r.status_code}"
    assert r.headers.get("content-type", "").startswith("image/"), r.headers
    # robots.txt
    r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
    assert r.status_code == 200
    assert "User-agent" in r.text or "Sitemap" in r.text
    # sitemap.xml
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
    assert r.status_code == 200
    assert "<urlset" in r.text or "<sitemapindex" in r.text


def test_index_html_seo_tags():
    r = requests.get(f"{BASE_URL}/", timeout=15)
    assert r.status_code == 200
    html = r.text
    assert 'application/ld+json' in html, "JSON-LD missing"
    assert 'og:' in html, "og: meta tags missing"
