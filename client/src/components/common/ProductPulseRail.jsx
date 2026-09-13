import React from "react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    num: "1.",
    title: "Outcome-Based Challenge Studio",
    overview:
      "Enables public departments to formulate operational problems with quantifiable KPIs and baseline targets rather than restrictive technical specs.",
  },
  {
    num: "2.",
    title: "Sovereign Eligibility & Prior-Turnover Exemption",
    overview:
      "Automated verification through DPIIT and DigiLocker granting eligible startups statutory exemptions from legacy turnover and multi-year experience criteria.",
  },
  {
    num: "3.",
    title: "Explainable AI Matchmaking Engine",
    overview:
      "Hybrid semantic search and capability scoring that accurately matches innovative startup tech to departmental challenges with auditable reasoning.",
  },
  {
    num: "4.",
    title: "Double-Blind Evaluation & COI Governance",
    overview:
      "Independent multi-expert evaluation with automated conflict-of-interest declarations, anonymized proposals, and tamper-evident audit logging.",
  },
  {
    num: "5.",
    title: "Controlled Sandbox & Milestone Pilot Contracting",
    overview:
      "Standardized Innovation Compacts with ring-fenced operational boundaries, IP safeguards, and a mandatory 30-day statutory milestone payment SLA clock.",
  },
  {
    num: "6.",
    title: "Multi-District Validation & Scale-Gate Memo",
    overview:
      "Direct transition from successful sandbox field trials into official public procurement recommendations and multi-district deployment across state departments.",
  },
];

export function ProductPulseRail({ className }) {
  const renderFeaturesList = (prefixKey) => (
    <div className="flex items-center whitespace-nowrap text-xs md:text-sm text-black select-none">
      <span className="font-bold tracking-wider text-black mr-2">Features:</span>
      {FEATURES.map((item, idx) => (
        <span key={`${prefixKey}-${idx}`} className="inline-flex items-center">
          <span className="font-semibold text-black mr-1.5">
            {item.num} {item.title}:
          </span>
          <span className="text-black font-normal mr-4">
            {item.overview}
          </span>
          {idx < FEATURES.length - 1 && (
            <span className="text-black/40 mr-4 font-bold select-none">•</span>
          )}
        </span>
      ))}
      <span className="text-black/40 mx-5 font-bold select-none">•</span>
    </div>
  );

  return (
    <div
      className={cn(
        "marquee-container relative w-full overflow-hidden bg-white border-y border-black py-2.5 select-none",
        className
      )}
      role="region"
      aria-label="Platform Features Pulse Rail"
    >
      {/* Soft gradient edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 md:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 md:w-24 bg-gradient-to-l from-white to-transparent" />

      <div 
        className="flex w-max animate-pulse-marquee items-center"
        style={{ animationDuration: "80s" }}
      >
        {renderFeaturesList("track-1")}
        {renderFeaturesList("track-2")}
      </div>
    </div>
  );
}

export default ProductPulseRail;
