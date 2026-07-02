import { Children, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Link } from "react-router-dom";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import { Eyebrow, useReveal } from "@/components/landing/shared";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import sourcesMarkdown from "@/content/beyond-disclosure/sources.md";

const CANONICAL = "https://thirdrailsystems.ee/beyond-disclosure/sources";
const OG_IMAGE = "https://thirdrailsystems.ee/og/beyond-disclosure.png";
const PUBLISH_DATE = "2026-07-01";
const META_DESCRIPTION =
  "Forty verified claims across four research modules supporting the Beyond Disclosure whitepaper. Primary sources, exact quotations, credibility assessments, and documented corrections. Verified June 2026.";

/**
 * Strip the first `# Heading` line from the markdown so we can render it as
 * the visible page title separately (styled to match /beyond-disclosure)
 * while keeping the required H1 in the semantic layer via <SEOHeading>.
 */
function extractBody(md) {
  const lines = md.split("\n");
  const idx = lines.findIndex((l) => l.startsWith("# "));
  if (idx === -1) return md;
  return lines.slice(idx + 1).join("\n").replace(/^\s+/, "");
}

/**
 * Convert `{#anchor-id}` suffixes on markdown headings into real HTML `id=`
 * attributes on the emitted heading tags. remark-gfm does not include the
 * `attrs` extension, so we do a light preprocess to inject inline HTML that
 * rehype-raw then renders as-is. This mirrors what markdown-it-attrs does
 * on the postbuild side, keeping React runtime + prerender in sync on the
 * 44 deep-link anchors (10 claims × 4 libraries + 4 library heads).
 */
function preprocessAnchors(md) {
  return md.replace(
    /^(#{2,6})\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/gm,
    (_, hashes, text, id) => `${hashes} <span id="${id}">${text.trim()}</span>`,
  );
}

/**
 * Walk the ReactMarkdown children tree for the first descendant `<span>`
 * that carries an `id` attribute — that's the anchor id emitted by
 * preprocessAnchors() for `{#anchor-id}` suffixes on the source markdown
 * heading. Non-recursive by design: the wrapper span is always the
 * outermost child of the heading element.
 */
function extractAnchorId(children) {
  const arr = Children.toArray(children);
  for (const child of arr) {
    if (child && typeof child === "object" && child.props && child.props.id) {
      return child.props.id;
    }
  }
  return null;
}

/**
 * Small clipboard button rendered next to each claim H3 on the citation
 * library. Copies the fully-qualified anchor URL (origin + pathname +
 * "#" + id) so researchers can cite an individual claim by its stable
 * anchor. Client-side only — the postbuild prerender emits the raw H3
 * without this button, so non-JS crawlers still see clean heading HTML.
 */
function CopyClaimButton({ anchorId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Older browsers: fall back to a hidden textarea + execCommand.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      // Keep the URL current in the address bar so a subsequent share
      // (right-click "Copy link", browser share menu) resolves to the same
      // anchor without a page jump.
      window.history.replaceState(null, "", `#${anchorId}`);
      setCopied(true);
      toast.success("Citation link copied", {
        description: `#${anchorId}`,
      });
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      toast.error("Could not copy citation link");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy citation link for ${anchorId}`}
      title="Copy citation link"
      data-testid={`copy-claim-${anchorId}`}
      className="ml-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 align-middle"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

const markdownComponents = {
  h1: () => null,
  h2: ({ node, ...props }) => (
    <h2
      className="mt-14 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
      {...props}
    />
  ),
  h3: ({ node, children, ...props }) => {
    const anchorId = extractAnchorId(children);
    return (
      <h3
        className="group mt-10 flex scroll-mt-28 items-baseline text-lg font-semibold tracking-tight text-white sm:text-xl"
        {...props}
      >
        <span className="flex-1">{children}</span>
        {anchorId ? <CopyClaimButton anchorId={anchorId} /> : null}
      </h3>
    );
  },
  h4: ({ node, ...props }) => (
    <h4
      className="mt-8 text-base font-semibold tracking-tight text-slate-100"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-4 text-[15.5px] leading-[1.75] text-slate-300" {...props} />
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
    <ul className="mt-4 list-disc pl-6 text-[15.5px] leading-[1.75] text-slate-300" {...props} />
  ),
  li: ({ node, ...props }) => <li className="mt-2" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mt-6 border-l-2 border-cyan-400/60 pl-5 italic text-slate-200"
      {...props}
    />
  ),
};

const H1_TEXT = "Beyond Disclosure: Source List and Citation Library";

export default function SourcesLibrary() {
  useReveal();

  useSEO({
    title: `${H1_TEXT} · Third Rail Systems`,
    description: META_DESCRIPTION,
    canonical: CANONICAL,
    ogType: "article",
    ogImage: OG_IMAGE,
  });

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: H1_TEXT,
      description: META_DESCRIPTION,
      url: CANONICAL,
      creator: { "@type": "Person", name: "Levi Hankins" },
      publisher: { "@type": "Organization", name: "Third Rail Systems OÜ" },
      isBasedOn: "https://thirdrailsystems.ee/beyond-disclosure",
      dateModified: PUBLISH_DATE,
      inLanguage: "en-GB",
      license: "https://thirdrailsystems.ee/legal/terms",
      keywords: [
        "LGBTQ+ travel safety",
        "sensory and neuro-safety",
        "disability and mobility",
        "intersectional risk",
        "GDPR Article 9",
        "ISO 31030",
      ],
    },
    "sources-library-dataset",
  );

  useEffect(() => {
    // Deep-link support: if the URL has a hash (e.g. #heumann-claim-3),
    // scroll to it after React has rendered the body. scroll-mt-28 on H3s
    // provides fixed-header offset.
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, []);

  const body = preprocessAnchors(extractBody(sourcesMarkdown));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="sources-root">
      <SEOHeading>{H1_TEXT}</SEOHeading>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pb-28 pt-20 sm:px-8">
        <div className="reveal">
          <Link
            to="/beyond-disclosure"
            className="text-xs uppercase tracking-[0.25em] text-slate-500 hover:text-cyan-400"
            data-testid="sources-back-whitepaper"
          >
            ← Back to the Beyond Disclosure whitepaper
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Eyebrow>Citation Library</Eyebrow>
            <span className="text-xs text-slate-500">Verified June 2026</span>
          </div>

          <h2
            className="mt-6 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="sources-title"
          >
            {H1_TEXT}
          </h2>
        </div>

        <section className="reveal mt-10 rounded-lg border border-slate-800 bg-slate-900/40 p-5 text-[15px] leading-[1.7] text-slate-300">
          <p>
            This page is the full source list and citation library for the
            <Link to="/beyond-disclosure" className="mx-1 text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400">
              Beyond Disclosure
            </Link>
            whitepaper. Forty verified claims across four research modules,
            each with the primary source, the exact quotation on which the
            whitepaper relies, and a documented credibility assessment.
            Corrections applied during verification are preserved on the
            claim they amend.
          </p>
        </section>

        <section className="reveal mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-5 text-[15px] leading-[1.7] text-slate-300">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
            How to cite this library
          </h3>
          <p className="mt-3">
            Cite individual claims by their stable anchor ID. Example:
            <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-[13px] text-cyan-300">
              thirdrailsystems.ee/beyond-disclosure/sources#heumann-claim-3
            </code>
            resolves to that specific claim. Claim IDs use the pattern
            <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-[13px] text-cyan-300">
              module-claim-N
            </code>
            where <em>module</em> is one of <em>lgbtq</em>, <em>grandin</em>,
            <em> heumann</em>, or <em>crenshaw</em>, and <em>N</em> is 1–10.
            Library section headings use <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-[13px] text-cyan-300">library-1</code> through <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-[13px] text-cyan-300">library-4</code>.
          </p>
        </section>

        <nav
          className="reveal mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-5 text-[15px] leading-[1.7]"
          aria-label="Table of contents"
          data-testid="sources-toc"
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
            Contents
          </h3>
          <ol className="mt-3 list-decimal space-y-1 pl-6 text-slate-300">
            <li>
              <a href="#library-1" className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4">
                LGBTQ+ Travel Safety Module
              </a>
            </li>
            <li>
              <a href="#library-2" className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4">
                Grandin Module (Sensory and Neuro-Safety)
              </a>
            </li>
            <li>
              <a href="#library-3" className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4">
                Heumann Module (Mobility and Disability)
              </a>
            </li>
            <li>
              <a href="#library-4" className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4">
                Crenshaw Module (Intersectional Risk Synthesis)
              </a>
            </li>
          </ol>
        </nav>

        <article
          className="prose-invert reveal mt-12"
          data-testid="sources-body"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {body}
          </ReactMarkdown>
        </article>

        <section
          className="reveal mt-16 rounded-lg border border-slate-800 bg-slate-900/40 p-5 text-[15px] leading-[1.7] text-slate-300"
          data-testid="sources-corrections"
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
            Corrections policy
          </h3>
          <p className="mt-3">
            When verification identifies an error, the correction is
            documented on the claim it amends. The original wording is not
            silently rewritten. Where a claim is retained subject to a
            constraint on how it may be used, that constraint is published
            alongside the claim as a <em>Usage caveat</em>. See Heumann Claim 3
            for a worked example.
          </p>
        </section>

        <div className="reveal mt-16 border-t border-slate-800 pt-10 text-sm text-slate-500">
          <p>
            <em>
              Third Rail Systems OÜ, Tallinn, Estonia. Registry 17488655. This
              library and the whitepaper it supports are held by Third Rail
              Systems OÜ.
            </em>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/beyond-disclosure"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="sources-link-whitepaper"
            >
              Back to the whitepaper →
            </Link>
            <Link
              to="/writing"
              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
              data-testid="sources-link-writing"
            >
              More writing →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
