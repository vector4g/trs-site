import { useNavigate } from "react-router-dom";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import PlatformSection from "@/components/landing/PlatformSection";
import PersonasSection from "@/components/landing/PersonasSection";
import ComplianceSection from "@/components/landing/ComplianceSection";
import AboutSection from "@/components/landing/AboutSection";
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
        <PersonasSection onCtaClick={scrollToContact} />
        <ComplianceSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
