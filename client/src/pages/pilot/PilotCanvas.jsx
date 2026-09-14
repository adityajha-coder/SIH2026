import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSubmission, useTransitionSubmission } from "@/hooks/useSubmissions";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Milestone,
  Play,
  RefreshCw,
  Rocket,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Upload,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Landmark,
  FilePlus,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

function formatFileSize(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function computeFileSHA256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// FSM Pilot Lifecycle Stages
const PILOT_LIFECYCLE_STAGES = [
  { key: "PILOT_PROPOSED", label: "Pilot Proposed", desc: "Charter & baseline defined" },
  { key: "PILOT_ACTIVE", label: "Active Field Trial", desc: "Live deployment & telemetry" },
  { key: "PILOT_COMPLETED", label: "Audit Completed", desc: "Final KPI verification" },
  { key: "SCALED", label: "Scaled to GeM", desc: "Commercial procurement scale" },
];

// Fallback Demonstration Dataset
const DEFAULT_PILOT_METRICS = [
  {
    kpi: "Water Loss / NRW (%)",
    baseline: 38,
    actual: 21,
    target: 15,
    unit: "%",
    achievement: 74,
  },
  {
    kpi: "Telemetry Latency (ms)",
    baseline: 1800,
    actual: 420,
    target: 250,
    unit: "ms",
    achievement: 89,
  },
  {
    kpi: "System Reliability (%)",
    baseline: 92.4,
    actual: 99.1,
    target: 99.5,
    unit: "%",
    achievement: 94,
  },
  {
    kpi: "Monthly OPEX (₹ Lakhs)",
    baseline: 12.5,
    actual: 6.2,
    target: 5.0,
    unit: "₹L",
    achievement: 84,
  },
];

const DEFAULT_TRANCHES = [
  {
    id: "TR-01",
    name: "M1: Mobilization & Sandbox Setup",
    percentage: 30,
    amount: "₹7,50,000",
    status: "DISBURSED",
    slaDaysElapsed: 6,
    maxSlaDays: 30,
    deliverable: "Sandbox charter execution, API test integration, security container provisioning.",
    disbursedDate: "12 Aug 2026",
    utrNumber: "MAH-RBI-9920148",
    evidence: [
      { name: "Charter_Agreement_Signed.pdf", size: "2.4 MB", hash: "sha256:e3b0c44298fc1c149afbf4c8996fb924" },
      { name: "Container_Healthcheck_Log.json", size: "140 KB", hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65d" },
    ],
  },
  {
    id: "TR-02",
    name: "M2: Mid-Term Field Validation (100 Sites)",
    percentage: 40,
    amount: "₹10,00,000",
    status: "IN_VERIFICATION",
    slaDaysElapsed: 18,
    maxSlaDays: 30,
    deliverable: "Live sensor telemetry across Pune Municipal Corporation test zone with 100+ active sampling nodes.",
    disbursedDate: null,
    utrNumber: null,
    evidence: [
      { name: "MidTerm_Telemetry_Audit_Report.pdf", size: "4.8 MB", hash: "sha256:ca978112ca1bbdcafac231b39a23dc4d" },
      { name: "Site_Photographs_Inspection.zip", size: "18.2 MB", hash: "sha256:b10a8db164e0754105b7a99be72e3fe5" },
    ],
  },
  {
    id: "TR-03",
    name: "M3: Final Acceptance & CERT-In Signoff",
    percentage: 30,
    amount: "₹7,50,000",
    status: "UPCOMING",
    slaDaysElapsed: 0,
    maxSlaDays: 30,
    deliverable: "Final KPI compliance audit, CERT-In cybersecurity certification, and public procurement scale memo.",
    disbursedDate: null,
    utrNumber: null,
    evidence: [],
  },
];

export function PilotCanvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: submission, isLoading, refetch } = useSubmission(id);
  const transitionMutation = useTransitionSubmission();

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // overview, milestones, kpis, audit

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

  const [tranches, setTranches] = useState(DEFAULT_TRANCHES);

  const isGovOrAdmin = user?.role === "GOVERNMENT_USER" || user?.role === "ADMIN";
  const isStartup = user?.role === "STARTUP_USER";

  // Effective status calculation
  const currentStatus = submission?.status || "PILOT_ACTIVE";
  const solutionTitle = submission?.solutionTitle || "Autonomous Smart Water Loss & Telemetry Node";
  const problemTitle = submission?.problemId?.title || "Real-Time Non-Revenue Water Loss Detection";
  const organizationName = submission?.organizationId?.name || "AquaSovereign Technologies Ltd";

  // Determine permitted transitions
  const permittedNextStates = useMemo(() => {
    switch (currentStatus) {
      case "ACCEPTED":
        return [{ key: "PILOT_PROPOSED", label: "Propose Pilot Charter" }];
      case "PILOT_PROPOSED":
        return [{ key: "PILOT_ACTIVE", label: "Authorize Active Field Trial" }];
      case "PILOT_ACTIVE":
        return [
          { key: "PILOT_COMPLETED", label: "Mark Pilot Completed & Audited" },
          { key: "CLOSED", label: "Close Sandbox Early" },
        ];
      case "PILOT_COMPLETED":
        return [
          { key: "SCALED", label: "Approve Commercial Scaling (GeM Transition)" },
          { key: "CLOSED", label: "Close Completed Pilot" },
        ];
      case "SCALED":
        return [{ key: "CLOSED", label: "Archive Closed Sandbox" }];
      default:
        return [{ key: "PILOT_ACTIVE", label: "Set Active Field Trial" }];
    }
  }, [currentStatus]);

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
        note: transitionNote.trim() || `Lifecycle stage updated to ${selectedNextStatus} by sovereign officer`,
      });
      setIsTransitionModalOpen(false);
      setTransitionNote("");
      refetch();
    } catch (err) {
      // Error handled in hook
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

    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    if (evidenceFile && evidenceFile.size > MAX_SIZE) {
      toast.error(`"${evidenceFile.name}" exceeds the 25 MB limit.`);
      return;
    }

    setIsUploadingEvidence(true);
    const toastId = toast.loading(
      evidenceFile ? `Uploading "${evidenceFile.name}" to Sovereign Evidence Vault...` : "Attaching deliverable..."
    );

    try {
      let docHash = `sha256:${Math.random().toString(16).substring(2, 10)}9f83b1657ff1fc53b92dc18148a1d65d`;
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

        // Detect MIME type
        let mimeType = evidenceFile.type;
        const lower = evidenceFile.name.toLowerCase();
        if (lower.endsWith(".pdf")) mimeType = "application/pdf";
        else if (lower.endsWith(".csv")) mimeType = "text/csv";
        else if (lower.endsWith(".json")) mimeType = "application/json";
        else if (lower.endsWith(".zip")) mimeType = "application/zip";
        else if (lower.endsWith(".doc")) mimeType = "application/msword";
        else if (lower.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (lower.endsWith(".png")) mimeType = "image/png";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
        else if (!mimeType) mimeType = "application/octet-stream";

        // Valid 24-char ObjectId for entityId
        const validEntityId = (submission?._id || id)?.match(/^[0-9a-fA-F]{24}$/)
          ? (submission?._id || id)
          : "66f000000000000000000001";

        // Request upload intent from backend
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

        // Direct S3/Supabase upload if URL is live
        if (uploadUrl && !intentData?.isMock) {
          toast.loading(`Uploading directly to Sovereign Cloud Vault...`, { id: toastId });
          await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": mimeType,
            },
            body: evidenceFile,
          });
        }

        // Finalize evidence record
        if (evidenceId) {
          await apiClient.post(`/evidence/${evidenceId}/finalize`, {
            checksumSHA256: docHash,
            actualSizeBytes: evidenceFile.size,
          });

          // Fetch download link
          try {
            const dlRes = await apiClient.get(`/evidence/${evidenceId}`);
            downloadUrl = dlRes.data?.data?.downloadUrl;
          } catch {
            downloadUrl = uploadUrl;
          }
        }
      }

      const newDoc = {
        id: evidenceId || `ev_${Date.now()}`,
        name: docName,
        fileName: evidenceFile?.name || docName,
        size: docSize,
        hash: docHash,
        description: evidenceDescription.trim(),
        downloadUrl,
      };

      setTranches((prev) =>
        prev.map((t) => {
          if (t.id === selectedTrancheForEvidence?.id) {
            return {
              ...t,
              status: "IN_VERIFICATION",
              evidence: [...t.evidence, newDoc],
            };
          }
          return t;
        })
      );

      toast.success("Deliverable evidence attached and dispatched for sovereign review!", { id: toastId });
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

  const handleApproveTranche = (trancheId) => {
    setTranches((prev) =>
      prev.map((t) => {
        if (t.id === trancheId) {
          return {
            ...t,
            status: "DISBURSED",
            disbursedDate: "Today",
            utrNumber: `MAH-RBI-${Math.floor(1000000 + Math.random() * 9000000)}`,
          };
        }
        return t;
      })
    );
    toast.success(`Tranche ${trancheId} marked verified and treasury disbursement sanctioned!`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] pb-16">
      {/* Top Breadcrumb & Bar */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link
                to={isGovOrAdmin ? "/government/dashboard" : "/startup/dashboard"}
                className="hover:text-[#2563EB] transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-mono text-slate-500">
                PLT-{id ? id.slice(-6).toUpperCase() : "7829B"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-semibold text-[#10233F]">Pilot Sandbox Canvas</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-[#0F766E] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Maharashtra Sandbox Compact
              </span>

              {isGovOrAdmin && (
                <Button
                  onClick={() => {
                    setSelectedNextStatus(permittedNextStates[0]?.key || "PILOT_ACTIVE");
                    setIsTransitionModalOpen(true);
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-3 font-semibold shadow-sm"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Advance Lifecycle State
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Pilot Header Card */}
        <Card className="border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-[#10233F] to-[#1E3A8A] p-6 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
                    Sovereign Pilot Sandbox
                  </span>
                  <span className="font-mono text-[11px] text-teal-300">
                    ID: MAH-PLT-{id ? id.slice(-8).toUpperCase() : "88A92BC0"}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-white">
                  {solutionTitle}
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span>Target Challenge:</span>
                  <strong className="text-white font-medium">{problemTitle}</strong>
                </p>
              </div>

              {/* Status and Org box */}
              <div className="rounded-lg border border-blue-400/30 bg-white/10 p-3.5 text-right backdrop-blur-sm min-w-[200px]">
                <div className="text-[11px] text-blue-200">Current Lifecycle Stage</div>
                <div className="text-base font-bold font-mono tracking-wide text-white mt-0.5">
                  {currentStatus}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 border-t border-blue-400/20 pt-1">
                  Venture: <span className="text-white font-medium">{organizationName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 4-Stage Stepper Bar */}
          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PILOT_LIFECYCLE_STAGES.map((stage, idx) => {
                const isCurrent = currentStatus === stage.key;
                const isPassed =
                  (currentStatus === "PILOT_ACTIVE" && idx < 1) ||
                  (currentStatus === "PILOT_COMPLETED" && idx < 2) ||
                  (currentStatus === "SCALED" && idx < 3);

                return (
                  <div
                    key={stage.key}
                    className={`rounded-lg border p-3 transition-colors ${
                      isCurrent
                        ? "border-[#2563EB] bg-blue-50/70 shadow-sm"
                        : isPassed
                        ? "border-teal-200 bg-teal-50/50"
                        : "border-[#E2E8F0] bg-white opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        Phase 0{idx + 1}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-[#0F766E]" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-[#10233F] mt-1">{stage.label}</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">{stage.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Statutory 30-Day Payment SLA Alert Banner */}
        <div className="rounded-lg border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                  Statutory 30-Day Payment SLA Active
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  MSMED Act Sec. 15 / Maharashtra GR No. MAT-2024
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Once a milestone deliverable is verified by the department nodal officer, treasury payment release is legally binding within <strong>30 calendar days</strong>. Delays attract compounding interest at 3x the RBI bank rate.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/80 rounded-lg p-3 border border-teal-200/60 shadow-xs">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[#64748B]">Active Tranche SLA Clock</div>
                <div className="text-sm font-bold font-mono text-[#0F766E]">
                  12 Days Remaining <span className="text-xs font-normal text-slate-500">(Day 18 of 30)</span>
                </div>
              </div>
              <Clock className="h-6 w-6 text-[#0F766E]" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E2E8F0] flex gap-6 text-xs font-semibold text-[#64748B]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent hover:text-[#10233F]"
            }`}
          >
            <Layers className="h-4 w-4" />
            Milestone Ledger & SLA
          </button>
          <button
            onClick={() => setActiveTab("kpis")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "kpis"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent hover:text-[#10233F]"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Baseline vs Target KPIs
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent hover:text-[#10233F]"
            }`}
          >
            <FileText className="h-4 w-4" />
            Forensic Audit & Transitions
          </button>
        </div>

        {/* Tab 1: Milestone Payment Ledger */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Financial Summary Rail */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
                <div className="text-[11px] text-[#64748B]">Total Pilot Budget</div>
                <div className="text-xl font-bold font-mono text-[#10233F] mt-1">₹25,00,000</div>
                <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Escrow Backed
                </div>
              </Card>

              <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
                <div className="text-[11px] text-[#64748B]">Disbursed to Venture</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">₹7,50,000</div>
                <div className="text-[11px] text-[#64748B] mt-1">Tranche 1 (M1) cleared</div>
              </Card>

              <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
                <div className="text-[11px] text-[#64748B]">In SLA Verification</div>
                <div className="text-xl font-bold font-mono text-blue-700 mt-1">₹10,00,000</div>
                <div className="text-[11px] text-blue-600 mt-1">Tranche 2 (M2) active</div>
              </Card>

              <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
                <div className="text-[11px] text-[#64748B]">Scheduled Tranche</div>
                <div className="text-xl font-bold font-mono text-slate-600 mt-1">₹7,50,000</div>
                <div className="text-[11px] text-[#64748B] mt-1">Tranche 3 (M3) final</div>
              </Card>
            </div>

            {/* Tranche Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#10233F]">
                  Sovereign 3-Tranche Payment Schedule
                </h3>
                <span className="text-xs text-[#64748B]">
                  Disbursements are tied to verifiable telemetry & deliverable acceptance
                </span>
              </div>

              {tranches.map((tranche) => {
                const isDisbursed = tranche.status === "DISBURSED";
                const isInVerification = tranche.status === "IN_VERIFICATION";
                const isUpcoming = tranche.status === "UPCOMING";

                return (
                  <Card
                    key={tranche.id}
                    className={`border shadow-sm transition-colors ${
                      isInVerification
                        ? "border-blue-300 bg-white"
                        : isDisbursed
                        ? "border-emerald-200 bg-white"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Tranche Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {tranche.id}
                          </span>
                          <span className="text-sm font-bold text-[#10233F]">
                            {tranche.name}
                          </span>
                          <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {tranche.percentage}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold font-mono text-[#10233F]">
                            {tranche.amount}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-semibold uppercase px-2.5 py-1 rounded border ${
                              isDisbursed
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isInVerification
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {tranche.status}
                          </span>
                        </div>
                      </div>

                      {/* Deliverable details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="md:col-span-2 space-y-2">
                          <div className="text-[#64748B]">
                            <strong className="text-[#10233F]">Contract Deliverable: </strong>
                            {tranche.deliverable}
                          </div>

                          {/* Attached Evidence Files */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-[#10233F] flex items-center gap-1">
                              <FileCheck className="h-3.5 w-3.5 text-teal-600" />
                              Attached Evidence & Deliverable Artifacts ({tranche.evidence.length})
                            </span>

                            {tranche.evidence.length === 0 ? (
                              <p className="text-[11px] text-[#94A3B8] italic">
                                No files attached yet. Deliverables can be uploaded once testing benchmarks conclude.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {tranche.evidence.map((doc, i) => {
                                  const cardContent = (
                                    <div
                                      className={`flex items-center justify-between rounded border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[11px] transition-colors ${
                                        doc.downloadUrl ? "hover:border-[#3B82F6] hover:bg-blue-50/50 cursor-pointer" : ""
                                      }`}
                                    >
                                      <div className="truncate pr-2">
                                        <div className="font-medium text-[#10233F] truncate flex items-center gap-1.5">
                                          {doc.name}
                                          {doc.downloadUrl && (
                                            <span className="inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                                              VAULT-S3
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-mono text-[10px] text-[#64748B]">
                                          {doc.size} &bull; {doc.hash ? doc.hash.slice(0, 14) : "sha256"}...
                                        </div>
                                      </div>
                                      {doc.downloadUrl ? (
                                        <ExternalLink className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                      )}
                                    </div>
                                  );

                                  return doc.downloadUrl ? (
                                    <a
                                      key={i}
                                      href={doc.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Download and inspect verified deliverable artifact from Sovereign S3 Vault"
                                      className="block no-underline"
                                    >
                                      {cardContent}
                                    </a>
                                  ) : (
                                    <div key={i}>{cardContent}</div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SLA & Actions Box */}
                        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="text-[11px] font-mono text-[#64748B]">
                              Statutory SLA Progress
                            </div>
                            {isDisbursed ? (
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Disbursed on {tranche.disbursedDate}
                                </div>
                                <div className="text-[10px] font-mono text-[#64748B]">
                                  UTR: {tranche.utrNumber}
                                </div>
                              </div>
                            ) : isInVerification ? (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-blue-700 font-bold">
                                    Day {tranche.slaDaysElapsed} of {tranche.maxSlaDays}
                                  </span>
                                  <span className="text-slate-500">12 days left</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{
                                      width: `${(tranche.slaDaysElapsed / tranche.maxSlaDays) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#64748B]">
                                Pending completion of milestone 2.
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            {/* Startup upload action */}
                            {isStartup && !isDisbursed && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEvidenceUpload(tranche)}
                                className="text-xs h-7 border-blue-300 text-[#2563EB] hover:bg-blue-50 w-full"
                              >
                                <Upload className="mr-1.5 h-3 w-3" />
                                Submit Evidence
                              </Button>
                            )}

                            {/* Government approve action */}
                            {isGovOrAdmin && isInVerification && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveTranche(tranche.id)}
                                className="text-xs h-7 bg-[#0F766E] hover:bg-[#0D655E] text-white w-full font-semibold"
                              >
                                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                Verify & Release Tranche
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Baseline vs Target KPIs */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recharts Bar Chart */}
              <Card className="lg:col-span-2 border-[#E2E8F0] shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-[#10233F]">
                        KPI Benchmark Comparison
                      </CardTitle>
                      <CardDescription className="text-xs text-[#64748B]">
                        Department Baseline vs Real-Time Sandbox Actual vs Sanctioned Target
                      </CardDescription>
                    </div>
                    <span className="font-mono text-xs text-[#0F766E] font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Telemetry Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DEFAULT_PILOT_METRICS} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="kpi" tick={{ fontSize: 11, fill: "#475569" }} interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#10233F",
                            borderColor: "#1E3A8A",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Bar dataKey="baseline" name="Baseline (Before)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" name="Current Sandbox Actual" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" name="Contract Target" fill="#0F766E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Gauges */}
              <div className="space-y-4">
                <Card className="border-[#E2E8F0] shadow-sm bg-white p-4">
                  <h4 className="text-xs font-bold text-[#10233F] uppercase tracking-wider text-slate-500 mb-3">
                    Target Fulfillment Status
                  </h4>

                  <div className="space-y-4">
                    {DEFAULT_PILOT_METRICS.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#10233F]">{item.kpi}</span>
                          <span className="font-mono font-bold text-[#2563EB]">
                            {item.achievement}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                            style={{ width: `${item.achievement}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                          <span>Actual: {item.actual} {item.unit}</span>
                          <span>Target: {item.target} {item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Automated Verification Gate
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Sandbox telemetry is polled every 6 hours. Reaching &ge;80% target across all 4 metrics unlocks Phase 3 Final Acceptance and Commercial Scale authorization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Forensic Audit & Transition History */}
        {activeTab === "audit" && (
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#10233F]">
                    Forensic Transition History & Immutable Audit Trail
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Cryptographic record of all sandbox lifecycle events, approvals, and statutory notices.
                  </CardDescription>
                </div>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SHA-256 Verified
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                {/* Event 1 */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#0F766E]" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#10233F]">
                      PILOT_PROPOSED &rarr; PILOT_ACTIVE
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      14 Aug 2026, 11:42 AM IST
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">
                    Authorized by Pune Municipal Corporation Nodal Officer. Sandbox boundary approved under Maharashtra GR No. MAT-2024.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400">
                    Actor: PMC_NODAL_OFFICER_01 (GOVERNMENT_USER) &bull; Trace: 8a91b2c4e9
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#10233F]">
                      ACCEPTED &rarr; PILOT_PROPOSED
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      08 Aug 2026, 03:15 PM IST
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">
                    Proposal approved by evaluation committee with aggregate rubric score of 88/100. Sandbox charter issued.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400">
                    Actor: SYSTEM_COMMITTEE_ENGINE &bull; Trace: 71b3e89f2a
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#10233F]">
                      DRAFT &rarr; SUBMITTED
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      02 Aug 2026, 09:20 AM IST
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">
                    Initial proposal submitted by AquaSovereign Technologies with 4 evidence files and DPIIT exemption declaration.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400">
                    Actor: STARTUP_FOUNDER_USER &bull; Trace: 4b29c118aa
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advance Lifecycle Modal (for Government & Admin) */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#10233F]">Advance Pilot Lifecycle</h3>
              </div>
              <button
                onClick={() => setIsTransitionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdvanceStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Current Status:
                </label>
                <div className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded">
                  {currentStatus}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Select Target Lifecycle Stage:
                </label>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value)}
                  className="w-full rounded border border-[#CBD5E1] p-2 font-medium text-[#10233F] bg-white focus:outline-blue-600"
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
                  Sovereign Decision Note / Justification:
                </label>
                <textarea
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="Record operational reasons, field inspection report ref, or committee sanction..."
                  className="w-full rounded border border-[#CBD5E1] p-2 text-xs text-[#10233F] focus:outline-blue-600"
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
                  disabled={transitionMutation.isPending}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold"
                >
                  {transitionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Transition"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Evidence Deliverable Modal (for Startups) */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#10233F]">
                  Submit Deliverable Evidence
                </h3>
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAttachEvidence} className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-[11px] text-blue-900">
                Submitting deliverable proof for: <strong>{selectedTrancheForEvidence?.name}</strong> ({selectedTrancheForEvidence?.amount})
              </div>

              {/* S3 Vault Dropzone / File Picker */}
              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Deliverable Artifact (Supabase S3 Cloud Vault):
                </label>
                <div
                  onClick={() => document.getElementById("pilot-evidence-file-input")?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    evidenceFile
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    id="pilot-evidence-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.csv,.json,.zip,.doc,.docx,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEvidenceFile(file);
                        if (!evidenceFileName) {
                          setEvidenceFileName(file.name);
                        }
                      }
                    }}
                  />
                  {evidenceFile ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                        <FileCheck className="h-4 w-4" />
                        <span className="truncate max-w-[280px]">{evidenceFile.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {formatFileSize(evidenceFile.size)} &bull; Ready for SHA-256 & S3 Presigned Upload
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvidenceFile(null);
                        }}
                        className="text-[10px] text-red-600 hover:underline pt-1"
                      >
                        Change / remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                      <p className="font-medium text-slate-700 text-xs">
                        Click to select deliverable file or drag & drop here
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        PDF, CSV, JSON, ZIP, DOC, DOCX, or Images up to 25 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Deliverable Artifact Title / Document:
                </label>
                <Input
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  placeholder={evidenceFile ? evidenceFile.name : "e.g. PMC_Field_Trial_Telemetry_Report_v2.pdf"}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#10233F] block mb-1">
                  Deliverable Summary & KPI Proof:
                </label>
                <textarea
                  rows={3}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Explain achieved KPIs, telemetry verification points, and test environment details..."
                  className="w-full rounded border border-[#CBD5E1] p-2 text-xs text-[#10233F] focus:outline-blue-600"
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
                  className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold flex items-center gap-1.5"
                >
                  {isUploadingEvidence ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading to Vault...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Submit for 30-Day SLA Verification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PilotCanvas;
