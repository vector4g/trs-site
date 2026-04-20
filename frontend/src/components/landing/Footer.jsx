import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { LOGO_URL } from "./shared";

export default function Footer() {
  return (
    <footer
      className="border-t border-slate-900 bg-slate-950 py-10"
      data-testid="site-footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8 lg:px-10">
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

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <Link
            to="/memo"
            className="mono uppercase tracking-[0.18em] text-slate-300 hover:text-cyan-400"
            data-testid="footer-memo-link"
          >
            Strategic Memo
          </Link>
          <span className="mono uppercase tracking-[0.18em]">
            © {new Date().getFullYear()} Third Rail Systems OÜ
          </span>
          <a
            href="mailto:levi@thirdrailsystems.ee"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400"
            data-testid="footer-email"
          >
            <Mail className="h-3.5 w-3.5" />
            levi@thirdrailsystems.ee
          </a>
        </div>
      </div>
    </footer>
  );
}
