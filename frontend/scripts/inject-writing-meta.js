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
 * `build/writing/<slug>/index.html` — a byte-for-byte copy of
 * `build/index.html` with the <head> meta tags rewritten to the article's
 * own values. The directory-index convention lets the host serve
 * `/writing/<slug>` directly from `build/writing/<slug>/index.html` before
 * the SPA fallback kicks in. Real users get the same React bundle and same
 * #root mount — only the <head> differs.
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

  // <link rel="canonical">
  out = replaceTag(
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

  // og:url
  out = replaceTag(
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
    const outDir = path.join(BUILD_DIR, "writing", slug);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "index.html");
    const html = injectArticleMeta(baseHtml, slug, meta);
    fs.writeFileSync(outPath, html, "utf-8");
    console.log(`[inject-writing-meta] wrote ${path.relative(BUILD_DIR, outPath)}`);
    slugs.push(slug);
    count++;
  }

  // Write _redirects so the Cloudflare-Pages-style host rewrites the canonical
  // article URL `/writing/<slug>` to the prerendered shell at
  // `/writing/<slug>/index.html`. Without this, the host falls back to the SPA
  // root `/index.html` (verified empirically in production), and bots see only
  // the homepage <head>. The `200` status code means rewrite, not redirect —
  // the URL bar stays as `/writing/<slug>` for the user. The final
  // `/* /index.html 200` line preserves SPA fallback for every OTHER route.
  const redirectLines = [
    "# Auto-generated by scripts/inject-writing-meta.js — do not hand-edit.",
    "# Source: src/lib/writingMeta.json",
    "# Each article: serve the prerendered HTML shell for non-JS scrapers.",
    "",
  ];
  for (const slug of slugs) {
    redirectLines.push(
      `/writing/${slug}                /writing/${slug}/index.html  200`,
    );
  }
  redirectLines.push("", "# SPA fallback for every other route.");
  redirectLines.push("/*  /index.html  200");
  redirectLines.push(""); // trailing newline

  const redirectsPath = path.join(BUILD_DIR, "_redirects");
  fs.writeFileSync(redirectsPath, redirectLines.join("\n"), "utf-8");
  console.log(`[inject-writing-meta] wrote _redirects (${slugs.length} article rewrites + SPA fallback)`);

  console.log(`[inject-writing-meta] Done. Generated ${count} article HTML files.`);
}

main();
