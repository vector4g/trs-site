import { MapPin, Globe } from "lucide-react";
import { SectionHeader } from "./shared";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="about-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <SectionHeader
              index="07"
              eyebrow="About & origin"
              title="Built on Earned Secrets"
            />
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Third Rail Systems was founded on a singular operational truth:
              institutional safety requires deep visibility, but human privacy
              requires absolute discretion. We built the minimum-disclosure
              compliance layer to resolve this paradox.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Registered
                </div>
                <div className="text-sm text-slate-100">
                  Tallinn, Estonia — European Union
                </div>
              </div>
            </div>
          </div>

          <div className="reveal lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="founder-ceo"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  CEO
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Levi Hankins
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  20-year US Navy combat veteran with lived experience under
                  "Don't Ask, Don't Tell." Operational authority on discretion
                  under institutional scrutiny.
                </p>
              </div>

              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                data-testid="founder-cto"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  CTO
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Jeremy Stabile
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Fortune 500 SecOps and GRC architecture expert. Designs the
                  stateless synthesis layer and HITL oversight controls.
                </p>
              </div>

              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:col-span-2"
                data-testid="estonia-advantage"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-cyan-400" />
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    The Estonia Advantage
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Proudly registered in Tallinn, Estonia, ensuring a strict
                  European corporate footprint immune to US jurisdictional
                  overreach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
