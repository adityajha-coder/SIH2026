import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Plus,
  Rocket,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-slate-700 bg-slate-100 border-slate-200" },
  SUBMITTED: { label: "Submitted", color: "text-blue-700 bg-blue-50 border-blue-200" },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-50 border-amber-200" },
  CLARIFICATION: { label: "Clarification Needed", color: "text-rose-700 bg-rose-50 border-rose-200" },
  ACCEPTED: { label: "Accepted for Pilot", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  PILOT_ACTIVE: { label: "Pilot Active", color: "text-emerald-800 bg-emerald-100 border-emerald-300" },
  PILOT_COMPLETED: { label: "Pilot Completed", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  SCALED: { label: "Scaled Mandate", color: "text-blue-800 bg-blue-100 border-blue-300" },
  REJECTED: { label: "Archived", color: "text-slate-600 bg-slate-100 border-slate-200" },
  WITHDRAWN: { label: "Withdrawn", color: "text-slate-600 bg-slate-100 border-slate-200" },
};

const FILTER_TABS = [
  { id: "ALL", label: "All Applications" },
  { id: "IN_REVIEW", label: "In Review", statuses: ["SUBMITTED", "UNDER_REVIEW"] },
  { id: "ACTION_NEEDED", label: "Action Needed", statuses: ["CLARIFICATION"] },
  { id: "PILOT", label: "Accepted & Pilots", statuses: ["ACCEPTED", "PILOT_ACTIVE", "PILOT_COMPLETED", "SCALED"] },
  { id: "ARCHIVED", label: "Drafts & Archived", statuses: ["DRAFT", "REJECTED", "WITHDRAWN"] },
];

export function MyApplicationsPage() {
  const { user, organization } = useAuth();
  const { data, isLoading } = useSubmissions();
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allSubmissions = data?.items || [];

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((sub) => {
      // Tab filter
      if (activeTab !== "ALL") {
        const tabDef = FILTER_TABS.find((t) => t.id === activeTab);
        if (tabDef?.statuses && !tabDef.statuses.includes(sub.status)) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = sub.solutionTitle?.toLowerCase().includes(q);
        const problemMatch = sub.problemId?.title?.toLowerCase().includes(q);
        const summaryMatch = sub.executiveSummary?.toLowerCase().includes(q);
        if (!titleMatch && !problemMatch && !summaryMatch) return false;
      }

      return true;
    });
  }, [allSubmissions, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: allSubmissions.length };
    FILTER_TABS.forEach((t) => {
      if (t.statuses) {
        counts[t.id] = allSubmissions.filter((s) => t.statuses.includes(s.status)).length;
      }
    });
    return counts;
  }, [allSubmissions]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Startup Submissions
            </span>
            <span className="text-xs text-[#64748B]">• Statutory Transparency Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            My Challenge Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Track submitted proposals, double-blind evaluation progress, clarifications, and sovereign sandbox transitions.
          </p>
        </div>

        <Link to="/challenges">
          <Button size="sm" className="gap-1.5 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-sm shrink-0">
            <Plus className="h-3.5 w-3.5" />
            Apply to New Challenge
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
          {FILTER_TABS.map((tab) => {
            const count = tabCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-[#10233F] hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by proposal title, challenge statement, or keywords..."
            className="pl-9 h-10 text-xs bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="p-12 border border-slate-200 bg-white rounded-2xl text-center space-y-4 shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] mx-auto">
            <Send className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#10233F]">
              {searchQuery || activeTab !== "ALL"
                ? "No matching applications found"
                : "No challenge applications submitted yet"}
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              {searchQuery || activeTab !== "ALL"
                ? "Try adjusting your search query or selecting another status filter."
                : "Browse open problem statements formulated by government departments and apply for sandbox pilots."}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/challenges">
              <Button size="sm" className="gap-1.5 font-semibold bg-[#2563EB] hover:bg-blue-600">
                Explore Open Challenges
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3.5">
          {filteredSubmissions.map((sub) => {
            const statusInfo = STATUS_CONFIG[sub.status] || {
              label: sub.status,
              color: "text-slate-600 bg-slate-100 border-slate-200",
            };

            const submittedDate = sub.createdAt
              ? new Date(sub.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            const problemTitle = sub.problemId?.title || "Department Challenge Statement";
            const evidenceCount = sub.evidenceFileIds?.length || 0;

            return (
              <div
                key={sub._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Submitted on {submittedDate}
                    </span>
                    {evidenceCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        <FileCheck2 className="h-3 w-3 text-blue-600" />
                        {evidenceCount} Evidence File{evidenceCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div>
                    <Link to={`/startup/submissions/${sub._id}`}>
                      <h3 className="font-bold text-base text-[#10233F] hover:text-[#2563EB] transition-colors truncate">
                        {sub.solutionTitle}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      <strong>Challenge:</strong> {problemTitle}
                    </p>
                  </div>

                  {sub.executiveSummary && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sub.executiveSummary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {sub.status === "CLARIFICATION" && (
                    <Link to={`/startup/submissions/${sub._id}`}>
                      <Button
                        size="sm"
                        className="h-9 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-sm"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Respond Now
                      </Button>
                    </Link>
                  )}
                  <Link to={`/startup/submissions/${sub._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-semibold gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      Track Application
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
