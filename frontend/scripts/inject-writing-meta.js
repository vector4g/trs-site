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

function injectArticleMeta(html, slug, meta) {
  const url = `${SITE_ORIGIN}/writing/${slug}`;
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
    const html = injectArticleMeta(baseHtml, slug, meta);
    fs.writeFileSync(outPath, html, "utf-8");
    console.log(`[inject-writing-meta] wrote ${path.relative(BUILD_DIR, outPath)}`);
    slugs.push(slug);
    count++;
  }

  // _redirects file is intentionally NOT written. Emergent platform support
  // confirmed (2026-02-11) that the static-serving layer does not honour
  // Netlify-style _redirects rules. Flat .html files above achieve the
  // same effect via the platform's native path-to-file mapping.

  console.log(`[inject-writing-meta] Done. Generated ${count} article HTML files.`);
}

main();
