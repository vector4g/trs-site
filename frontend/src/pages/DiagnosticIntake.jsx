/**
 * /diagnostic — the qualified intake that lives downstream of the Catch-22
 * liability brief. Same anti-spam stack as the generic /#contact form
 * (honeypot, time-to-submit, IP rate-limit), plus three qualifier fields that
 * let us triage Shadow HR diagnostic conversations before the fit-call.
 *
 * Kept as its own route so we don't bloat the landing-page form for visitors
 * who arrived by other paths.
 */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Lock, ScrollText, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Eyebrow,
  ROLE_OPTIONS,
  MEMO_READ_STORAGE_KEY,
  CATCH22_READ_STORAGE_KEY,
  useReveal,
} from "@/components/landing/shared";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CONSENT_STORAGE_KEY = "trs.consent";

const ORG_SCALE_OPTIONS = [
  { value: "<1k", label: "Under 1,000 employees" },
  { value: "1k-5k", label: "1,000 – 5,000 employees" },
  { value: "5k-25k", label: "5,000 – 25,000 employees" },
  { value: "25k-100k", label: "25,000 – 100,000 employees" },
  { value: "100k+", label: "100,000+ employees" },
];

const WORKFORCE_OPTIONS = [
  { value: "eu-only", label: "EU / EEA only" },
  { value: "eu-uk", label: "EU + UK" },
  { value: "global-eu-major", label: "Global with major EU footprint" },
  { value: "global-eu-minor", label: "Global with minor EU footprint" },
];

const CURRENT_VENDOR_OPTIONS = [
  { value: "none", label: "No travel-risk vendor" },
  { value: "isos", label: "International SOS" },
  { value: "wtw", label: "WTW / Crisis24" },
  { value: "control-risks", label: "Control Risks" },
  { value: "anvil", label: "Anvil / GardaWorld" },
  { value: "in-house", label: "In-house / internal" },
  { value: "other", label: "Other (note in reply)" },
];

function hashEmail(email) {
  const s = (email || "").trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return `lead_${(h >>> 0).toString(16)}`;
}

export default function DiagnosticIntake() {
  useReveal();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    orgScale: "",
    workforce: "",
    currentVendor: "",
    companyWebsite: "", // honeypot
  });
  const [errors, setErrors] = useState({});
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title =
      "Confidential Diagnostic Request · Third Rail Systems OÜ";
    return () => {
      document.title = prev;
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid corporate email";
    if (!form.role) e.role = "Select a role";
    if (!form.orgScale) e.orgScale = "Select organisation scale";
    if (!form.workforce) e.workforce = "Select workforce composition";
    if (!form.currentVendor) e.currentVendor = "Select current vendor status";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const roleLabel =
        ROLE_OPTIONS.find((r) => r.value === form.role)?.label || form.role;
      const orgScaleLabel =
        ORG_SCALE_OPTIONS.find((o) => o.value === form.orgScale)?.label ||
        form.orgScale;
      const workforceLabel =
        WORKFORCE_OPTIONS.find((o) => o.value === form.workforce)?.label ||
        form.workforce;
      const vendorLabel =
        CURRENT_VENDOR_OPTIONS.find((o) => o.value === form.currentVendor)
          ?.label || form.currentVendor;

      let memoRead = false;
      let catch22Read = false;
      let consent = "";
      try {
        memoRead = localStorage.getItem(MEMO_READ_STORAGE_KEY) === "1";
        catch22Read = localStorage.getItem(CATCH22_READ_STORAGE_KEY) === "1";
        consent = localStorage.getItem(CONSENT_STORAGE_KEY) || "";
      } catch (_) {
        memoRead = false;
        catch22Read = false;
      }

      await axios.post(`${API}/pilot-requests`, {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        corporate_email: form.email.trim(),
        role: roleLabel,
        company_website: form.companyWebsite,
        submission_ms: Date.now() - mountedAt.current,
        memo_read: memoRead,
        catch22_read: catch22Read,
        request_type: "diagnostic",
        org_scale_band: orgScaleLabel,
        workforce_composition: workforceLabel,
        current_vendor: vendorLabel,
      });

      if (window.posthog && consent === "accepted") {
        try {
          window.posthog.identify(hashEmail(form.email), {
            role: roleLabel,
            memo_read: memoRead,
            catch22_read: catch22Read,
            request_type: "diagnostic",
          });
        } catch (_) {
          /* analytics must never break submission UX */
        }
      }
      if (window.posthog) {
        window.posthog.capture("diagnostic_request_submitted", {
          role: roleLabel,
          org_scale_band: orgScaleLabel,
          workforce_composition: workforceLabel,
          current_vendor: vendorLabel,
          memo_read: memoRead,
          catch22_read: catch22Read,
        });
      }

      toast.success("Diagnostic request received.", {
        description:
          "We'll respond from levi@thirdrailsystems.ee within one business day.",
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        orgScale: "",
        workforce: "",
        currentVendor: "",
        companyWebsite: "",
      });
      setErrors({});
      mountedAt.current = Date.now();
      // Hard navigation (not React Router push) so headless tests + real
      // browsers settle into the brief view deterministically after the toast.
      setTimeout(() => {
        window.location.assign("/catch-22");
      }, 1400);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.error("Too many requests.", {
          description:
            "Please wait a few minutes before submitting again.",
        });
      } else {
        const detail =
          err?.response?.data?.detail ||
          err?.message ||
          "Could not submit the request. Please try again.";
        toast.error("Submission failed.", { description: String(detail) });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      data-testid="diagnostic-root"
    >
      <Navbar onCtaClick={() => navigate("/#contact")} />

      <main className="mx-auto max-w-4xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-10">
        <Link
          to="/catch-22"
          className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 hover:text-cyan-400"
          data-testid="diagnostic-back-link"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the Liability Brief
        </Link>

        <header className="reveal mt-8">
          <Eyebrow index="—">Confidential Diagnostic Request</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Map your Shadow HR exposure.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            A 60-minute structured conversation with our team. Confidential, no
            HRIS integration, no special-category data requested. We use your
            answers below only to triage fit before the call.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <div className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Confidential
              </div>
              <div className="mt-1 text-sm text-slate-100">
                Covered by mutual NDA on request
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <ScrollText className="h-4 w-4 text-cyan-400" />
              <div className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Lawful basis
              </div>
              <div className="mt-1 text-sm text-slate-100">
                Legitimate interest, GDPR Article 6(1)(f)
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <Lock className="h-4 w-4 text-cyan-400" />
              <div className="mt-2 mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Retention
              </div>
              <div className="mt-1 text-sm text-slate-100">
                90 days unless engagement opens
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="reveal mt-12 rounded-lg border border-slate-800 bg-slate-900/60 p-8 sm:p-10"
          data-testid="diagnostic-form"
          noValidate
        >
          {/* Honeypot */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-10000px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <label htmlFor="diag_company_website">
              Company Website (leave blank)
            </label>
            <input
              id="diag_company_website"
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.companyWebsite}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyWebsite: e.target.value }))
              }
              data-testid="diagnostic-honeypot-field"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="diag-firstName"
                className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
              >
                First Name
              </Label>
              <Input
                id="diag-firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                placeholder="First name"
                data-testid="diagnostic-input-first-name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-400">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="diag-lastName"
                className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
              >
                Last Name
              </Label>
              <Input
                id="diag-lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                placeholder="Last name"
                data-testid="diagnostic-input-last-name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-400">{errors.lastName}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="diag-email"
                className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
              >
                Corporate Email
              </Label>
              <Input
                id="diag-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                placeholder="name@enterprise.com"
                data-testid="diagnostic-input-email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="diag-role"
                className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
              >
                Role
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger
                  id="diag-role"
                  className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                  data-testid="diagnostic-select-role-trigger"
                >
                  <SelectValue placeholder="Select your function" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="focus:bg-slate-800 focus:text-white"
                      data-testid={`diagnostic-select-role-option-${opt.value}`}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="mt-1 text-xs text-rose-400">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-8">
            <Eyebrow index="—">Triage Qualifiers</Eyebrow>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Three structural questions. No special-category data. Used solely
              to assess pilot fit before the call.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5">
              <div>
                <Label
                  htmlFor="diag-orgScale"
                  className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                >
                  Organisation scale
                </Label>
                <Select
                  value={form.orgScale}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, orgScale: v }))
                  }
                >
                  <SelectTrigger
                    id="diag-orgScale"
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                    data-testid="diagnostic-select-orgscale-trigger"
                  >
                    <SelectValue placeholder="Headcount band" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    {ORG_SCALE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="focus:bg-slate-800 focus:text-white"
                        data-testid={`diagnostic-select-orgscale-option-${opt.value}`}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.orgScale && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.orgScale}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="diag-workforce"
                  className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                >
                  Workforce composition
                </Label>
                <Select
                  value={form.workforce}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, workforce: v }))
                  }
                >
                  <SelectTrigger
                    id="diag-workforce"
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                    data-testid="diagnostic-select-workforce-trigger"
                  >
                    <SelectValue placeholder="EU footprint" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    {WORKFORCE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="focus:bg-slate-800 focus:text-white"
                        data-testid={`diagnostic-select-workforce-option-${opt.value}`}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workforce && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.workforce}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="diag-currentVendor"
                  className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                >
                  Current travel-risk vendor
                </Label>
                <Select
                  value={form.currentVendor}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, currentVendor: v }))
                  }
                >
                  <SelectTrigger
                    id="diag-currentVendor"
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                    data-testid="diagnostic-select-vendor-trigger"
                  >
                    <SelectValue placeholder="Select vendor or status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    {CURRENT_VENDOR_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="focus:bg-slate-800 focus:text-white"
                        data-testid={`diagnostic-select-vendor-option-${opt.value}`}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currentVendor && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.currentVendor}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="btn-glow mt-10 h-12 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 sm:w-auto sm:px-6"
            data-testid="diagnostic-submit-button"
          >
            {submitting ? "Submitting…" : "Request confidential diagnostic"}
            {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>

          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-slate-500">
            By submitting, you consent to Third Rail Systems OÜ processing the
            information above solely to evaluate pilot fit. No special-category
            data is requested. Retention 90 days unless a paid engagement opens.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
