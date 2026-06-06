/**
 * useSEO — per-page SEO meta hook for an SPA.
 *
 * Without this, every route in a client-rendered React app would share the
 * single <title>, <meta name="description">, and <link rel="canonical"> from
 * /public/index.html. Google would then see N pages all canonicalising to the
 * homepage and collapse them, destroying internal discoverability.
 *
 * This hook updates the four most-impactful tags on mount and restores the
 * previous values on unmount:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - <meta property="og:url">
 *
 * Usage:
 *   useSEO({
 *     title: "The Shadow HR Liability · Third Rail Systems OÜ",
 *     description: "Why every multinational with a diverse workforce is sitting on …",
 *     canonical: "https://thirdrailsystems.ee/catch-22",
 *   });
 *
 * Pass undefined for any field to leave that tag untouched on this route.
 */
import { useEffect } from "react";

const SITE_ORIGIN = "https://thirdrailsystems.ee";

function setMeta(selector, attribute, value) {
  if (typeof document === "undefined") return null;
  let el = document.querySelector(selector);
  if (!el) {
    // Tag not present in /public/index.html — create one so we can set it.
    if (selector.startsWith("link")) {
      el = document.createElement("link");
      // selector example: 'link[rel="canonical"]' → rel="canonical"
      const match = selector.match(/\[rel="([^"]+)"\]/);
      if (match) el.setAttribute("rel", match[1]);
    } else {
      el = document.createElement("meta");
      const nameMatch = selector.match(/\[name="([^"]+)"\]/);
      const propMatch = selector.match(/\[property="([^"]+)"\]/);
      if (nameMatch) el.setAttribute("name", nameMatch[1]);
      if (propMatch) el.setAttribute("property", propMatch[1]);
    }
    document.head.appendChild(el);
  }
  const prev = el.getAttribute(attribute) ?? "";
  el.setAttribute(attribute, value);
  return prev;
}

export function useSEO({ title, description, canonical, ogTitle, ogDescription }) {
  useEffect(() => {
    const prevTitle = title ? document.title : null;
    if (title) document.title = title;

    const prevDesc =
      description !== undefined
        ? setMeta('meta[name="description"]', "content", description)
        : null;
    const prevCanonical =
      canonical !== undefined
        ? setMeta('link[rel="canonical"]', "href", canonical)
        : null;
    const prevOgUrl =
      canonical !== undefined
        ? setMeta('meta[property="og:url"]', "content", canonical)
        : null;
    const prevOgTitle =
      ogTitle !== undefined || title !== undefined
        ? setMeta(
            'meta[property="og:title"]',
            "content",
            ogTitle ?? title ?? "",
          )
        : null;
    const prevOgDesc =
      ogDescription !== undefined || description !== undefined
        ? setMeta(
            'meta[property="og:description"]',
            "content",
            ogDescription ?? description ?? "",
          )
        : null;
    const prevTwTitle =
      ogTitle !== undefined || title !== undefined
        ? setMeta(
            'meta[name="twitter:title"]',
            "content",
            ogTitle ?? title ?? "",
          )
        : null;
    const prevTwDesc =
      ogDescription !== undefined || description !== undefined
        ? setMeta(
            'meta[name="twitter:description"]',
            "content",
            ogDescription ?? description ?? "",
          )
        : null;

    return () => {
      if (prevTitle !== null) document.title = prevTitle;
      if (prevDesc !== null)
        setMeta('meta[name="description"]', "content", prevDesc);
      if (prevCanonical !== null)
        setMeta('link[rel="canonical"]', "href", prevCanonical);
      if (prevOgUrl !== null)
        setMeta('meta[property="og:url"]', "content", prevOgUrl);
      if (prevOgTitle !== null)
        setMeta('meta[property="og:title"]', "content", prevOgTitle);
      if (prevOgDesc !== null)
        setMeta('meta[property="og:description"]', "content", prevOgDesc);
      if (prevTwTitle !== null)
        setMeta('meta[name="twitter:title"]', "content", prevTwTitle);
      if (prevTwDesc !== null)
        setMeta('meta[name="twitter:description"]', "content", prevTwDesc);
    };
  }, [title, description, canonical, ogTitle, ogDescription]);
}

/**
 * useJsonLd — inject a JSON-LD script tag while the component is mounted.
 *
 * `data` is a plain object (or array). The hook serialises it, attaches it to
 * <head>, and removes it on unmount. Useful for adding Article schema to the
 * brief and memo pages without polluting the static index.html.
 */
export function useJsonLd(data, id) {
  useEffect(() => {
    if (!data) return undefined;
    const scriptId = id || `jsonld-${Math.random().toString(36).slice(2, 8)}`;
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [data, id]);
}

export { SITE_ORIGIN };
