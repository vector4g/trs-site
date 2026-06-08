"""Render the public Shadow HR Liability brief at /catch-22 to a print-ready PDF.

The page itself supports `?print=1` to strip the navbar, footer, sticky TOC,
share card, and cookie consent banner — so this module just points headless
Chromium at that URL and runs `page.pdf()`.

Why we render the live page instead of a separate HTML template:
  - The brief is the single source of truth — copy edits land in the PDF too.
  - Tailwind classes already produce a print-clean layout under `?print=1`.
  - No template drift, no second copy to maintain.
"""
from __future__ import annotations

import logging
import os

# Point Playwright at the container's pre-installed browser cache before
# importing the driver. Supervisor does not forward this env var automatically.
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/pw-browsers")

from playwright.async_api import async_playwright  # noqa: E402

logger = logging.getLogger(__name__)

# Where the headless browser fetches the brief from. In preview we hit the
# in-container CRA dev server at localhost:3000 (bypasses the ingress).
# In production there's no localhost:3000 listener — the React app is served
# as static files — so set `PUBLIC_FRONTEND_URL` to a reachable origin
# (typically the production domain itself) at deploy time. The code tries the
# fast internal path first and falls back to the public origin on failure.
INTERNAL_FRONTEND_URL = os.environ.get(
    "INTERNAL_FRONTEND_URL", "http://localhost:3000"
)
PUBLIC_FRONTEND_URL = os.environ.get("PUBLIC_FRONTEND_URL", "").rstrip("/")


async def _render_at(target_url: str) -> bytes:
    """Drive headless Chromium against one URL and return the PDF bytes."""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--no-sandbox"])
        try:
            context = await browser.new_context(viewport={"width": 1280, "height": 1800})
            page = await context.new_page()
            # Pre-set consent before navigation so the cookie banner never
            # flashes into view even if `?print=1` somehow misses it.
            await context.add_init_script(
                "try { localStorage.setItem('trs.consent','accepted'); } catch (_) {}",
            )
            await page.goto(target_url, wait_until="networkidle", timeout=45000)
            # Give SVG fonts + entrance animations a beat to settle.
            await page.wait_for_timeout(900)
            return await page.pdf(
                format="A4",
                print_background=True,
                margin={
                    "top": "0",
                    "right": "0",
                    "bottom": "0",
                    "left": "0",
                },
                prefer_css_page_size=False,
            )
        finally:
            await browser.close()


async def render_public_brief_pdf(slug: str = "catch-22") -> bytes:
    """Render /{slug}?print=1 to a PDF byte string.

    Default slug is the Shadow HR Liability brief. Kept slug-parameterised so a
    future `/civil-society` brief can reuse the same pipeline.

    Strategy:
      1. Try the internal frontend URL (fast, no ingress hop) — works in dev
         and preview where supervisor runs the CRA server.
      2. On failure, fall back to PUBLIC_FRONTEND_URL — works in production
         where the React app is shipped as static files behind a CDN.
    """
    candidates: list[str] = [f"{INTERNAL_FRONTEND_URL}/{slug}?print=1"]
    if PUBLIC_FRONTEND_URL:
        candidates.append(f"{PUBLIC_FRONTEND_URL}/{slug}?print=1")

    last_err: Exception | None = None
    for url in candidates:
        try:
            logger.info(f"render_public_brief_pdf: rendering {url}")
            return await _render_at(url)
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"render_public_brief_pdf: {url} failed: {exc}")
            last_err = exc

    raise RuntimeError(
        f"All PDF render candidates failed (tried {len(candidates)})"
    ) from last_err
