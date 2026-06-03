import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Loader2,
  Download,
  Building2,
  Mail,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/** Modal that resolves prospect branding then generates a co-branded PDF. */
export default function BriefingDialog({ open, onOpenChange, lead, token }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [company, setCompany] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [generating, setGenerating] = useState(null); // "exec" | "full" | null
  const [emailing, setEmailing] = useState(null); // "exec" | "full" | null

  useEffect(() => {
    if (!open || !lead) return;
    setPreview(null);
    setCompany("");
    setLogoUrl("");
    setLoading(true);
    axios
      .get(`${API}/admin/briefings/preview/${lead.id}`, {
        headers: { "X-Admin-Token": token },
      })
      .then(({ data }) => {
        setPreview(data);
        setCompany(data.inferred_company || "");
        setLogoUrl(data.inferred_logo_url || "");
      })
      .catch((err) => {
        // Network / auth / 404 — surface to the operator AND log to console
        // for browser-devtools triage. `err.response` carries the FastAPI
        // detail string when present.
        const detail = err?.response?.data?.detail || err?.message;
        console.warn("[BriefingDialog] preview fetch failed:", detail, err);
        toast.error("Preview failed.", { description: detail });
      })
      .finally(() => setLoading(false));
  }, [open, lead, token]);

  const handleGenerate = async (variant) => {
    if (!lead) return;
    setGenerating(variant);
    try {
      const resp = await axios.post(
        `${API}/admin/briefings/generate`,
        {
          pilot_request_id: lead.id,
          variant,
          prospect_company_override: company.trim() || null,
          prospect_logo_url_override: logoUrl.trim() || null,
        },
        {
          headers: { "X-Admin-Token": token },
          responseType: "blob",
        },
      );
      // Extract filename from Content-Disposition
      const cd = resp.headers["content-disposition"] || "";
      const match = cd.match(/filename="([^"]+)"/);
      const filename =
        (match && match[1]) ||
        `ThirdRail-${variant === "exec" ? "ExecSummary" : "FullMemo"}.pdf`;

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        variant === "exec"
          ? "Executive summary generated."
          : "Full briefing generated.",
        { description: `Downloaded: ${filename}` },
      );
      onOpenChange(false);
    } catch (err) {
      // err.response.data is a Blob because we requested responseType='blob'.
      // Parse it so we can surface the actual server error detail.
      let detail = err?.message || "Unknown error";
      const blob = err?.response?.data;
      if (blob instanceof Blob) {
        try {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            detail = json.detail || text || detail;
          } catch {
            detail = text || detail;
          }
        } catch {
          // fallthrough
        }
      }
      toast.error("Generation failed.", { description: detail });
    } finally {
      setGenerating(null);
    }
  };

  const handleEmailToLead = async (variant) => {
    if (!lead) return;
    setEmailing(variant);
    try {
      const { data } = await axios.post(
        `${API}/admin/briefings/email-to-lead`,
        {
          pilot_request_id: lead.id,
          variant,
          prospect_company_override: company.trim() || null,
          prospect_logo_url_override: logoUrl.trim() || null,
        },
        { headers: { "X-Admin-Token": token } },
      );
      toast.success(
        variant === "exec"
          ? "Executive summary emailed to lead."
          : "Full briefing emailed to lead.",
        {
          description: `${data?.recipient || lead.corporate_email} · ${
            data?.briefing_id || ""
          }`,
        },
      );
      onOpenChange(false);
    } catch (err) {
      const detail =
        err?.response?.data?.detail || err?.message || "Unknown error";
      toast.error("Email send failed.", { description: String(detail) });
    } finally {
      setEmailing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg border-slate-800 bg-slate-950 text-slate-200"
        data-testid="briefing-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Generate Executive Briefing
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {lead
              ? `For ${lead.first_name} ${lead.last_name} · ${lead.corporate_email}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Resolving prospect branding via Brandfetch…
          </div>
        )}

        {!loading && preview && (
          <div className="space-y-5">
            {/* Preview card */}
            <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company || preview.domain || "Prospect"}
                  className="h-12 w-12 rounded-md border border-slate-800 bg-slate-950 object-contain p-1"
                  data-testid="briefing-prospect-logo"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-cyan-400">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Prospect
                </div>
                <div className="truncate text-sm font-semibold text-white">
                  {company || preview.inferred_company || preview.domain || "—"}
                </div>
                <div className="mono text-[11px] text-slate-500">
                  {preview.domain || "no domain"}
                </div>
              </div>
            </div>

            {/* Diagnostic qualifiers — only shown for /diagnostic intake leads.
              * Lets Levi see org-scale + workforce + current-vendor without
              * leaving the dialog to consult the row. */}
            {lead?.request_type === "diagnostic" && (
              <div
                className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-4"
                data-testid="briefing-diagnostic-qualifiers"
              >
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-200">
                  Diagnostic qualifiers
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
                  <div>
                    <dt className="mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Org scale
                    </dt>
                    <dd
                      className="mt-0.5 text-slate-100"
                      data-testid="briefing-qualifier-orgscale"
                    >
                      {lead.org_scale_band || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Workforce
                    </dt>
                    <dd
                      className="mt-0.5 text-slate-100"
                      data-testid="briefing-qualifier-workforce"
                    >
                      {lead.workforce_composition || "—"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Current vendor
                    </dt>
                    <dd
                      className="mt-0.5 text-slate-100"
                      data-testid="briefing-qualifier-vendor"
                    >
                      {lead.current_vendor || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Overrides */}
            <div className="space-y-3">
              <div>
                <Label className="mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Company name
                </Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={preview.inferred_company || "Override name"}
                  className="mt-2 h-10 border-slate-800 bg-slate-900 text-slate-100 focus-visible:ring-cyan-500"
                  data-testid="briefing-company-input"
                />
              </div>
              <div>
                <Label className="mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Logo URL (override)
                </Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://…/logo.svg"
                  className="mt-2 h-10 border-slate-800 bg-slate-900 text-slate-100 focus-visible:ring-cyan-500"
                  data-testid="briefing-logo-input"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Leave blank to keep the Brandfetch result. SVG or PNG
                  recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"
              data-testid="briefing-cancel"
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={loading || generating !== null || emailing !== null}
              onClick={() => handleGenerate("exec")}
              className="border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white"
              data-testid="briefing-generate-exec"
            >
              {generating === "exec" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-1 h-4 w-4" />
              )}
              Download exec
            </Button>
            <Button
              disabled={loading || generating !== null || emailing !== null}
              onClick={() => handleGenerate("full")}
              className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              data-testid="briefing-generate-full"
            >
              {generating === "full" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1 h-4 w-4" />
              )}
              Download full
            </Button>
          </div>

          {/* Email-to-lead row */}
          <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              <Mail className="mr-1 inline h-3 w-3 text-cyan-400" />
              Email PDF directly to lead
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                disabled={loading || generating !== null || emailing !== null}
                onClick={() => handleEmailToLead("exec")}
                className="border-slate-700 bg-slate-950/60 text-slate-100 hover:bg-slate-800 hover:text-white"
                data-testid="briefing-email-exec"
              >
                {emailing === "exec" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-1 h-4 w-4" />
                )}
                Email exec
              </Button>
              <Button
                disabled={loading || generating !== null || emailing !== null}
                onClick={() => handleEmailToLead("full")}
                className="btn-glow bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                data-testid="briefing-email-full"
              >
                {emailing === "full" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-1 h-4 w-4" />
                )}
                Email full
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
