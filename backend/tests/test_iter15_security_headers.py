"""Iteration 15: verify security headers middleware, admin login cookie
flow, diagnostic intake stub, and public brief PDF endpoint."""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://eu-travel-risk.preview.emergentagent.com").rstrip("/")
ADMIN_TOKEN = "dev-admin-trs-2026"


# --- Security headers on /api/ -------------------------------------------------
class TestSecurityHeaders:
    def test_security_headers_on_api_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        h = r.headers
        assert h.get("X-Content-Type-Options") == "nosniff"
        assert h.get("X-Frame-Options") == "DENY"
        assert h.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "geolocation=()" in h.get("Permissions-Policy", "")
        assert h.get("Cross-Origin-Opener-Policy") == "same-origin"
        assert "max-age=" in h.get("Strict-Transport-Security", "")
        assert "frame-ancestors 'none'" in h.get("Content-Security-Policy", "")

    def test_security_headers_on_pdf_endpoint(self):
        # PDF endpoint should still carry frame-ancestors none
        r = requests.get(f"{BASE_URL}/api/public/briefs/shadow-hr.pdf")
        assert r.status_code == 200
        assert r.headers.get("X-Frame-Options") == "DENY"
        assert "frame-ancestors 'none'" in r.headers.get("Content-Security-Policy", "")


# --- Public brief PDF unchanged ------------------------------------------------
class TestPublicBriefPDF:
    def test_pdf_magic_and_size(self):
        r = requests.get(f"{BASE_URL}/api/public/briefs/shadow-hr.pdf")
        assert r.status_code == 200
        body = r.content
        assert body[:5] == b"%PDF-", f"Not a PDF: first bytes={body[:8]!r}"
        assert len(body) > 100_000, f"PDF unexpectedly small: {len(body)} bytes"
        assert "application/pdf" in r.headers.get("content-type", "").lower()


# --- Admin login cookie flow ---------------------------------------------------
class TestAdminCookieFlow:
    def test_login_sets_cookie_and_endpoints_reachable(self):
        s = requests.Session()
        login = s.post(f"{BASE_URL}/api/admin/login",
                       json={"token": ADMIN_TOKEN},
                       headers={"Content-Type": "application/json"})
        assert login.status_code == 200, login.text
        assert any(c.name == "trs_admin_session" for c in s.cookies), \
            f"Missing trs_admin_session cookie. Got: {[c.name for c in s.cookies]}"

        verify = s.post(f"{BASE_URL}/api/admin/auth/verify")
        assert verify.status_code == 200, verify.text

        pilots = s.get(f"{BASE_URL}/api/admin/pilot-requests?limit=1")
        assert pilots.status_code == 200, pilots.text
        data = pilots.json()
        assert "items" in data or isinstance(data, (list, dict))


# --- Diagnostic intake (stubbed via TEST_ prefix) -----------------------------
class TestDiagnosticIntake:
    def test_pilot_request_stub_for_test_prefix(self):
        payload = {
            "first_name": "TEST_LIGHTHOUSE",
            "last_name": "Smoke",
            "corporate_email": "test_lighthouse@example.com",
            "role": "Head of People Ops",
            "submission_ms": 8000,
        }
        r = requests.post(f"{BASE_URL}/api/pilot-requests", json=payload)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        # Either stubbed or test_bypass acceptable (iter14 renamed)
        email_status = (body.get("email_status")
                        or body.get("data", {}).get("email_status"))
        assert email_status in ("stubbed", "test_bypass"), \
            f"Expected stubbed/test_bypass for TEST_ prefix, got: {email_status!r} body={body}"
