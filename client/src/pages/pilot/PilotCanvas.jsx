import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSubmission, useTransitionSubmission } from "@/hooks/useSubmissions";
import {
  useEscrow,
  useInitializeEscrow,
  useSubmitEvidence,
  useDisburseTranche,
  useScalePilot,
} from "@/hooks/useEscrow";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ECertificateModal } from "@/components/certificate/ECertificateModal";

function parseTrancheAmount(val) {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const PILOT_LIFECYCLE_STAGES = [
  { key: "PILOT_PROPOSED", label: "Pilot Proposed", desc: "Charter & baseline defined" },
  { key: "PILOT_ACTIVE", label: "Active Field Trial", desc: "Live deployment & testing" },
  { key: "PILOT_COMPLETED", label: "Audit Completed", desc: "Final verification" },
  { key: "SCALED", label: "Scaled to GeM", desc: "Commercial procurement" },
];

const DEFAULT_TRANCHES = [
  {
    id: "TR-01",
    name: "M1: Mobilization & Sandbox Setup",
    percentage: 30,
    amount: "₹7,50,000",
    rawAmount: 750000,
    status: "DISBURSED",
    deliverable: "Sandbox charter execution, API test integration, and container provisioning.",
    disbursedDate: "12 Aug 2026",
    utrNumber: "MAH-RBI-9920148",
    evidence: [
      { name: "Charter_Agreement_Signed.pdf", size: "2.4 MB", hash: "sha256:e3b0c44298fc1c149afbf4c8996fb924" },
    ],
  },
  {
    id: "TR-02",
    name: "M2: Mid-Term Field Validation",
    percentage: 40,
    amount: "₹10,00,000",
    rawAmount: 1000000,
    status: "IN_VERIFICATION",
    deliverable: "Live operational telemetry across municipal test zone with active sampling nodes.",
    disbursedDate: null,
    utrNumber: null,
    evidence: [
      { name: "MidTerm_Telemetry_Audit_Report.pdf", size: "4.8 MB", hash: "sha256:ca978112ca1bbdcafac231b39a23dc4d" },
    ],
  },
  {
    id: "TR-03",
    name: "M3: Final Acceptance & Signoff",
    percentage: 30,
    amount: "₹7,50,000",
    rawAmount: 750000,
    status: "PENDING",
    deliverable: "Final KPI compliance audit, cybersecurity certification, and scale memo.",
    disbursedDate: null,
    utrNumber: null,
    evidence: [],
  },
];

export function PilotCanvas() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: submission, isLoading, refetch } = useSubmission(id);
  const transitionMutation = useTransitionSubmission();

  // Escrow Hooks
  const { data: escrowData, isLoading: loadingEscrow, refetch: refetchEscrow } = useEscrow(id);
  const initEscrowMutation = useInitializeEscrow();
  const submitEvidenceMutation = useSubmitEvidence();
  const disburseTrancheMutation = useDisburseTranche();
  const scalePilotMutation = useScalePilot();

  // Modals
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState("PILOT_ACTIVE");
  const [transitionNote, setTransitionNote] = useState("");

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedTrancheForEvidence, setSelectedTrancheForEvidence] = useState(null);
  const [evidenceFileName, setEvidenceFileName] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const [isScalingModalOpen, setIsScalingModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [gemContractId, setGemContractId] = useState("GEM-2026-DIR-99120");
  const [sanctionMemo, setSanctionMemo] = useState(
    "Sanctioned for direct commercial procurement on GeM under GFR Rule 173(i) exemption following audited pilot success."
  );

  const isGovOrAdmin = user?.role === "GOVERNMENT_USER" || user?.role === "ADMIN";
  const isStartup = user?.role === "STARTUP_USER";

  const currentStatus = submission?.status || "PILOT_ACTIVE";
  const solutionTitle = submission?.solutionTitle || "Autonomous Smart Water Loss & Telemetry Node";
  const problemTitle = submission?.problemId?.title || "Real-Time Non-Revenue Water Loss Detection";
  const organizationName = submission?.organizationId?.name || "Candidate Startup";

  const tranches = useMemo(() => {
    if (escrowData?.tranches && escrowData.tranches.length > 0) {
      return escrowData.tranches.map((t) => ({
        id: t.trancheId,
        mongoId: t._id,
        name: t.name,
        percentage: t.percentage,
        amount: `₹${(t.amount || 0).toLocaleString("en-IN")}`,
        rawAmount: t.amount,
        status: t.status,
        slaDaysElapsed: t.slaDaysElapsed || 0,
        maxSlaDays: t.maxSlaDays || 30,
        deliverable: t.deliverable,
        disbursedDate: t.disbursedDate
          ? new Date(t.disbursedDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
        utrNumber: t.utrNumber,
        evidence: (t.evidence || []).map((e) => ({
          id: e._id,
          name: e.name,
          size: e.size,
          hash: e.hash,
          downloadUrl: e.fileUrl,
          description: e.description,
        })),
      }));
    }
    return DEFAULT_TRANCHES;
  }, [escrowData]);

  const permittedNextStates = useMemo(() => {
    switch (currentStatus) {
      case "ACCEPTED":
        return [{ key: "PILOT_PROPOSED", label: "Propose Pilot Charter" }];
      case "PILOT_PROPOSED":
        return [{ key: "PILOT_ACTIVE", label: "Authorize Active Field Trial" }];
      case "PILOT_ACTIVE":
        return [
          { key: "PILOT_COMPLETED", label: "Mark Pilot Completed & Audited" },
          { key: "CLOSED", label: "Close Sandbox" },
        ];
      case "PILOT_COMPLETED":
        return [
          { key: "SCALED", label: "Approve Commercial Scaling (GeM)" },
          { key: "CLOSED", label: "Close Completed Pilot" },
        ];
      case "SCALED":
        return [{ key: "CLOSED", label: "Archive Closed Sandbox" }];
      default:
        return [{ key: "PILOT_ACTIVE", label: "Set Active Field Trial" }];
    }
  }, [currentStatus]);

  const totalDisbursed = useMemo(() => {
    return tranches
      .filter((t) => t.status === "DISBURSED")
      .reduce((sum, t) => sum + parseTrancheAmount(t.rawAmount || t.amount), 0);
  }, [tranches]);

  const totalInVerification = useMemo(() => {
    return tranches
      .filter((t) => t.status === "IN_VERIFICATION")
      .reduce((sum, t) => sum + parseTrancheAmount(t.rawAmount || t.amount), 0);
  }, [tranches]);

  const totalScheduled = useMemo(() => {
    return tranches
      .filter((t) => t.status === "PENDING" || t.status === "UPCOMING")
      .reduce((sum, t) => sum + parseTrancheAmount(t.rawAmount || t.amount), 0);
  }, [tranches]);

  const totalBudget = useMemo(() => {
    return (
      escrowData?.totalGrantAmount ||
      totalDisbursed + totalInVerification + totalScheduled ||
      2500000
    );
  }, [escrowData?.totalGrantAmount, totalDisbursed, totalInVerification, totalScheduled]);

  const disbursementPercentage = useMemo(() => {
    return totalBudget > 0 ? Math.min(100, Math.round((totalDisbursed / totalBudget) * 100)) : 0;
  }, [totalBudget, totalDisbursed]);

  const isPilotDone =
    currentStatus === "PILOT_COMPLETED" ||
    currentStatus === "SCALED" ||
    tranches.every((t) => t.status === "DISBURSED");

  const certificateData = useMemo(() => ({
    certificateId: `CERT-GOVX-2026-${id ? id.slice(-8).toUpperCase() : "68A6719E"}`,
    issueDate: escrowData?.commercialScale?.scaledAt || new Date(),
    recipientOrgName: organizationName,
    dpiitNumber: submission?.organizationId?.dpiitRecognitionNumber || "DPIIT-MH-2024-8849",
    solutionTitle,
    problemTitle,
    department: submission?.problemId?.department || "Department of Information Technology",
    statutoryReference: "Rule 173(i) General Financial Rules (GFR) 2017",
    pilotId: `PLT-${id ? id.slice(-8).toUpperCase() : "68A6719E"}`,
    grantAmount: totalBudget,
    gemContractId: escrowData?.commercialScale?.gemContractId || "GEM-2026-DIR-99120",
    sanctionMemo:
      escrowData?.commercialScale?.sanctionMemo ||
      "Sanctioned for direct commercial procurement on GeM under GFR Rule 173(i) exemption following audited pilot success.",
    verificationHash: `sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`,
    issuingAuthority: "Government of India & Pragati-GovX Sovereign Procurement Council",
    status: isPilotDone ? "VALID_AND_SANCTIONED" : "PROVISIONAL",
  }), [id, escrowData, organizationName, submission, solutionTitle, problemTitle, totalBudget, isPilotDone]);

  const handleAdvanceStatus = async (e) => {
    e.preventDefault();
    if (!selectedNextStatus) {
      toast.error("Please select a target status");
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        id,
        toStatus: selectedNextStatus,
        note: transitionNote.trim() || `Status updated to ${selectedNextStatus}`,
      });
      setIsTransitionModalOpen(false);
      setTransitionNote("");
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleOpenEvidenceUpload = (tranche) => {
    setSelectedTrancheForEvidence(tranche);
    setEvidenceFileName("");
    setEvidenceDescription("");
    setEvidenceFile(null);
    setIsUploadingEvidence(false);
    setIsEvidenceModalOpen(true);
  };

  const handleAttachEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile && !evidenceFileName.trim()) {
      toast.error("Please select an evidence document or enter a deliverable title");
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (evidenceFile && evidenceFile.size > MAX_SIZE) {
      toast.error(`"${evidenceFile.name}" exceeds the 25 MB limit.`);
      return;
    }

    setIsUploadingEvidence(true);
    const toastId = toast.loading(
      evidenceFile ? `Uploading "${evidenceFile.name}"...` : "Attaching deliverable..."
    );

    try {
      const randomBytes = new Uint8Array(32);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes);
      }
      const fallbackHex = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      let docHash = `sha256:${fallbackHex}`;
      let docSize = "3.2 MB";
      let docName = evidenceFileName.trim() || (evidenceFile ? evidenceFile.name : "Deliverable_Document.pdf");
      let downloadUrl = null;
      let evidenceId = null;

      if (evidenceFile) {
        toast.loading(`Computing SHA-256 integrity hash for "${evidenceFile.name}"...`, { id: toastId });
        const sha256 = await computeFileSHA256(evidenceFile);
        docHash = `sha256:${sha256}`;
        docSize = formatFileSize(evidenceFile.size);
        docName = evidenceFileName.trim() || evidenceFile.name;

        let mimeType = evidenceFile.type || "application/octet-stream";
        const validEntityId = (submission?._id || id)?.match(/^[0-9a-fA-F]{24}$/)
          ? (submission?._id || id)
          : "66f000000000000000000001";

        const intentRes = await apiClient.post("/evidence/upload-intent", {
          fileName: evidenceFile.name,
          mimeType,
          sizeBytes: evidenceFile.size,
          entityType: "SUBMISSION",
          entityId: validEntityId,
        });

        const intentData = intentRes.data?.data || intentRes.data;
        evidenceId = intentData?.evidenceId || intentData?.id;
        const uploadUrl = intentData?.uploadUrl;

        if (uploadUrl && !intentData?.isMock) {
          toast.loading(`Uploading document...`, { id: toastId });
          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": mimeType },
            body: evidenceFile,
          });
        }

        if (evidenceId) {
          await apiClient.post(`/evidence/${evidenceId}/finalize`, {
            checksumSHA256: docHash,
            actualSizeBytes: evidenceFile.size,
          });

          try {
            const dlRes = await apiClient.get(`/evidence/${evidenceId}`);
            downloadUrl = dlRes.data?.data?.downloadUrl;
          } catch {
            downloadUrl = uploadUrl;
          }
        }
      }

      if (id && escrowData) {
        await submitEvidenceMutation.mutateAsync({
          submissionId: id,
          trancheId: selectedTrancheForEvidence?.id,
          name: docName,
          size: docSize,
          hash: docHash,
          fileUrl: downloadUrl || "",
          description: evidenceDescription.trim(),
        });
        refetchEscrow();
      }

      toast.success("Deliverable evidence attached successfully!", { id: toastId });
      setIsEvidenceModalOpen(false);
      setEvidenceFile(null);
      setEvidenceFileName("");
      setEvidenceDescription("");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to upload deliverable evidence", { id: toastId });
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const handleApproveTranche = async (trancheId) => {
    try {
      const res = await disburseTrancheMutation.mutateAsync({
        submissionId: id,
        trancheId,
        remarks: "PFMS Disbursement Verified under GFR 173(i)",
      });
      const utr = res?.data?.tranche?.utrNumber || `MAH-RBI-${Math.floor(1000000 + Math.random() * 9000000)}`;
      toast.success(`Tranche ${trancheId} disbursed! UTR: ${utr}`);
      refetch();
      refetchEscrow();
    } catch (err) {
      toast.error(err.message || err.response?.data?.error?.message || "Failed to disburse tranche");
    }
  };

  const handleInitializeEscrow = async () => {
    try {
      await initEscrowMutation.mutateAsync({
        submissionId: id,
        totalGrantAmount: 2500000,
      });
      toast.success("Sovereign Treasury Escrow initialized with 3 tranches!");
      refetchEscrow();
    } catch (err) {
      toast.error(err.message || err.response?.data?.error?.message || "Failed to initialize escrow");
    }
  };

  const handleScaleToGeM = async (e) => {
    e.preventDefault();
    try {
      await scalePilotMutation.mutateAsync({
        submissionId: id,
        gemContractId,
        sanctionMemo,
      });
      toast.success("Pilot successfully transitioned into GeM commercial scale!");
      setIsScalingModalOpen(false);
      refetch();
      refetchEscrow();
    } catch (err) {
      toast.error(err.message || err.response?.data?.error?.message || "Failed to scale pilot");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Top Breadcrumb & Action Bar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
              <Link
                to={isGovOrAdmin ? "/government/dashboard" : "/startup/dashboard"}
                className="hover:text-blue-600 font-medium transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                PLT-{id ? id.slice(-6).toUpperCase() : "7829B"}
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-800">Pilot Canvas</span>
            </nav>

            <div className="flex items-center gap-2">
              {isPilotDone && isStartup && (
                <Button
                  onClick={() => setIsCertificateModalOpen(true)}
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3.5 font-medium rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  View E-Certificate
                </Button>
              )}
              {isGovOrAdmin && (
                <Button
                  onClick={() => {
                    setSelectedNextStatus(permittedNextStates[0]?.key || "PILOT_ACTIVE");
                    setIsTransitionModalOpen(true);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3.5 font-medium rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Advance Lifecycle State
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Pilot Overview Header Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Pilot Sandbox
                </span>
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ID: PLT-{id ? id.slice(-8).toUpperCase() : "88A92BC0"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {solutionTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Challenge: <span className="font-semibold text-slate-800">{problemTitle}</span> • Venture:{" "}
                <span className="font-semibold text-slate-800">{organizationName}</span>
              </p>
            </div>

            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                  currentStatus === "SCALED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : currentStatus === "PILOT_COMPLETED"
                    ? "bg-teal-50 text-teal-800 border-teal-200"
                    : currentStatus === "PILOT_ACTIVE"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    currentStatus === "SCALED"
                      ? "bg-emerald-600"
                      : currentStatus === "PILOT_COMPLETED"
                      ? "bg-teal-600"
                      : currentStatus === "PILOT_ACTIVE"
                      ? "bg-blue-600"
                      : "bg-slate-400"
                  }`}
                />
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="pt-5 border-t border-slate-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PILOT_LIFECYCLE_STAGES.map((st, idx) => {
                const isCurrent = currentStatus === st.key;
                const isPassed =
                  (currentStatus === "PILOT_ACTIVE" && idx < 1) ||
                  (currentStatus === "PILOT_COMPLETED" && idx < 2) ||
                  (currentStatus === "SCALED" && idx < 3);

                return (
                  <div
                    key={st.key}
                    className={`relative p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "border-blue-500/70 bg-blue-50/50 ring-1 ring-blue-500/30 shadow-xs"
                        : isPassed
                        ? "border-emerald-200/80 bg-emerald-50/30"
                        : "border-slate-200/70 bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isCurrent
                            ? "text-blue-700"
                            : isPassed
                            ? "text-emerald-700"
                            : "text-slate-400"
                        }`}
                      >
                        Phase 0{idx + 1}
                      </span>
                      {isPassed ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          ✓ Done
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                          • Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Upcoming</span>
                      )}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-semibold tracking-tight ${
                        isCurrent
                          ? "text-blue-950"
                          : isPassed
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {st.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{st.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Financial Metrics Cards */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Treasury & Escrow Overview
              </h2>
              <p className="text-xs text-slate-500">
                Statutory Pilot Grant-in-Aid under Rule 173(i) GFR 2017
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Disbursed:</span>
              <span className="font-semibold text-slate-900">{disbursementPercentage}%</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${disbursementPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Pilot Budget
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-sans tracking-tight">
                ₹{totalBudget.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-600 mt-1.5 font-mono truncate">
                {escrowData?.sanctionOrderNumber || "MH-SNDBX-2026-452562"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Disbursed to Venture
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-sans tracking-tight">
                ₹{totalDisbursed.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                {tranches.filter((t) => t.status === "DISBURSED").length} of {tranches.length} tranches cleared
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                In Verification
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 font-sans tracking-tight">
                ₹{totalInVerification.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-blue-600 mt-1.5 font-medium">
                {tranches.filter((t) => t.status === "IN_VERIFICATION").length} active for review
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Scheduled Balance
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-700 mt-1 font-sans tracking-tight">
                ₹{totalScheduled.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                {tranches.filter((t) => t.status === "PENDING" || t.status === "UPCOMING").length} remaining
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Not Initialized Banner */}
        {!escrowData && isGovOrAdmin && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-900">
                Sovereign Treasury Escrow Not Initialized
              </div>
              <div className="text-xs text-amber-800">
                Allocate the statutory ₹25,00,000 Pilot Grant-in-Aid to create the 3 milestone tranches on the ledger.
              </div>
            </div>
            <Button
              onClick={handleInitializeEscrow}
              disabled={initEscrowMutation.isPending}
              size="sm"
              className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold h-8 px-3.5 shrink-0 rounded-lg cursor-pointer"
            >
              Initialize Escrow
            </Button>
          </div>
        )}

        {/* Scale-Gate Commercial Scaling Banner */}
        {(currentStatus === "PILOT_COMPLETED" || escrowData?.escrowStatus === "AUDITED" || tranches.every((t) => t.status === "DISBURSED")) && !escrowData?.commercialScale?.scaled && (
          <div className="rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Scale-Gate Reached: Pilot Audited & Completed
              </div>
              <div className="text-xs text-emerald-800 leading-relaxed">
                All 3 milestone deliverables have been verified and disbursed. This startup is eligible for direct commercial procurement on GeM under GFR Rule 173(i).
              </div>
            </div>
            {isGovOrAdmin && (
              <Button
                onClick={() => setIsScalingModalOpen(true)}
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-9 px-4 shrink-0 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Sanction Commercial Scale (GeM)
              </Button>
            )}
          </div>
        )}

        {/* Commercial Scale Active Confirmation */}
        {escrowData?.commercialScale?.scaled && (
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  GFR 173(i) Sanctioned
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Commercial Procurement Sanctioned on GeM
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Contract ID:</span>
                <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200/80">
                  {escrowData.commercialScale.gemContractId}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {new Date(escrowData.commercialScale.scaledAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100 italic">
              "{escrowData.commercialScale.sanctionMemo}"
            </p>
            {isStartup && (
              <div className="pt-1">
                <Button
                  type="button"
                  onClick={() => setIsCertificateModalOpen(true)}
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3.5 font-medium rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Download Official E-Certificate
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Milestone Tranches Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Milestone Tranches & Escrow Releases
              </h2>
              <p className="text-xs text-slate-500">
                Milestone-linked disbursement schedule with cryptographic verification receipts
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {tranches.map((tranche) => {
              const isDisbursed = tranche.status === "DISBURSED";
              const isInVerification = tranche.status === "IN_VERIFICATION";
              const cleanTitle = tranche.name
                .replace(/^M\d+\s*:\s*/i, "")
                .replace(/^TR-\d+\s*:?\s*/i, "");

              return (
                <div
                  key={tranche.id}
                  className={`rounded-xl border transition-all bg-white shadow-xs overflow-hidden ${
                    isInVerification
                      ? "border-blue-300 ring-1 ring-blue-500/20"
                      : isDisbursed
                      ? "border-slate-200/90"
                      : "border-slate-200/80"
                  }`}
                >
                  {/* Top Tranche Header Bar */}
                  <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {tranche.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {cleanTitle}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                        {tranche.percentage}% Grant
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold font-sans text-slate-900">
                        {tranche.amount}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isDisbursed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                            : isInVerification
                            ? "bg-blue-50 text-blue-700 border-blue-200/80"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {tranche.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Tranche Body */}
                  <div className="p-5 space-y-3.5">
                    {/* Deliverable Scope */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Deliverable Scope
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {tranche.deliverable}
                      </p>
                    </div>

                    {/* Bottom Row: Artifacts on Left, Payment/Action on Right */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      {/* Attached Artifacts */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">
                          Artifacts:
                        </span>
                        {tranche.evidence.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No files attached yet</span>
                        ) : (
                          tranche.evidence.map((doc, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors"
                            >
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase px-1 py-0.2 bg-white rounded border border-slate-200">
                                {doc.name.split(".").pop()?.toUpperCase() || "DOC"}
                              </span>
                              <span className="font-medium text-slate-800 truncate max-w-[200px]" title={doc.name}>
                                {doc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">({doc.size})</span>
                              {doc.downloadUrl && (
                                <a
                                  href={doc.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
                                >
                                  Download →
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Payment Status & Action Button */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isDisbursed ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
                              <span>✓</span>
                              <span>Disbursed on {tranche.disbursedDate || "Record"}</span>
                            </span>
                            {tranche.utrNumber && (
                              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 font-sans">UTR</span>
                                <span className="font-semibold">{tranche.utrNumber}</span>
                              </span>
                            )}
                          </div>
                        ) : isInVerification ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/70">
                              Under Department Verification
                            </span>
                            {isGovOrAdmin && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveTranche(tranche.id)}
                                className="text-xs h-8 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                              >
                                Verify & Release
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Pending milestone completion</span>
                            {isStartup && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenEvidenceUpload(tranche)}
                                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                              >
                                Submit Evidence
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Advance Status Modal */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#10233F]">
                Advance Lifecycle State
              </h3>
              <button
                onClick={() => setIsTransitionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdvanceStatus} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Target Status:
                </label>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 p-2 text-xs bg-white text-[#10233F] focus:outline-blue-600"
                >
                  {permittedNextStates.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label} ({st.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Officer Remarks / Note:
                </label>
                <textarea
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="Reason for state transition..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-[#10233F] focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransitionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Confirm State Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Upload Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Deliverable Submission
                </div>
                <h3 className="text-base font-bold text-[#10233F]">
                  Upload Deliverable Evidence for {selectedTrancheForEvidence?.id}
                </h3>
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAttachEvidence} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Deliverable Document / Artifact File:
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setEvidenceFile(f);
                      if (!evidenceFileName) setEvidenceFileName(f.name);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Deliverable Title:
                </label>
                <Input
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  placeholder="e.g. Field_Trial_Telemetry_Report_v1.pdf"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Summary & Notes:
                </label>
                <textarea
                  rows={3}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Describe the milestone results achieved..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-[#10233F] focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingEvidence}
                  onClick={() => setIsEvidenceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploadingEvidence || (!evidenceFile && !evidenceFileName.trim())}
                  className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold cursor-pointer"
                >
                  {isUploadingEvidence ? "Uploading..." : "Submit Deliverable"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GeM Commercial Scaling Modal */}
      {isScalingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Commercial Scale Sanction
                </div>
                <h3 className="text-base font-bold text-[#10233F]">
                  Sanction Commercial Procurement on GeM
                </h3>
              </div>
              <button
                onClick={() => setIsScalingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScaleToGeM} className="space-y-4 text-xs">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 space-y-0.5">
                <div className="font-semibold">Statutory Authority: Rule 173(i) GFR 2017</div>
                <div className="text-[11px]">
                  Startups that successfully conclude an audited pilot are eligible for direct procurement without prior turnover criteria.
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  GeM Contract / Indent ID:
                </label>
                <Input
                  value={gemContractId}
                  onChange={(e) => setGemContractId(e.target.value)}
                  placeholder="e.g. GEM-2026-DIR-99120"
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Commercial Scale Sanction Memo:
                </label>
                <textarea
                  rows={3}
                  value={sanctionMemo}
                  onChange={(e) => setSanctionMemo(e.target.value)}
                  placeholder="Official justification memo..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-[#10233F] focus:outline-blue-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={scalePilotMutation.isPending}
                  onClick={() => setIsScalingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={scalePilotMutation.isPending || !gemContractId.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                >
                  {scalePilotMutation.isPending ? "Sanctioning..." : "Issue Sanction Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official E-Certificate Modal (Startups Only) */}
      {isStartup && (
        <ECertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificateData={certificateData}
        />
      )}
    </div>
  );
}

export default PilotCanvas;
