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
    published: false,
    publishedAt: null,
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
    published: false,
    publishedAt: null,
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
    published: false,
    publishedAt: null,
  },
];
