import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  Lock,
  Users,
  Server,
  Cpu,
  FileText,
  UserCheck,
  Globe,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Menu,
  X,
  Shield,
  Fingerprint,
  Scale,
  MapPin,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_eu-travel-risk/artifacts/xlq21bpc_Third%20Rail%20Logo.jpg";

const NAV_LINKS = [
  { id: "platform", label: "Platform" },
  { id: "solutions", label: "Solutions" },
  { id: "compliance", label: "Compliance" },
  { id: "about", label: "About" },
];

const ROLE_OPTIONS = [
  { value: "cso", label: "CSO / Security Leadership" },
  { value: "dpo", label: "DPO / Privacy Counsel" },
  { value: "erg", label: "ERG / Inclusion Lead" },
  { value: "mobility", label: "Global Mobility / HR" },
  { value: "executive", label: "C-Suite / Executive" },
  { value: "other", label: "Other" },
];

/* ---------- tiny reveal-on-scroll hook ---------- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- small building blocks ---------- */
const Eyebrow = ({ children, index }) => (
  <div
    className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-400"
    data-testid={`eyebrow-${index || "label"}`}
  >
    {index && <span className="text-slate-500">{index}</span>}
    <span className="h-px w-8 bg-cyan-400/60" />
    <span>{children}</span>
  </div>
);

const SectionHeader = ({ index, eyebrow, title, description, align = "left" }) => (
  <div
    className={`reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
  >
    <Eyebrow index={index}>{eyebrow}</Eyebrow>
    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base text-slate-400 sm:text-lg">{description}</p>
    )}
  </div>
);

/* ================================================================
   NAVBAR
================================================================ */
function Navbar({ onCtaClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3"
          data-testid="logo-button"
        >
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900">
            <img
              src={LOGO_URL}
              alt="Third Rail Systems OÜ"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="hidden text-[13px] font-semibold tracking-tight text-white sm:inline">
            Third Rail Systems
            <span className="ml-1 font-normal text-slate-400">OÜ</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
              data-testid={`nav-link-${l.id}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onCtaClick}
            data-testid="nav-cta-button"
            className="hidden md:inline-flex btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          >
            Request Pilot Assessment
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-200 hover:bg-slate-800/60 hover:text-white"
                data-testid="mobile-menu-trigger"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85%] max-w-sm border-slate-800 bg-slate-950 text-slate-200"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-slate-100">
                  Third Rail Systems OÜ
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="border-b border-slate-800 py-4 text-left text-base text-slate-200 hover:text-cyan-400"
                    data-testid={`mobile-nav-link-${l.id}`}
                  >
                    {l.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setOpen(false);
                    onCtaClick();
                  }}
                  className="mt-6 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  data-testid="mobile-nav-cta"
                >
                  Request Pilot Assessment
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

/* ================================================================
   HERO
================================================================ */
function Hero({ onPrimary, onSecondary }) {
  return (
    <section
      className="relative isolate overflow-hidden pt-32 sm:pt-40"
      data-testid="hero-section"
    >
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 0%, rgba(34,211,238,0.12) 0%, rgba(11,15,20,0) 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-start gap-16 px-5 pb-24 sm:px-8 lg:grid-cols-12 lg:px-10 lg:pb-32">
        <div className="reveal lg:col-span-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300 mono"
            data-testid="hero-eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Resolving the Duty-of-Care Data Trap
          </div>

          <h1
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="hero-headline"
          >
            Travel risk systems that account for{" "}
            <span className="text-cyan-400">real people</span>, not generic
            averages.
          </h1>

          <p
            className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg"
            data-testid="hero-subheadline"
          >
            Third Rail Systems enables Fortune 500 security teams to fulfill ISO
            31030 travel risk mandates for marginalized employees—without
            triggering GDPR special-category data liabilities.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onPrimary}
              data-testid="hero-primary-cta"
              className="btn-glow h-11 bg-cyan-500 px-6 text-slate-950 hover:bg-cyan-400"
            >
              Request Pilot Assessment
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondary}
              data-testid="hero-secondary-cta"
              className="h-11 border-slate-700 bg-slate-900/60 px-6 text-slate-100 hover:bg-slate-800 hover:text-white"
            >
              Read Strategic Memo
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400 mono uppercase tracking-[0.18em]"
            data-testid="hero-trust-bar"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              EU-Native Architecture
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Built in Tallinn, Estonia
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Stateless AI Synthesis
            </span>
          </div>
        </div>

        {/* Operator console mock */}
        <div className="reveal lg:col-span-4">
          <div
            className="relative rounded-lg border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/50"
            data-testid="hero-console"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Dossier / DSF-0342
              </span>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Destination
                </div>
                <div className="mt-1 text-sm text-slate-100">
                  Kuala Lumpur, MY
                </div>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Threat Tier
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Elevated
                  </div>
                </div>
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Data Class
                  </div>
                  <div className="mt-1 text-sm text-white">On-device</div>
                </div>
              </div>
              <div className="h-px bg-slate-800" />
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Mitigations
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Avoid Jalan Alor 23:00–04:00
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Verified lodging cluster: KLCC / Bangsar
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Local counsel hotline attached
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  GDPR Art. 9
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No special-category data logged
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Illustrative operator view — sanitized dossier
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PROBLEM
================================================================ */
function ProblemSection() {
  const items = [
    {
      Icon: ShieldAlert,
      title: "The Duty-of-Care Mandate",
      body:
        "Enterprises must demonstrate reasonable steps to provide localized mitigations for marginalized employees (LGBTQ+, disabled, neurodivergent).",
    },
    {
      Icon: Lock,
      title: "The Privacy Liability",
      body:
        "Centrally collecting demographic identities creates a toxic, regulated data lake, exposing the enterprise to structural GDPR Article 9 violations.",
    },
    {
      Icon: Users,
      title: 'The "Shadow HR" Risk',
      body:
        "Well-intentioned teams track vulnerable travelers on informal spreadsheets—creating an un-audited legal nightmare for Data Protection Officers.",
    },
  ];

  return (
    <section
      id="problem"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="problem-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="01"
          eyebrow="The Core Conflict"
          title="The ISO 31030 vs. GDPR Catch-22"
          description="Two compliance regimes pulling in opposite directions. Most programs pick one risk and inherit the other."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {items.map(({ Icon, title, body }, idx) => (
            <div
              key={title}
              className="reveal group relative flex flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-7 transition-colors hover:border-slate-700 hover:bg-slate-900"
              data-testid={`problem-card-${idx + 1}`}
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {body}
              </p>
              <div className="mt-auto pt-6">
                <div className="h-px bg-slate-800 transition-colors group-hover:bg-cyan-500/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PLATFORM / SOLUTION
================================================================ */
function PlatformSection() {
  const features = [
    {
      Icon: Fingerprint,
      label: "Feature 01",
      title: "On-Device Processing",
      body:
        "The traveler's profile is encrypted locally. Special-category data never enters your HRIS.",
    },
    {
      Icon: Server,
      label: "Feature 02",
      title: "Stateless Threat Synthesis",
      body:
        "The system cross-references the destination against local penal codes without centrally logging demographic inputs.",
    },
    {
      Icon: FileText,
      label: "Feature 03",
      title: "The Inclusion Safety Dossier",
      body:
        "Your Global Travel Risk team receives a sanitized, actionable mitigation plan. You get the audit trail; your DPO avoids the data.",
    },
  ];

  return (
    <section
      id="platform"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="platform-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              index="02"
              eyebrow="Platform"
              title="Minimum-Disclosure Architecture"
              description="We materially decouple risk intelligence from human identity."
            />

            <div className="reveal mt-10 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Data-flow contract
              </div>
              <div className="mt-4 space-y-3 text-[13px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Identity inputs</span>
                  <span className="mono text-slate-500">device-local</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex items-center justify-between">
                  <span>Synthesis layer</span>
                  <span className="mono text-slate-500">stateless</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex items-center justify-between">
                  <span>Output to enterprise</span>
                  <span className="mono text-cyan-400">sanitized dossier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-5">
              {features.map(({ Icon, label, title, body }, i) => (
                <div
                  key={title}
                  className="reveal group relative grid gap-5 rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-cyan-500/40 sm:grid-cols-[auto,1fr] sm:gap-6"
                  data-testid={`platform-feature-${i + 1}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PERSONAS / SOLUTIONS
================================================================ */
function PersonasSection({ onCtaClick }) {
  const personas = [
    {
      tag: "For CSOs",
      Icon: Shield,
      points: [
        'Eliminate "Shadow HR" tracking.',
        "Generate auditable Inclusion Safety Dossiers.",
        "Procure securely with flat Total Travel Volume (TTV) pricing.",
      ],
    },
    {
      tag: "For DPOs",
      Icon: Lock,
      points: [
        "Enforce absolute data decentralization for special-category traits.",
        "Utilize pre-audited, Limited-Risk AI architecture.",
        "Maintain full EU-sovereign data flows.",
      ],
    },
    {
      tag: "For ERGs",
      Icon: Users,
      points: [
        "Provide enterprise-grade protection for underrepresented cohorts.",
        "Partner strategically with Security to unlock safe global mobility.",
      ],
    },
  ];

  return (
    <section
      id="solutions"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="personas-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="03"
          eyebrow="Solutions by persona"
          title="Bridging Security, Privacy, and Inclusion"
          description="Three mandates. One architecture. Each function keeps its own remit intact."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {personas.map(({ tag, Icon, points }, idx) => (
            <div
              key={tag}
              className="reveal relative flex flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-7 transition-colors hover:border-slate-700"
              data-testid={`persona-card-${idx + 1}`}
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] mono uppercase tracking-[0.18em] text-cyan-300">
                  <Icon className="h-3.5 w-3.5" />
                  {tag}
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  0{idx + 1}
                </span>
              </div>

              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-5">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Outcome
                </span>
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  data-testid={`persona-cta-${idx + 1}`}
                >
                  Start a pilot
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   COMPLIANCE
================================================================ */
function ComplianceSection() {
  const rows = [
    {
      tag: "GDPR",
      Icon: Scale,
      body:
        'We do not centralize "special-category data." The enterprise remains the Controller of standard itineraries; Third Rail acts as a Processor.',
    },
    {
      tag: "EU AI Act",
      Icon: Cpu,
      body:
        "Documented as an assistive decision-support tool with mandatory Human-In-The-Loop (HITL) oversight and immutable vector logging.",
    },
    {
      tag: "ISO 31030",
      Icon: FileText,
      body:
        "Verifiable, date-stamped evidence that the organization assessed intersectional threats prior to deployment.",
    },
  ];

  return (
    <section
      id="compliance"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="compliance-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="04"
          eyebrow="Governance"
          title="Engineered for the Modern Regulatory Landscape"
          description="Every architectural decision maps to a defensible compliance artefact."
        />

        <div className="reveal mt-14 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
          {rows.map(({ tag, Icon, body }, i) => (
            <div
              key={tag}
              className={`grid gap-6 p-7 sm:grid-cols-[180px,1fr] sm:items-start ${
                i < rows.length - 1 ? "border-b border-slate-800" : ""
              }`}
              data-testid={`compliance-row-${i + 1}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {tag}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-slate-300">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   ABOUT
================================================================ */
function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="about-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <SectionHeader
              index="05"
              eyebrow="About & origin"
              title="Built on Earned Secrets"
            />
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Third Rail Systems was founded on a singular operational truth:
              institutional safety requires deep visibility, but human privacy
              requires absolute discretion. We built the minimum-disclosure
              compliance layer to resolve this paradox.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Registered
                </div>
                <div className="text-sm text-slate-100">
                  Tallinn, Estonia — European Union
                </div>
              </div>
            </div>
          </div>

          <div className="reveal lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="founder-ceo"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  CEO
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Levi Hankins
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  20-year US Navy combat veteran with lived experience under
                  "Don't Ask, Don't Tell." Operational authority on discretion
                  under institutional scrutiny.
                </p>
              </div>

              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="founder-cto"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  CTO
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Jeremy Stabile
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Fortune 500 SecOps and GRC architecture expert. Designs the
                  stateless synthesis layer and HITL oversight controls.
                </p>
              </div>

              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:col-span-2"
                data-testid="estonia-advantage"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-cyan-400" />
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    The Estonia Advantage
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Proudly registered in Tallinn, Estonia, ensuring a strict
                  European corporate footprint immune to US jurisdictional
                  overreach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   CONTACT / INTAKE
================================================================ */
function ContactSection({ formRef }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid corporate email";
    if (!form.role) e.role = "Select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 650));
    setSubmitting(false);
    toast.success("Pilot assessment request received.", {
      description: "A member of the team will respond within 1 business day.",
    });
    setForm({ firstName: "", lastName: "", email: "", role: "" });
    setErrors({});
  };

  return (
    <section
      id="contact"
      ref={formRef}
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="contact-section"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <div className="reveal rounded-lg border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow index="06">Intake</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Initiate a Pilot Assessment
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                Request a 20-minute architecture fit-call. Our 4-to-6 week paid
                enterprise pilots require zero API integration with your HRIS.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  20-minute architecture fit-call
                </li>
                <li className="flex items-start gap-3">
                  <Server className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  Zero HRIS API integration required
                </li>
                <li className="flex items-start gap-3">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  EU-sovereign data flows throughout
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="lg:col-span-7"
              data-testid="pilot-form"
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="Levi"
                    data-testid="input-first-name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="Hankins"
                    data-testid="input-last-name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Corporate Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="name@enterprise.com"
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="role"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Role
                  </Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                  >
                    <SelectTrigger
                      id="role"
                      className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                      data-testid="select-role-trigger"
                    >
                      <SelectValue placeholder="Select your function" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="focus:bg-slate-800 focus:text-white"
                          data-testid={`select-role-option-${opt.value}`}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-rose-400">{errors.role}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="btn-glow mt-8 h-11 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 sm:w-auto"
                data-testid="submit-pilot-form"
              >
                {submitting ? "Submitting…" : "Request Pilot Assessment"}
                {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>

              <p className="mt-4 text-xs text-slate-500">
                By submitting, you consent to Third Rail Systems OÜ processing
                the information above solely to evaluate pilot fit. No
                special-category data is requested.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   FOOTER
================================================================ */
function Footer() {
  return (
    <footer
      className="border-t border-slate-900 bg-slate-950 py-10"
      data-testid="site-footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900">
            <img
              src={LOGO_URL}
              alt="Third Rail Systems OÜ"
              className="h-full w-full object-cover"
            />
          </span>
          <div>
            <div className="text-sm font-semibold text-white">
              Third Rail Systems OÜ
            </div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Tallinn, Estonia · EU-Native
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="mono uppercase tracking-[0.18em]">
            © {new Date().getFullYear()} Third Rail Systems OÜ
          </span>
          <a
            href="mailto:pilot@thirdrail.systems"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400"
            data-testid="footer-email"
          >
            <Mail className="h-3.5 w-3.5" />
            pilot@thirdrail.systems
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================
   ROOT
================================================================ */
export default function LandingPage() {
  useReveal();
  const formRef = useRef(null);

  const scrollToContact = () => {
    document
      .getElementById("contact")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollToCompliance = () => {
    document
      .getElementById("compliance")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="landing-root">
      <Navbar onCtaClick={scrollToContact} />
      <main>
        <Hero onPrimary={scrollToContact} onSecondary={scrollToCompliance} />
        <ProblemSection />
        <PlatformSection />
        <PersonasSection onCtaClick={scrollToContact} />
        <ComplianceSection />
        <AboutSection />
        <ContactSection formRef={formRef} />
      </main>
      <Footer />
    </div>
  );
}
