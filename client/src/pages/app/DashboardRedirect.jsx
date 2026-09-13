import React from "react";
import { Navigate } from "react-router-dom";
import { getRoleDashboardPath } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
}

export default DashboardRedirect;
