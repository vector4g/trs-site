import { MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader, LEVI_LINKEDIN_URL } from "./shared";

function LinkedInGlyph({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

const TEAM = [
  {
    role: "CEO",
    name: "Levi Hankins",
    bio: [
      '20-year US Navy combat veteran with lived experience under "Don\'t Ask, Don\'t Tell." Operational authority on discretion under institutional scrutiny.',
      "Founded Third Rail Systems to build the infrastructure that did not exist when he served — for enterprises managing duty-of-care obligations, and for civil-society organizations protecting the activists who do the most exposed work.",
    ],
    testid: "founder-ceo",
    linkedinUrl: LEVI_LINKEDIN_URL,
    linkedinTestid: "founder-ceo-linkedin",
  },
  {
    role: "CTO",
    name: "Jeremy Stabile",
    bio: [
      "Cybersecurity analyst with national-security research depth (RAND), HIPAA-grade healthcare GRC experience (Cedars-Sinai, UCLA), and German multinational GDPR experience (Karl Storz). Lead engineer of the stateless synthesis architecture and Human-In-The-Loop oversight controls.",
    ],
    testid: "founder-cto",
  },
  {
    role: "Head of Algorithmic Validation",
    name: "Dr. Sidra Azmat Butt",
    bio: [
      "PhD, Information Technology — TalTech. Researcher, Next Gen Digital State Research Group. Independent oversight on EU AI Act conformity and GDPR privacy-by-design.",
    ],
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
                  <div className="mt-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      {member.name}
                    </h3>
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 transition-colors hover:text-cyan-400"
                        aria-label={`${member.name} on LinkedIn`}
                        data-testid={member.linkedinTestid}
                      >
                        <LinkedInGlyph className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">
                    {(Array.isArray(member.bio) ? member.bio : [member.bio]).map(
                      (paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ),
                    )}
                  </div>
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
