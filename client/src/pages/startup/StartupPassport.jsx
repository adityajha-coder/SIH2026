import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganization, useUpdateStartupProfile } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  CheckCircle2,
  FileCheck,
  Globe,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const STAGE_OPTIONS = [
  { value: "IDEA", label: "Idea / Research", desc: "Formulating initial solution concept" },
  { value: "PROTOTYPE", label: "Lab Prototype", desc: "Functional proof-of-concept ready for testing" },
  { value: "MVP", label: "Minimum Viable Product", desc: "Working version tested with preliminary users" },
  { value: "EARLY_TRACTION", label: "Early Traction", desc: "First commercial/pilot deployments active" },
  { value: "SCALING", label: "Growth / Scaling", desc: "Proven operational fit ready for district rollout" },
];

const AVAILABLE_SECTORS = [
  "Agritech & Rural",
  "Clean Energy & Climate",
  "Healthcare & MedTech",
  "Smart Mobility & Transit",
  "Water & Waste Governance",
  "GovTech & Public Delivery",
  "Cybersecurity & Data",
];

export function StartupPassport() {
  const { organization, profile, refetchSession } = useAuth();
  const { data: orgData, isLoading } = useCurrentOrganization();
  const updateProfileMutation = useUpdateStartupProfile(organization?._id);

  const activeProfile = orgData?.profile || profile || {};
  const activeOrg = orgData?.organization || organization || {};

  const [stage, setStage] = useState(activeProfile.stage || "MVP");
  const [dpiitNumber, setDpiitNumber] = useState(
    activeProfile.dpiitRecognitionNumber || "DIPP-MH-2024-8849"
  );
  const [teamSize, setTeamSize] = useState(activeProfile.teamSize || 12);
  const [selectedSectors, setSelectedSectors] = useState(
    activeProfile.sectors || ["GovTech & Public Delivery", "Clean Energy & Climate"]
  );
  const [newCapability, setNewCapability] = useState("");
  const [capabilities, setCapabilities] = useState(
    activeProfile.capabilities || [
      "Real-time IoT Sensor Telemetry",
      "Edge Computing & Offline-First Sync",
      "Explainable AI Inference Pipelines",
    ]
  );

  const toggleSector = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const addCapability = (e) => {
    e.preventDefault();
    if (!newCapability.trim()) return;
    if (!capabilities.includes(newCapability.trim())) {
      setCapabilities((prev) => [...prev, newCapability.trim()]);
    }
    setNewCapability("");
  };

  const removeCapability = (cap) => {
    setCapabilities((prev) => prev.filter((c) => c !== cap));
  };

  const handleSave = async () => {
    if (!organization?._id) {
      toast.error("No active organization found");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        stage,
        dpiitRecognitionNumber: dpiitNumber.trim() || null,
        teamSize: Number(teamSize) || 1,
        sectors: selectedSectors,
        capabilities,
      });
      if (refetchSession) refetchSession();
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Sovereign Innovator Credentials
            </span>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] gap-1">
              <ShieldCheck className="h-3 w-3" />
              DPIIT Recognized
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F] tracking-tight">
            Startup Passport
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Maintain your official capabilities and statutory prior-turnover exemption credentials for government procurement.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="gap-1.5 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-sm self-start sm:self-auto"
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Passport
        </Button>
      </div>

      {/* Statutory Exemption Status Card */}
      <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-white to-white shadow-2xs rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Statutory Exemption Certificate
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Maharashtra Startup Mandate 2024
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            As a registered startup recognized by DPIIT, this organization is legally exempt from past annual turnover and 3+ year prior experience requirements across all outcome-based challenge tenders in Maharashtra.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-[#10233F] font-semibold">
              <FileCheck className="h-4 w-4 text-blue-600" />
              DPIIT Number: <span className="font-mono text-[#2563EB]">{dpiitNumber || "Pending"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#10233F] font-semibold">
              <Globe className="h-4 w-4 text-slate-500" />
              Jurisdiction: <span>Maharashtra, India</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Overview Form */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-[#10233F]">
            Organization Identity
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            Basic profile details verified against DigiLocker and DPIIT database
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]">
                Legal Entity Name
              </label>
              <Input
                value={activeOrg.name || "My Startup Innovations Pvt Ltd"}
                disabled
                className="h-10 text-xs bg-slate-50 text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]">
                DPIIT Recognition Number
              </label>
              <Input
                value={dpiitNumber}
                onChange={(e) => setDpiitNumber(e.target.value)}
                placeholder="e.g. DIPP-MH-2024-XXXX"
                className="h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]">
                Core Team Size
              </label>
              <Input
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]">
                Website / Repository
              </label>
              <Input
                value={activeOrg.website || "https://innovations.example.com"}
                disabled
                className="h-10 text-xs bg-slate-50 text-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venture Stage Selector */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-[#10233F]">
            Technology Maturity Stage
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            Indicate your current product readiness to match suitable sandbox pilots
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STAGE_OPTIONS.map((opt) => {
              const selected = stage === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStage(opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? "border-[#2563EB] bg-blue-50/60 ring-2 ring-blue-100 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#10233F]">
                      {opt.label}
                    </span>
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-tight">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sector Alignment & Capabilities */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-[#10233F]">
            Sector Capabilities & Solution Tags
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            These capabilities are used by the Explainable AI engine to score challenge fit
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Sectors */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#10233F]">
              Primary Domain Focus
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SECTORS.map((sec) => {
                const active = selectedSectors.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleSector(sec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? "bg-[#10233F] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {sec} {active ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities List */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-[#10233F]">
              Specific Technical Capabilities & IP
            </span>
            <div className="flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-blue-200 bg-blue-50/60 text-[#1E3A65] text-xs font-medium"
                >
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeCapability(cap)}
                    className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Capability Form */}
            <form onSubmit={addCapability} className="flex gap-2 max-w-md pt-1">
              <Input
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                placeholder="e.g. Computer Vision edge detection..."
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" variant="outline" className="h-9 text-xs font-semibold shrink-0">
                Add Tag
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StartupPassport;
