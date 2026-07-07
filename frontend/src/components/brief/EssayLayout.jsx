/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import {
  Eyebrow,
  useReveal,
  scrollToId,
  linkedinShareUrl,
  LEVI_LINKEDIN_URL,
} from "@/components/landing/shared";
import { devLog } from "@/lib/debug";

/* LinkedIn glyph — shared by all share buttons across the brief surface. */
function LinkedInGlyph({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

const track = (event, props = {}) => {
  if (typeof window !== "undefined" && window.posthog) {
    try {
      window.posthog.capture(event, props);
    } catch (_) {
      // swallow analytics failures
    }
  }
};

/**
 * Long-form essay layout. Owns the page chrome that every essay shares
 * (navbar, eyebrow with series locator + back-links, sticky TOC, share card,
 * read-progress instrumentation, footer) so individual essay pages only
 * supply meta + body content.
 *
 * Props:
 *   - canonical:   absolute canonical URL for this essay (drives og:url + share copy-link).
 *   - eyebrow:     short mono label above the H1 (e.g. "Exposure · Part Two").
 *   - title:       H1 string.
 *   - lede:        single paragraph rendered immediately under the H1.
 *   - backLinks:   array of { to, label } shown under the eyebrow as
 *                  "← Part One · Nothing Happened" style chips.
 *   - toc:         array of { id, label } that builds the sticky right rail.
 *   - eventKey:    PostHog event-name suffix, e.g. "exposure1" → emits
 *                  `exposure1_viewed`, `exposure1_read_progress`, `exposure1_read_completed`,
 *                  `exposure1_toc_click`, `exposure1_share_linkedin`, `exposure1_copy_link`.
 *   - readStorageKey: localStorage key flipped to "1" when read-completed fires.
 *   - shareTitle:  copy used on the LinkedIn share intent ("text=...").
 *   - shareUrl:    the URL handed to LinkedIn (defaults to canonical).
 *   - footerCta:   optional { to, label, description } rendered as the
 *                  "Continues in Part X" block before the share card.
 *   - children:    the BriefSection-driven essay body.
 */
export default function EssayLayout({
  canonical,
  eyebrow,
  title,
  seoH1,
  lede,
  backLinks = [],
  toc,
  eventKey,
  readStorageKey,
  shareTitle,
  shareUrl,
  footerCta,
  children,
}) {
  useReveal();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const isPrint = new URLSearchParams(location.search).get("print") === "1";
  useEffect(() => {
    if (isPrint) {
      document.body.classList.add("trs-print-mode");
      return () => document.body.classList.remove("trs-print-mode");
    }
  }, [isPrint]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isPrint) {
      track(`${eventKey}_viewed`, {});
    }
    // eventKey is a constant per page-mount; not a real reactive dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrint]);

  // Scroll-depth + completion tracking. Mirrors the /catch-22 pattern: 25/50/75
  // milestones fire `<eventKey>_read_progress`, and crossing 85% fires
  // `<eventKey>_read_completed` exactly once and persists the read-flag in
  // localStorage so the next intake form can attribute the read to the lead.
  useEffect(() => {
    if (isPrint) return;
    const milestones = [25, 50, 75];
    const fired = new Set();
    let completedFired = false;

    const onScroll = () => {
      const article = document.getElementById("essay-article-root");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const viewportH = window.innerHeight;
      const scrolledPast = Math.max(
        0,
        Math.min(articleHeight, viewportH - rect.top),
      );
      const pct = Math.round((scrolledPast / articleHeight) * 100);

      milestones.forEach((m) => {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track(`${eventKey}_read_progress`, { percent: m });
        }
      });
      if (!completedFired && pct >= 85) {
        completedFired = true;
        track(`${eventKey}_read_completed`, {});
        if (readStorageKey) {
          try {
            localStorage.setItem(readStorageKey, "1");
          } catch (err) {
            // Private mode / storage disabled — analytics flag is best-effort.
            devLog(`[EssayLayout:${eventKey}] read flag persist failed:`, err?.message);
          }
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrint]);

  const handleTocClick = (id) => {
    track(`${eventKey}_toc_click`, { section: id });
    scrollToId(id);
  };

  const handleShare = () => {
    const url = shareUrl || canonical;
    track(`${eventKey}_share_linkedin`, {});
    const target = linkedinShareUrl(url);
    try {
      window.open(target, "_blank", "noopener,noreferrer");
    } catch (_) {
      window.location.assign(target);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      setCopied(true);
      track(`${eventKey}_copy_link`, {});
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      devLog(`[EssayLayout:${eventKey}] copy failed:`, err?.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {seoH1 && <SEOHeading>{seoH1}</SEOHeading>}
      {!isPrint && <Navbar />}

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Article body */}
          <article
            id="essay-article-root"
            className="lg:col-span-8"
            data-testid={`essay-${eventKey}-root`}
          >
            <Eyebrow index={eyebrow}>Exposure series</Eyebrow>
            <h2
              className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
              data-testid={`essay-${eventKey}-title`}
            >
              {title}
            </h2>
            {lede && (
              <p className="mt-6 text-lg leading-relaxed text-slate-300 sm:text-xl">
                {lede}
              </p>
            )}

            {backLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3" data-testid={`essay-${eventKey}-backlinks`}>
                {backLinks.map((b) => (
                  <Link
                    key={b.to}
                    to={b.to}
                    className="mono inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {b.label}
                  </Link>
                ))}
              </div>
            )}

            {children}

            {/* Forward link to next part — rendered only when supplied. */}
            {footerCta && (
              <div className="mt-16 border-t border-slate-900 pt-10" data-testid={`essay-${eventKey}-next`}>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Continues
                </div>
                <Link
                  to={footerCta.to}
                  onClick={() => track(`${eventKey}_next_click`, { to: footerCta.to })}
                  className="group mt-3 flex items-start justify-between gap-5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/10"
                >
                  <div>
                    <div className="text-lg font-semibold text-white sm:text-xl">
                      {footerCta.label}
                    </div>
                    {footerCta.description && (
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                        {footerCta.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}

            {/* Share / copy-link card */}
            <div
              className="mt-12 flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:flex-row sm:items-center sm:justify-between"
              data-testid={`essay-${eventKey}-share`}
            >
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Share this essay
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  If this resonates with someone in your security, privacy, or
                  policy network, pass it along.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShare}
                  className="h-10 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  data-testid={`essay-${eventKey}-share-linkedin`}
                >
                  <LinkedInGlyph className="mr-2 h-4 w-4" />
                  Share on LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="h-10 border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white"
                  data-testid={`essay-${eventKey}-copy-link`}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-cyan-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    track(`${eventKey}_pilot_click`, {});
                    navigate("/diagnostic");
                  }}
                  className="h-10 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  data-testid={`essay-${eventKey}-diagnostic`}
                >
                  Request a diagnostic
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Author micro-bio */}
            <div className="mt-8 text-sm leading-relaxed text-slate-500">
              Levi Hankins is founder & CEO of Third Rail Systems OÜ
              (Tallinn). Twenty-year US Navy veteran. Writes on data
              exposure, minimum-disclosure architecture, and the corporate
              ethics of duty-of-care. Follow on{" "}
              <a
                href={LEVI_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                LinkedIn
              </a>
              .
            </div>
          </article>

          {/* Sticky TOC + Read also. The aside renders whenever not in print
              view; the Contents list inside it still requires a non-empty
              toc (essays without a TOC, e.g. Part One, get only the Read
              also card). The article column is a fixed lg:col-span-8, so
              the aside's presence never reflows the essay body. */}
          {!isPrint && (
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24">
                {toc && toc.length > 0 && (
                  <>
                    <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Contents
                    </div>
                    <ul className="mt-4 space-y-2 border-l border-slate-800 pl-4">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => handleTocClick(item.id)}
                            className="text-left text-[13px] leading-relaxed text-slate-400 transition-colors hover:text-cyan-300"
                            data-testid={`essay-${eventKey}-toc-${item.id}`}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="mt-8 rounded-md border border-slate-800 bg-slate-900/60 p-4">
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    Read also
                  </div>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    {eventKey !== "by-direction" && (
                      <li>
                        <Link
                          to="/writing/by-direction"
                          className="text-slate-300 hover:text-cyan-300"
                          data-testid={`essay-${eventKey}-read-also-by-direction`}
                        >
                          By Direction: The Agent Needs a Mandate, Not Your Identity
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/catch-22"
                        className="text-slate-300 hover:text-cyan-300"
                      >
                        The Shadow HR Liability →
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/memo"
                        className="text-slate-300 hover:text-cyan-300"
                      >
                        The Strategic Memo →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {!isPrint && <Footer />}
    </div>
  );
}
