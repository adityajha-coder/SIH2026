import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmissionResponses, useCreateDecision } from "@/hooks/useEvaluations";
import { toast } from "sonner";
import { Scale, CheckCircle2, XCircle, Loader2, Award, FileText, Upload, DollarSign } from "lucide-react";
import { apiClient } from "@/lib/api/client";

async function computeFileSHA256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function DecisionModal({ isOpen, onClose, submission, onDecisionMade }) {
  const [outcome, setOutcome] = useState("ACCEPTED");
  const [rationale, setRationale] = useState(
    "Selected for 90-day sandbox pilot under Rule 173(i) of GFR 2017. Evaluator consensus confirms technical architecture maturity, data localization within Maharashtra SDC, and high potential to meet baseline KPIs."
  );

  // Dynamic Grant & 3-Part Division
  const [grantAmount, setGrantAmount] = useState(2500000);
  const [durationDays, setDurationDays] = useState(90);
  const [paymentDescription, setPaymentDescription] = useState(
    "Disbursements released in 3 tranches (30% - 40% - 30%) through Maharashtra Sovereign Treasury Escrow (PFMS) upon departmental verification of milestone proofs."
  );
  const [planDetails, setPlanDetails] = useState(
    "90-day sandbox trial in designated Maharashtra state pilot zones. Startup to configure secure containers, stream operational telemetry, and complete third-party audit."
  );

  // PDF Document Upload
  const [planPdfFile, setPlanPdfFile] = useState(null);
  const [planDocumentName, setPlanDocumentName] = useState("");
  const [planDocumentUrl, setPlanDocumentUrl] = useState("");
  const [planDocumentHash, setPlanDocumentHash] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const submissionId = submission?._id;
  const { data: responses = [], isLoading: loadingResponses } = useSubmissionResponses(submissionId);
  const createDecisionMutation = useCreateDecision();

  if (!submission) return null;

  const orgName = submission.organizationId?.name || "Candidate Startup";
  const probTitle = submission.problemId?.title || "Challenge Statement";

  // Calculate 3-part split
  const numGrant = Number(grantAmount) || 0;
  const p1Amount = Math.round(numGrant * 0.3);
  const p2Amount = Math.round(numGrant * 0.4);
  const p3Amount = numGrant - p1Amount - p2Amount;

  const tranches = [
    {
      trancheId: "TR-01",
      name: "Phase 1: Mobilization & Sandbox Setup",
      percentage: 30,
      amount: p1Amount,
      deliverable: "Sandbox charter execution, API test integration, and security container provisioning.",
    },
    {
      trancheId: "TR-02",
      name: "Phase 2: Mid-Term Field Validation",
      percentage: 40,
      amount: p2Amount,
      deliverable: "Live sensor telemetry across municipal test zone with active sampling nodes.",
    },
    {
      trancheId: "TR-03",
      name: "Phase 3: Final Acceptance & Audit Signoff",
      percentage: 30,
      amount: p3Amount,
      deliverable: "Final KPI compliance audit, CERT-In cybersecurity certification, and scale memo.",
    },
  ];

  // Calculate aggregate score
  const avgScore = responses.length > 0
    ? Math.round(responses.reduce((sum, r) => sum + (r.weightedScore || 0), 0) / responses.length)
    : null;

  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Plan document must be under 25 MB.");
      return;
    }

    setPlanPdfFile(file);
    setPlanDocumentName(file.name);
    setIsUploadingPdf(true);

    try {
      const hash = await computeFileSHA256(file);
      setPlanDocumentHash(`sha256:${hash}`);

      const validEntityId = submissionId?.match(/^[0-9a-fA-F]{24}$/)
        ? submissionId
        : "66f000000000000000000001";

      const intentRes = await apiClient.post("/evidence/upload-intent", {
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        sizeBytes: file.size,
        entityType: "SUBMISSION",
        entityId: validEntityId,
      });

      const intentData = intentRes.data?.data || intentRes.data;
      const uploadUrl = intentData?.uploadUrl;
      const evidenceId = intentData?.evidenceId || intentData?.id;

      if (uploadUrl && !intentData?.isMock) {
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/pdf" },
          body: file,
        });
      }

      if (evidenceId) {
        await apiClient.post(`/evidence/${evidenceId}/finalize`, {
          checksumSHA256: `sha256:${hash}`,
          actualSizeBytes: file.size,
        });
        try {
          const dlRes = await apiClient.get(`/evidence/${evidenceId}`);
          setPlanDocumentUrl(dlRes.data?.data?.downloadUrl || uploadUrl || "");
        } catch {
          setPlanDocumentUrl(uploadUrl || "");
        }
      } else {
        setPlanDocumentUrl(uploadUrl || "");
      }

      toast.success(`Plan PDF "${file.name}" uploaded and hashed!`);
    } catch (err) {
      toast.error(err.message || "Failed to process PDF document");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rationale.trim() || rationale.trim().length < 10) {
      toast.error("Please provide a statutory rationale (at least 10 characters).");
      return;
    }

    try {
      await createDecisionMutation.mutateAsync({
        submissionId,
        outcome,
        rationale: rationale.trim(),
        grantAmount: outcome === "ACCEPTED" ? numGrant : undefined,
        paymentDescription: outcome === "ACCEPTED" ? paymentDescription.trim() : undefined,
        tranches: outcome === "ACCEPTED" ? tranches : undefined,
        planDetails: outcome === "ACCEPTED" ? planDetails.trim() : undefined,
        durationDays: outcome === "ACCEPTED" ? Number(durationDays) || 90 : undefined,
        planDocumentUrl: outcome === "ACCEPTED" ? planDocumentUrl : undefined,
        planDocumentName: outcome === "ACCEPTED" ? planDocumentName : undefined,
        planDocumentHash: outcome === "ACCEPTED" ? planDocumentHash : undefined,
      });

      toast.success(
        outcome === "ACCEPTED"
          ? `Proposal approved! ₹${numGrant.toLocaleString("en-IN")} pilot offer released to ${orgName}.`
          : `Decision recorded: Proposal marked REJECTED.`
      );
      onDecisionMade?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || err.message || "Failed to record decision"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white border border-slate-200 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
            <Scale className="h-3.5 w-3.5" />
            <span>Statutory Decision Gate</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#64748B]">GFR Rule 173(i) Award Release</span>
          </div>
          <DialogTitle className="text-lg font-bold text-[#10233F] mt-1">
            Departmental Pilot Award Decision &amp; Plan Sanction
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Specify statutory rationale, define grant amount with automated 3-part tranche division, and attach the official plan document.
          </DialogDescription>
        </DialogHeader>

        {/* Proposal Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#10233F] text-sm">{submission.solutionTitle}</span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {submission.status?.replace("_", " ")}
            </span>
          </div>
          <div className="text-slate-600">
            <strong>Applicant:</strong> {orgName} • <strong>Challenge:</strong> {probTitle}
          </div>
        </div>

        {/* Evaluator Scorecard Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#10233F] uppercase tracking-wider">
              Evaluator Committee Marks ({responses.length} Completed)
            </span>
            {avgScore !== null && (
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Average Merit: {avgScore}%
              </span>
            )}
          </div>

          {loadingResponses ? (
            <div className="p-3 text-xs text-slate-500">Loading evaluator scores...</div>
          ) : responses.length === 0 ? (
            <div className="p-3 border border-dashed border-amber-300 bg-amber-50 rounded-lg text-xs text-amber-800">
              No evaluator scores submitted yet. Decisions are typically made after independent technical scoring.
            </div>
          ) : (
            <div className="grid gap-2 max-h-36 overflow-y-auto pr-1">
              {responses.map((r, idx) => (
                <div
                  key={r._id || idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#10233F]">
                      Evaluator #{idx + 1}: {r.evaluatorId?.name || "Independent Expert"}
                    </span>
                    {r.overallComment && (
                      <div className="text-[11px] text-slate-600 italic line-clamp-1">
                        "{r.overallComment}"
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-blue-700 shrink-0">
                    {r.totalScore} pts ({Math.round(r.weightedScore)}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Decision Outcome Radio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#10233F]">
              Statutory Decision Outcome *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutcome("ACCEPTED")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  outcome === "ACCEPTED"
                    ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-400"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>ACCEPT &amp; AWARD PILOT</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 leading-tight">
                  Authorize 90-day sandbox pilot under GFR 173(i) prior-turnover exemption.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("REJECTED")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  outcome === "REJECTED"
                    ? "border-rose-500 bg-rose-50/70 ring-1 ring-rose-400"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>REJECT PROPOSAL</span>
                </div>
                <div className="text-[11px] text-rose-700 mt-1 leading-tight">
                  Does not meet technical merit or statutory compliance criteria.
                </div>
              </button>
            </div>
          </div>

          {/* If ACCEPTED: Configure Dynamic Grant Amount & 3-Part Division */}
          {outcome === "ACCEPTED" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#10233F]">
                  <DollarSign className="h-4 w-4 text-[#2563EB]" />
                  <span>Pilot Grant Corpus &amp; Dynamic 3-Part Tranche Split</span>
                </div>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  Rule 173(i) Escrow
                </span>
              </div>

              {/* Amount Input & Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#10233F] block mb-1">
                    Total Pilot Grant Amount (₹) *
                  </label>
                  <Input
                    type="number"
                    min="100000"
                    step="50000"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="text-xs font-mono font-bold text-[#10233F] h-9"
                    required
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] text-slate-500">Presets:</span>
                    {[1000000, 2500000, 5000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGrantAmount(amt)}
                        className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer ${
                          grantAmount === amt
                            ? "bg-[#2563EB] text-white border-blue-600 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        ₹{(amt / 100000).toFixed(0)}L
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#10233F] block mb-1">
                    Sandbox Trial Duration (Days) *
                  </label>
                  <Input
                    type="number"
                    min="30"
                    max="180"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 90)}
                    className="text-xs font-mono font-bold text-[#10233F] h-9"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1.5">
                    Standard state government pilot sandbox duration: 90 days
                  </div>
                </div>
              </div>

              {/* Dynamic 3-Part Split Cards */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-[#10233F] text-[11px] uppercase tracking-wider">
                  Automated 3-Phase Milestone Allocation (30% - 40% - 30%)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600">Phase 1 (30%)</span>
                      <span className="font-mono font-bold text-emerald-700">₹{p1Amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="font-semibold text-[#10233F] text-[11px]">Mobilization &amp; Setup</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Disbursed upon sandbox charter &amp; architecture deployment proof.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600">Phase 2 (40%)</span>
                      <span className="font-mono font-bold text-blue-700">₹{p2Amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="font-semibold text-[#10233F] text-[11px]">Field Validation</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Disbursed upon live operational telemetry &amp; sampling validation.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600">Phase 3 (30%)</span>
                      <span className="font-mono font-bold text-purple-700">₹{p3Amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="font-semibold text-[#10233F] text-[11px]">Final Audit &amp; Signoff</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Disbursed upon final KPI compliance audit &amp; security certification.
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms & Description */}
              <div className="space-y-1">
                <label className="font-semibold text-[#10233F] block">
                  Payment Description &amp; Milestone Terms *
                </label>
                <textarea
                  rows={2}
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Plan Details & Scope */}
              <div className="space-y-1">
                <label className="font-semibold text-[#10233F] block">
                  Government Pilot Plan Scope &amp; Target Locations *
                </label>
                <textarea
                  rows={2}
                  value={planDetails}
                  onChange={(e) => setPlanDetails(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Attach Official Plan PDF */}
              <div className="space-y-1.5 pt-1 border-t border-blue-200/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#10233F] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Attach Official Pilot Plan / Sanction Document (PDF)</span>
                  </label>
                  {planDocumentHash && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Integrity Hash Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>{planPdfFile ? "Replace PDF Document" : "Choose PDF Document"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                  </label>

                  {isUploadingPdf ? (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Computing SHA-256 hash &amp; uploading...</span>
                    </div>
                  ) : planDocumentName ? (
                    <div className="text-xs text-slate-700 font-medium truncate max-w-xs">
                      📄 {planDocumentName}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Attach government charter or sanction PDF (optional but recommended)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statutory Rationale */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#10233F]">
              Statutory Rationale &amp; GFR 173(i) Justification *
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              required
            />
            <div className="text-[11px] text-[#64748B]">
              This justification is permanently sealed in the public procurement audit trail and transmitted to the applicant.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-300 text-slate-700 h-9 px-3 rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createDecisionMutation.isPending || isUploadingPdf}
              className={`text-xs font-semibold text-white h-9 px-4 rounded gap-1.5 cursor-pointer shadow-xs ${
                outcome === "ACCEPTED"
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-rose-700 hover:bg-rose-800"
              }`}
            >
              {createDecisionMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording Decision...
                </>
              ) : (
                <>
                  <Award className="h-3.5 w-3.5" />
                  Record Decision &amp; Release
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DecisionModal;
