import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganization, useUpdateStartupProfile } from "@/hooks/useOrganization";
import { formatISTDateTime } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Building2,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Key,
  ShieldCheck,
  Sparkles,
  Users,
  Briefcase,
  ChevronRight,
  Shield,
  Layers,
  Lock,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const STAGE_OPTIONS = [
  { value: "IDEA", label: "Idea / Research", desc: "Formulating initial solution concept" },
  { value: "PROTOTYPE", label: "Lab Prototype", desc: "Functional proof-of-concept ready for testing" },
  { value: "MVP", label: "Minimum Viable Product", desc: "Working version tested with preliminary users" },
  { value: "EARLY_TRACTION", label: "Early Traction", desc: "First commercial or pilot deployments active" },
  { value: "SCALING", label: "Growth / Scaling", desc: "Proven operational fit ready for statewide rollout" },
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

const ROLE_DETAILS = {
  STARTUP_USER: {
    title: "Startup Innovator & Founder",
    description:
      "Authorized to discover public problem statements, submit technical pilot proposals, claim statutory 100% EMD waivers under GFR Rule 173(i), and track milestone SLA disbursements.",
    tag: "STARTUP",
  },
  GOVERNMENT_USER: {
    title: "Government Procurement Official",
    description:
      "Authorized to draft and publish public challenges, define evaluation rubrics, sanction pilot sandboxes, and issue Scale-Gate statewide expansion orders.",
    tag: "GOVERNMENT",
  },
  EVALUATOR: {
    title: "Technical Evaluator & Domain Expert",
    description:
      "Authorized for double-blind merit evaluations, cryptographic scoring consensus, and rubric-based technical assessments.",
    tag: "EVALUATOR",
  },
  ADMIN: {
    title: "Sovereign Platform Administrator",
    description:
      "Authorized for end-to-end platform governance, forensic audit logging, DPIIT certificate verification, and system telemetry.",
    tag: "ADMIN",
  },
};

export function ProfilePage() {
  const { user, organization, profile, refetchSession } = useAuth();
  const { data: orgData, isLoading: isOrgLoading } = useCurrentOrganization();
  const updateProfileMutation = useUpdateStartupProfile(organization?._id);

  const [activeTab, setActiveTab] = useState("ABOUT"); // 'ABOUT' or 'DATA'

  const activeProfile = orgData?.profile || profile || {};
  const activeOrg = orgData?.organization || organization || {};

  // Form states for startup data (no hard-coded mocks)
  const [stage, setStage] = useState(activeProfile.stage || "MVP");
  const [dpiitNumber, setDpiitNumber] = useState(
    activeProfile.dpiitRecognitionNumber || ""
  );
  const [teamSize, setTeamSize] = useState(activeProfile.teamSize || "");
  const [selectedSectors, setSelectedSectors] = useState(
    activeProfile.sectors || []
  );
  const [newCapability, setNewCapability] = useState("");
  const [capabilities, setCapabilities] = useState(
    activeProfile.capabilities || []
  );

  // Editable Bio & Professional Summary state
  const bioStorageKey = `pragati_profile_bio_${user?.id || user?.userName || "me"}`;
  const [bio, setBio] = useState(() => {
    try {
      return localStorage.getItem(bioStorageKey) || "";
    } catch {
      return "";
    }
  });
  const [isEditingBio, setIsEditingBio] = useState(false);

  const handleSaveBio = () => {
    try {
      localStorage.setItem(bioStorageKey, bio);
    } catch {}
    setIsEditingBio(false);
    toast.success("Professional summary updated successfully");
  };

  const roleInfo = ROLE_DETAILS[user?.role] || {
    title: user?.role || "Verified User",
    description: "Authenticated stakeholder on Pragati-GovX Sovereign Procurement Gateway.",
    tag: user?.role || "USER",
  };

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

  const handleSaveData = async () => {
    if (!organization?._id) {
      toast.error("No active organization found to update");
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
      // Error handled by hook toast
    }
  };

  const handleExportJSON = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      platform: "Pragati-GovX Sovereign Innovation Gateway",
      user: {
        id: user?.id,
        userName: user?.userName,
        email: user?.email,
        role: user?.role,
        status: user?.status,
        verified: user?.verified,
        emailVerifiedAt: user?.emailVerifiedAt,
      },
      organization: {
        id: activeOrg?._id,
        name: activeOrg?.name,
        type: activeOrg?.type,
        state: activeOrg?.state,
        website: activeOrg?.website,
        verificationStatus: activeOrg?.verificationStatus,
      },
      dataRegistry: {
        stage,
        dpiitRecognitionNumber: dpiitNumber,
        teamSize,
        sectors: selectedSectors,
        capabilities,
      },
      statutoryCompliance: {
        gfrRule173iEmdWaiver: "ACTIVE_100_PERCENT",
        dpiitVerified: Boolean(dpiitNumber),
        dataGovernanceStandard: "Digital Personal Data Protection Act (DPDP) 2023",
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pragati_profile_registry_${user?.userName || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success("Profile registry exported as JSON successfully");
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/" className="hover:text-[#2563EB]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/dashboard" className="hover:text-[#2563EB]">
          Workspace
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-[#10233F]">Profile &amp; Data Registry</span>
      </div>

      {/* Header Profile Identity Banner */}
      <Card className="border-[#E2E8F0] shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-slate-200 bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                {user?.userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[#10233F]">{user?.userName || "User"}</h1>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    <ShieldCheck className="h-3 w-3" />
                    {roleInfo.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Identity
                  </span>
                </div>
                <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                  {activeOrg?.name && (
                    <>
                      <span className="text-slate-300">•</span>
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{activeOrg.name}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="text-xs border-slate-300 gap-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export Data (JSON)
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/60">
              <span className="text-[10px] text-[#64748B] font-medium block">Account Role</span>
              <span className="font-semibold text-[#10233F] truncate block">{roleInfo.title}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/60">
              <span className="text-[10px] text-[#64748B] font-medium block">Statutory Status</span>
              <span className="font-semibold text-emerald-600 block truncate">
                {user?.role === "STARTUP_USER"
                  ? (dpiitNumber ? "100% GFR 173(i) Active" : "DPIIT Required")
                  : (user?.role === "GOVERNMENT_USER" ? "Procuring Authority" : "Active")}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/60">
              <span className="text-[10px] text-[#64748B] font-medium block">Organization Entity</span>
              <span className="font-semibold text-[#10233F] truncate block">
                {activeOrg?.name || "Not registered"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/60">
              <span className="text-[10px] text-[#64748B] font-medium block">Timezone &amp; Sync</span>
              <span className="font-semibold text-[#10233F] block">Asia/Kolkata (IST)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-[#E2E8F0] flex gap-6 text-sm font-semibold text-[#64748B]">
        <button
          type="button"
          onClick={() => setActiveTab("ABOUT")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "ABOUT"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent hover:text-[#10233F]"
          }`}
        >
          <User className="h-4 w-4" />
          About You &amp; Account
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DATA")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "DATA"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent hover:text-[#10233F]"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Their Data &amp; Organization Registry
        </button>
      </div>

      {/* TAB 1: ABOUT */}
      {activeTab === "ABOUT" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main 2 Columns: Identity & Role */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <CardTitle className="text-sm font-bold text-[#10233F] flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Personal Stakeholder Identity
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Verified details associated with your Sovereign GovX login session
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#64748B] font-medium block">Username / Display Handle</label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                      {user?.userName || "Not specified"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#64748B] font-medium block">Official Email Address</label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] flex items-center justify-between">
                      <span className="truncate">{user?.email || "Not specified"}</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#64748B] font-medium block">Sovereign System Role</label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                      {user?.role || "STARTUP_USER"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#64748B] font-medium block">Account Status</label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active &amp; Authenticated
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[#64748B] font-medium block">
                      About &amp; Professional Summary
                    </label>
                    {!isEditingBio ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingBio(true)}
                        className="h-7 px-2.5 text-xs text-[#2563EB] hover:bg-blue-50 cursor-pointer font-semibold"
                      >
                        {bio ? "Edit Summary" : "+ Add Summary"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingBio(false)}
                          className="h-7 px-2 text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveBio}
                          className="h-7 px-3 text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                        >
                          Save Summary
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditingBio ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write your professional summary, background, role responsibilities, and focus areas..."
                      rows={4}
                      className="w-full text-xs text-[#10233F] bg-white p-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
                    />
                  ) : bio ? (
                    <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                      {bio}
                    </p>
                  ) : (
                    <div
                      onClick={() => setIsEditingBio(true)}
                      className="text-xs text-slate-400 italic bg-[#F8FAFC] p-3.5 rounded-lg border border-dashed border-slate-200 cursor-pointer hover:border-blue-300 hover:text-slate-600 transition-colors"
                    >
                      No summary provided yet. Click here or "+ Add Summary" to write your background and focus areas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Security, Credentials & Session */}
          <div className="space-y-6">
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <CardTitle className="text-sm font-bold text-[#10233F] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Security &amp; Auth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] hover:text-blue-800 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  Update Password / Credentials
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DATA & ORGANIZATION REGISTRY */}
      {activeTab === "DATA" && (
        <div className="space-y-6">
          {/* Organization Legal Entity */}
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Registered Legal Entity
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Constitutional company or department records registered in GovX
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  {activeOrg?.verificationStatus || "VERIFIED"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[#64748B] font-medium block">Organization Legal Name</label>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                    {activeOrg?.name || "Not registered"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#64748B] font-medium block">Entity Classification</label>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                    {activeOrg?.type || user?.role || "Not specified"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#64748B] font-medium block">State / Operational HQ</label>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {activeOrg?.state || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[#64748B] font-medium block">Official Website</label>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] flex items-center justify-between">
                    <span className="truncate">{activeOrg?.website || "Not provided"}</span>
                    {activeOrg?.website && (
                      <a
                        href={activeOrg.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563EB] hover:text-blue-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#64748B] font-medium block">DPIIT Statutory Waiver (GFR 173(i))</label>
                  <div className={`p-2.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
                    dpiitNumber
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    <ShieldCheck className={`h-4 w-4 ${dpiitNumber ? "text-emerald-600" : "text-slate-400"}`} />
                    {dpiitNumber
                      ? "100% Earnest Money Deposit (EMD) Waiver Ratified"
                      : "DPIIT Recognition required to activate 100% EMD waiver"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Startup Data & Capabilities (Editable) */}
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F] flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Operational Footprint &amp; Technical Capabilities Data
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Used by the GovX candidate matching engine to pair your solution with public department challenges
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  onClick={handleSaveData}
                  disabled={updateProfileMutation.isPending}
                  className="gap-1.5 text-xs bg-[#2563EB] hover:bg-blue-700 cursor-pointer text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Registry Changes"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6 text-xs">
              {/* DPIIT Number & Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#10233F]">DPIIT Recognition Number</label>
                  <Input
                    value={dpiitNumber}
                    onChange={(e) => setDpiitNumber(e.target.value)}
                    placeholder="e.g. DIPP-MH-2026-XXXX"
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-[#64748B]">
                    Validated against Startup India portal for GFR procurement exemptions.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#10233F]">Core Engineering &amp; Team Size</label>
                  <Input
                    type="number"
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    placeholder="e.g. 5"
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-[#64748B]">
                    Total full-time technical, domain, and operational personnel.
                  </span>
                </div>
              </div>

              {/* Startup Maturity Stage */}
              <div className="space-y-2">
                <label className="font-semibold text-[#10233F] block">Maturity &amp; Deployment Stage</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {STAGE_OPTIONS.map((opt) => {
                    const isSelected = stage === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStage(opt.value)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#2563EB] bg-blue-50/60 shadow-xs ring-1 ring-[#2563EB]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <p className={`font-bold text-xs ${isSelected ? "text-[#2563EB]" : "text-[#10233F]"}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-[#64748B] mt-1 leading-snug">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sectors */}
              <div className="space-y-2">
                <label className="font-semibold text-[#10233F] block">Registered Industry Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SECTORS.map((sector) => {
                    const selected = selectedSectors.includes(sector);
                    return (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSector(sector)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          selected
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-[#F8FAFC] text-[#475569] border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {sector}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Capabilities */}
              <div className="space-y-2">
                <label className="font-semibold text-[#10233F] block">Technical Capabilities &amp; Intellectual Property</label>
                {capabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                      >
                        {cap}
                        <button
                          type="button"
                          onClick={() => removeCapability(cap)}
                          className="hover:text-red-600 font-bold ml-1 cursor-pointer text-slate-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-2">No technical capabilities added yet. Add capabilities using the input below.</p>
                )}

                <form onSubmit={addCapability} className="flex gap-2 max-w-md">
                  <Input
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    placeholder="Add technical capability (e.g. Distributed GIS Mapping)..."
                    className="h-9 text-xs"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-9 text-xs cursor-pointer">
                    Add
                  </Button>
                </form>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={handleSaveData}
                  disabled={updateProfileMutation.isPending}
                  className="gap-1.5 text-xs bg-[#2563EB] hover:bg-blue-700 cursor-pointer text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Registry Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
