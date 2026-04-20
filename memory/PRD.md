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

## Backlog / Next Actions
- **P1** Wire the intake form to a real backend (FastAPI + MongoDB submissions collection) and an email notification (Resend or SendGrid) when the company is ready to capture pilots.
- **P2** Add an actual "Strategic Memo" PDF/page rather than just scrolling to the Compliance section.
- **P2** Split `LandingPage.jsx` into `/components/landing/` subfiles for maintainability (per reviewer note).
- **P2** Add basic analytics events (Request Pilot clicks, section reveal) — PostHog is already loaded in index.html.
- **P3** SEO: OG image, sitemap.xml, robots.txt, JSON-LD Organization schema with Tallinn address.
- **P3** Add a dedicated `/privacy` and `/terms` page (currently only an email link in footer).
