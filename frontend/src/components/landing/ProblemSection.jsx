import { ShieldAlert, Lock, Users, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "./shared";

const ITEMS = [
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

export default function ProblemSection() {
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
          {ITEMS.map(({ Icon, title, body }, idx) => (
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
              <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {body}
              </p>
              <div className="mt-auto pt-6">
                <div className="h-px bg-slate-800 transition-colors group-hover:bg-cyan-500/40" />
              </div>
            </div>
          ))}
        </div>

        {/* Long-form brief teaser */}
        <Link
          to="/catch-22"
          className="reveal group mt-10 flex flex-col items-start justify-between gap-5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/10 sm:flex-row sm:items-center sm:p-7"
          data-testid="catch22-teaser"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/60 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                The Shadow HR Liability · 8-min read
              </div>
              <div className="mt-1 text-base font-semibold text-white sm:text-lg">
                Sitting on the next €35M GDPR fine.
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                Why every multinational with a diverse workforce is sitting
                on the next €35 million GDPR fine — and the architectural
                pattern that resolves it.
              </p>
            </div>
          </div>
          <span className="mono inline-flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300 transition-transform group-hover:translate-x-1">
            Read the brief
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
