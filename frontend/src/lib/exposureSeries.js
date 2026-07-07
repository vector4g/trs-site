/**
 * Exposure trilogy — single source of truth for the /writing index page and
 * any future series-aware surface (homepage teaser, footer, etc.).
 *
 * Staggered-rollout contract:
 *   - `published: false` → the /writing index renders a muted "Forthcoming"
 *     card with NO link (still no 404 because the essay route itself is
 *     reachable by anyone with the URL, but the public discovery surface
 *     treats it as not-yet-released).
 *   - `published: true` → the /writing index renders a clickable card.
 *
 * To go live with a part on its scheduled deploy day, flip its `published`
 * flag to `true` (one-line change), commit, redeploy. The spec calls for
 * Part One on Drew's cue, then ~1 week intervals for Parts Two and Three.
 *
 * `publishedAt` is the date that lands in the visible card metadata once
 * `published` is true. Set at deploy time per part.
 *
 * `lens` is the short tag the spec calls out ("data / platform / human")
 * and matches the series-locator line at the top of each .md source.
 */

export const EXPOSURE_SERIES = [
  {
    slug: "nothing-happened",
    part: "One",
    partOrdinal: 1,
    title: "Nothing happened, and that was the point",
    lede:
      "Y2K was a fix delivered on time. Harvest-now-decrypt-later puts encryption in the same shape of problem. The durable answer is collecting less.",
    lens: "data lens",
    readTimeMinutes: 5,
    canonical: "https://thirdrailsystems.ee/writing/nothing-happened",
    route: "/writing/nothing-happened",
    published: true,
    publishedAt: "2026-06-26",
  },
  {
    slug: "the-switch",
    part: "Two",
    partOrdinal: 2,
    title: "The Switch Someone Else Holds",
    lede:
      "When one government can disable a frontier model worldwide overnight, dependency itself is the vulnerability. Sovereignty is architectural, not geographic.",
    lens: "platform lens",
    readTimeMinutes: 6,
    canonical: "https://thirdrailsystems.ee/writing/the-switch",
    route: "/writing/the-switch",
    published: true,
    publishedAt: "2026-06-26",
  },
  {
    slug: "exposure-is-not-democratic",
    part: "Three",
    partOrdinal: 3,
    title: "Exposure Is Not Democratic",
    lede:
      "Collected data lands hardest on the most exposed. How duty of care under ISO 31030 collides with GDPR Article 9, and why minimum disclosure is the resolution.",
    lens: "human lens",
    readTimeMinutes: 6,
    canonical:
      "https://thirdrailsystems.ee/writing/exposure-is-not-democratic",
    route: "/writing/exposure-is-not-democratic",
    published: true,
    publishedAt: "2026-06-26",
  },
];

/**
 * SERIES_LIVE is the single boolean every discoverability surface gates on.
 * Computed from the trilogy config so flipping a `published` flag in one
 * place activates the navbar item swap, the ProblemSection teaser, the
 * footer link, and the /writing hub's CollectionPage JSON-LD in lockstep.
 *
 * Set to `true` automatically the moment ANY essay flips to published.
 * No separate global switch to forget about.
 */
export const SERIES_LIVE = EXPOSURE_SERIES.some((e) => e.published);

/** Lookup helper: pull the trilogy config row for a given slug, or null. */
export function essayBySlug(slug) {
  return EXPOSURE_SERIES.find((e) => e.slug === slug) || null;
}

/**
 * Per-essay robots directive. Held (unpublished) essays return
 * "noindex,nofollow" so search engines don't index them via accidental
 * backlinks during the review period. Published essays return undefined,
 * which leaves the default index,follow behaviour in place.
 */
export function essayRobots(slug) {
  const e = essayBySlug(slug);
  if (!e) return undefined;
  return e.published ? undefined : "noindex,nofollow";
}

/**
 * Companion reading rendered alongside the trilogy on the /writing hub.
 * These are the already-live long-form pieces on the site (the Strategic
 * Memo and the Shadow HR Liability Brief). They're always shown — the
 * `published` gating only applies to the trilogy. Same card treatment as
 * the essay cards so /writing reads as one curated reading room.
 *
 * NOTE: keep `kind: "companion"` on these so the card renderer can tweak
 * the eyebrow label (no "Part X", different tag).
 */
/**
 * Standalone essays — long-form pieces outside the Exposure trilogy.
 * Rendered at the TOP of the /writing index (newest first), ahead of the
 * trilogy's reading order. Same card treatment as a published essay card;
 * the eyebrow swaps "Part X · lens" for the tag and publish date.
 */
export const STANDALONE_ESSAYS = [
  {
    kind: "standalone",
    slug: "by-direction",
    tag: "Essay",
    title: "By Direction: The Agent Needs a Mandate, Not Your Identity",
    lede:
      "Who authorised the act, within what scope, and who answers for it. That was always the question, and it has an old answer.",
    readTimeMinutes: 12,
    route: "/writing/by-direction",
    canonical: "https://thirdrailsystems.ee/writing/by-direction",
    published: true,
    publishedAt: "2026-07-07",
    publishedAtLabel: "7 July 2026",
  },
];

export const COMPANION_READING = [
  {
    kind: "companion",
    slug: "memo",
    tag: "Operational thesis",
    title: "The Strategic Memo",
    lede:
      "The founder's long-form memo on minimum-disclosure compliance architecture, KTH IRL 5 validation, and why the EU's catch-22 is solvable from Tallinn.",
    readTimeMinutes: 12,
    route: "/memo",
    canonical: "https://thirdrailsystems.ee/memo",
  },
  {
    kind: "companion",
    slug: "catch-22",
    tag: "Analytical brief",
    title: "The Shadow HR Liability Brief",
    lede:
      "Why multinationals with diverse workforces are sitting on the next €35M GDPR fine, and the architectural pattern that resolves it. v1.1.",
    readTimeMinutes: 18,
    route: "/catch-22",
    canonical: "https://thirdrailsystems.ee/catch-22",
  },
  {
    kind: "companion",
    slug: "beyond-disclosure",
    tag: "Whitepaper",
    title: "Beyond Disclosure",
    lede:
      "The founder's whitepaper on why disclosure-based protection fails marginalised populations, and the four architectural principles that resolve it.",
    readTimeMinutes: 22,
    route: "/beyond-disclosure",
    canonical: "https://thirdrailsystems.ee/beyond-disclosure",
  },
];
