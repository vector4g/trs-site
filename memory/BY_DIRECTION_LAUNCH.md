# By Direction — Launch Flip Checklist

> **STATUS: EXECUTED 2026-07-07** (launch date / lastmod = 2026-07-07, read
> time 12 min, card at top of /writing via `STANDALONE_ESSAYS` in
> `exposureSeries.js`). Kept for reference. Remaining post-deploy step:
> submit `https://thirdrailsystems.ee/writing/by-direction` to
> IndexNow / Google Search Console after the user redeploys.

Single-instruction launch flip for `/writing/by-direction`. Run these
edits in one commit when the user says "publish By Direction".

## Prerequisites (user supplies)
- **Launch date** in ISO-8601 form, e.g. `2026-07-15`. Used for both
  `datePublished` in JSON-LD and `<lastmod>` in the sitemap.
- Confirmation that the OG image at
  `/app/frontend/public/og/by-direction.png` is final (already in place
  from staging).

## Files to change (exactly four)

### 1. `/app/frontend/src/lib/writingMeta.json`
Remove the `robots` field from the `by-direction` entry so the
prerendered shell no longer emits a `<meta name="robots">` tag:

```diff
   "by-direction": {
     "title": "By Direction: The Agent Needs a Mandate, Not Your Identity · Third Rail Systems",
     "description": "Who authorised the act, within what scope, and who answers for it. That was always the question, and it has an old answer.",
     "ogImage": "https://thirdrailsystems.ee/og/by-direction.png",
     "ogLocale": "en_GB",
-    "robots": "noindex, nofollow",
     "h1": "By Direction: The Agent Needs a Mandate, Not Your Identity"
   }
```

### 2. `/app/frontend/src/pages/writing/ByDirection.jsx`
Remove the `robots` line from the `useSEO` call, and set
`datePublished` in the article JSON-LD to the launch date:

```diff
   useSEO({
     title: TITLE_TAG,
     description: META_DESCRIPTION,
     canonical: CANONICAL,
     ogType: "article",
     ogImage: OG_IMAGE,
-    // Staging state — this page is reachable only by direct URL until
-    // the launch flip. See the launch checklist in
-    // /app/memory/BY_DIRECTION_LAUNCH.md.
-    robots: "noindex, nofollow",
   });
```

```diff
       mainEntityOfPage: CANONICAL,
       image: OG_IMAGE,
       inLanguage: "en-GB",
-      datePublished: "",
+      datePublished: "<LAUNCH_DATE>",  // e.g. "2026-07-15"
     },
```

### 3. `/app/frontend/src/pages/WritingIndex.jsx`
Add a fourth card at the TOP of the essay list (newest first), matching
the card format of the existing three entries. Card copy:

- **Eyebrow / date pill**: `<LAUNCH_DATE>` (formatted the same way as
  existing cards, e.g. "15 July 2026").
- **Title**: `By Direction: The Agent Needs a Mandate, Not Your Identity`
- **Dek**: `Who authorised the act, within what scope, and who answers for it. That was always the question, and it has an old answer.`
- **Href**: `/writing/by-direction`
- **Tag / series pill**: match the existing cards' tag conventions
  (either "Essay" or the appropriate series/topic pill — inspect the
  existing three cards and copy that field's value; no new taxonomy).

### 4. `/app/frontend/public/sitemap.xml`
Add a `<url>` entry for the essay, in the same position/priority group
as the other `/writing/*` essays:

```xml
  <url>
    <loc>https://thirdrailsystems.ee/writing/by-direction</loc>
    <lastmod><LAUNCH_DATE></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

## Post-flip verification (`yarn build`, then)

1. `build/writing/by-direction.html` no longer contains
   `<meta name="robots" content="noindex, nofollow" />`.
2. `build/sitemap.xml` contains the new `<url>` entry with the correct
   `<lastmod>`.
3. `build/writing.html` (the /writing index prerender) contains
   "By Direction" as its newest card.
4. View-source on the runtime `/writing/by-direction` page:
   - no `robots` meta tag
   - JSON-LD `datePublished` equals `<LAUNCH_DATE>`
5. Submit the new URL to IndexNow / Google Search Console
   (`https://thirdrailsystems.ee/writing/by-direction`) to accelerate
   discovery.

## What NOT to touch during the flip
- The essay body (`/app/frontend/src/content/writing/by-direction.md`).
- The route registration in `App.js` (already in place).
- The OG image (already in place at `/og/by-direction.png`).
- The Nav bar — the essay reaches its audience via the /writing index
  and direct sharing; no new top-level nav entry is required.
