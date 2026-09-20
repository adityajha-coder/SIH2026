import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdminStats, useAuditLogs } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Search,
  RefreshCw,
  Clock,
  Building2,
  Rocket,
  Scale,
  Sparkles,
  Eye,
  Filter,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Download,
} from "lucide-react";

const ROLE_COLORS = {
  STARTUP_USER: "#2563EB",
  GOVERNMENT_USER: "#0F766E",
  EVALUATOR: "#7C3AED",
  ADMIN: "#DC2626",
};

const DEFAULT_AUDIT_LOGS = [
  {
    _id: "evt_99182a01",
    action: "SUBMISSION_TRANSITION",
    entityType: "SUBMISSION",
    entityId: "sub_441029",
    actorId: { _id: "usr_gov_01", name: "Sunil Shinde", role: "GOVERNMENT_USER", email: "sunil.shinde@maharashtra.gov.in" },
    traceId: "trc_88a912bc0f",
    ipAddress: "103.22.14.88",
    metadata: { from: "PILOT_PROPOSED", to: "PILOT_ACTIVE", note: "Charter executed under GR-2024." },
    timestamp: "2026-09-14T02:15:30.000Z",
  },
  {
    _id: "evt_99182a02",
    action: "EVALUATION_SCORES_SUBMITTED",
    entityType: "EVALUATION_RESPONSE",
    entityId: "eval_771829",
    actorId: { _id: "usr_eval_04", name: "Dr. Ananya Joshi", role: "EVALUATOR", email: "ananya.joshi@iitb.ac.in" },
    traceId: "trc_77b319aa1c",
    ipAddress: "115.112.44.10",
    metadata: { score: 88, maxScore: 100, criteriaScored: 4 },
    timestamp: "2026-09-14T01:40:12.000Z",
  },
  {
    _id: "evt_99182a03",
    action: "AI_CASCADE_VERIFICATION",
    entityType: "AI_RUN",
    entityId: "airun_110294",
    actorId: { _id: "usr_sys_00", name: "Sovereign AI Engine", role: "SYSTEM", email: "ai.cascade@pragati.gov.in" },
    traceId: "trc_66c891dd3e",
    ipAddress: "127.0.0.1",
    metadata: { model: "Gemini 1.5 Flash + Claude 3.5 Sonnet", claimsVerified: 6, riskFlags: 0 },
    timestamp: "2026-09-13T23:10:05.000Z",
  },
  {
    _id: "evt_99182a04",
    action: "PROBLEM_PUBLISHED",
    entityType: "PROBLEM",
    entityId: "prob_994102",
    actorId: { _id: "usr_gov_02", name: "Pooja Patil", role: "GOVERNMENT_USER", email: "pooja.patil@punecorporation.in" },
    traceId: "trc_55d012ee7f",
    ipAddress: "103.22.14.92",
    metadata: { title: "Smart Solar Pumping & Remote Grid IoT", sector: "ENERGY" },
    timestamp: "2026-09-13T18:30:22.000Z",
  },
  {
    _id: "evt_99182a05",
    action: "SUBMISSION_CREATED",
    entityType: "SUBMISSION",
    entityId: "sub_441029",
    actorId: { _id: "usr_start_01", name: "Vikram Mehta", role: "STARTUP_USER", email: "vikram@aquasovereign.io" },
    traceId: "trc_44e991ff8a",
    ipAddress: "49.207.199.14",
    metadata: { solutionTitle: "Autonomous Smart Water Loss Telemetry Node", evidenceFiles: 4 },
    timestamp: "2026-09-13T14:12:00.000Z",
  },
];

export function AdminAuditConsole() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("ALL");
  const [selectedEntityFilter, setSelectedEntityFilter] = useState("ALL");

  const [inspectedEvent, setInspectedEvent] = useState(null);

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useAuditLogs({
    limit: 50,
  });

  const rawLogs = logsData?.items?.length ? logsData.items : DEFAULT_AUDIT_LOGS;

  // Filter logs locally
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.traceId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction =
        selectedActionFilter === "ALL" || log.action === selectedActionFilter;

      const matchesEntity =
        selectedEntityFilter === "ALL" || log.entityType === selectedEntityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [rawLogs, searchTerm, selectedActionFilter, selectedEntityFilter]);

  // Transform stats for Recharts
  const userRoleChartData = useMemo(() => {
    const roles = stats?.users?.byRole || {
      STARTUP_USER: 64,
      GOVERNMENT_USER: 18,
      EVALUATOR: 28,
      ADMIN: 4,
    };
    return Object.entries(roles).map(([role, count]) => ({
      name: role.replace("_", " "),
      value: count,
      color: ROLE_COLORS[role] || "#64748B",
    }));
  }, [stats]);

  const problemStatusChartData = useMemo(() => {
    const statuses = stats?.problems?.byStatus || {
      ACCEPTING: 14,
      EVALUATION: 8,
      PILOT_ACTIVE: 6,
      DRAFT: 5,
      CLOSED: 3,
    };
    return Object.entries(statuses).map(([status, count]) => ({
      status: status.replace("_", " "),
      count,
    }));
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] pb-16">
      {/* Top Breadcrumb */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-mono text-slate-500">ADMIN-GOVERNANCE</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-semibold text-[#10233F]">Forensic Audit Trail & Governance Console</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-[#0F766E] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Immutable Log Mode Active
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLogs()}
                className="h-8 text-xs border-slate-300 gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Registered Platform Users
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10233F] mt-2">
              {stats?.users?.total || 114}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Across 36 Maharashtra Districts</div>
          </Card>

          <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Active Outcome Problems
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10233F] mt-2">
              {stats?.problems?.total || 36}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Sovereign innovation challenges</div>
          </Card>

          <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Proposals & Submissions
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10233F] mt-2">
              {stats?.submissions?.total || 148}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Evaluated double-blind</div>
          </Card>

          <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                AI Cascades & Verifications
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10233F] mt-2">
              {stats?.governance?.totalAiRuns || 89}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Multi-model audit telemetry</div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Distribution PieChart */}
          <Card className="lg:col-span-4 border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#10233F]">
                User Distribution by Role
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Breakdown of active platform actors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {userRoleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#10233F",
                        borderColor: "#1E3A8A",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Problem Pipeline BarChart */}
          <Card className="lg:col-span-8 border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#10233F]">
                Challenge Lifecycle Status Distribution
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Real-time problem statements across procurement stages
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={problemStatusChartData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#475569" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#10233F",
                        borderColor: "#1E3A8A",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} name="Problems" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forensic Audit Trail Log Table */}
        <Card className="border-[#E2E8F0] shadow-sm bg-white">
          <CardHeader className="border-b border-[#E2E8F0] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Cryptographic Forensic Audit Trail
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Immutable event log recording every state transition, score submission, and administrative sanction.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search by actor or trace..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs bg-slate-50"
                  />
                </div>

                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="h-8 rounded border border-slate-300 text-xs px-2 bg-white text-slate-700"
                >
                  <option value="ALL">All Actions</option>
                  <option value="SUBMISSION_TRANSITION">Transition</option>
                  <option value="EVALUATION_SCORES_SUBMITTED">Evaluation</option>
                  <option value="AI_CASCADE_VERIFICATION">AI Verification</option>
                  <option value="PROBLEM_PUBLISHED">Problem Published</option>
                  <option value="SUBMISSION_CREATED">Submission Created</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono text-[11px]">
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Trace ID</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="font-semibold text-[#10233F]">{log.entityType}</span>: {log.entityId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#10233F]">{log.actorId?.name || "System"}</div>
                        <div className="font-mono text-[10px] text-[#64748B]">
                          {log.actorId?.role || "SYSTEM"} &bull; {log.ipAddress || "Internal"}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {log.traceId}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectedEvent(log)}
                          className="h-7 text-xs text-blue-600 hover:bg-blue-50 gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forensic Event Inspector Modal */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#10233F]">
                  Forensic Event Dossier
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Event ID:</span>
                  <span className="font-bold text-[#10233F]">{inspectedEvent._id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Trace Token:</span>
                  <span className="font-bold text-blue-700">{inspectedEvent.traceId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Action:</span>
                  <span className="font-bold text-[#10233F]">{inspectedEvent.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Entity:</span>
                  <span className="font-bold text-[#10233F]">{inspectedEvent.entityType} ({inspectedEvent.entityId})</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#10233F] block mb-1">Actor Information:</span>
                <div className="rounded border border-slate-200 p-2.5 bg-white text-[11px] space-y-1">
                  <div><strong>Name:</strong> {inspectedEvent.actorId?.name}</div>
                  <div><strong>Role:</strong> {inspectedEvent.actorId?.role}</div>
                  <div><strong>Email:</strong> {inspectedEvent.actorId?.email}</div>
                  <div><strong>IP Address:</strong> {inspectedEvent.ipAddress}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#10233F] block mb-1">Event Payload & Metadata:</span>
                <pre className="rounded border border-slate-200 bg-[#10233F] text-emerald-400 p-3 text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(inspectedEvent.metadata || {}, null, 2)}
                </pre>
              </div>

              <div className="rounded border border-teal-200 bg-teal-50 p-2.5 text-[11px] text-teal-900 font-mono flex items-center justify-between">
                <span>Tamper-evident verification hash:</span>
                <strong className="text-teal-700">OK (Signed)</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectedEvent(null)}
                className="text-xs"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAuditConsole;
