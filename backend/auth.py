"""Admin authentication dependency.

`ADMIN_TOKEN` is loaded from the environment. `require_admin` is a FastAPI
dependency that gates protected routes. Behaviour:
  - ADMIN_TOKEN unset in env → 404 (endpoint appears not to exist; no info leak).
  - Token missing or incorrect → 401.
  - Correct token → returns the token (dependency is truthy).
"""
import os
from typing import Optional

from fastapi import Header, HTTPException

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()


def require_admin(x_admin_token: Optional[str] = Header(default=None)) -> str:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_admin_token
