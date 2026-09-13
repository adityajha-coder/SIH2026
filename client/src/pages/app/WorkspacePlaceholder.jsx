import React from "react";
import {
  Bell,
  CheckSquare,
  FileText,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const PAGE_CONFIG = {
  startupDashboard: {
    title: "Startup Dashboard",
    phase: "Phase F3",
    icon: LayoutDashboard,
    description:
      "Active applications, pending actions, and startup notification polling will be built in the startup vertical slice.",
  },
  startupProfile: {
    title: "Startup Passport",
    phase: "Phase F3",
    icon: FileText,
    description:
      "Company profile, sectors, capabilities, DPIIT status, and evidence references will be connected in Phase F3.",
  },
  startupSubmissions: {
    title: "My Applications",
    phase: "Phase F3",
    icon: FileText,
    description:
      "Submission trackers, clarification responses, and 24-hour draft delete controls are scheduled for Phase F3.",
  },
  governmentDashboard: {
    title: "Department Dashboard",
    phase: "Phase F4",
    icon: LayoutDashboard,
    description:
      "Published challenges, submission counts, pending evaluations, and metrics are scheduled for Phase F4.",
  },
  challengeStudio: {
    title: "Challenge Studio",
    phase: "Phase F4",
    icon: FileText,
    description:
      "The five-step authoring flow, readiness meter, rubric builder, and publish controls will be implemented in Phase F4.",
  },
  evaluatorQueue: {
    title: "Evaluator Queue",
    phase: "Phase F5",
    icon: CheckSquare,
    description:
      "Assigned submission queues and double-blind evaluation entry points are scheduled for Phase F5.",
  },
  adminAudit: {
    title: "Forensic Audit Trail",
    phase: "Phase F7",
    icon: ShieldAlert,
    description:
      "Admin stats, audit log filtering, and forensic event inspection are scheduled for Phase F7.",
  },
  notifications: {
    title: "Notification Center",
    phase: "Phase F7",
    icon: Bell,
    description:
      "Unread notification sync, read-all actions, and the full notification center are scheduled for Phase F7.",
  },
};

export function WorkspacePlaceholder({ type }) {
  const { user, organization } = useAuth();
  const config = PAGE_CONFIG[type] || PAGE_CONFIG.startupDashboard;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            {config.phase} Workspace
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-[#10233F]">
            {config.title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#64748B]">
            {config.description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E2E8F0]">
          <CardHeader className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Role Boundary</CardTitle>
              <CardDescription className="text-xs">
                {user?.role || "Authenticated user"}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
            <CardDescription className="text-xs">
              {organization?.name || "Setup required before workflow use"}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-base">Phase Status</CardTitle>
            <CardDescription className="text-xs">
              Route and guard are active. Functional module arrives in its scheduled phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-dashed border-[#CBD5E1] bg-white/70">
        <CardContent className="p-6 text-sm leading-relaxed text-[#64748B]">
          This page is intentionally limited to Phase F1 shell verification.
          Later phase functionality will be added only when that phase is
          explicitly started.
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkspacePlaceholder;
