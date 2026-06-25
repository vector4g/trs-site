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
import { useSEO } from "@/lib/useSEO";

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
    title:
      "Third Rail Systems OÜ · Minimum-Disclosure Travel Risk Compliance",
    description:
      "EU-native compliance platform that resolves the ISO 31030 vs. GDPR catch-22 for marginalised employee travel risk. Built in Tallinn, Estonia.",
    canonical: "https://thirdrailsystems.ee/",
  });
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
