import { useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import PlatformSection from "@/components/landing/PlatformSection";
import ArchitectureDiagram from "@/components/landing/ArchitectureDiagram";
import PersonasSection from "@/components/landing/PersonasSection";
import ComplianceSection from "@/components/landing/ComplianceSection";
import ValidationSection from "@/components/landing/ValidationSection";
import AboutSection from "@/components/landing/AboutSection";
import Footer from "@/components/landing/Footer";
import { useReveal, scrollToId } from "@/components/landing/shared";
import { useSEO, useJsonLd } from "@/lib/useSEO";

// ContactSection sits at the bottom of the page and pulls in Radix Select +
// Floating UI + Sonner. Lazy-load it so those deps land in a separate chunk
// instead of inflating the main bundle (Lighthouse "Reduce unused JavaScript"
// June 2026 audit). `webpackPrefetch: true` schedules the chunk to download
// during browser idle time after first paint — so by the time the user
// scrolls to the contact form, the chunk is already warm and the fallback
// placeholder never has to flash.
const ContactSection = lazy(() =>
  import(/* webpackPrefetch: true */ "@/components/landing/ContactSection")
);

export default function LandingPage() {
  useReveal();
  // Per-page SEO. The static tags in /public/index.html cover this same page,
  // but explicitly setting them here means the canonical & og:url are always
  // correct after any client-side navigation back to the homepage.
  useSEO({
    title: "Third Rail Systems · Minimum-Disclosure Travel Risk Compliance",
    description:
      "EU-native platform resolving the ISO 31030 and GDPR Article 9 conflict for employee travel risk, without centralising special-category data. Built in Tallinn.",
    canonical: "https://thirdrailsystems.ee/",
  });
  // SoftwareApplication schema is injected ONLY on the homepage. Previously it
  // lived in the static index.html, which (because this is a CSR SPA serving
  // the same shell on every route) caused it to appear on every page —
  // including legal pages, which is invalid. Moving it here scopes it to "/"
  // exclusively. We deliberately omit `aggregateRating` and `offers` because
  // we have no genuine pilot reviews yet to cite, and fabricated ratings
  // violate Google's structured-data policy. Add those fields back once we
  // have real pilot feedback to publish.
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Third Rail Systems · Safety Dossier",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Stateless AI synthesis that produces sanitised travel risk mitigation dossiers without centralising GDPR special-category data.",
      publisher: {
        "@type": "Organization",
        name: "Third Rail Systems OÜ",
      },
    },
    "softwareapp-landing",
  );
  const navigate = useNavigate();

  const scrollToContact = () => scrollToId("contact");
  const openMemo = () => navigate("/memo");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="landing-root">
      <Navbar onCtaClick={scrollToContact} />
      <main>
        <Hero onPrimary={scrollToContact} onSecondary={openMemo} />
        <ProblemSection />
        <PlatformSection />
        <ArchitectureDiagram />
        <PersonasSection onCtaClick={scrollToContact} />
        <ComplianceSection />
        <ValidationSection />
        <AboutSection />
        <Suspense
          fallback={
            <div
              id="contact"
              aria-hidden="true"
              data-testid="contact-section-placeholder"
              style={{ minHeight: "640px" }}
            />
          }
        >
          <ContactSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
