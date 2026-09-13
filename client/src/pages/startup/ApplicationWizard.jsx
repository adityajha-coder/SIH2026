import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProblem } from "@/hooks/useProblems";
import { useCreateSubmission } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  Layers,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { num: 1, title: "Executive Summary", desc: "Solution concept & target outcome" },
  { num: 2, title: "Technical Approach", desc: "Architecture & pilot methodology" },
  { num: 3, title: "Evidence Vault", desc: "Proof-of-concept & credentials" },
  { num: 4, title: "Declaration & Submit", desc: "Statutory Innovation Compact" },
];

export function ApplicationWizard() {
  const { id: problemId } = useParams();
  const navigate = useNavigate();
  const { organization, profile } = useAuth();

  const { data: problem, isLoading: isLoadingProblem } = useProblem(problemId);
  const createSubmissionMutation = useCreateSubmission();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [createdSubmissionId, setCreatedSubmissionId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    solutionTitle: "",
    executiveSummary: "",
    proposalDetails: "",
    implementationTimeline: "12 Weeks (Controlled Field Trial)",
    pilotKPIs: "",
    evidenceLinks: "https://github.com/my-org/telemetry-pilot-demo",
    acceptedCompact: false,
    noConflictDeclared: false,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.solutionTitle.trim() || formData.solutionTitle.length < 5) {
        toast.error("Solution title must be at least 5 characters");
        return;
      }
      if (!formData.executiveSummary.trim() || formData.executiveSummary.length < 10) {
        toast.error("Executive summary must be at least 10 characters");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.proposalDetails.trim() || formData.proposalDetails.length < 20) {
        toast.error("Technical approach details must be at least 20 characters");
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.acceptedCompact || !formData.noConflictDeclared) {
      toast.error("Please confirm both statutory declarations to proceed");
      return;
    }

    if (!organization?._id) {
      toast.error("Organization profile required to submit");
      return;
    }

    try {
      const result = await createSubmissionMutation.mutateAsync({
        problemId,
        organizationId: organization._id,
        solutionTitle: formData.solutionTitle.trim(),
        executiveSummary: formData.executiveSummary.trim(),
        proposalDetails: `${formData.proposalDetails.trim()}\n\n---\nTimeline: ${formData.implementationTimeline}\nTarget Pilot KPIs: ${formData.pilotKPIs || "Standard Department Baseline Targets"}`,
        evidenceFileIds: [],
      });

      const submissionId = result?.submission?._id || result?._id;
      setCreatedSubmissionId(submissionId);
      setIsSubmittedSuccess(true);
    } catch {
      // Error handled by mutation toast
    }
  };

  if (isLoadingProblem) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isSubmittedSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-16 px-4 text-center space-y-6"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto shadow-md">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F]">
            Application Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Your proposal has entered the sovereign evaluation pipeline. Evaluation committee scoring will proceed under double-blind governance protocols.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="font-bold text-emerald-900">What happens next:</div>
          <p className="text-emerald-800">
            1. Anonymized double-blind multi-expert scoring.
          </p>
          <p className="text-emerald-800">
            2. Any technical clarifications will appear directly on your dashboard.
          </p>
          <p className="text-emerald-800">
            3. Selected finalists enter ring-fenced Sandbox Innovation Compacts with 30-day statutory milestone payment SLAs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {createdSubmissionId ? (
            <Link to={`/startup/submissions/${createdSubmissionId}`}>
              <Button className="w-full sm:w-auto font-semibold bg-[#2563EB] hover:bg-blue-600 gap-1.5">
                Track Application Status
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
          <Link to="/startup/dashboard">
            <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-slate-200">
        <Link
          to={`/challenges/${problemId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Challenge Statement
        </Link>
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-200 bg-blue-50">
            Sandbox Pilot Proposal
          </Badge>
          <span className="text-xs text-[#64748B]">• Statutory Prior-Turnover Exempt</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
          {problem?.title}
        </h1>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-500"
                    : isCurrent
                    ? "bg-[#2563EB]"
                    : "bg-slate-200"
                }`}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? "text-[#2563EB]" : isDone ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  Step {s.num}
                </span>
                <span className="hidden sm:inline text-[11px] text-[#64748B] truncate ml-1">
                  {s.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content Card with Framer Motion Transition */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[#10233F]">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <span className="text-xs text-[#64748B] font-medium">
              Step {currentStep} of 4
            </span>
          </div>
          <CardDescription className="text-xs text-[#64748B]">
            {STEPS[currentStep - 1].desc}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* STEP 1: Executive Summary */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F]">
                      Solution Title *
                    </label>
                    <Input
                      value={formData.solutionTitle}
                      onChange={(e) => updateField("solutionTitle", e.target.value)}
                      placeholder="e.g. Distributed IoT Edge Telemetry for Real-Time Water Quality Monitoring"
                      className="h-10 text-xs"
                    />
                    <p className="text-[11px] text-[#64748B]">
                      A concise, descriptive title of the technology or approach.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F]">
                      Executive Summary & Value Proposition *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.executiveSummary}
                      onChange={(e) => updateField("executiveSummary", e.target.value)}
                      placeholder="Describe what your system does, how it fulfills the department's outcome KPIs, and why it is superior to conventional approaches..."
                      className="w-full p-3 rounded-lg border border-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Technical Approach */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F]">
                      Technical Architecture & Pilot Methodology *
                    </label>
                    <textarea
                      rows={6}
                      value={formData.proposalDetails}
                      onChange={(e) => updateField("proposalDetails", e.target.value)}
                      placeholder="Explain your stack, hardware/software integrations, edge/cloud topology, failure recovery, and data security measures..."
                      className="w-full p-3 rounded-lg border border-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Proposed Pilot Duration
                      </label>
                      <Input
                        value={formData.implementationTimeline}
                        onChange={(e) => updateField("implementationTimeline", e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Target Baseline vs Expected Delta
                      </label>
                      <Input
                        value={formData.pilotKPIs}
                        onChange={(e) => updateField("pilotKPIs", e.target.value)}
                        placeholder="e.g. 40% reduction in response latency"
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Evidence Vault */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#1E3A65]">
                      <FileCheck2 className="h-4 w-4 text-[#2563EB]" />
                      Evidence Vault & Benchmark References
                    </div>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      Provide links to existing software prototypes, lab test benchmark reports, video demonstrations, or published research supporting your operational claims.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F]">
                      Demo Repository / Architecture Artifact URL
                    </label>
                    <Input
                      value={formData.evidenceLinks}
                      onChange={(e) => updateField("evidenceLinks", e.target.value)}
                      placeholder="https://..."
                      className="h-10 text-xs font-mono"
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 hover:border-blue-300 transition-colors">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-semibold text-[#10233F]">
                      Upload Supporting Technical Dossier (PDF / ZIP)
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Maximum file size: 25 MB. SHA-256 integrity hash is computed client-side.
                    </p>
                    <Button size="sm" variant="outline" type="button" className="text-xs font-medium">
                      Select Evidence Document
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Declarations & Submit */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <span className="font-bold text-[#10233F]">
                      Proposal Summary Review:
                    </span>
                    <p>
                      <strong>Solution:</strong> {formData.solutionTitle || "Untitled"}
                    </p>
                    <p className="text-slate-600 line-clamp-2">
                      <strong>Executive Summary:</strong> {formData.executiveSummary}
                    </p>
                    <p className="text-slate-600">
                      <strong>Applying Organization:</strong> {organization?.name || "Startup Entity"}
                    </p>
                  </div>

                  {/* Statutory Declarations */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#334155]">
                      <input
                        type="checkbox"
                        checked={formData.acceptedCompact}
                        onChange={(e) => updateField("acceptedCompact", e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        I accept the terms of the <strong>Standard Innovation Compact</strong>. In the event of selection, intellectual property developed by the startup remains protected, and milestones are bound by Maharashtra's statutory 30-day payment SLA.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#334155]">
                      <input
                        type="checkbox"
                        checked={formData.noConflictDeclared}
                        onChange={(e) => updateField("noConflictDeclared", e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        I formally declare no conflict of interest (COI) with any departmental nodal officer presiding over this challenge formulation.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1 || createSubmissionMutation.isPending}
              className="text-xs"
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-blue-600"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={
                  !formData.acceptedCompact ||
                  !formData.noConflictDeclared ||
                  createSubmissionMutation.isPending
                }
                className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {createSubmissionMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Rocket className="h-3.5 w-3.5" />
                )}
                Submit Innovation Proposal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplicationWizard;
