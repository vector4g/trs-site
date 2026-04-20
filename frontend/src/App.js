import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";
import LandingPage from "@/pages/LandingPage";
import StrategicMemo from "@/pages/StrategicMemo";
import { Toaster } from "@/components/ui/sonner";

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
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "#e2e8f0",
          },
        }}
      />
    </div>
  );
}

export default App;
