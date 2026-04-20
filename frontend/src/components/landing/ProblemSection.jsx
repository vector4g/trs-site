import { ShieldAlert, Lock, Users } from "lucide-react";
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
      </div>
    </section>
  );
}
