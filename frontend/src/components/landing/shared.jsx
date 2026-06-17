import { useEffect } from "react";

export const MEMO_READ_STORAGE_KEY = "trs.memo_read";
export const CATCH22_READ_STORAGE_KEY = "trs.catch22_read";

// Exposure trilogy read-completion flags. Mirror the memo/catch-22 pattern:
// localStorage is set when the reader scrolls past 85% of the article body,
// then attached to the next pilot/diagnostic intake POST so lead-qualification
// reflects trilogy engagement. Keys must stay in lockstep with the backend
// PilotRequestCreate model (`exposure1_read`, `exposure2_read`, `exposure3_read`).
export const EXPOSURE1_READ_STORAGE_KEY = "trs.exposure1_read";
export const EXPOSURE2_READ_STORAGE_KEY = "trs.exposure2_read";
export const EXPOSURE3_READ_STORAGE_KEY = "trs.exposure3_read";

export const LOGO_URL = "/trs_logo.png";

// Published thought-leadership — wired into Share buttons + "Read on LinkedIn" CTAs.
// LINKEDIN_ARTICLE_URL is kept as a single canonical URL for the Catch-22 brief's
// "Companion essay on LinkedIn" share/CTA logic. LINKEDIN_ARTICLES is the full
// publication list rendered in the "Recent writing" panel under the founder bios.
export const LINKEDIN_ARTICLE_URL =
  "https://www.linkedin.com/pulse/duty-care-vs-data-privacy-catch-22-multi-billion-euro-levi-hankins-ugijc";
export const LEVI_LINKEDIN_URL = "https://www.linkedin.com/in/levihankins";

export const LINKEDIN_ARTICLES = [
  {
    id: "dadt-founder-note",
    title:
      "What twenty years under Don't Ask Don't Tell taught me about building Third Rail Systems.",
    url: "https://www.linkedin.com/pulse/what-twenty-years-under-dont-ask-tell-taught-me-building-levi-hankins-q0mlc",
    tag: "Founder note",
    date: "Jun 2026",
    snippet:
      "The lived-experience operational thesis behind a minimum-disclosure architecture: why discretion under institutional scrutiny is the founding constraint, not a feature.",
    testid: "writing-article-dadt",
  },
  {
    id: "catch22-brief",
    title:
      "The duty-of-care vs. data-privacy Catch-22: a multi-billion-euro liability hiding in EU enterprise HR.",
    url: "https://www.linkedin.com/pulse/duty-care-vs-data-privacy-catch-22-multi-billion-euro-levi-hankins-ugijc",
    tag: "Liability brief",
    date: "May 2026",
    snippet:
      "The five enforcement vectors EU general counsel and CISOs are quietly under-pricing right now, and the architectural pattern that resolves them.",
    testid: "writing-article-catch22",
  },
];

/** LinkedIn share-offsite deep link for a given URL. */
export const linkedinShareUrl = (url) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

/**
 * Defensive outbound-link handler.
 *
 * Inside an iframe (e.g., the Emergent preview), browsers commonly collapse
 * `target="_blank"` into a same-iframe navigation because the parent iframe's
 * sandbox attribute does not include `allow-popups`. LinkedIn (and many other
 * SaaS surfaces) refuses to be framed via `X-Frame-Options: SAMEORIGIN`, so
 * the click 502s with `ERR_BLOCKED_BY_RESPONSE`.
 *
 * This handler explicitly calls `window.open(...)` during a synchronous user
 * gesture only when we detect we're inside an iframe — that bypasses the
 * sandbox collapse. In the normal (non-iframe) production case it falls
 * through to the native `target="_blank"` behaviour.
 *
 * Usage:
 *   <a href={url} target="_blank" rel="noopener noreferrer" onClick={openExternal(url)}>
 */
export const openExternal = (url) => (e) => {
  try {
    if (typeof window !== "undefined" && window.self !== window.top) {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (_) {
    // window.top access can throw on cross-origin iframes; if so, force-open.
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export const NAV_LINKS = [
  { id: "platform", label: "Platform" },
  { id: "architecture", label: "Architecture" },
  { id: "solutions", label: "Solutions" },
  { id: "compliance", label: "Compliance" },
  { id: "validation", label: "Validation" },
  { id: "advisory", label: "Advisory" },
];

export const ROLE_OPTIONS = [
  { value: "cso", label: "CSO / Security Leadership" },
  { value: "dpo", label: "DPO / Privacy Counsel" },
  { value: "erg", label: "ERG / Inclusion Lead" },
  { value: "mobility", label: "Global Mobility / HR" },
  { value: "executive", label: "C-Suite / Executive" },
  { value: "other", label: "Other" },
];

/** IntersectionObserver-based fade-up for elements marked `.reveal`. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export const Eyebrow = ({ children, index }) => (
  <div
    className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-400"
    data-testid={`eyebrow-${index || "label"}`}
  >
    {index && <span className="text-slate-500">{index}</span>}
    <span className="trs-section-line" aria-hidden="true" />
    <span>{children}</span>
  </div>
);

export const SectionHeader = ({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}) => (
  <div
    className={`reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
  >
    <Eyebrow index={index}>{eyebrow}</Eyebrow>
    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base text-slate-400 sm:text-lg">{description}</p>
    )}
  </div>
);

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
