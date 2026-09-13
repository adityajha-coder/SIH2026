import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Rocket,
  ShieldCheck,
  Scale,
  Clock,
  Layers,
  Coins,
  FileText,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Download,
  Building2,
} from "lucide-react";

export function PilotFrameworkPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [budgetSlider, setBudgetSlider] = useState(25); // Lakhs

  const tranche1 = (budgetSlider * 0.3).toFixed(1);
  const tranche2 = (budgetSlider * 0.4).toFixed(1);
  const tranche3 = (budgetSlider * 0.3).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F]">
      {/* Breadcrumb Header */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link to="/" className="hover:text-[#2563EB] transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/challenges" className="hover:text-[#2563EB] transition-colors">
                Public Discovery
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-[#10233F]">Sandbox Pilot Framework</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#0F766E] font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                MAH-SANDBOX-REG-2024
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
              <Landmark className="h-3.5 w-3.5" />
              Government of Maharashtra Sovereign Sandbox
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#10233F]">
              Field Pilot Sandbox & Statutory Milestone SLA Framework
            </h1>
            <p className="text-base text-[#64748B] leading-relaxed">
              Under the Maharashtra State Innovation Procurement Sandbox Regulations, approved startups deploy live solutions in real municipal and district environments with protected intellectual property, ring-fenced liability, and a legally binding 30-day milestone payment guarantee.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/challenges">
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 px-5 shadow-sm">
                  Explore Active Sandbox Challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button variant="outline" className="border-[#CBD5E1] text-[#10233F] text-xs font-semibold h-10 px-4">
                  Tranche Disbursement Calculator
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <Card className="border-[#E2E8F0] shadow-sm bg-white hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#10233F]">
                  30-Day Statutory Payment SLA
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  MSMED Act Sec. 15 & State GR Enforced
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-[#475569] space-y-2.5">
                <p>
                  Once an agreed sandbox deliverable is audited and accepted by the Nodal Officer, Maharashtra state treasury rules mandate disbursement within <strong>30 calendar days</strong>.
                </p>
                <div className="rounded border border-blue-100 bg-blue-50/50 p-2.5 font-mono text-[11px] text-blue-900">
                  Compounded monthly interest at 3x RBI bank rate applies to departmental payment delays beyond 45 days.
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-[#E2E8F0] shadow-sm bg-white hover:border-teal-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Ring-Fenced IP Protection
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  100% Startup Patent & Code Sovereignty
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-[#475569] space-y-2.5">
                <p>
                  Deploying inside state infrastructure does not forfeit your proprietary algorithms. The Government receives a non-exclusive pilot evaluation license while background IP remains 100% startup property.
                </p>
                <div className="rounded border border-teal-100 bg-teal-50/50 p-2.5 font-mono text-[11px] text-teal-900">
                  Standard Innovation Compact Section 7: Safe-harbor from regulatory penalties during sandbox testing.
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-[#E2E8F0] shadow-sm bg-white hover:border-emerald-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Direct Scale-Up Pathway
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  GeM & State Public Procurement Transition
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-[#475569] space-y-2.5">
                <p>
                  Successful pilots fulfilling all baseline KPIs receive an official <strong>State Innovation Certificate</strong>, unlocking non-competitive direct procurement contracts up to ₹50 Lakhs across 36 districts.
                </p>
                <div className="rounded border border-emerald-100 bg-emerald-50/50 p-2.5 font-mono text-[11px] text-emerald-900">
                  Eligible under Maharashtra Procurement Rule 14(a) for single-source replication in other municipal bodies.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4-Stage Lifecycle Process */}
      <section className="py-8 bg-white border-y border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB]">
              Sandbox Architecture
            </span>
            <h2 className="text-2xl font-bold text-[#10233F] mt-1">
              The 4-Stage Pilot Sandbox Lifecycle
            </h2>
            <p className="text-xs text-[#64748B] mt-2">
              From contract sanction to live civic deployment and district-wide commercial scaling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs font-mono font-bold text-blue-600 mb-1">STAGE 01</div>
              <h3 className="text-sm font-bold text-[#10233F]">Pilot Proposed & Charter</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Department Nodal Officer and Startup finalize the Sandbox Charter, locking baseline vs target KPIs, test geography, and data integration boundaries.
              </p>
              <div className="mt-4 text-[11px] font-mono text-[#0F766E] font-medium">
                Milestone 1: 30% Advance
              </div>
            </div>

            <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs font-mono font-bold text-teal-600 mb-1">STAGE 02</div>
              <h3 className="text-sm font-bold text-[#10233F]">Active Field Deployment</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Live field hardware/software deployment across target Maharashtra districts. Real-time telemetry, user trial telemetry, and mid-term audit.
              </p>
              <div className="mt-4 text-[11px] font-mono text-[#0F766E] font-medium">
                Milestone 2: 40% Tranche
              </div>
            </div>

            <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs font-mono font-bold text-indigo-600 mb-1">STAGE 03</div>
              <h3 className="text-sm font-bold text-[#10233F]">Verification & Audit</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Empaneled Technical Evaluators and Department Officers audit telemetry against promised KPIs and CERT-In security sign-off.
              </p>
              <div className="mt-4 text-[11px] font-mono text-[#0F766E] font-medium">
                Milestone 3: 30% Final
              </div>
            </div>

            <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="text-xs font-mono font-bold text-emerald-600 mb-1">STAGE 04</div>
              <h3 className="text-sm font-bold text-[#10233F]">State-Wide Scale</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Issue of State Procurement Clearance Memo. Integration with GeM Sahay and fast-tracked rollout to all 36 Maharashtra administrative divisions.
              </p>
              <div className="mt-4 text-[11px] font-mono text-[#059669] font-medium">
                Commercial Contract Scale
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tranche Calculator */}
      <section id="calculator" className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-bold text-[#10233F]">
                  Interactive Milestone Tranche & 30-Day SLA Simulator
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#64748B]">
                Calculate exact statutory disbursements and SLA release triggers based on your pilot contract value.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-[#10233F]">
                    Total Pilot Sandbox Budget (Corpus):
                  </label>
                  <span className="text-base font-mono font-bold text-[#2563EB]">
                    ₹{budgetSlider} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#64748B] font-mono mt-1">
                  <span>₹5 Lakhs (Micro-pilot)</span>
                  <span>₹50 Lakhs (Standard Sandbox)</span>
                  <span>₹100 Lakhs (Flagship Mission)</span>
                </div>
              </div>

              {/* Tranche Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
                    <span>Tranche 1 (M1)</span>
                    <span className="font-mono">30%</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#10233F]">₹{tranche1}L</div>
                  <div className="text-[11px] text-[#64748B] mt-2">
                    <strong>Trigger:</strong> Sandbox Charter signing & cloud/hardware provisioning.
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                    <Clock className="h-3 w-3" /> Day 1–15 SLA
                  </div>
                </div>

                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                  <div className="flex items-center justify-between text-xs text-teal-700 font-semibold mb-1">
                    <span>Tranche 2 (M2)</span>
                    <span className="font-mono">40%</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#10233F]">₹{tranche2}L</div>
                  <div className="text-[11px] text-[#64748B] mt-2">
                    <strong>Trigger:</strong> Live field test telemetry verification with &ge;100 users.
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                    <Clock className="h-3 w-3" /> 30-Day SLA Window
                  </div>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold mb-1">
                    <span>Tranche 3 (M3)</span>
                    <span className="font-mono">30%</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#10233F]">₹{tranche3}L</div>
                  <div className="text-[11px] text-[#64748B] mt-2">
                    <strong>Trigger:</strong> Final KPI audit verification & CERT-In security sign-off.
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded">
                    <Clock className="h-3 w-3" /> 30-Day SLA Window
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Statutory Non-Discretionary Payment Guarantee
                </div>
                <p className="text-[11px] leading-relaxed">
                  In accordance with Maharashtra Finance Department Circular FIN-2023/SLA-30, once deliverables are marked verified by the designated nodal officer, financial approval and NEFT/RTGS release is automated through the sovereign treasury integration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Official Gazette Legal References */}
      <section className="py-10 bg-white border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-6">
            <h3 className="text-lg font-bold text-[#10233F]">Official Gazette & Statutory References</h3>
            <p className="text-xs text-[#64748B]">
              Legal citations under which the Pragati-GovX sandbox pilot framework operates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#E2E8F0] p-4 text-xs space-y-2">
              <div className="font-bold text-[#10233F] flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Maharashtra State Innovation Society Sandbox Policy
              </div>
              <p className="text-[#64748B]">
                Government Resolution No. MAT-2024/CR-88/Ind-7 dated 14th June 2024. Establishes the legal sandbox framework for public sector pilot procurement.
              </p>
              <div className="text-[11px] font-mono text-[#2563EB]">
                Citation: MSInS / Reg. 2024 / Sec 4(2)
              </div>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] p-4 text-xs space-y-2">
              <div className="font-bold text-[#10233F] flex items-center gap-2">
                <Scale className="h-4 w-4 text-teal-600" />
                MSMED Act Section 15 — Payment Protection
              </div>
              <p className="text-[#64748B]">
                Mandatory statutory provision imposing a 45-day outer limit and 30-day departmental SLA for payments to micro and small enterprises, with mandatory compound interest for delays.
              </p>
              <div className="text-[11px] font-mono text-[#0F766E]">
                Citation: Central Act No. 27 of 2006
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PilotFrameworkPage;
