import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  formatISTDateTime,
  DEFAULT_NOTIFICATIONS,
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

export function NotificationCenter() {
  const [filterTab, setFilterTab] = useState("ALL");

  const [localReadIds, setLocalReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem("pragati_notifications_read");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { data: notifsData, isLoading } = useNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Merge server notifications with local read status
  const items = useMemo(() => {
    const source = notifsData?.items?.length ? notifsData.items : DEFAULT_NOTIFICATIONS;
    return source.map((item) => ({
      ...item,
      read: item.read || localReadIds.includes(item._id),
    }));
  }, [notifsData?.items, localReadIds]);

  const unreadCount = useMemo(() => {
    return items.filter((item) => !item.read).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterTab === "UNREAD") return !item.read;
      if (filterTab === "SLA") return item.type === "PAYMENT_SLA";
      if (filterTab === "EVALUATION") return item.type === "EVALUATION";
      return true;
    });
  }, [items, filterTab]);

  const handleMarkAsRead = async (id) => {
    setLocalReadIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem("pragati_notifications_read", JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success("Notification marked as read");

    // 2. Sync to server in background
    try {
      await markReadMutation.mutateAsync(id);
    } catch {
    }
  };

  const handleMarkAllRead = async () => {
    const allIds = items.map((i) => i._id);
    setLocalReadIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem("pragati_notifications_read", JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success("All notifications marked as read");

    try {
      await markAllReadMutation.mutateAsync();
    } catch {
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
                    Sovereign Notifications &amp; Alerts
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Statutory milestones, evaluation updates, and FSM lifecycle transitions
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                    {unreadCount} Unread
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending || unreadCount === 0}
                  className="h-8 text-xs border-slate-300 gap-1 text-slate-700 cursor-pointer"
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
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  filterTab === "ALL"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterTab("UNREAD")}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  filterTab === "UNREAD"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterTab("SLA")}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  filterTab === "SLA"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent hover:text-[#10233F]"
                }`}
              >
                Statutory SLA Payments
              </button>
              <button
                onClick={() => setFilterTab("EVALUATION")}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
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
                          {formatISTDateTime(item.createdAt)}
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
                            type="button"
                            onClick={() => handleMarkAsRead(item._id)}
                            className="text-[11px] font-medium text-[#2563EB] hover:underline cursor-pointer"
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
