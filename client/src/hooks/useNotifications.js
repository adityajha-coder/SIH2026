import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const res = await apiClient.get("/notifications", { params });
      return res?.data || { items: [], total: 0, unreadCount: 0 };
    },
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 30, // poll every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await apiClient.put(`/notifications/${notificationId}/read`);
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.put("/notifications/read-all");
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
