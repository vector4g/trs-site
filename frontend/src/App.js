import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import "@/App.css";
// LandingPage stays eager: it is the LCP target for "/" and the most-hit
// route. Every other page is loaded on demand to keep the initial JS payload
// small (Lighthouse "Reduce unused JavaScript" / LCP optimisation, June 2026
// audit).
import LandingPage from "@/pages/LandingPage";

const Toaster = lazy(() =>
  import(/* webpackPrefetch: true */ "@/components/ui/sonner").then((m) => ({
    default: m.Toaster,
  }))
);
const CookieConsent = lazy(() =>
  import(/* webpackPrefetch: true */ "@/components/consent/CookieConsent")
);

const StrategicMemo = lazy(() => import("@/pages/StrategicMemo"));
const CatchTwentyTwo = lazy(() => import("@/pages/CatchTwentyTwo"));
const DiagnosticIntake = lazy(() => import("@/pages/DiagnosticIntake"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const Cookies = lazy(() => import("@/pages/legal/Cookies"));
const Imprint = lazy(() => import("@/pages/legal/Imprint"));
const NothingHappened = lazy(() => import("@/pages/exposure/NothingHappened"));
const TheSwitch = lazy(() => import("@/pages/exposure/TheSwitch"));
const NotDemocratic = lazy(() => import("@/pages/exposure/NotDemocratic"));
const WritingIndex = lazy(() => import("@/pages/WritingIndex"));
const BeyondDisclosure = lazy(() => import("@/pages/BeyondDisclosure"));
const SourcesLibrary = lazy(() => import("@/pages/SourcesLibrary"));
const SpecialCategoryData = lazy(() => import("@/pages/SpecialCategoryData"));
const CivilSociety = lazy(() => import("@/pages/CivilSociety"));
const TravelRiskDpia = lazy(() => import("@/pages/TravelRiskDpia"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const MedicationAtBorders = lazy(() => import("@/pages/MedicationAtBorders"));
const AssistanceCodes = lazy(() => import("@/pages/AssistanceCodes"));
const ReferenceIndex = lazy(() => import("@/pages/ReferenceIndex"));
const ByDirection = lazy(() => import("@/pages/writing/ByDirection"));

// Hoisted to module scope so React doesn't create a new object reference per
// render of <App />. Inline-prop objects break referential-equality memoisation
// on child components (Toaster in particular re-evaluates `toastOptions`).
const TOASTER_OPTIONS = {
  style: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#e2e8f0",
  },
};

/**
 * Support landing navigation with hash (e.g. "/#contact") from other pages.
 * When the user clicks a "Request Pilot Assessment" CTA from /memo we navigate
 * to "/#contact". This handler scrolls to that anchor on arrival.
 */
function HashScrollHandler() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");
      // Defer so the section is mounted
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [location]);
  return null;
}

// Minimal, on-brand suspense fallback. Renders a single dark frame so the
// brief lazy-chunk fetch never flashes a white page on slow connections.
const RouteFallback = () => (
  <div
    data-testid="route-suspense-fallback"
    style={{
      minHeight: "100vh",
      background: "#0b0d12",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
      fontSize: "11px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    <span>Loading…</span>
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <HashScrollHandler />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/memo" element={<StrategicMemo />} />
            <Route path="/catch-22" element={<CatchTwentyTwo />} />
            <Route path="/duty-of-care" element={<CatchTwentyTwo />} />
            <Route path="/beyond-disclosure" element={<BeyondDisclosure />} />
            <Route path="/beyond-disclosure/sources" element={<SourcesLibrary />} />
            <Route path="/special-category-data" element={<SpecialCategoryData />} />
            <Route path="/civil-society" element={<CivilSociety />} />
            <Route path="/travel-risk-dpia" element={<TravelRiskDpia />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/medication-at-borders" element={<MedicationAtBorders />} />
            <Route path="/assistance-codes" element={<AssistanceCodes />} />
            <Route path="/reference" element={<ReferenceIndex />} />
            <Route path="/diagnostic" element={<DiagnosticIntake />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/cookies" element={<Cookies />} />
            <Route path="/legal/imprint" element={<Imprint />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/legal" element={<Imprint />} />
            {/* Exposure trilogy — long-form essay series. Canonical URLs live
                under /writing/*. /exposure/* aliases are kept for inbound links
                that may reference either convention. /writing (no slug) is the
                series index page — the single discovery target for the navbar
                + footer + ProblemSection teaser that get wired on Part One's
                deploy day. */}
            <Route path="/writing" element={<WritingIndex />} />
            <Route path="/writing/nothing-happened" element={<NothingHappened />} />
            <Route path="/exposure/nothing-happened" element={<NothingHappened />} />
            <Route path="/writing/the-switch" element={<TheSwitch />} />
            <Route path="/exposure/the-switch" element={<TheSwitch />} />
            <Route path="/writing/exposure-is-not-democratic" element={<NotDemocratic />} />
            <Route path="/exposure/not-democratic" element={<NotDemocratic />} />
            {/* By Direction — staged (noindex, not in /writing index, not in
                sitemap) until launch flip. Reachable only by direct URL. */}
            <Route path="/writing/by-direction" element={<ByDirection />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </BrowserRouter>
      <Suspense fallback={null}>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={TOASTER_OPTIONS}
        />
      </Suspense>
    </div>
  );
}

export default App;
