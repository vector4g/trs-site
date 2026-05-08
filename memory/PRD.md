# Third Rail Systems OÜ — Landing Page PRD

## Original Problem Statement
Build a single-page React landing page for "Third Rail Systems OÜ", a European deep-tech compliance company. Enterprise Neobrutalism aesthetic, dark-mode default (slate-950 / cyan-400), 8 sections with exact copy. Lucide-React icons, Inter typography, fully responsive, Vercel/Linear-grade clinical operator feel.

## User Choices (confirmed)
- Intake form → now wired to real backend with Resend (STUBBED until `RESEND_API_KEY` set).
- "Read Strategic Memo" → navigates to `/memo` (long-form in-app page).
- Logo: uploaded logo image used as navbar mark alongside the text "Third Rail Systems OÜ".
- BrowserRouter: `/`, `/memo`, `/admin`, `/admin/login`, `/legal/{privacy,terms,cookies,imprint}` (+ shortcut aliases).

## Architecture
- Stack: React 19 + Tailwind 3 + shadcn/ui + Sonner + Lucide-React + react-router-dom.
  Backend: FastAPI + Motor/MongoDB + Resend + Brandfetch + Playwright/Chromium + Pillow.
- Typography: Inter (400–800) + JetBrains Mono for eyebrows/labels.
- Accent: cyan-400 (hsl 189 94% 55%). Background: slate-950 (#0B0F14).

## Iteration 1 — 2026-04-20 (Landing page MVP)
- All 8 sections rendered with exact copy from spec.
- Logo image integrated in navbar + footer. Reveal-on-scroll via IntersectionObserver. Mobile nav via shadcn Sheet.
- Form validation (client-side) + success/error Sonner toasts.
- Testing agent iteration_1: 14/14 passed.

## Iteration 2 — 2026-04-20 (Backend + Memo page + SEO)
- `POST /api/pilot-requests` persists to Mongo `pilot_requests`; Resend email integrated (STUBBED until key is set). `GET /api/pilot-requests` is admin-gated (fail-closed).
- `/memo` route renders `StrategicMemo.jsx` with sticky TOC, back link, contact CTA.
- `LandingPage.jsx` split into `/components/landing/*`.
- SEO: branded `/og.png`, `robots.txt`, `sitemap.xml`, JSON-LD Organization + SoftwareApplication.
- `BrowserRouter` + `HashScrollHandler` so `/#contact` anchors work across routes.
- Testing agent iteration_2: 21/21 passed.

## Iteration 3 — 2026-04-20 (Anti-spam + memo analytics + share CTA)
- Anti-spam on `POST /api/pilot-requests`: per-IP sliding-window rate limit (5 req / 15 min, X-Forwarded-For aware) applied FIRST so bots can't bypass via rejected payloads. Honeypot field `company_website`. Time-to-submit guard (<1.2 s rejected).
- PostHog events on `/memo`: `memo_viewed`, `memo_read_progress {25/50/75}`, `memo_read_completed` (85% scroll), `memo_toc_click`, `memo_cta_click`, `memo_share_click`, `memo_share_success`, `memo_copy_link`. Form: `pilot_request_submitted`.
- Share card at bottom of `/memo`: Copy-link + Share (native share + mailto fallback).
- Testing agent iteration_3: 12/12 backend + all frontend passed.

## Iteration 4 — 2026-04-20 (Admin dashboard + legal pages)
- Admin console at `/admin` + `/admin/login` (token auth → `localStorage.trs.admin_token`). Backed by `POST /api/admin/auth/verify` and `GET /api/admin/pilot-requests` (query params: `q`, `role`, `status`, `limit`). Stats: total, delivered, memo-read count & %, today/last-7d rollups. `require_admin` FastAPI dependency.
- Memo-read qualification end-to-end: `/memo` writes `localStorage['trs.memo_read']` on completion; `ContactSection` attaches it to the payload; admin table shows a "Read" badge.
- Legal pages (all marked `Draft — for counsel review`): `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/imprint`. Registry code `17488655` published; EE VAT `[TBC]`.
- Footer redesigned into 3 columns (Brand, Company, Legal).
- `robots.txt` disallows `/admin/*`. `sitemap.xml` → 6 URLs.
- Testing agent iteration_4: 25/25 backend + all frontend passed.

## Iteration 5 — 2026-04-22 (Executive Briefing PDF export)
- Co-branded PDF generation: `POST /api/admin/briefings/generate` streams A4 PDF (variant `exec` = 2 pages, `full` = 6 sections + cover). Playwright-rendered Chromium HTML→PDF; dark neobrutalist typography translated to print; running headers, callouts, 3-col feature grid, CTA box, Estonian imprint (registry `17488655` + Tallinn address) in footer.
- Brandfetch auto-resolution: `GET /api/admin/briefings/preview/{id}` reads the prospect's email domain, calls Brandfetch, returns `{inferred_company, inferred_logo_url, domain}`. Free-mail domains (gmail, yahoo, outlook, proton, icloud, …) short-circuit with `null`. `BRANDFETCH_API_KEY` loaded lazily.
- Admin UI: each pilot-request row has a **Briefing** button (Sparkles icon + cyan chip showing generation count). Opens `BriefingDialog` that fetches preview, renders prospect logo + editable overrides, and offers Exec-summary / Full-briefing download buttons. Download via axios `responseType='blob'`. Error path parses blob to surface real server detail. Audit fields (`last_briefing_id`, `last_briefing_variant`, `briefings_generated`) persisted.
- Container: `PLAYWRIGHT_BROWSERS_PATH=/pw-browsers` set at `briefing.py` import (supervisor doesn't forward container env vars).
- Tests: 12/12 new backend + frontend E2E passed. `tests/test_admin_and_legal.py` parameterized via `TEST_ADMIN_TOKEN` env. Thead/colspan mismatch fixed post-review.

## Iteration 6 — 2026-05-08 (Scientific Advisor onboarding)
- Added **Dr. Sidra Azmat Butt** (PhD, Information Technology, TalTech; Researcher, Next Gen Digital State Research Group, Department of Software Science) as **Scientific Advisor / Head of Algorithmic Validation**.
- New `/components/landing/AdvisoryBoard.jsx` — single-advisor card with TalTech badge, credentials list (PhD, research domains, 16 peer-reviewed pubs + reviewer roles, three EU-funded programmes — Interreg OSIRIS / ESF IT Academy / Erasmus+ EGov4Youth), and an advisory-scope panel (EU AI Act conformity, GDPR privacy-by-design, transient-processing architecture). Independence disclaimer included.
- Section inserted between About and Contact; navbar gains `nav-link-advisory` (desktop + mobile); `id="advisory"` for hash-anchor navigation.
- Strategic Memo Section III ("Earned Secrets") gains a Sidra paragraph + revised callout linking commercial trust to peer-review.
- All facts sourced verbatim from her LinkedIn profile + the Scientific Advisor Briefing PDF supplied by the user. No fabricated quotes.
- Testing agent iteration_6: 11/11 frontend checks passed, zero issues, zero regressions on iter1–iter5 testids.

## Iteration 7 — 2026-05-08 (Brand Guide + ISI Architecture + KTH IRL Validation)
- **Hero trust bar** updated to brand-guide language: `ISO 31030 · GDPR Article 9 · EU AI Act · Annex IV` (replaces the original "EU-Native Architecture / Tallinn / Stateless AI Synthesis" line).
- **ISI Architecture Diagram** (`/components/landing/ArchitectureDiagram.jsx`): in-page rendering of the three-layer flow — L1 Context & Intelligence Grounding (Zero-Knowledge App, Sovereign DB, Federated Router), L2 DReaMAD Protocol (TRS-01 Grandin / TRS-02 Heumann / TRS-03 Crenshaw + 6 parallel agents), L3 Output Synthesis & Regulatory Alignment. Compliance mapping cards (GDPR Art. 9 / EU AI Act Annex IV / ISO 31030) and a prominent Zero-retention boundary callout. "Download full schematic (PDF)" links to the user's CDN-hosted ISI Architecture Diagram.
- **KTH IRL Evidence Validation** (`/components/landing/ValidationSection.jsx`): six-row IRL scorecard (TRL 4, CRL 4, BRL 4, IPRL 4, TMRL 5, FRL 3) with verbatim 1-line evaluator findings + 5-pip score indicator. Pull-quote ("The DReaMAD 8-Agent Debate Engine core logic has been fully engineered and validated") attributed to "KTH IRL Evidence Report · Third Rail Systems OÜ". Patentable-priority callout + "View full IRL Evidence Report" link to the original DOCX.
- **Strategic Memo** Section IV gains a DReaMAD Protocol paragraph and a new "Independently evidenced" callout citing the KTH IRL framework + the 30-country sovereign risk database (ILGA, U.S. State Dept, Wheelmap, TGEU).
- **Navbar** gains `Architecture` and `Validation` links (desktop + mobile drawer). All section eyebrow indexes renumbered: Architecture 03 (new), Solutions 04, Compliance 05, Validation 06 (new), About 07, Advisory 08, Contact 09.
- **A11y polish**: mobile Sheet now includes `SheetDescription` (silences Radix Dialog warning).
- **Testing agent iteration_7**: 62/64 frontend checks → fixed both flagged issues post-report (Validation eyebrow 05→06, mobile Sheet a11y description). No backend changes; admin endpoints remain fail-closed.

## Iteration 8 — 2026-05-08 (Brand-guide color migration)
- **Sovereign Slate `#16181D`** is now the canonical site background; **Cyan Core `#00E5FF`** the canonical accent.
- Implemented as a **token-only** override — no Tailwind class changed:
  - `tailwind.config.js` extends `colors.slate.950 = #16181D` and `colors.cyan.{300,400,500}` to brand values. Every existing utility (`bg-slate-950`, `text-cyan-400`, `bg-cyan-500`, etc.) now resolves to the brand palette automatically.
  - `index.css` shadcn HSL tokens updated: `--background 225 14% 11%`, `--primary/--accent/--ring 186 100% 50%`, `--card 222 17% 14%`. Component primitives (Button, Input, Select, Sheet, Dialog) inherit the new values.
  - `App.css` body bg, `::selection`, and `.btn-glow` shadow rewritten to Cyan Core RGBA.
  - `briefing.py` print CSS aligned (cover background, callout strip, accent borders, CTA box).
  - `og.png` regenerated with `(22,24,29)` bg + `(0,229,255)` accent.
- Surgical, low-risk migration — every existing component, including `/memo`, `/admin`, all four `/legal/*` pages, `BriefingDialog`, and the rendered briefing PDFs, picks up the new palette with zero per-component edits.
- **Testing agent iteration_8**: 11/11 token checks pass (body bg = `rgb(22,24,29)`; `text-cyan-400` = `rgb(0,229,255)`; selection = `rgba(0,229,255,0.25)`); backend PDF generation still produces valid 219 KB `%PDF-1.4` files; console clean across `/`, `/memo`, `/legal/*`, `/admin/login`. No regressions.

## Iteration 9 — 2026-05-08 (Catch-22 long-form brief + core team expansion)
- New long-form page `/catch-22` (alias `/duty-of-care`) renders the full "Duty of Care vs. Data Privacy Catch-22" liability analysis: Executive Overview + I. The Hammer (UK CMCHA / FR faute inexcusable / DE Fürsorgepflicht) + II. The Anvil (Loi de Vigilance, LkSG, RAD class actions) + III. The Trap (GDPR Art. 9, Shadow HR/AI) + IV. Market Scale & Stateless Architecture + V. Pilot CTA. Three Sovereign Slate / Cyan Core comparison tables, sticky TOC, share/copy-link, PostHog events (`brief_viewed`, `brief_read_progress`, `brief_read_completed`, `brief_toc_click`, `brief_cta_click`, `brief_share_*`).
- Hero stat strip on `/catch-22`: Hammer / Anvil / Trap one-line callouts.
- Landing page `ProblemSection` now ends with a cyan-bordered teaser card linking to `/catch-22` ("The Hammer · The Anvil · The Trap — Liability Brief · 14-min read").
- `AboutSection` restructured to three core-team cards: **Levi Hankins (CEO)**, **Jeremy Stabile (CTO)**, **Dr. Sidra Azmat Butt (Head of Algorithmic Validation)** with TalTech badge + "See full advisory profile →" link to `#advisory`. Estonia Advantage retained as full-width row.
- Advisory Board section preserves Dr. Butt's full academic profile (peer review, EU-funded programmes, advisory scope) — independent posture intact.
- Footer: new `Liability Brief` link. Sitemap: `/catch-22` added.
- Testing agent iteration_9: 13/13 frontend scenarios passed (100%).

## Backlog / Next Actions
- **P0** Drop `RESEND_API_KEY` (and a strong `ADMIN_TOKEN`) into `/app/backend/.env` → bounce backend.
- **P0** Take the four `/legal/*` drafts to Estonian counsel (TGS Baltic, COBALT, or Sorainen). Provide EE VAT number when registered to replace the last `[TBC]` on `/legal/imprint` and `/legal/privacy`.
- **P1** Verify the `.ee` sender domain in Resend and switch `SENDER_EMAIL` from `onboarding@resend.dev` to `levi@thirdrailsystems.ee`.
- **P1** CI check that fails the build if the "Draft — for counsel review" banner string is removed from any `/legal/*` route.
- **P1** Cookie-consent banner compliant with EDPB Guidelines 03/2022 before PostHog loads in the EU.
- **P2** Optional: "Download + email" variant of the Briefing flow — send the generated PDF as a Resend attachment to the lead's email (one-click warm follow-up).
- **P2** Keep a single Playwright browser context alive at app startup (instead of launching per-request) once briefings/min ever exceeds a few.
- **P2** `BriefingDialog`: pass `AbortController.signal` to axios so a mid-flight "Cancel" actually aborts the render (currently the PDF still arrives in the background).
- **P2** Redis-backed rate limiter + periodic cleanup of idle IP buckets (in-memory dict is per-process).
- **P2** PostHog `identify()` on form submit with hashed email, then surface per-lead memo read-time in admin.
- **P2** Optional refactor: split `CatchTwentyTwo.jsx` (~1100 lines) into reusable `BriefSection`/`Callout`/`ComparisonTable` primitives in `/components/brief/` — also reusable from `/memo`.
- **P3** DKIM/SPF records on `.ee`, redesigned `og.png` with the full logo artwork.
