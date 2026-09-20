import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useEscrow(submissionId) {
  return useQuery({
    queryKey: ["payments", "escrow", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      try {
        const res = await apiClient.get(`/payments/escrow/${submissionId}`);
        return res?.data || null;
      } catch (err) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(submissionId),
    staleTime: 1000 * 15,
  });
}

export function useInitializeEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, totalGrantAmount }) => {
      const res = await apiClient.post(`/payments/escrow/${submissionId}/initialize`, {
        totalGrantAmount,
      });
      return res?.data;
    },
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", submissionId] });
    },
  });
}

export function useSubmitEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, trancheId, name, size, hash, fileUrl, description }) => {
      const res = await apiClient.post(`/payments/escrow/${submissionId}/evidence`, {
        submissionId,
        trancheId,
        name,
        size,
        hash,
        fileUrl,
        description,
      });
      return res?.data;
    },
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow", submissionId] });
    },
  });
}

export function useDisburseTranche() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, trancheId, remarks }) => {
      const res = await apiClient.post(`/payments/escrow/${submissionId}/disburse`, {
        submissionId,
        trancheId,
        remarks,
      });
      return res?.data;
    },
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", submissionId] });
    },
  });
}

export function useScalePilot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, gemContractId, sanctionMemo }) => {
      const res = await apiClient.post(`/payments/escrow/${submissionId}/scale`, {
        submissionId,
        gemContractId,
        sanctionMemo,
      });
      return res?.data;
    },
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", "escrow", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", submissionId] });
    },
  });
}
