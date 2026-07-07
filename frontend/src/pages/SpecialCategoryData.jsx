import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import { Button } from "@/components/ui/button";
import { useSEO, useJsonLd } from "@/lib/useSEO";
// Raw markdown bundled at build time (same pipeline as /beyond-disclosure).
// The SAME file feeds the prerendered shell via scripts/inject-writing-meta.js,
// so the crawler-visible body and the rendered body share one source of truth.
import scdMarkdown from "@/content/special-category-data.md";

const CANONICAL = "https://thirdrailsystems.ee/special-category-data";
const H1 = "Special category data in employee travel";
const TITLE_TAG = "Special Category Data in Employee Travel · GDPR Article 9";
const META_DESCRIPTION =
  "What GDPR Article 9 prohibits, what ISO 31030 requires, and why most travel risk programmes are caught between the two. A reference for DPOs and security leads.";

/**
 * Split the dek (the first paragraph of the markdown source) from the
 * question sections so the dek can render in the header, matching the
 * /catch-22 hero layout, while the body stays verbatim from one source.
 */
function splitDek(md) {
  const i = md.indexOf("\n\n");
  return { dek: md.slice(0, i).trim(), body: md.slice(i).trimStart() };
}

// Typography mapped to the /catch-22 brief treatment: each `##` question
// renders as an H2 with the BriefSection heading style and section rhythm;
// paragraphs use the brief body style; links use the site's cyan underline.
const markdownComponents = {
  h2: ({ node, ...props }) => (
    <h2
      className="mt-16 scroll-mt-24 border-t border-slate-900 pt-16 text-3xl font-semibold tracking-tight text-white first:mt-0 first:border-t-0 first:pt-0 sm:text-4xl"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p
      className="mt-6 text-[15px] leading-relaxed text-slate-300 sm:text-base"
      {...props}
    />
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
      {...props}
    />
  ),
};

export default function SpecialCategoryData() {
  const navigate = useNavigate();

  useSEO({
    title: TITLE_TAG,
    description: META_DESCRIPTION,
    canonical: CANONICAL,
    ogType: "article",
  });

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: H1,
      description: META_DESCRIPTION,
      author: {
        "@type": "Person",
        name: "Levi Hankins",
        url: "https://www.linkedin.com/in/levihankins",
        jobTitle: "Founder & CEO, Third Rail Systems OÜ",
      },
      publisher: {
        "@type": "Organization",
        name: "Third Rail Systems OÜ",
        url: "https://thirdrailsystems.ee/",
        logo: {
          "@type": "ImageObject",
          url: "https://thirdrailsystems.ee/og.png",
        },
      },
      datePublished: "2026-07-07",
      dateModified: "2026-07-07",
      mainEntityOfPage: CANONICAL,
      image: "https://thirdrailsystems.ee/og.png",
      inLanguage: "en",
      keywords:
        "GDPR Article 9, special category data, ISO 31030, employee travel risk management, minimum-disclosure architecture",
    },
    "scd-article-jsonld",
  );

  useJsonLd(
    {
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
          name: "Special category data in employee travel",
          item: CANONICAL,
        },
      ],
    },
    "scd-breadcrumb-jsonld",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { dek, body } = splitDek(scdMarkdown);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      data-testid="scd-root"
    >
      <SEOHeading>{H1}</SEOHeading>
      <Navbar onCtaClick={() => navigate("/#contact")} />

      {/* Hero — same treatment as /catch-22 */}
      <header
        className="relative isolate overflow-hidden pt-32 sm:pt-40"
        data-testid="scd-header"
      >
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(55% 55% at 50% 0%, rgba(34,211,238,0.10) 0%, rgba(11,15,20,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400"
            data-testid="scd-back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <h2
            className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="scd-title"
          >
            {H1}
          </h2>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            {dek}
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="relative mx-auto max-w-4xl px-5 pb-28 sm:px-8 lg:px-10">
        <article data-testid="scd-article" className="pt-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {body}
          </ReactMarkdown>
        </article>

        {/* Diagnostic CTA — same component treatment as /catch-22 */}
        <div
          className="mt-16 flex flex-col items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"
          data-testid="scd-cta-diagnostic"
        >
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
              Request a diagnostic
            </div>
            <div className="mt-1 text-sm text-slate-100 sm:text-base">
              60-minute structured conversation. Confidential. No HRIS
              integration required.
            </div>
          </div>
          <Button
            onClick={() => navigate("/diagnostic")}
            className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            data-testid="scd-cta-contact"
          >
            Request Diagnostic
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
