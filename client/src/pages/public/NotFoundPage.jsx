import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Search,
  FileQuestion,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Compass,
} from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="border-b border-[#E2E8F0] bg-white py-3 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-xs text-[#64748B]">
          <Link to="/" className="hover:text-[#2563EB] flex items-center gap-1.5 font-semibold text-[#10233F]">
            <Home className="h-4 w-4 text-blue-600" />
            Pragati-GovX Maharashtra
          </Link>
          <span className="font-mono text-[11px] text-slate-400">HTTP 404: RESOURCE_NOT_FOUND</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-[#E2E8F0] shadow-md bg-white">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
              <FileQuestion className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block border border-blue-200">
                404 &bull; Page Not Found
              </div>
              <h1 className="text-2xl font-extrabold text-[#10233F] tracking-tight">
                Sovereign Record Unlocated
              </h1>
              <p className="text-xs text-[#64748B] leading-relaxed">
                The requested URL path does not correspond to an active challenge statement, pilot canvas, or administrative workspace on the Maharashtra Sovereign Innovation platform.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-[#475569] space-y-2 text-left">
              <span className="font-semibold text-[#10233F] block">Recommended Navigation:</span>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>Browse active municipal & district challenges in the catalog</li>
                <li>Review the DPIIT 3-waiver statutory exemption policy</li>
                <li>Access your authenticated role dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link to="/" className="w-full sm:w-auto">
                <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-9 gap-1.5 font-semibold">
                  <Home className="h-3.5 w-3.5" />
                  Return Home
                </Button>
              </Link>
              <Link to="/challenges" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full text-xs h-9 gap-1.5 border-slate-300 text-[#10233F]"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Challenge Catalog
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer minimal */}
      <div className="border-t border-[#E2E8F0] bg-white py-3 px-4 text-center text-[11px] text-[#64748B] font-mono">
        Government of Maharashtra &bull; Innovation & Procurement Sandbox Portal
      </div>
    </div>
  );
}

export default NotFoundPage;
