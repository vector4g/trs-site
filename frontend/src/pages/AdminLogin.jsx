import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Admin · Third Rail Systems OÜ";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Enter your admin token.");
      return;
    }
    setSubmitting(true);
    try {
      // POST the admin secret once. Server sets an httpOnly
      // `trs_admin_session` cookie; the token never lives in localStorage
      // and is unreadable from JS after this call returns.
      await axios.post(
        `${API}/admin/login`,
        { token: token.trim() },
        { withCredentials: true },
      );
      setToken("");
      toast.success("Authenticated.");
      navigate("/admin", { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404) {
        toast.error("Admin endpoint is disabled.", {
          description: "Set ADMIN_TOKEN in backend/.env and restart the server.",
        });
      } else if (code === 401) {
        toast.error("Invalid token.");
      } else if (code === 429) {
        toast.error("Too many failed attempts.", {
          description: "Login is temporarily locked. Try again in a few minutes.",
        });
      } else {
        toast.error("Network error.", { description: err?.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="admin-login-root">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-20">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                Admin console
              </div>
              <div className="text-sm font-semibold text-white">
                Third Rail Systems OÜ
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" data-testid="admin-login-form">
            <div>
              <Label htmlFor="token" className="mono text-xs uppercase tracking-[0.18em] text-slate-400">
                Admin token
              </Label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  id="token"
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your ADMIN_TOKEN"
                  className="h-11 border-slate-800 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                  data-testid="admin-token-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="btn-glow h-11 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              data-testid="admin-login-submit"
            >
              {submitting ? "Verifying…" : "Enter"}
              {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>

            <p className="text-xs text-slate-500">
              The admin endpoint is fail-closed. If ADMIN_TOKEN is not set
              server-side, this page will not let you in. Sessions are
              issued as httpOnly cookies and expire after 8 hours.
            </p>
          </form>
        </div>

        <a
          href="/"
          className="mt-6 text-center mono text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400"
        >
          ← Back to thirdrailsystems.ee
        </a>
      </div>
    </div>
  );
}
