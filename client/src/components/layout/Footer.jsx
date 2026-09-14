import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { LegalCharterModal } from "@/components/common/LegalCharterModal";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeLegalTerm, setActiveLegalTerm] = useState(null);

  return (
    <footer className="w-full border-t border-[#E2E8F0] bg-white mt-auto text-sm text-[#64748B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Pragati-GovX"
                className="h-8 w-auto object-contain rounded-md"
              />
              <span className="font-bold text-base text-[#10233F]">Pragati-GovX</span>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">
              State-level innovation procurement gateway bridging Government of Maharashtra departments with DPIIT-recognized startups for controlled pilots, milestone contracting, and sovereign scale.
            </p>
            <div className="pt-1 text-[11px] text-[#0F766E] font-medium">
              <span>MSInS &amp; GeM Compatible Architecture</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
              Procurement Pathways
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/challenges" className="hover:text-[#2563EB] transition-colors">
                  Open Department Challenges
                </Link>
              </li>
              <li>
                <Link to="/pilot-framework" className="hover:text-[#2563EB] transition-colors">
                  Sandbox &amp; Pilot Protocols
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-[#2563EB] transition-colors">
                  DPIIT Turnover Exemption Rule
                </Link>
              </li>
              <li>
                <Link to="/challenges?path=DIRECT_PILOT" className="hover:text-[#2563EB] transition-colors">
                  Direct Innovation Pilots
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
              Governance &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalTerm("maharashtra-policy")}
                  className="hover:text-[#2563EB] text-left cursor-pointer transition-colors"
                >
                  Maharashtra Innovative Startup Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalTerm("ip-governance")}
                  className="hover:text-[#2563EB] text-left cursor-pointer transition-colors"
                >
                  IP Rights &amp; Data Governance Compact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalTerm("dpdp-compliance")}
                  className="hover:text-[#2563EB] text-left cursor-pointer transition-colors"
                >
                  DPDP Act 2023 Compliance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalTerm("coi-charter")}
                  className="hover:text-[#2563EB] text-left cursor-pointer transition-colors"
                >
                  Conflict-of-Interest (COI) Charter
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
              Sovereign Authority
            </h4>
            <p className="text-xs text-[#64748B]">
              Department of Skills, Employment, Entrepreneurship & Innovation, Government of Maharashtra.
            </p>
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] p-3 text-xs space-y-1.5">
              <div className="text-[#10233F] font-semibold text-[11px]">
                Forensic Audit Trail Active
              </div>
              <p className="text-[11px] text-[#64748B]">
                Every proposal, evaluation score, and payment transition is immutably logged with SHA-256 integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Footer: Copyright & SIH Citation */}
      <div className="border-t border-[#E2E8F0] bg-[#F7F9FC] py-4 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <p>© {currentYear} Pragati-GovX • Smart India Hackathon 2026 Problem Statement 26136.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>
              AES-256 Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sovereign Legal Charter Modal */}
      <LegalCharterModal
        termKey={activeLegalTerm}
        isOpen={!!activeLegalTerm}
        onClose={() => setActiveLegalTerm(null)}
      />
    </footer>
  );
}

export default Footer;
