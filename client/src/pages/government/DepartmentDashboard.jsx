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
} from "recharts";
import {
  Plus,
  ArrowRight,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const PIE_COLORS = ["#2563EB", "#0F766E", "#B45309", "#7C3AED", "#0284C7"];

export function DepartmentDashboard() {
  const { user, organization } = useAuth();
  const [filterStatus, setFilterStatus] = useState("ALL");

  const {
    data: problems = [],
    isLoading: loadingProblems,
    refetch: refetchProblems,
  } = useDepartmentProblems();

  const {
    data: submissions = [],
    isLoading: loadingSubmissions,
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
    return Object.entries(countMap).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
    }));
  }, [submissions]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    if (filterStatus === "ALL") return problems;
    return problems.filter((p) => p.status === filterStatus);
  }, [problems, filterStatus]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Department Command Center
            </span>
            <span className="text-xs text-[#64748B]">• Maharashtra Sovereign Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            {organization?.name || "Government Department Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Formulate outcome-based innovation challenges, evaluate startup candidates with Explainable AI, and monitor field pilots.
          </p>
        </div>

        <Link to="/government/challenges/new">
          <Button className="gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Published Challenges
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingProblems ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.publishedProblems}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              {metrics.draftProblems} in draft preparation
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Candidate Submissions
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.totalSubmissions}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Across all open problem statements
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Pending Evaluation
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.pendingReview}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Awaiting double-blind scoring
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Active Field Pilots
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubmissions ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.activePilots}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Live sandbox trials in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      {(sectorData.length > 0 || statusData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Sector Distribution */}
          <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#10233F]">
                Challenges by Sector Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#10233F",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Submissions Status Distribution */}
          <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#10233F]">
                Applicant Pipeline Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-64 flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#10233F",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#64748B]">No applicant data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenges Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#10233F]">
              Department Challenge Statements
            </h2>
            <p className="text-xs text-[#64748B]">
              Review status, publish drafts, and run Explainable AI match evaluations.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterStatus === st
                    ? "bg-white text-[#10233F] shadow-2xs font-bold"
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
          <Card className="border border-dashed border-slate-300 p-8 text-center rounded-2xl bg-white">
            <p className="text-sm font-semibold text-[#10233F]">
              No challenge statements found in this view.
            </p>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Draft a new problem statement to invite innovative pilot proposals from certified startups.
            </p>
            <Link to="/government/challenges/new" className="inline-block mt-4">
              <Button size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5" />
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
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isPublished
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {isPublished ? "● Published" : "○ Draft"}
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
                      <h3 className="font-bold text-base text-[#10233F] hover:text-[#2563EB] transition-colors line-clamp-1">
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
                        className="text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Publish Now
                      </Button>
                    )}

                    <Link to={`/government/challenges/${prob._id}/matching`}>
                      <Button
                        size="sm"
                        className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white h-8 gap-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Match
                      </Button>
                    </Link>

                    <Link to={`/challenges/${prob._id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#64748B] hover:text-[#10233F] h-8"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Submissions Feed */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-[#10233F]">
            Recent Candidate Submissions
          </h2>
          <p className="text-xs text-[#64748B]">
            Proposals received across your department's open innovation challenges.
          </p>
        </div>

        {loadingSubmissions ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : submissions.length === 0 ? (
          <Card className="border border-slate-200 p-6 text-center rounded-2xl bg-slate-50">
            <p className="text-xs text-[#64748B]">
              No proposals submitted by startups yet. Published challenges are open on the public catalog.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {submissions.slice(0, 5).map((sub) => {
              const orgName = sub.organizationId?.name || "Verified Startup";
              const probTitle = sub.problemId?.title || "Challenge";
              const submittedDate = new Date(sub.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#10233F]">{orgName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[#2563EB]">
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

                  <Link
                    to={`/government/challenges/${sub.problemId?._id || sub.problemId}/matching`}
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1 h-8">
                      Evaluate Match
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentDashboard;
