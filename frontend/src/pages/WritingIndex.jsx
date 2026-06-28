/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Eyebrow } from "@/components/landing/shared";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import { EXPOSURE_SERIES, COMPANION_READING, SERIES_LIVE } from "@/lib/exposureSeries";

const CANONICAL = "https://thirdrailsystems.ee/writing";

/**
 * /writing — the single discovery target for the Exposure trilogy. Renders
 * all three essays in reading order. Published parts get full clickable
 * cards; forthcoming parts get muted cards that read as deliberate editorial
 * cadence rather than missing pages.
 *
 * This page is the destination for the navbar item, footer link, and
 * ProblemSection teaser that get wired on Part One's deploy day (per the
 * Section 8 spec).
 */
export default function WritingIndex() {
  useSEO({
    title: "Writing · Third Rail Systems",
    description:
      "Essays on disclosure, identity and travel risk, and why protection built on disclosure can fail the people most at risk.",
    canonical: CANONICAL,
    // Hide the hub from search engines until at least one essay is live.
    // Visitors with the URL can still reach it; this just prevents premature
    // indexing of a page whose cards are all still "Forthcoming".
    robots: SERIES_LIVE ? undefined : "noindex,nofollow",
  });

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
          name: "Writing",
          item: CANONICAL,
        },
      ],
    },
    "writing-breadcrumb-jsonld",
  );

  // CollectionPage schema makes the index legible to Google as a curated
  // series rather than a generic blog roll. itemListElement lists only the
  // published parts so we don't promise URLs that aren't yet live.
  const publishedItems = EXPOSURE_SERIES.filter((e) => e.published);
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Exposure: a three-part series",
      url: CANONICAL,
      description:
        "Three essays on dependency, accumulation, and minimum disclosure.",
      isPartOf: {
        "@type": "WebSite",
        name: "Third Rail Systems OÜ",
        url: "https://thirdrailsystems.ee/",
      },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: publishedItems.length,
        itemListElement: publishedItems.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: e.canonical,
          name: e.title,
        })),
      },
    },
    "writing-collection-jsonld",
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24 lg:py-32">
        <Eyebrow index="Series">Exposure</Eyebrow>
        <h1
          className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          data-testid="writing-index-title"
        >
          Three essays on who holds the leverage
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          A three-part series on dependency, accumulation, and minimum
          disclosure. Each essay holds on its own, but the argument compounds
          across the three. Read in order.
        </p>

        <ol
          className="mt-14 space-y-5"
          data-testid="writing-index-list"
          aria-label="Reading room: the Exposure series plus companion long-form pieces"
        >
          {EXPOSURE_SERIES.map((essay) => (
            <li key={essay.slug}>
              <EssayCard essay={essay} />
            </li>
          ))}
          {/* Divider — visual separation between the trilogy reading order
              and the always-available companion long-form pieces. Subtle so
              the page still reads as one reading room, not two stacked
              sections. */}
          <li
            aria-hidden="true"
            className="!my-10 flex items-center gap-4"
          >
            <span className="h-px flex-1 bg-slate-800" />
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Also at Third Rail Systems
            </span>
            <span className="h-px flex-1 bg-slate-800" />
          </li>
          {COMPANION_READING.map((c) => (
            <li key={c.slug}>
              <CompanionCard companion={c} />
            </li>
          ))}
        </ol>

        <div className="mt-20 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 text-sm leading-relaxed text-slate-300">
          If anything above describes your organisation's exposure, the
          architectural fix is closer than the policy debate suggests. We
          do confidential 60-minute diagnostics under NDA, with no HRIS
          integration required.{" "}
          <Link
            to="/diagnostic"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Request a diagnostic →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function EssayCard({ essay }) {
  if (essay.published) {
    return (
      <Link
        to={essay.route}
        data-testid={`writing-index-card-${essay.slug}`}
        className="group block rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-cyan-500/50 hover:bg-slate-900/80"
      >
        <CardEyebrow essay={essay} forthcoming={false} />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {essay.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          {essay.lede}
        </p>
        <div className="mt-5 inline-flex items-center text-sm font-medium text-cyan-400 transition-transform group-hover:translate-x-0.5">
          Read the essay
          <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </Link>
    );
  }

  // Forthcoming: muted, no link. Frames the gap as deliberate cadence, not
  // a missing page. Keeps the index complete-looking through the rollout.
  return (
    <div
      data-testid={`writing-index-card-${essay.slug}`}
      data-published="false"
      className="rounded-lg border border-dashed border-slate-800/80 bg-slate-900/30 p-6"
      aria-disabled="true"
    >
      <CardEyebrow essay={essay} forthcoming={true} />
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-500 sm:text-3xl">
        {essay.title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
        {essay.lede}
      </p>
      <div className="mt-5 mono inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-slate-600">
        Forthcoming in this series
      </div>
    </div>
  );
}

function CardEyebrow({ essay, forthcoming }) {
  const labelColor = forthcoming ? "text-slate-600" : "text-cyan-300";
  return (
    <div
      className={`mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.22em] ${labelColor}`}
    >
      <span>Part {essay.part}</span>
      <span aria-hidden="true">·</span>
      <span>{essay.lens}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center">
        <Clock className="mr-1 h-3 w-3" />
        {essay.readTimeMinutes} min read
      </span>
    </div>
  );
}

/**
 * Companion-card variant for the always-live long-form pieces (Memo,
 * Catch-22). Same visual treatment as a published essay card so /writing
 * reads as one reading room, but the eyebrow drops the "Part X" label and
 * uses the companion's `tag` instead.
 */
function CompanionCard({ companion }) {
  return (
    <Link
      to={companion.route}
      data-testid={`writing-index-card-${companion.slug}`}
      data-companion="true"
      className="group block rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-cyan-500/50 hover:bg-slate-900/80"
    >
      <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300">
        <span>{companion.tag}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          {companion.readTimeMinutes} min read
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {companion.title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
        {companion.lede}
      </p>
      <div className="mt-5 inline-flex items-center text-sm font-medium text-cyan-400 transition-transform group-hover:translate-x-0.5">
        Open
        <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </Link>
  );
}
