import React from "react";
import { Link } from "react-router-dom";

export function PublicTransparencyPage() {
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
            <span className="text-slate-900 font-medium">Audit &amp; Transparency</span>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Header */}
          <header className="border-b border-slate-200 pb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Government of Maharashtra • Maharashtra State Innovation Society (MSInS)
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Public Audit &amp; Transparency Governance Framework
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard operating procedures on cryptographic audit logging, double-blind evaluation integrity, 30-day payment SLA monitoring, and open public scrutiny under the Pragati-GovX innovation sandbox.
            </p>
            <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-4">
              <span>Directive: MHA-AUDIT-2026-V1</span>
              <span>•</span>
              <span>IT Act 2000: Section 65B</span>
              <span>•</span>
              <span>RTI Act 2005: Section 4(1)(b)</span>
            </div>
          </header>

          {/* Section 1: Overview */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              1. Overview &amp; Sovereign Open Data Principles
            </h2>
            <p>
              Pragati-GovX operates on the principle that public procurement of technology and innovation must be subject to complete, uncompromised public accountability. Every challenge published, proposal evaluated, contract awarded, and milestone payment disbursed is tracked on an auditable digital registry.
            </p>
            <p>
              Under Section 4(1)(b) of the Right to Information (RTI) Act 2005, public authorities are mandated to provide suo motu disclosure of operational guidelines, decision-making norms, and public fund disbursements. This framework codifies those obligations into automated, tamper-evident digital workflows.
            </p>
          </section>

          {/* Section 2: Four Core Guarantees */}
          <section className="space-y-4 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              2. The Four Pillars of Sovereign Transparency
            </h2>

            <div className="space-y-4 text-slate-700">
              <div className="space-y-1.5 pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">
                  2.1 Cryptographic Immutability &amp; Forensic Trace Logging
                </h3>
                <p>
                  <strong>Standard:</strong> Every state mutation, challenge publication, evaluation score, and milestone signoff generates an immutable SHA-256 cryptographic hash accompanied by a unique Request Trace ID and millisecond-precision timestamp.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Legal Evidentiary Value:</strong> System audit logs conform to Section 65B of the Indian Evidence Act / Information Technology Act 2000 for electronic record admissibility in judicial and Comptroller and Auditor General (CAG) scrutiny. Retroactive manual editing or log tampering is technically blocked.
                </p>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">
                  2.2 Mandatory 30-Day Milestone Payment SLA
                </h3>
                <p>
                  <strong>Standard:</strong> Upon joint field inspection and signoff of a completed sandbox milestone, departmental treasuries are legally required to disburse the agreed grant or contract tranche within thirty (30) calendar days.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Statutory Interest Penalty:</strong> Pursuant to Sections 15 and 16 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, delayed disbursements automatically attract compound interest with monthly rests at three times (3x) the Reserve Bank of India (RBI) bank rate.
                </p>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">
                  2.3 Double-Blind Meritocratic Evaluation
                </h3>
                <p>
                  <strong>Standard:</strong> During initial technical review, technical evaluators evaluate proposal dossiers with all commercial venture names, founder identities, and marketing branding strictly masked into sovereign anonymous identifiers (e.g., ANON-VENTURE-4921).
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Conflict of Interest (COI) Gate:</strong> Evaluators must execute a statutory digital declaration confirming zero financial, advisory, or familial relationship with applicants before scoring panels unlock. Any violation triggers immediate removal and disciplinary referral.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base">
                  2.4 Explainable AI Decision Support
                </h3>
                <p>
                  <strong>Standard:</strong> Artificial intelligence operates strictly as an advisory matching and claims-verification co-pilot for departmental officers. Candidate suitability scoring uses a deterministic 4-pillar formula (Sector 35%, Capability 35%, Stage 15%, DPIIT Recognition 15%).
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Human Accountability:</strong> Under NITI Aayog guidelines on Responsible AI for All, automated scores never make binding procurement decisions. Human departmental nodal officers retain full constitutional responsibility for awarding pilot charters.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Transparency Metrics */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              3. Platform Audit Benchmarks &amp; Operating Standards
            </h2>
            <p className="text-slate-700">
              The platform tracks the following key governance indicators across all public challenge operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Statewide Administrative Coverage:</strong> All 36 administrative districts and 6 revenue divisions of Maharashtra are eligible for decentralized sandbox trials.
              </li>
              <li>
                <strong>SLA Compliance Rate Target:</strong> Minimum 95% of approved sandbox milestone deliverables disbursed within the 30-day statutory timeline.
              </li>
              <li>
                <strong>Double-Blind Adherence:</strong> 100% of technical evaluation dossiers anonymized prior to committee scoring.
              </li>
              <li>
                <strong>Public Challenge Records:</strong> 100% of problem statements, target KPIs, and evaluation rubrics published openly on the portal before proposal intake begins.
              </li>
            </ul>
          </section>

          {/* Section 4: Public Audit Log Inspection */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              4. Citizen &amp; Auditor Inspection Protocol
            </h2>
            <p className="text-slate-700">
              Citizens, civic researchers, state assembly representatives, and CAG auditors can inspect platform transaction integrity through the following procedures:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Public Problem Catalog:</strong> All open, evaluating, active, and scaled challenges are publicly indexable under <span className="font-mono text-xs">/challenges</span>, complete with problem summaries, baseline metrics, and budget caps.
              </li>
              <li>
                <strong>Administrative Audit Trail:</strong> Authorized state audit officials with <span className="font-mono text-xs">ADMIN</span> credentials access real-time raw transaction logs under <span className="font-mono text-xs">/admin/audit</span>, including user actor IDs, action verbs, timestamp digests, and entity payloads.
              </li>
              <li>
                <strong>Right to Information (RTI) Applications:</strong> Any citizen may file an online RTI request for complete non-confidential pilot evaluation records under Maharashtra Right to Information Rules 2005.
              </li>
            </ol>
          </section>

          {/* Section 5: Grievance Redressal */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              5. Grievance Redressal &amp; Whistleblower Ombudsman Desk
            </h2>
            <p className="text-slate-700">
              To maintain the integrity of public procurement, any startup founder, evaluator, or citizen who observes an irregularity, unauthorized tender condition, bias in scoring, or payment delay may report the matter directly:
            </p>
            <div className="pl-4 border-l-2 border-slate-300 space-y-1 text-slate-600 text-xs">
              <p>• <strong>Ombudsman Authority:</strong> Chief Executive Officer, Maharashtra State Innovation Society (MSInS)</p>
              <p>• <strong>Direct Electronic Mail:</strong> <span className="font-mono text-slate-800">ombudsman.msins@maharashtra.gov.in</span></p>
              <p>• <strong>Statutory Investigation Mandate:</strong> Inquiries must be initiated within 7 working days of grievance receipt, with a formal resolution order published within 21 calendar days.</p>
            </div>
          </section>

          {/* Section 6: Legal References */}
          <section className="space-y-3 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">
              6. Statutory References &amp; Governing Acts
            </h2>
            <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Information Technology Act, 2000 • Section 65B</span>
                <span className="text-slate-500">Admissibility of electronic records and cryptographic hashes</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Right to Information Act, 2005 • Section 4(1)(b)</span>
                <span className="text-slate-500">Mandatory proactive public disclosure of administrative norms</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">MSMED Act, 2006 • Sections 15 &amp; 16</span>
                <span className="text-slate-500">Statutory 30-day payment timeline and compounding interest penalty</span>
              </div>
              <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-slate-900">Maharashtra Public Procurement Rules, 2024</span>
                <span className="text-slate-500">Transparency, fair competition, and sandbox exemptions</span>
              </div>
            </div>
          </section>

          {/* Section 7: Inquiries */}
          <section className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">
              7. Related Resources
            </h2>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/challenges"
                className="inline-block rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Browse Public Challenges
              </Link>
              <Link
                to="/policy"
                className="inline-block rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                DPIIT Exemption Policy
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default PublicTransparencyPage;
