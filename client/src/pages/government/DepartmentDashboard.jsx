import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useDepartmentProblems,
  useDepartmentSubmissions,
  usePublishProblem,
} from "@/hooks/useGovernment";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { EvaluationRubricModal } from "@/components/government/EvaluationRubricModal";
import { AssignEvaluatorModal } from "@/components/government/AssignEvaluatorModal";
import { RequestClarificationModal } from "@/components/government/RequestClarificationModal";
import { DecisionModal } from "@/components/government/DecisionModal";

const PIE_COLORS = ["#2563EB", "#0F766E", "#B45309", "#7C3AED", "#0284C7"];

export function DepartmentDashboard() {
  const { user, organization } = useAuth();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedProblemFilter, setSelectedProblemFilter] = useState("ALL");
  const [selectedProblemForRubric, setSelectedProblemForRubric] = useState(null);
  const [selectedSubmissionForAssignment, setSelectedSubmissionForAssignment] = useState(null);
  const [selectedSubmissionForClarification, setSelectedSubmissionForClarification] = useState(null);
  const [selectedSubmissionForDecision, setSelectedSubmissionForDecision] = useState(null);

  const {
    data: problems = [],
    isLoading: loadingProblems,
    refetch: refetchProblems,
  } = useDepartmentProblems();

  const {
    data: submissions = [],
    isLoading: loadingSubmissions,
    refetch: refetchSubmissions,
  } = useDepartmentSubmissions();

  const publishMutation = usePublishProblem();

  // Handle challenge publication
  const handlePublish = async (problemId, title) => {
    try {
      await publishMutation.mutateAsync(problemId);
      toast.success(`Challenge published successfully: "${title}"`);
      refetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to publish challenge");
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalProblems = problems.length;
    const publishedProblems = problems.filter((p) => p.status === "PUBLISHED").length;
    const draftProblems = problems.filter((p) => p.status === "DRAFT").length;
    const totalSubmissions = submissions.length;
    const activePilots = submissions.filter((s) => s.status === "PILOT_ACTIVE").length;
    const pendingReview = submissions.filter(
      (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW"
    ).length;

    return {
      totalProblems,
      publishedProblems,
      draftProblems,
      totalSubmissions,
      activePilots,
      pendingReview,
    };
  }, [problems, submissions]);

  // Sector distribution for chart
  const sectorData = useMemo(() => {
    const countMap = {};
    problems.forEach((p) => {
      (p.sectors || []).forEach((sec) => {
        countMap[sec] = (countMap[sec] || 0) + 1;
      });
    });
    return Object.entries(countMap).map(([name, count]) => ({
      name,
      count,
    }));
  }, [problems]);

  // Submissions status distribution for chart
  const statusData = useMemo(() => {
    const countMap = {};
    submissions.forEach((s) => {
      const st = s.status || "SUBMITTED";
      countMap[st] = (countMap[st] || 0) + 1;
    });
    const total = submissions.length || 1;
    return Object.entries(countMap).map(([name, value]) => ({
      rawKey: name,
      name: name.replace(/_/g, " "),
      value,
      percentage: Math.round((value / total) * 100),
    }));
  }, [submissions]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    if (filterStatus === "ALL") return problems;
    return problems.filter((p) => p.status === filterStatus);
  }, [problems, filterStatus]);

  // Filtered submissions by challenge
  const filteredSubmissions = useMemo(() => {
    if (selectedProblemFilter === "ALL") return submissions;
    return submissions.filter(
      (s) => (s.problemId?._id || s.problemId) === selectedProblemFilter
    );
  }, [submissions, selectedProblemFilter]);

  // Active sandbox pilots for government milestone review
  const activePilotsList = useMemo(() => {
    return submissions.filter((s) =>
      ["ACCEPTED", "PILOT_PROPOSED", "PILOT_ACTIVE", "PILOT_COMPLETED", "SCALED"].includes(s.status)
    );
  }, [submissions]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-[#2563EB]">
              Department Command Center
            </span>
            <span className="text-[#64748B]">• Maharashtra Sovereign Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            {organization?.name || "Government Department Workspace"}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/challenges">
            <Button
              variant="outline"
              className="text-xs font-semibold border-slate-300 text-[#10233F] hover:bg-slate-50 h-9 px-3.5 rounded-lg cursor-pointer"
            >
              Public Challenges
            </Button>
          </Link>
          <Link to="/government/challenges/new">
            <Button className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg shadow-xs h-9 px-4 cursor-pointer">
              Create Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs transition-all rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Published Challenges
            </span>
          </div>
          <div className="mt-3">
            {loadingProblems ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#10233F] tracking-tight">
                  {metrics.publishedProblems}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xs transition-all rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Candidate Submissions
            </span>
          </div>
          <div className="mt-3">
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#10233F] tracking-tight">
                  {metrics.totalSubmissions}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-slate-200/80 bg-white hover:border-amber-300 hover:shadow-xs transition-all rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Pending Evaluation
            </span>
          </div>
          <div className="mt-3">
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#10233F] tracking-tight">
                  {metrics.pendingReview}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-xs transition-all rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Active Field Pilots
            </span>
          </div>
          <div className="mt-3">
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#10233F] tracking-tight">
                  {metrics.activePilots}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      {!loadingProblems && !loadingSubmissions && (problems.length > 0 || submissions.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Problems by Sector */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Challenges by Sector Focus
                </CardTitle>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {sectorData.length} {sectorData.length === 1 ? "Sector" : "Sectors"}
              </span>
            </CardHeader>
            <CardContent className="p-5 h-64">
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sectorData}
                    margin={{ top: 12, right: 16, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} Challenges`, "Volume"]}
                      contentStyle={{
                        backgroundColor: "#10233F",
                        borderRadius: "8px",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#2563EB"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold text-[#10233F]">No sector data available</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Categorized challenge statements will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Submissions Status Distribution (Clean Donut + Structured Legend) */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Applicant Pipeline Lifecycle
                </CardTitle>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {submissions.length} Total
              </span>
            </CardHeader>
            <CardContent className="p-5">
              {statusData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Donut graphic without colliding polyline labels */}
                  <div className="sm:col-span-5 h-48 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={3}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name) => [`${val} Proposals`, name]}
                          contentStyle={{
                            backgroundColor: "#10233F",
                            borderRadius: "8px",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-extrabold text-[#10233F] leading-none">
                        {submissions.length}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                        Proposals
                      </span>
                    </div>
                  </div>

                  {/* Clean Structured Legend List - Never collides */}
                  <div className="sm:col-span-7 space-y-2">
                    {statusData.map((entry, idx) => {
                      const color = PIE_COLORS[idx % PIE_COLORS.length];
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-semibold text-[#10233F] truncate">
                              {entry.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="font-bold text-[#10233F]">
                              {entry.value}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {entry.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold text-[#10233F]">No proposals submitted yet</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Submissions from startups will populate this lifecycle pipeline.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenges Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#10233F]">
              Department Challenge Statements
            </h2>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-white text-[#10233F] shadow-xs font-bold"
                    : "text-[#64748B] hover:text-[#10233F]"
                }`}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List / Table */}
        {loadingProblems ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          <Card className="border border-dashed border-slate-300 p-8 text-center rounded-xl bg-white">
            <p className="text-sm font-semibold text-[#10233F]">
              No challenge statements found in this view.
            </p>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Draft a new problem statement to invite innovative pilot proposals from certified startups.
            </p>
            <Link to="/government/challenges/new" className="inline-block mt-4">
              <Button size="sm" className="text-xs font-semibold bg-[#10233F] hover:bg-slate-800 text-white rounded h-8 px-3 cursor-pointer">
                Draft Problem Statement
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((prob) => {
              const isDraft = prob.status === "DRAFT";
              const isPublished = prob.status === "PUBLISHED";
              const closeDate = prob.applicationCloseAt
                ? new Date(prob.applicationCloseAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Open rolling";

              return (
                <div
                  key={prob._id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isPublished ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-[#2563EB]">
                        {(prob.sectors || []).join(", ") || "General"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#64748B]">
                        Deadline: {closeDate}
                      </span>
                    </div>

                    <Link to={`/challenges/${prob._id}`}>
                      <h3 className="font-bold text-sm sm:text-base text-[#10233F] hover:text-[#2563EB] transition-colors line-clamp-1">
                        {prob.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#64748B] line-clamp-2">
                      {prob.shortSummary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
                    {isDraft && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublish(prob._id, prob.title)}
                        disabled={publishMutation.isPending}
                        className="text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8 cursor-pointer"
                      >
                        Publish Now
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProblemForRubric(prob)}
                      className="text-xs font-semibold border-slate-300 text-[#10233F] hover:bg-slate-50 h-8 px-2.5 rounded cursor-pointer"
                    >
                      Evaluation Rubrics
                    </Button>

                    <Link to={`/government/challenges/${prob._id}/matching`}>
                      <Button
                        size="sm"
                        className="text-xs font-semibold bg-[#10233F] hover:bg-slate-800 text-white h-8 px-3 rounded cursor-pointer"
                      >
                        AI Candidate Matching
                      </Button>
                    </Link>

                    <Link to={`/challenges/${prob._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold text-[#10233F] hover:bg-slate-50 border-slate-300 h-8 px-2.5 rounded cursor-pointer"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Field Pilots & Milestone Deliverables Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                Sandbox Monitoring &amp; PFMS Disbursements
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {activePilotsList.length} Active {activePilotsList.length === 1 ? "Pilot" : "Pilots"}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#10233F]">
              Active Field Pilots &amp; Milestone Work Proofs
            </h2>
          </div>
        </div>

        {activePilotsList.length === 0 ? (
          <Card className="border border-slate-200 p-6 text-center rounded-xl bg-slate-50">
            <p className="text-xs text-[#64748B]">
              No active field pilots yet. When proposals are accepted and enter the sandbox, their 3-phase milestone work proofs will appear here for verification and disbursement.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {activePilotsList.map((pilot) => {
              const orgName = pilot.organizationId?.name || "Candidate Startup";
              const probTitle = pilot.problemId?.title || "Challenge Statement";

              return (
                <div
                  key={pilot._id}
                  className="p-4 rounded-xl border border-teal-200 bg-white hover:border-teal-400 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#10233F]">{orgName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {pilot.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-mono">PLT-{pilot._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#10233F]">{pilot.solutionTitle}</h4>
                    <p className="text-xs text-[#64748B] truncate">
                      Challenge: {probTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Link to={`/pilots/${pilot._id}`}>
                      <Button
                        size="sm"
                        className="text-xs font-semibold bg-[#0F766E] hover:bg-[#0D655E] text-white h-8 px-3.5 rounded-lg cursor-pointer shadow-xs"
                      >
                        Review Proof &amp; Disburse
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submissions Section with Challenge Filter */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#10233F]">
              Candidate Submissions by Challenge
            </h2>
          </div>

          {/* Quick Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedProblemFilter}
              onChange={(e) => setSelectedProblemFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[280px] truncate"
            >
              <option value="ALL">All Challenges ({submissions.length} proposals)</option>
              {problems.map((p) => {
                const count = submissions.filter(
                  (s) => (s.problemId?._id || s.problemId) === p._id
                ).length;
                return (
                  <option key={p._id} value={p._id}>
                    {p.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {loadingSubmissions ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : filteredSubmissions.length === 0 ? (
          <Card className="border border-slate-200 p-6 text-center rounded-xl bg-slate-50">
            <p className="text-xs text-[#64748B]">
              {selectedProblemFilter === "ALL"
                ? "No proposals submitted by startups yet. Published challenges are active on the public portal."
                : "No proposals submitted for this selected challenge statement yet."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredSubmissions.map((sub) => {
              const orgName = sub.organizationId?.name || "Verified Startup";
              const probTitle = sub.problemId?.title || "Challenge Statement";
              const submittedDate = new Date(sub.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#10233F]">{orgName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-[#2563EB]">
                        {sub.status.replace("_", " ")}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#64748B]">{submittedDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#10233F]">{sub.solutionTitle}</h4>
                    <p className="text-xs text-[#64748B] truncate">
                      Applied to: {probTitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
                    {["ACCEPTED", "PILOT_PROPOSED", "PILOT_ACTIVE", "PILOT_COMPLETED", "SCALED"].includes(sub.status) && (
                      <Link to={`/pilots/${sub._id}`}>
                        <Button
                          size="sm"
                          className="text-xs font-semibold bg-[#0F766E] hover:bg-[#0D655E] text-white h-8 px-3 rounded cursor-pointer shadow-xs"
                        >
                          Pilot Canvas
                        </Button>
                      </Link>
                    )}

                    {(sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmissionForClarification(sub)}
                        className="text-xs font-semibold border-amber-300 text-amber-800 hover:bg-amber-50 h-8 px-2.5 rounded cursor-pointer"
                      >
                        Request Clarification
                      </Button>
                    )}

                    {sub.status === "UNDER_REVIEW" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedSubmissionForDecision(sub)}
                        className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white h-8 px-2.5 rounded cursor-pointer shadow-xs"
                      >
                        Statutory Decision
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSubmissionForAssignment(sub)}
                      className="text-xs font-semibold border-slate-300 text-[#10233F] hover:bg-slate-50 h-8 px-2.5 rounded cursor-pointer"
                    >
                      Assign Evaluator
                    </Button>

                    <Link
                      to={`/government/challenges/${sub.problemId?._id || sub.problemId}/matching`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold border-slate-300 text-[#10233F] hover:bg-slate-50 h-8 px-2.5 rounded cursor-pointer"
                      >
                        Evaluate Match
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rubric Configuration Modal */}
      {selectedProblemForRubric && (
        <EvaluationRubricModal
          isOpen={Boolean(selectedProblemForRubric)}
          onClose={() => setSelectedProblemForRubric(null)}
          problem={selectedProblemForRubric}
        />
      )}

      {/* Evaluator Assignment Modal */}
      {selectedSubmissionForAssignment && (
        <AssignEvaluatorModal
          isOpen={Boolean(selectedSubmissionForAssignment)}
          onClose={() => setSelectedSubmissionForAssignment(null)}
          submission={selectedSubmissionForAssignment}
          onAssigned={() => {
            refetchSubmissions();
          }}
        />
      )}

      {/* Request Clarification Modal */}
      {selectedSubmissionForClarification && (
        <RequestClarificationModal
          isOpen={Boolean(selectedSubmissionForClarification)}
          onClose={() => setSelectedSubmissionForClarification(null)}
          submission={selectedSubmissionForClarification}
          onSuccess={() => {
            refetchSubmissions();
          }}
        />
      )}

      {/* Statutory Decision Modal */}
      {selectedSubmissionForDecision && (
        <DecisionModal
          isOpen={Boolean(selectedSubmissionForDecision)}
          onClose={() => setSelectedSubmissionForDecision(null)}
          submission={selectedSubmissionForDecision}
          onDecisionMade={() => {
            refetchSubmissions();
          }}
        />
      )}
    </div>
  );
}

export default DepartmentDashboard;
