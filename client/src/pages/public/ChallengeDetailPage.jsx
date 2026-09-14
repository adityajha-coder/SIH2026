import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProblem, useProblemEligibility } from "@/hooks/useProblems";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Pre-check if the startup has already submitted an application
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useSubmissions(
    isAuthenticated && isStartup ? { problemId: id, limit: 1 } : {}
  );
  const existingSubmission = isStartup ? submissionsData?.items?.[0] : null;

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
        <Card className="max-w-md w-full text-center p-8 space-y-4 border border-slate-200">
          <h2 className="text-xl font-bold text-[#10233F]">Challenge Not Found</h2>
          <p className="text-xs text-[#64748B]">
            {error?.message || "The requested problem statement could not be loaded."}
          </p>
          <Link to="/challenges">
            <Button variant="outline" size="sm" className="text-xs border-slate-300">
              &larr; Back to Catalog
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
          className="inline-block text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          &larr; Back to Open Challenges
        </Link>

        {/* Challenge Header Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
              <span>{departmentName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#64748B]">{stateName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-blue-700">
                {procurementPath.replace("_", " ")}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700">
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
              <span className="text-[11px] text-[#64748B] font-medium block">District Scale</span>
              <span className="font-semibold text-[#10233F] block truncate">{districts}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium block">Application Window</span>
              <span className="font-semibold text-[#10233F] block">{closeDateStr}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium block">Sectors</span>
              <span className="font-semibold text-[#10233F] block truncate">
                {sectors.join(", ") || "Multi-Disciplinary"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#64748B] font-medium block">Prior Turnover</span>
              <span className="font-semibold text-emerald-700 block">100% Statutory Exemption</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Narrative + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Full Problem Narrative */}
            <Card className="border border-[#E2E8F0] shadow-sm rounded-xl bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Problem Narrative &amp; Operational Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs text-[#334155] leading-relaxed">
                <div className="whitespace-pre-line">
                  {fullStatement}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Criteria */}
            <Card className="border border-[#E2E8F0] shadow-sm rounded-xl bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Evaluation &amp; Technical Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5 text-xs">
                {mandatoryRequirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-rose-800 text-[11px]">
                      Mandatory Criteria (Hard Gate)
                    </h4>
                    <ul className="space-y-1.5 text-[#334155]">
                      {mandatoryRequirements.map((req, i) => (
                        <li key={i} className="leading-relaxed flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preferredRequirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-blue-800 text-[11px]">
                      Preferred Tech &amp; Capabilities
                    </h4>
                    <ul className="space-y-1.5 text-[#334155]">
                      {preferredRequirements.map((req, i) => (
                        <li key={i} className="leading-relaxed flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {constraints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-amber-800 text-[11px]">
                      Operational &amp; Regulatory Constraints
                    </h4>
                    <ul className="space-y-1.5 text-[#334155]">
                      {constraints.map((req, i) => (
                        <li key={i} className="leading-relaxed flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sovereign Innovation Safeguards */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-2">
              <div className="font-bold text-xs text-[#1E3A65]">
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
            <Card className="border border-[#E2E8F0] shadow-sm rounded-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 p-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10233F]">
                    Eligibility Engine
                  </span>
                  <span className="text-[11px] font-semibold text-[#2563EB]">
                    Deterministic
                  </span>
                </div>
                <CardTitle className="text-xs font-medium text-[#64748B] pt-0.5">
                  Automated Statutory Verification
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {isAuthenticated && isStartup ? (
                  isCheckingEligibility || isLoadingSubmissions ? (
                    <div className="space-y-3 py-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : existingSubmission ? (
                    /* Existing Application Already Submitted State */
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#10233F]">Proposal Already Submitted</span>
                          <span className="text-[11px] font-medium border border-slate-300 bg-white px-2 py-0.5 rounded text-slate-700">
                            {existingSubmission.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          Your startup filed a proposal for this problem statement on{" "}
                          {new Date(existingSubmission.createdAt).toLocaleDateString("en-IN")}. Multiple submissions for the same challenge are restricted under GFR Rule 173(i).
                        </p>
                      </div>

                      <Link to={`/startup/submissions/${existingSubmission._id}`} className="block w-full">
                        <Button className="w-full h-10 font-medium bg-[#10233F] hover:bg-slate-800 text-white cursor-pointer text-xs rounded">
                          View Existing Submission
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    /* New Application State */
                    <div className="space-y-4">
                      {(() => {
                        const hasBlockers = (eligibility?.blockers?.length || 0) > 0;
                        const hasMissing = (eligibility?.missingEvidence?.length || 0) > 0;
                        const isEligible = Boolean(
                          eligibility?.eligible ??
                          eligibility?.isEligible ??
                          (!hasBlockers && !hasMissing && (eligibility?.matchedRequirements?.length || 0) > 0)
                        );
                        const canApply = Boolean(
                          eligibility?.canApply ??
                          eligibility?.eligible ??
                          !hasBlockers
                        );

                        return (
                          <>
                            {/* Status Banner */}
                            <div
                              className={`p-3 rounded-lg border text-xs font-semibold ${
                                isEligible
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-amber-200 bg-amber-50 text-amber-900"
                              }`}
                            >
                              {isEligible ? (
                                <span>Qualified: Eligible to Apply</span>
                              ) : (
                                <span>Action Needed Before Applying</span>
                              )}
                            </div>

                            {/* Rule Results */}
                            <div className="space-y-2 text-xs">
                              {eligibility?.matchedRequirements?.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-emerald-800">
                                  <span>✓</span>
                                  <span>{item}</span>
                                </div>
                              ))}

                              {eligibility?.blockers?.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-rose-800 bg-rose-50/60 p-2 rounded-lg border border-rose-200">
                                  <span>✗</span>
                                  <span className="font-medium">{item}</span>
                                </div>
                              ))}

                              {eligibility?.missingEvidence?.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                                  <span>!</span>
                                  <span>Action Required: {item}</span>
                                </div>
                              ))}

                              {!isEligible && !hasBlockers && !hasMissing && (
                                <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800 space-y-1">
                                  <p className="font-semibold">Action Required:</p>
                                  <p className="text-[11px] leading-relaxed">
                                    Your startup profile requires complete statutory verification. Please ensure your DPIIT recognition number and stage are updated.
                                  </p>
                                  <Link to="/profile" className="inline-block text-[11px] font-bold text-blue-700 hover:underline pt-0.5">
                                    Update Startup Profile &rarr;
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Apply Button */}
                            <Link to={`/challenges/${id}/apply`} className="block w-full pt-2">
                              <Button
                                className="w-full h-11 font-medium bg-[#10233F] hover:bg-slate-800 text-white shadow-xs cursor-pointer text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!canApply}
                              >
                                Apply for Pilot Compact
                              </Button>
                            </Link>
                          </>
                        );
                      })()}
                    </div>
                  )
                ) : (
                  <div className="space-y-4 text-center py-2">
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Sign in as a registered startup to execute an instant, auditable eligibility check against this challenge.
                    </p>
                    <Link to="/login" className="block w-full">
                      <Button variant="outline" className="w-full text-xs font-medium h-9 border-slate-300">
                        Sign In to Check Eligibility
                      </Button>
                    </Link>
                    <Link to="/register" className="block w-full">
                      <Button className="w-full text-xs font-medium h-10 bg-[#10233F] hover:bg-slate-800 text-white">
                        Register as Startup &rarr;
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
              <p className="leading-relaxed">
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
