import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Eye,
  FileText,
  Gavel,
  Globe,
  Lock,
  MapPin,
  Network,
  Scale,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Eyebrow,
  useReveal,
  scrollToId,
  CATCH22_READ_STORAGE_KEY,
  LINKEDIN_ARTICLE_URL,
  linkedinShareUrl,
} from "@/components/landing/shared";

// LinkedIn glyph — lucide-react has no LinkedIn icon, so use a tiny inline SVG.
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

const BRIEF_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/catch-22`
    : "https://thirdrailsystems.ee/catch-22";

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
  { id: "hamburg", label: "0. The H&M Case" },
  { id: "fifteen", label: "I. The 15–20% Problem" },
  { id: "pattern", label: "II. The Pattern, Named" },
  { id: "recognize", label: "III. Why I Recognize It" },
  { id: "architecture", label: "IV. The Architectural Answer" },
  { id: "trend", label: "V. The Trend" },
  { id: "ask", label: "VI. What I'm Asking" },
  { id: "sources", label: "Sources & Citations" },
];

function BriefSection({ id, number, title, children }) {
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

function Callout({ icon: Icon, label, children, tone = "cyan" }) {
  const toneClasses =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
      : tone === "danger"
      ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  return (
    <div className="my-6 flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${toneClasses}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
          {label}
        </div>
        <div className="mt-1 text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CatchTwentyTwo() {
  useReveal();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title =
      "The Duty of Care vs. Data Privacy Catch-22 · Third Rail Systems OÜ";
    track("brief_viewed", { brief: "catch-22" });
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
      const article = document.getElementById("brief-article-root");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const viewportH = window.innerHeight;
      const scrolledPast = Math.max(
        0,
        Math.min(articleHeight, viewportH - rect.top),
      );
      const pct = Math.round((scrolledPast / articleHeight) * 100);

      milestones.forEach((m) => {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track("brief_read_progress", { brief: "catch-22", percent: m });
        }
      });
      if (!completedFired && pct >= 85) {
        completedFired = true;
        track("brief_read_completed", { brief: "catch-22" });
        try {
          localStorage.setItem(CATCH22_READ_STORAGE_KEY, "1");
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
    track("brief_toc_click", { brief: "catch-22", section: id });
    scrollToId(id);
  };

  const handleCta = () => {
    track("brief_cta_click", { brief: "catch-22", location: "bottom" });
    navigate("/#contact");
  };

  const handleShare = async () => {
    track("brief_share_click", { brief: "catch-22" });
    // Reshare the LinkedIn article — drives engagement on Levi's published
    // post rather than splitting it between the in-site copy and LinkedIn.
    const shareUrl = linkedinShareUrl(LINKEDIN_ARTICLE_URL);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    track("brief_share_success", { brief: "catch-22", channel: "linkedin" });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(BRIEF_URL);
      setCopied(true);
      track("brief_copy_link", { brief: "catch-22" });
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // ignore
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      data-testid="catch22-root"
    >
      <Navbar onCtaClick={() => navigate("/#contact")} />

      {/* Hero */}
      <header
        className="relative isolate overflow-hidden pt-32 sm:pt-40"
        data-testid="catch22-header"
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
            data-testid="catch22-back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <div className="mt-8">
            <Eyebrow index="ESSAY · 8 MAY 2026">Founder essay</Eyebrow>
          </div>

          <a
            href={LINKEDIN_ARTICLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("brief_linkedin_click", {
                brief: "catch-22",
                location: "hero",
              })
            }
            className="mono mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/15 hover:text-cyan-200"
            data-testid="catch22-linkedin-badge"
          >
            <LinkedInGlyph className="h-3 w-3" />
            Originally published on LinkedIn
          </a>

          <h1
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="catch22-title"
          >
            The Duty of Care vs. Data Privacy{" "}
            <span className="text-cyan-400">Catch-22</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Why we built the cohort-agnostic risk engine we wish had existed
            when we needed it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 mono uppercase tracking-[0.18em]">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Levi Hankins · Founder
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>8 May 2026 · Tallinn</span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>12-minute read</span>
          </div>

          {/* Headline stat strip — three figures pulled from the essay */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3" data-testid="catch22-strip">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Database className="h-3.5 w-3.5" />
                The H&amp;M case
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                €35.3M · 2020
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Hamburg DPA fine for internal special-category dossiers on
                returning employees. The Shadow HR pattern, made visible by a
                configuration error.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Eye className="h-3.5 w-3.5" />
                Disclosure collapse
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                76% don't fully disclose
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Neurodivergent employees — City &amp; Guilds Neurodiversity
                Index. HRC 2026 finds 47.5% of LGBTQ+ adults are less out than
                a year ago.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Gavel className="h-3.5 w-3.5" />
                Enforcement live
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                €355M cumulative
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Employee-data fines across 162 EU enforcement actions through
                March 2025. Uber alone: €290M, July 2024.
              </p>
            </div>
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
              <nav
                className="mt-4 flex flex-col gap-2"
                data-testid="catch22-toc"
              >
                {TOC.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className="text-left text-sm text-slate-400 hover:text-cyan-400"
                    data-testid={`catch22-toc-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Bottom line
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  You cannot violate GDPR Article 9 if you never receive
                  Article 9 data. Stateless synthesis is not aesthetic — it is
                  the only architecture that survives this decade.
                </p>
              </div>
            </div>
          </aside>

          <article
            className="lg:col-span-9"
            id="brief-article-root"
            data-testid="catch22-article"
          >
            <BriefSection id="hamburg" number="0" title="The H&M Case">
              <p>
                In October 2020, the Hamburg Data Protection Authority fined
                H&amp;M <span className="text-white">€35.3&nbsp;million</span>.
              </p>
              <p>
                The violation was not a data breach in the conventional sense.
                There was no external attack, no leaked credentials, no
                ransomware. The breach was internal — managers at H&amp;M's
                Nuremberg service centre had been maintaining what amounted to
                digital dossiers on several hundred employees, stored on a
                network drive, accumulating over five years.
              </p>
              <p>
                The dossiers contained health diagnoses. Religious beliefs.
                Family circumstances. Vacation experiences. The information
                had been collected, in many cases, during well-intentioned
                "Welcome Back Talks" conducted by team leaders after employees
                returned from sick leave or vacation. The data became visible
                to the wider company only because of a configuration error.
              </p>
              <p>
                Hamburg's Commissioner for Data Protection,{" "}
                <span className="text-white">Prof. Dr. Johannes Caspar</span>,
                described what his office found as "a particularly intensive
                encroachment on employees' civil rights." The fine was, at the
                time, the largest GDPR penalty ever issued by a German DPA.
              </p>
              <Callout icon={ShieldAlert} label="What this is really about" tone="warn">
                Almost six years later, every multinational with a
                marginalized-cohort workforce is still running some version of
                the H&amp;M pattern. They just haven't been caught yet — and
                the largest single instance of it is one nobody is talking
                about.
              </Callout>
            </BriefSection>

            <BriefSection id="fifteen" number="I" title="The 15–20% Problem">
              <p>
                Roughly <span className="text-white">15 to 20 percent</span>{" "}
                of the global population is neurodivergent. Autism, ADHD,
                dyslexia, dyspraxia, and related conditions, taken together,
                account for somewhere between one in five and one in seven of
                the people on your payroll. Most multinational employers,
                when pressed, will tell you they have an ERG, a neurodiversity
                hiring programme, or at minimum a stated commitment to
                inclusion.
              </p>
              <p>
                Almost none of them can tell you with any confidence which of
                their employees are neurodivergent. And the reason is not
                architectural humility. It is that the employees themselves
                will not say.
              </p>
              <p>
                The 2024 CIPD <em>Neuroinclusion at Work</em> report found
                that <span className="text-white">31%</span> of neurodivergent
                employees have not told their manager or HR. The 2023 City
                &amp; Guilds Neurodiversity Index found that{" "}
                <span className="text-white">76%</span> chose not to fully
                disclose. The May 2025 Understood.org / Harris Poll survey
                found that <span className="text-white">64%</span> of
                neurodivergent employees worry that disclosure would harm
                them, and <span className="text-white">77%</span> of all
                adults agree that neurodivergent employees feel pressure to
                mask. The U.S. is currently rolling back DEI infrastructure in
                ways that have made disclosure feel even more dangerous than
                it did two years ago. Disclosure rates are not improving.
                They are collapsing.
              </p>
              <p>
                Here is what this means operationally. Every multinational
                employer has a workforce that is 15–20% neurodivergent.
                Roughly half of those employees have not formally disclosed.
                The other half have disclosed partially or informally — to a
                manager, to an ERG, in a survey, in a spreadsheet, in an HRIS
                field that someone in middle management decided to start
                tracking because the duty-of-care framework demanded it.
              </p>
              <Callout icon={Database} label="The Shadow HR problem" tone="danger">
                That spreadsheet is the H&amp;M pattern, replicated at scale,
                across a population three to four times larger than the
                LGBTQ+ workforce I have spent two decades thinking about. It
                is special-category data under GDPR Article 9. It carries up
                to <span className="text-white">€20M or 4% of global turnover</span>{" "}
                in penalties under Article 83. And in most multinationals it
                is operating right now, undetected, in dozens of locations,
                generated by managers trying to do the right thing under a
                duty-of-care framework that gives them no architectural
                alternative.
              </Callout>
            </BriefSection>

            <BriefSection id="pattern" number="II" title="The Pattern, Named">
              <p>
                The pattern is this. Modern duty-of-care frameworks —{" "}
                <span className="text-white">ISO 31030</span> for travel risk,
                CSDDD for corporate sustainability, LkSG before its repeal,
                evolving employer liability under the Equality Act and
                analogous European disability law — all demand that employers
                protect marginalized employees from specific, bespoke,
                identity-aware harms.
              </p>
              <p>
                Modern data protection frameworks —{" "}
                <span className="text-white">GDPR Article 9</span>, the EU AI
                Act, sector-specific regulations on health and disability
                data — all prohibit employers from centrally recording the
                attributes that would let them deliver that protection.
              </p>
              <p>
                These two regimes were authored by different legislators,
                operating on different timescales, optimising for different
                harms. They are both correct, individually. They are
                catastrophically incompatible, together. The result is what I
                have come to call the{" "}
                <span className="text-white">
                  Catch-22 of enterprise duty-of-care
                </span>
                : you cannot discharge your protection obligation without the
                data, and you cannot legally hold the data you need to
                discharge your protection obligation.
              </p>
              <p>
                The legacy travel-risk management industry — International
                SOS, SAP Concur, Crisis24, Everbridge — solved this Catch-22
                by ignoring half of it. They built stateful data brokers that
                accumulated traveler attributes, ran centralised assessments,
                and trusted that the regulatory environment around data
                protection would not catch up. For a while, they were right.
                The H&amp;M fine was the moment they stopped being right.
                The Uber{" "}
                <span className="text-white">€290 million</span> fine in
                July 2024 was the regulator's signal that the enforcement
                environment is now active. The{" "}
                <span className="text-white">€355 million</span> cumulative
                total in European employee-data fines, across{" "}
                <span className="text-white">162 enforcement actions</span>{" "}
                through March 2025, is the trend.
              </p>
              <p>
                Shadow HR is what happens when the regulatory environment
                hardens around an industry that was structurally incapable of
                changing. Managers know they have a duty. They know they
                cannot use the official systems. So they build unofficial
                ones. And every spreadsheet, every network drive, every
                well-intentioned ERG membership list is now a future €35
                million fine waiting for the configuration error that exposes
                it.
              </p>
            </BriefSection>

            <BriefSection
              id="recognize"
              number="III"
              title="Why I Recognize the Pattern"
            >
              <p>
                I spent 20 years in the United States Navy under{" "}
                <span className="text-white">Don't Ask, Don't Tell</span>. For
                18 of those years, my career could have ended at any moment
                based on a rumour. Not a verified incident, not an admission,
                not evidence — a rumour. The burden of proof ran the wrong
                direction, and the policy was less about punishing conduct
                than about punishing any signal of identity that the
                institution decided to investigate.
              </p>
              <p>
                During those two decades I led sailors and Marines into
                hostile environments. I made operational decisions about their
                safety in places where the local legal and cultural threat
                landscape varied dramatically by who they were. I was
                responsible for their lives. And I was operating, the entire
                time, as a person whose own identity could not be formally
                recorded inside the system that was demanding I protect
                theirs.
              </p>
              <p>
                This is what I have come to call the{" "}
                <span className="text-white">dual surveillance problem</span>.
                The institution surveils the people it expects you to
                protect. The institution surveils you. The protection cannot
                happen through the official data architecture, because the
                official data architecture is also the threat. So you learn
                to operate inside the gap. You learn to manage threat risk
                for people whose attributes you cannot formally know, while
                operating as a person whose attributes cannot be formally
                known. You learn that the architecture of protection has to
                be decoupled, fundamentally and structurally, from the
                architecture of identification.
              </p>
              <p>
                I have specific stories about what that taught me — about
                colleagues processed out on false accusations, about Marines
                I led under fire who never knew who their commander actually
                was, about the architectural decisions that get made by
                people who have lived inside the trap. I will share them
                separately over the coming weeks, on LinkedIn, as standalone
                posts. What matters here is what falls out of that
                experience architecturally, when you finally get the chance
                to build the system you wish had existed when you needed it.
              </p>
            </BriefSection>

            <BriefSection
              id="architecture"
              number="IV"
              title="The Architectural Answer"
            >
              <p>
                The platform I am building at Third Rail Systems is called{" "}
                <span className="text-white">ISI — Intersectional Safety
                Intelligence</span>. It is built around three named modules,
                each running an 8-agent adversarial debate across six
                different LLM families to eliminate single-vendor training
                bias on life-safety outputs.
              </p>

              <div className="my-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    TRS-01 · Grandin
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Sensory environments — noise, light, crowd density,
                    visual complexity — calculated as a Sensory Load Index
                    for neurodivergent travelers. IBCCES Certified Autism
                    Center data + Wheelmap accessibility validation.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    TRS-02 · Heumann
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Physical accessibility infrastructure beyond
                    checklist-level — ramps, elevators, restrooms, transit
                    access, surface conditions — using Wheelmap user data and
                    GTFS wheelchair-boarding parsing.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    TRS-03 · Crenshaw
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Seven intersectional dimensions: LGBTQ+ legal status,
                    trans-specific safety, women's gender safety, racialisation
                    and policing, diplomatic ground truth, municipal LGBTQ+
                    protections, and xenophobia indicators.
                  </p>
                </div>
              </div>

              <p>
                The first module is named for{" "}
                <span className="text-white">Temple Grandin</span>. It exists
                because the first instance of the Shadow HR problem I built
                this platform to solve is the neurodivergent workforce, and
                because Temple Grandin spent her career proving that the
                right environmental architecture makes invisible disabilities
                visible without requiring the person carrying them to
                disclose anything.
              </p>
              <p>
                The second module is named for{" "}
                <span className="text-white">Judith Heumann</span>. It exists
                because Judith Heumann taught a generation of disability
                rights advocates that accessibility is not a feature, it is a
                precondition, and that the institutions which fail to deliver
                it are failing a much larger population than they realise.
              </p>
              <p>
                The third module is named for{" "}
                <span className="text-white">Kimberlé Crenshaw</span>. It
                exists because Kimberlé Crenshaw named the problem of
                intersectionality in 1989, and the legacy travel-risk industry
                still does not understand that a Black trans woman in a
                hostile jurisdiction is not facing the sum of two risks but
                the multiplication of several.
              </p>
              <p>
                Beneath all three modules sits a sovereign data layer with
                primary-source provenance — ILGA Rainbow Map, TGEU Trans
                Rights Index and Trans Murder Monitoring, US State Department
                / UK FCDO / Canada GAC diplomatic triangulation, UN Universal
                Periodic Review, ENAR Shadow Reports, EU FRA harassment
                surveys, HRC Municipal Equality Index, OSAC city reports,
                SafetiPin street audits, IBCCES autism certifications,
                Wheelmap accessibility validation. Every datum is traced to a
                primary source with a year. No crowdsourced opinions. No
                training-data stereotypes.{" "}
                <span className="text-white">
                  Thirty countries and thirty cities operational as of May
                  2026
                </span>
                , with full structured ETL coverage.
              </p>

              <Callout icon={Network} label="The architectural insight">
                At no point does the platform receive, store, or transmit the
                traveler's identity attributes. The traveler profile lives on
                the edge device, behind biometric authentication. The
                platform uses{" "}
                <span className="text-white">IETF RFC 9458 Oblivious HTTP</span>{" "}
                to separate IP and SSO authentication from the demographic
                payload at the network layer. The assessment runs against
                destination-side data only. The audit log, retained for EU
                AI Act and ISO 31030 compliance, captures the assessment
                outputs and the agent debate trail — never the demographic
                inputs.
              </Callout>

              <p>
                You cannot violate Article 9 of GDPR if you never receive
                Article 9 data. You cannot expose what you do not retain. The
                Catch-22 is not solved by clever policy. It is solved by an
                architectural decision to refuse the data in the first place,
                while still delivering the safety analysis the duty-of-care
                framework demands.
              </p>
            </BriefSection>

            <BriefSection
              id="trend"
              number="V"
              title="The Trend That Makes This Inevitable"
            >
              <p>
                The Human Rights Campaign's{" "}
                <span className="text-white">2026 Corporate Equality Index</span>{" "}
                documented that <span className="text-white">47.5%</span> of
                LGBTQ+ adults are less out in at least one area of their lives
                than they were 12 months ago. The neurodivergent disclosure
                numbers cited earlier in this piece show the same pattern at
                greater magnitude. Across every marginalized cohort I have
                data on, voluntary disclosure to employers is collapsing.
              </p>
              <p>
                This is structurally fatal for the legacy travel-risk
                management industry. Every centralised-register approach to
                duty-of-care depends on the employee voluntarily telling the
                employer what they are. As that disclosure collapses, the
                centralised models become incapable of delivering the
                protection their entire business case is built on. The pattern
                is the same one we saw in CRM, in identity management, in
                analytics —{" "}
                <span className="text-white">
                  privacy-by-design architectures eventually displace
                  centralised-state architectures
                </span>
                , because the centralised-state architectures cannot survive
                contact with their own operating environment.
              </p>
              <p>
                The companies that will be standing at the end of this decade
                are the ones that figured out how to discharge duty-of-care
                without requiring the disclosure. Stateless synthesis is not
                an aesthetic preference. It is the only architectural pattern
                that survives a contracting-disclosure environment, an
                actively-enforcing regulatory environment, and an insurance
                underwriting cycle that is starting to demand documented ISO
                31030 alignment as a condition of competitive D&amp;O renewal.
              </p>
            </BriefSection>

            <BriefSection id="ask" number="VI" title="What I'm Asking">
              <p>
                I am the founder of{" "}
                <span className="text-white">Third Rail Systems OÜ</span>,
                headquartered in Tallinn, Estonia. We have shipped the
                platform described above.{" "}
                <span className="text-white">
                  KTH Royal Institute of Technology
                </span>{" "}
                in Stockholm validated it at Innovation Readiness Level 4.{" "}
                <span className="text-white">Dr. Sidra Azmat Butt</span> at
                TalTech provides scientific oversight on EU AI Act compliance.
                We are pre-seed, raising{" "}
                <span className="text-white">€400,000 on a SAFE</span>, with a
                Tehnopol DeepTech accelerator grant track in parallel.
              </p>
              <p>
                I am not writing this piece to pitch the platform. I am
                writing it because I have spent six months in conversations
                with CISOs, DPOs, and CHROs at multinational employers, and I
                have not yet met one who, on hearing the H&amp;M case
                described in detail, did not recognise their own organisation
                in it. The Shadow HR problem is hiding in plain sight inside
                virtually every multinational with a diverse workforce. The
                architectural answer exists. Most of the industry has not yet
                figured out that it does.
              </p>
              <p>
                If you are a security or privacy officer at a multinational
                with a marginalized-cohort workforce, and you have ever
                wondered whether your duty-of-care infrastructure could
                survive a Hamburg DPA inspection — I would like to talk to
                you. The conversation is not a sales pitch. It is an
                architectural diagnostic. If the architecture I have described
                maps to a problem you recognise, we should talk about whether
                it maps to a solution you can deploy.
              </p>

              <div className="mt-10 flex flex-col items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    Next step
                  </div>
                  <div className="mt-1 text-sm text-slate-100 sm:text-base">
                    20-minute architecture diagnostic. No HRIS integration
                    required.
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={LINKEDIN_ARTICLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("brief_linkedin_click", {
                        brief: "catch-22",
                        location: "bottom",
                      })
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-700 bg-slate-950/60 px-4 text-sm text-slate-100 transition-colors hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
                    data-testid="catch22-linkedin-button"
                  >
                    <LinkedInGlyph className="h-4 w-4" />
                    Read on LinkedIn
                  </a>
                  <Button
                    onClick={handleCta}
                    className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    data-testid="catch22-cta-contact"
                  >
                    Request Pilot Assessment
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sign-off */}
              <div className="mt-10 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Signed
                </div>
                <div className="mt-2 text-base font-semibold text-white">
                  Levi Hankins
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Founder, Third Rail Systems OÜ · Tallinn, Estonia ·{" "}
                  Twenty years U.S. Navy
                </div>
                <div className="mt-2 text-sm italic text-slate-500">
                  Building the platform I wish had existed when I needed it.
                </div>
              </div>

              {/* Share */}
              <div
                className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="catch22-share-card"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Forward
                </div>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white sm:text-base">
                      Reshare on LinkedIn
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      Boost the published article on Levi's profile — copy
                      the in-site link or share the original LinkedIn post
                      with one click.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="h-10 border-slate-700 bg-slate-950/60 px-4 text-slate-100 hover:bg-slate-800 hover:text-white"
                      data-testid="catch22-copy-link-button"
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
                      data-testid="catch22-share-button"
                    >
                      <LinkedInGlyph className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </BriefSection>

            <BriefSection
              id="sources"
              number="—"
              title="Sources & Citations"
            >
              <ul className="space-y-3 pl-1 text-sm leading-relaxed text-slate-400">
                {[
                  "Hamburg Commissioner for Data Protection and Freedom of Information, press release, 1 October 2020 (H&M Hennes & Mauritz Online Shop AB & Co. KG fine).",
                  "Autoriteit Persoonsgegevens (Dutch Data Protection Authority), Uber fine announcement, July 2024.",
                  "CMS GDPR Enforcement Tracker Report 2025, Employment / Employee Data category.",
                  "CIPD Neuroinclusion at Work Report, February 2024.",
                  "City & Guilds Foundation Neurodiversity Index, 2023–2026 editions.",
                  "Understood.org / Harris Poll Neurodiversity at Work Survey, May 2025.",
                  "Human Rights Campaign Foundation Corporate Equality Index 2026 and \"One Year In\" report.",
                  "CSDDD (Corporate Sustainability Due Diligence Directive), Official Journal of the European Union, 5 July 2024; Omnibus I amendments 24 February 2026.",
                  "GDPR Article 9 and Article 83, Regulation (EU) 2016/679.",
                ].map((cite) => (
                  <li key={cite} className="flex items-start gap-3">
                    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                    <span>{cite}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-10 mono text-xs uppercase tracking-[0.2em] text-slate-500">
                <Scale className="mr-2 inline h-3 w-3 text-cyan-400" />
                Third Rail Systems OÜ · Tallinn, Estonia · EU-Native
              </p>
            </BriefSection>
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
