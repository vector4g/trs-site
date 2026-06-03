"""Per-IP sliding-window rate limiter, Redis-backed with in-memory fallback.

Two named limiters are exported:
  - check_pilot_rate(ip): 5 requests / 15 minutes — POST /pilot-requests
  - check_brief_pdf_rate(ip): 4 requests / 15 minutes — GET /public/briefs/*.pdf

If REDIS_URL is set and reachable, requests are tracked in a ZSET. Otherwise
the limiter falls back to an in-process deque so dev/test environments without
Redis still get protection (cleared on process restart, but that's acceptable
for short-lived abuse windows).

`get_client_ip(request)` honours X-Forwarded-For / X-Real-IP first.
"""
from __future__ import annotations

import logging
import os
import time
import uuid
from collections import deque

from fastapi import Request

logger = logging.getLogger(__name__)

# --- Limits --------------------------------------------------------------------
PILOT_MAX = 5
PILOT_WINDOW_S = 15 * 60

BRIEF_PDF_MAX = 4
BRIEF_PDF_WINDOW_S = 15 * 60

# --- Backends ------------------------------------------------------------------
_pilot_buckets: dict[str, deque] = {}
_brief_pdf_buckets: dict[str, deque] = {}

REDIS_URL = os.environ.get("REDIS_URL", "").strip()
_redis_client = None
if REDIS_URL:
    try:
        import redis as _redis_lib

        _redis_client = _redis_lib.Redis.from_url(
            REDIS_URL,
            socket_timeout=0.5,
            socket_connect_timeout=0.5,
            decode_responses=False,
        )
        _redis_client.ping()
        logger.info("Rate limiter: Redis backend at %s", REDIS_URL)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Rate limiter: Redis unavailable (%s) — falling back to in-memory", exc
        )
        _redis_client = None


def _check(
    ip: str,
    key_prefix: str,
    max_count: int,
    window_s: int,
    fallback_buckets: dict[str, deque],
) -> tuple[bool, int]:
    """Generic sliding-window check. Returns (allowed, retry_after_seconds)."""
    now = time.time()
    if _redis_client is not None:
        key = f"{key_prefix}:{ip}"
        cutoff = now - window_s
        try:
            pipe = _redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, cutoff)
            pipe.zcard(key)
            pipe.zrange(key, 0, 0, withscores=True)
            _, count, oldest = pipe.execute()
            if count >= max_count:
                first_score = oldest[0][1] if oldest else now
                retry_after = int(window_s - (now - first_score)) + 1
                return False, max(retry_after, 1)
            member = f"{now}:{uuid.uuid4().hex[:8]}".encode()
            add_pipe = _redis_client.pipeline()
            add_pipe.zadd(key, {member: now})
            add_pipe.expire(key, window_s + 60)
            add_pipe.execute()
            return True, 0
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Redis rate-limit failure (%s) — falling back to in-memory", exc
            )
            # fall through to in-memory below
    bucket = fallback_buckets.setdefault(ip, deque())
    while bucket and now - bucket[0] > window_s:
        bucket.popleft()
    if len(bucket) >= max_count:
        retry_after = int(window_s - (now - bucket[0])) + 1
        return False, max(retry_after, 1)
    bucket.append(now)
    return True, 0


def check_pilot_rate(ip: str) -> tuple[bool, int]:
    return _check(ip, "rl:pilot", PILOT_MAX, PILOT_WINDOW_S, _pilot_buckets)


def check_brief_pdf_rate(ip: str) -> tuple[bool, int]:
    return _check(
        ip, "rl:briefpdf", BRIEF_PDF_MAX, BRIEF_PDF_WINDOW_S, _brief_pdf_buckets
    )


def get_client_ip(request: Request) -> str:
    """Resolve the originating IP. Honours X-Forwarded-For / X-Real-IP first."""
    fwd = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# Backwards-compat aliases for tests / callers using the previous private names.
_rate_limit_check = check_pilot_rate
_brief_pdf_rate_check = check_brief_pdf_rate
_client_ip = get_client_ip

__all__ = [
    "check_pilot_rate",
    "check_brief_pdf_rate",
    "get_client_ip",
    "_rate_limit_check",
    "_brief_pdf_rate_check",
    "_client_ip",
    "PILOT_MAX",
    "PILOT_WINDOW_S",
    "BRIEF_PDF_MAX",
    "BRIEF_PDF_WINDOW_S",
]
