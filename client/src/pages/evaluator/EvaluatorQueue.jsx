import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMyAssignments } from "@/hooks/useEvaluations";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Scale,
} from "lucide-react";

const DEMO_ASSIGNMENTS = [
  {
    _id: "demo-eval-01",
    status: "PENDING",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    submissionId: {
      _id: "demo-sub-01",
      solutionTitle: "Acoustic IoT Pressure Sensor Array for Non-Revenue Water Loss",
      executiveSummary:
        "Non-invasive ultrasonic acoustic sensors retrofitted across municipal cast-iron junctions with edge ML to detect sub-surface ruptures under 3 minutes.",
      status: "UNDER_REVIEW",
      anonymizedCode: "ANON-VENTURE-884",
    },
    templateId: {
      title: "Standard Sovereign Innovation Sandbox Rubric",
      criteria: [
        { name: "Technical Feasibility & Architecture", maxScore: 25, weight: 0.25 },
        { name: "Field Pilot Viability (90 Days)", maxScore: 25, weight: 0.25 },
        { name: "State Constraints & SDC Compliance", maxScore: 25, weight: 0.25 },
        { name: "Cost Efficiency & Open Standards", maxScore: 25, weight: 0.25 },
      ],
    },
    problemTitle: "Real-Time Water Leakage Detection in Nashik Municipal Pipeline",
  },
  {
    _id: "demo-eval-02",
    status: "PENDING",
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    submissionId: {
      _id: "demo-sub-02",
      solutionTitle: "Edge AI Thermal Diagnostic Kit for Rural Primary Health Centers",
      executiveSummary:
        "Battery-operated handheld thermal vision scanner with offline transformer model for non-contact early diabetic foot ulcer screening in rural taluka clinics.",
      status: "UNDER_REVIEW",
      anonymizedCode: "ANON-VENTURE-519",
    },
    templateId: {
      title: "Public Health Innovation Sandbox Rubric",
      criteria: [
        { name: "Clinical Validation & Accuracy", maxScore: 30, weight: 0.3 },
        { name: "Offline Rural Usability", maxScore: 25, weight: 0.25 },
        { name: "Hardware Resilience & Battery Life", maxScore: 25, weight: 0.25 },
        { name: "Cost Per Scan Economics", maxScore: 20, weight: 0.2 },
      ],
    },
    problemTitle: "Early Diagnostic Screening Devices for Rural Primary Health Centers (Gadchiroli)",
  },
];

export function EvaluatorQueue() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data: serverAssignments = [], isLoading } = useMyAssignments();

  // If server returns assignments, use them; otherwise provide demo sandbox assignments
  const assignments = useMemo(() => {
    if (serverAssignments && serverAssignments.length > 0) {
      return serverAssignments;
    }
    return DEMO_ASSIGNMENTS;
  }, [serverAssignments]);

  // Metrics
  const metrics = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length;
    const completed = assignments.filter((a) => a.status === "COMPLETED").length;
    
    // Urgent: deadline < 48 hours
    const urgent = assignments.filter((a) => {
      if (!a.deadline) return false;
      const diffHrs = (new Date(a.deadline) - new Date()) / (1000 * 60 * 60);
      return diffHrs > 0 && diffHrs <= 48;
    }).length;

    return { total, pending, completed, urgent };
  }, [assignments]);

  // Filtered
  const filteredAssignments = useMemo(() => {
    if (filterStatus === "ALL") return assignments;
    return assignments.filter((a) => a.status === filterStatus);
  }, [assignments, filterStatus]);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Technical Evaluation Board
            </span>
            <span className="text-xs text-[#64748B]">• Double-Blind Scoring Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            Assigned Review Dossiers
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="h-3.5 w-3.5" />
          Double-Blind Mode Active
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.total}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Active technical review dossiers
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Pending Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.pending}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Awaiting rubric scoring
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Completed Scorecards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.completed}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Submitted to evaluation committee
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-[#64748B]">
              Due &lt; 48 Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-extrabold text-[#10233F]">
                {metrics.urgent}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              Approaching statutory SLA deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Listing Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#10233F]">
              Active Evaluation Assignments
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {["ALL", "PENDING", "COMPLETED"].map((st) => (
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

        {/* Assignments Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="border border-slate-200 p-8 text-center rounded-2xl bg-white">
            <p className="text-sm font-semibold text-[#10233F]">
              No evaluation assignments found in this view.
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              New submissions will appear here once assigned by the department committee chair.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => {
              const sub = assignment.submissionId || {};
              const template = assignment.templateId || {};
              const isCompleted = assignment.status === "COMPLETED";

              const deadlineStr = assignment.deadline
                ? new Date(assignment.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "No deadline set";

              const criteriaCount = template.criteria?.length || 4;

              // Anonymized code identifier
              const anonymizedCode =
                sub.anonymizedCode ||
                `ANON-PROP-${(sub._id || assignment._id).slice(-4).toUpperCase()}`;

              return (
                <div
                  key={assignment._id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#2563EB]">
                        {anonymizedCode}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`font-semibold ${
                          isCompleted ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {isCompleted ? "✓ Scored & Finalized" : "○ Pending Double-Blind Review"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#64748B]">Due: {deadlineStr}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-[#10233F] leading-snug">
                      {sub.solutionTitle || "Technical Pilot Proposal"}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {sub.executiveSummary ||
                        "Proprietary technical proposal submitted for state sandbox trial."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pt-1">
                      <span className="flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5 text-[#2563EB]" />
                        Rubric: {template.title || "Standard Evaluation Rubric"} ({criteriaCount} Criteria)
                      </span>
                      {assignment.problemTitle && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 truncate max-w-xs">
                            Challenge: {assignment.problemTitle}
                          </span>
                        </>
                      )}
                    </div>

                    {isCompleted && assignment.evaluationResponse && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#10233F]">Score Awarded:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {assignment.evaluationResponse.totalScore} pts ({Math.round(assignment.evaluationResponse.weightedScore || 0)}%)
                          </span>
                        </div>
                        {assignment.evaluationResponse.overallComment && (
                          <p className="text-[11px] text-[#64748B] italic truncate max-w-md">
                            "{assignment.evaluationResponse.overallComment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="shrink-0 self-end md:self-auto">
                    <Link to={`/evaluator/evaluate/${assignment._id}`}>
                      <Button
                        size="sm"
                        className={`gap-1.5 font-semibold text-xs h-9 px-4 ${
                          isCompleted
                            ? "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                            : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm"
                        }`}
                      >
                        {isCompleted ? "View Submitted Scorecard" : "Enter Evaluation Room"}
                        <ArrowRight className="h-3.5 w-3.5" />
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

export default EvaluatorQueue;
