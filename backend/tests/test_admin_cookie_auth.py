"""Cookie-based admin session tests (P1 migration).

Validates:
  - POST /api/admin/login with the right token sets `trs_admin_session` and
    the cookie is httpOnly + Secure + SameSite=Strict.
  - The session cookie alone authenticates protected admin routes.
  - POST /api/admin/logout clears the cookie.
  - Wrong token → 401, no cookie.
  - Legacy `X-Admin-Token` header path still works (backwards-compat for
    pytest + any server-to-server callers).
"""
import os

import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = (
    os.environ.get("TEST_ADMIN_TOKEN")
    or os.environ.get("ADMIN_TOKEN")
    or "dev-admin-trs-2026"
)
SESSION_COOKIE = "trs_admin_session"


def _login(session: requests.Session, token: str) -> requests.Response:
    return session.post(
        f"{API}/admin/login",
        json={"token": token},
        timeout=15,
    )


def test_login_wrong_token_returns_401_and_sets_no_cookie():
    s = requests.Session()
    r = _login(s, "WRONG")
    assert r.status_code == 401, r.text
    assert SESSION_COOKIE not in s.cookies


def test_login_success_sets_httponly_secure_strict_cookie():
    s = requests.Session()
    r = _login(s, ADMIN_TOKEN)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}
    assert SESSION_COOKIE in s.cookies
    # Inspect the raw Set-Cookie header for security attributes.
    raw = r.headers.get("set-cookie", "")
    assert "HttpOnly" in raw, raw
    assert "Secure" in raw, raw
    assert "samesite=strict" in raw.lower(), raw


def test_session_cookie_alone_authenticates_admin_routes():
    s = requests.Session()
    assert _login(s, ADMIN_TOKEN).status_code == 200
    # No X-Admin-Token header — the cookie alone must work.
    r = s.post(f"{API}/admin/auth/verify", timeout=15)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}
    r = s.get(f"{API}/admin/pilot-requests?limit=1", timeout=20)
    assert r.status_code == 200, r.text
    assert "items" in r.json()


def test_logout_clears_session_cookie():
    s = requests.Session()
    assert _login(s, ADMIN_TOKEN).status_code == 200
    assert SESSION_COOKIE in s.cookies
    r = s.post(f"{API}/admin/logout", timeout=15)
    assert r.status_code == 200, r.text
    # After logout the protected endpoint must reject the (now-cleared) session.
    r2 = s.post(f"{API}/admin/auth/verify", timeout=15)
    assert r2.status_code == 401, r2.text


def test_legacy_header_still_authenticates():
    # Backwards compatibility — pytest + server-to-server callers still use
    # X-Admin-Token. Removing the fallback would be a breaking change.
    r = requests.post(
        f"{API}/admin/auth/verify",
        headers={"X-Admin-Token": ADMIN_TOKEN},
        timeout=15,
    )
    assert r.status_code == 200, r.text
