import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useProblems(filters = {}) {
  const { page = 1, limit = 12, sector, status = "PUBLISHED", search } = filters;

  return useQuery({
    queryKey: ["problems", { page, limit, sector, status, search }],
    queryFn: async () => {
      const params = {};
      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (sector && sector !== "ALL") params.sector = sector;
      if (status && status !== "ALL") params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const response = await apiClient.get("/problems", { params });
      return {
        items: response?.data || [],
        pagination: response?.meta?.pagination || {
          totalItems: 0,
          totalPages: 1,
          currentPage: page,
          limit,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true,
  });
}

export function useProblem(id) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/problems/${id}`);
      return response?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProblemEligibility(problemId, organizationId) {
  return useQuery({
    queryKey: ["problem-eligibility", problemId, organizationId],
    queryFn: async () => {
      if (!problemId) return null;
      const params = organizationId ? { organizationId } : {};
      const response = await apiClient.get(`/problems/${problemId}/eligibility`, { params });
      const raw = response?.data || response || {};
      const hasBlockers = (raw.blockers?.length || 0) > 0;
      const hasMissing = (raw.missingEvidence?.length || 0) > 0;
      const isEligible = Boolean(raw.eligible ?? raw.isEligible ?? (!hasBlockers && !hasMissing));
      const canApply = Boolean(raw.canApply ?? raw.eligible ?? (!hasBlockers));

      return {
        ...raw,
        isEligible,
        canApply,
        eligible: isEligible,
      };
    },
    enabled: !!problemId,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });
}
