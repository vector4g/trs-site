import {
  GraduationCap,
  FlaskConical,
  Globe,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader } from "./shared";

const ADVISORS = [
  {
    name: "Dr. Sidra Azmat Butt",
    role: "Scientific Advisor · Head of Algorithmic Validation",
    affiliation:
      "Researcher, Next Gen Digital State Research Group, Department of Software Science — Tallinn University of Technology (TalTech)",
    credentials: [
      {
        Icon: GraduationCap,
        text: "PhD, Information Technology — TalTech (2019 – 2023).",
      },
      {
        Icon: FlaskConical,
        text:
          "Research domains: AI adoption, digital government, eGovernance, public-sector digitalization.",
      },
      {
        Icon: BookOpen,
        text:
          "16 peer-reviewed publications. Reviewer for IEEE Access, ACM dg.o, ICEDEG, and MDPI Information.",
      },
      {
        Icon: Globe,
        text:
          "Contributor to three EU-funded research programmes — Interreg Baltic Sea Region (OSIRIS), ESF IT Academy, and EGov4Youth (Erasmus+).",
      },
    ],
    scope: [
      "Independent oversight on Third Rail's AI adoption posture and EU AI Act conformity assessment.",
      "Validation of GDPR privacy-by-design principles applied to the transient, on-device processing architecture.",
      "Bridge between commercial deployment and publishable academic case-study work in AI governance.",
    ],
  },
];

export default function AdvisoryBoard() {
  return (
    <section
      id="advisory"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="advisory-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="08"
          eyebrow="Scientific Advisory"
          title="Independent algorithmic validation"
          description="A working scientific advisor — not a logo — providing public-sector-grade oversight of our AI conformity posture."
        />

        <div className="mt-14 grid gap-6">
          {ADVISORS.map((a) => (
            <article
              key={a.name}
              className="reveal grid gap-10 rounded-lg border border-slate-800 bg-slate-900/60 p-8 sm:p-10 lg:grid-cols-12"
              data-testid="advisor-card-sidra"
            >
              {/* Identity column */}
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  TalTech · Tallinn
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {a.name}
                </h3>
                <div className="mt-2 mono text-[11px] uppercase tracking-[0.18em] text-cyan-400">
                  {a.role}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {a.affiliation}
                </p>

                <ul className="mt-6 space-y-3">
                  {a.credentials.map(({ Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 text-[13px] leading-relaxed text-slate-300"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scope column */}
              <div className="lg:col-span-7">
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-6">
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    Advisory scope
                  </div>
                  <ul className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                    {a.scope.map((s) => (
                      <li key={s} className="flex items-start gap-3">
                        <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-3">
                    <div>
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        Frameworks
                      </div>
                      <div className="mt-1 text-sm text-slate-200">
                        EU AI Act · GDPR Art. 9
                      </div>
                    </div>
                    <div>
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        Standard
                      </div>
                      <div className="mt-1 text-sm text-slate-200">
                        ISO 31030
                      </div>
                    </div>
                    <div>
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        Posture
                      </div>
                      <div className="mt-1 text-sm text-slate-200">
                        Limited-Risk · HITL
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Independent academic oversight — Third Rail Systems OÜ does
                  not control Dr. Butt's research output.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
