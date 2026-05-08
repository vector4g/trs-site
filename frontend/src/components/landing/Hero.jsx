import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Globe,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero({ onPrimary, onSecondary }) {
  return (
    <section
      className="relative isolate overflow-hidden pt-32 sm:pt-40"
      data-testid="hero-section"
    >
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 0%, rgba(34,211,238,0.12) 0%, rgba(11,15,20,0) 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-start gap-16 px-5 pb-24 sm:px-8 lg:grid-cols-12 lg:px-10 lg:pb-32">
        <div className="reveal lg:col-span-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300 mono"
            data-testid="hero-eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Resolving the Duty-of-Care Data Trap
          </div>

          <h1
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="hero-headline"
          >
            Travel risk systems that account for{" "}
            <span className="text-cyan-400">real people</span>, not generic
            averages.
          </h1>

          <p
            className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg"
            data-testid="hero-subheadline"
          >
            Third Rail Systems enables Fortune 500 security teams to fulfill ISO
            31030 travel risk mandates for marginalized employees—without
            triggering GDPR special-category data liabilities.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onPrimary}
              data-testid="hero-primary-cta"
              className="btn-glow h-11 bg-cyan-500 px-6 text-slate-950 hover:bg-cyan-400"
            >
              Request Pilot Assessment
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondary}
              data-testid="hero-secondary-cta"
              className="h-11 border-slate-700 bg-slate-900/60 px-6 text-slate-100 hover:bg-slate-800 hover:text-white"
            >
              Read Strategic Memo
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400 mono uppercase tracking-[0.18em]"
            data-testid="hero-trust-bar"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              ISO 31030
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              GDPR Article 9
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <span className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              EU AI Act · Annex IV
            </span>
          </div>
        </div>

        <div className="reveal lg:col-span-4">
          <div
            className="relative rounded-lg border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/50"
            data-testid="hero-console"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Dossier / DSF-0342
              </span>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Destination
                </div>
                <div className="mt-1 text-sm text-slate-100">
                  Kuala Lumpur, MY
                </div>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Threat Tier
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Elevated
                  </div>
                </div>
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Data Class
                  </div>
                  <div className="mt-1 text-sm text-white">On-device</div>
                </div>
              </div>
              <div className="h-px bg-slate-800" />
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Mitigations
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Avoid Jalan Alor 23:00–04:00
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Verified lodging cluster: KLCC / Bangsar
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    Local counsel hotline attached
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  GDPR Art. 9
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No special-category data logged
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Illustrative operator view — sanitized dossier
          </p>
        </div>
      </div>
    </section>
  );
}
