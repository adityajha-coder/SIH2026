import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

export function ECertificateModal({ isOpen, onClose, certificateData }) {
  const certificateRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !certificateData) return null;

  const {
    certificateId = "CERT-GOVX-2026-68A6719E",
    issueDate = new Date(),
    recipientOrgName = "Aadilazy",
    dpiitNumber = "DPIIT-MH-2024-8849",
    solutionTitle = "WeatherGPT",
    problemTitle = "Real time weather chatbot for weather app",
    department = "Department of Information Technology",
    statutoryReference = "Rule 173(i) General Financial Rules (GFR) 2017",
    pilotId = "PLT-68A6719E",
    gemContractId = "GEM-2026-DIR-99120",
    verificationHash = "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  } = certificateData;

  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 overflow-y-auto backdrop-blur-xs"
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
            background: #FFFDF9 !important;
            z-index: 999999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Action Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-xs no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Official Sovereign E-Certificate</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="font-mono text-slate-500 text-[11px]">{certificateId}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Certificate Viewport */}
        <div className="overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-100/70">
          {/* Landscape A4 Frame (~1.414:1 ratio) */}
          <div
            id="printable-certificate"
            ref={certificateRef}
            className="w-full max-w-4xl bg-[#FFFDF9] text-slate-900 shadow-md rounded-xl border border-amber-900/20 p-5 sm:p-7 select-text"
            style={{ minHeight: "540px" }}
          >
            {/* Double Ornate Border Frame */}
            <div className="relative p-5 sm:p-7 border-4 border-[#1E3A5F] rounded-lg outline outline-2 outline-offset-3 outline-[#B8860B]/70 bg-white shadow-xs">
              {/* Corner Decorative Accents */}
              <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#B8860B]" />
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#B8860B]" />
              <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#B8860B]" />
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#B8860B]" />

              {/* Header / Brand Logo & National Emblem */}
              <div className="text-center space-y-1 pb-3 border-b border-amber-200/70 flex flex-col items-center justify-center">
                <img
                  src={logoImg}
                  alt="Pragati-GovX"
                  className="h-9 w-auto object-contain rounded mb-0.5"
                />
                <div className="text-[10px] font-serif font-bold tracking-widest text-[#B8860B] uppercase">
                  सत्यमेव जयते • Government of Maharashtra
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3A5F]">
                  Pragati-GovX Sovereign Procurement &amp; Innovation Gateway
                </h2>
                <div className="text-[9px] text-slate-500 font-medium">
                  Statutory Pilot Validation under General Financial Rules (GFR) 2017
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center py-3 space-y-0.5">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                  Official Electronic Record
                </div>
                <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#1E3A5F] uppercase">
                  Certificate of Successful Pilot Completion
                </h1>
                <div className="text-[11px] font-semibold text-[#B8860B]">
                  GFR Rule 173(i) Commercial Scale Sanction
                </div>
              </div>

              {/* Main Statement */}
              <div className="text-center space-y-2.5 max-w-2xl mx-auto py-1">
                <p className="text-[11px] text-slate-600">
                  This is to officially certify that the registered innovation enterprise
                </p>

                <div className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-wide border-b-2 border-slate-200 pb-0.5 inline-block px-4">
                  {recipientOrgName}
                </div>
                {dpiitNumber && (
                  <div className="text-[10px] font-mono text-slate-500 -mt-1.5">
                    DPIIT Recognition: <span className="font-semibold text-slate-700">{dpiitNumber}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  has successfully deployed, field-tested, and audited the innovative solution
                </p>

                <div className="text-base sm:text-lg font-bold text-[#1E3A5F] bg-blue-50/70 py-1.5 px-4 rounded-md border border-blue-200/60 inline-block">
                  {solutionTitle}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  in response to the sovereign challenge problem statement
                </p>

                <div className="text-xs font-semibold text-slate-800 italic">
                  "{problemTitle}"
                </div>
                <div className="text-[10px] text-slate-500">
                  Sponsored by <span className="font-medium text-slate-700">{department}</span>
                </div>
              </div>

              {/* Legal Validation & Exemption Endorsement */}
              <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center max-w-2xl mx-auto">
                <p className="text-[10px] text-slate-700 leading-relaxed">
                  Having satisfied all milestone deliverables, field telemetry benchmarks, and cybersecurity audits, this enterprise is officially certified under <strong>{statutoryReference}</strong> for <strong>direct commercial procurement on GeM</strong> without prior turnover or past experience prerequisites.
                </p>
              </div>

              {/* Metadata Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-600 text-center">
                <div className="p-1.5 rounded bg-slate-50 border border-slate-150">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                    Certificate ID
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">{certificateId}</div>
                </div>

                <div className="p-1.5 rounded bg-slate-50 border border-slate-150">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                    Pilot ID
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">{pilotId}</div>
                </div>

                <div className="p-1.5 rounded bg-slate-50 border border-slate-150">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                    GeM Indent / Contract
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">{gemContractId}</div>
                </div>

                <div className="p-1.5 rounded bg-slate-50 border border-slate-150">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                    Date of Validation
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">{formattedDate}</div>
                </div>
              </div>

              {/* Signatures & Seal Row */}
              <div className="mt-5 pt-4 border-t border-amber-200/70 grid grid-cols-3 items-end text-center">
                {/* Left Signatory */}
                <div className="space-y-1">
                  <div className="h-5" />
                  <div className="w-28 mx-auto border-t border-slate-400" />
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                    Nodal Procurement Officer
                  </div>
                  <div className="text-[8px] text-slate-500">Government of Maharashtra</div>
                </div>

                {/* Center Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full border border-dashed border-[#B8860B] bg-amber-50/80 flex flex-col items-center justify-center p-0.5 shadow-2xs">
                    <div className="h-9 w-9 rounded-full border border-[#B8860B] flex flex-col items-center justify-center text-[6px] font-bold text-[#B8860B] uppercase tracking-tighter leading-tight text-center">
                      <span>PRAGATI</span>
                      <span>GOVX</span>
                      <span className="text-[5px] text-emerald-700">SEAL</span>
                    </div>
                  </div>
                  <div className="text-[7px] font-mono text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                    ✓ Verified Record
                  </div>
                </div>

                {/* Right Signatory */}
                <div className="space-y-1">
                  <div className="h-5" />
                  <div className="w-28 mx-auto border-t border-slate-400" />
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                    Chair, Evaluation Board
                  </div>
                  <div className="text-[8px] text-slate-500">Pragati-GovX Council</div>
                </div>
              </div>

              {/* Cryptographic Verification Footer */}
              <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[8px] font-mono text-slate-400 gap-1">
                <div className="truncate max-w-md">
                  Verification Hash: <span className="text-slate-500 font-semibold">{verificationHash}</span>
                </div>
                <div>
                  Secured by Sovereign Ledger • Verifiable on Pragati-GovX Portal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Bar */}
        <div className="sticky bottom-0 z-30 flex items-center justify-between px-5 py-2.5 border-t border-slate-200 bg-white/95 backdrop-blur-xs no-print">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Statutory Evidence under GFR 173(i) for Direct Commercial Scale
          </div>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs cursor-pointer"
            >
              Download / Print PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ECertificateModal;
