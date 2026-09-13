import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LandingPage } from "@/pages/public/LandingPage";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/challenges"
              element={
                <div className="mx-auto max-w-4xl py-20 text-center space-y-4">
                  <h2 className="text-2xl font-bold text-[#10233F]">Challenges Catalog</h2>
                  <p className="text-sm text-[#64748B]">Scheduled for Phase F2 implementation.</p>
                </div>
              }
            />
            <Route
              path="/policy"
              element={
                <div className="mx-auto max-w-4xl py-20 text-center space-y-4">
                  <h2 className="text-2xl font-bold text-[#10233F]">DPIIT Exemption Policy Framework</h2>
                  <p className="text-sm text-[#64748B]">Scheduled for Phase F2 implementation.</p>
                </div>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;
