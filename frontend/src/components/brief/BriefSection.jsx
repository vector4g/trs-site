/**
 * Numbered section block used inside long-form briefs (`/catch-22`, `/memo`,
 * and any future briefs that follow the same long-form rhythm).
 *
 * The cyan-line motif (`.trs-section-line`) draws in when the parent `.reveal`
 * gains `.is-visible` — purely CSS, no per-component state.
 */
export function BriefSection({ id, number, title, children, headingId }) {
  return (
    <section
      id={id}
      className="reveal scroll-mt-24 border-t border-slate-900 py-16 first:border-t-0 first:pt-0 sm:py-20"
      data-testid={`brief-section-${id}`}
    >
      <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-cyan-400">
        <span>{number}</span>
        <span className="trs-section-line" aria-hidden="true" />
      </div>
      {/* `headingId` adds a stable machine-citation anchor on the heading
          itself (kebab-case of the heading text), independent of the
          section wrapper id used by the TOC. */}
      <h2
        id={headingId}
        className="mt-4 scroll-mt-24 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
      >
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-slate-300 sm:text-base">
        {children}
      </div>
    </section>
  );
}
