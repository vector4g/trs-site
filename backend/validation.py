"""Input validation helpers shared across routes.

`_sanitize_qualifier` enforces an exact-match allowlist for the three
diagnostic qualifier fields — tampered free-text is silently dropped to None.

`_strip_for_header` collapses CR/LF/tabs to single spaces and caps length so
user input can be safely spliced into email subject lines and stored in Mongo
without enabling header injection.
"""
from __future__ import annotations

import re
from typing import Optional

# --- Diagnostic qualifier allowlists --------------------------------------------
# Mirror the labels in /app/frontend/src/pages/DiagnosticIntake.jsx. The
# frontend only ever submits these exact strings — anything else is either a
# stale UI or a tampered request and must be silently dropped, NOT echoed into
# emails or persisted.
ORG_SCALE_ALLOWLIST = frozenset({
    "Under 1,000 employees",
    "1,000 – 5,000 employees",
    "5,000 – 25,000 employees",
    "25,000 – 100,000 employees",
    "100,000+ employees",
})
WORKFORCE_ALLOWLIST = frozenset({
    "EU / EEA only",
    "EU + UK",
    "Global with major EU footprint",
    "Global with minor EU footprint",
})
CURRENT_VENDOR_ALLOWLIST = frozenset({
    "No travel-risk vendor",
    "International SOS",
    "WTW / Crisis24",
    "Control Risks",
    "Anvil / GardaWorld",
    "In-house / internal",
    "Other (note in reply)",
})


def sanitize_qualifier(value: Optional[str], allowlist: frozenset) -> Optional[str]:
    """Return the value only if it's an exact match for an allowlisted label."""
    if not value:
        return None
    v = value.strip()
    return v if v in allowlist else None


_HEADER_STRIP_RE = re.compile(r"[\r\n\t]+")


def strip_for_header(value: str) -> str:
    """Collapse CR/LF/tabs to single spaces; trim; cap at 200 chars."""
    if not value:
        return ""
    return _HEADER_STRIP_RE.sub(" ", value).strip()[:200]


# Backwards-compat aliases — server.py used the leading-underscore names.
_sanitize_qualifier = sanitize_qualifier
_strip_for_header = strip_for_header

__all__ = [
    "ORG_SCALE_ALLOWLIST",
    "WORKFORCE_ALLOWLIST",
    "CURRENT_VENDOR_ALLOWLIST",
    "sanitize_qualifier",
    "strip_for_header",
    "_sanitize_qualifier",
    "_strip_for_header",
]
