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

## Iteration 3 — 2026-04-20 (anti-spam + memo analytics + share CTA)
- **Anti-spam** on `POST /api/pilot-requests`:
  - Per-IP sliding-window rate limit (5 req / 15 min, X-Forwarded-For aware) applied FIRST so bots can't bypass it by spamming rejected payloads.
  - Honeypot field `company_website` (hidden off-screen via `left:-10000px`, `tabIndex=-1`). When filled, server tarpits with a 201+`email_status='rejected'` response but does not persist or email.
  - Time-to-submit guard: submissions under 1.2 s are rejected (humans take longer to fill the form).
  - Frontend sends `submission_ms` (computed from when the contact section first entered the viewport) + empty `company_website`.
- **PostHog events** on `/memo`: `memo_viewed`, `memo_read_progress {25/50/75}`, `memo_read_completed` (85% scroll), `memo_toc_click {section}`, `memo_cta_click`, `memo_share_click`, `memo_share_success {channel}`, `memo_copy_link`. On the landing form: `pilot_request_submitted {role}`.
- **Share card** at the bottom of `/memo`: `Copy link` (clipboard) + `Share` button (uses `navigator.share` on mobile, falls back to `mailto:` with pre-filled subject + two-line pitch + link).
- **Testing agent iteration_3**: 12/12 backend + all frontend assertions passed. Regression-clean on iteration 1+2 testids.

## Backlog / Next Actions
- **P0** Levi to add `RESEND_API_KEY` (and optionally `ADMIN_TOKEN`) to `backend/.env` when ready to go live.
- **P1** Verify the `.ee` sender domain in Resend so emails land from `levi@thirdrailsystems.ee` instead of `onboarding@resend.dev`.
- **P2** Simple `/admin` page that uses `ADMIN_TOKEN` to view pilot submissions (currently requires curl).
- **P2** Persist rate-limit bucket to Redis when horizontally scaling (in-memory dict is per-process).
- **P2** Periodic cleanup of idle IP buckets in `_rate_buckets` to avoid unbounded memory growth.
- **P3** Verified-domain DKIM/SPF records on `.ee`, custom `og.png` redesign with the hero logo artwork.
- **P3** `/privacy` and `/terms` pages (currently only email link in footer).
