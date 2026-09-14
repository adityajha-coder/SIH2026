import React from "react";
import { Link } from "react-router-dom";

export function DpiitExemptionPolicyPage() {
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
            <span className="text-slate-900 font-medium">Eligibility Policy</span>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 space-y-8 shadow-sm">
          
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

          {/* Section 1: Key Exemptions */}
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

          {/* Section 2: Eligibility Criteria */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              2. Eligibility Criteria (Who Qualifies)
            </h2>
            <p className="text-slate-700">
              To be eligible for these statutory exemptions, an enterprise must fulfill the following criteria:
            </p>
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

          {/* Section 3: Sandbox to Scale */}
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

          {/* Section 4: 30-Day Payment SLA */}
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

          {/* Section 5: Intellectual Property */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              5. Intellectual Property (IP) Protection
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>100% Startup IP Ownership:</strong> Participation in government challenges does not transfer any intellectual property. Startups retain complete ownership of all patents, software source code, proprietary algorithms, and hardware designs.
              </li>
              <li>
                <strong>Limited Departmental License:</strong> The procuring department receives solely a non-exclusive, temporary license to test and evaluate the solution for the agreed trial duration.
              </li>
              <li>
                <strong>Confidentiality Protection:</strong> Trade secrets and proprietary specifications are protected from disclosure under Section 8(1)(d) of the Right to Information (RTI) Act.
              </li>
            </ul>
          </section>

          {/* Section 6: Official References */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              6. Official Gazette &amp; Legal Citations
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
                <span className="font-semibold text-slate-900">Maharashtra Public Procurement Rule 14-A</span>
                <span className="text-slate-500">Finance Department, Government of Maharashtra</span>
              </div>
            </div>
          </section>

          {/* Section 7: Next Steps / Inquiries */}
          <section className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">
              7. Inquiries &amp; Application Support
            </h2>
            <p>
              For questions regarding DPIIT verification or challenge eligibility, contact the Maharashtra State Innovation Society (MSInS) desk at <span className="font-mono text-slate-800">support.msins@maharashtra.gov.in</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/challenges"
                className="inline-block rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Explore Open Challenges
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
