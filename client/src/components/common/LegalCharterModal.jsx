import React from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const SOVEREIGN_TERMS = {
  // PROCUREMENT PATHWAYS
  "open-challenges": {
    title: "Open Department Challenges",
    category: "Procurement Pathways",
    statutoryRef: "Maharashtra Innovation Mandate GR No. MAT-2024/CR-88/Ind-7",
    summary:
      "State departments and municipal corporations publish clear problem statements and quantifiable KPIs rather than restrictive technical specifications. This opens government procurement directly to innovative startups.",
    provisions: [
      "Outcome-based functional targets replace rigid hardware brand specifications.",
      "Statutory waiver of 3-year prior-turnover and historical revenue prerequisites.",
      "Pre-allocated municipal sandbox grant up to ₹25 Lakhs per challenge.",
      "Double-blind evaluator scoring to ensure complete merit-based selection.",
    ],
    safeguard: "Mandated under Maharashtra State Innovation Society (MSInS) procurement rules.",
    ctaLink: "/challenges",
    ctaLabel: "Browse Open Department Challenges",
  },
  "sandbox-protocols": {
    title: "Sandbox & Pilot Protocols",
    category: "Procurement Pathways",
    statutoryRef: "MSInS Sovereign Sandbox Framework (Section 4 - Field Trials)",
    summary:
      "A standardized 90-day controlled field deployment framework enabling startups to test their hardware and software directly within active civic infrastructure (water networks, transit, civil hospitals, energy grids).",
    provisions: [
      "Real-world urban testbeds supervised by municipal chief engineers.",
      "Air-gapped citizen data boundaries with strict zero-liability clauses for test failures.",
      "Standardized 3-tranche milestone disbursement schedule linked to verified field KPIs.",
      "Automated telemetry and uptime logging shared transparently between venture and city.",
    ],
    safeguard: "Tripartite sovereign compact executed prior to municipal deployment.",
    ctaLink: "/pilot-framework",
    ctaLabel: "View Sandbox Pilot Protocols",
  },
  "turnover-exemption": {
    title: "DPIIT Turnover Exemption Rule",
    category: "Procurement Pathways",
    statutoryRef: "Central GFR Rule 149 & 173(i) & Maharashtra GR 2024",
    summary:
      "Mandatory waiver of prior-turnover and earnest money deposit (EMD) criteria for DPIIT-recognized startups, allowing early-stage innovators to compete on technical capability rather than historical balance sheets.",
    provisions: [
      "100% exemption from minimum turnover, net worth, and prior operating revenue criteria.",
      "Complete waiver of Earnest Money Deposit (EMD) and tender document processing fees.",
      "Applicable to all verified Indian startups incorporated within the past 10 years with TRL ≥ 4.",
      "Department tender committees prohibited from inserting indirect restrictive covenants.",
    ],
    safeguard: "Legally enforceable under General Financial Rules (GFR) Section 173(i).",
    ctaLink: "/policy?section=turnover-exemption",
    ctaLabel: "Read Full DPIIT Exemption Framework",
  },
  "direct-pilots": {
    title: "Direct Innovation Pilots",
    category: "Procurement Pathways",
    statutoryRef: "Public Procurement (Make in India) & State Innovation Fast-Track Window",
    summary:
      "An accelerated procurement window enabling state departments to rapidly pilot high-TRL, proprietary startup solutions without enduring conventional 6-to-12 month tender cycles.",
    provisions: [
      "Rapid 30-day onboarding from technical submission to field testbed deployment.",
      "Direct municipal department sponsorship backed by State Innovation Society oversight.",
      "Pre-cleared legal templates for rapid tripartite compact sign-off.",
      "Successful pilots automatically qualify for statewide GeM direct procurement memos.",
    ],
    safeguard: "Subject to triple-evaluator consensus scoring and audit logging.",
    ctaLink: "/challenges?path=DIRECT_PILOT",
    ctaLabel: "Explore Direct Innovation Pilots",
  },

  // GOVERNANCE & LEGAL
  "maharashtra-policy": {
    title: "Maharashtra Innovative Startup Policy",
    category: "Governance & Legal",
    statutoryRef: "Industries, Energy & Labour Department GR No. 2018/CR-101/Ind-7",
    summary:
      "The comprehensive statutory policy umbrella governing innovation procurement, incubation hubs, seed grants, and intellectual property reimbursement across all 36 districts of Maharashtra.",
    provisions: [
      "Statutory mandate directing departments to allocate a minimum percentage of budgets to startup pilots.",
      "100% financial reimbursement for domestic and international patent filing expenses.",
      "Single-window credential verification eliminating duplicate compliance documentation.",
      "Inter-municipal reciprocity recognizing pilot certifications statewide without re-tendering.",
    ],
    safeguard: "Enacted by the Government of Maharashtra to foster sovereign civic innovation.",
    ctaLink: "/policy?section=maharashtra-policy",
    ctaLabel: "Open Full Policy Document",
  },
  "ip-governance": {
    title: "IP Rights & Data Governance Compact",
    category: "Governance & Legal",
    statutoryRef: "State Tripartite Innovation Compact (Section 9 - IP & Proprietary Rights)",
    summary:
      "A binding legal covenant guaranteeing that startups retain 100% ownership of their patents, trade secrets, algorithms, and source code during and after municipal sandbox trials.",
    provisions: [
      "Government receives a non-exclusive, non-transferable evaluation license solely for the pilot trial.",
      "Startups retain absolute title to all pre-existing and foreground intellectual property.",
      "Municipal infrastructure databases remain strictly isolated via air-gapped API gateways.",
      "Government bodies are strictly prohibited from proprietary code replication or reverse engineering.",
    ],
    safeguard: "Legally binding tripartite covenant signed before municipal infrastructure access.",
    ctaLink: "/policy?section=ip-governance",
    ctaLabel: "Open Full Policy Document",
  },
  "dpdp-compliance": {
    title: "DPDP Act 2023 Compliance",
    category: "Governance & Legal",
    statutoryRef: "Digital Personal Data Protection Act (Act No. 22 of 2023)",
    summary:
      "Rigorous statutory data protection standards ensuring that all citizen telemetry, urban sensor data, and municipal digital records processed during startup pilots comply with national privacy laws.",
    provisions: [
      "Zero permanent retention of unencrypted citizen personal identification information (PII).",
      "Automated cryptographic anonymization and masking at the municipal boundary gateway.",
      "Strict data localization with all storage hosted on MeitY-empaneled sovereign cloud instances.",
      "Tamper-evident audit logs tracking all data queries with SHA-256 cryptographic verification.",
    ],
    safeguard: "Supervised by the State Data Governance Directorate in compliance with national law.",
    ctaLink: "/policy?section=dpdp-compliance",
    ctaLabel: "Open Full Policy Document",
  },
  "coi-charter": {
    title: "Conflict-of-Interest (COI) Charter",
    category: "Governance & Legal",
    statutoryRef: "Maharashtra Public Procurement Transparency & Ethics Code",
    summary:
      "A mandatory statutory code legally binding all government evaluators, technical panel chairs, and municipal supervisors to ensure double-blind integrity and total merit-based selection.",
    provisions: [
      "Mandatory written declaration of zero equity, advisory, or familial relationships with applicants.",
      "Automatic disqualification and panel recusal in the event of any identified conflict of interest.",
      "Double-blind proposal reviews completely masked from corporate brand names or venture identity.",
      "Immutable consensus voting logs stored with SHA-256 integrity to ensure forensic auditability.",
    ],
    safeguard: "Zero-tolerance ethics mandate with mandatory whistleblower reporting channels.",
    ctaLink: "/policy?section=coi-charter",
    ctaLabel: "Open Full Policy Document",
  },
};

export function LegalCharterModal({ termKey, isOpen, onClose }) {
  if (!termKey || !SOVEREIGN_TERMS[termKey]) return null;

  const term = SOVEREIGN_TERMS[termKey];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200 shadow-xl rounded-lg space-y-6">
        <DialogHeader className="border-b border-slate-200 pb-4 space-y-1 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Government of Maharashtra</span>
            <span>•</span>
            <span className="text-[#10233F]">{term.category}</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {term.title}
          </DialogTitle>
          <div className="text-xs font-mono text-slate-500 pt-1">
            Statutory Citation: {term.statutoryRef}
          </div>
        </DialogHeader>

        {/* Overview Section */}
        <section className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Overview &amp; Statutory Intent
          </h3>
          <p>{term.summary}</p>
        </section>

        {/* Core Provisions */}
        <section className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Core Policy Provisions
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            {term.provisions.map((prov, i) => (
              <li key={i}>{prov}</li>
            ))}
          </ul>
        </section>

        {/* Safeguard Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
          <p className="text-xs font-bold text-slate-900">
            Legal Enforceability &amp; Sovereign Safeguard
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {term.safeguard}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 h-8"
          >
            Close
          </Button>
          {term.ctaLink && (
            <Link to={term.ctaLink} onClick={onClose}>
              <Button
                size="sm"
                className="text-xs font-medium bg-[#10233F] hover:bg-slate-800 text-white h-8 px-3 rounded shadow-none"
              >
                {term.ctaLabel || "Read Full Policy"} &rarr;
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LegalCharterModal;

