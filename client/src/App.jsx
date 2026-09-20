import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { OrgSetupModal } from "./components/common/OrgSetupModal";
import { AppLayout } from "./components/layout/AppLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { RoleGuard } from "./components/layout/RoleGuard";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F9FC]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Loading workspace...
        </p>
      </div>
    </div>
  );
}

const lazyPage = (importFn, name) =>
  React.lazy(() => importFn().then((m) => ({ default: m[name] || m.default })));

// Public Pages
const LandingPage = lazyPage(() => import("./pages/public/LandingPage"), "LandingPage");
const LoginPage = lazyPage(() => import("./pages/public/LoginPage"), "LoginPage");
const RegisterPage = lazyPage(() => import("./pages/public/RegisterPage"), "RegisterPage");
const VerifyEmailPage = lazyPage(() => import("./pages/public/VerifyEmailPage"), "VerifyEmailPage");
const ForgotPasswordPage = lazyPage(() => import("./pages/public/ForgotPasswordPage"), "ForgotPasswordPage");
const ResetPasswordPage = lazyPage(() => import("./pages/public/ResetPasswordPage"), "ResetPasswordPage");
const AuthCallbackPage = lazyPage(() => import("./pages/public/AuthCallbackPage"), "AuthCallbackPage");
const ChallengeCatalogPage = lazyPage(() => import("./pages/public/ChallengeCatalogPage"), "ChallengeCatalogPage");
const ChallengeDetailPage = lazyPage(() => import("./pages/public/ChallengeDetailPage"), "ChallengeDetailPage");
const DpiitExemptionPolicyPage = lazyPage(() => import("./pages/public/DpiitExemptionPolicyPage"), "DpiitExemptionPolicyPage");
const PilotFrameworkPage = lazyPage(() => import("./pages/public/PilotFrameworkPage"), "PilotFrameworkPage");
const PublicTransparencyPage = lazyPage(() => import("./pages/public/PublicTransparencyPage"), "PublicTransparencyPage");
const AboutPage = lazyPage(() => import("./pages/public/AboutPage"), "AboutPage");
const NotFoundPage = lazyPage(() => import("./pages/public/NotFoundPage"), "NotFoundPage");

// App & Profile Pages
const DashboardRedirect = lazyPage(() => import("./pages/app/DashboardRedirect"), "DashboardRedirect");
const ProfilePage = lazyPage(() => import("./pages/app/ProfilePage"), "ProfilePage");
const NotificationCenter = lazyPage(() => import("./pages/app/NotificationCenter"), "NotificationCenter");

// Startup Pages
const StartupDashboard = lazyPage(() => import("./pages/startup/StartupDashboard"), "StartupDashboard");
const StartupPassport = lazyPage(() => import("./pages/startup/StartupPassport"), "StartupPassport");
const ApplicationWizard = lazyPage(() => import("./pages/startup/ApplicationWizard"), "ApplicationWizard");
const SubmissionDetail = lazyPage(() => import("./pages/startup/SubmissionDetail"), "SubmissionDetail");
const MyApplicationsPage = lazyPage(() => import("./pages/startup/MyApplicationsPage"), "MyApplicationsPage");

// Government Pages
const DepartmentDashboard = lazyPage(() => import("./pages/government/DepartmentDashboard"), "DepartmentDashboard");
const ChallengeStudio = lazyPage(() => import("./pages/government/ChallengeStudio"), "ChallengeStudio");
const CandidateMatching = lazyPage(() => import("./pages/government/CandidateMatching"), "CandidateMatching");
const ScaleGateConsole = lazyPage(() => import("./pages/government/ScaleGateConsole"), "ScaleGateConsole");

// Evaluator Pages
const EvaluatorQueue = lazyPage(() => import("./pages/evaluator/EvaluatorQueue"), "EvaluatorQueue");
const EvaluationRoom = lazyPage(() => import("./pages/evaluator/EvaluationRoom"), "EvaluationRoom");

// Pilot & Admin Pages
const PilotCanvas = lazyPage(() => import("./pages/pilot/PilotCanvas"), "PilotCanvas");
const AdminAuditConsole = lazyPage(() => import("./pages/admin/AdminAuditConsole"), "AdminAuditConsole");

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <React.Suspense fallback={<PageLoadingFallback />}>
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
              <Route path="/policy" element={<DpiitExemptionPolicyPage />} />
              <Route
                path="/pilot-framework"
                element={<PilotFrameworkPage />}
              />
              <Route
                path="/audit-public"
                element={<PublicTransparencyPage />}
              />
              <Route path="/about" element={<AboutPage />} />
            </Route>

            <Route element={<RoleGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/startup/dashboard"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <StartupDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/startup/profile"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <StartupPassport />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/startup/submissions"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <MyApplicationsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/startup/submissions/:id"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <SubmissionDetail />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/challenges/:id/apply"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <ApplicationWizard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/dashboard"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <DepartmentDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/challenges/new"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <ChallengeStudio />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/challenges/:id/matching"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <CandidateMatching />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/evaluator/queue"
                  element={
                    <RoleGuard allowedRoles={["EVALUATOR", "ADMIN"]}>
                      <EvaluatorQueue />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/evaluator/evaluate/:assignmentId"
                  element={
                    <RoleGuard allowedRoles={["EVALUATOR", "ADMIN"]}>
                      <EvaluationRoom />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pilots/:id"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "GOVERNMENT_USER", "EVALUATOR", "ADMIN"]}>
                      <PilotCanvas />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/challenges/:id/scale-gate"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <ScaleGateConsole />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/challenges/:id/scale-gate"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <ScaleGateConsole />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <RoleGuard allowedRoles={["ADMIN"]}>
                      <AdminAuditConsole />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/notifications"
                  element={<NotificationCenter />}
                />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </React.Suspense>
          <OrgSetupModal />
        </AuthProvider>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        offset={{ top: 80, right: 24 }}
        mobileOffset={{ top: 72, right: 16 }}
      />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
