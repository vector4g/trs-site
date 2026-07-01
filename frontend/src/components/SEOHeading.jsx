/**
 * SEOHeading — an sr-only <h1> for pages where the visible headline text
 * differs from the SEO-required H1 (per SEO spec 2026-02-12).
 *
 * Rationale
 * ---------
 * Every route must have exactly one <h1> whose text matches the exact
 * required string (see scripts/inject-writing-meta.js for the canonical
 * list). Marketing headlines rarely match SEO-optimal H1 strings, so the
 * visible headline stays as an <h2> and this component provides the
 * required <h1> without disrupting the visual layout.
 *
 * The matching <h1> is also injected into the prerendered HTML shell so
 * non-JS crawlers (Ahrefs, LinkedIn) see it in the raw response before
 * React mounts. React's createRoot replaces #root on mount, so the
 * prerendered H1 vanishes from the live DOM and this component's H1 takes
 * over — the DOM always contains exactly one H1 with the required text.
 *
 * Styling: absolute-positioned off-screen (screen-reader friendly, still
 * indexed by search engines that render CSS). Do NOT use `display:none`
 * — Google can discount hidden content flagged that way.
 */
export default function SEOHeading({ children }) {
  return (
    <h1
      data-testid="seo-h1"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      {children}
    </h1>
  );
}
