import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const POLICY_SECTIONS = [
  { id: "turnover-exemption", label: "DPIIT Turnover Exemption (Rule 173(i))" },
  { id: "maharashtra-policy", label: "Maharashtra Startup Policy" },
  { id: "ip-governance", label: "IP Rights & Data Governance" },
  { id: "dpdp-compliance", label: "DPDP Act 2023 Compliance" },
  { id: "coi-charter", label: "Conflict-of-Interest (COI) Charter" },
];

export function DpiitExemptionPolicyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "turnover-exemption";

  const setSection = (id) => {
    setSearchParams({ section: id });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Link to="/" className="hover:text-[#2563EB] hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link to="/challenges" className="hover:text-[#2563EB] hover:underline">
              Challenges
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Governance &amp; Statutory Policy</span>
          </div>
        </div>
      </div>

      {/* Policy Category Navigation Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-2 sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            {POLICY_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSection(sec.id)}
                className={`px-3 py-1.5 rounded font-medium shrink-0 transition-colors cursor-pointer ${
                  activeSection === sec.id
                    ? "bg-[#10233F] text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 space-y-8 shadow-xs">
          
          {/* Section 1: DPIIT Turnover Exemption */}
          {activeSection === "turnover-exemption" && (
            <>
              {/* Document Header */}
              <header className="border-b border-slate-200 pb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Government of Maharashtra • Department of Industries, Energy and Labour
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  DPIIT Startup Procurement Exemption Policy
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Statutory guidelines on prior turnover exemption, prior experience waiver, and milestone payment guarantees for recognized startups participating in public procurement and departmental innovation sandboxes.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
                  <span>Order No: MAT-2024/CR-88/Ind-7</span>
                  <span>•</span>
                  <span>GFR 2017: Rule 149(v) &amp; Rule 173(i)</span>
                  <span>•</span>
                  <span>DPIIT: G.S.R. 127(E)</span>
                </div>
              </header>

              {/* Policy Overview */}
              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  Overview &amp; Purpose
                </h2>
                <p>
                  Under Government Resolution No. MAT-2024/CR-88/Ind-7 and Central General Financial Rules (GFR 2017), startups recognized by the Department for Promotion of Industry and Internal Trade (DPIIT) are granted statutory exemptions from traditional public procurement barriers.
                </p>
                <p>
                  This policy ensures that innovative Indian enterprises are evaluated strictly on their technical capability, solution design, and pilot performance, rather than historical financial turnover or prior government contracting experience.
                </p>
              </section>

              {/* Key Exemptions */}
              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  1. Core Procurement Exemptions
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Prior Turnover Exemption (GFR 2017, Rule 173(i)):</strong> Procuring departments and agencies cannot mandate a minimum annual balance sheet turnover, average revenue, or net worth threshold for recognized startups applying for innovation challenges or pilot trials.
                  </li>
                  <li>
                    <strong>Prior Experience Waiver (Ministry of Finance OM F.20/2/2014-PPD):</strong> Startups do not need past government work orders, client completion certificates, or specified years of commercial operation. Proposals are evaluated on technical design, prototype demonstration, and delivery methodology.
                  </li>
                  <li>
                    <strong>Earnest Money Deposit (EMD) Waiver (GFR 2017, Rule 170(i)):</strong> Complete exemption from submitting Earnest Money Deposit (EMD) or bid security fees. Startups only need to sign a digital Bid Securing Declaration.
                  </li>
                  <li>
                    <strong>Zero Application Fees:</strong> Challenge dossiers, RFP documentation, and portal access are provided completely free of charge. No scrutiny or registration fees are permitted.
                  </li>
                </ul>
              </section>

              {/* Eligibility Criteria */}
              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  2. Eligibility Criteria (Who Qualifies)
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>DPIIT Recognition:</strong> Must hold an active Certificate of Recognition issued by DPIIT (Ministry of Commerce &amp; Industry, Government of India).
                  </li>
                  <li>
                    <strong>Entity Vintage:</strong> Incorporated or registered within the last 10 years as a Private Limited Company, Limited Liability Partnership (LLP), or Registered Partnership Firm.
                  </li>
                  <li>
                    <strong>Turnover Limit:</strong> Total annual turnover must not have exceeded ₹100 Crores in any financial year since incorporation.
                  </li>
                  <li>
                    <strong>Indian Ownership:</strong> At least 51% of equity ownership, voting rights, and beneficial interest must be held directly by Indian resident citizens.
                  </li>
                  <li>
                    <strong>Technology Readiness (TRL 4+):</strong> The proposed solution must have reached at least Technology Readiness Level 4, with a functional prototype validated in laboratory or simulated field conditions.
                  </li>
                  <li>
                    <strong>Clean Standing:</strong> The entity, founders, and directors must not be debarred, blacklisted, or undergoing insolvency proceedings.
                  </li>
                </ol>
              </section>

              {/* Sandbox to Scale */}
              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  3. Sandbox Pilot &amp; Direct Procurement Scale-Out
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Departmental Sandbox Trials:</strong> Selected startups enter a direct pilot agreement with the issuing government department with funding up to ₹50 Lakhs to deploy and validate their solution in real-world conditions.
                  </li>
                  <li>
                    <strong>Direct Commercial Scaling (Rule 14-A):</strong> Under Maharashtra Public Procurement Rule 14-A, solutions that successfully achieve their pilot milestone KPIs can be procured directly by state departments and municipal corporations without re-tendering.
                  </li>
                  <li>
                    <strong>GeM Fast-Track Onboarding:</strong> Proven solutions are fast-tracked onto the Government e-Marketplace (GeM) Startup Runway portal, enabling single-source procurement across public sector entities nationwide.
                  </li>
                </ul>
              </section>

              {/* 30-Day Payment SLA */}
              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  4. Statutory 30-Day Milestone Payment SLA
                </h2>
                <p className="text-slate-700">
                  Under Section 15 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, payment releases for approved sandbox milestones must occur within <strong>30 calendar days</strong> of joint field verification signoff.
                </p>
                <div className="pl-4 border-l-2 border-slate-300 space-y-1 text-slate-600 text-xs">
                  <p>• <strong>Tranche 1 (30%):</strong> Disbursed upon charter agreement signing and sandbox environment setup.</p>
                  <p>• <strong>Tranche 2 (40%):</strong> Disbursed upon mid-term field verification and 50% target KPI fulfillment.</p>
                  <p>• <strong>Tranche 3 (30%):</strong> Disbursed upon final outcome validation and cybersecurity clearance.</p>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Statutory Delay Penalty (MSMED Act, Section 16):</strong> Any departmental delay beyond 30 days legally requires payment of compound interest with monthly rests at 3 times the RBI Bank Rate.
                </p>
              </section>
            </>
          )}

          {/* Section 2: Maharashtra Innovative Startup Policy */}
          {activeSection === "maharashtra-policy" && (
            <>
              <header className="border-b border-slate-200 pb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Government of Maharashtra • Department of Skills, Employment, Entrepreneurship and Innovation
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Maharashtra Innovative Startup Policy
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The comprehensive statutory policy umbrella governing innovation procurement, incubation hubs, seed grants, and intellectual property reimbursement across all 36 districts of Maharashtra.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
                  <span>GR No: 2018/CR-101/Ind-7</span>
                  <span>•</span>
                  <span>Maharashtra State Innovation Society (MSInS)</span>
                  <span>•</span>
                  <span>Civic Tech Procurement Window</span>
                </div>
              </header>

              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  Policy Framework &amp; Objectives
                </h2>
                <p>
                  The Maharashtra Innovative Startup Policy aims to establish Maharashtra as the premier destination for technology entrepreneurship in South Asia. The policy establishes dedicated civic sandbox testbeds and mandates government agencies to pilot indigenous innovations.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Departmental Pilot Quota:</strong> State departments and municipal corporations are directed to set aside discretionary pilot budgets specifically to evaluate startup products against public infrastructure challenges.
                  </li>
                  <li>
                    <strong>Patent &amp; IPR Reimbursement:</strong> 100% financial reimbursement for filing domestic patents (up to ₹2 Lakhs) and international patents (up to ₹10 Lakhs) under the Maharashtra Patent Reimbursement Scheme.
                  </li>
                  <li>
                    <strong>Quality Certification Support:</strong> Full reimbursement of testing and certification costs incurred at CERT-In, NABL, BIS, or equivalent accredited government laboratories.
                  </li>
                  <li>
                    <strong>Statewide Reciprocity:</strong> Pilot validations completed in any one municipal corporation (e.g., BMC, PMC, NMMC) are legally recognized statewide without requiring repetitive proof-of-concept tests.
                  </li>
                </ul>
              </section>
            </>
          )}

          {/* Section 3: IP Rights & Data Governance Compact */}
          {activeSection === "ip-governance" && (
            <>
              <header className="border-b border-slate-200 pb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  State Tripartite Innovation Compact • Legal Framework
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Intellectual Property &amp; Data Governance Compact
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A binding statutory covenant guaranteeing that startups retain 100% ownership of their patents, trade secrets, algorithms, and source code during and after municipal sandbox trials.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
                  <span>Section 9: Tripartite Compact</span>
                  <span>•</span>
                  <span>Indian Patents Act, 1970</span>
                  <span>•</span>
                  <span>Copyright Act, 1957</span>
                </div>
              </header>

              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  IP Rights &amp; Non-Disclosure Covenants
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>100% Retained Ownership:</strong> All pre-existing background IP and foreground IP developed by the startup during the pilot remain the sole property of the startup.
                  </li>
                  <li>
                    <strong>Limited Evaluation License:</strong> Procuring departments receive only a non-exclusive, non-sublicensable evaluation license strictly limited to the agreed pilot testing duration and geographic testbed.
                  </li>
                  <li>
                    <strong>Prohibition of Reverse Engineering:</strong> Department officers and government contractors are strictly prohibited from de-compiling, copying, or reverse-engineering startup software code or hardware assemblies.
                  </li>
                  <li>
                    <strong>RTI Exemption:</strong> Technical architecture schematics, trade secrets, and commercial algorithms are protected from disclosure under Section 8(1)(d) of the Right to Information (RTI) Act.
                  </li>
                </ul>
              </section>
            </>
          )}

          {/* Section 4: DPDP Act 2023 Compliance */}
          {activeSection === "dpdp-compliance" && (
            <>
              <header className="border-b border-slate-200 pb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  National Privacy Architecture • Data Protection Framework
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Digital Personal Data Protection (DPDP) Act Compliance
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Statutory privacy standards ensuring all citizen telemetry, urban sensor data, and municipal digital records processed during startup pilots comply with national privacy legislation.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
                  <span>Act No. 22 of 2023 (DPDP Act)</span>
                  <span>•</span>
                  <span>MeitY Sovereign Cloud Standard</span>
                  <span>•</span>
                  <span>CERT-In Cyber Guidelines</span>
                </div>
              </header>

              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  Data Governance Protocols for Civic Pilots
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Mandatory Anonymization:</strong> All citizen identifiers (Aadhaar, mobile numbers, vehicle registrations) must be cryptographically masked at the municipal boundary gateway before reaching startup processing pipelines.
                  </li>
                  <li>
                    <strong>Sovereign Data Localization:</strong> All telemetry data and databases must reside on cloud data centers located within the Republic of India empaneled by the Ministry of Electronics and Information Technology (MeitY).
                  </li>
                  <li>
                    <strong>Zero Permanent Storage of PII:</strong> Startups are prohibited from retaining raw citizen personal data beyond the specific ephemeral compute required to execute pilot KPIs.
                  </li>
                  <li>
                    <strong>Tamper-Evident Access Logs:</strong> Every API call touching municipal production datasets is immutably logged with SHA-256 cryptographic hashes for forensic auditability.
                  </li>
                </ul>
              </section>
            </>
          )}

          {/* Section 5: Conflict-of-Interest (COI) Charter */}
          {activeSection === "coi-charter" && (
            <>
              <header className="border-b border-slate-200 pb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maharashtra Public Procurement Ethics Code • Statutory Standards
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Statutory Conflict-of-Interest (COI) Charter
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A mandatory code of conduct legally binding all government evaluators, technical panel chairs, and municipal supervisors to ensure double-blind integrity and total merit-based selection.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
                  <span>Procurement Ethics Directive 2024</span>
                  <span>•</span>
                  <span>Double-Blind Scoring Protocol</span>
                  <span>•</span>
                  <span>Anti-Bias Safeguard</span>
                </div>
              </header>

              <section className="space-y-3 text-sm leading-relaxed">
                <h2 className="text-lg font-bold text-slate-900">
                  Evaluator Integrity &amp; Double-Blind Requirements
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Digital COI Declaration:</strong> Before scoring any proposal dossier, every technical evaluator must formally sign a digital declaration confirming zero financial, advisory, or familial relationship with the applicant.
                  </li>
                  <li>
                    <strong>Mandatory Recusal:</strong> If an evaluator identifies any potential relationship or prior advisory involvement with an applicant, they must execute immediate recusal, triggering automated reassignment to an alternative panel expert.
                  </li>
                  <li>
                    <strong>Double-Blind Proposal Masking:</strong> During initial technical scoring, proposal dossiers have all corporate logos, brand trademarks, and founder names masked into sovereign anonymous identifiers (e.g., ANON-VENTURE-4921).
                  </li>
                  <li>
                    <strong>Audit Trail &amp; Whistleblower Protection:</strong> Evaluator scorecards and consensus votes are cryptographically logged with immutable timestamps. Whistleblower reporting channels are available under MSInS for any reported scoring bias.
                  </li>
                </ul>
              </section>
            </>
          )}

          {/* Official Gazette & Legal Citations Table */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              Statutory Gazette &amp; Legal Citations
            </h2>
            <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Maharashtra GR No. MAT-2024/CR-88/Ind-7</span>
                <span className="text-slate-500">Department of Industries, Government of Maharashtra</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">GFR 2017 • Rule 149(v) and Rule 173(i)</span>
                <span className="text-slate-500">Ministry of Finance, Department of Expenditure, GoI</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">DPIIT Notification G.S.R. 127(E)</span>
                <span className="text-slate-500">Ministry of Commerce and Industry, Government of India</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">MSMED Act 2006 • Section 15 &amp; Section 16</span>
                <span className="text-slate-500">Parliament of India (Statutory Payment SLA)</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Digital Personal Data Protection Act, 2023</span>
                <span className="text-slate-500">Ministry of Law and Justice, Government of India</span>
              </div>
            </div>
          </section>

          {/* Inquiries & Application Support */}
          <section className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">
              Inquiries &amp; Policy Assistance
            </h2>
            <p>
              For questions regarding DPIIT recognition, sandbox trial protocols, or policy interpretations, contact the Maharashtra State Innovation Society (MSInS) policy desk at <span className="font-mono text-slate-800">support.msins@maharashtra.gov.in</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/challenges"
                className="inline-block rounded bg-[#10233F] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Explore Open Challenges &rarr;
              </Link>
              <Link
                to="/register?role=STARTUP_USER"
                className="inline-block rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Register Startup Entity
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default DpiitExemptionPolicyPage;
