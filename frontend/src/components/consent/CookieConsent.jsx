import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { devLog } from "@/lib/debug";

/**
 * EDPB-compliant cookie / consent banner.
 *
 *  - PostHog is NOT initialised at page load (see index.html). It only boots
 *    after the user clicks "Accept all".
 *  - "Accept" and "Reject" are visually equivalent — no dark patterns,
 *    in line with EDPB Guidelines 03/2022.
 *  - Choice is persisted in localStorage under `trs.consent`.
 *  - Footer link calls `window.trsOpenCookieSettings()` to re-open the banner.
 */
export const CONSENT_STORAGE_KEY = "trs.consent";

function bootPostHog() {
  if (typeof window === "undefined") return;
  const key = window.__POSTHOG_KEY;
  const host = window.__POSTHOG_HOST;
  if (!key || !host || !window.posthog) return;
  // `__SV` flag prevents double-init across re-renders.
  if (window.posthog.__loaded) return;
  try {
    window.posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      session_recording: {
        recordCrossOriginIframes: true,
        capturePerformance: false,
      },
    });
    window.posthog.__loaded = true;
  } catch (err) {
    // ignore — analytics must never break UX
    devLog("[CookieConsent] PostHog init failed:", err?.message);
  }
}

export default function CookieConsent() {
  // null = haven't read storage yet, "" = no decision, "accepted" / "rejected"
  const [decision, setDecision] = useState(null);
  const [open, setOpen] = useState(false);

  // Read stored decision once on mount. Intentional set-state-in-effect
  // pattern — we synchronise client-only localStorage into React state.
  useEffect(() => {
    let stored = "";
    try {
      stored = localStorage.getItem(CONSENT_STORAGE_KEY) || "";
    } catch (err) {
      // Private browsing or storage disabled. Treat as no decision.
      devLog("[CookieConsent] localStorage read failed:", err?.message);
    }
    setDecision(stored);
    if (stored === "accepted") {
      bootPostHog();
    }
    if (!stored) {
      // Defer banner mount slightly so it doesn't fight the initial paint.
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Allow Footer (or any component) to re-open the banner.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.trsOpenCookieSettings = () => setOpen(true);
    return () => {
      try {
        delete window.trsOpenCookieSettings;
      } catch (err) {
        // IE/older edge fallback.
        devLog("[CookieConsent] cleanup failed:", err?.message);
        window.trsOpenCookieSettings = undefined;
      }
    };
  }, []);

  const persist = useCallback((value) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch (err) {
      devLog("[CookieConsent] localStorage write failed:", err?.message);
    }
    setDecision(value);
    setOpen(false);
  }, []);

  const handleAccept = useCallback(() => {
    persist("accepted");
    bootPostHog();
    if (typeof window !== "undefined" && window.posthog) {
      try {
        window.posthog.capture("consent_accepted");
      } catch (err) {
        devLog("[CookieConsent] posthog capture failed:", err?.message);
      }
    }
  }, [persist]);

  const handleReject = useCallback(() => {
    persist("rejected");
    // No-op for analytics — PostHog is never initialised. Any queued events
    // in the stub array are GC'd on page unload.
  }, [persist]);

  if (decision === null) return null; // SSR/initial frame
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6"
    >
      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/95 p-5 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 sm:flex">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                Cookies & Analytics
              </div>
              <button
                onClick={() =>
                  decision ? setOpen(false) : handleReject()
                }
                aria-label="Close"
                className="-m-1 rounded p-1 text-slate-500 hover:text-slate-200"
                data-testid="cookie-consent-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              We use only{" "}
              <span className="text-white">strictly necessary</span> storage
              by default. With your consent, we additionally load{" "}
              <span className="text-white">PostHog</span> (EU region) to
              measure aggregate usage of this site — no special-category
              data, no advertising, no cross-site tracking. You can change
              your choice at any time from the footer.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                onClick={handleAccept}
                className="btn-glow h-10 bg-cyan-500 px-5 text-slate-950 hover:bg-cyan-400"
                data-testid="cookie-consent-accept"
              >
                Accept all
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                className="h-10 border-slate-700 bg-slate-950/60 px-5 text-slate-100 hover:border-slate-600 hover:bg-slate-900 hover:text-white"
                data-testid="cookie-consent-reject"
              >
                Reject non-essential
              </Button>
              <Link
                to="/legal/cookies"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[24px] items-center mono text-[11px] uppercase tracking-[0.18em] text-slate-400 hover:text-cyan-400 sm:ml-2"
                data-testid="cookie-consent-policy-link"
              >
                Cookie policy →
              </Link>
            </div>
            {decision && (
              <div className="mt-3 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Current preference:{" "}
                <span className="text-slate-300">
                  {decision === "accepted" ? "Accepted" : "Rejected"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
