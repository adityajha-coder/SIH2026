import React, { useState } from "react";
import { Link } from "react-router-dom";

export function AboutPage() {
  const [role, setRole] = useState("startup"); // 'startup' | 'government' | 'validator'

  // Dynamic theme definitions:
  // Startup: soft orange + website white
  // Government: soft green + website white
  // Validator: soft purple + website white
  const themeStyles = {
    startup: {
      activeTab: "bg-orange-50 text-orange-800 border-orange-300 font-semibold",
      inactiveTab: "bg-white text-slate-600 border-slate-200 hover:bg-orange-50/50 hover:text-orange-900",
      accentLine: "border-orange-500",
      heading: "text-orange-950",
      subheading: "text-orange-800",
      badge: "border-orange-200 bg-orange-50 text-orange-800",
      highlightBorder: "border-orange-200",
      bulletNumber: "text-orange-700 bg-orange-100/70 border border-orange-200",
      statutoryBg: "bg-orange-50/40 border-orange-200 text-orange-950",
    },
    government: {
      activeTab: "bg-green-50 text-green-800 border-green-300 font-semibold",
      inactiveTab: "bg-white text-slate-600 border-slate-200 hover:bg-green-50/50 hover:text-green-900",
      accentLine: "border-green-600",
      heading: "text-green-950",
      subheading: "text-green-800",
      badge: "border-green-200 bg-green-50 text-green-800",
      highlightBorder: "border-green-200",
      bulletNumber: "text-green-700 bg-green-100/70 border border-green-200",
      statutoryBg: "bg-green-50/40 border-green-200 text-green-950",
    },
    validator: {
      activeTab: "bg-purple-50 text-purple-800 border-purple-300 font-semibold",
      inactiveTab: "bg-white text-slate-600 border-slate-200 hover:bg-purple-50/50 hover:text-purple-900",
      accentLine: "border-purple-600",
      heading: "text-purple-950",
      subheading: "text-purple-800",
      badge: "border-purple-200 bg-purple-50 text-purple-800",
      highlightBorder: "border-purple-200",
      bulletNumber: "text-purple-700 bg-purple-100/70 border border-purple-200",
      statutoryBg: "bg-purple-50/40 border-purple-200 text-purple-950",
    },
  };

  const currentTheme = themeStyles[role];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-8">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 hover:underline">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">About Pragati-GovX</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 space-y-8">
        
        {/* Top Header Block with 3 Perspective Options Vertically in the Top Right Corner */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                SIH 2026 PS 26136
              </span>
              <span className="border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                GFR Rule 173(i)
              </span>
              <span className="border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                MSMED Act 30-Day SLA
              </span>
              <span className="border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                Double-Blind Protocol
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              About Pragati-GovX
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Sovereign Innovation Sandbox and Agile Public Procurement Gateway for the Government of Maharashtra.
            </p>
          </div>

          {/* Top Right Corner: 3 Perspective Selectors stacked vertically */}
          <div className="shrink-0 space-y-1.5">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider text-left md:text-right">
              Read Perspective:
            </div>
            <div className="flex flex-col rounded-lg border border-slate-200 p-1 bg-slate-50 gap-1 text-xs w-full sm:w-44">
              <button
                type="button"
                onClick={() => setRole("startup")}
                className={`w-full text-left px-3 py-1.5 rounded transition-all cursor-pointer border ${
                  role === "startup"
                    ? themeStyles.startup.activeTab
                    : themeStyles.startup.inactiveTab
                }`}
              >
                Startup
              </button>

              <button
                type="button"
                onClick={() => setRole("government")}
                className={`w-full text-left px-3 py-1.5 rounded transition-all cursor-pointer border ${
                  role === "government"
                    ? themeStyles.government.activeTab
                    : themeStyles.government.inactiveTab
                }`}
              >
                Government
              </button>

              <button
                type="button"
                onClick={() => setRole("validator")}
                className={`w-full text-left px-3 py-1.5 rounded transition-all cursor-pointer border ${
                  role === "validator"
                    ? themeStyles.validator.activeTab
                    : themeStyles.validator.inactiveTab
                }`}
              >
                Validator
              </button>
            </div>
          </div>
        </div>

        {/* Current Perspective Context Summary Banner */}
        <div className={`p-4 border rounded-lg text-xs leading-relaxed ${currentTheme.statutoryBg}`}>
          {role === "startup" && (
            <p>
              <strong>Startup Perspective:</strong> You are reading the full platform guide tailored for DPIIT-recognized
              founders, innovators, and MSMEs. This guide details how you can discover public sector challenges, bypass prior
              turnover hurdles via GFR 173(i), submit verified technical proposals, execute supervised field trials, and receive
              guaranteed milestone payments under the statutory 30-day SLA.
            </p>
          )}
          {role === "government" && (
            <p>
              <strong>Government Perspective:</strong> You are reading the operational guide for departmental nodal officers,
              procurement executives, and municipal commissioners. This guide outlines how departments formulate outcome-based
              challenges, leverage explainable AI candidate matching, manage field trials, supervise milestones, and issue 36-district
              commercial scaling sanction orders for GeM onboarding.
            </p>
          )}
          {role === "validator" && (
            <p>
              <strong>Validator Perspective:</strong> You are reading the operational protocol for technical evaluation committee
              members, academic researchers, and accredited domain specialists. This guide explains how you receive assigned submissions,
              execute statutory Conflict-of-Interest (COI) recusal, conduct double-blind scoring, and cross-reference multi-model AI consensus audits.
            </p>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STARTUP PERSPECTIVE CONTENT (Linear, Straight, No Cards, Soft Orange) */}
        {/* ========================================================================= */}
        {role === "startup" && (
          <div className="space-y-10 text-xs leading-relaxed text-slate-700">
            
            {/* Section 1: The Core Problem for Startups */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                1. Breaking the Traditional Tender Barrier
              </h2>
              <p>
                In conventional government procurement, innovative startups are almost universally locked out by rigid
                financial and operational criteria. Public tenders routinely demand ₹5 Cr to ₹50 Cr in prior annual turnover
                and 3 or more years of proven past execution in government environments. These conditions favor legacy system
                integrators over modern, high-performance technology providers.
              </p>
              <p>
                Pragati-GovX enforces <strong>General Financial Rules (GFR) Rule 173(i)</strong> and the <strong>Maharashtra
                Innovative Startup Policy</strong>. Under this legal framework:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li>
                  <strong>Prior Turnover is 100% Waived:</strong> Startups do not need to show prior financial revenue to bid on challenges.
                </li>
                <li>
                  <strong>Past Government Experience is Waived:</strong> You are judged solely on your technical capability, solution architecture, and ability to meet the defined outcome targets.
                </li>
                <li>
                  <strong>100% EMD Exemption:</strong> Recognized ventures are completely exempt from paying Earnest Money Deposits (EMD) or tender document fees.
                </li>
              </ul>
            </section>

            {/* Section 2: Registration & The Startup Passport */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                2. Registration &amp; The Startup Passport
              </h2>
              <p>
                To participate, startups register with their verified official details and establish a <strong>Startup Passport</strong>.
                The Passport centralizes statutory credentials in one place:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>DPIIT Recognition Number:</strong> Entering your valid DIPP / DPIIT registration number automatically activates
                  the GFR 173(i) prior-turnover exemption tag across all platform submissions.
                </p>
                <p>
                  <strong>Technology Readiness Level (TRL):</strong> Self-declare your current maturity from TRL-3 (Analytical Proof of Concept)
                  to TRL-9 (Proven Commercial System).
                </p>
                <p>
                  <strong>Sector &amp; Capability Tags:</strong> Specify active domains such as Water Resource Management, Clean Energy,
                  Healthcare Telemetry, Urban Mobility, Cybersecurity, or Agritech. These tags feed directly into the departmental matching algorithm.
                </p>
                <p>
                  <strong>Team &amp; IP Holdings:</strong> Declare patents filed or granted, proprietary source code ownership, and core technical team qualifications.
                </p>
              </div>
            </section>

            {/* Section 3: Challenge Discovery & Pre-Check */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                3. Challenge Discovery &amp; Deterministic Pre-Check
              </h2>
              <p>
                Startups browse verified operational problem statements posted by Maharashtra departments, municipal corporations,
                and state nodal agencies. Each challenge clearly lists:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                <li>Operational pain points and current manual or legacy failure modes.</li>
                <li>Quantifiable target KPIs (e.g. reduction of non-revenue water loss from 38% to under 15%).</li>
                <li>Target administrative districts across Maharashtra's 36 districts.</li>
                <li>Pilot duration (typically 90 days) and total milestone budget allocation.</li>
              </ul>
              <p>
                Before drafting a proposal, you can run the <strong>Deterministic Pre-Check</strong> widget to instantly confirm
                that your entity satisfies the statutory criteria, TRL requirements, and sector scope without manual staff review.
              </p>
            </section>

            {/* Section 4: Proposal Authoring & S3 Cryptographic Vault */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                4. Proposal Authoring &amp; S3 Cryptographic Vault
              </h2>
              <p>
                Proposals are submitted through a structured 4-step wizard designed to eliminate subjective marketing fluff and
                focus on engineering rigor:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Step 1 — Technical Architecture:</strong> Describe how your solution functions, including data ingestion,
                  sensor hardware, firmware, API protocols, edge processing, and integration with government databases.
                </p>
                <p>
                  <strong>Step 2 — Measurable Outcome Commitments:</strong> Define explicit, measurable values for the target KPIs
                  stipulated in the challenge.
                </p>
                <p>
                  <strong>Step 3 — Field Pilot Implementation Plan:</strong> Detail the 90-day deployment roadmap across mobilization,
                  field testing, calibration, and acceptance sign-off.
                </p>
                <p>
                  <strong>Step 4 — Evidence Vault &amp; Browser-Side Hashing:</strong> Upload architectural schematics, test certificates,
                  and simulation data. Your browser computes a <strong>SHA-256 integrity hash</strong> directly via the Web Cryptography API
                  before streaming the file directly to the Sovereign S3 Storage Vault via presigned URLs. This guarantees that your proprietary
                  documents cannot be altered, substituted, or tampered with retrospectively.
                </p>
              </div>
            </section>

            {/* Section 5: Double-Blind Anonymization & AI Audit */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                5. Double-Blind Anonymization &amp; Fair Evaluation
              </h2>
              <p>
                Once submitted, your proposal enters a double-blind evaluation environment. The platform automatically scrubs company
                names, founder identities, and commercial branding, replacing them with a sovereign anonymous code (e.g. <code>ANON-VENTURE-7842</code>).
              </p>
              <p>
                Evaluators cannot see who you are, eliminating brand favoritism, political bias, or vendor familiarity. They score
                purely on four weighted pillars: Problem-Solution Fit (30%), Innovation &amp; TRL (25%), Technical Feasibility (25%),
                and Measurable Outcome Impact (20%).
              </p>
              <p>
                In parallel, a live <strong>3-Model Anti-Cascade AI Pipeline</strong> (Google Gemini 3.6 Flash, Groq, and OpenRouter)
                analyzes your technical claims against attached evidence, checking for unverified assertions or physical impossibilities
                and producing an objective advisory report for the committee.
              </p>
            </section>

            {/* Section 6: Sandbox Field Pilot & 30-Day SLA Payment Ledger */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                6. Sandbox Field Pilot &amp; 30-Day SLA Payment Ledger
              </h2>
              <p>
                Winning proposals enter the <strong>Pilot Canvas</strong> workspace. This is a legally recognized 90-day sandbox trial
                governed by a structured 3-milestone compact:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li>
                  <strong>Tranche 1 (Mobilization &amp; Sandbox Setup — 30%):</strong> Disbursed upon charter signing, security container setup, and baseline calibration.
                </li>
                <li>
                  <strong>Tranche 2 (Mid-Term Field Validation — 40%):</strong> Disbursed upon deploying nodes in the target district and submitting verified telemetry logs to the S3 vault.
                </li>
                <li>
                  <strong>Tranche 3 (Final Acceptance &amp; Security Signoff — 30%):</strong> Disbursed upon achieving the target outcome benchmarks and passing audit.
                </li>
              </ul>
              <p>
                <strong>Statutory 30-Day Payment SLA:</strong> Under Section 15 of the MSMED Act 2006 and Maharashtra GR No. MAT-2024/CR-88/Ind-7,
                government entities are legally required to disburse approved milestones within 30 days. The Pilot Canvas features a live
                SLA countdown clock. If an invoice lapses beyond 30 days, the platform alerts nodal authorities and computes statutory interest liability.
              </p>
            </section>

            {/* Section 7: Commercial Scale & GeM Onboarding */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-orange-500">
                7. Statewide Scale Gate &amp; GeM Onboarding
              </h2>
              <p>
                Upon successful completion of the pilot, the department conducts a formal Scale Gate assessment. If verified, the system
                generates an official <strong>Procurement Sanction Order Memo (GR-MSInS/2026/...)</strong> recommending your solution for
                rapid direct onboarding to the Government e-Marketplace (GeM) and commercial scaling across all 36 Maharashtra districts.
              </p>
            </section>

            {/* Section 8: Quick Summary of Startup Benefits */}
            <section className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Summary of Startup Protections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <div className="border-l-2 border-orange-400 pl-3">
                  <strong>Zero Tender Fees:</strong> No EMD, no tender purchase cost, no processing deposits.
                </div>
                <div className="border-l-2 border-orange-400 pl-3">
                  <strong>Protected IP:</strong> Web Crypto SHA-256 hashing and S3 direct upload protect your proprietary IP.
                </div>
                <div className="border-l-2 border-orange-400 pl-3">
                  <strong>Fair Blind Scoring:</strong> Evaluators review your engineering, not your brand or background.
                </div>
                <div className="border-l-2 border-orange-400 pl-3">
                  <strong>Guaranteed Payout Timelines:</strong> Automated MSMED Act 30-day statutory SLA enforcement.
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================================= */}
        {/* GOVERNMENT PERSPECTIVE CONTENT (Linear, Straight, No Cards, Soft Green) */}
        {/* ========================================================================= */}
        {role === "government" && (
          <div className="space-y-10 text-xs leading-relaxed text-slate-700">
            
            {/* Section 1: The Administrative Objective */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                1. Outcome-Driven Public Problem Formulation
              </h2>
              <p>
                Traditional government tenders typically draft 100-page Request for Proposal (RFP) documents specifying exact
                hardware models, vendor certifications, and rigid implementation methods. By the time tenders are finalized, the
                technology is often obsolete, and the procuring entity has committed large capital budgets without verified field performance.
              </p>
              <p>
                Pragati-GovX shifts procurement to <strong>outcome-based problem statements</strong>. Departmental nodal officers,
                secretaries, and municipal engineers define <em>what problem must be solved and what target outcome must be achieved</em>,
                inviting startups to propose modern, innovative solutions under controlled sandbox conditions.
              </p>
            </section>

            {/* Section 2: The Challenge Studio */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                2. Formulating Challenges in the Challenge Studio
              </h2>
              <p>
                Nodal officers author problem statements through the 5-step <strong>Challenge Studio</strong>:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Step 1 — Problem Narrative &amp; Sector Domain:</strong> Describe the operational challenge faced by the department,
                  current failure modes, regulatory constraints, and applicable sector domains (e.g. Urban Water, Telemetry, Public Health).
                </p>
                <p>
                  <strong>Step 2 — Quantifiable Baseline vs Target KPIs:</strong> Outcome-based procurement requires measurable targets.
                  Enter the current operational baseline (e.g. 42% road surface degradation or 1,800 ms response time) and the required
                  pilot target (e.g. under 15% degradation or under 300 ms response time).
                </p>
                <p>
                  <strong>Step 3 — District Geography &amp; Procurement Path:</strong> Select target Maharashtra administrative districts
                  (from all 36 districts grouped by division: Pune, Konkan, Nashik, Chhatrapati Sambhaji Nagar, Nagpur, Amravati) and select
                  the procurement track (Direct Innovation Pilot, Challenge Procurement, or Scale-Up).
                </p>
                <p>
                  <strong>Step 4 — Mandatory Hard Gates:</strong> Toggle the statutory GFR Rule 173(i) prior-turnover exemption, define
                  the minimum acceptable Technology Readiness Level (e.g. TRL-5 or higher), and specify required technical standards.
                </p>
                <p>
                  <strong>Step 5 — Innovation Compact &amp; Milestone Budgets:</strong> Define the 90-day sandbox pilot budget, milestone
                  deliverables, and commit to the MSMED Act 30-day payment SLA schedule.
                </p>
              </div>
              <p>
                The studio features a real-time <strong>Challenge Readiness Meter (0–100)</strong> that validates that all necessary
                statutory fields are populated before publishing to the public innovation catalog.
              </p>
            </section>

            {/* Section 3: Explainable AI Candidate Discovery */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                3. Explainable AI Candidate Discovery &amp; Matching
              </h2>
              <p>
                Government officers can leverage the <strong>Explainable AI Matcher</strong> to discover capable startups immediately
                upon publishing a challenge. The matcher evaluates four deterministic pillars:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li><strong>Sector Alignment (35 pts):</strong> Semantic overlap between the challenge domain and startup specializations.</li>
                <li><strong>Capability Overlap (35 pts):</strong> Match between the department's technical requirements and the startup's verified IP, patents, and tech stack.</li>
                <li><strong>Maturity &amp; TRL Alignment (15 pts):</strong> Suitability of the startup's current readiness level for the required deployment environment.</li>
                <li><strong>DPIIT Recognition Status (15 pts):</strong> Verified registration under the central startup recognition framework.</li>
              </ul>
              <p>
                The matcher produces a detailed point-wise advisory explanation breaking down verified claims, operational risk flags,
                and technical committee interrogation points so officers understand <em>why</em> a candidate was recommended.
              </p>
            </section>

            {/* Section 4: Evaluation Management & COI Enforcement */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                4. Evaluation Oversight &amp; Double-Blind Integrity
              </h2>
              <p>
                Department administrators assign submissions to independent, accredited domain evaluators. To maintain complete public
                probity and audit compliance:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Double-Blind Anonymization:</strong> Officers and evaluators assess submissions stripped of vendor branding.
                  This protects departments against legal allegations of favoritism or tender tailoring.
                </p>
                <p>
                  <strong>Mandatory Statutory COI Gate:</strong> No evaluator can access scoring until signing a legal declaration
                  confirming zero commercial, financial, or familial ties to any participant.
                </p>
                <p>
                  <strong>Multi-Model AI Anti-Cascade Report:</strong> Officers review independent consensus findings from Gemini 3.6 Flash,
                  Groq, and OpenRouter, cross-checking technical feasibility without surrendering human executive decision-making.
                </p>
              </div>
            </section>

            {/* Section 5: Field Sandbox Pilot & 30-Day SLA Governance */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                5. Sandbox Field Pilot Governance &amp; Payment Compliance
              </h2>
              <p>
                When a startup is selected, the department enters into a 90-day sandbox charter on the <strong>Pilot Canvas</strong>:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Real-Time Telemetry &amp; Evidence Review:</strong> Startups submit milestone deliverables, sensor datasets,
                  and test reports directly into the S3 vault. Officers review SHA-256 verified documents and confirm that benchmarks are met.
                </p>
                <p>
                  <strong>Statutory 30-Day SLA Countdown:</strong> To comply with Section 15 of the MSMED Act and Maharashtra Government
                  Resolutions, officers track a live countdown for each invoice. The system alerts finance sections to prevent delayed payment
                  penalties and maintain public sector credibility.
                </p>
                <p>
                  <strong>Controlled Finite Risk:</strong> If a startup fails to meet milestone criteria during Phase 1 or Phase 2, the department
                  can pause or terminate the trial, limiting total financial exposure to the agreed milestone tranche rather than an entire multi-year contract.
                </p>
              </div>
            </section>

            {/* Section 6: Scale Gate Console & Statewide Procurement */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-green-600">
                6. Scale Gate Console &amp; Official Sanction Orders
              </h2>
              <p>
                Following successful pilot verification, the department uses the <strong>Scale Gate Console</strong> to execute a 5-pillar
                procurement assessment (KPI Achievement, Technical Robustness, Cybersecurity, Financial Viability, and Scale Readiness).
              </p>
              <p>
                Officers can select target districts across Maharashtra's 36 districts, aggregate multi-district scaling budgets, and
                generate an official <strong>Government Sanction Order Memo (GR-MSInS/2026/...)</strong> bearing the official state reference.
                This memo serves as the statutory foundation for direct procurement onboarding via GeM without re-tendering.
              </p>
            </section>

            {/* Section 7: Summary of Government Benefits */}
            <section className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Summary of Departmental Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <div className="border-l-2 border-green-500 pl-3">
                  <strong>Outcome-Focused:</strong> Pay only for verified results and proven operational metrics.
                </div>
                <div className="border-l-2 border-green-500 pl-3">
                  <strong>De-Risked Budgets:</strong> 30/40/30 tranches limit financial exposure to proven milestones.
                </div>
                <div className="border-l-2 border-green-500 pl-3">
                  <strong>Audit Probity:</strong> Double-blind scoring and SHA-256 logs provide complete defense against procurement scrutiny.
                </div>
                <div className="border-l-2 border-green-500 pl-3">
                  <strong>Rapid Scale:</strong> Seamless transition from pilot proof to 36-district statewide procurement.
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VALIDATOR PERSPECTIVE CONTENT (Linear, Straight, No Cards, Soft Purple) */}
        {/* ========================================================================= */}
        {role === "validator" && (
          <div className="space-y-10 text-xs leading-relaxed text-slate-700">
            
            {/* Section 1: The Evaluator Mandate */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                1. Independent Technical Evaluation Mandate
              </h2>
              <p>
                Technical evaluators serve as independent domain specialists, university professors, research directors, and senior
                engineers tasked with conducting objective, evidence-based technical reviews of startup submissions.
              </p>
              <p>
                In standard public procurement, technical committees frequently face procedural ambiguity, incomplete proposals, and
                undue pressure from established vendor reputations. Pragati-GovX equips evaluators with a controlled, double-blind
                digital environment that isolates technical merit from corporate influence.
              </p>
            </section>

            {/* Section 2: Queue Management & Statutory COI Gate */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                2. Evaluation Queue &amp; Mandatory Statutory COI Gate
              </h2>
              <p>
                Upon logging in, evaluators see the <strong>Evaluations Queue</strong> displaying assigned submissions with sector tags,
                statutory review deadlines, and anonymous identifiers:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Anonymized Records:</strong> You see only codes such as <code>ANON-VENTURE-3920</code>. The platform hides corporate names,
                  founder identities, addresses, and marketing collateral.
                </p>
                <p>
                  <strong>Statutory Conflict of Interest (COI) Charter:</strong> Before unlocking any proposal dossier, you must complete the
                  mandatory COI declaration. You must legally affirm that neither you nor your immediate family hold equity, advisory roles,
                  consulting contracts, or commercial relationships with any party involved in the challenge. If a conflict exists, a single-click
                  recusal mechanism instantly reallocates the submission to an alternate evaluator without penalty.
                </p>
              </div>
            </section>

            {/* Section 3: The Evaluation Room Dossier Scrutiny */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                3. Technical Dossier Scrutiny in the Evaluation Room
              </h2>
              <p>
                Inside the <strong>Evaluation Room</strong>, evaluators inspect a standardized technical dossier structured into three core sections:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Technical Architecture &amp; Methodology:</strong> Detailed blueprints explaining data flows, edge hardware,
                  encryption standards, integration APIs, and deployment dependencies.
                </p>
                <p>
                  <strong>Outcome Commitments:</strong> Specific quantitative commitments made by the applicant against the challenge's
                  departmental baseline (e.g. reducing water telemetry latency from 1,800 ms to under 250 ms).
                </p>
                <p>
                  <strong>S3 Evidence Vault Artifacts:</strong> Cryptographically verified attachments, including lab test certificates,
                  third-party benchmarks, and simulation logs. Evaluators can download and inspect original files, knowing their SHA-256 hash
                  was calculated at the moment of upload.
                </p>
              </div>
            </section>

            {/* Section 4: 4-Pillar Weighted Rubric Scoring */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                4. 4-Pillar Weighted Rubric Scoring (0–100 Scale)
              </h2>
              <p>
                To eliminate arbitrary grading, evaluators score submissions using a calibrated 4-pillar rubric. Scores are entered
                via responsive precision sliders, computing real-time sub-scores and dynamic radar visual comparisons:
              </p>
              <div className="space-y-2 pl-3 border-l border-slate-200">
                <p>
                  <strong>Pillar 1: Problem-Solution Fit &amp; Architecture (Weight: 30% — Max 30 pts):</strong> Evaluates whether the proposed
                  technical architecture directly addresses the department's core failure modes and operational constraints.
                </p>
                <p>
                  <strong>Pillar 2: Technical Innovation &amp; TRL Maturity (Weight: 25% — Max 25 pts):</strong> Evaluates patent defensibility,
                  proprietary novelty, and whether the declared Technology Readiness Level (TRL) matches the proposed field trial scope.
                </p>
                <p>
                  <strong>Pillar 3: Feasibility, Team &amp; Implementation Methodology (Weight: 25% — Max 25 pts):</strong> Evaluates the credibility
                  of the 90-day sandbox deployment schedule, risk mitigation measures, and engineering competence.
                </p>
                <p>
                  <strong>Pillar 4: Measurable Outcome Impact &amp; Economics (Weight: 20% — Max 20 pts):</strong> Evaluates cost-effectiveness,
                  scalability across Maharashtra's 36 districts, and projected public ROI.
                </p>
              </div>
              <p>
                Evaluators must provide mandatory written qualitative justification for each pillar, documenting specific technical strengths
                and identifiable vulnerabilities.
              </p>
            </section>

            {/* Section 5: Live Multi-Model AI Consensus Audit */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                5. Live Multi-Model AI Anti-Cascade Consensus Audit
              </h2>
              <p>
                Evaluators can trigger the <strong>Live AI Anti-Cascade Verification</strong> directly within the evaluation room.
                This multi-model pipeline serves as an independent technical scrutiny aide:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li>
                  <strong>Layer 1 (Generator — Google Gemini 3.6 Flash):</strong> Scans the entire submission against canonical evidence, producing an initial advisory breakdown.
                </li>
                <li>
                  <strong>Layer 2 (Independent Verifier — Groq LLaMA-3.3 70B):</strong> Subject to anti-cascade isolation, it reviews the original proposal plus Layer 1 findings to challenge unsupported claims or logical inconsistencies.
                </li>
                <li>
                  <strong>Layer 3 (Arbitration — OpenRouter / Ollama Fallback):</strong> Synthesizes consensus, flags unverified technical claims, and computes a confidence score.
                </li>
              </ul>
              <p>
                The AI consensus produces an objective advisory report highlighting specific areas that warrant scrutiny during committee review.
                The AI never casts a binding vote; human expert judgment remains sovereign.
              </p>
            </section>

            {/* Section 6: Scorecard Finalization & Forensic Audit */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-l-4 pl-3 border-purple-600">
                6. Scorecard Finalization &amp; Forensic Immutability
              </h2>
              <p>
                When an evaluator submits their scorecard, the evaluation record is cryptographically sealed in the database.
                The submission cannot be altered, overwritten, or retracted. The record receives an immutable audit trace ID,
                preserving an unassailable forensic record for the Comptroller and Auditor General (CAG) or state vigilance authorities.
              </p>
            </section>

            {/* Section 7: Summary of Evaluator Safeguards */}
            <section className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Summary of Evaluator Protections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <div className="border-l-2 border-purple-500 pl-3">
                  <strong>Total Anonymity:</strong> Double-blind masking eliminates vendor pressure and brand bias.
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <strong>Legal Immunity via COI:</strong> Formal recusal workflow insulates evaluators from conflict-of-interest allegations.
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <strong>Objective Rubrics:</strong> 4 calibrated pillars prevent arbitrary grading disputes.
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <strong>AI Fact-Checking:</strong> 3-model consensus assists in catching inflated technical claims.
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Global Statutory Footer Note (Clean, Linear, No Cards) */}
        <div className="border-t border-slate-200 pt-6 text-[11px] text-slate-500 leading-relaxed space-y-1">
          <p>
            <strong>Statutory Reference:</strong> Smart India Hackathon 2026 Problem Statement 26136. Operationalized under
            Government of Maharashtra Resolution No. MAT-2024/CR-88/Ind-7, General Financial Rules Rule 173(i), and Section 15 of the MSMED Act 2006.
          </p>
          <p>
            All submitted evidence, telemetry logs, and evaluation scorecards are stored with SHA-256 integrity verification.
          </p>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;
