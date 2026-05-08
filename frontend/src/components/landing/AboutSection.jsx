import { MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "./shared";

const TEAM = [
  {
    role: "CEO",
    name: "Levi Hankins",
    bio:
      '20-year US Navy combat veteran with lived experience under "Don\'t Ask, Don\'t Tell." Operational authority on discretion under institutional scrutiny.',
    testid: "founder-ceo",
  },
  {
    role: "CTO",
    name: "Jeremy Stabile",
    bio:
      "Fortune 500 SecOps and GRC architecture expert. Designs the stateless synthesis layer and HITL oversight controls.",
    testid: "founder-cto",
  },
  {
    role: "Head of Algorithmic Validation",
    name: "Dr. Sidra Azmat Butt",
    bio:
      "PhD, Information Technology — TalTech. Researcher, Next Gen Digital State Research Group. Independent oversight on EU AI Act conformity and GDPR privacy-by-design.",
    testid: "core-team-sidra",
    badge: "TalTech · Tallinn",
    advisoryHref: "#advisory",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="about-section"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-4">
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

          <div className="reveal lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-6"
                  data-testid={member.testid}
                >
                  <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    {member.role}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {member.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {member.bio}
                  </p>
                  {member.badge && (
                    <div className="mt-4 inline-flex w-fit items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                      {member.badge}
                    </div>
                  )}
                  {member.advisoryHref && (
                    <Link
                      to={member.advisoryHref}
                      className="mt-4 mono text-[10px] uppercase tracking-[0.22em] text-slate-500 hover:text-cyan-400"
                      data-testid="core-team-sidra-advisory-link"
                    >
                      See full advisory profile →
                    </Link>
                  )}
                </div>
              ))}

              <div
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 sm:col-span-2 lg:col-span-3"
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
