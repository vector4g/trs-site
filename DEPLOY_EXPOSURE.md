# DEPLOY_EXPOSURE.md

Ordered checklist for the Exposure trilogy go-live sequence. Each part is a separate redeploy.

Everything described below is **already built and held in preview**. To go live, you flip the flag, edit two static files, and redeploy. No code authoring required.

---

## State today (before any part is live)

- ✅ All three essay pages exist at `/writing/nothing-happened`, `/writing/the-switch`, `/writing/exposure-is-not-democratic` (and `/exposure/*` aliases). Reachable by direct URL for review (Drew, internal QA, etc.).
- ✅ `/writing` hub page exists and lists all three essays as "Forthcoming" cards, plus the live Memo and Shadow HR Liability Brief as companion cards.
- ✅ All three held essays + the `/writing` hub emit `<meta name="robots" content="noindex,nofollow">` so search engines won't index them from accidental backlinks.
- ✅ Three essay URLs and `/writing` are **NOT** in `public/sitemap.xml`.
- ✅ Navbar still shows **Memo** → `/memo`. ProblemSection teaser is **not** rendered. Footer "Insights" link is **not** rendered.
- ✅ Backend tracks `exposure{1,2,3}_read` flags on `/api/pilot-requests`.
- ✅ Backend regression: 17/17 tests pass.

These gates all flip in lockstep off the single `SERIES_LIVE` boolean in `/app/frontend/src/lib/exposureSeries.js`, which is computed as `EXPOSURE_SERIES.some(e => e.published)`.

---

## Part One go-live sequence

**Pre-flight**: confirm Drew's feedback has landed and you're ready. Note the actual publish date you want stamped on the article and the sitemap (this is what Google will record).

### Step 1 — flip Part One's `published` flag

File: `/app/frontend/src/lib/exposureSeries.js`

```js
{
  slug: "nothing-happened",
  // ...
  published: true,                    // ← was false
  publishedAt: "2026-MM-DD",          // ← was null; set to today
},
```

Leave Parts Two and Three at `published: false`.

This single change automatically:
- Swaps the navbar **Memo** item for **Insights** → `/writing` (desktop + mobile).
- Renders the ProblemSection teaser card pointing at `/writing`.
- Renders the footer **Insights** link.
- Removes `noindex,nofollow` from the Part One essay AND from the `/writing` hub.
- Makes the `/writing` hub's Part One card clickable. Parts Two and Three stay as "Forthcoming" cards.

### Step 2 — also update `datePublished` in the essay's JSON-LD

File: `/app/frontend/src/pages/exposure/NothingHappened.jsx`

```js
datePublished: "2026-06-08",          // ← change to the actual publish date
```

(The current value is a placeholder. Don't backdate.)

### Step 3 — add Part One and `/writing` to `sitemap.xml`

File: `/app/frontend/public/sitemap.xml`

Insert these two `<url>` blocks below the `/diagnostic` block (where the `<!-- Exposure trilogy URLs ... -->` comment currently sits — you can leave that comment in or remove it):

```xml
<url>
  <loc>https://thirdrailsystems.ee/writing</loc>
  <lastmod>2026-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://thirdrailsystems.ee/writing/nothing-happened</loc>
  <lastmod>2026-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

`lastmod` = the actual publish date. Not a backdated value.

### Step 4 — redeploy

Push the preview build to production via your Emergent deployment flow.

### Step 5 — verify on production

```
curl -s https://thirdrailsystems.ee/sitemap.xml | grep -c '<loc>'
# Expect: 10  (the original 8 + /writing + Part One)
```

Visit `https://thirdrailsystems.ee/`:
- ✓ Navbar shows **Insights** (not Memo).
- ✓ ProblemSection has the fuchsia "Exposure series" teaser card.
- ✓ Footer has an **Insights** link in the left column.

Visit `https://thirdrailsystems.ee/writing`:
- ✓ Part One card is clickable.
- ✓ Parts Two and Three are dashed-border "Forthcoming" cards.
- ✓ Memo and Catch-22 companion cards appear below the divider.

Visit `https://thirdrailsystems.ee/writing/nothing-happened`:
- ✓ Page loads.
- ✓ `view-source:` shows `<meta name="robots">` NOT present (i.e., default index,follow).
- ✓ Forward-CTA block at the bottom links to Part Two.

---

## Part Two go-live sequence (~1 week after Part One)

Repeat Steps 1–4 above for Part Two:

1. Flip `published: true` and set `publishedAt` on the `the-switch` entry in `exposureSeries.js`.
2. Update `datePublished` in `/app/frontend/src/pages/exposure/TheSwitch.jsx`.
3. Add to sitemap:
   ```xml
   <url>
     <loc>https://thirdrailsystems.ee/writing/the-switch</loc>
     <lastmod>2026-MM-DD</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```
4. Redeploy.
5. Verify: `/writing` now shows Parts One AND Two as clickable, Part Three still "Forthcoming". Sitemap URL count is 11.

---

## Part Three go-live sequence (~1 week after Part Two)

Same pattern.

1. Flip `published: true` and set `publishedAt` on the `exposure-is-not-democratic` entry.
2. Update `datePublished` in `/app/frontend/src/pages/exposure/NotDemocratic.jsx`.
3. Add to sitemap:
   ```xml
   <url>
     <loc>https://thirdrailsystems.ee/writing/exposure-is-not-democratic</loc>
     <lastmod>2026-MM-DD</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```
4. Redeploy.
5. Verify: all three trilogy cards clickable on `/writing`. Sitemap URL count is 12.

---

## Rollback (if something goes wrong post-deploy)

To take an essay back offline: flip its `published: false` in `exposureSeries.js`, remove its sitemap entry, redeploy. The discoverability surfaces and `noindex` gating revert automatically.

If you take Part One offline after Two/Three have shipped, `SERIES_LIVE` stays `true` (because Parts Two/Three are still published), so the navbar/teaser/footer surfaces remain active — they just stop pointing to Part One on the `/writing` hub.

---

## Files that change at each go-live

| File | Part One | Part Two | Part Three |
|---|---|---|---|
| `frontend/src/lib/exposureSeries.js` | flip + date | flip + date | flip + date |
| `frontend/src/pages/exposure/<Essay>.jsx` | `datePublished` | `datePublished` | `datePublished` |
| `frontend/public/sitemap.xml` | +2 URLs | +1 URL | +1 URL |

Nothing else needs to change. The nav, teaser, footer, hub rendering, and `noindex` gating are all driven by the single source of truth.
