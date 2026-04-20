import { useEffect } from "react";

export const MEMO_READ_STORAGE_KEY = "trs.memo_read";
export const ADMIN_TOKEN_STORAGE_KEY = "trs.admin_token";

export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_eu-travel-risk/artifacts/xlq21bpc_Third%20Rail%20Logo.jpg";

export const NAV_LINKS = [
  { id: "platform", label: "Platform" },
  { id: "solutions", label: "Solutions" },
  { id: "compliance", label: "Compliance" },
  { id: "about", label: "About" },
];

export const ROLE_OPTIONS = [
  { value: "cso", label: "CSO / Security Leadership" },
  { value: "dpo", label: "DPO / Privacy Counsel" },
  { value: "erg", label: "ERG / Inclusion Lead" },
  { value: "mobility", label: "Global Mobility / HR" },
  { value: "executive", label: "C-Suite / Executive" },
  { value: "other", label: "Other" },
];

/** IntersectionObserver-based fade-up for elements marked `.reveal`. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export const Eyebrow = ({ children, index }) => (
  <div
    className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-400"
    data-testid={`eyebrow-${index || "label"}`}
  >
    {index && <span className="text-slate-500">{index}</span>}
    <span className="h-px w-8 bg-cyan-400/60" />
    <span>{children}</span>
  </div>
);

export const SectionHeader = ({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}) => (
  <div
    className={`reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
  >
    <Eyebrow index={index}>{eyebrow}</Eyebrow>
    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base text-slate-400 sm:text-lg">{description}</p>
    )}
  </div>
);

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
