import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProblem } from "@/hooks/useProblems";
import { useDepartmentSubmissions, useAiMatch } from "@/hooks/useGovernment";
import apiClient from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
export function CandidateMatching() {
  const { id: problemId } = useParams();

  const { data: problem, isLoading: loadingProblem } = useProblem(problemId);
  const { data: submissions = [], isLoading: loadingSubmissions } = useDepartmentSubmissions({
    problemId,
  });

  const aiMatchMutation = useAiMatch();

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Auto-select first applicant when submissions load
  useEffect(() => {
    if (submissions.length > 0 && !selectedOrgId) {
      const firstOrgId = submissions[0].organizationId?._id || submissions[0].organizationId;
      setSelectedOrgId(firstOrgId);
    }
  }, [submissions, selectedOrgId]);

  // Execute Match
  const handleRunMatch = async (orgId = selectedOrgId) => {
    if (!orgId) {
      toast.error("Please select a candidate startup to evaluate.");
      return;
    }

    try {
      const res = await aiMatchMutation.mutateAsync({
        problemId,
        organizationId: orgId,
      });
      setMatchResult(res);
      toast.success("Explainable AI Match evaluated successfully!");
    } catch (err) {
      toast.error(
        err?.message ||
        err?.response?.data?.error?.message ||
          "Failed to evaluate AI match. Ensure startup has a completed profile."
      );
    }
  };

  // 1-Click Send Invitation to Candidate Startup
  const handleSendInvitation = async () => {
    if (!selectedOrgId || !problemId) {
      toast.error("Candidate startup and problem statement are required.");
      return;
    }

    setIsSendingInvite(true);
    try {
      await apiClient.post("/notifications/invite", {
        organizationId: selectedOrgId,
        problemId,
      });
      setInviteSent(true);
      toast.success("Official invitation notification sent to candidate startup!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to dispatch invitation notification."
      );
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="space-y-1 pb-2 border-b border-slate-200">
        <Link
          to="/government/dashboard"
          className="inline-block text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          &larr; Back to Command Center
        </Link>
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#2563EB]">
            Explainable AI Matcher
          </span>
          <span className="text-[#64748B]">• Statutory Transparency Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
          {loadingProblem ? <Skeleton className="h-9 w-96" /> : problem?.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Deterministic multi-factor capability scoring backed by auditable AI fit reasoning.
        </p>
      </div>

      {/* Candidate Selector Toolbar */}
      <Card className="border border-slate-200 bg-white rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#10233F] block">
              Select Applicant Startup
            </span>
            {loadingSubmissions ? (
              <Skeleton className="h-9 w-64" />
            ) : submissions.length === 0 ? (
              <p className="text-xs text-[#64748B]">
                No proposals have been submitted for this challenge yet.
              </p>
            ) : (
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setMatchResult(null);
                  setInviteSent(false);
                }}
                className="rounded-lg border border-slate-200 h-10 px-3 text-xs bg-white text-[#10233F] font-medium min-w-[280px]"
              >
                {submissions.map((s) => {
                  const oId = s.organizationId?._id || s.organizationId;
                  const oName = s.organizationId?.name || "Verified Startup";
                  return (
                    <option key={s._id} value={oId}>
                      {oName} — {s.solutionTitle}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end">
            <Button
              onClick={() => handleRunMatch()}
              disabled={!selectedOrgId || aiMatchMutation.isPending}
              className="text-xs font-medium bg-[#10233F] hover:bg-slate-800 text-white h-10 px-4 rounded shadow-xs"
            >
              {aiMatchMutation.isPending ? "Evaluating..." : "Run Explainable Match"}
            </Button>

            <Button
              type="button"
              onClick={handleSendInvitation}
              disabled={!selectedOrgId || isSendingInvite || inviteSent}
              className={`text-xs font-medium h-10 px-4 rounded transition-colors cursor-pointer border ${
                inviteSent
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
              }`}
            >
              {inviteSent
                ? "Invitation Dispatched"
                : isSendingInvite
                ? "Dispatching..."
                : "Invite to Apply"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-8">
          {/* Top Score Banner Card */}
          <Card className="border border-slate-300 bg-white rounded-xl shadow-xs overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#2563EB]">
                      Candidate: {matchResult.organizationName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`font-bold ${
                        matchResult.eligibility.eligible
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {matchResult.eligibility.eligible
                        ? "Deterministic Eligibility Passed"
                        : "Conditional Eligibility"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#10233F]">
                    Deterministic Capability Score:{" "}
                    <span className="text-[#2563EB]">
                      {matchResult.deterministicScore}/100
                    </span>
                  </h2>

                  <p className="text-xs text-[#64748B] max-w-xl">
                    Composed of 4 auditable statutory pillars: Sector Alignment (35pts), Capability Overlap (35pts), Stage Maturity (15pts), and DPIIT Recognition (15pts).
                  </p>
                </div>

                {/* Score Indicator */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0 min-w-[120px]">
                  <span className="text-3xl font-black text-[#10233F]">
                    {matchResult.deterministicScore}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mt-1">
                    Overall Fit
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deterministic Score Breakdown */}
          <Card className="border border-slate-200 bg-white rounded-xl shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#10233F]">
                Deterministic Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pillar 1 */}
                <div className="space-y-2 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                  <div className="flex justify-between font-bold text-[#10233F]">
                    <span>1. Sector Alignment</span>
                    <span className="font-mono text-[#2563EB]">
                      {matchResult.scoreBreakdown.sectorAlignment.score} /{" "}
                      {matchResult.scoreBreakdown.sectorAlignment.max} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB]"
                      style={{
                        width: `${
                          (matchResult.scoreBreakdown.sectorAlignment.score / 35) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[#64748B] block">
                    Matched Sectors:{" "}
                    {matchResult.scoreBreakdown.sectorAlignment.matched.join(", ") ||
                      "None"}
                  </span>
                </div>

                {/* Pillar 2 */}
                <div className="space-y-2 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                  <div className="flex justify-between font-bold text-[#10233F]">
                    <span>2. Technical Capability Overlap</span>
                    <span className="font-mono text-[#2563EB]">
                      {matchResult.scoreBreakdown.capabilityOverlap.score} /{" "}
                      {matchResult.scoreBreakdown.capabilityOverlap.max} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-teal-600"
                      style={{
                        width: `${
                          (matchResult.scoreBreakdown.capabilityOverlap.score / 35) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[#64748B] block">
                    Matched Keywords:{" "}
                    {matchResult.scoreBreakdown.capabilityOverlap.matched.join(", ") ||
                      "None detected in profile"}
                  </span>
                </div>

                {/* Pillar 3 */}
                <div className="space-y-2 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                  <div className="flex justify-between font-bold text-[#10233F]">
                    <span>3. Maturity Stage Suitability</span>
                    <span className="font-mono text-[#2563EB]">
                      {matchResult.scoreBreakdown.stageMaturity.score} /{" "}
                      {matchResult.scoreBreakdown.stageMaturity.max} pts
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] block">
                    Startup Stage: {matchResult.scoreBreakdown.stageMaturity.currentStage}
                  </span>
                </div>

                {/* Pillar 4 */}
                <div className="space-y-2 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                  <div className="flex justify-between font-bold text-[#10233F]">
                    <span>4. Regulatory DPIIT Exemption</span>
                    <span className="font-mono text-[#2563EB]">
                      {matchResult.scoreBreakdown.regulatoryRecognition.score} /{" "}
                      {matchResult.scoreBreakdown.regulatoryRecognition.max} pts
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] block">
                    Status:{" "}
                    {matchResult.scoreBreakdown.regulatoryRecognition.hasDpiit
                      ? "DPIIT Recognized (Turnover & Prior Experience Exempt)"
                      : "Unverified / Self-Certified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explainable AI Advisory Card - Point-Wise Detailed Report */}
          <Card className="border border-slate-200 bg-white rounded-xl shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F]">
                    Explainable AI Advisory Report
                  </CardTitle>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Statutory multi-pillar evaluation report formulated under GFR Rule 173(i) transparency directives
                  </p>
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded border border-teal-200 block sm:inline-block">
                    Confidence: {Math.round((matchResult.aiAdvisory?.confidence || 0.88) * 100)}%
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 text-xs">
              {/* Executive Evaluation Synthesis */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block">
                  Executive Evaluation Synthesis
                </span>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-normal">
                  {matchResult.aiAdvisory?.executiveSummary ||
                    matchResult.aiAdvisory?.summary ||
                    "Comprehensive procurement evaluation evaluated against statutory sandbox constraints."}
                </p>
              </div>

              {/* Section 1: Point-Wise Technical Architecture Alignment */}
              {((matchResult.aiAdvisory?.technicalPoints && matchResult.aiAdvisory.technicalPoints.length > 0) ||
                (matchResult.aiAdvisory?.keyFitPoints && matchResult.aiAdvisory.keyFitPoints.length > 0)) && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      1. Technical Architecture & Capability Alignment
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Point-by-point technical fit analysis of the candidate's software stack, data models, and system throughput
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {(matchResult.aiAdvisory.technicalPoints || matchResult.aiAdvisory.keyFitPoints).map((pt, idx) => {
                      const pointNum = pt.pointNumber || String(idx + 1).padStart(2, "0");
                      const title =
                        pt.title ||
                        (typeof pt === "string" && pt.includes(":")
                          ? pt.split(":")[0].trim()
                          : `Technical Pillar ${pointNum}`);
                      const explanation =
                        pt.detailedExplanation ||
                        (typeof pt === "string" && pt.includes(":")
                          ? pt.split(":").slice(1).join(":").trim()
                          : typeof pt === "string"
                          ? pt
                          : "");

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-1.5"
                        >
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70 shrink-0">
                              Point {pointNum}
                            </span>
                            <span className="text-xs font-bold text-[#10233F]">
                              {title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                            {explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Point-Wise Statutory & Regulatory Compliance */}
              {matchResult.aiAdvisory?.statutoryPoints?.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      2. Statutory & Public Procurement Compliance (GFR 173(i) & DPIIT)
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Point-by-point verification of prior-experience exemptions, turnover waivers, and state data sovereignty
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {matchResult.aiAdvisory.statutoryPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-1.5"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/70 shrink-0">
                            Point {pt.pointNumber || String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xs font-bold text-[#10233F]">
                            {pt.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                          {pt.detailedExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Point-Wise 90-Day Sandbox Pilot Viability */}
              {matchResult.aiAdvisory?.pilotPoints?.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      3. 90-Day Field Sandbox Pilot Deployment Feasibility
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Point-by-point assessment of milestone milestones, API retrofits, sensor hardware, and deployment schedules
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {matchResult.aiAdvisory.pilotPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-1.5"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70 shrink-0">
                            Point {pt.pointNumber || String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xs font-bold text-[#10233F]">
                            {pt.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                          {pt.detailedExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Point-Wise Technical Evaluator Committee Scrutiny */}
              {((matchResult.aiAdvisory?.scrutinyPoints && matchResult.aiAdvisory.scrutinyPoints.length > 0) ||
                (matchResult.aiAdvisory?.uncertainties && matchResult.aiAdvisory.uncertainties.length > 0)) && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      4. Technical Committee Interrogation & Scrutiny Items
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Point-by-point critical technical questions the departmental evaluation committee must interrogate before pilot award
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {(matchResult.aiAdvisory.scrutinyPoints || matchResult.aiAdvisory.uncertainties).map((pt, idx) => {
                      const pointNum = pt.pointNumber || String(idx + 1).padStart(2, "0");
                      const title =
                        pt.title ||
                        (typeof pt === "string" && pt.includes(":")
                          ? pt.split(":")[0].trim()
                          : `Scrutiny Inquiry ${pointNum}`);
                      const explanation =
                        pt.detailedExplanation ||
                        (typeof pt === "string" && pt.includes(":")
                          ? pt.split(":").slice(1).join(":").trim()
                          : typeof pt === "string"
                          ? pt
                          : "");

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1.5"
                        >
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/70 shrink-0">
                              Point {pointNum}
                            </span>
                            <span className="text-xs font-bold text-[#10233F]">
                              {title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                            {explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 5: Point-Wise Recommended Officer Directives */}
              {matchResult.aiAdvisory?.actionDirectives?.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      5. Recommended Procurement Directives & Next Steps
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Point-by-point actionable directives for the nodal procurement officer
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {matchResult.aiAdvisory.actionDirectives.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-1.5"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#10233F] bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300 shrink-0">
                            Point {pt.pointNumber || String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xs font-bold text-[#10233F]">
                            {pt.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                          {pt.detailedExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Disclaimer */}
              <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-700 border border-slate-200 pt-3">
                <strong>Statutory Notice:</strong> {matchResult.aiAdvisory?.disclaimer || "AI advisory reports provide auditable, explainable analytical evidence under GFR 173(i). Final procurement decisions remain solely with designated departmental evaluation authorities."}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CandidateMatching;
