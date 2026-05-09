import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Gavel,
  Globe,
  Hammer,
  Link as LinkIcon,
  Lock,
  MapPin,
  Scale,
  Server,
  ShieldAlert,
  Skull,
  Triangle,
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
  { id: "overview", label: "0. Executive Overview" },
  { id: "hammer", label: "I. The Hammer — Criminal Liability" },
  { id: "anvil", label: "II. The Anvil — Corporate Ruin" },
  { id: "trap", label: "III. The Trap — GDPR Article 9" },
  { id: "market", label: "IV. Market Scale & Stateless Architecture" },
  { id: "next", label: "V. The Pilot" },
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

function SubHeading({ children }) {
  return (
    <h3 className="mt-10 text-xl font-semibold tracking-tight text-white sm:text-2xl">
      {children}
    </h3>
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

function ComparisonTable({ caption, headers, rows, testid }) {
  return (
    <div
      className="my-8 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60"
      data-testid={testid}
    >
      {caption && (
        <div className="border-b border-slate-800 px-5 py-3 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
          {caption}
        </div>
      )}
      <table className="w-full text-left text-[13px] sm:text-sm">
        <thead className="bg-slate-950/60">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-slate-800 px-4 py-3 mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-900 last:border-b-0 align-top"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-4 ${
                    j === 0
                      ? "text-white font-medium"
                      : "text-slate-300"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
      "Duty of Care vs. Data Privacy — The Multi-Billion-Euro Catch-22 · Third Rail Systems OÜ";
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
            <Eyebrow index="BRIEF · 2026">Liability Analysis</Eyebrow>
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
            A multi-billion-euro liability crisis in European enterprise
            operations — and why every legacy HRIS is structurally unequipped
            to resolve it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 mono uppercase tracking-[0.18em]">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              Tallinn, Estonia
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>14-minute read</span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span>v1.0 · founding team</span>
          </div>

          {/* Hammer / Anvil / Trap stat strip */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3" data-testid="catch22-strip">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Hammer className="h-3.5 w-3.5" />
                The Hammer
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                Executive criminal liability
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                UK Gross Negligence Manslaughter (life). FR{" "}
                <em>faute inexcusable</em>. DE § 222 StGB.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Triangle className="h-3.5 w-3.5" />
                The Anvil
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                Corporate financial ruin
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Loi de Vigilance €30M + civil. LkSG 2% global turnover.
                €37B in EU foreign penalties since 2010.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                <Lock className="h-3.5 w-3.5" />
                The Trap
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                GDPR Article 9 violation
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                €20M or 4% of global turnover for processing
                special-category data — the same data ISO 31030 demands.
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
                  Stateless architecture is the only mathematically sound
                  resolution to the Duty of Care vs. Data Privacy Catch-22.
                </p>
              </div>
            </div>
          </aside>

          <article
            className="lg:col-span-9"
            id="brief-article-root"
            data-testid="catch22-article"
          >
            <BriefSection id="overview" number="0" title="Executive Overview">
              <p>
                The landscape of corporate governance and enterprise risk
                across the European Union and the United Kingdom has
                undergone a hostile, systemic paradigm shift. The era in
                which executives could shield themselves behind the corporate
                veil — treating employee safety failures during international
                deployments as financial line items or insurable operational
                risks — is definitively over.
              </p>
              <p>
                Sovereign legal frameworks are aggressively piercing the
                corporate veil, deploying specialized mechanisms to hold
                Chief Security Officers, Human Resources Directors, and
                C-suite executives personally, criminally, and financially
                liable for failing to protect their personnel.
              </p>
              <p>
                Under <span className="text-white">ISO 31030</span>, employers
                are legally mandated to conduct bespoke risk assessments
                evaluating the distinct vulnerabilities of traveling
                employees — including LGBTQ+ status, gender identity,
                neurodivergence, and physical disabilities. Yet{" "}
                <span className="text-white">GDPR Article 9</span> explicitly
                prohibits the processing or storing of this special-category
                data, levying massive financial penalties for non-compliance.
              </p>
              <Callout icon={Scale} label="The trilemma">
                Enterprise leadership is forced to choose between the{" "}
                <span className="text-white">Hammer</span> of individual
                executive criminal liability, the{" "}
                <span className="text-white">Anvil</span> of unlimited
                corporate financial ruin via supply-chain and vigilance laws,
                or the <span className="text-white">Trap</span> of a €20M
                data-privacy fine. There is no fourth option inside a stateful
                data architecture.
              </Callout>
            </BriefSection>

            <BriefSection
              id="hammer"
              number="I"
              title="The Hammer — Individual Executive Criminal Liability"
            >
              <p>
                Executive immunity has been systematically dismantled across
                Europe's most influential jurisdictions. The regulatory
                apparatus no longer views corporate negligence as an abstract
                institutional failure; rather, it identifies and prosecutes
                the specific human actors responsible for the omission of
                safety protocols.
              </p>

              <SubHeading>
                United Kingdom — Gross Negligence and the Dismantling of the
                "Controlling Mind"
              </SubHeading>
              <p>
                The Health and Safety at Work etc. Act 1974 (HSWA) imposes a
                rigid statutory duty on employers to ensure, "so far as is
                reasonably practicable," the health, safety, and welfare of
                all their employees. The duty has explicit{" "}
                <span className="text-white">extraterritorial reach</span> —
                it applies in full force to employees on UK terms while
                travelling abroad.
              </p>
              <p>
                The Corporate Manslaughter and Corporate Homicide Act 2007
                (CMCHA) replaced the old "directing mind" test with one of
                systemic <span className="text-white">senior-management</span>{" "}
                failings. Deploying an employee with hidden vulnerabilities
                — a neurodivergent individual or an LGBTQ+ executive — into a
                hostile jurisdiction without an individualized risk
                assessment routinely meets the standard of a "gross breach"
                of duty of care.
              </p>
              <p>
                Although the CMCHA charge applies to the corporate entity,
                its evidential intensity routinely unearths the data
                required to prosecute executives individually under Section
                37 HSWA (offences committed with the "consent, connivance, or
                neglect" of a director) or under the common-law offence of
                Gross Negligence Manslaughter — which carries a maximum
                tariff of <span className="text-white">life imprisonment</span>
                . Convicted executives face mandatory disqualification under
                the Company Directors Disqualification Act 1986. Cotswold
                Geotechnical Holdings and Lion Steel Equipment both
                demonstrate the prosecutorial appetite for individual
                charges.
              </p>

              <SubHeading>
                France — <em>Faute Inexcusable</em> and Institutional
                Criminality
              </SubHeading>
              <p>
                Article L. 4121-1 of the French Labour Code creates an{" "}
                <em>obligation de résultat</em> — an absolute, overriding
                safety obligation. Any accident occurring during a business
                trip is presumed a workplace accident; failure constitutes{" "}
                <em>faute inexcusable</em> whenever the employer "was, or
                should have been, aware of the danger" and did not take the
                necessary measures.
              </p>
              <p>
                The 2002 Karachi attack — in which 11 French DCN engineers
                died — is the defining extraterritorial precedent. The 2004
                ruling by the Tribunal des Affaires de Sécurité Sociale de la
                Manche condemned the State and DCN for{" "}
                <em>faute inexcusable de l'employeur</em>; the State chose
                not to appeal, cementing the precedent that executives are
                liable for failing to assess and mitigate foreign
                operational risks.
              </p>
              <p>
                Article 121-3 of the French Criminal Code targets individuals
                who indirectly cause harm by omission. Executives, CSOs, and
                delegates can be personally and criminally liable for{" "}
                <em>faute caractérisée</em> or{" "}
                <em>faute délibérée</em>. On 21 January 2025, the Criminal
                Division of the French Supreme Court enshrined{" "}
                <span className="text-white">
                  "institutional psychological harassment"
                </span>{" "}
                into law — failure to implement individualized travel risk
                assessments for vulnerable demographic groups operates within
                this exact matrix of criminal liability.
              </p>

              <SubHeading>
                Germany — <em>Fürsorgepflicht</em> and Executive Negligent
                Homicide
              </SubHeading>
              <p>
                German criminal law (StGB) reserves criminal liability
                exclusively for natural persons. When an enterprise fails in
                its duty of care, the crosshairs of the German judicial
                system bypass the corporate shell entirely and lock onto
                individual managing directors, CSOs, and HR leaders.
              </p>
              <p>
                Section 618 BGB codifies the{" "}
                <em>Fürsorgepflicht</em> — the obligation to arrange,
                maintain, and regulate operations so that employees are
                protected against risks to life and health. Travel time spent
                in the employer's interest is treated as working time,
                extending the geographic and temporal reach of liability.
              </p>
              <p>
                A failure that results in injury or death abroad leads to
                charges of{" "}
                <span className="text-white">
                  <em>Fahrlässige Tötung</em> (§ 222 StGB)
                </span>{" "}
                or <em>Fahrlässige Körperverletzung</em> (§ 229 StGB),
                punishable by imprisonment. Under § 30 OWiG, the company
                itself is exposed to exorbitant administrative fines for
                supervisory failures by managerial representatives.
              </p>

              <ComparisonTable
                caption="Sovereign jurisdictional exposure"
                headers={[
                  "Jurisdiction",
                  "Primary statutory doctrine",
                  "Executive criminal exposure",
                  "Key precedents",
                ]}
                rows={[
                  [
                    "United Kingdom",
                    "Gross breach of duty of care (HSWA 1974 & CMCHA 2007)",
                    "Gross Negligence Manslaughter — maximum life imprisonment; mandatory director disqualification",
                    "Cotswold Geotechnical Holdings; Lion Steel Equipment",
                  ],
                  [
                    "France",
                    "Faute inexcusable (absolute safety obligation, Labour Code)",
                    "Faute caractérisée / délibérée — imprisonment + personal fines",
                    "2002 Karachi bombing (TASS 2004); 2025 Institutional Psychological Harassment ruling",
                  ],
                  [
                    "Germany",
                    "Fürsorgepflicht (BGB § 618)",
                    "Fahrlässige Tötung (§ 222 StGB) / Fahrlässige Körperverletzung (§ 229 StGB)",
                    "Federal Labor Court travel-time rulings; Middle East travel-refusal precedents",
                  ],
                ]}
                testid="catch22-table-hammer"
              />

              <Callout icon={Hammer} label="What this means operationally" tone="warn">
                The era of relying on generic travel insurance or automated
                booking tools is over. Executives must conclusively prove
                they used <em>bespoke intelligence</em> to protect the
                specific, individualized vulnerabilities of their personnel
                — or face the Hammer.
              </Callout>
            </BriefSection>

            <BriefSection
              id="anvil"
              number="II"
              title="The Anvil — Unlimited Corporate Financial Ruin"
            >
              <p>
                The European regulatory apparatus has weaponized civil and
                administrative law so that failures in human-rights due
                diligence, supply-chain management, and employee protection
                produce catastrophic balance-sheet destruction. The
                mechanisms are vigilance laws, supply-chain due-diligence
                acts, and a continent-wide surge in class-action litigation.
              </p>

              <SubHeading>
                The French <em>Loi de Vigilance</em> — Extraterritorial
                Devastation
              </SubHeading>
              <p>
                The French Corporate Duty of Vigilance Law (2017) targets
                companies with ≥5,000 employees domestically (or ≥10,000
                globally including subsidiaries). It mandates an annual{" "}
                <span className="text-white">Vigilance Plan</span> that
                identifies risks and establishes preventative measures
                across direct activities, overseas subsidiaries,
                subcontractors, and supply-chain partners.
              </p>
              <p>
                Failure to publish or implement triggers administrative fines
                up to <span className="text-white">€10M</span>; if the
                failure produces preventable damage, fines escalate to{" "}
                <span className="text-white">€30M</span> — and these are
                additive to <span className="text-white">unlimited civil
                liability</span> under French tort law.
              </p>
              <p>
                The December 2023 ruling against{" "}
                <span className="text-white">La Poste</span> — and the
                landmark March 2026 ruling against{" "}
                <span className="text-white">Yves Rocher</span> in the 34th
                Chamber of the Paris Court of Justice — conclusively prove
                that European parent companies cannot silo liability in
                high-risk foreign jurisdictions. A failure to map the
                individualized risks faced by personnel deployed abroad
                travels directly upstream to corporate headquarters in Paris.
              </p>

              <SubHeading>
                Germany's LkSG — Systemic Revenue Extraction
              </SubHeading>
              <p>
                The <em>Lieferkettensorgfaltspflichtengesetz</em> (LkSG, in
                force January 2023; expanded January 2024 to companies with
                &gt;1,000 employees) imposes due-diligence obligations across
                the entire operational footprint. Enforcement by BAFA is
                designed to inflict maximum financial pain.
              </p>
              <p>
                For corporations with global turnover &gt;€400M, BAFA can
                impose fines up to{" "}
                <span className="text-white">2% of global annual revenue</span>
                . Any company fined &gt;€175,000 is excluded from German
                public procurement for up to{" "}
                <span className="text-white">three years</span>. Section 11
                LkSG grants <em>besondere Prozessstandschaft</em> to NGOs
                and trade unions, weaponizing the company's own mandatory
                reporting against it through tort claims under BGB § 823.
              </p>

              <SubHeading>
                The Surge in Class Actions and Settlements
              </SubHeading>
              <p>
                Since 2010, EU-based multinationals have paid the equivalent
                of <span className="text-white">$43B (≈€37B)</span> in
                regulatory penalties and settlements in cases brought
                outside the EU (Violation Tracker Global). The EU
                Representative Actions Directive has accelerated class
                actions across Member States. Recent UK class actions seek
                in excess of <span className="text-white">€120B</span>{" "}
                collectively, including a €41B claim related to the Mariana
                dam disaster. The German Federal Supreme Court has removed
                strict upper limits on nursing-care costs for severely
                injured persons — driving future medical-reserve settlements
                exponentially higher.
              </p>

              <ComparisonTable
                caption="Corporate financial exposure vectors"
                headers={[
                  "Liability vector",
                  "Enforcing statute / mechanism",
                  "Maximum exposure",
                ]}
                rows={[
                  [
                    "Extraterritorial subsidiary liability",
                    "French Loi de Vigilance",
                    "€30M statutory fine + unlimited civil tort damages (Yves Rocher 2026)",
                  ],
                  [
                    "Supply chain & occupational safety",
                    "German LkSG",
                    "2% of global annual turnover; 3-year ban from public procurement",
                  ],
                  [
                    "Mass torts & negligence",
                    "EU Representative Actions Directive / NGO litigation",
                    "Open-ended class settlements (€41B Mariana dam claim; €37B total EU foreign penalties)",
                  ],
                ]}
                testid="catch22-table-anvil"
              />

              <Callout icon={Skull} label="What this means commercially" tone="danger">
                Failures of the duty of care are no longer quiet HR
                dismissals — they are highly publicized, multi-million-euro
                settlements executed under RAD-empowered class litigation,
                overseen by aggressive regulatory bodies eager to extract
                2% of global turnover.
              </Callout>
            </BriefSection>

            <BriefSection
              id="trap"
              number="III"
              title="The Trap — GDPR Article 9 as Accelerator"
            >
              <p>
                The Hammer and the Anvil together establish a non-negotiable
                operational mandate: enterprises must conduct deep, bespoke,
                individualized risk assessments before deploying any
                employee. ISO 31030:2021 codifies this duty.
              </p>
              <p>
                But the moment a CSO, HR Director, or travel manager attempts
                to comply with ISO 31030, they step directly into the legal
                trap of <span className="text-white">GDPR Article 9</span>.
              </p>

              <SubHeading>The Legal Friction</SubHeading>
              <p>
                To accurately assess whether an employee is safe to travel
                to specific jurisdictions, the enterprise must definitively
                know whether that employee is LGBTQ+, has a hidden
                travel-limiting disability, or requires accommodations for
                a neurodivergent condition.
              </p>
              <p>
                Under GDPR Article 9(1), processing of "special categories"
                — racial or ethnic origin, political opinions, religious or
                philosophical beliefs, genetic data, biometric data, health
                data, and data concerning a person's sex life or sexual
                orientation — is strictly prohibited. The very data ISO
                31030 demands is the data the EU explicitly forbids
                collecting.
              </p>
              <p>
                Article 9(2) exceptions are practically useless for travel
                risk:
              </p>
              <ul className="mt-2 space-y-3 pl-1 text-[15px] leading-relaxed text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                  <span>
                    <span className="text-white">Explicit consent (9(2)(a))</span>
                    {" "}— rarely "freely given" in employment contexts due
                    to the inherent power imbalance.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                  <span>
                    <span className="text-white">
                      Employment law obligations (9(2)(b))
                    </span>
                    {" "}— preemptive travel-risk profiling fails the necessity
                    and proportionality tests.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                  <span>
                    <span className="text-white">Vital interests (9(2)(c))</span>
                    {" "}— applies only in acute, life-or-death emergencies;
                    no cover for routine pre-trip planning.
                  </span>
                </li>
              </ul>
              <p>
                The CJEU's Lithuanian anti-corruption ruling extended Article
                9 to data that{" "}
                <span className="text-white">indirectly reveals</span>{" "}
                special-category data through cross-referencing or
                deduction. Logging a same-sex spouse as an emergency contact
                or a specific medication accommodation is illegal processing
                of sexual orientation and health data. Profiling an employee
                to satisfy ISO 31030 automatically constitutes illegal
                Article 9 processing under this reasoning.
              </p>

              <SubHeading>"Shadow HR" — The Inevitable Breach</SubHeading>
              <p>
                Trapped between protecting vulnerable employees and being
                legally barred from recording their vulnerabilities in the
                official HRIS, middle management resorts to{" "}
                <span className="text-white">Shadow HR</span>: decentralized
                spreadsheets tracking who is LGBTQ+, who needs psychiatric
                medication, who must not be deployed to specific
                jurisdictions.
              </p>
              <p>
                This is now compounded by{" "}
                <span className="text-white">Shadow AI</span>: a recent
                SAP/WalkMe survey found{" "}
                <span className="text-white">78%</span> of employees use
                unapproved consumer-grade AI tools at work. Sensitive
                health and demographic data routinely flows from shadow
                spreadsheets into public LLMs.
              </p>
              <p>
                Insider risks driven by negligence cost businesses an average
                of <span className="text-white">$19.5M/year</span>. Shadow
                data breaches take 26.2% longer to identify and 20.2% longer
                to contain (~291 days), with average breach cost of $5.27M.
                The regulatory wrath is worse: Article 9 violations trigger
                the upper-tier penalty framework — fines up to{" "}
                <span className="text-white">
                  €20M or 4% of total worldwide annual turnover
                </span>
                . Amazon Europe (€746M), Meta Ireland (€1.2B and €91M)
                demonstrate this is not theoretical.
              </p>

              <Callout icon={ShieldAlert} label="The cornered enterprise" tone="danger">
                <ul className="mt-1 space-y-2 text-sm text-slate-300">
                  <li>
                    <span className="text-white">Path A —</span> Ignore ISO
                    31030: criminal Hammer + LkSG/Loi de Vigilance Anvil.
                  </li>
                  <li>
                    <span className="text-white">Path B —</span> Officially
                    store special-category data: documented Article 9
                    violation, 4% global turnover.
                  </li>
                  <li>
                    <span className="text-white">Path C —</span> Tolerate
                    Shadow HR: untrackable breach, the same €20M+ regulatory
                    execution, plus reputational damage and uninsurable
                    losses.
                  </li>
                </ul>
              </Callout>
            </BriefSection>

            <BriefSection
              id="market"
              number="IV"
              title="Market Scale & The Stateless Architecture Solution"
            >
              <p>
                The requirement to manage demographic vulnerability during
                travel is not a niche HR grievance — it is a systemic,
                multi-billion-euro operational vulnerability affecting a
                massive percentage of the modern corporate workforce.
              </p>

              <SubHeading>The Intersectional Risk Matrix</SubHeading>
              <ComparisonTable
                caption="Demographic risk vectors"
                headers={[
                  "Vector",
                  "Market scale / exposure",
                  "Critical liability statistic",
                ]}
                rows={[
                  [
                    "LGBTQ+ personnel",
                    "61 nations criminalize identity; 14 criminalize trans expression",
                    "55% of enterprise travel buyers ignore this demographic entirely; only 13% of travelers receive LGBTQ+ pre-travel info",
                  ],
                  [
                    "Neurodivergent / disabled",
                    "15–20% of global population; 18.6M US workers report travel-limiting disabilities",
                    "49% experience negative travel events; only 15% of buyers consider neurodivergence",
                  ],
                  [
                    "Female travelers",
                    "≈50% of the global workforce",
                    "67% deem international travel unsafe for women; only 16% receive specialized briefings",
                  ],
                ]}
                testid="catch22-table-market"
              />
              <p>
                With up to <span className="text-white">30%</span> of a
                multinational's workforce potentially falling into one or
                more special-data categories, manual management guarantees a
                GDPR breach — while ignoring it guarantees an executive
                manslaughter charge.
              </p>

              <SubHeading>Why Legacy "Data Lake" Architecture Fails</SubHeading>
              <p>
                Legacy HRIS and traditional enterprise AI orchestration
                platforms are{" "}
                <span className="text-white">stateful</span> by design —
                built for retention, historical tracking, and persistent
                context. A stateful AI assistant integrated with an HR data
                lake to generate a travel risk assessment{" "}
                <em>permanently logs the transaction</em>, creating an
                indelible, auditable footprint of illegal Article 9
                processing.
              </p>
              <p>
                It is technically impossible to achieve GDPR Article 9
                compliance within a stateful environment while
                simultaneously satisfying the personalized mandates of ISO
                31030. The architecture conflates the action of protecting
                the employee with the liability of storing their data.
              </p>

              <SubHeading>The Stateless AI Resolution</SubHeading>
              <p>
                The only mathematically sound resolution to the Catch-22 is{" "}
                <span className="text-white">Stateless AI Architecture</span>{" "}
                — a Zero Data Retention environment that treats every
                interaction as an isolated, discrete event with absolutely
                no memory of past inputs or user behavior.
              </p>

              <div className="my-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    1. Algorithmic Isolation
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Operates entirely outside the legacy HRIS and central
                    data lakes. Zero API integration with core personnel
                    files — no cross-contamination, no systemic logging.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    2. Sovereign Legal Synthesis
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Trained exclusively on real-time sovereign legal and
                    geopolitical data — UAE penal codes, Indonesian
                    medication regulations, French accessibility
                    infrastructure, regional union-activity criminalization.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    3. Ephemeral Processing
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    The traveler interfaces voluntarily and anonymously.
                    The AI synthesizes sovereign threat data against
                    transient inputs in an isolated session-scoped context.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <div className="mt-3 text-sm font-semibold text-white">
                    4. Dossier + Instant Purge
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    A bespoke Inclusion Safety Dossier is delivered. The
                    millisecond it is delivered, an automated context-clear
                    protocol permanently and irreversibly destroys session
                    memory, inputs, and outputs. Nothing is written to disk,
                    backed up, or retained.
                  </p>
                </div>
              </div>

              <Callout icon={Gavel} label="The dual compliance posture">
                Stateless architecture rigorously fulfils ISO 31030, French{" "}
                <em>faute inexcusable</em>, and German{" "}
                <em>Fürsorgepflicht</em> — shielding executives from the
                Hammer. Because the system possesses zero persistent memory
                and never records special-category data, it remains fully
                compliant with the absolute prohibitions of GDPR Article 9 —
                eliminating the €20M / 4% Anvil and neutralizing the Shadow
                HR Trap.
              </Callout>
            </BriefSection>

            <BriefSection id="next" number="V" title="The Pilot">
              <p>
                For enterprise leadership and the capital markets that fund
                them, the conclusion is absolute: the legal friction between
                duty of care and data privacy is an existential threat to
                modern multinational operations. Capital allocation and
                procurement must urgently pivot away from legacy HR data
                lakes and invest decisively in stateless AI architectures.
              </p>
              <p>
                Third Rail Systems OÜ runs paid, time-boxed enterprise pilots
                — typically 4 to 6 weeks — that require{" "}
                <span className="text-white">
                  zero API integration with your HRIS
                </span>
                . The pilot produces a signed architecture fit-assessment, a
                sample Inclusion Safety Dossier for a live destination, and
                a compliance binder your DPO can actually file.
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

              <p className="mt-10 mono text-xs uppercase tracking-[0.2em] text-slate-500">
                <Globe className="mr-2 inline h-3 w-3 text-cyan-400" />
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
