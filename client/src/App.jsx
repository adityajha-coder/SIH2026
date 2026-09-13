import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { OrgSetupModal } from "@/components/common/OrgSetupModal";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardRedirect } from "@/pages/app/DashboardRedirect";
import { WorkspacePlaceholder } from "@/pages/app/WorkspacePlaceholder";
import { AuthCallbackPage } from "@/pages/public/AuthCallbackPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { LandingPage } from "@/pages/public/LandingPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/public/VerifyEmailPage";
import { ChallengeCatalogPage } from "@/pages/public/ChallengeCatalogPage";
import { ChallengeDetailPage } from "@/pages/public/ChallengeDetailPage";

function PublicPlaceholder({ title, phase }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-[#10233F]">{title}</h2>
      <p className="text-sm text-[#64748B]">
        Scheduled for {phase} implementation.
      </p>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/challenges" element={<ChallengeCatalogPage />} />
              <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
              <Route
                path="/policy"
                element={
                  <PublicPlaceholder
                    title="DPIIT Exemption Policy Framework"
                    phase="Phase F2"
                  />
                }
              />
              <Route
                path="/pilot-framework"
                element={
                  <PublicPlaceholder
                    title="Pilot Framework"
                    phase="Phase F6"
                  />
                }
              />
              <Route
                path="/audit-public"
                element={
                  <PublicPlaceholder
                    title="Audit & Transparency"
                    phase="Phase F7"
                  />
                }
              />
            </Route>

            <Route element={<RoleGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route
                  path="/startup/dashboard"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <WorkspacePlaceholder type="startupDashboard" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/startup/profile"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <WorkspacePlaceholder type="startupProfile" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/startup/submissions"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <WorkspacePlaceholder type="startupSubmissions" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/dashboard"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <WorkspacePlaceholder type="governmentDashboard" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/challenges/new"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <WorkspacePlaceholder type="challengeStudio" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/evaluator/queue"
                  element={
                    <RoleGuard allowedRoles={["EVALUATOR", "ADMIN"]}>
                      <WorkspacePlaceholder type="evaluatorQueue" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <RoleGuard allowedRoles={["ADMIN"]}>
                      <WorkspacePlaceholder type="adminAudit" />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/notifications"
                  element={<WorkspacePlaceholder type="notifications" />}
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <OrgSetupModal />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;
