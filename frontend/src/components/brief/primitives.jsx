/** Primitive sub-heading inside a BriefSection. */
export function SubHeading({ children }) {
  return (
    <h3 className="mt-10 text-xl font-semibold tracking-tight text-white sm:text-2xl">
      {children}
    </h3>
  );
}

/** Bulleted list with cyan square markers — matches the brief typography.
 *
 * `items` may be an array of strings OR an array of `{ id, content }` objects.
 * Using stable keys (item content for strings, item.id for objects) avoids
 * React reconciliation glitches when the parent ever reorders items.
 */
export function BulletList({ items }) {
  return (
    <ul className="mt-2 space-y-3 pl-1 text-[15px] leading-relaxed text-slate-300">
      {items.map((it, i) => {
        const key =
          typeof it === "string"
            ? `${i}:${it.slice(0, 32)}`
            : it.id || `${i}:${String(it).slice(0, 32)}`;
        return (
          <li key={key} className="flex items-start gap-3">
            <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan-400" />
            <span>{it}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Pull quote with a cyan left border and optional attribution. */
export function PullQuote({ children, source }) {
  return (
    <blockquote className="my-6 border-l-2 border-cyan-500/60 bg-slate-900/40 px-5 py-4">
      <p className="text-lg italic leading-snug text-white sm:text-xl">
        “{children}”
      </p>
      {source && (
        <p className="mt-3 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          — {source}
        </p>
      )}
    </blockquote>
  );
}

/**
 * Callout strip with a small icon tile + label + body.
 *
 * `tone` controls the icon-tile colour — `cyan` (default) for neutral
 * informational callouts, `warn` for amber regulatory cautions, `danger` for
 * rose-tinted enforcement / liability warnings.
 */
export function Callout({ icon: Icon, label, children, tone = "cyan" }) {
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

/** Numbered diagnostic question card — used in the Catch-22 diagnostic section. */
export function DiagnosticQuestion({ index, title, children }) {
  return (
    <div className="reveal rounded-lg border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-baseline gap-4">
        <span className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
          Q{index}
        </span>
        <h4 className="text-base font-semibold tracking-tight text-white sm:text-lg">
          {title}
        </h4>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-300">
        {children}
      </div>
    </div>
  );
}
