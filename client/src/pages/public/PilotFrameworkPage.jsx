import React, { useState } from "react";
import { Link } from "react-router-dom";

export function PilotFrameworkPage() {
  const [budgetLakhs, setBudgetLakhs] = useState(25);
  const [delayDays, setDelayDays] = useState(0);

  // 3-Tranche Calculations
  const tranche1 = (budgetLakhs * 0.3).toFixed(2);
  const tranche2 = (budgetLakhs * 0.4).toFixed(2);
  const tranche3 = (budgetLakhs * 0.3).toFixed(2);

  // Statutory Compounding Interest Simulation (MSMED Act Sec. 16: 3x RBI Bank Rate ~19.5% per annum)
  const annualInterestRate = 0.195;
  const delayedTrancheAmount = budgetLakhs * 0.4 * 100000; // Tranche 2 in Rupees
  const statutoryInterestRupees =
    delayDays > 0
      ? Math.round(delayedTrancheAmount * (Math.pow(1 + annualInterestRate / 12, delayDays / 30) - 1))
      : 0;

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
            <span className="text-slate-900 font-medium">Pilot Sandbox Framework</span>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Header */}
          <header className="border-b border-slate-200 pb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Government of Maharashtra • Department of Industries, Energy and Labour
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Sovereign Innovation Sandbox &amp; Field Pilot Policy Framework
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Operational regulations governing live municipal field trials, the 3-tranche milestone payment ledger, 30-day statutory disbursement SLA guarantees, and non-competitive commercial scale-out under Maharashtra Rule 14-A.
            </p>
            <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
              <span>Order No: MAT-2024/CR-88/Ind-7</span>
              <span>•</span>
              <span>MSInS Sandbox Reg. 2024</span>
              <span>•</span>
              <span>MSMED Act 2006: Sec. 15 &amp; 16</span>
            </div>
          </header>

          {/* Section 1: Overview & Authority */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              1. Statutory Mandate &amp; Regulatory Safe Harbor
            </h2>
            <p>
              Under Maharashtra Government Resolution No. MAT-2024/CR-88/Ind-7 and the Maharashtra State Innovation Procurement Sandbox Regulations, recognized startups are provided a legally ring-fenced sandbox to test and validate novel technologies within real public infrastructure.
            </p>
            <p>
              <strong>Regulatory Safe Harbor:</strong> During the authorized sandbox trial period, startups and participating municipal officers are granted regulatory safe harbor from legacy vendor qualification rules, allowing experimental deployments without liability for bureaucratic non-standard procurement formats.
            </p>
          </section>

          {/* Section 2: 4-Stage Sandbox Lifecycle */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              2. The 4-Stage Sandbox Pilot Lifecycle
            </h2>
            <p className="text-slate-700">
              Every sandbox pilot follows a strict 4-stage sovereign finite-state machine (FSM) to ensure structured delivery and clear accountability:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Stage 1 — Pilot Proposed &amp; Sandbox Charter Lock:</strong> The departmental nodal officer and selected startup formulate the Sandbox Charter, locking in measurable baseline metrics, target impact KPIs, designated test geography, and container boundaries.
              </li>
              <li>
                <strong>Stage 2 — Active Field Deployment:</strong> Live hardware or software deployment in the test district. Real-time telemetry monitoring, user trial data collection, and mid-term field audit inspection.
              </li>
              <li>
                <strong>Stage 3 — Joint Verification &amp; Final Audit:</strong> Department officers and empaneled technical evaluators audit telemetry data against promised outcome KPIs and verify CERT-In cybersecurity clearance.
              </li>
              <li>
                <strong>Stage 4 — State-Wide Commercial Scale-Out:</strong> Upon meeting all milestone criteria, the startup receives an official State Innovation Sanction Order unlocking direct commercial procurement across all 36 Maharashtra districts.
              </li>
            </ol>
          </section>

          {/* Section 3: 3-Tranche Milestone Payment Structure */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              3. The 3-Tranche Milestone Payment Ledger
            </h2>
            <p className="text-slate-700">
              To eliminate working-capital bottlenecks for startups while safeguarding public funds, sandbox budgets are divided into three non-negotiable statutory tranches:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Tranche 1 (30% — Mobilization &amp; Sandbox Provisioning):</strong> Disbursed upon formal execution of the Innovation Compact Charter and container provisioning.
              </li>
              <li>
                <strong>Tranche 2 (40% — Mid-Term Field Validation):</strong> Disbursed upon achieving verifiable 50% target KPI impact and joint field inspection approval.
              </li>
              <li>
                <strong>Tranche 3 (30% — Final Acceptance &amp; Handover):</strong> Disbursed upon 100% KPI fulfillment, final technical evaluation signoff, and deliverable SHA-256 evidence vault archiving.
              </li>
            </ul>
          </section>

          {/* Section 4: Interactive Milestone Tranche & SLA Simulator (Extra Touch) */}
          <section className="space-y-4 text-sm leading-relaxed p-5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                4. Interactive Milestone Tranche &amp; Statutory SLA Calculator
              </h2>
              <p className="text-xs text-slate-600">
                Simulate exact milestone disbursements and compute statutory interest liabilities under Section 16 of the MSMED Act:
              </p>
            </div>

            {/* Slider 1: Total Pilot Corpus */}
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-900">Total Pilot Sandbox Budget (Corpus):</span>
                <span className="font-mono text-sm font-bold text-[#2563EB]">₹{budgetLakhs} Lakhs</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={budgetLakhs}
                onChange={(e) => setBudgetLakhs(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>₹5 Lakhs (Micro-pilot)</span>
                <span>₹25 Lakhs (Standard)</span>
                <span>₹50 Lakhs (Advanced)</span>
                <span>₹100 Lakhs (Flagship)</span>
              </div>
            </div>

            {/* Dynamic Tranche Breakdown Table */}
            <div className="overflow-x-auto rounded border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-900">
                    <th className="p-2.5 font-bold">Milestone Tranche</th>
                    <th className="p-2.5 font-bold">Ratio</th>
                    <th className="p-2.5 font-bold">Disbursement Amount</th>
                    <th className="p-2.5 font-bold">Statutory Release Trigger</th>
                    <th className="p-2.5 font-bold">Payment SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Tranche 1 (M1)</td>
                    <td className="p-2.5 font-mono">30%</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">₹{tranche1} Lakhs</td>
                    <td className="p-2.5 text-slate-600">Charter signing &amp; test container provisioning</td>
                    <td className="p-2.5 font-mono text-[#0F766E]">15 Days from signing</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Tranche 2 (M2)</td>
                    <td className="p-2.5 font-mono">40%</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">₹{tranche2} Lakhs</td>
                    <td className="p-2.5 text-slate-600">Mid-term field validation &amp; 50% KPI achievement</td>
                    <td className="p-2.5 font-mono text-[#0F766E]">30 Days from signoff</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Tranche 3 (M3)</td>
                    <td className="p-2.5 font-mono">30%</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">₹{tranche3} Lakhs</td>
                    <td className="p-2.5 text-slate-600">100% KPI fulfillment &amp; final security audit</td>
                    <td className="p-2.5 font-mono text-[#0F766E]">30 Days from signoff</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Slider 2: Statutory Delay Interest Penalty Simulator */}
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-900">Simulate Department Delay Beyond 30-Day SLA:</span>
                <span className="font-mono text-sm font-bold text-amber-700">
                  {delayDays === 0 ? "Zero Delay (Compliant)" : `${delayDays} Days Delayed`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0 Days (On-Time)</span>
                <span>30 Days Late</span>
                <span>60 Days Late</span>
                <span>90 Days Late</span>
              </div>

              {delayDays > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex justify-between">
                    <span>Mandatory Compounding Interest Penalty (MSMED Act Sec. 16):</span>
                    <span className="font-mono text-sm text-red-700">+₹{statutoryInterestRupees.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Calculated on Tranche 2 (₹{tranche2}L) at 3x RBI Bank Rate (~19.5% p.a.) compounded monthly. Department treasuries are legally liable to pay this interest directly to the startup account without discretionary waiver.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Mandatory 30-Day Payment SLA */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              5. Statutory 30-Day Milestone Payment SLA
            </h2>
            <p className="text-slate-700">
              Under Section 15 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, payment releases for approved sandbox milestones must occur within <strong>30 calendar days</strong> of joint field verification signoff.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Automated Treasury Direct Credit:</strong> Once the designated nodal officer submits verification credentials, the payment voucher is dispatched directly via state treasury NEFT/RTGS rails.
              </li>
              <li>
                <strong>Audit Immunity for Prompt Payment:</strong> Department accounts officers are granted audit safe harbor for honoring milestone disbursements within 30 days without secondary scrutiny of startup balance sheets.
              </li>
            </ul>
          </section>

          {/* Section 6: Intellectual Property Sovereignty */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              6. Intellectual Property (IP) Sovereignty
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>100% Startup Property:</strong> Deploying inside state infrastructure does not forfeit proprietary software, algorithms, or hardware designs. All background and foreground IP remains 100% startup property.
              </li>
              <li>
                <strong>Limited Evaluation License:</strong> The government receives solely a non-exclusive, temporary license to test and evaluate the solution for the agreed sandbox duration.
              </li>
              <li>
                <strong>Data Sovereignty:</strong> Citizen, spatial, and administrative data generated during the pilot must reside on State Data Centre (SDC) or MeitY-empanelled sovereign cloud infrastructure within India.
              </li>
            </ul>
          </section>

          {/* Section 7: Commercial Procurement Scale-Out */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              7. Commercial Procurement Scale-Out (Rule 14-A &amp; GeM)
            </h2>
            <p className="text-slate-700">
              A critical bottleneck in civic innovation is that successful pilots often stall in repetitive tender cycles. Under this framework:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Maharashtra Rule 14-A Exemption:</strong> Solutions that satisfy all target KPIs in a state sandbox receive an official Sanction Order Memo, granting exemption from open tendering for direct commercial procurement up to ₹1.5 Crores.
              </li>
              <li>
                <strong>GeM Startup Runway Fast-Track:</strong> Proven solutions are onboarded to the Government e-Marketplace (GeM) catalog for single-source direct procurement by any public authority nationwide.
              </li>
              <li>
                <strong>Statewide District Replication:</strong> Any of the 36 Maharashtra district collectorates or 29 municipal corporations may adopt the validated solution using pre-negotiated unit rates.
              </li>
            </ul>
          </section>

          {/* Section 8: Legal Citations & Directory */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              8. Official Gazette References &amp; Legal Citations
            </h2>
            <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Maharashtra GR No. MAT-2024/CR-88/Ind-7</span>
                <span className="text-slate-500">Legal Sandbox Policy for Public Sector Procurement</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">MSMED Act 2006 • Section 15 &amp; 16</span>
                <span className="text-slate-500">Statutory 30-day payment timeline and 3x RBI compounding interest</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Maharashtra Public Procurement Rule 14-A</span>
                <span className="text-slate-500">Direct commercial procurement exemption for sandbox-validated innovations</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Information Technology Act 2000 • Sec. 65B</span>
                <span className="text-slate-500">Electronic record admissibility for SHA-256 evidence vaults</span>
              </div>
            </div>
          </section>

          {/* Section 9: Actions & Directory */}
          <section className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">
              9. Related Resources &amp; Support
            </h2>
            <p>
              For guidance on sandbox charters, field trial agreements, or treasury milestone claims, contact the Maharashtra State Innovation Society (MSInS) Sandbox Desk at <span className="font-mono text-slate-800">sandbox.msins@maharashtra.gov.in</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/challenges"
                className="inline-block rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Browse Active Sandbox Challenges
              </Link>
              <Link
                to="/policy"
                className="inline-block rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                DPIIT Exemption Policy
              </Link>
              <Link
                to="/audit-public"
                className="inline-block rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Audit &amp; Transparency
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default PilotFrameworkPage;
