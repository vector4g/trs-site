import { Download, FileBadge, Layers, ArrowDown } from "lucide-react";
import { SectionHeader, openExternal } from "./shared";

const ISI_DIAGRAM_URL =
  "https://customer-assets.emergentagent.com/job_eu-travel-risk/artifacts/6113hgwr_ISI%20Architecture%20Diagram.pdf";

const LAYERS = [
  {
    num: "L1",
    title: "Context & Intelligence Grounding",
    sub: "Layer 1",
    annotation: "Special-category input · transient",
    components: [
      "Encrypted client ingestion",
      "EU-sovereign reference data",
      "Federated live telemetry",
    ],
  },
  {
    num: "L2",
    title: "Stateless Synthesis Enclave",
    sub: "Layer 2",
    annotation:
      "Multi-agent deliberation across heterogeneous model families · transient memory · adversarial review",
    components: [
      "TRS-01 Grandin · Sensory and Neuro-Safety",
      "TRS-02 Heumann · Physical Accessibility",
      "TRS-03 Crenshaw · Intersectional Identity",
    ],
  },
  {
    num: "L3",
    title: "Output Synthesis & Regulatory Alignment",
    sub: "Layer 3",
    annotation: "Zero retention · special-category inputs purged",
    components: [
      "Sanitised dossier · audit trail",
      "Enterprise and traveller outputs",
      "Global compliance mapping",
    ],
  },
];

const COMPLIANCE_TAGS = [
  {
    tag: "GDPR Article 9",
    note: "Safety intelligence without centralised storage of special-category data.",
  },
  {
    tag: "EU AI Act · Annex IV",
    note: "Human-in-the-loop oversight with logged data provenance.",
  },
  {
    tag: "ISO 31030",
    note: "Auditable proof of localised intersectional threat assessment prior to travel.",
  },
];

export default function ArchitectureDiagram() {
  return (
    <section
      id="architecture"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="architecture-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader
          index="03"
          eyebrow="ISI Architecture"
          title="Three layers. One zero-retention boundary."
          description="The Intersectional Safety Intelligence (ISI) flow: context grounded, statelessly analysed, and synthesised into a sanitised dossier. Special-category inputs are purged from transient memory before output."
        />

        {/* The diagram */}
        <div
          className="reveal mt-14 rounded-lg border border-slate-800 bg-slate-900/50 p-6 sm:p-8"
          data-testid="isi-diagram"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {LAYERS.map((l, idx) => (
              <div
                key={l.num}
                className="relative flex flex-col rounded-md border border-slate-800 bg-slate-950 p-5"
                data-testid={`isi-layer-${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    <Layers className="h-3 w-3" />
                    {l.num}
                  </div>
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Layer {idx + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                  {l.title}
                </h3>
                <div className="mt-1 text-xs text-slate-400">{l.sub}</div>

                <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-slate-300">
                  {l.components.map((c) => (
                    <li key={c} className="flex items-start gap-2.5">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <div className="rounded-sm border border-slate-800 bg-slate-900/60 px-3 py-2 mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {l.annotation}
                  </div>
                </div>

                {/* Connector arrow between layers (only on lg+) */}
                {idx < LAYERS.length - 1 && (
                  <div
                    className="pointer-events-none absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-950 text-cyan-400 lg:flex"
                    aria-hidden="true"
                  >
                    <ArrowDown className="h-4 w-4 -rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Boundary callout */}
          <div className="mt-6 rounded-md border border-cyan-500/30 bg-cyan-500/5 p-5">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
              Zero-retention boundary
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              All special-category demographic inputs are permanently deleted
              from transient memory enclaves between Layer&nbsp;2 and
              Layer&nbsp;3. The synthesised dossier emerges without an
              upstream identity record to attach it to.
            </p>
          </div>

          {/* Compliance mapping */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {COMPLIANCE_TAGS.map(({ tag, note }) => (
              <div
                key={tag}
                className="rounded-md border border-slate-800 bg-slate-950 p-4"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  {tag}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  {note}
                </p>
              </div>
            ))}
          </div>

          {/* Download schematic */}
          <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <FileBadge className="h-4 w-4 text-cyan-400" />
              Original schematic · Third Rail Systems OÜ, internal architecture
              brief.
            </div>
            <a
              href={ISI_DIAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openExternal(ISI_DIAGRAM_URL)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              data-testid="isi-download-pdf"
            >
              <Download className="h-4 w-4" />
              Download full schematic (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
