"""Generate co-branded executive briefing PDFs from memo content.

Uses Playwright (Chromium) to render an HTML template to PDF. Two variants:
  - "full": 6-section memo
  - "exec": 2-page executive summary
"""
from __future__ import annotations

import base64
import ipaddress
import logging
import os
import socket
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

# Point Playwright at the container's pre-installed browser cache before
# importing the driver. Supervisor does not forward this env var automatically.
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/pw-browsers")

import httpx  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

logger = logging.getLogger(__name__)

THIRD_RAIL_LOGO_URL = (
    "https://customer-assets.emergentagent.com/job_eu-travel-risk/artifacts/"
    "xlq21bpc_Third%20Rail%20Logo.jpg"
)

# Path to the canonical, cleaned brand SVG. Preferred over THIRD_RAIL_LOGO_URL
# because it is (a) star-free, (b) crisp at any PDF render scale, and (c)
# served from the local filesystem with zero network latency.
THIRD_RAIL_LOGO_LOCAL = (
    Path(__file__).resolve().parent.parent / "frontend" / "public" / "trs_logo.svg"
)

# Registered Tallinn address for the footer
REGISTERED_ADDRESS = (
    "Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551, Estonia"
)
REGISTRY_CODE = "17488655"


def _load_local_as_data_url(path: Path) -> Optional[str]:
    """Synchronously load a local file into a base64 data: URL for embedding.

    Used for the canonical brand SVG which lives on disk — bypasses HTTP and
    is therefore both faster and immune to network failures during PDF render.
    """
    try:
        if not path.is_file():
            return None
        ext = path.suffix.lower().lstrip(".")
        mime = {
            "svg": "image/svg+xml",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "webp": "image/webp",
        }.get(ext, "application/octet-stream")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"data:{mime};base64,{b64}"
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to load local asset {path}: {exc}")
        return None


async def _fetch_as_data_url(url: str, timeout: float = 6.0) -> Optional[str]:
    """Download an image and return it as a data: URL for embedding in the
    template. This avoids network races at PDF render time and guarantees the
    logo renders even if the remote is slow.

    SSRF guard (SEC-003): the URL is admin-supplied (logo override) or comes
    from the Brandfetch API — either way it is external input fetched
    server-side. We require https, resolve the host and reject any address
    that is not globally routable (blocks 127.0.0.1, 10/8, 169.254.169.254
    metadata, etc.), follow redirects manually re-validating every hop, cap
    the payload at 2 MB, and only accept image content types.
    """
    if not url:
        return None

    def _is_safe(u: str) -> bool:
        try:
            parsed = urlparse(u)
        except ValueError:
            return False
        if parsed.scheme != "https" or not parsed.hostname:
            return False
        try:
            infos = socket.getaddrinfo(parsed.hostname, None)
        except socket.gaierror:
            return False
        if not infos:
            return False
        for info in infos:
            try:
                ip = ipaddress.ip_address(info[4][0])
            except ValueError:
                return False
            if not ip.is_global:
                return False
        return True

    max_bytes = 2 * 1024 * 1024
    try:
        current = url
        resp = None
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            for _ in range(4):
                if not _is_safe(current):
                    logger.warning(f"Blocked unsafe logo URL: {current}")
                    return None
                resp = await client.get(current)
                if resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("location")
                    if not location:
                        return None
                    current = str(httpx.URL(current).join(location))
                    resp = None
                    continue
                break
        if resp is None or resp.status_code != 200 or not resp.content:
            return None
        if len(resp.content) > max_bytes:
            logger.warning(f"Logo too large ({len(resp.content)} bytes): {current}")
            return None
        content_type = resp.headers.get("content-type", "").split(";")[0].strip()
        if not content_type:
            # Infer from extension
            ext = Path(current.split("?")[0]).suffix.lower().lstrip(".")
            content_type = {
                "svg": "image/svg+xml",
                "png": "image/png",
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "webp": "image/webp",
            }.get(ext, "application/octet-stream")
        if not content_type.startswith("image/"):
            logger.warning(f"Rejected non-image logo content-type {content_type}: {current}")
            return None
        b64 = base64.b64encode(resp.content).decode("ascii")
        return f"data:{content_type};base64,{b64}"
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to fetch logo {url}: {exc}")
        return None


def _escape(s: Optional[str]) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _build_full_html(
    lead_name: str,
    prospect_company: str,
    prospect_logo_data: Optional[str],
    third_rail_logo_data: Optional[str],
    generated_at: str,
    briefing_id: str,
) -> str:
    """Full 6-section memo co-branded for the prospect."""
    css = _PRINT_CSS
    prospect_logo_html = (
        f'<img src="{prospect_logo_data}" alt="{_escape(prospect_company)}" class="brand-logo" />'
        if prospect_logo_data
        else f'<div class="brand-placeholder">{_escape(prospect_company[:2].upper() if prospect_company else "—")}</div>'
    )
    third_rail_logo_html = (
        f'<img src="{third_rail_logo_data}" alt="Third Rail Systems OÜ" class="brand-logo" />'
        if third_rail_logo_data
        else '<div class="brand-placeholder">TRS</div>'
    )
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Executive Briefing — {_escape(prospect_company)}</title>
<style>{css}</style></head>
<body>

<!-- COVER -->
<section class="page cover">
  <div class="cover-header">
    <div class="brand-pair">
      <div class="brand">
        <div class="brand-label">Prepared for</div>
        {prospect_logo_html}
        <div class="brand-name">{_escape(prospect_company)}</div>
        <div class="brand-sub">Attn: {_escape(lead_name)}</div>
      </div>
      <div class="brand-divider"></div>
      <div class="brand">
        <div class="brand-label">Prepared by</div>
        {third_rail_logo_html}
        <div class="brand-name">Third Rail Systems OÜ</div>
        <div class="brand-sub">Tallinn, Estonia</div>
      </div>
    </div>
  </div>
  <div class="cover-body">
    <div class="eyebrow">Executive Briefing · Confidential</div>
    <h1 class="cover-title">The Strategic Memo:<br/>Resolving the <span class="accent">ISO 31030 Catch-22</span>.</h1>
    <p class="cover-lede">Why duty-of-care and GDPR Article 9 collide — and how a minimum-disclosure architecture makes the collision obsolete.</p>
  </div>
  <div class="cover-footer">
    <div class="meta-row">
      <span class="meta-label">Generated</span><span>{_escape(generated_at)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Briefing ID</span><span class="mono">{_escape(briefing_id)}</span>
    </div>
  </div>
</section>

<!-- I. THESIS -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">I</div>
  <h2>The Thesis</h2>
  <p>Institutional safety requires deep visibility. Human privacy requires absolute discretion. For two decades, enterprise security programmes have treated these mandates as a trade-off to negotiate. We treat them as a system to engineer.</p>
  <p>Third Rail Systems OÜ is the minimum-disclosure compliance layer for enterprise travel risk. We materially decouple risk intelligence from human identity — so that fulfilling your duty-of-care obligation toward marginalised employees stops being the thing that creates your worst GDPR liability.</p>
  <div class="callout"><span class="callout-label">Thesis in one line</span><p>Institutional safety and human privacy are not in tension — they are in the wrong place on the stack. Move identity off-device and the tension dissolves.</p></div>
</section>

<!-- II. CATCH-22 -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">II</div>
  <h2>The Catch-22</h2>
  <p><strong>ISO 31030</strong> made it unambiguous: organisations must take reasonable steps to provide localised mitigations for marginalised travellers — LGBTQ+, disabled, neurodivergent, and other cohorts whose risk profile diverges sharply from the generic average. That is the duty-of-care mandate.</p>
  <p><strong>GDPR Article 9</strong> made the opposite unambiguous: centrally collecting, processing, or inferring demographic identity is a special-category data operation that most enterprises are structurally unequipped to justify on lawful-basis grounds. That is the privacy liability.</p>
  <p>The result is a compliance catch-22. Programmes that honour ISO 31030 tend to accumulate a toxic, regulated data lake. Programmes that respect GDPR tend to issue generic-average risk dossiers that fail the very people ISO 31030 was written for.</p>
  <div class="callout"><span class="callout-label">The "Shadow HR" failure mode</span><p>Well-intentioned teams, blocked by the official stack, end up tracking vulnerable travellers on informal spreadsheets. The enterprise now carries every risk of the toxic data lake and none of its audit-grade protections.</p></div>
</section>

<!-- III. EARNED SECRETS -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">III</div>
  <h2>Earned Secrets</h2>
  <p>Third Rail Systems was founded on earned, not inherited, operational truths.</p>
  <p>Our CEO, <strong>Levi Hankins</strong>, served 20 years as a US Navy combat veteran and spent a meaningful portion of that career under "Don't Ask, Don't Tell." He has first-hand, deployed experience of what happens when institutional safety systems cannot safely see the people they are meant to protect.</p>
  <p>Our CTO, <strong>Jeremy Stabile</strong>, is a SecOps and GRC architecture expert with multinational enterprise experience. He has spent years watching enterprise programmes buckle under the weight of data they should never have centralised in the first place.</p>
  <div class="callout"><span class="callout-label">Why this matters commercially</span><p>Enterprises buy from founders who have stood on the other side of the problem. Our thesis is not borrowed from a pitch deck — it was paid for in career risk.</p></div>
</section>

<!-- IV. ARCHITECTURE -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">IV</div>
  <h2>The Architecture</h2>
  <p>Our architecture is built on a single contract: <strong>identity-bearing inputs never leave the traveller's device.</strong> Everything else follows from that one constraint.</p>
  <div class="grid-3">
    <div class="feature"><div class="feature-num">01</div><div class="feature-title">On-Device Processing</div><p>The traveller's profile is encrypted locally. Special-category data never enters your HRIS.</p></div>
    <div class="feature"><div class="feature-num">02</div><div class="feature-title">Stateless Threat Synthesis</div><p>The system cross-references destinations against local penal codes without centrally logging demographic inputs.</p></div>
    <div class="feature"><div class="feature-num">03</div><div class="feature-title">Safety Dossier</div><p>Your Global Travel Risk team receives a sanitised, actionable mitigation plan. You get the audit trail; your DPO avoids the data.</p></div>
  </div>
  <p class="muted">This is a deliberate inversion of the industry default. Most travel-risk platforms collect more identity data to produce more specific output. We produce more specific output by collecting less identity data — and by refusing to retain any of it at the synthesis layer.</p>
</section>

<!-- V. GOVERNANCE -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">V</div>
  <h2>Governance Posture</h2>
  <p>Every architectural decision maps cleanly to a defensible compliance artefact.</p>
  <div class="gov-row"><span class="gov-tag">GDPR</span><p>We do not centralise "special-category data." The enterprise remains the Controller of standard itineraries; Third Rail acts as a Processor.</p></div>
  <div class="gov-row"><span class="gov-tag">EU AI Act</span><p>Built to meet EU AI Act high-risk obligations, with mandatory human-in-the-loop oversight and immutable vector logging. Final classification under review with counsel.</p></div>
  <div class="gov-row"><span class="gov-tag">ISO 31030</span><p>Verifiable, date-stamped evidence that the organisation assessed intersectional threats prior to deployment.</p></div>
  <p>Proudly registered in Tallinn, Estonia — ensuring a strict European corporate footprint outside direct US jurisdiction.</p>
</section>

<!-- VI. PILOT -->
<section class="page">
  {_running_header(prospect_company)}
  <div class="section-num">VI</div>
  <h2>The Pilot</h2>
  <p>We run paid, time-boxed enterprise pilots — typically 4 to 6 weeks — that require <strong>zero API integration with your HRIS</strong>. That is not a convenience feature; it is a statement about the architecture.</p>
  <p>The pilot produces three artefacts: a signed architecture fit-assessment, a sample Safety Dossier for a live destination, and a compliance binder your DPO can actually file.</p>
  <div class="cta">
    <div class="cta-label">Next step</div>
    <div class="cta-body">A 20-minute architecture fit-call with Levi Hankins. Reply to levi@thirdrailsystems.ee or visit thirdrailsystems.ee.</div>
  </div>
  {_footer(briefing_id)}
</section>

</body></html>
"""


def _build_exec_html(
    lead_name: str,
    prospect_company: str,
    prospect_logo_data: Optional[str],
    third_rail_logo_data: Optional[str],
    generated_at: str,
    briefing_id: str,
) -> str:
    """2-page executive summary."""
    css = _PRINT_CSS
    prospect_logo_html = (
        f'<img src="{prospect_logo_data}" alt="{_escape(prospect_company)}" class="brand-logo" />'
        if prospect_logo_data
        else f'<div class="brand-placeholder">{_escape(prospect_company[:2].upper() if prospect_company else "—")}</div>'
    )
    third_rail_logo_html = (
        f'<img src="{third_rail_logo_data}" alt="Third Rail Systems OÜ" class="brand-logo" />'
        if third_rail_logo_data
        else '<div class="brand-placeholder">TRS</div>'
    )
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Executive Summary — {_escape(prospect_company)}</title>
<style>{css}</style></head>
<body>

<section class="page cover">
  <div class="cover-header">
    <div class="brand-pair">
      <div class="brand">
        <div class="brand-label">Prepared for</div>
        {prospect_logo_html}
        <div class="brand-name">{_escape(prospect_company)}</div>
        <div class="brand-sub">Attn: {_escape(lead_name)}</div>
      </div>
      <div class="brand-divider"></div>
      <div class="brand">
        <div class="brand-label">Prepared by</div>
        {third_rail_logo_html}
        <div class="brand-name">Third Rail Systems OÜ</div>
        <div class="brand-sub">Tallinn, Estonia</div>
      </div>
    </div>
  </div>
  <div class="cover-body">
    <div class="eyebrow">Executive Summary · Confidential</div>
    <h1 class="cover-title">Minimum-disclosure compliance for <span class="accent">enterprise travel risk</span>.</h1>
    <p class="cover-lede">Fulfil ISO 31030 duty-of-care for marginalised travellers without creating a GDPR Article 9 liability.</p>
  </div>
  <div class="cover-footer">
    <div class="meta-row"><span class="meta-label">Generated</span><span>{_escape(generated_at)}</span></div>
    <div class="meta-row"><span class="meta-label">Briefing ID</span><span class="mono">{_escape(briefing_id)}</span></div>
  </div>
</section>

<section class="page">
  {_running_header(prospect_company)}
  <h2>The Conflict</h2>
  <p><strong>ISO 31030</strong> requires reasonable steps to protect marginalised travellers. <strong>GDPR Article 9</strong> prohibits centralising the demographic data that naïve implementations would need to do that. Most enterprise programmes pick one risk and inherit the other — or worse, accumulate "Shadow HR" spreadsheets of vulnerable travellers.</p>

  <h2>The Architecture</h2>
  <div class="grid-3">
    <div class="feature"><div class="feature-num">01</div><div class="feature-title">On-Device</div><p>Special-category data stays encrypted on the traveller's device. It never enters your HRIS.</p></div>
    <div class="feature"><div class="feature-num">02</div><div class="feature-title">Stateless Synthesis</div><p>Threat intelligence is cross-referenced against local penal codes without logging demographic inputs centrally.</p></div>
    <div class="feature"><div class="feature-num">03</div><div class="feature-title">Safety Dossier</div><p>Your Global Travel Risk team gets an actionable mitigation plan plus a defensible audit trail; your DPO avoids the data.</p></div>
  </div>

  <h2>The Pilot</h2>
  <p>Paid 4–6 week enterprise pilot with <strong>zero HRIS API integration</strong>. Deliverables: architecture fit-assessment, live sample Safety Dossier, DPO-ready compliance binder.</p>

  <div class="cta">
    <div class="cta-label">Next step</div>
    <div class="cta-body">20-minute architecture fit-call with Levi Hankins, CEO. levi@thirdrailsystems.ee · thirdrailsystems.ee</div>
  </div>
  {_footer(briefing_id)}
</section>

</body></html>
"""


def _running_header(prospect_company: str) -> str:
    return f"""<div class="running-header">
  <span class="rh-left">Executive Briefing · {_escape(prospect_company)}</span>
  <span class="rh-right">Third Rail Systems OÜ · Confidential</span>
</div>"""


def _footer(briefing_id: str) -> str:
    return f"""<div class="page-footer">
  <div>Third Rail Systems OÜ · Reg. {REGISTRY_CODE} · {REGISTERED_ADDRESS}</div>
  <div class="mono">{_escape(briefing_id)}</div>
</div>"""


# Print-targeted CSS. Dark neobrutalist aesthetic, translated for paper output.
_PRINT_CSS = """
@page { size: A4; margin: 0; }
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #16181D; color: #E2E8F0;
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.mono { font-family: 'JetBrains Mono', 'Menlo', monospace; letter-spacing: 0.02em; }
.accent { color: #00E5FF; }
.muted { color: #94A3B8; }

.page { width: 210mm; min-height: 297mm; padding: 22mm 20mm; background: #16181D;
  page-break-after: always; position: relative; }
.page:last-child { page-break-after: auto; }
.page h2 { font-size: 22pt; color: #FFFFFF; margin: 18pt 0 8pt; letter-spacing: -0.01em; }
.page p { font-size: 10.5pt; line-height: 1.65; color: #CBD5E1; margin: 6pt 0; }
.page strong { color: #FFFFFF; font-weight: 600; }

.section-num { font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #00E5FF;
  letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 4pt; }

.running-header { position: absolute; top: 10mm; left: 20mm; right: 20mm;
  display: flex; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #475569;
  border-bottom: 1px solid #1E293B; padding-bottom: 6pt; }
.running-header .rh-right { color: #64748B; }

.page-footer { position: absolute; bottom: 10mm; left: 20mm; right: 20mm;
  display: flex; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 7.5pt;
  letter-spacing: 0.12em; color: #475569;
  border-top: 1px solid #1E293B; padding-top: 6pt; }

/* Cover */
.cover { padding: 28mm 20mm 22mm; display: flex; flex-direction: column;
  justify-content: space-between; }
.cover-header { }
.brand-pair { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 16mm;
  align-items: start; border: 1px solid #1E293B; background: #1B1E25; padding: 12mm; border-radius: 6pt; }
.brand { display: flex; flex-direction: column; gap: 4pt; align-items: flex-start; }
.brand-divider { background: #1E293B; width: 1px; height: 100%; }
.brand-label { font-family: 'JetBrains Mono', monospace; font-size: 7.5pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #64748B; margin-bottom: 4pt; }
.brand-logo { max-width: 36mm; max-height: 14mm; object-fit: contain;
  background: transparent; margin-bottom: 4pt; }
.brand-placeholder { width: 14mm; height: 14mm; border: 1px solid #00E5FF;
  background: rgba(0,229,255,0.08); color: #00E5FF;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12pt; margin-bottom: 4pt; border-radius: 4pt; }
.brand-name { color: #FFFFFF; font-weight: 600; font-size: 11pt; }
.brand-sub { color: #94A3B8; font-size: 9pt; }

.cover-body { margin-top: 18mm; }
.eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 9pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #00E5FF;
  border-left: 2px solid #00E5FF; padding-left: 8pt; }
.cover-title { color: #FFFFFF; font-size: 34pt; line-height: 1.08; letter-spacing: -0.02em;
  margin: 8mm 0 6mm; font-weight: 600; }
.cover-lede { color: #94A3B8; font-size: 12pt; max-width: 140mm; line-height: 1.55; }

.cover-footer { margin-top: 18mm; border-top: 1px solid #1E293B; padding-top: 6mm; }
.meta-row { display: flex; justify-content: space-between; font-size: 9pt;
  color: #CBD5E1; margin-top: 3pt; }
.meta-label { font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #64748B; }

/* Callout */
.callout { border: 1px solid #1E293B; border-left: 3px solid #00E5FF;
  background: #1B1E25; padding: 10pt 12pt; margin: 10pt 0; border-radius: 2pt; }
.callout-label { font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #00E5FF; display: block; }
.callout p { margin-top: 4pt; color: #E2E8F0; }

/* Feature grid */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 10pt 0; }
.feature { border: 1px solid #1E293B; background: #1B1E25; padding: 10pt; border-radius: 2pt; }
.feature-num { font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #00E5FF; }
.feature-title { color: #FFFFFF; font-weight: 600; font-size: 11pt; margin-top: 4pt; }
.feature p { font-size: 9.5pt; line-height: 1.55; color: #94A3B8; margin-top: 6pt; }

/* Governance rows */
.gov-row { display: grid; grid-template-columns: 28mm 1fr; gap: 6mm;
  border-top: 1px solid #1E293B; padding: 8pt 0; align-items: start; }
.gov-row:first-of-type { border-top: none; }
.gov-tag { font-family: 'JetBrains Mono', monospace; font-size: 9pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #00E5FF; padding-top: 2pt; }

/* CTA */
.cta { margin-top: 14pt; border: 1px solid #00E5FF; background: rgba(0,229,255,0.06);
  padding: 10pt 12pt; border-radius: 2pt; }
.cta-label { font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: #00E5FF; }
.cta-body { color: #FFFFFF; font-size: 11pt; margin-top: 4pt; }
"""


async def generate_briefing_pdf(
    lead_name: str,
    prospect_company: str,
    prospect_domain: Optional[str],
    prospect_logo_url: Optional[str],
    variant: str = "exec",  # "full" | "exec"
    briefing_id: str = "",
) -> bytes:
    """Render the briefing HTML to PDF bytes via Playwright Chromium."""
    generated_at = datetime.now(timezone.utc).strftime("%d %b %Y · %H:%M UTC")

    # Fetch logos as data URLs (robust against slow CDNs + remote failures)
    prospect_logo_data = (
        await _fetch_as_data_url(prospect_logo_url) if prospect_logo_url else None
    )
    third_rail_logo_data = _load_local_as_data_url(THIRD_RAIL_LOGO_LOCAL) or await _fetch_as_data_url(THIRD_RAIL_LOGO_URL)

    builder = _build_full_html if variant == "full" else _build_exec_html
    html = builder(
        lead_name=lead_name,
        prospect_company=prospect_company or (prospect_domain or "Prospective Partner"),
        prospect_logo_data=prospect_logo_data,
        third_rail_logo_data=third_rail_logo_data,
        generated_at=generated_at,
        briefing_id=briefing_id,
    )

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )
        try:
            context = await browser.new_context()
            page = await context.new_page()
            await page.set_content(html, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                prefer_css_page_size=True,
            )
            return pdf_bytes
        finally:
            await browser.close()
