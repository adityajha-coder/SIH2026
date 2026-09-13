import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProblem, useProblemEligibility } from "@/hooks/useProblems";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Landmark,
  Layers,
  MapPin,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

export function ChallengeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization, isAuthenticated } = useAuth();

  const { data: problem, isLoading, isError, error } = useProblem(id);
  const isStartup = user?.role === "STARTUP_USER";

  // Check eligibility if logged in as a startup user
  const {
    data: eligibility,
    isLoading: isCheckingEligibility,
  } = useProblemEligibility(id, organization?._id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#10233F]">Challenge Not Found</h2>
          <p className="text-xs text-[#64748B]">
            {error?.message || "The requested problem statement could not be loaded."}
          </p>
          <Link to="/challenges">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const {
    title,
    shortSummary,
    fullStatement,
    organizationId,
    sectors = [],
    geography = {},
    procurementPath = "DIRECT_PILOT",
    mandatoryRequirements = [],
    preferredRequirements = [],
    constraints = [],
    applicationOpenAt,
    applicationCloseAt,
    sourceUrls = [],
  } = problem;

  const departmentName = organizationId?.name || "Maharashtra State Department";
  const stateName = geography?.state || "Maharashtra";
  const districts = geography?.districts?.length ? geography.districts.join(", ") : "Statewide Deployment";

  const closeDateStr = applicationCloseAt
    ? new Date(applicationCloseAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Open Rolling Application";

  const openDateStr = applicationOpenAt
    ? new Date(applicationOpenAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Immediate";

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Open Challenges
        </Link>

        {/* Challenge Header Card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
              <Building2 className="h-4 w-4" />
              <span>{departmentName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#64748B]">{stateName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-blue-700">
                {procurementPath.replace("_", " ")}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Challenge
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-sm text-[#334155] leading-relaxed">
            {shortSummary}
          </p>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium">District Scale</span>
              <div className="flex items-center gap-1 font-semibold text-[#10233F]">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span className="truncate">{districts}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium">Application Window</span>
              <div className="flex items-center gap-1 font-semibold text-[#10233F]">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{closeDateStr}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium">Sectors</span>
              <div className="font-semibold text-[#10233F] truncate">
                {sectors.join(", ") || "Multi-Disciplinary"}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium">Prior Turnover</span>
              <div className="font-semibold text-emerald-700">
                100% Statutory Exemption
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Narrative + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Full Problem Narrative */}
            <Card className="border border-[#E2E8F0] shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-[#10233F]">
                  Problem Narrative & Operational Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm text-[#334155] leading-relaxed">
                <div className="whitespace-pre-line">
                  {fullStatement}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Criteria */}
            <Card className="border border-[#E2E8F0] shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-[#10233F]">
                  Evaluation & Technical Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                {mandatoryRequirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Mandatory Criteria (Hard Gate)
                    </h4>
                    <ul className="space-y-2">
                      {mandatoryRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                          <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preferredRequirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Preferred Tech & Capabilities
                    </h4>
                    <ul className="space-y-2">
                      {preferredRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                          <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {constraints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Operational & Regulatory Constraints
                    </h4>
                    <ul className="space-y-2">
                      {constraints.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sovereign Innovation Safeguards */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1E3A65]">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                Sovereign Sandbox Protections
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                Selected innovators operate under standard Innovation Compacts: ring-fenced operational data, retained startup IP ownership, and milestone disbursements protected by an automated statutory 30-day payment SLA.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Eligibility Widget & Apply Action */}
          <div className="space-y-6 sticky top-6">
            {/* Deterministic Eligibility Widget */}
            <Card className="border border-[#E2E8F0] shadow-md rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/80 p-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10233F]">
                    Eligibility Engine
                  </span>
                  <span className="text-[11px] font-semibold text-[#2563EB]">
                    Deterministic
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold text-[#64748B] pt-1">
                  Automated Statutory Verification
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {isAuthenticated && isStartup ? (
                  isCheckingEligibility ? (
                    <div className="space-y-3 py-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Status Banner */}
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                          eligibility?.isEligible
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-900"
                        }`}
                      >
                        {eligibility?.isEligible ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Qualified: Eligible to Apply</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>Action Needed Before Applying</span>
                          </>
                        )}
                      </div>

                      {/* Rule Results */}
                      <div className="space-y-2 text-xs">
                        {eligibility?.matchedRequirements?.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}

                        {eligibility?.blockers?.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-rose-700">
                            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}

                        {eligibility?.missingEvidence?.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-amber-700">
                            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>Missing: {item}</span>
                          </div>
                        ))}
                      </div>

                      {/* Apply Button */}
                      <Link to={`/challenges/${id}/apply`} className="block w-full pt-2">
                        <Button
                          className="w-full h-11 gap-2 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-sm"
                          disabled={!eligibility?.canApply}
                        >
                          <Rocket className="h-4 w-4" />
                          Apply for Pilot Compact
                        </Button>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="space-y-4 text-center py-2">
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Sign in as a registered startup to execute an instant, auditable eligibility check against this challenge.
                    </p>
                    <Link to="/login" className="block w-full">
                      <Button variant="outline" className="w-full text-xs font-semibold h-9">
                        Sign In to Check Eligibility
                      </Button>
                    </Link>
                    <Link to="/register" className="block w-full">
                      <Button className="w-full text-xs font-semibold h-10 gap-2 bg-[#2563EB] hover:bg-blue-600">
                        Register as Startup
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Department Contact & Guidelines */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-[#64748B] space-y-2">
              <p className="font-semibold text-[#10233F]">
                Procurement Guidelines
              </p>
              <p>
                Applications are reviewed under double-blind evaluation protocols. Identity is anonymized during technical scoring to eliminate bias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeDetailPage;
