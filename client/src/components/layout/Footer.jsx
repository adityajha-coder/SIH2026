import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, Lock } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

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
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#0F766E] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>MSInS & GeM Compatible Architecture</span>
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
                  Sandbox & Pilot Protocols
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
              Governance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#2563EB] cursor-pointer">
                  Maharashtra Innovative Startup Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#2563EB] cursor-pointer">
                  IP Rights & Data Governance Compact
                </span>
              </li>
              <li>
                <span className="hover:text-[#2563EB] cursor-pointer">
                  DPDP Act 2023 Compliance
                </span>
              </li>
              <li>
                <span className="hover:text-[#2563EB] cursor-pointer">
                  Conflict-of-Interest (COI) Charter
                </span>
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
              <div className="flex items-center gap-1.5 text-[#10233F] font-semibold text-[11px]">
                <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
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
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              AES-256 Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
