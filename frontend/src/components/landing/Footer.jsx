import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { LEVI_LINKEDIN_URL } from "./shared";
import LogoMark from "./LogoMark";

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

const LEGAL_LINKS = [
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/cookies", label: "Cookies" },
  { to: "/legal/imprint", label: "Legal / Imprint" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-slate-900 bg-slate-950 py-12"
      data-testid="site-footer"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:px-10">
        {/* Brand */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <LogoMark />
            </span>
            <div>
              <div className="text-base font-semibold text-white">
                Third Rail Systems OÜ
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Tallinn, Estonia · EU-Native
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            The minimum-disclosure compliance layer for enterprise travel
            risk. Registered at Harju maakond, Tallinn, Lasnamäe linnaosa,
            Sepapaja tn 6, 15551, Estonia.
          </p>

          <a
            href="mailto:levi@thirdrailsystems.ee"
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400"
            data-testid="footer-email"
          >
            <Mail className="h-3.5 w-3.5" />
            levi@thirdrailsystems.ee
          </a>

          <a
            href={LEVI_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 transition-colors hover:border-cyan-500/40 hover:bg-slate-900"
            data-testid="footer-founder-updates"
          >
            <span className="mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
              Founder updates
            </span>
            <LinkedInGlyph className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-slate-200">
              LinkedIn — Levi Hankins
            </span>
          </a>
        </div>

        {/* Company */}
        <div className="lg:col-span-3">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Company
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link
                to="/memo"
                className="hover:text-cyan-400"
                data-testid="footer-memo-link"
              >
                Strategic Memo
              </Link>
            </li>
            <li>
              <Link
                to="/catch-22"
                className="hover:text-cyan-400"
                data-testid="footer-catch22-link"
              >
                Liability Brief
              </Link>
            </li>
            <li>
              <a
                href="/#contact"
                className="hover:text-cyan-400"
                data-testid="footer-contact-link"
              >
                Request Pilot Assessment
              </a>
            </li>
            <li>
              <a href="/#about" className="hover:text-cyan-400">
                About &amp; founders
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="lg:col-span-4">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Legal
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="hover:text-cyan-400"
                  data-testid={`footer-legal-${l.to.split("/").pop()}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-900 px-5 pt-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-2 mono text-[10px] uppercase tracking-[0.22em] text-slate-600 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Third Rail Systems OÜ</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  typeof window.trsOpenCookieSettings === "function"
                ) {
                  window.trsOpenCookieSettings();
                }
              }}
              className="hover:text-cyan-400"
              data-testid="footer-cookie-settings"
            >
              Cookie settings
            </button>
            <span aria-hidden="true">·</span>
            <span>All rights reserved · Registered in the Republic of Estonia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
