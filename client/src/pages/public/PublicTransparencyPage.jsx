import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Scale,
  Landmark,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Coins,
  FileText,
  Clock,
  ExternalLink,
  ArrowRight,
  Eye,
  FileCheck,
  Sparkles,
  Lock,
  Binary,
  Check,
  Zap,
  RotateCcw,
} from "lucide-react";

const PROTOCOL_GUARANTEES = [
  {
    id: "audit",
    num: "01",
    title: "Cryptographic Audit Immutability",
    subtitle: "SHA-256 Digital Signatures & Non-Repudiation",
    icon: FileCheck,
    color: "#2563EB",
    lightColor: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "Every administrative sanction, transition event, and evaluator scorecard generates an immutable SHA-256 hash locked with the issuing officer's sovereign token, preventing retroactive edits or covert tampering.",
    statute: "Maharashtra Public Procurement Rules 2024 & IT Act 2000 Sec. 65B",
    points: [
      "Zero manual overwriting permitted after sovereign digital seal is applied",
      "Cryptographic digest verifiable in real-time by citizens and state CAG auditors",
      "Millisecond-precision UTC+05:30 timestamps with immutable forensic trace tokens",
    ],
  },
  {
    id: "sla",
    num: "02",
    title: "Mandatory 30-Day Payment SLA",
    subtitle: "Statutory Interest Penalty under MSMED Act Sec. 15",
    icon: Clock,
    color: "#0F766E",
    lightColor: "bg-teal-50 text-teal-700 border-teal-200",
    description:
      "Once a sandbox milestone deliverable is verified by the department nodal officer, treasury payment release is legally binding within 30 days. Delays automatically attract compounding interest at 3x the RBI bank rate.",
    statute: "Central MSMED Act No. 27 of 2006 & Maharashtra Finance Circular FIN-2023",
    points: [
      "Strict 30-day outer limit enforced through automated treasury release triggers",
      "Statutory monthly compounding interest automatically levied on department delays",
      "Executive alert dispatched to Principal Secretary if invoice reaches Day 20 unpaid",
    ],
  },
  {
    id: "blind",
    num: "03",
    title: "Double-Blind Meritocracy",
    subtitle: "Identity-Masked Proposal Dossiers for Evaluators",
    icon: Scale,
    color: "#7C3AED",
    lightColor: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Empaneled technical evaluators review candidate submissions with zero knowledge of company name, founder background, or commercial branding, ensuring evaluation is 100% focused on technical excellence.",
    statute: "State Innovation Procurement Regulations 2024 (Rule 8: Bias-Free Scoring)",
    points: [
      "Venture names masked to sovereign codes (e.g. ANON-VENTURE-7829)",
      "Mandatory Conflict-of-Interest (COI) statutory declaration before scoring unlocks",
      "Weighted 4-criteria rubric with normalized percentile rank distribution",
    ],
  },
  {
    id: "xai",
    num: "04",
    title: "Explainable AI Decisions",
    subtitle: "Deterministic 4-Pillar Scoring & Human-in-the-Loop",
    icon: Sparkles,
    color: "#D97706",
    lightColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Artificial intelligence operates strictly as an advisory co-pilot for departmental officers. Every match and evaluation recommendation is mathematically deterministic and fully cited.",
    statute: "NITI Aayog National AI Strategy & Maharashtra AI Ethical Governance Compact",
    points: [
      "Deterministic 4-pillar breakdown (Sector 35%, Capability 35%, Stage 15%, DPIIT 15%)",
      "Verifiable citation references linking problem requirements to startup IP",
      "Statutory disclaimer preserving ultimate accountability with human nodal officers",
    ],
  },
];

export function PublicTransparencyPage() {
  const [activeProtocol, setActiveProtocol] = useState("audit");
  const [hashInput, setHashInput] = useState("SANCTION_ORDER_MAH_2026_WATER_LOSS_PILOT_01");
  const [anonymizedView, setAnonymizedView] = useState(true);

  const current = PROTOCOL_GUARANTEES.find((g) => g.id === activeProtocol) || PROTOCOL_GUARANTEES[0];
  const Icon = current.icon;

  // Simple deterministic hash simulation for interactive demo
  const simulatedHash = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = (hash << 5) - hash + hashInput.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `9f8a2c11${hex}7b30aa447d912ef0881bc3${hex}`;
  }, [hashInput]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F]">
      {/* Top Breadcrumb */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link to="/" className="hover:text-[#2563EB] transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-[#10233F]">Public Audit & Transparency</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#0F766E] font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Open Government Data Registry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="border-b border-[#E2E8F0] bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800">
              <Landmark className="h-3.5 w-3.5" />
              Sovereign Accountability & Public Trust
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#10233F]">
              Maharashtra Sovereign Innovation Audit & Transparency Registry
            </h1>
            <p className="text-base text-[#64748B] leading-relaxed">
              Every innovation challenge, double-blind evaluation scorecard, and statutory milestone payment disbursed through Pragati-GovX is tracked on an immutable cryptographic ledger ensuring 100% public accountability.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/challenges">
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 px-5 shadow-sm">
                  View Public Challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/policy">
                <Button variant="outline" className="border-[#CBD5E1] text-[#10233F] text-xs font-semibold h-10 px-4">
                  DPIIT Statutory Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sovereign Stats Rail */}
      <section className="py-12 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Innovation Capital Committed</div>
              <div className="text-2xl font-bold font-mono text-[#10233F] mt-1.5">₹42.8 Crores</div>
              <div className="text-[11px] text-[#0F766E] mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Treasury Verified
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Statewide District Coverage</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1.5">36 Districts</div>
              <div className="text-[11px] text-[#64748B] mt-1">All administrative divisions</div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">30-Day Payment SLA Adherence</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">98.4%</div>
              <div className="text-[11px] text-[#64748B] mt-1">Zero startup cash-flow delays</div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Double-Blind Evaluations</div>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1.5">100% Bias-Free</div>
              <div className="text-[11px] text-[#64748B] mt-1">Anonymized applicant dossiers</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F7F9FC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB]">
              Sovereign Protocol Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] mt-1 tracking-tight">
              Four Guarantees of Sovereign Transparency
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Select any core pillar below to inspect its operational mechanics, statutory citation, and real-time cryptographic verification proof.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              {PROTOCOL_GUARANTEES.map((g) => {
                const isActive = g.id === activeProtocol;
                const GIcon = g.icon;

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveProtocol(g.id)}
                    className={`w-full text-left rounded-xl p-4 transition-all border flex items-start gap-4 ${
                      isActive
                        ? "bg-white border-[#2563EB] shadow-md ring-2 ring-blue-500/10"
                        : "bg-white/80 border-[#E2E8F0] hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isActive ? g.lightColor : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <GIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          PILLAR {g.num}
                        </span>
                        {isActive && (
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                            ACTIVE INSPECTION
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-bold truncate mt-0.5 ${isActive ? "text-[#10233F]" : "text-slate-700"}`}>
                        {g.title}
                      </h3>
                      <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                        {g.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                {/* Header of Active Guarantee */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Pillar {current.num}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {current.id.toUpperCase()}_PROTOCOL_V1
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#10233F]">
                      {current.title}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {current.subtitle}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border shrink-0 ${current.lightColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Narrative Description */}
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {current.description}
                </p>

                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <span>Live Verification Engine</span>
                    <span className="text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Cryptographically Validated
                    </span>
                  </div>

                  {/* Widget 1: Cryptographic Hash Generator */}
                  {current.id === "audit" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#10233F] block mb-1">
                          Test Input Payload to Hash:
                        </label>
                        <input
                          type="text"
                          value={hashInput}
                          onChange={(e) => setHashInput(e.target.value)}
                          className="w-full text-xs font-mono rounded border border-slate-300 bg-white p-2 text-slate-800 focus:outline-blue-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-slate-500 block">
                          Generated SHA-256 Immutable Signature:
                        </span>
                        <div className="p-2.5 rounded bg-[#10233F] text-emerald-400 font-mono text-[11px] break-all select-all">
                          {simulatedHash}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Widget 2: 30-Day SLA Countdown Simulator */}
                  {current.id === "sla" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-[#0F766E]">Active Tranche 2 SLA Clock</span>
                        <span className="text-slate-600">Day 18 of 30 (12 days remaining)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full w-[60%]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-400 block">Delay Penalty Clause:</span>
                          <strong className="text-rose-700">3x RBI Bank Rate</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Disbursement Route:</span>
                          <strong className="text-emerald-700">State Treasury RTGS</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Widget 3: Double-Blind Anonymizer Mode */}
                  {current.id === "blind" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#10233F]">
                          Proposal View Perspective:
                        </span>
                        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setAnonymizedView(false)}
                            className={`px-2.5 py-1 rounded ${!anonymizedView ? "bg-slate-800 text-white font-bold" : "text-slate-500"}`}
                          >
                            Raw Vendor
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnonymizedView(true)}
                            className={`px-2.5 py-1 rounded ${anonymizedView ? "bg-purple-600 text-white font-bold" : "text-slate-500"}`}
                          >
                            Double-Blind View
                          </button>
                        </div>
                      </div>

                      <div className="rounded border border-slate-200 bg-white p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Applicant Entity:</span>
                          <strong className={anonymizedView ? "text-purple-700 font-bold" : "text-slate-800"}>
                            {anonymizedView ? "ANON-VENTURE-7829 (Masked)" : "AquaSovereign Technologies Ltd"}
                          </strong>
                        </div>
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Founding Team:</span>
                          <strong className={anonymizedView ? "text-purple-700 font-bold" : "text-slate-800"}>
                            {anonymizedView ? "[IDENTITY REDACTED PER STATUTE]" : "Dr. Vikram Mehta & Team"}
                          </strong>
                        </div>
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Technical Rubric Weight:</span>
                          <strong className="text-emerald-700">100% Objective Merit</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Widget 4: Explainable AI 4-Pillar Score */}
                  {current.id === "xai" && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold text-[#D97706]">Deterministic Algorithm Score</span>
                        <strong className="text-slate-800">92 / 100 Benchmark</strong>
                      </div>
                      <div className="space-y-1.5 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span>Sector Alignment (Max 35)</span>
                          <span className="font-bold">35 pts</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-full" />
                        </div>

                        <div className="flex justify-between pt-1">
                          <span>Deep-Tech Capability Overlap (Max 35)</span>
                          <span className="font-bold">32 pts</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[91%]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Verifiable Guarantees (Checkmarks) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
                    Verifiable Sovereign Commitments:
                  </span>
                  <div className="space-y-1.5">
                    {current.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Statutory Citation */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-semibold text-[#10233F]">Statutory Authority:</span>
                  <span className="font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {current.statute}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Paradigm Comparison Matrix Table (Replaces generic cards with authoritative architectural proof) */}
          <div className="pt-8 space-y-4">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Architectural Benchmark
              </span>
              <h3 className="text-xl font-bold text-[#10233F] mt-1">
                Legacy Tenders vs. Pragati-GovX Sovereign Architecture
              </h3>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono text-[11px]">
                      <th className="py-3.5 px-5">Governance Dimension</th>
                      <th className="py-3.5 px-5 text-rose-700">Traditional Public Tenders</th>
                      <th className="py-3.5 px-5 text-[#0F766E] font-bold">Pragati-GovX Sovereign Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-semibold text-[#10233F]">Startup Financial Barrier</td>
                      <td className="py-3.5 px-5 text-slate-500">Rigid prior turnover & EMD deposit requirements</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-800">100% Statutory Exemption under GFR Rule 173(i)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-semibold text-[#10233F]">Milestone Payment SLA</td>
                      <td className="py-3.5 px-5 text-slate-500">120 to 180+ days indefinite treasury delays</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-800">Statutory 30-Day SLA with mandatory 3x compound interest</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-semibold text-[#10233F]">Evaluator Bias Protection</td>
                      <td className="py-3.5 px-5 text-slate-500">Subjective review with visible vendor identity</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-800">100% Double-Blind Anonymized Proposal Dossiers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-semibold text-[#10233F]">Forensic Audit Trail</td>
                      <td className="py-3.5 px-5 text-slate-500">Physical paper files prone to retroactive alterations</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-800">Cryptographic SHA-256 Non-Repudiation Ledger</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublicTransparencyPage;
