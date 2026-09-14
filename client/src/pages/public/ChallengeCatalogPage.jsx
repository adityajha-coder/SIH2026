import React, { useState, useMemo } from "react";
import { useProblems } from "@/hooks/useProblems";
import { ProblemCard } from "@/components/common/ProblemCard";
import { DistrictGeoMap } from "@/components/common/DistrictGeoMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const SORT_OPTIONS = [
  { value: "newest", label: "Sort: Newly Published" },
  { value: "closingSoon", label: "Sort: Closing Soonest" },
  { value: "budgetHigh", label: "Sort: Procurement Scale" },
  { value: "alphabetical", label: "Sort: Alphabetical (A-Z)" },
];

export function ChallengeCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [page, setPage] = useState(1);

  // Fetch problems with backend query parameters
  const { data, isLoading, isError, error, refetch } = useProblems({
    page,
    limit: 12,
    sector: selectedSector === "ALL" ? undefined : selectedSector,
    search: search.trim() || undefined,
    sortBy,
  });

  const allProblems = data?.items || [];
  const pagination = data?.pagination || { totalPages: 1, totalItems: allProblems.length, currentPage: page, limit: 12 };

  // Filter by district if selected
  const filteredProblems = useMemo(() => {
    let result = [...allProblems];

    if (selectedDistrict !== "ALL") {
      result = result.filter((p) => {
        const districts = p.geography?.districts || [];
        return districts.some(
          (d) => d.toLowerCase() === selectedDistrict.toLowerCase()
        );
      });
    }

    // Apply sorting client-side to ensure immediate responsive ordering
    result.sort((a, b) => {
      if (sortBy === "closingSoon") {
        const closeA = a.applicationCloseAt ? new Date(a.applicationCloseAt).getTime() : Infinity;
        const closeB = b.applicationCloseAt ? new Date(b.applicationCloseAt).getTime() : Infinity;
        return closeA - closeB;
      }
      if (sortBy === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "budgetHigh") {
        const tierWeights = { SCALE_UP: 4, DIRECT_PILOT: 3, CHALLENGE_PROCUREMENT: 2, RESEARCH_GRANT: 1 };
        const weightA = tierWeights[a.procurementPath] || 0;
        const weightB = tierWeights[b.procurementPath] || 0;
        return weightB - weightA;
      }
      // default: newest
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return dateB - dateA;
    });

    return result;
  }, [allProblems, selectedDistrict, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSector("ALL");
    setSelectedDistrict("ALL");
    setSortBy("newest");
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute pagination range numbers
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  const totalCount = pagination.totalItems || filteredProblems.length;
  const startCount = totalCount === 0 ? 0 : (page - 1) * 12 + 1;
  const endCount = Math.min(page * 12, totalCount);

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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
              Open Public Innovation Challenges
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Explore outcome-based problem statements from Maharashtra departments. Apply with your technology solution directly for controlled sandbox pilots without prior-turnover hurdles.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg self-start md:self-auto shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#10233F] text-white"
                  : "text-[#64748B] hover:text-[#10233F] hover:bg-slate-50"
              }`}
            >
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#10233F] text-white"
                  : "text-[#64748B] hover:text-[#10233F] hover:bg-slate-50"
              }`}
            >
              GIS Map View
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3 bg-white p-4 sm:p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search challenges by title, sector, keyword or department..."
                className="h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* District Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-[#10233F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DISTRICT_OPTIONS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === "ALL" ? "All Maharashtra Districts" : `${dist} District`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-[#10233F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-1 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-700 hover:bg-slate-50 h-10 w-full cursor-pointer"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Sector Pill Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer border ${
                    active
                      ? "bg-[#10233F] text-white border-[#10233F]"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {sector === "ALL" ? "All Sectors" : sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#64748B] gap-2 px-1">
          <div>
            Showing <span className="font-semibold text-[#10233F]">{startCount}–{endCount}</span> of{" "}
            <span className="font-semibold text-[#10233F]">{totalCount}</span> challenges
            {selectedSector !== "ALL" && <span> in <span className="text-[#10233F] font-medium">{selectedSector}</span></span>}
            {selectedDistrict !== "ALL" && <span> in <span className="text-[#10233F] font-medium">{selectedDistrict}</span></span>}
          </div>
          <div className="text-[11px]">
            Page {page} of {totalPages}
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
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
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
              <div className="p-8 rounded-xl border border-slate-300 bg-slate-50 text-center space-y-3">
                <h3 className="font-bold text-slate-900">Failed to load challenges</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {error?.message || "There was an error communicating with the challenge registry API."}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()} className="border-slate-300 text-xs">
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredProblems.length === 0 && (
              <div className="p-12 rounded-xl border border-slate-200 bg-white text-center space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-[#10233F]">
                  No matching challenges found
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Try clearing your search keyword, changing the sorting criterion, or resetting sector and district filters.
                </p>
                <Button size="sm" variant="outline" onClick={resetFilters} className="text-xs">
                  Reset All Filters
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

            {/* Complete Cursor & Numerical Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs">
                <div className="text-[#64748B]">
                  Page {page} of {totalPages} ({totalCount} total results)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(1)}
                    className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className="h-8 px-3 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    Previous
                  </Button>

                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePageChange(num)}
                      className={`h-8 w-8 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                        page === num
                          ? "bg-[#10233F] text-white border-[#10233F]"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    className="h-8 px-3 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    Next
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChallengeCatalogPage;
