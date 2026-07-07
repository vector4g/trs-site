import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import EssayLayout from "@/components/brief/EssayLayout";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import byDirectionMarkdown from "@/content/writing/by-direction.md";

const CANONICAL = "https://thirdrailsystems.ee/writing/by-direction";
const OG_IMAGE = "https://thirdrailsystems.ee/og/by-direction.png";
const TITLE_TAG =
  "By Direction: The Agent Needs a Mandate, Not Your Identity · Third Rail Systems";
const META_DESCRIPTION =
  "Who authorised the act, within what scope, and who answers for it. That was always the question, and it has an old answer.";

// Full H1 as authored in the markdown source. Preserved verbatim.
const H1 = "By Direction: The Agent Needs a Mandate, Not Your Identity";
const DEK =
  "Who authorised the act, within what scope, and who answers for it. That was always the question, and it has an old answer.";

// Section anchors — derived from the markdown h2 headings, in reading
// order. Keep in sync if section order in the source markdown ever
// changes. IDs match slugified section titles so #anchor deep-links work.
const TOC = [
  { id: "identity-reflex", label: "The identity reflex" },
  { id: "claim-not-credential", label: "A claim is not a credential" },
  { id: "mandate-privacy-boundary", label: "The mandate is also the privacy boundary" },
  { id: "alibi", label: "The alibi" },
  { id: "honest-limit", label: "The honest limit" },
  { id: "what-to-build", label: "What to build, whatever we call it" },
];

// Ordered list of section slugs; used to attach stable ids to the
// ReactMarkdown-rendered h2 elements without maintaining a separate map.
const SECTION_SLUGS = TOC.map((t) => t.id);

/**
 * Splits the essay markdown into (a) the body before the "Sources and
 * companions" block and (b) the trailing bulleted source list. The
 * "Sources and companions" block is rendered as a visually distinct
 * bordered card at the end (see below) rather than inline so it reads
 * as a references section.
 */
function splitSources(md) {
  // Drop the first H1 line — we render the H1 via EssayLayout.
  const lines = md.split("\n");
  const firstH1Idx = lines.findIndex((l) => l.startsWith("# "));
  const withoutH1 = firstH1Idx === -1 ? md : lines.slice(firstH1Idx + 1).join("\n");
  // Also drop the leading blockquote (which we already surface as the dek).
  const trimmed = withoutH1
    .split("\n")
    .filter((l, i, arr) => {
      // Remove the first non-empty run of `>` lines and the blank line
      // immediately following, so the blockquote appears exactly once
      // (as the dek), not twice.
      if (l.startsWith("> ")) return false;
      return true;
    })
    .join("\n")
    .replace(/^\s+/, "");

  // Separator: markdown "---" followed by the bold "Sources and companions"
  // heading terminates the essay body.
  const marker = /\n---\s*\n\s*\*\*Sources and companions\*\*\s*\n/;
  const match = trimmed.match(marker);
  if (!match) return { body: trimmed, sources: "" };
  const cut = trimmed.indexOf(match[0]);
  const body = trimmed.slice(0, cut).trimEnd();
  const sources = trimmed.slice(cut + match[0].length).trim();
  return { body, sources };
}

// Convert `[label](url)` inside a paragraph or list-item into React
// anchor elements consistent with the rest of the site: cyan accent,
// external URLs open in a new tab with rel="noopener noreferrer".
function isExternal(href) {
  return /^https?:\/\//i.test(href) && !/^https?:\/\/([^/]+\.)?thirdrailsystems\.ee/i.test(href);
}

// Track h2 index across the render so each heading gets the correct
// stable id from SECTION_SLUGS. ReactMarkdown does not currently expose
// heading position to component overrides, so a module-scoped counter
// (reset per render via a closure factory) is the cleanest option.
function makeBodyComponents() {
  let h2Index = 0;
  return {
    // The markdown source no longer contains an H1 (we stripped it in
    // splitSources) — belt-and-braces suppression anyway.
    h1: () => null,
    h2: ({ node, children, ...props }) => {
      const id = SECTION_SLUGS[h2Index] || undefined;
      h2Index += 1;
      return (
        <h2
          id={id}
          className="scroll-mt-24 mt-14 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ node, ...props }) => (
      <h3
        className="mt-10 text-xl font-semibold tracking-tight text-white sm:text-2xl"
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        className="mt-5 text-[15px] leading-relaxed text-slate-300 sm:text-base"
        {...props}
      />
    ),
    em: ({ node, ...props }) => <em className="italic text-slate-200" {...props} />,
    strong: ({ node, ...props }) => (
      <strong className="font-semibold text-white" {...props} />
    ),
    hr: () => <hr className="mt-14 border-slate-800" />,
    a: ({ node, href, children, ...props }) => {
      const external = href && isExternal(href);
      return (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul: ({ node, ...props }) => (
      <ul
        className="mt-5 list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-slate-300 sm:text-base"
        {...props}
      />
    ),
    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="mt-6 border-l-2 border-cyan-400/60 pl-5 italic text-slate-200"
        {...props}
      />
    ),
  };
}

// Separate component map for the Sources block — same anchor treatment
// as the body but with the tighter list styling appropriate to a
// references card.
const sourcesMarkdownComponents = {
  p: ({ node, ...props }) => (
    <p
      className="mt-4 text-[14.5px] leading-relaxed text-slate-300"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="mt-4 list-disc space-y-3 pl-6 text-[14.5px] leading-relaxed text-slate-300"
      {...props}
    />
  ),
  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
  em: ({ node, ...props }) => <em className="italic text-slate-200" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  a: ({ node, href, children, ...props }) => {
    const external = href && isExternal(href);
    return (
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export default function ByDirection() {
  useSEO({
    title: TITLE_TAG,
    description: META_DESCRIPTION,
    canonical: CANONICAL,
    ogType: "article",
    ogImage: OG_IMAGE,
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
        logo: { "@type": "ImageObject", url: "https://thirdrailsystems.ee/og.png" },
      },
      datePublished: "2026-07-07",
      mainEntityOfPage: CANONICAL,
      image: OG_IMAGE,
      inLanguage: "en-GB",
    },
    "by-direction-article-jsonld",
  );

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://thirdrailsystems.ee/" },
        { "@type": "ListItem", position: 2, name: "Writing", item: "https://thirdrailsystems.ee/writing" },
        { "@type": "ListItem", position: 3, name: "By Direction", item: CANONICAL },
      ],
    },
    "by-direction-breadcrumb-jsonld",
  );

  const { body, sources } = splitSources(byDirectionMarkdown);
  const bodyComponents = makeBodyComponents();

  return (
    <EssayLayout
      canonical={CANONICAL}
      eyebrow="Essay"
      title={H1}
      seoH1={H1}
      lede={DEK}
      backLinks={[]}
      toc={TOC}
      eventKey="by-direction"
      readStorageKey={null}
      shareTitle={TITLE_TAG}
      footerCta={null}
    >
      <div
        className="mt-12"
        data-testid="essay-by-direction-body"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
          {body}
        </ReactMarkdown>
      </div>

      {sources && (
        <aside
          className="mt-16 rounded-lg border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
          aria-labelledby="sources-and-companions-heading"
          data-testid="essay-by-direction-sources"
        >
          <h3
            id="sources-and-companions-heading"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100"
          >
            Sources and companions
          </h3>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={sourcesMarkdownComponents}
          >
            {sources}
          </ReactMarkdown>
        </aside>
      )}
    </EssayLayout>
  );
}
