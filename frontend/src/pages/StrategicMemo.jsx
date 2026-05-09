import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Fingerprint,
  Globe,
  Link as LinkIcon,
  Lock,
  MapPin,
  Scale,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Eyebrow,
  useReveal,
  scrollToId,
  LINKEDIN_ARTICLE_URL,
  LEVI_LINKEDIN_URL,
  linkedinShareUrl,
} from "@/components/landing/shared";

function LinkedInGlyph({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

const MEMO_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/memo`
    : "https://thirdrailsystems.ee/memo";

const track = (event, props = {}) => {
  if (typeof window !== "undefined" && window.posthog) {
    try {
      window.posthog.capture(event, props);
    } catch (_) {
      // swallow analytics failures
    }
  }
};

const TOC = [
  { id: "thesis", label: "I. The Thesis" },
  { id: "catch22", label: "II. The Catch-22" },
  { id: "earned-secrets", label: "III. Earned Secrets" },
  { id: "architecture", label: "IV. The Architecture" },
  { id: "governance", label: "V. Governance Posture" },
  { id: "pilot", label: "VI. The Pilot" },
];

function MemoSection({ id, number, title, children }) {
  return (
    <section
      id={id}
      className="reveal scroll-mt-24 border-t border-slate-900 py-16 first:border-t-0 first:pt-0 sm:py-20"
    >
      <div className="mono text-[11px] uppercase tracking-[0.24em] text-cyan-400">
        {number}
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-slate-300 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function Callout({ icon: Icon, label, children }) {
  return (
    <div className="my-6 flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
          {label}
        </div>
        <div className="mt-1 text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function StrategicMemo() {
  useReveal();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title =
      "The Strategic Memo — Resolving the ISO 31030 Catch-22 · Third Rail Systems OÜ";
    track("memo_viewed");
    return () => {
      document.title = prev;
    };
  }, []);

  // Scroll-depth + completion tracking
  useEffect(() => {
    const milestones = [25, 50, 75];
    const fired = new Set();
    let completedFired = false;

    const onScroll = () => {
      const article = document.getElementById("memo-article-root");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const viewportH = window.innerHeight;
      // How much of the article has scrolled past the viewport top?
      const scrolledPast = Math.max(
        0,
        Math.min(articleHeight, viewportH - rect.top),
      );
      const pct = Math.round((scrolledPast / articleHeight) * 100);

      milestones.forEach((m) => {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track("memo_read_progress", { percent: m });
        }
      });
      if (!completedFired && pct >= 85) {
        completedFired = true;
        track("memo_read_completed");
        try {
          localStorage.setItem("trs.memo_read", "1");
        } catch (_) {
          // ignore storage errors (private mode etc.)
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTocClick = (id) => {
    track("memo_toc_click", { section: id });
    scrollToId(id);
  };

  const handleMemoCta = () => {
    track("memo_cta_click", { location: "bottom" });
    navigate("/#contact");
  };

  const handleShare = async () => {
    track("memo_share_click");
    // Share the published LinkedIn article — boosts the author's post and
    // keeps reshares concentrated rather than scattered across mirrors.
    const shareUrl = linkedinShareUrl(LINKEDIN_ARTICLE_URL);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    track("memo_share_success", { channel: "linkedin" });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(MEMO_URL);
      setCopied(true);
      track("memo_copy_link");
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="memo-root">
      <Navbar onCtaClick={() => navigate("/#contact")} />

      {/* Hero */}
      <header className="relative isolate overflow-hidden pt-32 sm:pt-40" data-testid="memo-header">
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
            data-testid="memo-back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <div className="mt-8">
            <Eyebrow index="MEMO · 2026">Strategic</Eyebrow>
          </div>

          <h1
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="memo-title"
          >
            The Strategic Memo: Resolving the{" "}
            <span className="text-cyan-400">ISO 31030 Catch-22</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            A founding-team paper on why duty-of-care and GDPR collide, and how
            a minimum-disclosure architecture makes that collision obsolete.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 mono uppercase tracking-[0.18em]">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Tallinn, Estonia
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>7-minute read</span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>v1.0 · founding team</span>
          </div>
        </div>
      </header>

      {/* Body + TOC */}
      <div className="relative mx-auto max-w-7xl px-5 pb-28 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Contents
              </div>
              <nav className="mt-4 flex flex-col gap-2" data-testid="memo-toc">
                {TOC.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className="text-left text-sm text-slate-400 hover:text-cyan-400"
                    data-testid={`memo-toc-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Bottom line
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  The enterprise keeps the audit trail. The DPO avoids the
                  data. The traveler keeps their identity.
                </p>
              </div>
            </div>
          </aside>

          <article
            className="lg:col-span-9"
            id="memo-article-root"
            data-testid="memo-article"
          >
            <MemoSection id="thesis" number="I" title="The Thesis">
              <p>
                Institutional safety requires deep visibility. Human privacy
                requires absolute discretion. For two decades, enterprise
                security programs have treated these mandates as a trade-off to
                negotiate. We treat them as a system to engineer.
              </p>
              <p>
                Third Rail Systems OÜ is the minimum-disclosure compliance
                layer for enterprise travel risk. We materially decouple risk
                intelligence from human identity — so that fulfilling your
                duty-of-care obligation toward marginalized employees stops
                being the thing that creates your worst GDPR liability.
              </p>
              <Callout icon={Scale} label="Thesis in one line">
                Institutional safety and human privacy are not in tension —
                they are in the wrong place on the stack. Move identity
                off-device and the tension dissolves.
              </Callout>
            </MemoSection>

            <MemoSection id="catch22" number="II" title="The Catch-22">
              <p>
                ISO 31030 made it unambiguous: organizations must take
                reasonable steps to provide localized mitigations for
                marginalized travelers — LGBTQ+, disabled, neurodivergent, and
                other cohorts whose risk profile diverges sharply from the
                generic average. That is the duty-of-care mandate.
              </p>
              <p>
                GDPR Article 9 made the opposite unambiguous: centrally
                collecting, processing, or inferring demographic identity is a
                special-category data operation that most enterprises are
                structurally unequipped to justify on lawful-basis grounds.
                That is the privacy liability.
              </p>
              <p>
                The result is a compliance catch-22. Programs that honour ISO
                31030 tend to accumulate a toxic, regulated data lake.
                Programs that respect GDPR tend to issue generic-average risk
                dossiers that fail the very people ISO 31030 was written for.
              </p>
              <Callout icon={ShieldAlert} label='The "Shadow HR" failure mode'>
                Well-intentioned teams, blocked by the official stack, end up
                tracking vulnerable travelers on informal spreadsheets. The
                enterprise now carries every risk of the toxic data lake and
                none of its audit-grade protections.
              </Callout>
            </MemoSection>

            <MemoSection id="earned-secrets" number="III" title="Earned Secrets">
              <p>
                Third Rail Systems was founded on earned, not inherited,
                operational truths.
              </p>
              <p>
                Our CEO,{" "}
                <a
                  href={LEVI_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white underline decoration-cyan-500/40 underline-offset-4 hover:decoration-cyan-400"
                  data-testid="memo-levi-linkedin"
                >
                  Levi Hankins
                  <LinkedInGlyph className="h-3.5 w-3.5 text-cyan-400" />
                </a>
                , served 20 years as a US Navy combat veteran and spent a
                meaningful portion of that career under "Don't Ask, Don't
                Tell." He has first-hand, deployed experience of what happens
                when institutional safety systems cannot safely see the people
                they are meant to protect. That is not a case study for us —
                it is the starting point of the company.
              </p>
              <p>
                Our CTO, <span className="text-white">Jeremy Stabile</span>, is
                a Fortune 500 SecOps and GRC architecture expert. He has spent
                years watching enterprise programs buckle under the weight of
                data they should never have centralized in the first place.
              </p>
              <p>
                Our scientific posture is anchored by{" "}
                <span className="text-white">Dr. Sidra Azmat Butt</span> (PhD,
                Information Technology, TalTech), Researcher in the Next Gen
                Digital State Research Group at Tallinn University of
                Technology and our{" "}
                <span className="text-white">Head of Algorithmic Validation</span>.
                She provides independent oversight on EU AI Act conformity,
                GDPR privacy-by-design, and the academic translation of our
                transient-processing architecture. The architecture is not
                only commercially defensible — it is academically inspectable.
              </p>
              <Callout icon={Users} label="Why this matters commercially">
                Enterprises buy from founders who have stood on the other side
                of the problem, and from architectures an independent
                academic is willing to put their name on. Our thesis is not
                borrowed from a pitch deck — it was paid for in career risk
                and in published peer review.
              </Callout>
            </MemoSection>

            <MemoSection id="architecture" number="IV" title="The Architecture">
              <p>
                Our architecture is built on a single contract:{" "}
                <span className="text-white">
                  identity-bearing inputs never leave the traveler's device.
                </span>{" "}
                Everything else follows from that one constraint. Internally
                we call this the{" "}
                <span className="text-white">DReaMAD Protocol</span> — a
                stateless, multi-agent debate engine that processes a
                traveler's traits in transient memory and writes none of
                them to a database.
              </p>

              <div className="my-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Fingerprint className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    On-Device Processing
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    The traveler's profile is encrypted locally.
                    Special-category data never enters your HRIS.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    Stateless Threat Synthesis
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    The system cross-references destinations against local
                    penal codes without centrally logging demographic inputs.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    Inclusion Safety Dossier
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Your Global Travel Risk team receives a sanitized,
                    actionable mitigation plan. You get the audit trail; your
                    DPO avoids the data.
                  </p>
                </div>
              </div>

              <p>
                This is a deliberate inversion of the industry default. Most
                travel-risk platforms collect more identity data to produce
                more specific output. We produce more specific output by
                collecting less identity data — and by refusing to retain any
                of it at the synthesis layer.
              </p>
              <Callout icon={Server} label="Independently evidenced">
                Third Rail Systems OÜ has been evidenced under the{" "}
                <span className="text-white">KTH Royal Institute of
                Technology Innovation Readiness Level (IRL) framework</span>.
                The DReaMAD 8-Agent Debate Engine core logic has been fully
                engineered and validated against a sovereign 30-country risk
                database (ILGA, U.S. State Department, Wheelmap, TGEU) —
                proving the stateless concept functions without persistent
                data storage.
              </Callout>
            </MemoSection>

            <MemoSection id="governance" number="V" title="Governance Posture">
              <p>
                Every architectural decision maps cleanly to a defensible
                compliance artefact.
              </p>
              <Callout icon={Scale} label="GDPR">
                We do not centralize "special-category data." The enterprise
                remains the Controller of standard itineraries; Third Rail
                acts as a Processor.
              </Callout>
              <Callout icon={Server} label="EU AI Act">
                Documented as an assistive decision-support tool with
                mandatory Human-In-The-Loop (HITL) oversight and immutable
                vector logging.
              </Callout>
              <Callout icon={FileText} label="ISO 31030">
                Verifiable, date-stamped evidence that the organization
                assessed intersectional threats prior to deployment.
              </Callout>
              <p>
                Proudly registered in Tallinn, Estonia — ensuring a strict
                European corporate footprint immune to US jurisdictional
                overreach. The Estonia advantage is not branding; it is part
                of the defensive posture.
              </p>
            </MemoSection>

            <MemoSection id="pilot" number="VI" title="The Pilot">
              <p>
                We run paid, time-boxed enterprise pilots — typically 4 to 6
                weeks — that require <span className="text-white">zero API
                integration with your HRIS</span>. That is not a convenience
                feature; it is a statement about the architecture. If our
                system needed your HRIS, we would have already failed the
                thesis.
              </p>
              <p>
                The pilot produces three artefacts: a signed architecture
                fit-assessment, a sample Inclusion Safety Dossier for a live
                destination, and a compliance binder your DPO can actually
                file.
              </p>

              <div className="mt-10 flex flex-col items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    Next step
                  </div>
                  <div className="mt-1 text-sm text-slate-100 sm:text-base">
                    20-minute architecture fit-call. No HRIS integration
                    required.
                  </div>
                </div>
                <Button
                  onClick={handleMemoCta}
                  className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  data-testid="memo-cta-contact"
                >
                  Request Pilot Assessment
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Share to a colleague */}
              <div
                className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="memo-share-card"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Forward
                </div>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white sm:text-base">
                      Email this memo to a colleague
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      Hand it to your DPO, ERG lead, or Global Travel Risk
                      team. Pre-filled subject and pitch.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="h-10 border-slate-700 bg-slate-950/60 px-4 text-slate-100 hover:bg-slate-800 hover:text-white"
                      data-testid="memo-copy-link-button"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-4 w-4 text-cyan-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-1 h-4 w-4" />
                          Copy link
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="btn-glow h-10 bg-cyan-500 px-4 text-slate-950 hover:bg-cyan-400"
                      data-testid="memo-share-button"
                    >
                      <LinkedInGlyph className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-10 text-xs text-slate-500 mono uppercase tracking-[0.2em]">
                <Globe className="mr-2 inline h-3 w-3 text-cyan-400" />
                Third Rail Systems OÜ · Tallinn, Estonia · EU-Native
              </p>
            </MemoSection>
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
