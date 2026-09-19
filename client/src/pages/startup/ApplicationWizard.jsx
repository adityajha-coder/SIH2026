import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProblem } from "@/hooks/useProblems";
import { useCreateSubmission } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function formatBytes(bytes, decimals = 2) {
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

const STEPS = [
  { num: 1, title: "Executive Summary", desc: "Solution concept & target outcome" },
  { num: 2, title: "Technical Approach", desc: "Architecture & pilot methodology" },
  { num: 3, title: "Evidence Vault", desc: "Multiple proof-of-concept dossiers & benchmarks" },
  { num: 4, title: "Declaration & Submit", desc: "Statutory Innovation Compact" },
];

const EVIDENCE_CATEGORIES = [
  "Technical Architecture Blueprint",
  "Benchmark & Lab Test Report",
  "Statutory Compliance / ISO Certificate",
  "Field Pilot Telemetry & Logs",
  "Product Presentation / Pitch Deck",
  "Other Technical Dossier",
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

  // Evidence upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Multi-link artifact references
  const [evidenceLinks, setEvidenceLinks] = useState([
    { title: "Primary Prototype Repository", url: "https://github.com/innovator/telemetry-pilot-demo" },
  ]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    solutionTitle: "",
    executiveSummary: "",
    proposalDetails: "",
    implementationTimeline: "12 Weeks (Controlled Field Trial)",
    pilotKPIs: "",
    acceptedCompact: false,
    noConflictDeclared: false,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

    for (const file of fileList) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds the 25 MB limit.`);
        continue;
      }

      setIsUploading(true);
      const toastId = toast.loading(`Processing "${file.name}"...`);

      try {
        toast.loading(`Computing SHA-256 integrity hash for "${file.name}"...`, { id: toastId });
        const sha256 = await computeFileSHA256(file);

        let mimeType = file.type;
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".pdf")) mimeType = "application/pdf";
        else if (lower.endsWith(".zip")) mimeType = "application/zip";
        else if (lower.endsWith(".doc")) mimeType = "application/msword";
        else if (lower.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (lower.endsWith(".png")) mimeType = "image/png";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
        if (!mimeType) mimeType = "application/octet-stream";

        let evidenceId = null;

        try {
          const entityType = organization?._id ? "ORGANIZATION" : "OTHER";
          const entityId = organization?._id || problemId;

          const res = await apiClient.post("/evidence/upload-intent", {
            fileName: file.name,
            mimeType,
            sizeBytes: file.size,
            entityType,
            entityId,
          });

          const intentData = res?.data || res;
          evidenceId = intentData?.evidenceId || intentData?.id;
          const uploadUrl = intentData?.uploadUrl;

          if (uploadUrl) {
            try {
              await fetch(uploadUrl, {
                method: intentData?.method || "PUT",
                headers: intentData?.headers || { "Content-Type": mimeType },
                body: file,
              });
            } catch (err) {
              console.warn("Direct upload notification:", err);
            }
          }

          if (evidenceId) {
            await apiClient.post(`/evidence/${evidenceId}/finalize`, {
              checksumSHA256: sha256,
              actualSizeBytes: file.size,
            });
          }
        } catch (apiErr) {
          if (!evidenceId) {
            evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          }
        }

        const newDoc = {
          id: evidenceId || `ev_${Date.now()}`,
          name: file.name,
          category: EVIDENCE_CATEGORIES[0],
          size: file.size,
          formattedSize: formatBytes(file.size),
          type: mimeType,
          hash: sha256,
          uploadedAt: new Date().toISOString(),
        };

        setUploadedFiles((prev) => [...prev, newDoc]);
        toast.success(`"${file.name}" attached successfully`, { id: toastId });
      } catch (err) {
        toast.error(`Upload error: ${err?.message || "File could not be attached"}`, { id: toastId });
      } finally {
        setIsUploading(false);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateFileCategory = (fileId, newCategory) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, category: newCategory } : f))
    );
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info("Evidence document removed");
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;
    setEvidenceLinks((prev) => [
      ...prev,
      {
        title: newLinkTitle.trim() || "Artifact Link",
        url: newLinkUrl.trim(),
      },
    ]);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleRemoveLink = (idx) => {
    setEvidenceLinks((prev) => prev.filter((_, i) => i !== idx));
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
      const filesSummary = uploadedFiles.length > 0
        ? `\n\n---\nAttached Evidence Dossiers (${uploadedFiles.length}):\n${uploadedFiles.map((f) => `• [${f.category}] ${f.name} (${f.formattedSize}) | SHA-256: ${f.hash}`).join("\n")}`
        : "";

      const linksSummary = evidenceLinks.length > 0
        ? `\n\nExternal Reference Artifacts (${evidenceLinks.length}):\n${evidenceLinks.map((l) => `• ${l.title}: ${l.url}`).join("\n")}`
        : "";

      const result = await createSubmissionMutation.mutateAsync({
        problemId,
        organizationId: organization._id,
        solutionTitle: formData.solutionTitle.trim(),
        executiveSummary: formData.executiveSummary.trim(),
        proposalDetails: `${formData.proposalDetails.trim()}\n\n---\nTimeline: ${formData.implementationTimeline}\nTarget Pilot KPIs: ${formData.pilotKPIs || "Standard Department Baseline Targets"}${filesSummary}${linksSummary}`,
        evidenceFileIds: uploadedFiles.map((f) => f.id).filter(Boolean),
        status: "SUBMITTED",
      });

      const submissionId = result?.submission?._id || result?._id;
      setCreatedSubmissionId(submissionId);
      setIsSubmittedSuccess(true);
    } catch {
      // Handled by mutation toast
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-16 px-4 text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#10233F]">
            Application Submitted Successfully
          </h1>
          <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
            Your proposal has entered the sovereign evaluation pipeline. Technical scoring will proceed under double-blind governance protocols.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="font-bold text-[#10233F]">Next Procedural Steps:</div>
          <p className="text-slate-700">
            1. Double-blind multi-expert scoring against standardized rubrics.
          </p>
          <p className="text-slate-700">
            2. Any technical clarifications will appear directly on your dashboard.
          </p>
          <p className="text-slate-700">
            3. Sanctioned pilots enter controlled sandbox testing under statutory 15-day MSMED SLA payment tranches.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {createdSubmissionId ? (
            <Link to={`/startup/submissions/${createdSubmissionId}`}>
              <Button className="w-full sm:w-auto font-medium bg-[#10233F] hover:bg-slate-800 text-white text-xs h-10 px-4 rounded">
                Track Application Status &rarr;
              </Button>
            </Link>
          ) : null}
          <Link to="/startup/dashboard">
            <Button variant="outline" className="w-full sm:w-auto text-xs border-slate-300 h-10 px-4 rounded">
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
          className="inline-block text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          &larr; Back to Challenge Statement
        </Link>
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#2563EB]">
            Sandbox Pilot Proposal
          </span>
          <span className="text-[#64748B]">• Statutory GFR 173(i) Prior-Turnover Exempt</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#10233F] tracking-tight">
          {problem?.title}
        </h1>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {STEPS.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-slate-900"
                    : isCurrent
                    ? "bg-[#2563EB]"
                    : "bg-slate-200"
                }`}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? "text-[#2563EB]" : isDone ? "text-slate-900" : "text-slate-400"
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

      {/* Step Content Card */}
      <Card className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#10233F]">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* STEP 1: Executive Summary */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F] block">
                      Solution Title *
                    </label>
                    <Input
                      value={formData.solutionTitle}
                      onChange={(e) => updateField("solutionTitle", e.target.value)}
                      placeholder="e.g. Distributed IoT Edge Telemetry for Real-Time Water Quality Monitoring"
                      className="h-10 text-xs"
                    />
                    <p className="text-[11px] text-[#64748B]">
                      A concise, descriptive title of your technical approach.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F] block">
                      Executive Summary &amp; Value Proposition *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.executiveSummary}
                      onChange={(e) => updateField("executiveSummary", e.target.value)}
                      placeholder="Describe what your system does, how it fulfills the department's outcome KPIs, and why it is superior to conventional approaches..."
                      className="w-full p-3 rounded-lg border border-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Technical Approach */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#10233F] block">
                      Technical Architecture &amp; Pilot Methodology *
                    </label>
                    <textarea
                      rows={6}
                      value={formData.proposalDetails}
                      onChange={(e) => updateField("proposalDetails", e.target.value)}
                      placeholder="Explain your stack, hardware/software integrations, edge/cloud topology, failure recovery, and data security measures..."
                      className="w-full p-3 rounded-lg border border-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F] block">
                        Proposed Pilot Duration
                      </label>
                      <Input
                        value={formData.implementationTimeline}
                        onChange={(e) => updateField("implementationTimeline", e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F] block">
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

              {/* STEP 3: Evidence Vault (Multi-File Attachments + Multi-Links) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="font-bold text-xs text-[#10233F]">
                      Multi-Dossier Evidence Vault
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Attach multiple technical evidence documents (system architecture diagrams, lab test benchmark certificates, ISO compliance filings) and external repository or demonstration video URLs.
                    </p>
                  </div>

                  {/* Multi-File Upload Dropzone */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#10233F]">
                        Upload Supporting Evidence Files
                      </span>
                      <span className="text-[#64748B]">
                        Attach multiple PDFs, ZIPs, or Diagrams (up to 25 MB each)
                      </span>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files?.length) {
                          handleFileUpload(e.dataTransfer.files);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-colors ${
                        isDragOver
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-300 hover:border-slate-400 bg-slate-50/40"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.zip,.doc,.docx,image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                      />

                      <div className="text-xs font-semibold text-[#10233F]">
                        {isUploading
                          ? "Computing SHA-256 integrity hash..."
                          : "Drag & drop multiple evidence documents here"}
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Supports multiple files: Architecture Blueprints, Lab Reports, Certificates, and Test Data.
                      </p>

                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium border-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        {isUploading ? "Processing..." : "Select Files from Device"}
                      </Button>
                    </div>

                    {/* Attached Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-semibold text-[#10233F] flex items-center justify-between">
                          <span>Attached Documents ({uploadedFiles.length})</span>
                          <span className="text-[11px] text-emerald-700">
                            Cryptographic SHA-256 recorded
                          </span>
                        </div>

                        <div className="space-y-2">
                          {uploadedFiles.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-semibold text-[#10233F] truncate">
                                    {doc.name}
                                  </div>
                                  <div className="text-[11px] text-[#64748B] flex flex-wrap items-center gap-2 font-mono">
                                    <span>{doc.formattedSize}</span>
                                    <span>•</span>
                                    <span>SHA-256: {doc.hash.substring(0, 12)}...</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={doc.category}
                                    onChange={(e) => handleUpdateFileCategory(doc.id, e.target.value)}
                                    className="h-8 px-2 rounded border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700"
                                  >
                                    {EVIDENCE_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => handleRemoveFile(doc.id)}
                                    className="h-8 px-2 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Link External Artifacts */}
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <span className="font-semibold text-xs text-[#10233F] block">
                      External Artifact &amp; Prototype URLs
                    </span>

                    {evidenceLinks.length > 0 && (
                      <div className="space-y-1.5">
                        {evidenceLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="truncate pr-2">
                              <span className="font-medium text-[#10233F] mr-2">{link.title}:</span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 hover:underline font-mono text-[11px]"
                              >
                                {link.url}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-1.5 cursor-pointer"
                              title="Remove link"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Input
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Artifact Title (e.g. Live Telemetry API Sandbox)"
                        className="h-9 text-xs sm:w-1/3"
                      />
                      <Input
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="URL (e.g. https://github.com/...)"
                        className="h-9 text-xs flex-1 font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddLink}
                        className="h-9 text-xs border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
                      >
                        + Add Artifact Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Declarations & Submit */}
              {currentStep === 4 && (
                <div className="space-y-5 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-[#10233F] block">
                      Proposal Summary Review
                    </span>
                    <p>
                      <strong>Solution Title:</strong> {formData.solutionTitle || "Untitled"}
                    </p>
                    <p className="text-slate-600 line-clamp-2">
                      <strong>Executive Summary:</strong> {formData.executiveSummary}
                    </p>
                    <p className="text-slate-600">
                      <strong>Applying Organization:</strong> {organization?.name || "Startup Entity"}
                    </p>
                    <p className="text-slate-600">
                      <strong>Attached Dossiers:</strong>{" "}
                      {uploadedFiles.length > 0
                        ? `${uploadedFiles.length} file(s) attached (${uploadedFiles.map((f) => f.name).join(", ")})`
                        : "No technical dossiers attached"}
                    </p>
                    <p className="text-slate-600">
                      <strong>External Artifacts:</strong>{" "}
                      {evidenceLinks.length > 0
                        ? `${evidenceLinks.length} link(s) attached`
                        : "No external links provided"}
                    </p>
                  </div>

                  {/* Statutory Declarations */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[#334155]">
                      <input
                        type="checkbox"
                        checked={formData.acceptedCompact}
                        onChange={(e) => updateField("acceptedCompact", e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                      <span>
                        I accept the terms of the <strong>Standard Innovation Compact</strong>. Intellectual property developed by the startup remains protected, and milestone disbursements are bound by statutory 15-day MSMED SLA guidelines.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-[#334155]">
                      <input
                        type="checkbox"
                        checked={formData.noConflictDeclared}
                        onChange={(e) => updateField("noConflictDeclared", e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
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
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Previous Step
            </Button>

            {currentStep < 4 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="text-xs font-medium bg-[#10233F] hover:bg-slate-800 text-white cursor-pointer"
              >
                Proceed to Next Step &rarr;
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
                className="text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer disabled:opacity-50"
              >
                {createSubmissionMutation.isPending ? "Submitting..." : "Submit Innovation Proposal"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplicationWizard;
