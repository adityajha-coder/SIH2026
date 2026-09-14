import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  Sparkles, 
  Rocket, 
  Layers,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Clock,
  Coins,
  Check,
  FileCheck,
  Activity,
  Award,
  ChevronRight,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroSectionImg from "@/assets/hero_section.png";
import { LegalCharterModal } from "@/components/common/LegalCharterModal";

const PROCUREMENT_PATHWAYS = [
  {
    key: "open-challenges",
    title: "Open Department Challenges",
    desc: "Problem statements and KPIs formulated by state departments with prior-turnover waivers.",
    ref: "GR No. MAT-2024/CR-88",
  },
  {
    key: "sandbox-protocols",
    title: "Sandbox & Pilot Protocols",
    desc: "90-day controlled municipal testbed deployments with air-gapped data boundaries.",
    ref: "MSInS Sandbox Guidelines",
  },
  {
    key: "turnover-exemption",
    title: "DPIIT Turnover Exemption Rule",
    desc: "100% waiver of minimum turnover and EMD deposit criteria for DPIIT startups.",
    ref: "GFR Rule 149 & 173(i)",
  },
  {
    key: "direct-pilots",
    title: "Direct Innovation Pilots",
    desc: "Fast-tracked municipal trial onboarding for high-TRL proprietary technologies.",
    ref: "Make in India Procurement Order",
  },
];

const GOVERNANCE_LEGAL = [
  {
    key: "maharashtra-policy",
    title: "Maharashtra Innovative Startup Policy",
    desc: "Statewide umbrella framework for public procurement quotas and patent fee subsidies.",
    ref: "GR No. 2018/CR-101/Ind-7",
  },
  {
    key: "ip-governance",
    title: "IP Rights & Data Governance Compact",
    desc: "Binding tripartite covenant ensuring startups retain 100% patent title and algorithms.",
    ref: "Section 9 Standard IP Compact",
  },
  {
    key: "dpdp-compliance",
    title: "DPDP Act 2023 Compliance",
    desc: "Cryptographic anonymization and lawful consent protocols for municipal citizen telemetry.",
    ref: "Act No. 22 of 2023",
  },
  {
    key: "coi-charter",
    title: "Conflict-of-Interest (COI) Charter",
    desc: "Mandatory double-blind evaluation integrity code with automated recusal protocols.",
    ref: "Public Procurement Ethics Code",
  },
];

const WORKFLOW_PAGES = [
  {
    id: "stage-01",
    phaseNumber: "01",
    phaseTag: "Stage 1 · Problem Formulation",
    shortTitle: "1. Outcome Challenges",
    title: "Outcome-Driven Challenges",
    subtitle: "Quantifiable field metrics replacing rigid 200-page tender specs",
    narrative:
      "Conventional public tenders lock early-stage innovators out through strict 3-year turnover prerequisites and high earnest money deposits (EMD). Pragati-GovX reformulates procurement around measurable field KPIs, giving eligible DPIIT startups direct access to state procurement without legacy bureaucratic barriers.",
    legalSafeguard: "Statutory Framework: Maharashtra GR 2024",
    pillars: [
      {
        title: "Statutory Eligibility Exemption",
        desc: "100% prior-turnover and EMD criteria waived for DPIIT-recognized ventures.",
      },
      {
        title: "Quantifiable Metric Contracts",
        desc: "Departments specify measurable outcomes (e.g. leak reduction) rather than proprietary tech specs.",
      },
      {
        title: "Direct Sandbox Grant",
        desc: "Pre-allocated municipal budget ring-fenced for rapid prototype execution.",
      },
    ],
    ctaText: "Explore Open Outcome Challenges",
    ctaLink: "/challenges",
    preview: {
      heading: "Municipal Challenge Brief",
      title: "Pune Municipal Corporation · Smart Utilities",
      problem: "AI-Powered Non-Revenue Water Loss & Leak Detection",
      statPrimary: "< 15%",
      statPrimaryLabel: "Target Network Loss (from 38.4%)",
      statSecondary: "₹25,00,000",
      statSecondaryLabel: "Sandbox Grant Allocation",
      points: [
        "90-Day Municipal Field Validation Trial",
        "EMD & prior-turnover criteria fully waived under GR 2024",
        "Non-exclusive government rights; startup retains 100% IP",
      ],
      note: "Problem formulated around verifiable telemetry metrics rather than proprietary hardware specifications.",
    },
  },
  {
    id: "stage-02",
    phaseNumber: "02",
    phaseTag: "Stage 2 · Impartial Match",
    shortTitle: "2. Explainable AI Match",
    title: "Double-Blind Algorithmic Evaluation",
    subtitle: "Zero commercial brand bias; 100% merit-based deterministic scoring",
    narrative:
      "To eliminate cronyism and legacy incumbent preference, all incoming submissions are automatically scrubbed of corporate logos and brand names. A deterministic 4-pillar scoring algorithm evaluates technical architecture, sector fit, and pilot feasibility before independent government evaluators convene in a consensus scoring room.",
    legalSafeguard: "Standard: Double-Blind Brand Masking",
    pillars: [
      {
        title: "Brand-Masked Submissions",
        desc: "Evaluators score anonymized dossiers without knowledge of company ownership.",
      },
      {
        title: "Deterministic 4-Pillar Weights",
        desc: "40% Technical Depth, 30% Field Feasibility, 30% Cost Discipline.",
      },
      {
        title: "Auditable Consensus Trail",
        desc: "Triple-evaluator alignment recorded on tamper-evident sovereign ledgers.",
      },
    ],
    ctaText: "Review Evaluation Rubric",
    ctaLink: "/policy",
    preview: {
      heading: "Evaluation Scorecard Preview",
      title: "Candidate #7829 (Identity Masked)",
      problem: "Double-blind evaluation conducted by 3 independent evaluators",
      statPrimary: "94.2 / 100",
      statPrimaryLabel: "Composite Evaluator Score",
      statSecondary: "Rank 1 of 18",
      statSecondaryLabel: "Proposals Evaluated",
      bars: [
        { name: "Technical Depth & Sensor Precision", score: "38 / 40", pct: 95 },
        { name: "Municipal Testbed Feasibility", score: "28 / 30", pct: 93 },
        { name: "Budget Discipline & Milestone Realism", score: "28.2 / 30", pct: 94 },
      ],
      note: "Evaluators assess purely technical merit without visibility into company founders, brand size, or corporate ties.",
    },
  },
  {
    id: "stage-03",
    phaseNumber: "03",
    phaseTag: "Stage 3 · Controlled Validation",
    shortTitle: "3. Sandbox Field Pilots",
    title: "Municipal Sandbox Pilots & IP Compacts",
    subtitle: "Live civic deployment backed by binding startup patent retention covenants",
    narrative:
      "Winners do not pitch slides in air-conditioned boardrooms—they deploy real hardware and algorithms into municipal assets (water pipelines, transit networks, civil hospitals). Pre-signed tripartite compacts protect startup patents with 100% intellectual property ownership retention while establishing air-gapped citizen data privacy boundaries.",
    legalSafeguard: "Protection: 100% Patent Retention Compact",
    pillars: [
      {
        title: "Guaranteed Patent Ownership",
        desc: "Startups retain 100% ownership of their algorithms, models, and code.",
      },
      {
        title: "Air-Gapped Municipal Access",
        desc: "Secure API boundaries isolate municipal infrastructure and citizen data.",
      },
      {
        title: "Live Field Telemetry Monitoring",
        desc: "Real-time performance metrics monitored jointly with municipal engineers.",
      },
    ],
    ctaText: "View Sandbox Pilot Framework",
    ctaLink: "/policy",
    preview: {
      heading: "Field Pilot Telemetry",
      title: "Ward 4 Water Distribution Network, Pune",
      problem: "Active 90-Day Municipal Controlled Sandbox Trial",
      statPrimary: "99.8%",
      statPrimaryLabel: "Sensor Field Uptime",
      statSecondary: "164,000 L",
      statSecondaryLabel: "Daily Water Saved",
      points: [
        "48 / 48 Acoustic sensors online and transmitting",
        "19 Pinhole distribution leaks detected and repaired",
        "Proprietary algorithms remain 100% startup property",
      ],
      note: "Pre-signed tripartite agreement secures municipal testing grounds while safeguarding all patent rights.",
    },
  },
  {
    id: "stage-04",
    phaseNumber: "04",
    phaseTag: "Stage 4 · Commercial Transition",
    shortTitle: "4. Scale-Up & 30-Day SLA",
    title: "Statewide Scale-Up & 30-Day Payment SLA",
    subtitle: "Direct GeM transition with statutory 30-day payment countdown clocks",
    narrative:
      "Successful pilots shouldn't be trapped in new procurement loops. Upon verified milestone sign-off, Pragati-GovX generates a certified Procurement Release Memo (PRM) recognized under GeM for direct commercial adoption across all 36 Maharashtra districts. Milestone disbursements are governed by a statutory 30-day countdown clock.",
    legalSafeguard: "Mandate: Statutory 30-Day Payment SLA",
    pillars: [
      {
        title: "Standardized Procurement Release Memo",
        desc: "Certified test results recognized across Maharashtra's 36 municipal councils.",
      },
      {
        title: "Statutory 30-Day Payment Clock",
        desc: "Legally mandated payment disbursement clock starts upon milestone sign-off.",
      },
      {
        title: "Direct GeM Onboarding",
        desc: "Fast-tracked listing as an approved sovereign innovation vendor.",
      },
    ],
    ctaText: "Inspect Scale & Payment Console",
    ctaLink: "/government/scale",
    preview: {
      heading: "State Escrow & Scale Ledger",
      title: "Procurement Release Memo PRM-2026-0891",
      problem: "Standardized procurement clearance for 36 Maharashtra districts",
      statPrimary: "30 Days",
      statPrimaryLabel: "Max Statutory Payment Clock",
      statSecondary: "100%",
      statSecondaryLabel: "Milestone Verification Audit",
      tranches: [
        { name: "Tranche 1: Mobilization (30%)", val: "₹7,50,000", status: "Disbursed" },
        { name: "Tranche 2: Field Trial (40%)", val: "₹10,00,000", status: "Disbursed" },
        { name: "Tranche 3: Acceptance (30%)", val: "₹7,50,000", status: "In Settlement" },
      ],
      note: "Automated disbursement releases payment within 30 days of municipal engineer sign-off.",
    },
  },
];

export function LandingPage() {
  const [activeLegalTerm, setActiveLegalTerm] = useState(null);

  return (
    <div className="space-y-16 pb-20">
      {/* Full-Screen Hero Section with Background Artwork */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[82vh] flex items-center overflow-hidden border-b border-[#E2E8F0] bg-[#F7F5F0]">
        {/* Background Image*/}
        <div className="absolute inset-0 z-0">
          <img
            src={heroSectionImg}
            alt="Maharashtra Innovation Procurement Platform Background"
            className="w-full h-full object-cover object-center lg:object-right filter contrast-[1.18] saturate-[1.20] brightness-[0.97]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F5F0]/95 via-[#F7F5F0]/60 to-transparent sm:from-[#F7F5F0]/90 sm:via-[#F7F5F0]/30 sm:to-transparent lg:w-[70%]" />
          {/* Bottom blend */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#F7F9FC] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-12 sm:py-20 w-full">
          <div className="max-w-2xl space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#10233F] tracking-tight leading-[1.12]">
              Sovereign Innovation Procurement <br />
              <span className="text-[#2563EB]">
                Designed for Startups.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#1E293B] leading-relaxed font-medium max-w-xl">
              Eliminating prior-turnover hurdles for eligible innovators. Empowering Maharashtra government departments to formulate outcome-based challenges, structure controlled sandbox pilots, and execute milestone-based contracts with automated payment SLAs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/challenges">
                <Button size="lg" className="gap-2 text-xs sm:text-sm font-semibold shadow-md">
                  Explore Open Challenges
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="text-xs sm:text-sm font-semibold border-[#CBD5E1] bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm">
                  Join as a Startup
                </Button>
              </Link>
              <Link to="/government/challenges/new">
                <Button variant="civic" size="lg" className="text-xs sm:text-sm font-semibold shadow-md">
                  Department Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Innovation Procurement Highway - Simple & Elegant Page Stack */}
      <section id="highway-workflow" className="mx-auto max-w-6xl px-4 sm:px-8 py-6 relative">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase">
            Four-Stage Sovereign Workflow
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#10233F] tracking-tight">
            The Innovation Procurement Highway
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Engineered to eliminate friction between conventional public bureaucracy and cutting-edge startup solutions.
          </p>

          {/* Quick-Jump Navigation Tabs (Clean, minimal, no badges) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 pt-3 text-xs font-medium text-slate-600">
            {WORKFLOW_PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(p.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
              >
                {p.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Page Stack Container (CSS Sticky Stacking Architecture) */}
        <div className="relative space-y-16 sm:space-y-24 pb-16">
          {WORKFLOW_PAGES.map((page, index) => (
            <div
              key={page.id}
              id={page.id}
              style={{
                top: `calc(5rem + ${index * 2.25}rem)`,
                zIndex: 10 + index,
              }}
              className="sticky rounded-3xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-16px_rgba(16,35,63,0.08)] p-6 sm:p-10 transition-all overflow-hidden"
            >
              {/* Top Step Header (Simple, elegant, zero badges) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-slate-100 gap-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl sm:text-4xl font-light text-slate-300 tracking-tight">
                    {page.phaseNumber}
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                      {page.phaseTag}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#10233F]">
                      {page.title}
                    </h3>
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {page.legalSafeguard}
                </span>
              </div>

              {/* Page Body: 2-Column Clean Layout */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6"
              >
                {/* Left Column: Narrative & Mechanisms */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      {page.subtitle}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {page.narrative}
                    </p>
                  </div>

                  {/* 3 Clean Structured Mechanisms */}
                  <div className="space-y-3 pt-1">
                    {page.pillars.map((pillar, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-start gap-3 py-1 text-slate-700"
                      >
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-[#10233F]">{pillar.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{pillar.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Link Button */}
                  <div className="pt-2">
                    <Link to={page.ctaLink}>
                      <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold text-[#10233F] border-slate-300 hover:bg-slate-50 shadow-sm">
                        <span>{page.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Clean, Light Executive Briefing Card (No Terminal, No Badges) */}
                <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-5">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {page.preview.heading}
                    </span>
                    <h4 className="text-sm font-bold text-[#10233F] mt-0.5">
                      {page.preview.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {page.preview.problem}
                    </p>
                  </div>

                  {/* High-Contrast Stat Pair */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
                      <span className="text-lg sm:text-xl font-bold text-[#10233F] block">
                        {page.preview.statPrimary}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {page.preview.statPrimaryLabel}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
                      <span className="text-lg sm:text-xl font-bold text-[#10233F] block">
                        {page.preview.statSecondary}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {page.preview.statSecondaryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Score Breakdown Bars (for Stage 2) */}
                  {page.preview.bars && (
                    <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
                      {page.preview.bars.map((bar, bIdx) => (
                        <div key={bIdx} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">{bar.name}</span>
                            <strong className="text-[#10233F]">{bar.score}</strong>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${bar.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tranches (for Stage 4) */}
                  {page.preview.tranches && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm divide-y divide-slate-100">
                      {page.preview.tranches.map((t, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-center text-xs py-1.5 first:pt-0 last:pb-0">
                          <span className="text-slate-600">{t.name}</span>
                          <span className="font-semibold text-[#10233F]">{t.val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullet Points (for Stage 1 & 3) */}
                  {page.preview.points && (
                    <div className="space-y-1.5 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm text-xs text-slate-600">
                      {page.preview.points.map((pt, ptIdx) => (
                        <div key={ptIdx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanatory Note */}
                  <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-200/70 pt-3">
                    {page.preview.note}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Procurement Pathways & Governance Architecture Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 py-6">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase">
            Legal Foundations &amp; Sovereign Mandates
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            Procurement Pathways &amp; Governance Charter
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Statutory frameworks, exemption rules, and data governance compacts protecting startups and enabling rapid civic procurement across Maharashtra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Procurement Pathways */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#10233F] uppercase">
                Procurement Pathways
              </h3>
              <span className="text-[11px] font-medium text-slate-400">4 Active Windows</span>
            </div>

            <div className="space-y-3">
              {PROCUREMENT_PATHWAYS.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setActiveLegalTerm(item.key)}
                  className="group p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all shadow-sm cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#10233F] group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Scale className="h-3 w-3 text-slate-400" />
                    <span>{item.ref}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Governance & Legal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#10233F] uppercase">
                Governance &amp; Legal
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Statutory Charters</span>
            </div>

            <div className="space-y-3">
              {GOVERNANCE_LEGAL.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setActiveLegalTerm(item.key)}
                  className="group p-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-300 hover:bg-teal-50/20 transition-all shadow-sm cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#10233F] group-hover:text-teal-700 transition-colors">
                      {item.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-slate-400" />
                    <span>{item.ref}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#10233F] to-[#1E3A65] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Statewide Interoperability
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Scaling Proven Solutions Across Maharashtra’s 36 Districts
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Successful pilots generate standardized Procurement Release Memos compatible with GeM (Government e-Marketplace) and State innovation mandates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/challenges">
              <Button variant="default" size="lg" className="bg-[#2563EB] hover:bg-blue-600 font-semibold text-sm">
                Browse Active Tenders
              </Button>
            </Link>
            <Link to="/policy">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10 text-sm">
                View Policy Framework
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Sovereign Legal Charter Modal */}
      <LegalCharterModal
        termKey={activeLegalTerm}
        isOpen={!!activeLegalTerm}
        onClose={() => setActiveLegalTerm(null)}
      />
    </div>
  );
}

export default LandingPage;
