import { Scale, Cpu, FileText } from "lucide-react";
import { SectionHeader } from "./shared";

const ROWS = [
  {
    tag: "GDPR",
    Icon: Scale,
    body:
      'We do not centralise "special-category data." The enterprise remains the Controller of standard itineraries; Third Rail acts as a Processor.',
  },
  {
    tag: "EU AI Act",
    Icon: Cpu,
    body:
      "Built to meet EU AI Act high-risk obligations, with mandatory human-in-the-loop oversight and immutable vector logging. Final classification under review with counsel.",
  },
  {
    tag: "ISO 31030",
    Icon: FileText,
    body:
      "Verifiable, date-stamped evidence that the organisation assessed intersectional threats prior to deployment.",
  },
];

export default function ComplianceSection() {
  return (
    <section
      id="compliance"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="compliance-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="05"
          eyebrow="Governance"
          title="Engineered for the Modern Regulatory Landscape"
          description="Every architectural decision maps to a defensible compliance artefact."
        />

        <div className="reveal mt-14 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
          {ROWS.map(({ tag, Icon, body }, i) => (
            <div
              key={tag}
              className={`grid gap-6 p-7 sm:grid-cols-[180px,1fr] sm:items-start ${
                i < ROWS.length - 1 ? "border-b border-slate-800" : ""
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
