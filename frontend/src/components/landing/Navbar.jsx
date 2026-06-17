import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, scrollToId } from "./shared";
import { SERIES_LIVE } from "@/lib/exposureSeries";
import LogoMark from "./LogoMark";

// EXPOSURE TRILOGY NAV SWAP: while no essay is published, the standalone
// "Memo" nav item stays in place. The moment any essay flips
// `published: true` in /lib/exposureSeries.js, SERIES_LIVE becomes true and
// the nav automatically swaps "Memo" for "Insights" (→ /writing). The Memo
// itself stays reachable directly at /memo and from inside the /writing hub
// as a companion-reading card.

export default function Navbar({ onCtaClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLink = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      data-testid="site-navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3"
          data-testid="logo-button"
          aria-label="Third Rail Systems OÜ · Home"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
            <LogoMark />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
            Third Rail Systems
            <span className="ml-1 font-normal text-slate-400">OÜ</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLink(l.id)}
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
              data-testid={`nav-link-${l.id}`}
            >
              {l.label}
            </button>
          ))}
          <Link
            to={SERIES_LIVE ? "/writing" : "/memo"}
            className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
            data-testid={SERIES_LIVE ? "nav-link-insights" : "nav-link-memo"}
          >
            {SERIES_LIVE ? "Insights" : "Memo"}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onCtaClick}
            data-testid="nav-cta-button"
            className="hidden md:inline-flex btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          >
            Request Pilot Assessment
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-200 hover:bg-slate-800/60 hover:text-white"
                data-testid="mobile-menu-trigger"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85%] max-w-sm border-slate-800 bg-slate-950 text-slate-200"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-slate-100">
                  Third Rail Systems OÜ
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and primary call-to-action
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLink(l.id)}
                    className="border-b border-slate-800 py-4 text-left text-base text-slate-200 hover:text-cyan-400"
                    data-testid={`mobile-nav-link-${l.id}`}
                  >
                    {l.label}
                  </button>
                ))}
                <Link
                  to={SERIES_LIVE ? "/writing" : "/memo"}
                  onClick={() => setOpen(false)}
                  className="border-b border-slate-800 py-4 text-left text-base text-slate-200 hover:text-cyan-400"
                  data-testid={SERIES_LIVE ? "mobile-nav-link-insights" : "mobile-nav-link-memo"}
                >
                  {SERIES_LIVE ? "Insights" : "Memo"}
                </Link>
                <Button
                  onClick={() => {
                    setOpen(false);
                    onCtaClick();
                  }}
                  className="mt-6 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  data-testid="mobile-nav-cta"
                >
                  Request Pilot Assessment
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
