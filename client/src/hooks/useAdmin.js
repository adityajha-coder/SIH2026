import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/stats");
      return res?.data || null;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: async () => {
      const res = await apiClient.get("/admin/audit-logs", { params });
      return res?.data || { items: [], total: 0, page: 1, limit: 20 };
    },
    staleTime: 1000 * 20, // 20 seconds
  });
}

export function useAuditLogById(id) {
  return useQuery({
    queryKey: ["admin", "audit-logs", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/admin/audit-logs/${id}`);
      return res?.data || null;
    },
    enabled: !!id,
  });
}
