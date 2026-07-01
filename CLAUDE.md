# CLAUDE.md — Third Rail Systems site (thirdrailsystems.ee)

Context for future Ahrefs Site Audit fixes and SEO work. Read this first.

Ahrefs Site Audit project: **Thirdrailsystems**, `project_id: 10021402`,
target `thirdrailsystems.ee/` (mode: subdomains, both protocols, verified).

## Tech stack

- **Frontend** (`frontend/`): React 19 SPA, **client-side rendered (CSR)**,
  built with CRACO (`craco build`) on top of react-scripts 5. Routing via
  `react-router-dom` v7 (`src/App.js`). Tailwind (CDN-free, config in
  `tailwind.config.js`) + Radix UI primitives under `src/components/ui/`.
- **Backend** (`backend/`): FastAPI (not involved in SEO/meta).
- **Hosting**: Emergent static-serving layer. It maps `/<path>` to a flat
  file `build/<path>.html` (NO directory-index lookup, does NOT honour
  `_redirects` — confirmed by Emergent support 2026-02-11). Unknown paths
  fall back to `build/index.html` (the SPA shell).

## The SEO architecture (important — it's non-obvious)

Because this is a **CSR SPA**, non-JS crawlers/scrapers see only the served
HTML shell's `<head>`, not React-rendered content. Two mechanisms handle this:

1. **Runtime (`src/lib/useSEO.js`)** — `useSEO({...})` hook updates
   `<title>`, description, canonical, og:*, twitter:*, robots on mount and
   restores on unmount. `useJsonLd(data, id)` injects a JSON-LD `<script>`
   while mounted. This is what JS-executing crawlers (incl. **Ahrefs** —
   it DOES render JS) see. Article/BreadcrumbList schema on essay pages is
   runtime-injected here.
2. **Prerender (`frontend/scripts/inject-writing-meta.js`)** — a
   **postbuild** step (`package.json` → `"postbuild"`). After `craco build`
   it writes flat `build/<path>.html` shells for each route with the
   correct `<head>` meta + an off-screen `<h1>` + the article body rendered
   from markdown, so non-JS scrapers (LinkedIn, Twitter) see real content.
   - Per-article config: `src/lib/writingMeta.json` (the `/writing/<slug>`
     essays). **These titles/descriptions MUST stay in sync with each
     essay's `useSEO()` call.**
   - Top-level pages + the whitepaper are hardcoded in the `TOP_PAGES`
     array and a dedicated `beyond-disclosure` block inside the script.
   - `/beyond-disclosure` meta description is defined in BOTH
     `src/pages/BeyondDisclosure.jsx` (`META_DESCRIPTION`) AND
     `inject-writing-meta.js` — edit both together.

- Markdown content: `src/content/` (essays under `src/content/writing/`).
- Sitemap: **static** `frontend/public/sitemap.xml` (hand-maintained).
- Structured data on the homepage: `Organization` + `WebSite` live static in
  `public/index.html`; `SoftwareApplication` is injected only on `/` via
  `useJsonLd` in `src/pages/LandingPage.jsx` (deliberately scoped to `/` so it
  doesn't leak onto every route — see comment there).
- The Exposure essay trilogy is config-driven from `src/lib/exposureSeries.js`
  (`published` flags gate discovery surfaces; `essayRobots(slug)` returns
  `noindex,nofollow` for unpublished essays).

## Fix patterns that worked (2026-07-01 audit)

- **schema.org "unexpected scalar" error** (`Struct_data_type_unexpected_scalar`):
  a property given a plain string where schema.org expects an object. Here it
  was `foundingLocation: "Tallinn, Estonia"` in the `index.html` Organization
  block → fixed to a `Place` → `PostalAddress` object. Because the shell is
  shared, ONE fix in `index.html` cleared the error on all 13 crawled pages.
  Diagnose exact property via
  `ahrefs_site_audit.get_url_details` with
  `fields:["jsonld_validation_issue_kinds","jsonld_validation_issues"]`.
- **Noindex page in sitemap**: legal pages are intentionally `noindex`
  (`follow\nnoindex` via useSEO) — the fix is to remove them from
  `public/sitemap.xml`, NOT to change the noindex. Legal routes should not be
  in the sitemap.
- **Meta description length**: keep 110–160 chars. Edit the page component's
  `useSEO`/`META_DESCRIPTION` AND the mirror in `inject-writing-meta.js`.

## Known false positives / stale-crawl gotchas

- **Ahrefs renders JS but crawls can lag a deploy.** Confirmed 2026-07-01:
  `/writing/the-switch` was flagged for missing H1, low word count (9),
  no outgoing links, and incomplete OG — but the live page was fully healthy
  (1,430 words, H1, links, valid OG) and the component source was complete.
  Those were captured pre-rebuild. **Always fetch the live HTML (and check
  the component) before "fixing" a page that looks broken only in Ahrefs.**
- **Homepage `SoftwareApplication` Google rich-results error**
  (`Struct_data_google_property_required`): Google wants `offers` /
  `aggregateRating` / `review`. Left unfixed by owner decision — do NOT add
  fabricated ratings/reviews (violates Google policy). Revisit only with
  real pilot data.

## Workflow reminders

- Fixes go on a branch → PR (never auto-merge/auto-publish).
- After merge + deploy, **trigger a re-crawl** in Ahrefs Site Audit to confirm.
- Health score at time of this audit: **79/100** (24 crawled, 15 blocked/
  noindex, 3 redirects, 0 broken).
