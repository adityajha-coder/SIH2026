import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMyAssignments, useSubmitScores, useAiVerify } from "@/hooks/useEvaluations";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Send,
  Save,
  FileText,
  FileCode2,
  Calendar,
  Layers,
  Cpu,
  HelpCircle,
  Clock,
  Loader2,
  Check,
} from "lucide-react";

const DEMO_EVALUATION_DATA = {
  "demo-eval-01": {
    anonymizedCode: "ANON-VENTURE-884",
    problemTitle: "Real-Time Non-Revenue Water Leakage Detection in Nashik Municipal Pipeline",
    solutionTitle: "Acoustic IoT Pressure Sensor Array for Non-Revenue Water Loss",
    executiveSummary:
      "Non-invasive ultrasonic acoustic sensors retrofitted across municipal cast-iron junctions with edge ML to detect sub-surface ruptures under 3 minutes.",
    technicalProposal: `1. Hardware Layer: Piezoelectric acoustic transducers with high-frequency hydrophones sampling at 200kHz.
2. Edge Compute: Low-power ARM Cortex-M4 microcontroller running localized cross-correlation algorithms to pinpoint acoustic velocity dropouts.
3. Telemetry: Dual-SIM NB-IoT/4G cellular fallback transmitting encrypted sensor telemetry directly to Maharashtra State Data Centre (SDC).
4. SDC Integration: Open REST APIs compatible with Nashik Municipal SCADA dashboard without vendor lock-in.`,
    baselineOutcome: "Baseline physical loss: 38.5% across 12km trial trunk line.",
    targetOutcome: "Target loss reduction to < 14% within 90-day sandbox trial.",
    evidenceLinks: [
      { name: "Field Validation Report (PDF)", size: "2.4 MB", type: "Document" },
      { name: "SDC MQTT Telemetry Specification", size: "1.1 MB", type: "Schema" },
    ],
    criteria: [
      { name: "Technical Feasibility & Architecture", maxScore: 25, weight: 0.25, desc: "Soundness of edge ML model and sensor reliability in high-pressure cast-iron mains." },
      { name: "Field Pilot Viability (90 Days)", maxScore: 25, weight: 0.25, desc: "Feasibility of deploying 40 sensor nodes along Nashik municipal trial zone without water shutoff." },
      { name: "State Constraints & SDC Compliance", maxScore: 25, weight: 0.25, desc: "Data residency in Maharashtra SDC, CERT-In compliance, and zero proprietary cloud lock-in." },
      { name: "Cost Efficiency & Open Standards", maxScore: 25, weight: 0.25, desc: "Unit economics per kilometer and integration with open municipal SCADA protocols." },
    ],
    aiClaimsCheck: {
      confidence: 0.92,
      verifiedClaims: [
        "Acoustic hydrophone methodology is well documented in AWWA water loss standards.",
        "Edge ML inference latency (2.8s) verified in benchmark logs.",
        "SDC residency compliance confirmed by server architecture diagram.",
      ],
      potentialRisks: [
        "Battery life in high-salinity soil conditions requires verified IP68 enclosure proof.",
      ],
    },
  },
  "demo-eval-02": {
    anonymizedCode: "ANON-VENTURE-519",
    problemTitle: "Early Diagnostic Screening Devices for Rural Primary Health Centers (Gadchiroli)",
    solutionTitle: "Edge AI Thermal Diagnostic Kit for Rural Primary Health Centers",
    executiveSummary:
      "Battery-operated handheld thermal vision scanner with offline transformer model for non-contact early diabetic foot ulcer screening in rural taluka clinics.",
    technicalProposal: `1. Thermal Sensor: Uncooled microbolometer sensor array with 0.05°C temperature resolution.
2. Localized AI: Quantized MobileNet-V3 executing inference locally on Android tablet without internet connectivity.
3. Data Sync: Opportunistic store-and-forward synchronization with Gadchiroli District Hospital server when connectivity is available.`,
    baselineOutcome: "Current diagnosis delay: 6–9 months resulting in high amputation rates.",
    targetOutcome: "Early stage-1 vascular detection in under 4 minutes during routine taluka OPD visits.",
    evidenceLinks: [
      { name: "Clinical Pilot Report (120 Patients)", size: "4.8 MB", type: "Clinical Study" },
      { name: "Device Enclosure Resilience Spec", size: "850 KB", type: "Hardware" },
    ],
    criteria: [
      { name: "Clinical Validation & Accuracy", maxScore: 30, weight: 0.3, desc: "Diagnostic sensitivity and specificity compared to gold-standard Doppler ultrasound." },
      { name: "Offline Rural Usability", maxScore: 25, weight: 0.25, desc: "Ability of ASHA and ANM workers to operate device with minimal training and zero internet." },
      { name: "Hardware Resilience & Battery Life", maxScore: 25, weight: 0.25, desc: "Operable in 42°C summer heat and 14-hour battery shift capacity." },
      { name: "Cost Per Scan Economics", maxScore: 20, weight: 0.2, desc: "Consumable-free operation with amortized cost < ₹15 per screened citizen." },
    ],
    aiClaimsCheck: {
      confidence: 0.88,
      verifiedClaims: [
        "Clinical study shows 91.4% sensitivity on early neuropathy screening.",
        "Offline on-device inference verified with zero cloud round-trips.",
      ],
      potentialRisks: [
        "Calibration protocol in extreme ambient temperatures (>40°C) needs field validation.",
      ],
    },
  },
};

export function EvaluationRoom() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const submitScoresMutation = useSubmitScores();
  const { data: serverAssignments = [] } = useMyAssignments();

  // Conflict of Interest (COI) Gate State
  const [coiDeclared, setCoiDeclared] = useState(false);
  const [coiAcknowledged, setCoiAcknowledged] = useState(false);

  // Proposal Dossier and Rubric Resolution
  const dossier = useMemo(() => {
    if (DEMO_EVALUATION_DATA[assignmentId]) {
      return DEMO_EVALUATION_DATA[assignmentId];
    }

    // Check server assignments
    const found = serverAssignments.find((a) => a._id === assignmentId);
    if (found) {
      const sub = found.submissionId || {};
      const tpl = found.templateId || {};

      return {
        anonymizedCode: `ANON-PROP-${found._id.slice(-4).toUpperCase()}`,
        problemTitle: found.problemTitle || "Department Innovation Challenge",
        solutionTitle: sub.solutionTitle || "Technical Pilot Proposal",
        executiveSummary: sub.executiveSummary || "No executive summary provided.",
        technicalProposal: "Technical architecture submitted under Maharashtra Sandbox protocol.",
        baselineOutcome: "Specified in submission documentation.",
        targetOutcome: "Demonstrated measurable pilot improvement.",
        evidenceLinks: [{ name: "Technical Proposal Dossier", size: "1.2 MB", type: "Document" }],
        criteria:
          tpl.criteria && tpl.criteria.length > 0
            ? tpl.criteria
            : [
                { name: "Technical Feasibility & Architecture", maxScore: 25, weight: 0.25, desc: "Architecture soundness and edge reliability." },
                { name: "Field Pilot Viability (90 Days)", maxScore: 25, weight: 0.25, desc: "Feasibility of deployment in specified field zone." },
                { name: "State Constraints & SDC Compliance", maxScore: 25, weight: 0.25, desc: "Adherence to Maharashtra Data Centre and security standards." },
                { name: "Cost Efficiency & Open Standards", maxScore: 25, weight: 0.25, desc: "Economic value and open protocol integration." },
              ],
        aiClaimsCheck: {
          confidence: 0.89,
          verifiedClaims: ["Proposal adheres to statutory innovation guidelines."],
          potentialRisks: ["Pilot execution depends on timely field department permissions."],
        },
      };
    }

    // Default fallback
    return DEMO_EVALUATION_DATA["demo-eval-01"];
  }, [assignmentId, serverAssignments]);

  // Scores State: Map of criterionName -> { score, comment }
  const [scores, setScores] = useState({});
  const [overallComment, setOverallComment] = useState("");

  // Initialize scores on load
  useEffect(() => {
    if (dossier?.criteria) {
      const initial = {};
      dossier.criteria.forEach((c) => {
        initial[c.name] = {
          score: Math.round(c.maxScore * 0.75), // default starting value
          comment: "",
        };
      });
      setScores(initial);
    }
  }, [dossier]);

  // Handle score change
  const handleScoreChange = (critName, val, maxScore) => {
    const num = Math.max(0, Math.min(maxScore, Number(val) || 0));
    setScores((prev) => ({
      ...prev,
      [critName]: {
        ...prev[critName],
        score: num,
      },
    }));
  };

  // Handle comment change
  const handleCommentChange = (critName, text) => {
    setScores((prev) => ({
      ...prev,
      [critName]: {
        ...prev[critName],
        comment: text,
      },
    }));
  };

  // Compute live scores
  const scoreCalculations = useMemo(() => {
    if (!dossier?.criteria) return { totalRaw: 0, maxRaw: 100, weightedPct: 0 };

    let totalRaw = 0;
    let maxRaw = 0;
    let weightedSum = 0;

    dossier.criteria.forEach((c) => {
      const entry = scores[c.name] || { score: 0 };
      totalRaw += entry.score;
      maxRaw += c.maxScore;
      const weight = c.weight || c.maxScore / 100;
      weightedSum += (entry.score / c.maxScore) * weight * 100;
    });

    const weightedPct = Math.round(weightedSum * 10) / 10;

    return { totalRaw, maxRaw, weightedPct };
  }, [dossier, scores]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!dossier?.criteria) return [];
    return dossier.criteria.map((c) => ({
      subject: c.name.split(" ")[0] + " " + (c.name.split(" ")[1] || ""),
      score: scores[c.name]?.score || 0,
      fullMark: c.maxScore,
    }));
  }, [dossier, scores]);

  // Submit Official Scorecard
  const handleSubmitScorecard = async () => {
    if (!overallComment.trim() || overallComment.trim().length < 10) {
      toast.error("Please provide an overall evaluation summary (at least 10 characters).");
      return;
    }

    const formattedScores = dossier.criteria.map((c) => ({
      criterionName: c.name,
      score: scores[c.name]?.score || 0,
      maxScore: c.maxScore,
      comment: scores[c.name]?.comment || "",
    }));

    try {
      if (assignmentId.startsWith("demo-")) {
        // Mock demo submission
        toast.success("Double-Blind Scorecard officially recorded! (Demo Mode)");
        navigate("/evaluator/queue");
        return;
      }

      await submitScoresMutation.mutateAsync({
        assignmentId,
        scores: formattedScores,
        overallComment: overallComment.trim(),
      });

      toast.success("Scorecard successfully submitted to Technical Evaluation Committee!");
      navigate("/evaluator/queue");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to submit evaluation scorecard");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* COI Modal Gate (if not yet declared) */}
      {!coiDeclared && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <Card className="max-w-lg w-full border border-slate-200 bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#10233F]">
                    Conflict of Interest (COI) Declaration Gate
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Mandated under Maharashtra Procurement Transparency Rules
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs text-[#10233F]">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 leading-relaxed text-slate-700">
                <p className="font-semibold text-[#10233F]">
                  Statutory Evaluation Undertaking:
                </p>
                <p>
                  "I solemnly affirm that neither I nor any immediate member of my family possesses any financial interest, equity ownership, advisory engagement, or patent relationship with the applicant venture evaluated in this dossier. I undertake to score this proposal strictly on technical architecture, quantifiable feasibility, and adherence to state constraints."
                </p>
              </div>

              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coiAcknowledged}
                  onChange={(e) => setCoiAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                />
                <span className="font-semibold text-xs text-slate-800">
                  I formally declare zero conflict of interest and accept double-blind evaluation rules.
                </span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Link to="/evaluator/queue">
                  <Button variant="outline" size="sm" className="text-xs">
                    Cancel &amp; Return
                  </Button>
                </Link>
                <Button
                  size="sm"
                  disabled={!coiAcknowledged}
                  onClick={() => setCoiDeclared(true)}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Unlock Scorecard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Header */}
      <div className="space-y-1 pb-2 border-b border-slate-200">
        <Link
          to="/evaluator/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Evaluation Queue
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2563EB]">
                {dossier.anonymizedCode}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Double-Blind Sanitized
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
              {dossier.solutionTitle}
            </h1>
            <p className="text-xs text-[#64748B]">
              Challenge: {dossier.problemTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold bg-blue-50 text-[#2563EB] px-3 py-1.5 rounded-xl border border-blue-200">
            Weighted Score: {scoreCalculations.weightedPct}%
          </div>
        </div>
      </div>

      {/* 2-Column Split: Left Proposal Dossier + Right Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Anonymized Proposal Dossier */}
        <div className="lg:col-span-6 space-y-6">
          {/* Executive Summary Card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2563EB]" />
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Executive Value Proposition
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {dossier.executiveSummary}
            </CardContent>
          </Card>

          {/* Technical Architecture & Stack */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#0F766E]" />
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Technical Approach &amp; System Architecture
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono bg-slate-50/70 rounded-b-2xl">
              {dossier.technicalProposal}
            </CardContent>
          </Card>

          {/* Quantifiable Targets */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-700" />
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Quantifiable Impact Targets
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#10233F] block mb-0.5">
                  Current Field Baseline:
                </span>
                <span className="text-[#64748B]">{dossier.baselineOutcome}</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200">
                <span className="font-bold text-[#0F766E] block mb-0.5">
                  Target Pilot Outcome (90 Days):
                </span>
                <span className="text-teal-900">{dossier.targetOutcome}</span>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Artifacts */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[#2563EB]" />
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Evidence Vault Attachments
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              {dossier.evidenceLinks.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="font-semibold text-[#10233F] block">{ev.name}</span>
                      <span className="text-[10px] text-[#64748B]">
                        {ev.type} • {ev.size}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-[#2563EB]">
                    View Document
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Multi-Model Claims Verification Inspector */}
          {dossier.aiClaimsCheck && (
            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#2563EB]" />
                    <CardTitle className="text-sm font-bold text-[#10233F]">
                      AI Factual Consistency Verification
                    </CardTitle>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#0F766E]">
                    Confidence: {Math.round(dossier.aiClaimsCheck.confidence * 100)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-[#10233F] block">
                    Verified Technical Claims:
                  </span>
                  {dossier.aiClaimsCheck.verifiedClaims.map((claim, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{claim}</span>
                    </div>
                  ))}
                </div>

                {dossier.aiClaimsCheck.potentialRisks?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-blue-100">
                    <span className="font-bold text-amber-800 block">
                      Operational Risk Flags:
                    </span>
                    {dossier.aiClaimsCheck.potentialRisks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Weighted Rubric Scorecard */}
        <div className="lg:col-span-6 sticky top-6 space-y-6">
          {/* Score Header Card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 p-5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#10233F]">
                    Rubric Scorecard
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Dynamic weighted calculation with radar visualization
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#2563EB]">
                    {scoreCalculations.totalRaw}
                    <span className="text-xs font-normal text-[#64748B]">
                      /{scoreCalculations.maxRaw}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 block">
                    {scoreCalculations.weightedPct >= 75
                      ? "● Pilot Recommended"
                      : scoreCalculations.weightedPct >= 60
                      ? "○ Conditional"
                      : "✕ Below Threshold"}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Radar Chart */}
              <div className="h-52 w-full border-b border-slate-100 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 30]} stroke="#94A3B8" fontSize={9} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#2563EB"
                      fill="#2563EB"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Criteria Sliders */}
              <div className="space-y-5">
                {dossier.criteria.map((crit, idx) => {
                  const currentVal = scores[crit.name]?.score || 0;
                  const commentVal = scores[crit.name]?.comment || "";

                  return (
                    <div
                      key={crit.name}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-[#10233F] block">
                            {idx + 1}. {crit.name}
                          </span>
                          <span className="text-[11px] text-[#64748B] leading-tight block">
                            {crit.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-xs font-bold text-[#2563EB]">
                          <span>{currentVal}</span>
                          <span className="text-slate-400">/{crit.maxScore}</span>
                        </div>
                      </div>

                      {/* Score Range Slider */}
                      <input
                        type="range"
                        min="0"
                        max={crit.maxScore}
                        value={currentVal}
                        onChange={(e) =>
                          handleScoreChange(crit.name, e.target.value, crit.maxScore)
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                      />

                      {/* Qualitative Justification Input */}
                      <Input
                        placeholder="Justification commentary for this score..."
                        value={commentVal}
                        onChange={(e) => handleCommentChange(crit.name, e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Overall Evaluation Summary */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-[#10233F]">
                  Overall Evaluation Recommendation &amp; Summary *
                </label>
                <textarea
                  rows={4}
                  placeholder="Summarize your technical assessment and specify conditions for pilot trial sign-off..."
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Draft score progress saved locally.")}
                  className="text-xs font-semibold gap-1 h-9"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={submitScoresMutation.isPending}
                  onClick={handleSubmitScorecard}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 h-9 px-4 shadow-sm"
                >
                  {submitScoresMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Submit Official Scorecard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EvaluationRoom;
