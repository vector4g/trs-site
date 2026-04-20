import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { LOGO_URL } from "./shared";

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
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900">
              <img
                src={LOGO_URL}
                alt="Third Rail Systems OÜ"
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <div className="text-sm font-semibold text-white">
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
          <span>
            All rights reserved · Registered in the Republic of Estonia
          </span>
        </div>
      </div>
    </footer>
  );
}
