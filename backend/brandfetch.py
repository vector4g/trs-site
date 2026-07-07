"""Brandfetch integration — look up a prospect's company name and logo from
their corporate email domain. Graceful fallback: if the API is unavailable or
the domain is unknown, returns (None, None) so the caller can prompt for a
manual override.
"""
from __future__ import annotations

import logging
import os
import re
from typing import Optional, Tuple

import httpx

logger = logging.getLogger(__name__)

BRANDFETCH_ENDPOINT = "https://api.brandfetch.io/v2/brands"

# RFC 1035-shaped hostname. Rejects anything that could smuggle path segments,
# query strings, userinfo or ports into the Brandfetch URL (SEC-003).
_DOMAIN_RE = re.compile(
    r"^(?=.{4,253}$)[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
    r"(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$"
)


def _api_key() -> str:
    """Read the key lazily at call time so .env loaded later still takes effect."""
    return os.environ.get("BRANDFETCH_API_KEY", "").strip()


# Domains to never hit the Brandfetch API with — these are free-mail addresses
# where we know no useful company data exists.
FREE_MAIL_DOMAINS = {
    "gmail.com", "googlemail.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.co.jp", "yahoo.fr", "yahoo.de",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com",
    "proton.me", "protonmail.com",
    "aol.com", "gmx.com", "gmx.de", "mail.com",
    "yandex.com", "yandex.ru",
    "fastmail.com", "hey.com", "pm.me",
}


def domain_from_email(email: str) -> Optional[str]:
    if not email or "@" not in email:
        return None
    parts = email.lower().rsplit("@", 1)
    if len(parts) != 2 or not parts[1]:
        return None
    domain = parts[1].strip()
    if not _DOMAIN_RE.match(domain):
        return None
    return domain


async def fetch_brand(domain: str) -> Tuple[Optional[str], Optional[str]]:
    """Return (company_name, logo_url) for a given domain. Never raises —
    returns (None, None) on any error so callers can fall back to placeholders.
    """
    if not _api_key():
        logger.info("Brandfetch key not set; skipping lookup")
        return (None, None)
    if not domain or domain in FREE_MAIL_DOMAINS or not _DOMAIN_RE.match(domain):
        return (None, None)

    url = f"{BRANDFETCH_ENDPOINT}/{domain}"
    headers = {"Authorization": f"Bearer {_api_key()}"}

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers)
        if resp.status_code == 404:
            return (None, None)
        if resp.status_code != 200:
            logger.warning(f"Brandfetch {resp.status_code} for {domain}")
            return (None, None)
        data = resp.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Brandfetch lookup failed for {domain}: {exc}")
        return (None, None)

    name = data.get("name") or None

    # Prefer a square-ish "icon" logo (better for a PDF header beside the
    # Third Rail mark); fall back to the main logo; choose SVG > PNG > others.
    logo_url: Optional[str] = None
    logo_candidates = data.get("logos", []) or []

    def _pick(entries, type_priority):
        for tp in type_priority:
            for entry in entries:
                if entry.get("type") != tp:
                    continue
                for fmt in entry.get("formats", []) or []:
                    if fmt.get("format") in ("svg", "png") and fmt.get("src"):
                        return fmt["src"]
        return None

    logo_url = _pick(logo_candidates, ["icon", "logo", "symbol"])
    return (name, logo_url)
