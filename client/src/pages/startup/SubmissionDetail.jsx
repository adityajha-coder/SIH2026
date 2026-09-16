import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSubmission, useTransitionSubmission, useDeleteSubmission } from "@/hooks/useSubmissions";
import { useSubmissionResponses } from "@/hooks/useEvaluations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Rocket,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const FSM_STAGES = [
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "CLARIFICATION", label: "Clarification" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PILOT_ACTIVE", label: "Pilot Active" },
  { key: "SCALED", label: "Scaled" },
];

export function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: submission, isLoading, isError, error } = useSubmission(id);
  const { data: evaluationResponses = [], isLoading: loadingEvaluations } = useSubmissionResponses(id);
  const transitionMutation = useTransitionSubmission();
  const deleteMutation = useDeleteSubmission();

  const [clarificationNote, setClarificationNote] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[#10233F]">Submission Not Found</h2>
        <p className="text-xs text-[#64748B]">
          {error?.message || "Could not retrieve the requested submission record."}
        </p>
        <Link to="/startup/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const {
    solutionTitle,
    executiveSummary,
    proposalDetails,
    status,
    problemId,
    createdAt,
    updatedAt,
    transitionHistory = [],
    history = [],
  } = submission;

  const transitions = transitionHistory.length > 0 ? transitionHistory : history;

  const currentStageIndex = FSM_STAGES.findIndex((s) => s.key === status);
  const problemTitle = problemId?.title || "Department Outcome Challenge";

  const handleSendClarification = async (e) => {
    e.preventDefault();
    if (!clarificationNote.trim()) {
      toast.error("Please enter a response note");
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        id,
        toStatus: "UNDER_REVIEW",
        note: clarificationNote.trim(),
      });
      setClarificationNote("");
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this draft proposal?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      navigate("/startup/dashboard", { replace: true });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          to="/startup/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Startup Dashboard
        </Link>

        {status === "DRAFT" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteDraft}
            disabled={deleteMutation.isPending}
            className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 h-8"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Draft
          </Button>
        )}
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Proposal Record
          </span>
          <span className="text-xs text-[#64748B]">
            Submitted on {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
          {solutionTitle}
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B]">
          Challenge Target: <strong className="text-[#10233F]">{problemTitle}</strong>
        </p>
      </div>

      {/* FSM Lifecycle Stepper */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#10233F] uppercase tracking-wider">
            Sovereign FSM Lifecycle Progression
          </span>
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Current Stage: {status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {FSM_STAGES.map((st, idx) => {
            const isPassed = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div key={st.key} className="space-y-1.5">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? "bg-[#2563EB] ring-2 ring-blue-200"
                      : isPassed
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
                <div className="flex items-center gap-1">
                  {isPassed && !isCurrent ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : null}
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      isCurrent
                        ? "text-[#2563EB] font-bold"
                        : isPassed
                        ? "text-emerald-800"
                        : "text-slate-400"
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Field Pilot Sandbox Active Banner */}
      {["ACCEPTED", "PILOT_PROPOSED", "PILOT_ACTIVE", "PILOT_COMPLETED", "SCALED"].includes(status) && (
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-[#0F766E]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                Field Pilot Sandbox Active
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Statutory 30-Day SLA Active
              </span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              This proposal has transitioned into the Maharashtra Sovereign Sandbox. Monitor baseline vs target telemetry, submit deliverable evidence, and track statutory SLA payment releases.
            </p>
          </div>
          <Link to={`/pilots/${id}`} className="shrink-0">
            <Button className="bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold h-9 px-4 gap-1.5 shadow-sm">
              Open Pilot Canvas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Official Evaluation Committee Scorecard & Review */}
      {evaluationResponses && evaluationResponses.length > 0 ? (
        <Card className="border border-blue-200 bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#2563EB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  Independent Technical Evaluation
                </span>
                <span className="text-xs text-[#64748B]">• Statutory Rubric Assessment</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#10233F] mt-0.5">
                Evaluation Committee Scorecard &amp; Feedback
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {evaluationResponses.length} {evaluationResponses.length === 1 ? "Review Completed" : "Reviews Completed"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {evaluationResponses.map((evalResp, idx) => {
              const templateTitle = evalResp.templateId?.title || "Standard Innovation Sandbox Rubric";
              const submittedDate = evalResp.createdAt
                ? new Date(evalResp.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Official Record";

              return (
                <div
                  key={evalResp._id || idx}
                  className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#10233F]">
                        Empaneled Technical Evaluator #{idx + 1}
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Scored under: <strong className="text-slate-700">{templateTitle}</strong> • Evaluated on {submittedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-right">
                        <span className="text-xs text-[#64748B] mr-1">Aggregate Score:</span>
                        <span className="text-sm font-extrabold text-[#2563EB]">
                          {evalResp.totalScore} pts
                        </span>
                        {evalResp.weightedScore !== undefined && (
                          <span className="text-xs text-emerald-600 font-semibold ml-1.5">
                            ({Math.round(evalResp.weightedScore)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rubric Criteria Marks Breakdown */}
                  {evalResp.scores && evalResp.scores.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Criterion-by-Criterion Marks
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {evalResp.scores.map((sc, scIdx) => (
                          <div
                            key={scIdx}
                            className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#10233F]">
                              <span className="truncate pr-2">{sc.criterionName}</span>
                              <span className="font-mono text-[#2563EB] shrink-0">
                                {sc.score} / {sc.maxScore || 25}
                              </span>
                            </div>
                            {sc.comment && (
                              <p className="text-[11px] text-[#64748B] italic leading-tight">
                                "{sc.comment}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overall Reviewer Commentary */}
                  {evalResp.overallComment && (
                    <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                      <span className="font-bold text-[#10233F] block">
                        Committee Qualitative Feedback:
                      </span>
                      <p className="text-[#334155] leading-relaxed italic">
                        "{evalResp.overallComment}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : status === "UNDER_REVIEW" ? (
        <Card className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 text-xs text-[#10233F] flex items-start gap-3 shadow-2xs">
          <Clock className="h-5 w-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm block text-[#10233F]">
              Double-Blind Technical Evaluation In Progress
            </span>
            <p className="text-[#475569] leading-relaxed">
              This proposal is currently under independent evaluation by empaneled technical domain experts. Rubric marks, criterion breakdown, and committee commentary will appear here automatically once scoring is sealed.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Clarification Drawer if in CLARIFICATION state */}
      {status === "CLARIFICATION" && (
        <Card className="border border-amber-300 bg-amber-50/70 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Evaluation Committee Clarification Requested
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            The technical evaluation committee has requested additional operational details or clarification before finalizing scores. Please provide your explanation below.
          </p>
          <form onSubmit={handleSendClarification} className="space-y-3 pt-1">
            <textarea
              rows={4}
              value={clarificationNote}
              onChange={(e) => setClarificationNote(e.target.value)}
              placeholder="Enter your technical response or clarification for the evaluators..."
              className="w-full p-3 rounded-xl border border-amber-200 bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            <Button
              type="submit"
              size="sm"
              disabled={transitionMutation.isPending}
              className="gap-1.5 font-semibold text-xs bg-amber-700 hover:bg-amber-800 text-white shadow-xs"
            >
              {transitionMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Submit Clarification Response
            </Button>
          </form>
        </Card>
      )}

      {/* Proposal Narrative Cards */}
      <div className="grid gap-6">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#10233F]">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            Executive Summary
          </div>
          <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
            {executiveSummary}
          </p>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#10233F]">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            Technical Architecture & Pilot Scope
          </div>
          <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
            {proposalDetails}
          </p>
        </Card>

        {/* Audit & Transition History */}
        {transitions.length > 0 && (
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-[#10233F]">
              <Clock className="h-4 w-4 text-slate-500" />
              Forensic Audit & Lifecycle Log
            </div>
            <div className="space-y-3">
              {transitions.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#10233F]">
                      {(entry.from || entry.fromStatus || "START").replace(/_/g, " ")} → {(entry.to || entry.toStatus || "").replace(/_/g, " ")}
                    </span>
                    {entry.note && (
                      <p className="text-[#64748B] italic">"{entry.note}"</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SubmissionDetail;
