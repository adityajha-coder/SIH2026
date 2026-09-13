import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateProblem, usePublishProblem } from "@/hooks/useGovernment";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  MapPin,
  ShieldCheck,
  Scale,
  Sparkles,
  Save,
  Send,
  Plus,
  X,
  Clock,
  Loader2,
} from "lucide-react";

const SECTOR_OPTIONS = [
  "Agritech",
  "Clean Energy",
  "Healthcare",
  "Smart Mobility",
  "Water Governance",
  "Cybersecurity",
  "e-Governance",
  "Waste Management",
  "Urban Planning",
  "Disaster Resilience",
];

const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
  "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
  "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal", "Statewide",
];

const PROCUREMENT_PATHS = [
  {
    value: "DIRECT_PILOT",
    label: "Direct Sandbox Pilot",
    desc: "Single-stage PoC under ₹50 Lakhs with 30-day payment SLA",
  },
  {
    value: "CHALLENGE_PROCUREMENT",
    label: "Challenge Procurement",
    desc: "Competitive two-stage milestone trial with scale-up option",
  },
  {
    value: "RESEARCH_GRANT",
    label: "R&D Prototype Grant",
    desc: "Early TRL lab-to-field validation trial",
  },
  {
    value: "SCALE_UP",
    label: "Statewide Scale Mandate",
    desc: "Deployment across multiple Zilla Parishads / Municipal Corporations",
  },
];

export function ChallengeStudio() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const createProblemMutation = useCreateProblem();
  const publishProblemMutation = usePublishProblem();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [fullStatement, setFullStatement] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);
  
  // Step 2: Outcomes
  const [baselineMetric, setBaselineMetric] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("12");

  // Step 3: Geography & Path
  const [selectedDistricts, setSelectedDistricts] = useState(["Statewide"]);
  const [procurementPath, setProcurementPath] = useState("DIRECT_PILOT");
  const [fieldSiteDetails, setFieldSiteDetails] = useState("");

  // Step 4: Hard Gates & Requirements
  const [dpiitRequired, setDpiitRequired] = useState(true);
  const [minTrl, setMinTrl] = useState("4");
  const [mandatoryReqs, setMandatoryReqs] = useState([
    "Working prototype demonstrative in field conditions",
    "Indian citizen beneficial ownership >= 51%",
  ]);
  const [newReq, setNewReq] = useState("");
  const [constraints, setConstraints] = useState([
    "Must store citizen data within State Data Centre (SDC) boundaries",
  ]);
  const [newConstraint, setNewConstraint] = useState("");

  // Step 5: Compact & Deadline
  const [closeDate, setCloseDate] = useState("");
  const [acceptIpProtection, setAcceptIpProtection] = useState(true);
  const [acceptPaymentSla, setAcceptPaymentSla] = useState(true);

  // Add/remove tags
  const addSector = (sec) => {
    if (!selectedSectors.includes(sec)) {
      setSelectedSectors([...selectedSectors, sec]);
    } else {
      setSelectedSectors(selectedSectors.filter((s) => s !== sec));
    }
  };

  const addDistrict = (dist) => {
    if (!selectedDistricts.includes(dist)) {
      setSelectedDistricts([...selectedDistricts, dist]);
    } else {
      if (selectedDistricts.length > 1) {
        setSelectedDistricts(selectedDistricts.filter((d) => d !== dist));
      }
    }
  };

  const addReq = () => {
    if (newReq.trim()) {
      setMandatoryReqs([...mandatoryReqs, newReq.trim()]);
      setNewReq("");
    }
  };

  const removeReq = (idx) => {
    setMandatoryReqs(mandatoryReqs.filter((_, i) => i !== idx));
  };

  const addConst = () => {
    if (newConstraint.trim()) {
      setConstraints([...constraints, newConstraint.trim()]);
      setNewConstraint("");
    }
  };

  const removeConst = (idx) => {
    setConstraints(constraints.filter((_, i) => i !== idx));
  };

  // Real-time Challenge Readiness Score (0-100)
  const readiness = useMemo(() => {
    let score = 0;
    const checks = [];

    // Title clarity (15%)
    if (title.trim().length >= 10) {
      score += 15;
      checks.push("Specific challenge title defined");
    }

    // Summary clarity (15%)
    if (shortSummary.trim().length >= 20) {
      score += 15;
      checks.push("Executive summary articulated");
    }

    // Deep problem statement (20%)
    if (fullStatement.trim().length >= 40) {
      score += 20;
      checks.push("Operational narrative specified");
    }

    // Sectors selected (15%)
    if (selectedSectors.length > 0) {
      score += 15;
      checks.push("Target sectors classified");
    }

    // Measurable outcome / Baseline & Target (15%)
    if (baselineMetric.trim() || targetMetric.trim() || mandatoryReqs.length >= 2) {
      score += 15;
      checks.push("Measurable KPIs & hard gates defined");
    }

    // Geography & Pilot Bounds (10%)
    if (selectedDistricts.length > 0) {
      score += 10;
      checks.push("Maharashtra district pilot bounds set");
    }

    // Innovation Compact (10%)
    if (acceptIpProtection && acceptPaymentSla) {
      score += 10;
      checks.push("Standard Innovation Compact acknowledged");
    }

    return {
      score: Math.min(100, score),
      checks,
    };
  }, [
    title,
    shortSummary,
    fullStatement,
    selectedSectors,
    baselineMetric,
    targetMetric,
    mandatoryReqs,
    selectedDistricts,
    acceptIpProtection,
    acceptPaymentSla,
  ]);

  const buildPayload = () => {
    const orgId = organization?._id;
    if (!orgId) {
      throw new Error("Department organization context missing. Please re-login.");
    }

    let allReqs = [...mandatoryReqs];
    if (baselineMetric || targetMetric) {
      allReqs.push(`KPI Target: ${baselineMetric || "Baseline"} -> ${targetMetric || "Target Outcome"}`);
    }

    return {
      title: title.trim(),
      shortSummary: shortSummary.trim(),
      fullStatement: fullStatement.trim() || shortSummary.trim(),
      organizationId: orgId,
      sectors: selectedSectors.length > 0 ? selectedSectors : ["GovTech"],
      geography: {
        state: "Maharashtra",
        districts: selectedDistricts,
      },
      mandatoryRequirements: allReqs,
      preferredRequirements: [`TRL >= ${minTrl}`, `Pilot Duration: ${timelineWeeks} weeks`],
      constraints: constraints,
      eligibleApplicantTypes: ["STARTUP"],
      procurementPath: procurementPath,
      applicationOpenAt: new Date().toISOString(),
      applicationCloseAt: closeDate
        ? new Date(closeDate).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrls: [],
    };
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (title.trim().length < 5) {
      toast.error("Please enter a problem title (at least 5 characters).");
      setCurrentStep(1);
      return;
    }
    if (shortSummary.trim().length < 10) {
      toast.error("Please provide a short summary (at least 10 characters).");
      setCurrentStep(1);
      return;
    }

    try {
      const payload = buildPayload();
      const res = await createProblemMutation.mutateAsync(payload);
      toast.success("Challenge statement saved as Draft!");
      navigate("/government/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || "Failed to save draft");
    }
  };

  // Publish Handler
  const handlePublish = async () => {
    if (readiness.score < 60) {
      toast.error("Please complete more challenge fields before publishing (Score >= 60%).");
      return;
    }

    try {
      const payload = buildPayload();
      const res = await createProblemMutation.mutateAsync(payload);
      const problemId = res.problem?._id || res._id;
      if (problemId) {
        await publishProblemMutation.mutateAsync(problemId);
        toast.success("Challenge published live to public catalog!");
      } else {
        toast.success("Challenge saved successfully!");
      }
      navigate("/government/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || "Failed to publish challenge");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="space-y-1 pb-2 border-b border-slate-200">
        <Link
          to="/government/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Command Center
        </Link>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Outcome-Based Problem Formulator
          </span>
          <span className="text-xs text-[#64748B]">• Standard Innovation Compact Enabled</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
          Challenge Authoring Studio
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Define measurable operational problem statements for Maharashtra departments. Startups compete on capability and pilot merit rather than prior turnover.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl text-center">
            {[
              { num: 1, label: "Narrative" },
              { num: 2, label: "KPIs" },
              { num: 3, label: "Geography" },
              { num: 4, label: "Hard Gates" },
              { num: 5, label: "Compact" },
            ].map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`py-2 px-1 rounded-lg text-xs transition-all ${
                  currentStep === st.num
                    ? "bg-white text-[#10233F] font-bold shadow-2xs"
                    : currentStep > st.num
                    ? "text-[#0F766E] font-semibold"
                    : "text-[#64748B]"
                }`}
              >
                <span className="block">{st.num}. {st.label}</span>
              </button>
            ))}
          </div>

          {/* Form Step Cards with Framer Motion */}
          <AnimatePresence mode="wait">
            {/* STEP 1: NARRATIVE */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      1. Problem Narrative &amp; Sector Domain
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Articulate the operational challenge currently faced by your department or municipal body.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Challenge Title *
                      </label>
                      <Input
                        placeholder="e.g. Real-Time Non-Revenue Water Leakage Detection in Nashik Municipal Pipeline"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-10 text-xs"
                      />
                      <span className="text-[11px] text-[#64748B]">
                        Keep it outcome-focused rather than prescribing specific commercial software.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Executive Problem Summary (Short) *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Concise 2-line summary explaining the core civic pain point and why traditional solutions failed..."
                        value={shortSummary}
                        onChange={(e) => setShortSummary(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Detailed Operational Problem Statement
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Provide in-depth contextual background, field environment constraints, current operational workflow, and key failure points..."
                        value={fullStatement}
                        onChange={(e) => setFullStatement(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Target Innovation Sectors (Select Applicable)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SECTOR_OPTIONS.map((sec) => {
                          const active = selectedSectors.includes(sec);
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => addSector(sec)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                active
                                  ? "bg-[#2563EB] text-white font-semibold"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {sec}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: OUTCOMES & KPIS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      2. Quantifiable Outcomes &amp; Impact Targets
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Outcome-based procurement requires quantifiable metrics rather than generic feature wishlists.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#10233F]">
                          Current Baseline Metric
                        </label>
                        <Input
                          placeholder="e.g. Current physical water loss: 38.5%"
                          value={baselineMetric}
                          onChange={(e) => setBaselineMetric(e.target.value)}
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#10233F]">
                          Target Pilot Outcome
                        </label>
                        <Input
                          placeholder="e.g. Target reduction to < 15% within 90 days"
                          value={targetMetric}
                          onChange={(e) => setTargetMetric(e.target.value)}
                          className="h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#10233F]">
                          Required Technology Readiness Level (TRL)
                        </label>
                        <select
                          value={minTrl}
                          onChange={(e) => setMinTrl(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 h-10 px-3 text-xs bg-white focus:border-[#2563EB]"
                        >
                          <option value="4">TRL 4: Lab / Proof of Concept validated</option>
                          <option value="5">TRL 5: Integrated component in simulated environment</option>
                          <option value="6">TRL 6: Prototype demonstrated in relevant field agency</option>
                          <option value="7">TRL 7: Operational field demonstration ready</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#10233F]">
                          Target Sandbox Trial Duration (Weeks)
                        </label>
                        <Input
                          type="number"
                          min="4"
                          max="52"
                          value={timelineWeeks}
                          onChange={(e) => setTimelineWeeks(e.target.value)}
                          className="h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-200 text-xs text-[#10233F] space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-[#2563EB]">
                        <Target className="h-4 w-4" />
                        Maharashtra Statutory Sandbox Principle:
                      </span>
                      <p className="text-[#64748B]">
                        Contractual disbursements are triggered strictly upon validated metric achievement during the pilot, protecting government funds from failed vendor claims.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: GEOGRAPHY & PROCUREMENT PATH */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      3. District Geography &amp; Procurement Path
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Specify target Maharashtra administrative districts for the field trial deployment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Target Maharashtra District(s)
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                        {MAHARASHTRA_DISTRICTS.map((dist) => {
                          const active = selectedDistricts.includes(dist);
                          return (
                            <button
                              key={dist}
                              type="button"
                              onClick={() => addDistrict(dist)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                active
                                  ? "bg-[#2563EB] text-white font-semibold"
                                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                              }`}
                            >
                              {dist}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[11px] text-[#64748B]">
                        Selected: {selectedDistricts.join(", ")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Procurement Path
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PROCUREMENT_PATHS.map((path) => {
                          const active = procurementPath === path.value;
                          return (
                            <button
                              key={path.value}
                              type="button"
                              onClick={() => setProcurementPath(path.value)}
                              className={`p-3.5 rounded-xl border text-left transition-all ${
                                active
                                  ? "border-[#2563EB] bg-blue-50/50 shadow-2xs"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <span className="font-bold text-xs text-[#10233F] block">
                                {path.label}
                              </span>
                              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                                {path.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 4: HARD GATES & MANDATORY CRITERIA */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      4. Mandatory Hard Gates &amp; Technical Criteria
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Deterministic rules evaluated automatically before proposals reach the review committee.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Statutory Exemption Toggle */}
                    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0F766E] flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4" />
                          DPIIT Statutory Prior-Turnover Exemption
                        </span>
                        <input
                          type="checkbox"
                          checked={dpiitRequired}
                          onChange={(e) => setDpiitRequired(e.target.checked)}
                          className="h-4 w-4 text-[#0F766E] rounded border-teal-300"
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Under GFR Rule 173(i), verified DPIIT startups are automatically exempt from minimum prior balance sheet turnover and commercial vintage requirements.
                      </p>
                    </div>

                    {/* Mandatory Criteria List */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Mandatory Technical Criteria (Hard Gates)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Device must support offline caching during network dropouts"
                          value={newReq}
                          onChange={(e) => setNewReq(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReq())}
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={addReq}
                          className="h-9 bg-slate-100 text-slate-800 hover:bg-slate-200"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        {mandatoryReqs.map((req, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <span className="text-[#10233F]">{req}</span>
                            <button
                              type="button"
                              onClick={() => removeReq(idx)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Constraints */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Regulatory &amp; Security Constraints
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Must comply with CERT-In cybersecurity baseline directives"
                          value={newConstraint}
                          onChange={(e) => setNewConstraint(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConst())}
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={addConst}
                          className="h-9 bg-slate-100 text-slate-800 hover:bg-slate-200"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        {constraints.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <span className="text-[#10233F]">{c}</span>
                            <button
                              type="button"
                              onClick={() => removeConst(idx)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 5: COMPACT & PUBLISH */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      5. Standard Innovation Compact &amp; Schedule
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Final legal acknowledgments under the Maharashtra Startup Sandbox Mandate.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#10233F]">
                        Application Close Deadline
                      </label>
                      <Input
                        type="date"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                        className="h-10 text-xs"
                      />
                      <span className="text-[11px] text-[#64748B]">
                        Defaults to 30 calendar days from today if left empty.
                      </span>
                    </div>

                    {/* Compact Acknowledgments */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptIpProtection}
                          onChange={(e) => setAcceptIpProtection(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#10233F] block">
                            Ring-Fenced Startup Intellectual Property
                          </span>
                          <span className="text-[#64748B]">
                            The Department acknowledges that background and foreground IP developed by the startup remains the exclusive property of the startup; the Government retains a non-exclusive pilot evaluation license.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptPaymentSla}
                          onChange={(e) => setAcceptPaymentSla(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#10233F] block">
                            Statutory 30-Day Milestone Payment SLA
                          </span>
                          <span className="text-[#64748B]">
                            Department agrees to disburse validated milestone pilot tranches within 30 days of joint field sign-off without re-tendering bureaucracy.
                          </span>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createProblemMutation.isPending}
                className="text-xs font-semibold gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white gap-1"
                >
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={createProblemMutation.isPending || publishProblemMutation.isPending}
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                >
                  {createProblemMutation.isPending || publishProblemMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Publish Challenge
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Challenge Readiness Meter */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#10233F]">
                  Quality Assurance
                </span>
                <span className="text-xs font-mono font-bold text-[#2563EB]">
                  {readiness.score}%
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-[#10233F] pt-1">
                Challenge Readiness Meter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Score Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      readiness.score >= 80
                        ? "bg-emerald-500"
                        : readiness.score >= 50
                        ? "bg-[#2563EB]"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Draft</span>
                  <span>{readiness.score >= 70 ? "Sovereign Grade" : "Needs Detail"}</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-[#10233F] block">
                  Readiness Criteria ({readiness.checks.length}/7):
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {readiness.checks.map((chk, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{chk}</span>
                    </div>
                  ))}
                  {readiness.score < 100 && (
                    <div className="flex items-center gap-1.5 text-[#64748B] pt-1">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>Complete remaining fields to achieve 100%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary box */}
              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-[#64748B] border border-slate-200">
                Challenges scoring above <strong>70%</strong> receive 3x higher high-readiness proposal matching from certified startups.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ChallengeStudio;
