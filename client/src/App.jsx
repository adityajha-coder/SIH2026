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
import { DashboardRedirect } from "./pages/app/DashboardRedirect";
import { AuthCallbackPage } from "./pages/public/AuthCallbackPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ResetPasswordPage } from "./pages/public/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/public/VerifyEmailPage";
import { ChallengeCatalogPage } from "./pages/public/ChallengeCatalogPage";
import { ChallengeDetailPage } from "./pages/public/ChallengeDetailPage";
import { DpiitExemptionPolicyPage } from "./pages/public/DpiitExemptionPolicyPage";
import { StartupDashboard } from "./pages/startup/StartupDashboard";
import { StartupPassport } from "./pages/startup/StartupPassport";
import { ApplicationWizard } from "./pages/startup/ApplicationWizard";
import { SubmissionDetail } from "./pages/startup/SubmissionDetail";
import { MyApplicationsPage } from "./pages/startup/MyApplicationsPage";
import { DepartmentDashboard } from "./pages/government/DepartmentDashboard";
import { ChallengeStudio } from "./pages/government/ChallengeStudio";
import { CandidateMatching } from "./pages/government/CandidateMatching";
import { EvaluatorQueue } from "./pages/evaluator/EvaluatorQueue";
import { EvaluationRoom } from "./pages/evaluator/EvaluationRoom";
import { PilotCanvas } from "./pages/pilot/PilotCanvas";
import { PilotFrameworkPage } from "./pages/public/PilotFrameworkPage";
import { ScaleGateConsole } from "./pages/government/ScaleGateConsole";
import { PaymentPage } from "./pages/government/PaymentPage";
import { GovernmentPayment } from "./pages/government/GovernmentPayment";
import { StartupPayments } from "./pages/startup/StartupPayments";
import { AdminAuditConsole } from "./pages/admin/AdminAuditConsole";
import { NotificationCenter } from "./pages/app/NotificationCenter";
import { ProfilePage } from "./pages/app/ProfilePage";
import { PublicTransparencyPage } from "./pages/public/PublicTransparencyPage";
import { AboutPage } from "./pages/public/AboutPage";

import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { NotFoundPage } from "./pages/public/NotFoundPage";

export function App() {
  return (
    <ErrorBoundary>
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
                  path="/startup/payments"
                  element={
                    <RoleGuard allowedRoles={["STARTUP_USER", "ADMIN"]}>
                      <StartupPayments />
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
                  path="/government/payments"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <GovernmentPayment />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/government/payments/:paymentId"
                  element={
                    <RoleGuard allowedRoles={["GOVERNMENT_USER", "ADMIN"]}>
                      <PaymentPage />
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
