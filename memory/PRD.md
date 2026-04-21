# Third Rail Systems OÜ — Landing Page PRD

## Original Problem Statement
Build a single-page React landing page for "Third Rail Systems OÜ", a European deep-tech compliance company. Enterprise Neobrutalism aesthetic, dark-mode default (slate-950 / cyan-400), 8 sections with exact copy. Lucide-React icons, Inter typography, fully responsive, Vercel/Linear-grade clinical operator feel.

## User Choices (confirmed)
- Intake form: frontend-only success toast (no backend).
- "Read Strategic Memo" → smooth-scroll to Compliance section.
- Logo: uploaded logo image used as navbar mark alongside text "Third Rail Systems OÜ".
- Single-page, anchor-link navigation.

## Architecture
- Stack: React 19 + Tailwind 3 + shadcn/ui + Sonner + Lucide-React. No backend.
- File structure:
  - `/app/frontend/src/App.js` → renders LandingPage + Toaster.
  - `/app/frontend/src/pages/LandingPage.jsx` → single composite file with Navbar, Hero, Problem, Platform, Personas, Compliance, About, Contact, Footer.
  - `/app/frontend/src/index.css` → dark-mode-first CSS tokens.
  - `/app/frontend/src/App.css` → reveal-on-scroll, grain/grid backgrounds, btn-glow.
- Typography: Inter (400–800) + JetBrains Mono for eyebrows/labels.
- Accent: cyan-400 (hsl 189 94% 55%). Background: slate-950 (#0B0F14).

## Core Requirements (static)
- Sticky navbar w/ desktop links + mobile Sheet drawer.
- Hero with exact copy (eyebrow / H1 / subheadline / two CTAs / trust bar) + operator-console mock.
- Problem grid (3 cards) — ShieldAlert / Lock / Users.
- Platform grid (3 features) — Fingerprint / Server / FileText + data-flow contract card.
- Personas (3 cards) — For CSOs / DPOs / ERGs.
- Compliance rows (3) — GDPR / EU AI Act / ISO 31030.
- About 2-col — founders Levi Hankins (CEO) + Jeremy Stabile (CTO) + Estonia Advantage card.
- Contact form (First/Last/Email/Role) with shadcn Select and Sonner toasts.
- Footer with logo, year, contact email.

## Implemented (2026-04-20)
- All 8 sections rendered with exact copy from spec.
- Logo image integrated in navbar + footer.
- Reveal-on-scroll via IntersectionObserver.
- Mobile nav via shadcn Sheet.
- Form validation (client-side) + success/error Sonner toasts.
- Testing agent iteration_1: 14/14 checks passed, 0 console errors, 0 UI bugs.

## Iteration 2 — 2026-04-20 (P1 + P2 + P3)
- **P1 Backend**: `POST /api/pilot-requests` persists submissions to Mongo `pilot_requests` collection. Resend email notification sender integrated (`resend>=2.0.0`); currently STUBBED because `RESEND_API_KEY` is empty. When Levi adds the key to `backend/.env`, emails will dispatch to `levi@thirdrailsystems.ee` (falls back to `levi@intersectionalsafety.org`) via `onboarding@resend.dev` as the verified sender.
- **P1 Admin endpoint**: `GET /api/pilot-requests` is now gated: returns 404 if `ADMIN_TOKEN` is unset (fail-closed), 401 on wrong `X-Admin-Token` header, 200 only with correct token. Addresses testing-agent privacy flag.
- **P2 Strategic Memo page**: `/memo` route renders `StrategicMemo.jsx` — long-form 6-section memo ("The Strategic Memo: Resolving the ISO 31030 Catch-22") with sticky TOC, back link, contact CTA. Hero's "Read Strategic Memo" button and navbar/footer links navigate here.
- **P2 Component split**: `LandingPage.jsx` broken into `/components/landing/{Navbar, Hero, ProblemSection, PlatformSection, PersonasSection, ComplianceSection, AboutSection, ContactSection, Footer, shared}.jsx`. LandingPage is now a thin composer.
- **P3 SEO**: Branded OG image generated at `/og.png` (1200×630, cyan accent on slate-950), `robots.txt`, `sitemap.xml`. `index.html` includes JSON-LD Organization + SoftwareApplication schemas, Open Graph + Twitter Card meta tags. Canonical domain: `https://thirdrailsystems.ee`.
- **Routing**: `App.js` now uses `BrowserRouter` with `HashScrollHandler` so `/#contact` from the memo page scrolls correctly to the form.
- **Testing agent iteration_2**: 21/21 checks passed (7 backend + 14 frontend), 0 console errors, 0 UI bugs.

## Iteration 4 — 2026-04-20 (admin dashboard + legal pages + memo_read flag)
- **Admin console** at `/admin` (list + filters + stats) and `/admin/login` (token auth stored in `localStorage.trs.admin_token`). Backed by `POST /api/admin/auth/verify` and `GET /api/admin/pilot-requests` (query params: `q`, `role`, `status`, `limit`). Stats: total, delivered, memo-read count & conversion %, plus client-side today/last-7d rollups. Admin guards consolidated into a single `require_admin` FastAPI dependency (DRY).
- **Memo-read qualification**: `/memo` writes `localStorage['trs.memo_read']='1'` on completion; `ContactSection` reads it and sends `memo_read:boolean` to `POST /api/pilot-requests`. The admin table shows a "Read" badge per lead — Levi can see who did their reading before the call.
- **Legal pages** (all marked `Draft — for counsel review`): `/legal/privacy` (full GDPR notice grounded in the architecture), `/legal/terms` (Estonian-law ToS scoped to the website — NOT the pilot contract), `/legal/cookies` (PostHog + localStorage disclosures per ePrivacy), `/legal/imprint` (Estonian-law imprint with registered address, TBC placeholders for registry code + VAT). Shortcut routes: `/privacy`, `/terms`, `/cookies`, `/legal` → Imprint.
- **Footer redesigned** into a 3-column layout (Brand + address, Company, Legal) with a bottom "Registered in the Republic of Estonia" strip.
- **robots.txt** now disallows `/admin`, `/admin/`, `/admin/login`. **sitemap.xml** extended to 6 URLs including the legal pages.
- **Testing agent iteration_4**: **25/25 backend** pytest + **all frontend** Playwright PASSED, regression-clean on iterations 1–3.
- **Anti-spam** on `POST /api/pilot-requests`:
  - Per-IP sliding-window rate limit (5 req / 15 min, X-Forwarded-For aware) applied FIRST so bots can't bypass it by spamming rejected payloads.
  - Honeypot field `company_website` (hidden off-screen via `left:-10000px`, `tabIndex=-1`). When filled, server tarpits with a 201+`email_status='rejected'` response but does not persist or email.
  - Time-to-submit guard: submissions under 1.2 s are rejected (humans take longer to fill the form).
  - Frontend sends `submission_ms` (computed from when the contact section first entered the viewport) + empty `company_website`.
- **PostHog events** on `/memo`: `memo_viewed`, `memo_read_progress {25/50/75}`, `memo_read_completed` (85% scroll), `memo_toc_click {section}`, `memo_cta_click`, `memo_share_click`, `memo_share_success {channel}`, `memo_copy_link`. On the landing form: `pilot_request_submitted {role}`.
- **Share card** at the bottom of `/memo`: `Copy link` (clipboard) + `Share` button (uses `navigator.share` on mobile, falls back to `mailto:` with pre-filled subject + two-line pitch + link).
- **Testing agent iteration_3**: 12/12 backend + all frontend assertions passed. Regression-clean on iteration 1+2 testids.

## Backlog / Next Actions
- **P0** Drop `RESEND_API_KEY` (and a strong `ADMIN_TOKEN`) into `/app/backend/.env` → bounce backend. Everything else is ready.
- **P0** Take the four `/legal/*` drafts to Estonian counsel (TGS Baltic, COBALT, or Sorainen). Provide EE VAT number (if registered) to replace the last `[TBC]` on `/legal/imprint` and `/legal/privacy`. Registry code `17488655` already populated.
- **P1** Verify the `.ee` sender domain in Resend and switch `SENDER_EMAIL` from `onboarding@resend.dev` to `levi@thirdrailsystems.ee`.
- **P1** Add a CI/build check that fails if the "Draft — for counsel review" banner string is removed from any `/legal/*` route (prevents accidental premature publication).
- **P1** Cookie consent banner compliant with EDPB Guidelines 03/2022 before PostHog capture loads in the EU (currently relies on strictly-necessary + Cookies page disclosure).
- **P2** Redis-backed rate limiter + periodic cleanup of idle IP buckets (in-memory dict is per-process).
- **P2** PostHog `identify()` on form submit with hashed email, then surface per-lead memo read-time in the admin via the PostHog API.
- **P3** DKIM/SPF records on `.ee`, redesigned `og.png` with the full logo artwork.
- **P3** Rename admin testids to `admin-refresh-button` / `admin-signout-button` for consistency (minor).
