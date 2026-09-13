import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProblem } from "@/hooks/useProblems";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  Landmark,
  Layers,
  MapPin,
  Printer,
  Rocket,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Building2,
  Coins,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// 36 Maharashtra Districts
const MAHARASHTRA_DIVISIONS = [
  {
    division: "Pune Division",
    districts: ["Pune", "Satara", "Sangli", "Solapur", "Kolhapur"],
  },
  {
    division: "Konkan Division",
    districts: ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
  },
  {
    division: "Nashik Division",
    districts: ["Nashik", "Dhule", "Jalgaon", "Nandurbar", "Ahmednagar"],
  },
  {
    division: "Chhatrapati Sambhaji Nagar",
    districts: ["Chhatrapati Sambhaji Nagar", "Jalna", "Parbhani", "Hingoli", "Nanded", "Beed", "Latur", "Dharashiv"],
  },
  {
    division: "Nagpur Division",
    districts: ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"],
  },
  {
    division: "Amravati Division",
    districts: ["Amravati", "Akola", "Yavatmal", "Buldhana", "Washim"],
  },
];

export function ScaleGateConsole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: problem, isLoading } = useProblem(id);

  const [selectedDistricts, setSelectedDistricts] = useState([
    "Pune",
    "Mumbai Suburban",
    "Nagpur",
    "Nashik",
  ]);

  const [pillarScores, setPillarScores] = useState({
    kpiImpact: 94,
    techFit: 90,
    cybersecurity: 98,
    economics: 88,
    procurementReadiness: 95,
  });

  const [isRatified, setIsRatified] = useState(false);
  const [budgetPerDistrict, setBudgetPerDistrict] = useState(35); // Lakhs
  const [officerNote, setOfficerNote] = useState(
    "Pilot trial outcomes rigorously validated by Technical Steering Committee. Recommendation approved for statewide expansion."
  );

  const problemTitle = problem?.title || "Real-Time Non-Revenue Water Loss Detection & Pressure Optimization";
  const departmentName = problem?.organizationId?.name || "Water Supply & Sanitation Department, Govt. of Maharashtra";
  const pilotVenture = "AquaSovereign Technologies Ltd";

  const totalScalingCorpus = (selectedDistricts.length * budgetPerDistrict).toFixed(1);

  const toggleDistrict = (district) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const handlePrintMemo = () => {
    window.print();
  };

  const handleRatifyScale = () => {
    setIsRatified(true);
    toast.success("Scale Gate Decision formally ratified! Procurement Sanction Memo generated.");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] pb-16">
      {/* Top Header */}
      <section className="border-b border-[#E2E8F0] bg-white print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link
                to="/government/dashboard"
                className="hover:text-[#2563EB] transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Department Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-mono text-slate-500">
                GATE-{id ? id.slice(-6).toUpperCase() : "SCALE"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-semibold text-[#10233F]">Scale Gate Decision Console</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-[#0F766E] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Maharashtra GR 14(a) Fast-Track Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner Card */}
        <Card className="border-[#E2E8F0] shadow-sm bg-white overflow-hidden print:hidden">
          <div className="bg-gradient-to-r from-[#10233F] to-[#1E3A8A] p-6 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
                    Scale Gate Authorization Console
                  </span>
                  <span className="font-mono text-[11px] text-teal-300">
                    Status: {isRatified ? "RATIFIED & SANCTIONED" : "AWAITING SANCTION"}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-white">
                  Statewide Procurement & Expansion Decision
                </h1>
                <p className="text-xs text-slate-300">
                  Challenge: <strong className="text-white">{problemTitle}</strong> &bull; Department: <span className="text-white">{departmentName}</span>
                </p>
              </div>

              <div className="rounded-lg border border-blue-400/30 bg-white/10 p-3.5 text-right backdrop-blur-sm min-w-[220px]">
                <div className="text-[11px] text-blue-200">Selected Pilot Solution</div>
                <div className="text-sm font-bold text-white mt-0.5">{pilotVenture}</div>
                <div className="text-[11px] text-teal-300 mt-1 font-mono">
                  Scale Gate Score: 93/100 (Unanimous)
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 5 Sovereign Assessment Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 print:hidden">
          <Card className="border-[#E2E8F0] bg-white p-3.5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>KPI Impact</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#10233F]">94%</div>
            <div className="text-[11px] text-[#64748B]">Water loss: -41.2%</div>
          </Card>

          <Card className="border-[#E2E8F0] bg-white p-3.5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Technical Fit</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#10233F]">90%</div>
            <div className="text-[11px] text-[#64748B]">API latency: 340ms</div>
          </Card>

          <Card className="border-[#E2E8F0] bg-white p-3.5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Cybersecurity</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#10233F]">98%</div>
            <div className="text-[11px] text-[#64748B]">CERT-In cleared</div>
          </Card>

          <Card className="border-[#E2E8F0] bg-white p-3.5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Economics</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#10233F]">88%</div>
            <div className="text-[11px] text-[#64748B]">42% LCC savings</div>
          </Card>

          <Card className="border-[#E2E8F0] bg-white p-3.5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>GeM Readiness</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#10233F]">95%</div>
            <div className="text-[11px] text-[#64748B]">Catalog onboarded</div>
          </Card>
        </div>

        {/* 2-Column Split: District Matrix & Sanction Order */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: District Expansion Matrix (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-bold text-[#10233F]">
                      Maharashtra District Scaling Matrix
                    </CardTitle>
                  </div>
                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedDistricts.length} of 36 Selected
                  </span>
                </div>
                <CardDescription className="text-xs text-[#64748B]">
                  Select administrative districts for pilot replication and direct commercial rollout.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Budget Slider */}
                <div className="space-y-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#10233F]">Allocated Corpus per District:</span>
                    <span className="font-mono font-bold text-blue-600">₹{budgetPerDistrict} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    step="5"
                    value={budgetPerDistrict}
                    onChange={(e) => setBudgetPerDistrict(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#64748B] font-mono pt-1">
                    <span>Total Scaling Allocation:</span>
                    <strong className="text-emerald-700 font-bold">₹{totalScalingCorpus} Lakhs</strong>
                  </div>
                </div>

                {/* Division Accordion / Lists */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {MAHARASHTRA_DIVISIONS.map((div) => (
                    <div key={div.division} className="space-y-1.5">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {div.division}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {div.districts.map((d) => {
                          const isSelected = selectedDistricts.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDistrict(d)}
                              className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-xs text-left transition-colors ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-900 font-semibold"
                                  : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">{d}</span>
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <span className="h-3 w-3 rounded border border-slate-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Official Procurement Decision Release Memo (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Memo Container (printable) */}
            <div className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Government Crest & Header */}
              <div className="text-center border-b-2 border-[#10233F] pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  <Landmark className="h-4 w-4 text-[#10233F]" />
                  Government of Maharashtra &bull; Public Procurement Sanction
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#10233F]">
                  STATE INNOVATION PROCUREMENT CLEARANCE MEMO
                </h2>
                <div className="text-xs text-[#64748B] font-mono">
                  Order Ref: GR-MSInS/2026/SCALEOUT-{id ? id.slice(-6).toUpperCase() : "88A92"} &bull; Date: 14 September 2026
                </div>
              </div>

              {/* Sanction Body */}
              <div className="text-xs text-[#1E293B] space-y-4 leading-relaxed">
                <div>
                  <strong>SANCTION AUTHORITY: </strong>
                  <span>High-Powered Steering Committee on Startup Innovation & Sovereign Procurement, Government of Maharashtra.</span>
                </div>

                <div>
                  <strong>BENEFICIARY VENTURE: </strong>
                  <span className="font-semibold">{pilotVenture} (DPIIT Recognized Startup &bull; Maharashtra Sandbox Cohort)</span>
                </div>

                <div>
                  <strong>CHALLENGE SCOPE: </strong>
                  <span>{problemTitle} ({departmentName})</span>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1 text-[11px]">
                  <div className="font-bold text-[#10233F]">STATUTORY PROCUREMENT EXEMPTION SANCTION:</div>
                  <p className="text-slate-600">
                    Having successfully satisfied all Sandbox KPI benchmarks (94% outcome fulfillment) and obtained CERT-In security clearance, the subject innovation is hereby cleared for direct public procurement under <strong>Maharashtra Procurement Rule 14(a)</strong> and <strong>General Financial Rules (GFR) Rule 149</strong>.
                  </p>
                </div>

                <div>
                  <strong className="block mb-1">AUTHORIZED EXPANSION DISTRICTS ({selectedDistricts.length}):</strong>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDistricts.map((d) => (
                      <span
                        key={d}
                        className="font-mono text-[11px] text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 text-[11px]">
                  <div>
                    <span className="text-[#64748B] block">Total Sanctioned Scale Corpus:</span>
                    <strong className="text-sm font-mono text-[#10233F]">₹{totalScalingCorpus} Lakhs</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Procurement Onboarding Route:</span>
                    <strong className="text-sm font-mono text-emerald-800">GeM Direct Purchase / L1 Waiver</strong>
                  </div>
                </div>

                {/* Signoff / Seal Block */}
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[11px] text-[#64748B]">
                  <div>
                    <div>Cryptographic Verification Seal:</div>
                    <div className="font-mono text-[10px] text-slate-500">
                      SHA256: 9f8a2c118e7b30aa447d912ef0881bc3
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#10233F]">Nodal Officer & Secretary</div>
                    <div>Department of Industries & MSInS</div>
                    <div>Government of Maharashtra</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (hidden on print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintMemo}
                className="text-xs h-9 gap-1.5 border-slate-300 text-[#10233F]"
              >
                <Printer className="h-4 w-4" />
                Print / Save Sanction Order
              </Button>

              {!isRatified ? (
                <Button
                  size="sm"
                  onClick={handleRatifyScale}
                  className="bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold h-9 px-5 gap-1.5 shadow-sm"
                >
                  <Rocket className="h-4 w-4" />
                  Ratify Scale Gate Decision & Issue Order
                </Button>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Sanction Issued & Notified to GeM
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScaleGateConsole;
