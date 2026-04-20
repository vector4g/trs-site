import { Fingerprint, Server, FileText } from "lucide-react";
import { SectionHeader } from "./shared";

const FEATURES = [
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

export default function PlatformSection() {
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
              {FEATURES.map(({ Icon, label, title, body }, i) => (
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
