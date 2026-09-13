import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDashboardPath } from "@/context/AuthContext";

function FullPageLoading() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC] px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

function AccessRestricted({ role }) {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC] px-4 py-12">
      <Card className="mx-auto max-w-lg border-[#E2E8F0]">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-[#DC2626]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#10233F]">Access Restricted</h1>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Your current role cannot open this workspace. Continue from the dashboard assigned to your account.
            </p>
          </div>
          <Button asChild className="w-full">
            <a href={getRoleDashboardPath(role)}>Open My Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function RoleGuard({ allowedRoles, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <AccessRestricted role={user.role} />;
  }

  return children ?? <Outlet />;
}

export default RoleGuard;
