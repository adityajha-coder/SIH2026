import React, { useState, useMemo } from "react";
import { useProblems } from "@/hooks/useProblems";
import { ProblemCard } from "@/components/common/ProblemCard";
import { DistrictGeoMap } from "@/components/common/DistrictGeoMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  LayoutGrid,
  Map as MapIcon,
  Filter,
  RotateCcw,
  Sparkles,
  Building2,
  AlertCircle,
} from "lucide-react";

const SECTOR_OPTIONS = [
  "ALL",
  "Agritech & Rural",
  "Clean Energy & Climate",
  "Healthcare & MedTech",
  "Smart Mobility & Transit",
  "Water & Waste Governance",
  "GovTech & Public Delivery",
];

const DISTRICT_OPTIONS = [
  "ALL",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Solapur",
  "Kolhapur",
  "Thane",
  "Amravati",
];

export function ChallengeCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [page, setPage] = useState(1);

  // Fetch problems with backend query parameters
  const { data, isLoading, isError, error, refetch } = useProblems({
    page,
    limit: 12,
    sector: selectedSector === "ALL" ? undefined : selectedSector,
    search: search.trim() || undefined,
  });

  const allProblems = data?.items || [];
  const pagination = data?.pagination || { totalPages: 1, totalItems: 0 };

  const filteredProblems = useMemo(() => {
    if (selectedDistrict === "ALL") return allProblems;
    return allProblems.filter((p) => {
      const districts = p.geography?.districts || [];
      return districts.some(
        (d) => d.toLowerCase() === selectedDistrict.toLowerCase()
      );
    });
  }, [allProblems, selectedDistrict]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSector("ALL");
    setSelectedDistrict("ALL");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                Sovereign Challenge Studio
              </span>
              <span className="text-xs text-[#64748B]">• Statutory DPIIT Exemption Enabled</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10233F] tracking-tight">
              Open Public Innovation Challenges
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Explore outcome-based problem statements from Maharashtra departments. Apply with your technology solution directly for controlled sandbox pilots without prior-turnover hurdles.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#10233F] hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#10233F] hover:bg-slate-50"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              GIS Map View
            </button>
          </div>
        </div>

        <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search challenges by keyword, KPI or department..."
                className="pl-9 h-10 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* District Selector */}
            <div className="sm:col-span-4">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-[#10233F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {DISTRICT_OPTIONS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === "ALL" ? "All Maharashtra Districts" : `${dist} District`}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 gap-1.5 h-10 w-full sm:w-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          {/* Sector Pill Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Sectors:
            </span>
            {SECTOR_OPTIONS.map((sector) => {
              const active = selectedSector === sector;
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => {
                    setSelectedSector(sector);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                    active
                      ? "bg-[#10233F] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {sector === "ALL" ? "All Sectors" : sector}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="space-y-4">
            <DistrictGeoMap problems={filteredProblems} className="min-h-[560px]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
                <h3 className="font-bold text-rose-900">Failed to load challenges</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">
                  {error?.message || "There was an error communicating with the challenge registry API."}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()} className="border-rose-300">
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredProblems.length === 0 && (
              <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center space-y-4 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[#10233F]">
                  No matching challenges found
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Try clearing your search keyword or switching sectors and district filters.
                </p>
                <Button size="sm" onClick={resetFilters} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Problems Grid */}
            {!isLoading && !isError && filteredProblems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProblems.map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-[#64748B] px-3 font-medium">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChallengeCatalogPage;
