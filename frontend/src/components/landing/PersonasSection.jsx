import { Shield, Lock, Users, Heart, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./shared";

const PERSONAS = [
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
      "Utilize a pre-audited AI architecture built to EU AI Act high-risk obligations.",
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
  {
    tag: "For Civil Society",
    Icon: Heart,
    points: [
      "Protect human rights defenders, activists, and field staff without creating internal demographic registers.",
      "Deploy intersectional safety assessments aligned with donor compliance frameworks (USAID 2 CFR 200, EU AI Act, GDPR).",
      "Pilot pricing for design partners; pro-bono deployment available for qualifying mission-aligned organizations.",
    ],
    outcome:
      "Mission-aligned safety infrastructure that withstands donor audit and protects the people you serve.",
  },
];

export default function PersonasSection({ onCtaClick }) {
  return (
    <section
      id="solutions"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="personas-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="04"
          eyebrow="Solutions by persona"
          title="Bridging Security, Privacy, and Inclusion"
          description="Three mandates. One architecture. Each function keeps its own remit intact."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map(({ tag, Icon, points, outcome }, idx) => (
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

              {outcome && (
                <p className="mt-5 rounded-md border border-cyan-500/20 bg-cyan-500/[0.04] p-3 text-[13px] leading-relaxed text-slate-300">
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    Outcome ·{" "}
                  </span>
                  {outcome}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-5">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {outcome ? "Next step" : "Outcome"}
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
