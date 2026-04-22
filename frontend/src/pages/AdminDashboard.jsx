import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  LogOut,
  RefreshCw,
  Search,
  FileText,
  Users,
  Mail,
  Clock,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/components/landing/shared";
import BriefingDialog from "@/components/admin/BriefingDialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_STYLE = {
  sent: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  stubbed: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  failed: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  rejected: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  queued: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

function Stat({ label, value, hint, Icon }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          {label}
        </div>
        {Icon && <Icon className="h-4 w-4 text-cyan-400" />}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (_) {
    return iso;
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [briefingLead, setBriefingLead] = useState(null);

  useEffect(() => {
    document.title = "Pilot Pipeline · Admin · Third Rail Systems OÜ";
    const t = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
    if (!t) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setToken(t);
  }, [navigate]);

  const load = async (authToken) => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const { data } = await axios.get(`${API}/admin/pilot-requests`, {
        headers: { "X-Admin-Token": authToken },
        params,
      });
      setRows(data.items || []);
      setStats(data.stats || null);
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 404) {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        toast.error("Session expired.");
        navigate("/admin/login", { replace: true });
      } else {
        toast.error("Failed to load.", { description: err?.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(token);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    navigate("/admin/login", { replace: true });
  };

  const activity = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today_count = (rows || []).filter((r) =>
      (r.submitted_at || "").startsWith(today),
    ).length;
    const last7d_count = (rows || []).filter((r) => {
      try {
        return new Date(r.submitted_at) >= last7d;
      } catch (_) {
        return false;
      }
    }).length;
    return { today: today_count, last7d: last7d_count };
  }, [rows]);

  const memoReadDisplay = useMemo(() => {
    if (!stats) return "—";
    return `${stats.memo_read}/${stats.total} · ${stats.memo_read_rate}%`;
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" data-testid="admin-dashboard-root">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
              Admin · Pilot Pipeline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(token)}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"
              data-testid="admin-refresh"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:bg-slate-800/60 hover:text-white"
              data-testid="admin-logout"
            >
              <LogOut className="mr-1 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="admin-stats">
          <Stat label="Total submissions" value={stats?.total ?? "…"} Icon={Users} />
          <Stat label="Last 7 days" value={activity?.last7d ?? "…"} Icon={Clock} hint={`${activity?.today ?? 0} today`} />
          <Stat label="Delivered / queued" value={stats?.delivered ?? "…"} Icon={Mail} hint="sent + stubbed" />
          <Stat
            label="Memo-read conversion"
            value={memoReadDisplay}
            Icon={FileText}
            hint="read /memo before submitting"
          />
        </div>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role…"
              className="h-10 border-slate-800 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
              data-testid="admin-search-input"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 w-full border-slate-800 bg-slate-950 text-slate-100 sm:w-48" data-testid="admin-role-filter">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="CSO">CSO / Security</SelectItem>
              <SelectItem value="DPO">DPO / Privacy</SelectItem>
              <SelectItem value="ERG">ERG</SelectItem>
              <SelectItem value="Global">Global Mobility</SelectItem>
              <SelectItem value="C-Suite">C-Suite</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full border-slate-800 bg-slate-950 text-slate-100 sm:w-48" data-testid="admin-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="stubbed">Stubbed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="rejected">Rejected (bot)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="h-10 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            data-testid="admin-search-submit"
          >
            Apply
          </Button>
        </form>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" data-testid="admin-table">
              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr className="text-left mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Memo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Submitted
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    <span className="sr-only">Actions</span>Briefing
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500" data-testid="admin-empty">
                      No submissions match these filters.
                    </td>
                  </tr>
                )}
                {!loading &&
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-800/60 last:border-b-0 hover:bg-slate-900"
                      data-testid={`admin-row-${r.id.slice(0, 8)}`}
                    >
                      <td className="px-4 py-3 text-slate-100">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${r.corporate_email}`}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {r.corporate_email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.role}</td>
                      <td className="px-4 py-3">
                        {r.memo_read ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Read
                          </span>
                        ) : (
                          <span className="mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] mono uppercase tracking-[0.15em] ${
                            STATUS_STYLE[r.email_status] || STATUS_STYLE.queued
                          }`}
                        >
                          {r.email_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 mono text-xs text-slate-400">
                        {fmtDate(r.submitted_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBriefingLead(r)}
                          className="h-8 border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white"
                          data-testid={`admin-briefing-${r.id.slice(0, 8)}`}
                        >
                          <Sparkles className="mr-1 h-3.5 w-3.5 text-cyan-400" />
                          Briefing
                          {r.briefings_generated > 0 && (
                            <span className="ml-2 rounded-full bg-cyan-500/10 px-1.5 text-[10px] text-cyan-300">
                              {r.briefings_generated}
                            </span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Showing {rows.length} of {stats?.total ?? "—"} submissions. Filters
          are applied server-side.
        </p>
      </main>

      <BriefingDialog
        open={briefingLead !== null}
        onOpenChange={(v) => !v && setBriefingLead(null)}
        lead={briefingLead}
        token={token}
      />
    </div>
  );
}
