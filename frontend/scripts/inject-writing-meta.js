#!/usr/bin/env node
/**
 * Post-build: inject per-article OG / Twitter / canonical / robots meta tags
 * into static HTML shells for each /writing/<slug> route.
 *
 * Why this exists
 * ---------------
 * This is a Client-Side-Rendered React SPA. Without per-route HTML files,
 * social scrapers (LinkedIn, Twitter/X, Slack, etc.) and search crawlers
 * that do NOT execute JavaScript see ONLY the homepage <head> on every URL —
 * because the host serves the SPA-fallback `/index.html` for any unknown
 * path. The useSEO hook updates the tags at runtime via React, but that's
 * invisible to non-JS bots.
 *
 * What this does
 * --------------
 * After `craco build` finishes, this script walks the slugs in
 * `src/lib/writingMeta.json` and, for each one, writes
 * `build/writing/<slug>.html` — a byte-for-byte copy of `build/index.html`
 * with the <head> meta tags rewritten to the article's own values. The
 * Emergent static-serving layer maps `/writing/<slug>` directly to
 * `build/writing/<slug>.html` via flat-file resolution (it does NOT do
 * directory-index lookup, and does NOT honour `_redirects` — confirmed by
 * Emergent platform support, 2026-02-11). Real users get the same React
 * bundle and same #root mount — only the <head> differs.
 *
 * To add a new article: append { slug: { title, description, ogImage? } }
 * to writingMeta.json and rebuild. No code change needed here.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const SOURCE_HTML = path.join(BUILD_DIR, "index.html");
const META_CONFIG = path.resolve(__dirname, "..", "src", "lib", "writingMeta.json");
const SITE_ORIGIN = "https://thirdrailsystems.ee";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og.png`;

/**
 * Top-level pages that need prerendered flat HTML shells with their own
 * meta tags. Same convention as /writing/<slug>: emit build/<path>.html so
 * the Emergent static-serving layer can hand the right tags to non-JS
 * scrapers (LinkedIn, Twitter, Ahrefs) on the canonical URL. Title +
 * description below MUST stay in sync with the page's useSEO() call.
 *
 * `h1` is the exact H1 text required per route by the SEO spec
 * (2026-02-12). Every prerendered shell now carries a server-visible
 * <h1 class="sr-only"> inside #root so crawlers see it before JS runs;
 * once React mounts and replaces #root, the matching sr-only <h1> in the
 * page component takes over so the DOM never has zero or duplicate h1s.
 *
 * Sources (as of 2026-02-11):
 *   /memo     → src/pages/StrategicMemo.jsx useSEO
 *   /catch-22 → src/pages/CatchTwentyTwo.jsx useSEO
 */
const TOP_PAGES = [
  {
    path: "/memo",
    title: "The Strategic Memo · Third Rail Systems",
    description:
      "A founding-team paper on why duty-of-care and GDPR Article 9 collide, and how a minimum-disclosure architecture makes that collision obsolete.",
    ogImage: null,
    h1: "The Strategic Memo",
  },
  {
    path: "/catch-22",
    title: "The ISO 31030 and GDPR Article 9 Catch-22 · Third Rail Systems",
    description:
      "Duty-of-care obligations under ISO 31030 can collide with GDPR Article 9 protection for special-category data. What a minimum-disclosure approach changes.",
    ogImage: null,
    h1: "The ISO 31030 and GDPR Article 9 Catch-22",
  },
  {
    path: "/writing",
    title: "Writing · Third Rail Systems",
    description:
      "The Exposure series and companion long-form pieces on dependency, accumulation, and minimum disclosure.",
    ogImage: null,
    h1: "Writing",
  },
  {
    path: "/legal/privacy",
    title: "Privacy Policy · Third Rail Systems",
    description:
      "How Third Rail Systems handles personal data, in line with the GDPR.",
    ogImage: null,
    h1: "Privacy Policy",
  },
  {
    path: "/legal/terms",
    title: "Terms of Service · Third Rail Systems",
    description:
      "Terms governing use of the Third Rail Systems website and services.",
    ogImage: null,
    h1: "Terms of Use",
  },
  {
    path: "/legal/cookies",
    title: "Cookie Policy · Third Rail Systems",
    description:
      "How this site uses cookies. Analytics are disabled by design.",
    ogImage: null,
    h1: "Cookie Policy",
  },
  {
    path: "/legal/imprint",
    title: "Imprint · Third Rail Systems",
    description:
      "Company details for Third Rail Systems OÜ, registered in Tallinn, Estonia.",
    ogImage: null,
    h1: "Imprint",
  },
];

/**
 * Homepage H1 — used when we rewrite build/index.html itself.
 */
const HOMEPAGE_H1 = "Minimum-Disclosure Travel Risk Compliance";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace a single tag's content attribute in the HTML if it exists.
 * Matches both `... />` and `... >` ending styles (CRA emits self-closing).
 */
function replaceTag(html, regex, replacement) {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html;
}

/**
 * Replace a tag if it exists in the head, otherwise INSERT it immediately
 * before </head>. Used for tags that we intentionally omitted from the
 * static /public/index.html (canonical, og:url) because they would break
 * SPA-fallback routes if hardcoded sitewide. For each prerendered article
 * shell we still want them present and correct, so we insert them here.
 */
function upsertHeadTag(html, regex, replacement) {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace("</head>", `        ${replacement}\n    </head>`);
}

function injectRouteMeta(html, url, meta) {
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const escapedUrl = escapeHtml(url);
  const escapedImg = escapeHtml(ogImage);

  let out = html;

  // <title>
  out = replaceTag(
    out,
    /<title>[\s\S]*?<\/title>/,
    `<title>${title}</title>`,
  );

  // <meta name="description">
  out = replaceTag(
    out,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );

  // <link rel="canonical"> — INSERT if absent (it is intentionally omitted
  // from the static /public/index.html to prevent SPA-fallback routes from
  // erroneously canonicalising to "/"; each prerendered shell needs its
  // own).
  out = upsertHeadTag(
    out,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapedUrl}" />`,
  );

  // og:type → article
  out = replaceTag(
    out,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="article" />`,
  );

  // og:title
  out = replaceTag(
    out,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );

  // og:description
  out = replaceTag(
    out,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );

  // og:url — INSERT if absent (also omitted from static /public/index.html
  // for the same SPA-fallback reason as canonical above).
  out = upsertHeadTag(
    out,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapedUrl}" />`,
  );

  // og:image
  out = replaceTag(
    out,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapedImg}" />`,
  );

  // twitter:title
  out = replaceTag(
    out,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  );

  // twitter:description
  out = replaceTag(
    out,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  );

  // twitter:image
  out = replaceTag(
    out,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapedImg}" />`,
  );

  // <h1> inside #root — required for non-JS crawlers to see a
  // server-rendered H1 per route (SEO spec 2026-02-12). React's createRoot
  // will replace #root's children on mount, so this H1 vanishes from the
  // live DOM once JS runs; the matching sr-only <h1> in the page component
  // takes over from there so the DOM always has exactly one h1 with the
  // required text. Text sits inside a visually-hidden wrapper so the H1 is
  // announced by screen readers but does not disrupt the visual design.
  if (meta.h1) {
    const escapedH1 = escapeHtml(meta.h1);
    const h1Markup = `<h1 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${escapedH1}</h1>`;
    out = out.replace(
      /<div id="root">\s*<\/div>/,
      `<div id="root">${h1Markup}</div>`,
    );
  }

  return out;
}

function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log("[inject-writing-meta] No build/ directory; skipping.");
    return;
  }
  if (!fs.existsSync(SOURCE_HTML)) {
    console.error("[inject-writing-meta] build/index.html not found; cannot inject.");
    process.exit(1);
  }
  if (!fs.existsSync(META_CONFIG)) {
    console.error(`[inject-writing-meta] Missing config: ${META_CONFIG}`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(SOURCE_HTML, "utf-8");
  const config = JSON.parse(fs.readFileSync(META_CONFIG, "utf-8"));

  const slugs = [];
  let count = 0;
  for (const [slug, meta] of Object.entries(config)) {
    if (slug.startsWith("_")) continue; // skip _comment and other config metadata
    if (!meta || !meta.title || !meta.description) {
      console.warn(`[inject-writing-meta] Skipping "${slug}" — missing title or description.`);
      continue;
    }
    // Flat-file output: writing/<slug>.html (not writing/<slug>/index.html).
    // Per Emergent platform support (2026-02-11): the shared static-serving
    // layer maps paths to .html files; it does NOT do directory-index
    // resolution and does NOT honour _redirects. A request to
    // /writing/<slug> is served by /writing/<slug>.html if that file
    // exists, otherwise it falls through to the SPA shell. Flat files
    // therefore let non-JS scrapers (Ahrefs, LinkedIn, Twitter) read the
    // per-article meta tags from the canonical URL without any edge
    // configuration changes.
    const writingDir = path.join(BUILD_DIR, "writing");
    fs.mkdirSync(writingDir, { recursive: true });
    const outPath = path.join(writingDir, `${slug}.html`);
    const url = `${SITE_ORIGIN}/writing/${slug}`;
    const html = injectRouteMeta(baseHtml, url, meta);
    fs.writeFileSync(outPath, html, "utf-8");
    console.log(`[inject-writing-meta] wrote ${path.relative(BUILD_DIR, outPath)}`);
    slugs.push(slug);
    count++;
  }

  // Top-level pages: same flat-file convention. Each writes build<path>.html
  // at the build root so /memo is served by build/memo.html, /catch-22 by
  // build/catch-22.html, etc.
  for (const page of TOP_PAGES) {
    const relativeFilePath = `${page.path.replace(/^\//, "")}.html`;
    const outPath = path.join(BUILD_DIR, relativeFilePath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const url = `${SITE_ORIGIN}${page.path}`;
    const html = injectRouteMeta(baseHtml, url, page);
    fs.writeFileSync(outPath, html, "utf-8");
    console.log(`[inject-writing-meta] wrote ${path.relative(BUILD_DIR, outPath)}`);
    count++;
  }

  // _redirects file is intentionally NOT written. Emergent platform support
  // confirmed (2026-02-11) that the static-serving layer does not honour
  // Netlify-style _redirects rules. Flat .html files above achieve the
  // same effect via the platform's native path-to-file mapping.

  // Homepage H1 — rewrite build/index.html in place. The homepage is not a
  // "route" in TOP_PAGES because it uses the base HTML directly (no
  // per-route meta override). We only need to inject an H1 into #root so
  // non-JS crawlers see it at "/".
  const homepageHtml = fs.readFileSync(SOURCE_HTML, "utf-8");
  const homepageH1Markup = `<h1 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${escapeHtml(HOMEPAGE_H1)}</h1>`;
  const rewritten = homepageHtml.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${homepageH1Markup}</div>`,
  );
  if (rewritten !== homepageHtml) {
    fs.writeFileSync(SOURCE_HTML, rewritten, "utf-8");
    console.log(`[inject-writing-meta] wrote index.html (H1 injected)`);
    count++;
  } else {
    console.warn(`[inject-writing-meta] index.html: #root not found in expected form; H1 NOT injected`);
  }

  console.log(`[inject-writing-meta] Done. Generated ${count} prerendered HTML files.`);
}

main();
