import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  Clock,
  Coins,
  FileCheck,
  FileText,
  Filter,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_NOTIFICATIONS = [
  {
    _id: "notif_01",
    title: "Statutory 30-Day SLA Payment Active",
    message: "Tranche 2 (M2: Mid-Term Field Validation) deliverable evidence submitted. 30-day statutory SLA clock started (Day 18 of 30 remaining).",
    type: "PAYMENT_SLA",
    read: false,
    link: "/pilots/sub_441029",
    createdAt: "2026-09-14T01:30:00.000Z",
  },
  {
    _id: "notif_02",
    title: "Double-Blind Evaluation Assignment Received",
    message: "You have been assigned to evaluate proposal ANON-VENTURE-7829 for Real-Time Non-Revenue Water Loss Detection.",
    type: "EVALUATION",
    read: false,
    link: "/evaluator/queue",
    createdAt: "2026-09-13T22:15:00.000Z",
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
    createdAt: "2026-09-11T16:20:00.000Z",
  },
];

export function NotificationCenter() {
  const [filterTab, setFilterTab] = useState("ALL"); // ALL, UNREAD, SLA, EVALUATION

  const { data: notifsData, isLoading } = useNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const items = notifsData?.items?.length ? notifsData.items : DEFAULT_NOTIFICATIONS;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterTab === "UNREAD") return !item.read;
      if (filterTab === "SLA") return item.type === "PAYMENT_SLA";
      if (filterTab === "EVALUATION") return item.type === "EVALUATION";
      return true;
    });
  }, [items, filterTab]);

  const unreadCount = items.filter((item) => !item.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markReadMutation.mutateAsync(id);
      toast.success("Notification marked as read");
    } catch {
      // Handled
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      // Handled
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "PAYMENT_SLA":
        return <Coins className="h-4 w-4 text-[#0F766E]" />;
      case "EVALUATION":
        return <FileCheck className="h-4 w-4 text-purple-600" />;
      case "AI_MATCH":
        return <Sparkles className="h-4 w-4 text-amber-600" />;
      case "GOVERNANCE":
        return <Rocket className="h-4 w-4 text-emerald-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] pb-16">
      {/* Top Header */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-semibold text-[#10233F]">Universal Notification Hub</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <Card className="border-[#E2E8F0] shadow-sm bg-white">
          <CardHeader className="border-b border-[#E2E8F0] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#10233F]">
                    Sovereign Notifications & Alerts
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Statutory milestones, evaluation updates, and FSM lifecycle transitions
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                    {unreadCount} Unread
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending || unreadCount === 0}
                  className="h-8 text-xs border-slate-300 gap-1 text-slate-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark All as Read
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 text-xs font-semibold text-[#64748B] pt-4">
              <button
                onClick={() => setFilterTab("ALL")}
                className={`pb-2 border-b-2 transition-colors ${
                  filterTab === "ALL"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterTab("UNREAD")}
                className={`pb-2 border-b-2 transition-colors ${
                  filterTab === "UNREAD"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterTab("SLA")}
                className={`pb-2 border-b-2 transition-colors ${
                  filterTab === "SLA"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                Statutory SLA Payments
              </button>
              <button
                onClick={() => setFilterTab("EVALUATION")}
                className={`pb-2 border-b-2 transition-colors ${
                  filterTab === "EVALUATION"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                Evaluations
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#64748B] space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-slate-300" />
                <p>No notifications matching current filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 transition-colors flex items-start gap-3.5 ${
                      !item.read ? "bg-blue-50/40" : "bg-white hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="p-2 rounded-lg border border-slate-200 bg-white shrink-0 mt-0.5">
                      {getIconForType(item.type)}
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#10233F]">{item.title}</h4>
                          {!item.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#64748B]">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[#475569] text-xs leading-relaxed">{item.message}</p>

                      <div className="flex items-center gap-3 pt-1">
                        {item.link && (
                          <Link
                            to={item.link}
                            className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                          >
                            Open Details
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}

                        {!item.read && (
                          <button
                            onClick={() => handleMarkAsRead(item._id)}
                            className="text-[11px] text-[#64748B] hover:text-[#10233F]"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NotificationCenter;
