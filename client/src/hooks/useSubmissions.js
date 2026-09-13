import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";

export function useSubmissions(filters = {}) {
  const { page = 1, limit = 20, status, problemId } = filters;

  return useQuery({
    queryKey: ["submissions", { page, limit, status, problemId }],
    queryFn: async () => {
      const params = { page, limit };
      if (status && status !== "ALL") params.status = status;
      if (problemId) params.problemId = problemId;

      const response = await apiClient.get("/submissions", { params });
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
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmission(id) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/submissions/${id}`);
      return response?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/submissions", payload);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission successfully created!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create submission");
    },
  });
}

export function useTransitionSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, toStatus, note = "" }) => {
      const response = await apiClient.post(`/submissions/${id}/transition`, {
        toStatus,
        note,
      });
      return response?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", variables.id] });
      toast.success("Submission status updated successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update submission status");
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/submissions/${id}`);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Draft submission deleted");
    },
    onError: (error) => {
      toast.error(error?.message || "Could not delete draft submission");
    },
  });
}
