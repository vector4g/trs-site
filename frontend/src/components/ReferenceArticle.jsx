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

/**
 * ReferenceArticle — shared layout for the machine-citable reference pages
 * (/civil-society, /travel-risk-dpia, /glossary). Mirrors the typography
 * and component treatment of /special-category-data exactly: catch-22 hero,
 * question-form H2s with stable `{#anchor}` IDs authored in the markdown
 * source, a "How to cite this page" block under the standfirst, the
 * diagnostic CTA, and Article + BreadcrumbList JSON-LD only.
 *
 * The markdown source is the single source of truth: the same file feeds
 * the prerendered shell (scripts/inject-writing-meta.js, markdown-it-attrs)
 * and this runtime renderer, so body text and anchors survive rebuilds
 * unchanged.
 */

/** Extract `{#anchor-id}` suffixes from H2 headings into a text → id map. */
function extractAnchors(md) {
  const anchors = {};
  const cleaned = md.replace(
    /^## (.+?)\s*\{#([a-z0-9-]+)\}\s*$/gm,
    (_, text, id) => {
      anchors[text.trim()] = id;
      return `## ${text.trim()}`;
    },
  );
  return { anchors, cleaned };
}

/** Split the dek (first paragraph) from the section body. */
function splitDek(md) {
  const i = md.indexOf("\n\n");
  return { dek: md.slice(0, i).trim(), body: md.slice(i).trimStart() };
}

function buildMarkdownComponents(anchors) {
  return {
    h2: ({ node, children, ...props }) => {
      const text = Array.isArray(children)
        ? children.join("")
        : String(children);
      return (
        <h2
          id={anchors[text.trim()]}
          className="mt-16 scroll-mt-24 border-t border-slate-900 pt-16 text-3xl font-semibold tracking-tight text-white first:mt-0 first:border-t-0 first:pt-0 sm:text-4xl"
          {...props}
        >
          {children}
        </h2>
      );
    },
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
}

export default function ReferenceArticle({
  slug,
  h1,
  titleTag,
  description,
  canonical,
  markdown,
  citeIntro,
  citeExample,
  citeTail,
  trailingLine = null,
  relatedLinks = null,
  dateModified,
}) {
  const navigate = useNavigate();

  useSEO({
    title: titleTag,
    description,
    canonical,
    ogType: "article",
  });

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: h1,
      description,
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
      datePublished: dateModified,
      // dateModified MUST be bumped (ISO format) on every content change
      // to the route.
      dateModified,
      mainEntityOfPage: canonical,
      image: "https://thirdrailsystems.ee/og.png",
      inLanguage: "en",
    },
    `${slug}-article-jsonld`,
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
        { "@type": "ListItem", position: 2, name: h1, item: canonical },
      ],
    },
    `${slug}-breadcrumb-jsonld`,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { anchors, cleaned } = extractAnchors(markdown);
  const { dek, body } = splitDek(cleaned);
  const components = buildMarkdownComponents(anchors);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      data-testid={`${slug}-root`}
    >
      <SEOHeading>{h1}</SEOHeading>
      <Navbar onCtaClick={() => navigate("/#contact")} />

      <header
        className="relative isolate overflow-hidden pt-32 sm:pt-40"
        data-testid={`${slug}-header`}
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
            data-testid={`${slug}-back-link`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <h2
            className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid={`${slug}-title`}
          >
            {h1}
          </h2>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            {dek}
          </p>

          {/* Machine citation layer — same block styling as the sources
              page's "How to cite this library". */}
          <section
            className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-5 text-[15px] leading-[1.7] text-slate-300"
            data-testid={`${slug}-citation-block`}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
              How to cite this page
            </h3>
            <p className="mt-3">
              {citeIntro}
              <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-[13px] text-cyan-300">
                {citeExample}
              </code>
              {citeTail}
            </p>
          </section>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-5 pb-28 sm:px-8 lg:px-10">
        <article data-testid={`${slug}-article`} className="pt-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {body}
          </ReactMarkdown>
        </article>

        {/* Diagnostic CTA — same component treatment as /catch-22 and
            /special-category-data */}
        <div
          className="mt-16 flex flex-col items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"
          data-testid={`${slug}-cta-diagnostic`}
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
            data-testid={`${slug}-cta-contact`}
          >
            Request Diagnostic
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {trailingLine && (
          <p
            className="mt-6 text-[15px] leading-relaxed text-slate-300 sm:text-base"
            data-testid={`${slug}-trailing-line`}
          >
            {trailingLine}
          </p>
        )}

        {relatedLinks && (
          <div
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[15px]"
            data-testid={`${slug}-related-links`}
          >
            {relatedLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
                data-testid={l.testid}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
