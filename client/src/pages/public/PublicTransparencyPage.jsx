import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";

export function PublicTransparencyPage() {
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
                Open Government Data Portal
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
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#E2E8F0] shadow-sm bg-white p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Innovation Capital Committed</div>
              <div className="text-2xl font-bold font-mono text-[#10233F] mt-1.5">₹42.8 Crores</div>
              <div className="text-[11px] text-[#0F766E] mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Treasury Verified
              </div>
            </Card>

            <Card className="border-[#E2E8F0] shadow-sm bg-white p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Statewide District Coverage</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1.5">36 Districts</div>
              <div className="text-[11px] text-[#64748B] mt-1">All administrative divisions</div>
            </Card>

            <Card className="border-[#E2E8F0] shadow-sm bg-white p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">30-Day Payment SLA Adherence</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">98.4%</div>
              <div className="text-[11px] text-[#64748B] mt-1">Zero startup cash-flow delays</div>
            </Card>

            <Card className="border-[#E2E8F0] shadow-sm bg-white p-5">
              <div className="text-xs text-[#64748B] font-mono uppercase">Double-Blind Evaluations</div>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1.5">100% Bias-Free</div>
              <div className="text-[11px] text-[#64748B] mt-1">Anonymized applicant dossiers</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars of Public Trust */}
      <section className="py-10 bg-white border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB]">
              Governance Architecture
            </span>
            <h2 className="text-2xl font-bold text-[#10233F] mt-1">
              Four Guarantees of Sovereign Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#10233F]">
                1. Cryptographic Audit Immutability
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every administrative action generates a SHA-256 digital signature linked to the issuing officer's sovereign token, preventing retroactive edits or clandestine approvals.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#10233F]">
                2. Mandatory 30-Day Payment SLA
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Enforcing MSMED Act Section 15 and Maharashtra GR No. MAT-2024. Departments face statutory interest penalties if verified milestone deliverables are held beyond 30 days.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#10233F]">
                3. Double-Blind Meritocracy
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Empaneled evaluators grade technical proposals without knowing company identity, founder background, or political affiliation, strictly evaluating technical merit and feasibility.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#10233F]">
                4. Explainable AI Decisions
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                AI algorithms never act as sole arbiters. Every recommendation provides deterministic scoring breakdowns and citations, serving strictly as an advisory co-pilot to human nodal officers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublicTransparencyPage;
