import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const DEFAULT_NOTIFICATIONS = [
  {
    _id: "notif_01",
    title: "Statutory 30-Day SLA Payment Active",
    message: "Tranche 2 (M2: Mid-Term Field Validation) deliverable evidence submitted. 30-day statutory SLA clock started (Day 18 of 30 remaining).",
    type: "PAYMENT_SLA",
    read: false,
    link: "/pilots/sub_441029",
    createdAt: "2026-09-13T21:45:00.000Z", 
  },
  {
    _id: "notif_02",
    title: "Double-Blind Evaluation Assignment Received",
    message: "You have been assigned to evaluate proposal ANON-VENTURE-7829 for Real-Time Non-Revenue Water Loss Detection.",
    type: "EVALUATION",
    read: false,
    link: "/evaluator/queue",
    createdAt: "2026-09-13T21:10:00.000Z", 
  },
  {
    _id: "notif_03",
    title: "Explainable AI Match Complete",
    message: "Candidate discovery cascade executed. 3 high-affinity startups identified for Pune Municipal Zone IoT challenge.",
    type: "AI_MATCH",
    read: true,
    link: "/government/dashboard",
    createdAt: "2026-09-13T19:00:00.000Z", 
  },
  {
    _id: "notif_04",
    title: "DPIIT Statutory Waiver Verified",
    message: "Your startup passport has verified DPIIT eligibility under GFR Rule 173(i) with 100% EMD waiver active.",
    type: "COMPLIANCE",
    read: true,
    link: "/policy",
    createdAt: "2026-09-12T10:45:00.000Z",
  },
  {
    _id: "notif_05",
    title: "Scale Gate Decision Sanctioned",
    message: "Order Ref GR-MSInS/2026 ratified for statewide expansion across 4 Maharashtra districts.",
    type: "GOVERNANCE",
    read: true,
    link: "/pilot-framework",
    createdAt: "2026-09-11T08:50:00.000Z", 
  },
];

const STORAGE_KEY = "pragati_notifications_read";

export function getLocalReadIds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function addLocalReadIds(ids) {
  try {
    const current = getLocalReadIds();
    const updated = Array.from(new Set([...current, ...ids]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function formatISTDateTime(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const formatted = d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatted} IST`;
}

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      let items = [];
      let total = 0;
      try {
        const res = await apiClient.get("/notifications", { params });
        const raw = res?.data?.data || res?.data || {};
        items = raw.notifications || raw.items || [];
        total = raw.total ?? items.length;
      } catch (err) {
        console.warn("Could not fetch server notifications:", err?.message);
      }

      if (!items || items.length === 0) {
        items = DEFAULT_NOTIFICATIONS;
        total = DEFAULT_NOTIFICATIONS.length;
      }

      const readIds = getLocalReadIds();
      const mergedItems = items.map((item) => ({
        ...item,
        read: Boolean(item.read || readIds.includes(item._id)),
      }));

      const unreadCount = mergedItems.filter((n) => !n.read).length;

      return { items: mergedItems, total, unreadCount };
    },
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      addLocalReadIds([notificationId]);
      try {
        const res = await apiClient.put(`/notifications/${notificationId}/read`);
        return res?.data;
      } catch (err) {
        return { success: true, notificationId };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (allIds = []) => {
      if (allIds && allIds.length > 0) {
        addLocalReadIds(allIds);
      } else {
        addLocalReadIds(DEFAULT_NOTIFICATIONS.map((n) => n._id));
      }
      try {
        const res = await apiClient.put("/notifications/read-all");
        return res?.data;
      } catch (err) {
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
