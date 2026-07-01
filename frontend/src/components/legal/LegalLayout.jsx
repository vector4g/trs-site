import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import { Eyebrow, useReveal } from "@/components/landing/shared";
import { useSEO, useJsonLd } from "@/lib/useSEO";

const NAV_ITEMS = [
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/cookies", label: "Cookies" },
  { to: "/legal/imprint", label: "Legal / Imprint" },
];

// Per-route SEO titles. Kept distinct from the `title` prop (which drives
// the in-page H1 / breadcrumb display) because the user's SEO spec uses
// shorter canonical titles ("Privacy Policy", "Terms of Service") than the
// in-page headings ("Privacy Notice", "Website Terms of Use").
const LEGAL_SEO_TITLES = {
  "/legal/privacy": "Privacy Policy · Third Rail Systems",
  "/legal/terms": "Terms of Service · Third Rail Systems",
  "/legal/cookies": "Cookie Policy · Third Rail Systems",
  "/legal/imprint": "Imprint · Third Rail Systems",
};

// Stable descriptions for each legal route so search engines don't see four
// pages with identical generic blurbs. Copy below matches the user's SEO
// spec exactly (2026-06-26).
const LEGAL_DESCRIPTIONS = {
  "/legal/privacy":
    "How Third Rail Systems handles personal data, in line with the GDPR.",
  "/legal/terms":
    "Terms governing use of the Third Rail Systems website and services.",
  "/legal/cookies":
    "How this site uses cookies. Analytics are disabled by design.",
  "/legal/imprint":
    "Company details for Third Rail Systems OÜ, registered in Tallinn, Estonia.",
};

export default function LegalLayout({
  title,
  seoH1,
  eyebrow,
  version = "v0.1",
  lastUpdated = "2026-04-20",
  effectiveDate,
  currentPath,
  children,
}) {
  useReveal();

  useSEO({
    title:
      LEGAL_SEO_TITLES[currentPath] || `${title} · Third Rail Systems`,
    description:
      LEGAL_DESCRIPTIONS[currentPath] ||
      "Legal documentation for Third Rail Systems OÜ, Tallinn, Estonia.",
    canonical: currentPath
      ? `https://thirdrailsystems.ee${currentPath}`
      : undefined,
    // Legal pages are not search targets — they exist for compliance and
    // direct linking. Crawlers should follow links from them but should NOT
    // index them (avoids legal pages competing with marketing routes for
    // brand-name queries).
    robots: "noindex, follow",
  });

  useJsonLd(
    currentPath
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://thirdrailsystems.ee/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Legal",
              item: "https://thirdrailsystems.ee/legal/privacy",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: `https://thirdrailsystems.ee${currentPath}`,
            },
          ],
        }
      : null,
    "legal-breadcrumb-jsonld",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="legal-root">
      {seoH1 && <SEOHeading>{seoH1}</SEOHeading>}
      <Navbar onCtaClick={() => (window.location.href = "/#contact")} />

      <header className="relative isolate overflow-hidden pt-32 sm:pt-40">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 pb-10 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400"
            data-testid="legal-back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <div className="mt-8">
            <Eyebrow index="LEGAL">{eyebrow}</Eyebrow>
          </div>
          <h2
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl"
            data-testid="legal-title"
          >
            {title}
          </h2>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>Version {version}</span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>Last updated {lastUpdated}</span>
            {effectiveDate && (
              <>
                <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
                <span>Effective {effectiveDate}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* DRAFT banner — required on all legal pages until counsel sign-off */}
      <div
        className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10"
        data-testid="legal-draft-banner"
      >
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="text-sm leading-relaxed">
            <span className="mono mr-2 rounded border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-100">
              Draft — for counsel review
            </span>
            This document is a structured draft authored by the Third Rail
            Systems founding team and is{" "}
            <span className="font-semibold text-amber-100">
              pending sign-off from Estonian counsel
            </span>
            . It does not yet constitute a binding legal commitment. For
            contracted pilots, the governing document is the pilot agreement
            executed between your organization and Third Rail Systems OÜ.
            Questions:{" "}
            <a
              href="mailto:legal@thirdrailsystems.ee"
              className="underline decoration-amber-300/50 hover:text-amber-50"
            >
              legal@thirdrailsystems.ee
            </a>
            .
          </div>
        </div>
      </div>

      {/* TOC + content */}
      <div className="relative mx-auto mt-10 max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Legal
              </div>
              <nav className="mt-4 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = currentPath === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`text-left text-sm ${
                        active
                          ? "text-cyan-400"
                          : "text-slate-400 hover:text-cyan-400"
                      }`}
                      data-testid={`legal-nav-${item.to.split("/").pop()}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <article
            className="reveal prose-trs lg:col-span-9"
            data-testid="legal-article"
          >
            {children}
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/** Shared primitives for legal copy so every page looks identical. */
export const H2 = ({ id, children }) => (
  <h2
    id={id}
    className="mt-12 scroll-mt-24 border-t border-slate-900 pt-10 text-2xl font-semibold tracking-tight text-white first:mt-0 first:border-t-0 first:pt-0 sm:text-3xl"
  >
    {children}
  </h2>
);

export const H3 = ({ children }) => (
  <h3 className="mt-8 text-lg font-semibold text-white sm:text-xl">{children}</h3>
);

export const P = ({ children }) => (
  <p className="mt-4 text-[15px] leading-relaxed text-slate-300 sm:text-base">
    {children}
  </p>
);

export const UL = ({ children }) => (
  <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-slate-300 sm:text-base">
    {children}
  </ul>
);

export const LI = ({ children }) => (
  <li className="flex items-start gap-3">
    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
    <span>{children}</span>
  </li>
);

export const Definition = ({ term, children }) => (
  <div className="mt-5 grid gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-[160px,1fr] sm:gap-6">
    <div className="mono text-xs uppercase tracking-[0.2em] text-cyan-300">
      {term}
    </div>
    <div className="text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
      {children}
    </div>
  </div>
);
