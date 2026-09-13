import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";

export function ProblemCard({ problem }) {
  const {
    _id,
    title,
    shortSummary,
    organizationId,
    sectors = [],
    geography = {},
    procurementPath = "DIRECT_PILOT",
    applicationCloseAt,
  } = problem;

  const departmentName = organizationId?.name || "Maharashtra State Department";
  const stateName = geography?.state || "Maharashtra";
  const districts = geography?.districts?.length ? geography.districts.slice(0, 2).join(", ") : "Statewide";

  // days remaining
  const daysRemaining = React.useMemo(() => {
    if (!applicationCloseAt) return null;
    const now = new Date();
    const closeDate = new Date(applicationCloseAt);
    const diffTime = closeDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [applicationCloseAt]);

  const pathLabels = {
    DIRECT_PILOT: "Direct Pilot",
    CHALLENGE_PROCUREMENT: "Challenge Procurement",
    RESEARCH_GRANT: "R&D Grant",
    SCALE_UP: "Scale-Up Mandate",
  };

  return (
    <Card className="flex flex-col justify-between border border-[#E2E8F0] bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 rounded-2xl group overflow-hidden">
      <CardHeader className="p-5 pb-3 space-y-3">
        {/* Department & State Banner */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#10233F] font-semibold truncate max-w-[200px]">
            <Building2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
            <span className="truncate">{departmentName}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Title */}
        <Link to={`/challenges/${_id}`}>
          <h3 className="font-bold text-[#10233F] text-base leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="px-5 py-0 space-y-3">
        {/* Summary */}
        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
          {shortSummary}
        </p>

        {/* Sector and Path Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] pt-1">
          {sectors.slice(0, 2).map((sector) => (
            <span
              key={sector}
              className="font-medium text-slate-600"
            >
              {sector}
            </span>
          ))}
          {sectors.length > 0 && <span className="text-slate-300">•</span>}
          <span className="font-medium text-[#2563EB]">
            {pathLabels[procurementPath] || procurementPath}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Location / Deadline */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>{districts}</span>
          </div>
          {daysRemaining !== null && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
              <Clock className="h-3 w-3 text-amber-600" />
              <span>
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Window Closed"}
              </span>
            </div>
          )}
        </div>

        <Link to={`/challenges/${_id}`}>
          <Button size="sm" className="h-8 px-3 text-xs gap-1.5 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-xs">
            Explore
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default ProblemCard;
