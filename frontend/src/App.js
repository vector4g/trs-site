import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";
import LandingPage from "@/pages/LandingPage";
import StrategicMemo from "@/pages/StrategicMemo";
import CatchTwentyTwo from "@/pages/CatchTwentyTwo";
import DiagnosticIntake from "@/pages/DiagnosticIntake";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import Cookies from "@/pages/legal/Cookies";
import Imprint from "@/pages/legal/Imprint";
import NothingHappened from "@/pages/exposure/NothingHappened";
import TheSwitch from "@/pages/exposure/TheSwitch";
import NotDemocratic from "@/pages/exposure/NotDemocratic";
import CookieConsent from "@/components/consent/CookieConsent";
import { Toaster } from "@/components/ui/sonner";

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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <HashScrollHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/memo" element={<StrategicMemo />} />
          <Route path="/catch-22" element={<CatchTwentyTwo />} />
          <Route path="/duty-of-care" element={<CatchTwentyTwo />} />
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
              that may reference either convention. */}
          <Route path="/writing/nothing-happened" element={<NothingHappened />} />
          <Route path="/exposure/nothing-happened" element={<NothingHappened />} />
          <Route path="/writing/the-switch" element={<TheSwitch />} />
          <Route path="/exposure/the-switch" element={<TheSwitch />} />
          <Route path="/writing/exposure-is-not-democratic" element={<NotDemocratic />} />
          <Route path="/exposure/not-democratic" element={<NotDemocratic />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={TOASTER_OPTIONS}
      />
    </div>
  );
}

export default App;
