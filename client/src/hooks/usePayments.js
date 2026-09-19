import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useGovernmentPayments() {
  return useQuery({
    queryKey: ["government", "payments"],
    queryFn: async () => {
      const res = await apiClient.get("/payments/government");
      return res?.data || [];
    },
    staleTime: 10000,
  });
}

export function usePayment(paymentId) {
  return useQuery({
    queryKey: ["payment", paymentId],
    enabled: Boolean(paymentId),
    queryFn: async () => {
      const res = await apiClient.get(`/payments/${paymentId}`);
      return res?.data || null;
    },
    staleTime: 10000,
  });
}

export function useCreatePaymentOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/payments/create-order", payload);
      return res?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["government", "payments"] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/payments/verify", payload);
      return res?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["government", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["startup", "payments"] });
    },
  });
}

export function useStartupPayments() {
  return useQuery({
    queryKey: ["startup", "payments"],
    queryFn: async () => {
      const res = await apiClient.get("/payments/startup");
      return res?.data || [];
    },
    staleTime: 10000,
    refetchInterval: 15000,
  });
}
