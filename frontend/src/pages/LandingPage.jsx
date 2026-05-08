import { useNavigate } from "react-router-dom";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import PlatformSection from "@/components/landing/PlatformSection";
import ArchitectureDiagram from "@/components/landing/ArchitectureDiagram";
import PersonasSection from "@/components/landing/PersonasSection";
import ComplianceSection from "@/components/landing/ComplianceSection";
import ValidationSection from "@/components/landing/ValidationSection";
import AboutSection from "@/components/landing/AboutSection";
import AdvisoryBoard from "@/components/landing/AdvisoryBoard";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { useReveal, scrollToId } from "@/components/landing/shared";

export default function LandingPage() {
  useReveal();
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
        <AdvisoryBoard />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
