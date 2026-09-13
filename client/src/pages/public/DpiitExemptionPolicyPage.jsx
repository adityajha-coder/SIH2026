import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ShieldCheck,
  FileText,
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Building2,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Landmark,
} from "lucide-react";

export function DpiitExemptionPolicyPage() {
  const [hasDpiit, setHasDpiit] = useState(true);
  const [underTenYears, setUnderTenYears] = useState(true);
  const [indianOwnership, setIndianOwnership] = useState(true);
  const [turnoverUnder100Cr, setTurnoverUnder100Cr] = useState(true);
  const [trlFourPlus, setTrlFourPlus] = useState(true);

  const isEligible =
    hasDpiit && underTenYears && indianOwnership && turnoverUnder100Cr && trlFourPlus;

  const passedCount = [
    hasDpiit,
    underTenYears,
    indianOwnership,
    turnoverUnder100Cr,
    trlFourPlus,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F]">
      {/* Top Banner / Breadcrumb */}
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
              <span className="font-semibold text-[#10233F]">DPIIT Exemption Policy</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#0F766E] font-medium flex items-center">
                <ShieldCheck className="mr-1 h-3 w-3" /> GFR Rule 149 &amp; 173(i)
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[#2563EB] font-medium">
                GR No. MAT-2024/CR-88/Ind-7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#10233F] py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <Landmark className="h-3.5 w-3.5 text-blue-400" />
              Government of Maharashtra • Sovereign Procurement Sandbox
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              DPIIT Statutory Exemption Policy Framework
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              Removing archaic barriers for verified Indian startups. Certified ventures compete on{" "}
              <strong className="text-white font-semibold">technical merit, pilot performance, and innovation capability</strong>{" "}
              rather than prior financial turnover or legacy vendor qualifications.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/challenges">
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-md">
                  Explore Open Challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register?role=STARTUP_USER">
                <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Register Startup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Statutory Waivers */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2">
            Statutory Protections
          </p>
          <h2 className="text-2xl font-bold text-[#10233F] sm:text-3xl">
            The Three Sovereign Procurement Waivers
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Mandated under Maharashtra Innovative Startup Policy 2026 &amp; Central GFR Guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Waiver 1 */}
          <Card className="border border-[#E2E8F0] shadow-sm hover:border-[#2563EB]/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] mb-2">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#2563EB]">
                GFR Rule 173(i)
              </span>
              <CardTitle className="text-lg font-bold text-[#10233F] mt-1">
                Zero Prior Turnover
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#64748B]">
              <p>
                Departments <strong className="text-[#10233F]">cannot mandate</strong> a minimum annual balance sheet turnover or balance requirement for pilot trials or phase-1 challenge contracts.
              </p>
              <div className="rounded-md bg-slate-50 p-2.5 text-xs border border-slate-200">
                <span className="font-semibold text-[#10233F]">Statutory Scope:</span> Pilot sandboxes up to ₹50 Lakhs &amp; proof-of-concept milestone grants.
              </div>
            </CardContent>
          </Card>

          {/* Waiver 2 */}
          <Card className="border border-[#E2E8F0] shadow-sm hover:border-[#0F766E]/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-[#0F766E] mb-2">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#0F766E]">
                MoF OM F.20/2/2014-PPD
              </span>
              <CardTitle className="text-lg font-bold text-[#10233F] mt-1">
                Zero Prior Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#64748B]">
              <p>
                No requirement for previous government supply contracts, historical client references, or years of operational vintage. Startups are scored strictly on <strong className="text-[#10233F]">solution design and technical readiness</strong>.
              </p>
              <div className="rounded-md bg-slate-50 p-2.5 text-xs border border-slate-200">
                <span className="font-semibold text-[#10233F]">Statutory Scope:</span> Solves the "chicken-and-egg" barrier for deep-tech innovators.
              </div>
            </CardContent>
          </Card>

          {/* Waiver 3 */}
          <Card className="border border-[#E2E8F0] shadow-sm hover:border-amber-500/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">
                Public Procurement Order 2017
              </span>
              <CardTitle className="text-lg font-bold text-[#10233F] mt-1">
                100% EMD Exemption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#64748B]">
              <p>
                Earnest Money Deposit (EMD) and Bid Security fees are <strong className="text-[#10233F]">entirely waived</strong>. Startups do not need to lock working capital in bank guarantees or tender deposit cheques.
              </p>
              <div className="rounded-md bg-slate-50 p-2.5 text-xs border border-slate-200">
                <span className="font-semibold text-[#10233F]">Statutory Scope:</span> Valid DPIIT recognition certificate acts as automatic bank security.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Exemption Checker */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Controls */}
          <div className="lg:col-span-7">
            <Card className="border border-[#E2E8F0] shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#10233F]">
                      Statutory Exemption Self-Audit
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Test your venture's compliance against the mandatory statutory hard gates.
                    </CardDescription>
                  </div>
                  <span className="text-xs font-bold text-[#10233F]">
                    {passedCount}/5 Requirements Met
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gate 1 */}
                <label className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasDpiit}
                    onChange={(e) => setHasDpiit(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <div className="flex-1 text-xs sm:text-sm">
                    <span className="font-semibold text-[#10233F] block">
                      1. DPIIT Recognition Number (DIPPxxxxxx)
                    </span>
                    <span className="text-[#64748B]">
                      Active certificate issued by the Department for Promotion of Industry and Internal Trade.
                    </span>
                  </div>
                </label>

                {/* Gate 2 */}
                <label className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={underTenYears}
                    onChange={(e) => setUnderTenYears(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <div className="flex-1 text-xs sm:text-sm">
                    <span className="font-semibold text-[#10233F] block">
                      2. Entity Vintage Under 10 Years
                    </span>
                    <span className="text-[#64748B]">
                      Incorporated as Private Limited, LLP, or Registered Partnership within the last 10 years.
                    </span>
                  </div>
                </label>

                {/* Gate 3 */}
                <label className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={indianOwnership}
                    onChange={(e) => setIndianOwnership(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <div className="flex-1 text-xs sm:text-sm">
                    <span className="font-semibold text-[#10233F] block">
                      3. Sovereign Indian Shareholding (&ge; 51%)
                    </span>
                    <span className="text-[#64748B]">
                      Majority beneficial ownership and voting power held by Indian resident citizens.
                    </span>
                  </div>
                </label>

                {/* Gate 4 */}
                <label className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={turnoverUnder100Cr}
                    onChange={(e) => setTurnoverUnder100Cr(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <div className="flex-1 text-xs sm:text-sm">
                    <span className="font-semibold text-[#10233F] block">
                      4. Annual Turnover &le; ₹100 Crores
                    </span>
                    <span className="text-[#64748B]">
                      Has not exceeded ₹100 Crore turnover in any preceding financial year since inception.
                    </span>
                  </div>
                </label>

                {/* Gate 5 */}
                <label className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={trlFourPlus}
                    onChange={(e) => setTrlFourPlus(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <div className="flex-1 text-xs sm:text-sm">
                    <span className="font-semibold text-[#10233F] block">
                      5. Technology Readiness Level (TRL &ge; 4)
                    </span>
                    <span className="text-[#64748B]">
                      Functional prototype validated in laboratory or simulated field operational conditions.
                    </span>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Verdict Box */}
          <div className="lg:col-span-5">
            <Card
              className={`border-2 transition-all ${
                isEligible
                  ? "border-[#0F766E] bg-teal-50/40"
                  : "border-amber-400 bg-amber-50/40"
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  {isEligible ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F766E] text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg font-bold text-[#10233F]">
                      {isEligible
                        ? "100% Statutory Exemption Granted"
                        : "Conditional or Incomplete Gates"}
                    </CardTitle>
                    <span className="text-xs font-mono text-[#64748B]">
                      Verification Hash: PRAGATI-STAT-2026
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs sm:text-sm">
                {isEligible ? (
                  <>
                    <p className="text-[#0F766E] font-medium leading-relaxed">
                      Your venture fulfills all statutory criteria under the Maharashtra Innovative Startup Policy 2026. You are legally entitled to:
                    </p>
                    <ul className="space-y-2 text-[#10233F]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#0F766E] shrink-0" />
                        <span>Exemption from Prior Turnover clauses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#0F766E] shrink-0" />
                        <span>Exemption from Prior Experience mandates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#0F766E] shrink-0" />
                        <span>Zero EMD / Tender Security requirement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#0F766E] shrink-0" />
                        <span>Protected 30-Day Milestone Payment SLA</span>
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/challenges">
                        <Button className="w-full bg-[#0F766E] hover:bg-[#0D655E] text-white">
                          Browse Eligible Challenges
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-amber-800 leading-relaxed">
                      One or more statutory hard gates are unmet. Traditional procurement rules (turnover thresholds, past performance tender criteria) will apply until full DPIIT validation is linked to your account.
                    </p>
                    <div className="rounded-md bg-amber-100/60 p-3 text-xs text-amber-900 border border-amber-200">
                      <strong>Tip:</strong> Complete your Startup Passport at{" "}
                      <Link to="/startup/profile" className="underline font-semibold">
                        /startup/profile
                      </Link>{" "}
                      to automatically pull DPIIT certificate records via API Setu.
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Statutory SLA Card */}
            <Card className="mt-4 border border-[#E2E8F0] shadow-sm">
              <CardContent className="pt-5 space-y-3 text-xs text-[#64748B]">
                <div className="flex items-center gap-2 text-[#10233F] font-semibold text-sm">
                  <Clock className="h-4 w-4 text-[#2563EB]" />
                  Statutory 30-Day Payment SLA
                </div>
                <p>
                  Maharashtra Sandbox pilots operate under a legally binding <strong>30-day milestone disbursement compact</strong>. Upon joint field officer signoff on milestone evidence, departmental treasury disburses funds within 30 days without bureaucratic retendering.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Official Government Gazettes & Mandates */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-[#E2E8F0]">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Legal Citations
          </p>
          <h3 className="text-xl font-bold text-[#10233F] mt-1">
            Official Gazettes &amp; Departmental Circulars
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="font-mono text-[#2563EB] font-bold block mb-1">
              GFR 2017 • Rule 149 (v)
            </span>
            <p className="text-[#64748B] mb-2">
              Government e-Marketplace (GeM) &amp; Public Procurement relaxation for recognized startups in all public procurements.
            </p>
            <span className="text-[11px] text-slate-400">Ministry of Finance, GoI</span>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="font-mono text-[#0F766E] font-bold block mb-1">
              GR No. MAT-2024/CR-88/Ind-7
            </span>
            <p className="text-[#64748B] mb-2">
              Mandatory inclusion of startups in departmental sandbox procurement trials across Maharashtra Municipal Corporations &amp; Zilla Parishads.
            </p>
            <span className="text-[11px] text-slate-400">Industries &amp; IT Dept, Govt. of Maharashtra</span>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="font-mono text-amber-700 font-bold block mb-1">
              DPIIT Notification G.S.R. 127(E)
            </span>
            <p className="text-[#64748B] mb-2">
              Statutory definition of startup entity, 10-year validity window, and intellectual property exemption safeguards.
            </p>
            <span className="text-[11px] text-slate-400">Gazette of India, Extraordinary</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DpiitExemptionPolicyPage;
