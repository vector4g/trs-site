import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import { Eyebrow, useReveal } from "@/components/landing/shared";
import { useSEO, useJsonLd } from "@/lib/useSEO";
// Raw markdown is imported at build time via CRA's file-loader-less pipeline.
// We use `?raw` via a webpack config or just fetch it as a static asset —
// simplest: bundle the raw text via a JS module.
import whitepaperMarkdown from "@/content/beyond-disclosure.md";

const CANONICAL = "https://thirdrailsystems.ee/beyond-disclosure";
const OG_IMAGE = "https://thirdrailsystems.ee/og/beyond-disclosure.png";
const META_DESCRIPTION =
  "Why disclosure-based protection fails marginalised populations across European work and travel contexts, and a minimum-disclosure architecture that resolves it.";

/**
 * Splits the first markdown H1 line into two parts:
 *   - short H1 (before the first colon)  → "Beyond Disclosure"
 *   - dek / subtitle (after the colon)   → "A European Architectural..."
 * The rest of the markdown is returned unchanged so section headings remain
 * H2/H3 as authored in the source.
 */
function splitTitleAndDek(md) {
  const lines = md.split("\n");
  const firstHeadingIdx = lines.findIndex((l) => l.startsWith("# "));
  if (firstHeadingIdx === -1) return { h1: "Beyond Disclosure", dek: "", body: md };
  const full = lines[firstHeadingIdx].replace(/^#\s+/, "").trim();
  const colonIdx = full.indexOf(":");
  const h1 = colonIdx > 0 ? full.slice(0, colonIdx).trim() : full;
  const dek = colonIdx > 0 ? full.slice(colonIdx + 1).trim() : "";
  const body = lines.slice(firstHeadingIdx + 1).join("\n").trimStart();
  return { h1, dek, body };
}

const markdownComponents = {
  // Map ### section headings → h2 for the visible layout. h3 stays h3.
  // React-markdown emits h1/h2/h3 based on the source #/##/### count; the
  // whitepaper source uses ### for section headings, so remap to h2 here for
  // semantic hierarchy (the required H1 is provided by SEOHeading + the
  // visible dek is an h2 already).
  h1: () => null, // suppress in-body h1 (we render our own outside markdown)
  h2: ({ node, ...props }) => (
    <h2
      className="mt-14 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="mt-12 text-xl font-semibold tracking-tight text-white sm:text-2xl"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-5 text-[15.5px] leading-[1.75] text-slate-300" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic text-slate-200" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  hr: () => <hr className="mt-14 border-slate-800" />,
  a: ({ node, ...props }) => (
    <a
      className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mt-5 list-disc pl-6 text-[15.5px] leading-[1.75] text-slate-300" {...props} />
  ),
  li: ({ node, ...props }) => <li className="mt-2" {...props} />,
};

export default function BeyondDisclosure() {
  useReveal();

  useSEO({
    title: "Beyond Disclosure · Third Rail Systems",
    description: META_DESCRIPTION,
    canonical: CANONICAL,
    ogType: "article",
    ogImage: OG_IMAGE,
  });

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Beyond Disclosure",
    description: META_DESCRIPTION,
    author: {
      "@type": "Person",
      name: "Levi Hankins",
    },
    publisher: {
      "@type": "Organization",
      name: "Third Rail Systems OÜ",
    },
    inLanguage: "en-GB",
    url: CANONICAL,
    image: OG_IMAGE,
  }, "beyond-disclosure-article");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { h1, dek, body } = splitTitleAndDek(whitepaperMarkdown);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="beyond-disclosure-root">
      <SEOHeading>{h1}</SEOHeading>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pb-28 pt-20 sm:px-8">
        <div className="reveal">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.25em] text-slate-500 hover:text-cyan-400"
            data-testid="beyond-back-home"
          >
            ← Back to thirdrailsystems.ee
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Eyebrow>Whitepaper</Eyebrow>
            <span className="text-xs text-slate-500">Levi Hankins · Founder & CEO</span>
          </div>

          <h2
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="beyond-title"
          >
            {h1}
          </h2>
          {dek && (
            <p
              className="mt-4 text-balance text-lg text-slate-300 sm:text-xl"
              data-testid="beyond-dek"
            >
              {dek}
            </p>
          )}
        </div>

        <article className="prose-invert mt-12" data-testid="beyond-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {body}
          </ReactMarkdown>
        </article>

        {/* Closing CTA — sits after the References section (which is the
            terminal block of the markdown body) and before the imprint
            footer. Styling mirrors the existing bordered-card idiom used
            elsewhere on this page (cf. the corrections/imprint block
            below) rather than introducing a new design language. */}
        <aside
          className="reveal mt-14 rounded-lg border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
          data-testid="beyond-closing-cta"
          aria-labelledby="beyond-closing-cta-heading"
        >
          <h3
            id="beyond-closing-cta-heading"
            className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
          >
            Assess your own exposure
          </h3>
          <p className="mt-4 text-[15.5px] leading-[1.75] text-slate-300">
            <a
              href="https://check.thirdrailsystems.ee/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="beyond-cta-exposure-check-link"
            >
              The Exposure Check
            </a>{" "}
            is twelve questions, five minutes, no data collected.
          </p>
          <p className="mt-3 text-[15.5px] leading-[1.75] text-slate-300">
            For a confidential, no-cost diagnostic, see the{" "}
            <Link
              to="/diagnostic"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="beyond-cta-diagnostic-link"
            >
              diagnostic brief
            </Link>
            .
          </p>
        </aside>

        <div className="reveal mt-16 border-t border-slate-800 pt-10 text-sm text-slate-500">
          <p>
            <em>
              Third Rail Systems OÜ, Tallinn, Estonia. Registry 17488655. This
              whitepaper and all intellectual property described in it are held by
              Third Rail Systems OÜ.
            </em>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/catch-22"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="beyond-link-catch22"
            >
              Read the Catch-22 briefing →
            </Link>
            <Link
              to="/memo"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="beyond-link-memo"
            >
              Read the Strategic Memo →
            </Link>
            <Link
              to="/writing/by-direction"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="beyond-link-by-direction"
            >
              By Direction: the whitepaper's argument applied to AI agents
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
