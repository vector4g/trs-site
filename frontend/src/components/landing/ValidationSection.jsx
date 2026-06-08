import { ShieldCheck, FileCheck2, ExternalLink } from "lucide-react";
import { SectionHeader, openExternal } from "./shared";

const KTH_REPORT_URL =
  "https://customer-assets.emergentagent.com/job_eu-travel-risk/artifacts/d4unbyo0_KTH%20IRL%20Evidence%20Report%20Third%20Rail%20Systems.docx";

// Scores recorded in the KTH Innovation Readiness Level (IRL) Evidence Report.
// Each entry mirrors the verbatim 1-line evaluator finding from the report.
const IRL_DIMENSIONS = [
  {
    code: "TRL",
    label: "Technology",
    score: 5,
    finding:
      "System validated in relevant environment with integrated components operating end-to-end.",
  },
  {
    code: "CRL",
    label: "Customer",
    score: 4,
    finding: "Customer segmentation with initial basic customer profiles in place.",
  },
  {
    code: "BRL",
    label: "Business",
    score: 5,
    finding:
      "Validated calculations of main costs and revenues; pricing model and unit economics documented.",
  },
  {
    code: "IPRL",
    label: "IP",
    score: 4,
    finding:
      "Confirmed possibilities for protection of key IPR through professional searches and analysis.",
  },
  {
    code: "TMRL",
    label: "Team",
    score: 5,
    finding:
      "Initial founding team working together, all spending significant time on the venture.",
  },
  {
    code: "FRL",
    label: "Funding",
    score: 4,
    finding:
      "Documented 12-month development plan with costs and activities; identified funding sources and pre-seed strategy in place.",
  },
];

// One verbatim quote from the report, attributed to the document not to KTH
// itself (the report is a self-assessment under KTH's IRL framework).
const HEADLINE_QUOTE =
  "The core multi-agent synthesis logic has been fully engineered and independently validated.";

// Score pip — five dots, score-many filled with cyan.
const ScorePips = ({ score }) => {
  const filled = Math.max(0, Math.min(5, Number(score) || 0));
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Score ${filled} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={`pip-${i}`}
          className={`h-1.5 w-3 ${
            i < filled ? "bg-cyan-400" : "bg-slate-700"
          }`}
        />
      ))}
    </div>
  );
};

export default function ValidationSection() {
  return (
    <section
      id="validation"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="validation-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="06"
          eyebrow="Independent validation"
          title="KTH Innovation Readiness Level (IRL) · Evidence Report"
          description="Third Rail Systems OÜ has been evidenced under KTH Royal Institute of Technology's Deeptech Startup Network IRL framework: six structured dimensions of readiness, scored against the international standard."
        />

        <div className="reveal mt-14 grid gap-6 lg:grid-cols-12">
          {/* Scorecard */}
          <div className="lg:col-span-7">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:p-8" data-testid="irl-scorecard">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                      KTH IRL Evidence Report
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Deeptech Startup Network · six-dimension assessment
                    </div>
                  </div>
                </div>
                <span className="hidden mono text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:inline">
                  6 / 6 dimensions
                </span>
              </div>

              <ul className="mt-2 divide-y divide-slate-800">
                {IRL_DIMENSIONS.map((d) => (
                  <li
                    key={d.code}
                    className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[88px,80px,1fr] sm:items-center sm:gap-5"
                    data-testid={`irl-row-${d.code.toLowerCase()}`}
                  >
                    <div>
                      <div className="mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
                        {d.code}
                      </div>
                      <div className="text-xs text-slate-500">{d.label}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScorePips score={d.score} />
                      <span className="mono text-xs text-slate-300">
                        L{d.score}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-300">
                      {d.finding}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quote + provenance */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col gap-5">
              <figure
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:p-7"
                data-testid="irl-quote"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  From the report
                </div>
                <blockquote className="mt-4 text-[17px] leading-snug text-white">
                  &ldquo;{HEADLINE_QUOTE}&rdquo;
                </blockquote>
                <figcaption className="mt-4 mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  KTH IRL Evidence Report · Third Rail Systems OÜ
                </figcaption>
              </figure>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-start gap-3">
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <p className="text-[13px] leading-relaxed text-slate-300">
                    Independent technical validation confirmed the core
                    stateless synthesis methodology.{" "}
                    <span className="text-white">
                      Patent protection is in progress.
                    </span>
                  </p>
                </div>
                <a
                  href={KTH_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={openExternal(KTH_REPORT_URL)}
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
                  data-testid="irl-download-report"
                >
                  <ExternalLink className="h-4 w-4" />
                  View full IRL Evidence Report
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
