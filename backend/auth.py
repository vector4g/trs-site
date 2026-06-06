"""Admin authentication.

Two valid credentials, in priority order:

  1) `trs_admin_session` httpOnly cookie containing a JWT signed with
     `JWT_SECRET`. Set by `POST /api/admin/login`, cleared by
     `POST /api/admin/logout`. 8-hour expiry. This is the path used by the
     React admin UI — replaces the previous `localStorage` shared-secret flow.

  2) Legacy `X-Admin-Token` header carrying `ADMIN_TOKEN` directly. Retained
     for the pytest suite and any remaining server-to-server callers. The
     React app no longer sends this header.

Behaviour:
  - `ADMIN_TOKEN` unset in env → 404 (endpoint appears not to exist; no info
    leak about the existence of the admin surface).
  - Neither credential present, or both invalid → 401.
  - Valid credential → dependency returns "admin" (truthy).
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import HTTPException, Request

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()
JWT_SECRET = os.environ.get("JWT_SECRET", "").strip()
JWT_ALGORITHM = "HS256"

# Cookie config — admin UI is same-origin with the API behind the Kubernetes
# ingress, so SameSite=strict is safe and rejects every cross-site CSRF
# vector. Production + preview both run over HTTPS so Secure=True is enforced
# everywhere.
SESSION_COOKIE = "trs_admin_session"
SESSION_TTL_HOURS = 8
SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60


def create_session_token() -> str:
    """Sign a short-lived admin session JWT."""
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not configured")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=SESSION_TTL_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _verify_session_token(token: Optional[str]) -> bool:
    if not token or not JWT_SECRET:
        return False
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub") == "admin"
    except jwt.PyJWTError:
        return False


def require_admin(request: Request) -> str:
    """FastAPI dependency. Validates cookie first, then legacy header."""
    if not ADMIN_TOKEN:
        # Fail-closed: the admin surface should look like it doesn't exist
        # when the server hasn't been configured for it.
        raise HTTPException(status_code=404, detail="Not found")

    cookie_token = request.cookies.get(SESSION_COOKIE)
    if _verify_session_token(cookie_token):
        return "admin"

    header_token = request.headers.get("x-admin-token") or request.headers.get(
        "X-Admin-Token"
    )
    if header_token and header_token == ADMIN_TOKEN:
        return "admin"

    raise HTTPException(status_code=401, detail="Unauthorized")
