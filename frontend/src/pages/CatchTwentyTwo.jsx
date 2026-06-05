import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Download,
  Eye,
  Gavel,
  Link as LinkIcon,
  Layers,
  MapPin,
  Network,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LogoMark from "@/components/landing/LogoMark";
import {
  Eyebrow,
  useReveal,
  scrollToId,
  CATCH22_READ_STORAGE_KEY,
  LINKEDIN_ARTICLE_URL,
  linkedinShareUrl,
  openExternal,
} from "@/components/landing/shared";
import {
  BriefSection,
  SubHeading,
  BulletList,
  PullQuote,
  Callout,
  DiagnosticQuestion,
} from "@/components/brief";

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
  { id: "summary", label: "Executive Summary" },
  { id: "precedent", label: "I. The H&M Precedent" },
  { id: "pattern", label: "II. Shadow HR, Named" },
  { id: "disclosure", label: "III. Disclosure-Collapse Multiplier" },
  { id: "enforcement", label: "IV. Enforcement Trajectory" },
  { id: "architecture", label: "V. Architectural Resolution" },
  { id: "questions", label: "VI. Five Diagnostic Questions" },
  { id: "diagnostic", label: "Request a Diagnostic" },
  { id: "sources", label: "Sources & Citations" },
];

export default function CatchTwentyTwo() {
  useReveal();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [pdfState, setPdfState] = useState("idle"); // idle | loading | done | error

  // Print-mode toggle — Playwright fetches /catch-22?print=1 to strip the
  // chrome out of the page before printing to PDF.
  const isPrint = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("print") === "1";
  }, [location.search]);

  // Tag <body> so the print-mode CSS rules in index.css can activate.
  useEffect(() => {
    if (isPrint) {
      document.body.classList.add("trs-print-mode");
      return () => document.body.classList.remove("trs-print-mode");
    }
  }, [isPrint]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title =
      "The Shadow HR Liability · Analytical Brief · Third Rail Systems OÜ";
    if (!isPrint) {
      track("brief_viewed", { brief: "catch-22" });
    }
    return () => {
      document.title = prev;
    };
  }, [isPrint]);

  // Scroll-depth + completion tracking. Mounts (re-)attaches the scroll
  // listener whenever `isPrint` flips so headless renders never log fake
  // engagement signals.
  useEffect(() => {
    if (isPrint) return; // no telemetry from headless renders
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
        } catch (err) {
          // Private mode / storage disabled — analytics flag is best-effort.
          console.debug("[CatchTwentyTwo] catch22_read persist failed:", err?.message);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // CATCH22_READ_STORAGE_KEY is a module constant; track is module-level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrint]);

  const handleTocClick = (id) => {
    track("brief_toc_click", { brief: "catch-22", section: id });
    scrollToId(id);
  };

  const handleCta = () => {
    track("brief_cta_click", { brief: "catch-22", location: "bottom" });
    navigate("/diagnostic");
  };

  const handleShare = async () => {
    track("brief_share_click", { brief: "catch-22" });
    const shareUrl = linkedinShareUrl(LINKEDIN_ARTICLE_URL);
    try {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (_) {
      window.location.assign(shareUrl);
    }
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

  const handlePdfDownload = async () => {
    if (pdfState === "loading") return;
    setPdfState("loading");
    track("brief_pdf_download_click", { brief: "catch-22" });
    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL;
      const resp = await fetch(`${apiBase}/api/public/briefs/shadow-hr.pdf`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "TRS_Shadow_HR_Liability_Brief_v1.1.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Give the browser a beat to start the download before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setPdfState("done");
      track("brief_pdf_download_success", { brief: "catch-22" });
      setTimeout(() => setPdfState("idle"), 2200);
    } catch (err) {
      setPdfState("error");
      track("brief_pdf_download_error", {
        brief: "catch-22",
        message: String(err?.message || err),
      });
      setTimeout(() => setPdfState("idle"), 3500);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      data-testid="catch22-root"
    >
      {!isPrint && <Navbar onCtaClick={() => navigate("/#contact")} />}

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
            <Eyebrow index="MAY 2026 · v1.1">Analytical Brief</Eyebrow>
          </div>

          <a
            href={LINKEDIN_ARTICLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              track("brief_linkedin_click", {
                brief: "catch-22",
                location: "hero",
              });
              openExternal(LINKEDIN_ARTICLE_URL)(e);
            }}
            className="mono mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/15 hover:text-cyan-200"
            data-testid="catch22-linkedin-badge"
          >
            <LinkedInGlyph className="h-3 w-3" />
            Companion essay on LinkedIn
          </a>

          <h1
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="catch22-title"
          >
            The Shadow HR{" "}
            <span className="text-cyan-400">Liability</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Why every multinational with a diverse workforce is sitting on the
            next €35 million GDPR fine, and the architectural pattern that
            resolves it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 mono uppercase tracking-[0.18em]">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Third Rail Systems OÜ · Tallinn
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>8-minute read</span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>v1.1 · May 2026</span>
          </div>

          {/* Headline stat strip */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3" data-testid="catch22-strip">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Database className="h-3.5 w-3.5" />
                Hamburg precedent
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                €35.3M · Oct 2020
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Hamburg DPA fine against H&amp;M for internal special-category
                accumulation. Five years of Welcome Back Talks, exposed by a
                five-hour configuration error.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Eye className="h-3.5 w-3.5" />
                Disclosure collapse
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                76% do not fully disclose
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Neurodivergent employees, per the City &amp; Guilds
                Neurodiversity Index 2023. HRC 2026: 47.5% of LGBTQ+ adults
                less out than a year ago.
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
                Employee-data category alone, across 162 EU enforcement
                actions through March 2025. Uber: €290M, July 2024.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body + TOC */}
      <div className="relative mx-auto max-w-7xl px-5 pb-28 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3" data-trs-print-hide>
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
                  Minimum-disclosure stateless synthesis is the only
                  architecture that survives both the duty-of-care obligation
                  and the data-protection prohibition simultaneously.
                </p>
              </div>
            </div>
          </aside>

          <article
            className={isPrint ? "lg:col-span-12" : "lg:col-span-9"}
            id="brief-article-root"
            data-testid="catch22-article"
          >
            <BriefSection id="summary" number="—" title="Executive Summary">
              <p>
                In October 2020, the Hamburg Data Protection Authority fined
                H&amp;M <span className="text-white">€35.3&nbsp;million</span>{" "}
                for a violation that involved no external attack, no data
                breach in the conventional sense, and no malicious actor.
                The breach was structural. Middle managers had been quietly
                accumulating digital dossiers on their employees, covering
                health information, religious beliefs, and family
                circumstances, over five years, stored on an internal network
                drive and generated through well-intentioned manager
                conversations. The data became visible to the wider company
                only because of a configuration error.
              </p>
              <p>
                This document argues that the H&amp;M case is not an outlier.
                It is the visible instance of a structural pattern that is
                present in virtually every multinational employer with a
                marginalized-cohort workforce, that has grown larger and more
                concentrated since 2020, and that is now operating inside a
                regulatory environment actively configured to find and
                penalize it. The pattern is called{" "}
                <span className="text-white">Shadow HR</span>. The exposure
                is calculated against the full marginalized population, not
                the disclosed subset.
              </p>
              <p>
                The architectural pattern that resolves it,{" "}
                <span className="text-white">
                  minimum-disclosure stateless synthesis
                </span>
                , is the only approach that survives both the duty-of-care
                obligation and the data-protection prohibition simultaneously.
                Five operational diagnostic questions appear at the close. A
                General Counsel, Chief Privacy Officer, or Chief Security
                Officer who can answer all five with documented evidence is
                likely in compliant operating territory. One who cannot is
                likely sitting on undocumented exposure of the type the
                Hamburg DPA found at H&amp;M.
              </p>
            </BriefSection>

            <BriefSection id="precedent" number="Part 1" title="The H&M Precedent">
              <p>
                The H&amp;M Hennes &amp; Mauritz fine, issued on{" "}
                <span className="text-white">1 October 2020</span> by the
                Hamburg Commissioner for Data Protection and Freedom of
                Information, set the operational template that European DPAs
                have followed since. Understanding the case in detail matters
                because the violation mechanism is the violation mechanism
                that is operating, undetected, in most multinationals today.
              </p>

              <SubHeading>What happened at the Nuremberg service centre</SubHeading>
              <p>
                H&amp;M operated a service centre in Nuremberg where,
                beginning in 2014, team leaders conducted what were
                internally called <em>Welcome Back Talks</em> with employees
                returning from sick leave or vacation. The stated purpose was
                to maintain personal connection and identify support needs.
                Over five years, the content of these conversations was
                systematically recorded by managers and stored on an internal
                network drive. The records included specific health
                diagnoses, family difficulties, religious beliefs, and
                details about employees' vacation experiences and personal
                circumstances. The records were used to inform employment
                decisions including evaluations and contract renewals.
              </p>
              <p>
                The data was not exposed because of an external breach. The
                data was exposed because in October 2019, a technical
                configuration error made the network drive readable across
                the wider H&amp;M corporate network for approximately{" "}
                <span className="text-white">five hours</span>. Employees
                noticed. Internal complaints followed. The Hamburg DPA opened
                an investigation.
              </p>

              <SubHeading>Hamburg's characterization</SubHeading>
              <p>
                Prof. Dr. Johannes Caspar, the Hamburg Commissioner at the
                time, characterized the H&amp;M conduct as constituting:
              </p>
              <PullQuote source="Hamburg Commissioner for Data Protection, 1 October 2020">
                A particularly intensive encroachment on employees' civil
                rights.
              </PullQuote>
              <p>
                Three elements of the Hamburg analysis matter for
                understanding the broader pattern:
              </p>
              <BulletList
                items={[
                  "The data collection was undertaken with no documented legal basis under GDPR Article 6 or Article 9. The managers were not acting maliciously, but they were also not operating under any framework that authorized the processing.",
                  "The accumulation pattern, not the configuration error, was the violation. The fine would have been issued even if the configuration error had never occurred. The configuration error simply made the underlying violation visible.",
                  "The penalty calculation was based on the population whose data had been processed, not on the subset whose data had been temporarily exposed. The exposure was incidental. The processing was the offence.",
                ]}
              />
              <Callout icon={ShieldAlert} label="Why this precedent matters" tone="warn">
                The €35.3M figure was, at the time, the largest GDPR penalty
                ever issued by a German DPA. It established the principle
                that <span className="text-white">informal employee data
                accumulation, conducted by middle managers under no formal
                legal framework</span>, is GDPR-actionable at penalty levels
                typically associated with technical security failures or
                deliberate misuse.
              </Callout>
            </BriefSection>

            <BriefSection
              id="pattern"
              number="Part 2"
              title="The Shadow HR Pattern, Named"
            >
              <p>
                The H&amp;M case names a pattern that exists in most
                multinational organizations. Once identified, the pattern
                becomes visible everywhere. Once made visible, it cannot be
                unseen by a sophisticated General Counsel.
              </p>

              <SubHeading>The structural origin</SubHeading>
              <p>
                Modern duty-of-care frameworks, including{" "}
                <span className="text-white">ISO 31030</span> for travel
                risk, the Corporate Sustainability Due Diligence Directive
                (CSDDD) for supply chain and workforce obligations, the
                Worker Protection Act 2024 in the United Kingdom, the
                Equality Act jurisprudence on reasonable adjustments, and
                parallel European employer-liability evolution, all demand
                that employers protect specific marginalized employees from
                specific identity-aware harms. Generic protection is
                inadequate. Tailored protection is required.
              </p>
              <p>
                Modern data protection frameworks, including{" "}
                <span className="text-white">GDPR Article 9</span> on special
                category data, the EU AI Act prohibition on
                demographic-attribute training inputs in employment contexts,
                and sector-specific regulation on health and disability data,
                all prohibit employers from centrally recording the
                attributes that would let them deliver that tailored
                protection.
              </p>
              <p>
                These two regimes were authored by different legislators,
                operating on different timescales, optimizing for different
                harms. They are both correct, individually. They are{" "}
                <span className="text-white">
                  catastrophically incompatible, together
                </span>
                .
              </p>

              <SubHeading>How the pattern manifests</SubHeading>
              <p>
                Managers in multinational organizations live inside the
                resulting incompatibility every day. They know they have a
                duty-of-care obligation. They know the official systems
                cannot legally hold the data that would let them discharge
                it. So they build unofficial systems. In practice, Shadow HR
                manifests as:
              </p>
              <BulletList
                items={[
                  "Spreadsheets maintained by individual managers or HR business partners tracking employee accommodations, dietary requirements, medical conditions, family circumstances, religious observances, or identity factors relevant to travel and assignment decisions.",
                  "Network drives where ERG (Employee Resource Group) coordinators store membership lists for LGBTQ+ networks, disability networks, neurodiversity networks, veteran networks, and parent networks, typically without DPIA, without explicit consent for the processing purpose, and without documented retention policy.",
                  "HRIS custom fields that someone in middle management began populating without explicit corporate authorization, capturing accommodation needs, medical restrictions, or identity factors in free-text or structured form.",
                  "Email threads and chat archives where managers and HR staff have discussed individual employees' personal circumstances in detail, with the threads retained indefinitely under default corporate retention policies.",
                  "OHS (Occupational Health and Safety) files containing medical disclosure information that is then referenced informally by line managers for non-OHS purposes.",
                  "Travel-risk vendor platforms that have accumulated traveler profile data including health conditions, dietary restrictions, and emergency contact relationships, all of which constitute special-category data under Article 9.",
                ]}
              />
              <p>
                Each of these is special-category personal data under GDPR
                Article 9, processed without proper legal basis, without
                DPIA, without documented purpose limitation, without
                retention controls, and typically without the data subject's
                specific knowledge of the processing scope. None of it was
                created with malicious intent. All of it was created by
                people trying to discharge their organizational obligations
                under duty-of-care frameworks that gave them no architectural
                alternative.
              </p>
            </BriefSection>

            <BriefSection
              id="disclosure"
              number="Part 3"
              title="The Disclosure-Collapse Multiplier"
            >
              <p>
                Shadow HR would be a static problem if voluntary employee
                disclosure rates were stable. They are not. Disclosure rates
                across every marginalized cohort with available data are
                collapsing, and the collapse changes the risk math
                materially.
              </p>

              <SubHeading>The data</SubHeading>
              <p>
                The Human Rights Campaign Foundation's{" "}
                <span className="text-white">2026 Corporate Equality Index</span>{" "}
                documented that <span className="text-white">47.5%</span> of
                LGBTQ+ adults are less out in at least one area of their
                lives than they were 12 months ago. The HRC characterized
                this as a measurable retreat from workplace identity
                disclosure under the current political and regulatory
                environment.
              </p>
              <p>
                The City &amp; Guilds Foundation Neurodiversity Index for
                2023 found that <span className="text-white">76%</span> of
                neurodivergent employees chose not to fully disclose their
                condition to their employer. The 2024 CIPD{" "}
                <em>Neuroinclusion at Work</em> Report found that{" "}
                <span className="text-white">31%</span> of neurodivergent
                employees have not told their manager or HR anything at all.
                The Understood.org and Harris Poll Neurodiversity at Work
                Survey in May 2025 found that{" "}
                <span className="text-white">64%</span> of neurodivergent
                employees believe disclosure would harm them, and{" "}
                <span className="text-white">77%</span> of all adults agreed
                that neurodivergent employees feel pressure to mask their
                conditions at work.
              </p>
              <p>
                Across LGBTQ+, neurodivergent, disability, and other
                marginalized cohorts, the direction of travel is consistent:
                fewer employees are telling their employers what they are.
                The regulatory rollback of DEI infrastructure in the United
                States, accelerating since early 2025, has made disclosure
                feel actively dangerous in ways it did not feel two years
                ago.
              </p>

              <SubHeading>Why this makes the exposure worse</SubHeading>
              <p>
                Most Chief Privacy Officers would assume that declining
                disclosure reduces Shadow HR exposure.{" "}
                <span className="text-white">The opposite is true.</span> As
                voluntary disclosure to official channels collapses, managers
                operating under duty-of-care pressure do not stop tracking.
                They track informally instead. The spreadsheet replaces the
                HRIS field. The ERG private chat replaces the corporate
                membership list. The personal note replaces the corporate
                record.
              </p>
              <p>
                The total population of employees about whom special-category
                data is being processed does not shrink as disclosure
                collapses. The population stays the same. The proportion of
                that processing that happens in undocumented, unsanctioned,
                unmonitored systems grows. And the regulatory liability is
                calculated on the total population, not on the proportion
                being tracked through official channels.
              </p>

              <SubHeading>The 15 to 20 percent dimension</SubHeading>
              <p>
                The most underappreciated dimension of this problem is scale.
                Neurodivergent individuals, those with autism, ADHD,
                dyslexia, dyspraxia, and related conditions, account for an
                estimated <span className="text-white">15 to 20%</span> of
                the global adult population. A multinational with 50,000
                employees has approximately{" "}
                <span className="text-white">7,500 to 10,000</span>{" "}
                neurodivergent workers. Approximately 24% have formally
                disclosed (per CIPD 2024). The disclosed subset is tracked
                somewhere, in HRIS accommodation fields, ERG membership
                lists, manager notes, or OHS files. Each of those tracking
                locations is processing special-category health data under
                Article 9. A configuration error of the H&amp;M variety,
                exposing one of these tracking locations, would generate a
                penalty calculated against the entire employed neurodivergent
                population, not against the subset whose data was
                incidentally exposed. Hamburg established that principle in
                2020. It has been confirmed in every subsequent enforcement
                action.
              </p>
            </BriefSection>

            <BriefSection
              id="enforcement"
              number="Part 4"
              title="The Enforcement Trajectory"
            >
              <p>
                The argument that the H&amp;M case was an outlier requires
                ignoring everything that has happened since. The European DPA
                enforcement environment is not stable around employee data.{" "}
                <span className="text-white">It is intensifying.</span>
              </p>

              <SubHeading>The Uber precedent</SubHeading>
              <p>
                In July 2024, the Dutch Data Protection Authority{" "}
                <em>(Autoriteit Persoonsgegevens)</em> fined Uber{" "}
                <span className="text-white">€290&nbsp;million</span> for the
                unlawful transfer of European driver data to the United
                States. The fine was not about a breach. It was about the
                routine processing of driver-identity data through pathways
                that did not satisfy GDPR transfer requirements.
              </p>
              <p>
                The case extended the H&amp;M principle. It is not necessary
                for data to be exposed for the processing itself to
                constitute the violation. The Uber decision specifically
                reaffirmed that the population whose data was processed forms
                the calculation basis for the penalty, regardless of how many
                of those individuals experienced actual harm.
              </p>

              <SubHeading>The cumulative trend</SubHeading>
              <p>
                The CMS GDPR Enforcement Tracker Report for 2025 documented
                cumulative European enforcement of{" "}
                <span className="text-white">€355&nbsp;million</span> across{" "}
                <span className="text-white">162 enforcement actions</span>{" "}
                in the employee-data category alone, through March 2025. The
                trajectory of monthly enforcement is accelerating, not flat.
                Three factors are driving the acceleration:
              </p>
              <BulletList
                items={[
                  "DPAs have improved their investigatory technique for finding informal data accumulation. The H&M case taught the regulatory community how to recognize the Shadow HR pattern. Subsequent cases have refined that recognition.",
                  "Employee complaints have become more common as workforce awareness of GDPR rights has matured. The complaint pathway from employee to DPA is now well-established across most member states.",
                  "DPAs have aligned on the principle that penalty severity should be calibrated to the failure to design for compliance, not just to the harm caused. This means well-intentioned violations receive penalties commensurate with their structural scope, not with their motive.",
                ]}
              />

              <SubHeading>The insurance underwriting dimension</SubHeading>
              <p>
                D&amp;O (Directors and Officers) liability insurance
                underwriters and cyber liability underwriters have begun
                requiring documented compliance with ISO 31030 (Travel Risk
                Management) and demonstrable GDPR Article 35 DPIA coverage on
                employee-data processing as conditions for competitive
                renewal pricing. The insurance market is establishing what
                the regulatory market is enforcing. Organizations that cannot
                document their employee-data architecture against both
                frameworks are facing premium increases and coverage
                exclusions that compound the direct regulatory exposure.
              </p>
            </BriefSection>

            <BriefSection
              id="architecture"
              number="Part 5"
              title="The Architectural Resolution"
            >
              <p>
                The Shadow HR problem cannot be solved by policy. Stronger
                manager training, clearer compliance documentation, more
                frequent DPIAs. All are useful, none are sufficient.
                Managers will continue to receive duty-of-care obligations
                they cannot legally discharge using sanctioned data
                infrastructure, and they will continue to build informal
                alternatives in response. The problem is solvable only by{" "}
                <span className="text-white">architectural change</span>.
                Specifically, by removing the underlying need for centralized
                special-category data accumulation in the first place.
              </p>

              <SubHeading>The minimum-disclosure principle</SubHeading>
              <p>
                A minimum-disclosure architecture delivers the bespoke risk
                mitigation that duty-of-care frameworks demand without
                requiring the employer to centrally retain the demographic
                attributes that data-protection frameworks prohibit. The
                architectural pattern has three properties:
              </p>

              <div className="my-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    1. Edge-bound identity
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Identity attributes that would constitute Article 9
                    special-category data are held on the employee's edge
                    device, behind biometric authentication, never
                    transmitted to enterprise systems.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    2. Stateless synthesis
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Risk assessment is performed by stateless synthesis
                    against destination or assignment context. The
                    demographic input is destroyed at the boundary of the
                    synthesis enclave. No retained identity record exists to
                    attach the output to.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <ScrollText className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    3. Decoupled audit
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    The audit trail required for ISO 31030 and EU AI Act
                    compliance captures the assessment outputs and decision
                    logic, not the demographic inputs. The compliance
                    evidence exists. The Article 9 exposure does not.
                  </p>
                </div>
              </div>

              <Callout icon={Network} label="Implementation status">
                This pattern is implementable. Third Rail Systems OÜ has
                built a working implementation called the{" "}
                <span className="text-white">ISI Platform</span>. The KTH
                Royal Institute of Technology in Stockholm has independently
                validated the architecture at{" "}
                <span className="text-white">IRL 5</span> (Technology
                Readiness Level). Independent academic oversight on EU AI
                Act conformity is provided by{" "}
                <span className="text-white">Dr. Sidra Azmat Butt</span>,
                researcher at the Next Gen Digital State Research Group at
                Tallinn University of Technology.
              </Callout>

              <SubHeading>Why this is the only pattern that survives</SubHeading>
              <p>
                Centralized data brokerage, the architectural pattern that
                defines the legacy travel-risk-management industry, cannot
                survive the current regulatory environment. The enforcement
                trajectory is too steep, the disclosure-collapse multiplier
                is too aggressive, and the population-based penalty
                calculation is too punitive.{" "}
                <span className="text-white">
                  Privacy-by-design architecture is not an aesthetic
                  preference. It is the only structural pattern that
                  satisfies both regulatory regimes simultaneously
                </span>{" "}
                and that scales with a workforce whose disclosure rates will
                continue to decline through the remainder of the decade.
              </p>
            </BriefSection>

            <BriefSection
              id="questions"
              number="Part 6"
              title="Five Diagnostic Questions"
            >
              <p>
                A General Counsel, Chief Privacy Officer, or Chief Security
                Officer evaluating organizational exposure to Shadow HR
                liability can begin with five operational diagnostic
                questions. The questions are not exhaustive. They are
                calibrated to surface the categories of exposure most
                consistently present in multinational organizations.{" "}
                <span className="text-white">
                  An organization that can answer all five questions with
                  documented evidence is likely in compliant operating
                  territory.
                </span>{" "}
                An organization that cannot answer one or more is likely
                sitting on undocumented exposure of the type the Hamburg DPA
                found at H&amp;M in 2020.
              </p>

              <div className="mt-8 space-y-4">
                <DiagnosticQuestion index="1" title="Legal basis documentation">
                  Can you produce, within 72 hours, the documented legal
                  basis under GDPR Article 6 and Article 9 for every employee
                  accommodation, ERG membership, or identity-related data
                  field currently held in any system, official or informal,
                  within your organization? If the answer requires
                  consultation with multiple HR business partners, ERG
                  coordinators, or line managers to compile, the
                  documentation does not exist in the form GDPR requires.
                </DiagnosticQuestion>
                <DiagnosticQuestion
                  index="2"
                  title="Informal accumulation discovery"
                >
                  When was the last time your DPO or Privacy Office conducted
                  a systematic discovery exercise to identify Shadow HR
                  accumulation in spreadsheets, network drives, chat
                  archives, and email threads across the organization? If the
                  answer is never, or if the answer is more than 18 months
                  ago, the accumulation is likely present and growing.
                </DiagnosticQuestion>
                <DiagnosticQuestion index="3" title="Manager training content">
                  Do your line manager training materials contain explicit,
                  named guidance against informal tracking of employee
                  accommodations, identity factors, or personal circumstances,
                  with examples of what does and does not constitute Article
                  9 special-category data? Generic GDPR training does not
                  satisfy this question. The guidance must be specific to the
                  Shadow HR pattern.
                </DiagnosticQuestion>
                <DiagnosticQuestion index="4" title="DPIA coverage on ERG data">
                  When was the last DPIA (Data Protection Impact Assessment)
                  conducted on the data processing performed by your ERG
                  coordinators in the course of maintaining membership lists,
                  organizing events, and supporting members in their
                  professional development? If the answer is never, your ERG
                  coordinators are likely processing Article 9 data without
                  the legal infrastructure GDPR requires.
                </DiagnosticQuestion>
                <DiagnosticQuestion
                  index="5"
                  title="Travel risk vendor data classification"
                >
                  Has your Privacy Office conducted a classification audit of
                  the data your current travel-risk-management vendor
                  (International&nbsp;SOS, SAP Concur, Crisis24, Everbridge,
                  or similar) holds about your employees, with specific
                  attention to which fields constitute Article 9
                  special-category data? If the vendor holds health
                  information, dietary requirements, emergency contact
                  relationships, or accommodation needs, the vendor is
                  processing Article 9 data on your behalf. Your DPA with
                  that vendor must specifically authorize Article 9
                  processing under documented legal basis.{" "}
                  <span className="text-white">
                    Most current vendor DPAs do not.
                  </span>
                </DiagnosticQuestion>
              </div>
            </BriefSection>

            <BriefSection
              id="diagnostic"
              number="—"
              title="If This Brief Maps to Your Organization"
            >
              <p>
                The Shadow HR pattern is recognizable once named. Most
                General Counsels who read this brief in full will recognize
                at least two of the five diagnostic questions as ones they
                cannot answer with documented evidence. Some will recognize
                all five.
              </p>
              <p>
                Third Rail Systems OÜ is conducting confidential architectural
                diagnostics with a limited number of multinational
                organizations through Q3 2026. The diagnostic is not a sales
                engagement. It is a{" "}
                <span className="text-white">60-minute structured
                conversation</span> between your Privacy, Security, and HR
                leadership and our architectural team, focused on whether
                your current employee-data architecture can survive a Hamburg
                DPA inspection. The diagnostic produces a written assessment
                of exposure points and architectural alternatives. There is
                no obligation to engage further. Organizations that
                determine, after the diagnostic, that their current
                architecture is sound have received a documented validation
                that may be useful for D&amp;O insurance underwriting
                conversations. Organizations that determine, after the
                diagnostic, that architectural change is warranted have a
                reference framework for the change.
              </p>

              <SubHeading>Evaluation criteria</SubHeading>
              <p>
                Diagnostic requests are evaluated against three criteria:
              </p>
              <BulletList
                items={[
                  "Organizational scale: multinational with 5,000+ employees.",
                  "Workforce composition: substantive marginalized-cohort population, including but not limited to LGBTQ+, neurodivergent, and disability cohorts.",
                  "Current exposure: organization is processing employee data through travel-risk vendors, ERG infrastructure, or accommodation-tracking systems.",
                ]}
              />

              <div
                className="mt-10 flex flex-col items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"
                data-trs-print-hide
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
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handlePdfDownload}
                    disabled={pdfState === "loading"}
                    variant="outline"
                    className="h-10 border-slate-700 bg-slate-950/60 px-4 text-slate-100 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white disabled:opacity-90"
                    data-testid="catch22-pdf-button"
                  >
                    {pdfState === "loading" ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4">
                          <LogoMark className="trs-svg-pulse" />
                        </span>
                        Rendering…
                      </>
                    ) : pdfState === "done" ? (
                      <>
                        <Check className="mr-1 h-4 w-4 text-cyan-400" />
                        Downloaded
                      </>
                    ) : pdfState === "error" ? (
                      <>
                        <Download className="mr-1 h-4 w-4 text-rose-400" />
                        Retry PDF
                      </>
                    ) : (
                      <>
                        <Download className="mr-1 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  <a
                    href={LINKEDIN_ARTICLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      track("brief_linkedin_click", {
                        brief: "catch-22",
                        location: "bottom",
                      });
                      openExternal(LINKEDIN_ARTICLE_URL)(e);
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-700 bg-slate-950/60 px-4 text-sm text-slate-100 transition-colors hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
                    data-testid="catch22-linkedin-button"
                  >
                    <LinkedInGlyph className="h-4 w-4" />
                    Read companion essay
                  </a>
                  <Button
                    onClick={handleCta}
                    className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    data-testid="catch22-cta-contact"
                  >
                    Request Diagnostic
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Share */}
              <div
                className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="catch22-share-card"
                data-trs-print-hide
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Forward
                </div>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white sm:text-base">
                      Share with your General Counsel
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      Copy the in-site link or share the LinkedIn companion
                      essay with one click.
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
                  "CMS GDPR Enforcement Tracker Report 2025, Employment and Employee Data category.",
                  "CIPD Neuroinclusion at Work Report, February 2024.",
                  "City & Guilds Foundation Neurodiversity Index, 2023 edition.",
                  "Understood.org and Harris Poll Neurodiversity at Work Survey, May 2025.",
                  "Human Rights Campaign Foundation Corporate Equality Index 2026.",
                  "CSDDD (Corporate Sustainability Due Diligence Directive), Official Journal of the European Union, 5 July 2024; Omnibus I amendments 24 February 2026.",
                  "GDPR Article 9 and Article 83, Regulation (EU) 2016/679.",
                  "ISO 31030:2021 Travel Risk Management: Guidance for Organizations, International Organization for Standardization.",
                  "KTH Royal Institute of Technology, Deeptech Startup Network IRL Framework Evidence Report, Third Rail Systems OÜ, March 2026.",
                ].map((cite) => (
                  <li key={cite} className="flex items-start gap-3">
                    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                    <span>{cite}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-lg border border-slate-800 bg-slate-900/60 p-5 text-xs leading-relaxed text-slate-500">
                This document is published by Third Rail Systems OÜ. The
                analysis is provided for informational purposes and does not
                constitute legal advice. Organizations evaluating their
                exposure under GDPR, ISO 31030, the EU AI Act, or related
                frameworks should consult qualified legal counsel.
              </div>

              <p className="mt-6 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                © 2026 Third Rail Systems OÜ · Tallinn, Estonia · Registry
                17488655 · v1.1 · May 2026
              </p>
            </BriefSection>
          </article>
        </div>
      </div>

      {!isPrint && <Footer />}
    </div>
  );
}
