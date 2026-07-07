import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHeading from "@/components/SEOHeading";
import { useSEO, useJsonLd } from "@/lib/useSEO";

const CANONICAL = "https://thirdrailsystems.ee/reference";
const H1 = "Reference library";
const META_DESCRIPTION =
  "Machine-citable references on minimum-disclosure duty of care: special category data, travel risk DPIAs, medication at borders, assistance codes, civil-society casework, and the glossary. Every page carries stable section anchors.";

// Titles and descriptions mirror each page's H1 and meta description.
const REFERENCE_PAGES = [
  {
    route: "/special-category-data",
    title: "Special category data in employee travel",
    description:
      "What GDPR Article 9 prohibits, what ISO 31030 requires, and why most travel risk programmes are caught between the two. A reference for DPOs and security leads.",
  },
  {
    route: "/travel-risk-dpia",
    title: "Does travel risk management require a DPIA?",
    description:
      "Article 35, the criteria supervisory authorities apply, and what an honest DPIA of a travel risk programme usually finds. A working reference for DPOs.",
  },
  {
    route: "/medication-at-borders",
    title: "Prescription medication at borders: the employer problem",
    description:
      "Lawful prescriptions are controlled substances in some jurisdictions. Why medication is a travel risk, why asking about it is an Article 9 problem, and the architecture that resolves both.",
  },
  {
    route: "/assistance-codes",
    title: "What airline assistance codes disclose",
    description:
      "Requesting assistance transmits a standardised disability category through the reservation ecosystem. Who sees an SSR code, why it is special category data, and what employers should not hold.",
  },
  {
    route: "/civil-society",
    title: "Duty of care for human rights defenders: the file problem",
    description:
      "Monitoring and evacuation protect people in the field. Almost nothing protects them from the file built to qualify them for protection. A reference for casework and security leads.",
  },
  {
    route: "/glossary",
    title: "Glossary",
    description:
      "The vocabulary of minimum-disclosure architecture, defined once and citable by stable anchor. Terms coined elsewhere are credited to their authors.",
  },
];

export default function ReferenceIndex() {
  const navigate = useNavigate();

  useSEO({
    title: "Reference Library · Third Rail Systems",
    description: META_DESCRIPTION,
    canonical: CANONICAL,
  });

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: H1,
      url: CANONICAL,
      description: META_DESCRIPTION,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: REFERENCE_PAGES.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: REFERENCE_PAGES.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `https://thirdrailsystems.ee${p.route}`,
        })),
      },
    },
    "reference-collection-jsonld",
  );

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://thirdrailsystems.ee/",
        },
        { "@type": "ListItem", position: 2, name: H1, item: CANONICAL },
      ],
    },
    "reference-breadcrumb-jsonld",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      data-testid="reference-root"
    >
      <SEOHeading>{H1}</SEOHeading>
      <Navbar onCtaClick={() => navigate("/#contact")} />

      <header className="relative isolate overflow-hidden pt-32 sm:pt-40">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(55% 55% at 50% 0%, rgba(34,211,238,0.10) 0%, rgba(11,15,20,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-5 pb-14 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400"
            data-testid="reference-back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to thirdrailsystems.ee
          </Link>

          <h2
            className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            data-testid="reference-title"
          >
            {H1}
          </h2>

          <p className="mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Question-structured references on minimum-disclosure duty of care.
            Every page carries stable section anchors, sourced claims, and a
            citation block, so people and machines can cite individual answers
            directly.
          </p>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 pb-28 sm:px-8 lg:px-10">
        <ol
          className="grid gap-5 sm:grid-cols-2"
          data-testid="reference-list"
          aria-label="Reference library pages"
        >
          {REFERENCE_PAGES.map((p) => (
            <li key={p.route} className="list-none">
              <Link
                to={p.route}
                data-testid={`reference-card-${p.route.slice(1)}`}
                className="group block h-full rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-cyan-500/50 hover:bg-slate-900/80"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Reference
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
                  {p.description}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-cyan-400 transition-transform group-hover:translate-x-0.5">
                  Open
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Also citable — the analytical brief and the citation library. */}
        <div
          className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[15px]"
          data-testid="reference-also-links"
        >
          <Link
            to="/catch-22"
            className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
            data-testid="reference-link-catch22"
          >
            The Shadow HR liability brief →
          </Link>
          <Link
            to="/beyond-disclosure/sources"
            className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400"
            data-testid="reference-link-sources"
          >
            Beyond Disclosure citation library →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
