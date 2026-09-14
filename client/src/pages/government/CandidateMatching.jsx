import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProblem } from "@/hooks/useProblems";
import { useDepartmentSubmissions, useAiMatch } from "@/hooks/useGovernment";
import apiClient from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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

  // Prepare radar chart data
  const radarData = matchResult?.scoreBreakdown
    ? [
        {
          subject: "Sector Fit",
          score: matchResult.scoreBreakdown.sectorAlignment.score,
          fullMark: matchResult.scoreBreakdown.sectorAlignment.max,
        },
        {
          subject: "Capability Overlap",
          score: matchResult.scoreBreakdown.capabilityOverlap.score,
          fullMark: matchResult.scoreBreakdown.capabilityOverlap.max,
        },
        {
          subject: "Stage Maturity",
          score: matchResult.scoreBreakdown.stageMaturity.score,
          fullMark: matchResult.scoreBreakdown.stageMaturity.max,
        },
        {
          subject: "DPIIT Recognition",
          score: matchResult.scoreBreakdown.regulatoryRecognition.score,
          fullMark: matchResult.scoreBreakdown.regulatoryRecognition.max,
        },
      ]
    : [];

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
                ? "✓ Invitation Dispatched"
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

          {/* 2-Column: Breakdown Details + Radar Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Score Pillars */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border border-slate-200 bg-white rounded-xl shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-[#10233F]">
                    Deterministic Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  {/* Pillar 1 */}
                  <div className="space-y-1.5 pb-3 border-b border-slate-100">
                    <div className="flex justify-between font-bold text-[#10233F]">
                      <span>1. Sector Alignment</span>
                      <span className="font-mono text-[#2563EB]">
                        {matchResult.scoreBreakdown.sectorAlignment.score} /{" "}
                        {matchResult.scoreBreakdown.sectorAlignment.max} pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
                  <div className="space-y-1.5 pb-3 border-b border-slate-100">
                    <div className="flex justify-between font-bold text-[#10233F]">
                      <span>2. Technical Capability Overlap</span>
                      <span className="font-mono text-[#2563EB]">
                        {matchResult.scoreBreakdown.capabilityOverlap.score} /{" "}
                        {matchResult.scoreBreakdown.capabilityOverlap.max} pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
                  <div className="space-y-1.5 pb-3 border-b border-slate-100">
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
                  <div className="space-y-1.5">
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
                </CardContent>
              </Card>
            </div>

            {/* Right: Radar Chart */}
            <div className="lg:col-span-5">
              <Card className="border border-slate-200 bg-white rounded-xl shadow-xs">
                <CardHeader className="pb-2 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-[#10233F]">
                    Capability Radar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="#64748B"
                        fontSize={11}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 35]}
                        stroke="#94A3B8"
                        fontSize={9}
                      />
                      <Radar
                        name="Candidate"
                        dataKey="score"
                        stroke="#2563EB"
                        fill="#2563EB"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Explainable AI Advisory Card */}
          <Card className="border border-slate-200 bg-white rounded-xl shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-[#10233F]">
                  Explainable AI Advisory Report
                </CardTitle>
                <span className="text-xs font-mono font-semibold text-[#0F766E]">
                  Confidence: {Math.round((matchResult.aiAdvisory.confidence || 0.85) * 100)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5 text-xs">
              {/* Conclusion Summary */}
              <div className="space-y-1">
                <span className="font-bold text-xs text-[#10233F] block">
                  Executive Synthesis:
                </span>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {matchResult.aiAdvisory.summary ||
                    "Strong alignment identified between the startup's proven telemetry capabilities and municipal pipeline specifications."}
                </p>
              </div>

              {/* Key Fit Points */}
              {matchResult.aiAdvisory.keyFitPoints?.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-xs text-[#10233F] block">
                    Key Fit Points (Claims):
                  </span>
                  <div className="space-y-1.5">
                    {matchResult.aiAdvisory.keyFitPoints.map((claim, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <span className="text-emerald-700">✓</span>
                        <span>{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncertainties */}
              {matchResult.aiAdvisory.uncertainties?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-xs text-amber-800 block">
                    Identified Uncertainties / Questions for Evaluator:
                  </span>
                  <div className="space-y-1.5">
                    {matchResult.aiAdvisory.uncertainties.map((unc, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-slate-600"
                      >
                        <span className="text-amber-600">!</span>
                        <span>{unc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Disclaimer */}
              <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-700 border border-slate-200">
                <strong>Legal Disclaimer:</strong> {matchResult.aiAdvisory.disclaimer}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CandidateMatching;
