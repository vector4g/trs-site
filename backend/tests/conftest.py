"""Test-suite conftest.

Since SEC-001 was fixed, ``rate_limit.get_client_ip`` no longer trusts the
leftmost ``X-Forwarded-For`` entry — it uses the trusted-proxy hop count so
an attacker cannot spoof the client IP to bypass the per-IP limiter.

The rate-limit test suite (test_pilot_requests, test_briefings, etc.)
depends on being able to simulate distinct clients by rotating XFF. We
preserve that ability behind a shared secret that is only set in the dev
``.env`` (never in production): when ``TEST_TRUSTED_IP_SECRET`` is
configured, requests bearing a matching ``X-Test-Secret`` header have their
leftmost XFF entry honoured.

Rather than touch every test call site, this conftest wraps ``requests`` so
the header is added transparently on every outbound test HTTP call. If the
secret env var is unset, no header is added and tests will exhibit the
rate-limit behaviour a real client would see through the ingress.
"""
from __future__ import annotations

import os
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load /app/backend/.env so the test process sees TEST_TRUSTED_IP_SECRET
# (and any other backend config) without requiring a wrapper script.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

_TEST_SECRET = os.environ.get("TEST_TRUSTED_IP_SECRET", "").strip()

if _TEST_SECRET:
    _orig_request = requests.api.request

    def _request_with_test_secret(method, url, **kwargs):
        headers = dict(kwargs.pop("headers", None) or {})
        headers.setdefault("X-Test-Secret", _TEST_SECRET)
        kwargs["headers"] = headers
        return _orig_request(method, url, **kwargs)

    requests.api.request = _request_with_test_secret
    # requests.get/post/etc. are thin wrappers over requests.api.request via
    # closure — patching the module attribute is enough. Patch Session too
    # so tests that build their own Session (none currently, but future-
    # proof) also carry the header.
    _orig_session_request = requests.sessions.Session.request

    def _session_request_with_test_secret(self, method, url, **kwargs):
        headers = dict(kwargs.pop("headers", None) or {})
        headers.setdefault("X-Test-Secret", _TEST_SECRET)
        kwargs["headers"] = headers
        return _orig_session_request(self, method, url, **kwargs)

    requests.sessions.Session.request = _session_request_with_test_secret
