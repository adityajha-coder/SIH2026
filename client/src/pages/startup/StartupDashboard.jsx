import React from "react";
import { Link } from "react-router-dom";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Plus,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const STATUS_BADGE_CONFIG = {
  DRAFT: { label: "Draft", variant: "secondary", color: "text-slate-600 bg-slate-100" },
  SUBMITTED: { label: "Submitted", variant: "outline", color: "text-blue-700 bg-blue-50 border-blue-200" },
  UNDER_REVIEW: { label: "Under Review", variant: "outline", color: "text-amber-700 bg-amber-50 border-amber-200" },
  CLARIFICATION: { label: "Clarification Needed", variant: "outline", color: "text-rose-700 bg-rose-50 border-rose-200" },
  ACCEPTED: { label: "Accepted for Pilot", variant: "outline", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  PILOT_ACTIVE: { label: "Pilot Active", variant: "default", color: "text-white bg-emerald-600" },
  PILOT_COMPLETED: { label: "Pilot Completed", variant: "outline", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  SCALED: { label: "Scaled Mandate", variant: "default", color: "text-white bg-[#2563EB]" },
  REJECTED: { label: "Archived", variant: "secondary", color: "text-slate-500 bg-slate-100" },
  WITHDRAWN: { label: "Withdrawn", variant: "secondary", color: "text-slate-500 bg-slate-100" },
};

export function StartupDashboard() {
  const { user, organization, profile } = useAuth();
  const { data, isLoading } = useSubmissions();

  const submissions = data?.items || [];

  // Metrics
  const stats = {
    total: submissions.length,
    inReview: submissions.filter((s) => ["SUBMITTED", "UNDER_REVIEW"].includes(s.status)).length,
    activePilots: submissions.filter((s) => ["PILOT_ACTIVE", "ACCEPTED"].includes(s.status)).length,
    clarifications: submissions.filter((s) => s.status === "CLARIFICATION").length,
  };

  const isDpiitVerified = profile?.dpiitNumber || organization?.type === "STARTUP";

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Startup Innovator Console
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isDpiitVerified ? "DPIIT Prior-Turnover Exempt" : "Self-Registered"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            {organization?.name || "Startup Innovation Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Manage departmental challenge applications, active sandbox pilots, and milestone payment claims.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/startup/profile">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 h-9">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Startup Passport
            </Button>
          </Link>
          <Link to="/challenges">
            <Button size="sm" className="text-xs font-semibold gap-1.5 h-9 bg-[#2563EB] hover:bg-blue-600 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Apply to Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl p-4 space-y-2">
          <span className="text-xs font-medium text-[#64748B]">Total Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#10233F]">{stats.total}</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl p-4 space-y-2">
          <span className="text-xs font-medium text-[#64748B]">Under Evaluation</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{stats.inReview}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl p-4 space-y-2">
          <span className="text-xs font-medium text-[#64748B]">Sandbox Pilots Active</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{stats.activePilots}</span>
            <Rocket className="h-4 w-4 text-emerald-500" />
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl p-4 space-y-2">
          <span className="text-xs font-medium text-[#64748B]">Clarifications Needed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{stats.clarifications}</span>
            <HelpCircle className="h-4 w-4 text-rose-500" />
          </div>
        </Card>
      </div>

      {/* Clarification Alert Banner if any */}
      {stats.clarifications > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-rose-900 font-medium">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              You have <strong>{stats.clarifications}</strong> challenge proposal(s) with questions requested by the evaluation committee.
            </span>
          </div>
          <span className="text-xs font-bold text-rose-700 underline shrink-0 cursor-pointer">
            Review Questions
          </span>
        </div>
      )}

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#10233F]">
            My Challenge Applications
          </h2>
          <span className="text-xs text-[#64748B]">
            Showing {submissions.length} proposals
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-10 border border-slate-200 bg-white rounded-2xl text-center space-y-4 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233F]">
              No active challenge applications yet
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Browse outcome-based challenges formulated by Maharashtra state departments and apply directly for controlled sandbox field trials.
            </p>
            <Link to="/challenges">
              <Button size="sm" className="gap-1.5 font-semibold bg-[#2563EB] hover:bg-blue-600">
                Explore Open Challenges
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {submissions.map((sub) => {
              const badgeCfg = STATUS_BADGE_CONFIG[sub.status] || {
                label: sub.status,
                color: "text-slate-600 bg-slate-100",
              };

              const problemTitle = sub.problemId?.title || "Department Challenge Statement";
              const submittedDate = new Date(sub.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={sub._id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeCfg.color}`}>
                        {badgeCfg.label}
                      </span>
                      <span className="text-xs text-[#64748B]">Submitted {submittedDate}</span>
                    </div>
                    <Link to={`/startup/submissions/${sub._id}`}>
                      <h4 className="font-bold text-sm sm:text-base text-[#10233F] hover:text-[#2563EB] transition-colors line-clamp-1">
                        {sub.solutionTitle}
                      </h4>
                    </Link>
                    <p className="text-xs text-[#64748B] line-clamp-1">
                      Challenge: {problemTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Link to={`/startup/submissions/${sub._id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
                        Track Status
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StartupDashboard;
