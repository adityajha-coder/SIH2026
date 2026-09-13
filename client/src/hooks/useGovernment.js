import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";


export function useDepartmentProblems(params = {}) {
  return useQuery({
    queryKey: ["department", "problems", params],
    queryFn: async () => {
      const res = await apiClient.get("/problems", { params });
      return res?.data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useDepartmentSubmissions(params = {}) {
  return useQuery({
    queryKey: ["department", "submissions", params],
    queryFn: async () => {
      const res = await apiClient.get("/submissions", { params });
      return res?.data || [];
    },
    staleTime: 1000 * 30,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/problems", payload);
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department", "problems"] });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

export function usePublishProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (problemId) => {
      const res = await apiClient.post(`/problems/${problemId}/publish`);
      return res?.data;
    },
    onSuccess: (_, problemId) => {
      queryClient.invalidateQueries({ queryKey: ["department", "problems"] });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["problem", problemId] });
    },
  });
}

export function useAiMatch() {
  return useMutation({
    mutationFn: async ({ problemId, organizationId }) => {
      const res = await apiClient.post("/ai/match", {
        problemId,
        organizationId,
      });
      return res?.data;
    },
  });
}
