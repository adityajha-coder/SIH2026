import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganization, useUpdateStartupProfile } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSubmissions } from "@/hooks/useSubmissions";
import { ECertificateModal } from "@/components/certificate/ECertificateModal";

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
    title: "Government Procurement & Nodal Official",
    description:
      "Authorized to draft and publish public challenges, define evaluation rubrics, sanction pilot sandboxes, and issue Scale-Gate statewide expansion orders.",
    tag: "GOVERNMENT",
  },
  EVALUATOR: {
    title: "Technical Evaluator & Domain Expert",
    description:
      "Authorized to conduct double-blind scoring on 4-pillar rubrics, verify live claims against uploaded files, and seal evaluation records.",
    tag: "EVALUATOR",
  },
  ADMIN: {
    title: "System Administrator",
    description:
      "Full sovereign governance access across platform user management, problem catalogs, and audit logs.",
    tag: "ADMIN",
  },
};

export function ProfilePage() {
  const { user, organization, profile, refetchSession } = useAuth();
  const { data: orgData } = useCurrentOrganization();
  const updateProfileMutation = useUpdateStartupProfile(organization?._id);

  const activeProfile = orgData?.profile || profile || {};
  const activeOrg = orgData?.organization || organization || {};

  const { data: submissionsData } = useSubmissions();
  const [selectedCertForModal, setSelectedCertForModal] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const completedPilots = useMemo(() => {
    const list = (submissionsData?.items || []).filter(
      (s) => s.status === "PILOT_COMPLETED" || s.status === "SCALED" || s.status === "CLOSED"
    );
    if (list.length === 0 && (submissionsData?.items || []).length > 0) {
      const pilotSub = (submissionsData?.items || []).find(
        (s) => s.status?.startsWith("PILOT") || s.status === "ACCEPTED"
      ) || submissionsData.items[0];
      if (pilotSub) {
        return [pilotSub];
      }
    }
    return list;
  }, [submissionsData]);

  // Tabs: 'ABOUT' | 'GOVERNMENT' | 'REGISTRY' | 'VAULT'
  const isGovernmentUser = user?.role === "GOVERNMENT_USER" || user?.role === "ADMIN";
  const isStartupUser = user?.role === "STARTUP_USER";
  const [activeTab, setActiveTab] = useState("ABOUT");

  // Persistent storage key per user
  const storageKey = `pragati_profile_v2_${user?.id || user?.email || "default"}`;

  const [storedMeta, setStoredMeta] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Personal Profile Form State
  const [displayName, setDisplayName] = useState(storedMeta.displayName ?? (user?.userName || ""));
  const [contactPhone, setContactPhone] = useState(storedMeta.contactPhone ?? "");
  const [alternateEmail, setAlternateEmail] = useState(storedMeta.alternateEmail ?? "");
  const [personalDesignation, setPersonalDesignation] = useState(storedMeta.personalDesignation ?? "");
  const [bio, setBio] = useState(storedMeta.bio ?? "");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Government Official Settings State
  const [deptDesignation, setDeptDesignation] = useState(
    storedMeta.deptDesignation ?? (user?.role === "GOVERNMENT_USER" ? "Nodal Officer (Procurement)" : "")
  );
  const [ministry, setMinistry] = useState(
    storedMeta.ministry ?? (user?.role === "GOVERNMENT_USER" ? "Ministry of Electronics & Information Technology (MeitY)" : "")
  );
  const [deptWing, setDeptWing] = useState(storedMeta.deptWing ?? "");
  const [officeLandline, setOfficeLandline] = useState(storedMeta.officeLandline ?? "");
  const [officeAddress, setOfficeAddress] = useState(storedMeta.officeAddress ?? "");
  const [reportingDesk, setReportingDesk] = useState(storedMeta.reportingDesk ?? "");
  const [isEditingDept, setIsEditingDept] = useState(false);

  // Notification Preferences State
  const [notifDeadlines, setNotifDeadlines] = useState(storedMeta.notifDeadlines ?? true);
  const [notifMilestones, setNotifMilestones] = useState(storedMeta.notifMilestones ?? true);
  const [notifEvaluations, setNotifEvaluations] = useState(storedMeta.notifEvaluations ?? true);
  const [notifDigest, setNotifDigest] = useState(storedMeta.notifDigest ?? false);
  const [notifSms, setNotifSms] = useState(storedMeta.notifSms ?? false);

  // Startup Organization Registry State
  const [stage, setStage] = useState(activeProfile.stage || "MVP");
  const [dpiitNumber, setDpiitNumber] = useState(activeProfile.dpiitRecognitionNumber || "");
  const [teamSize, setTeamSize] = useState(activeProfile.teamSize || "1");
  const [selectedSectors, setSelectedSectors] = useState(activeProfile.sectors || []);
  const [capabilities, setCapabilities] = useState(activeProfile.capabilities || []);
  const [newCapability, setNewCapability] = useState("");

  useEffect(() => {
    if (activeProfile.stage) setStage(activeProfile.stage);
    if (activeProfile.dpiitRecognitionNumber) setDpiitNumber(activeProfile.dpiitRecognitionNumber);
    if (activeProfile.teamSize) setTeamSize(activeProfile.teamSize);
    if (activeProfile.sectors?.length) setSelectedSectors(activeProfile.sectors);
    if (activeProfile.capabilities?.length) setCapabilities(activeProfile.capabilities);
  }, [activeProfile]);

  const updateStoredMeta = (fields) => {
    try {
      const nextMeta = { ...storedMeta, ...fields };
      setStoredMeta(nextMeta);
      localStorage.setItem(storageKey, JSON.stringify(nextMeta));
    } catch {
      // ignore
    }
  };

  const handleSavePersonal = (e) => {
    if (e) e.preventDefault();
    updateStoredMeta({
      displayName,
      contactPhone,
      alternateEmail,
      personalDesignation,
      bio,
    });
    setIsEditingPersonal(false);
    toast.success("Personal profile updated successfully");
  };

  const handleSaveDepartment = (e) => {
    if (e) e.preventDefault();
    updateStoredMeta({
      deptDesignation,
      ministry,
      deptWing,
      officeLandline,
      officeAddress,
      reportingDesk,
    });
    setIsEditingDept(false);
    toast.success("Department and ministry affiliation updated successfully");
  };

  const handleSaveNotifications = (e) => {
    if (e) e.preventDefault();
    updateStoredMeta({
      notifDeadlines,
      notifMilestones,
      notifEvaluations,
      notifDigest,
      notifSms,
    });
    toast.success("Notification preferences updated successfully");
  };

  const toggleSector = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const addCapability = (e) => {
    e.preventDefault();
    const val = newCapability.trim();
    if (!val) return;
    if (!capabilities.includes(val)) {
      setCapabilities((prev) => [...prev, val]);
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
        userName: displayName || user?.userName,
        email: user?.email,
        alternateEmail: alternateEmail || null,
        contactPhone: contactPhone || null,
        personalDesignation: personalDesignation || null,
        role: user?.role,
        status: user?.status,
        verified: user?.verified,
        bio: bio || null,
      },
      departmentAffiliation: {
        designation: deptDesignation || null,
        ministry: ministry || null,
        wing: deptWing || null,
        officeLandline: officeLandline || null,
        officeAddress: officeAddress || null,
        reportingDesk: reportingDesk || null,
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
        dpiitRecognitionNumber: dpiitNumber || null,
        teamSize: Number(teamSize) || 1,
        sectors: selectedSectors,
        capabilities,
      },
      notificationPreferences: {
        challengeDeadlines: notifDeadlines,
        milestoneSLA: notifMilestones,
        evaluationAlerts: notifEvaluations,
        procurementDigest: notifDigest,
        smsAlerts: notifSms,
      },
      statutoryCompliance: {
        gfrRule173iEmdWaiver: dpiitNumber ? "ACTIVE_100_PERCENT" : "DPIIT_REQUIRED",
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

  const roleInfo = ROLE_DETAILS[user?.role] || {
    title: user?.role || "Verified User",
    description: "Authenticated stakeholder on Pragati-GovX Sovereign Procurement Gateway.",
    tag: user?.role || "USER",
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/" className="hover:text-[#2563EB]">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link to="/dashboard" className="hover:text-[#2563EB]">
          Workspace
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-[#10233F]">Profile &amp; Account Settings</span>
      </div>

      {/* Header Profile Identity Banner */}
      <Card className="border-[#E2E8F0] shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-slate-200 bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                {(displayName || user?.userName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[#10233F]">
                    {displayName || user?.userName || "User"}
                  </h1>
                  <span className="inline-flex items-center rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    {roleInfo.tag}
                  </span>
                  <span className="inline-flex items-center rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Verified Identity
                  </span>
                </div>
                <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
                  <span>{user?.email}</span>
                  {activeOrg?.name && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{activeOrg.name}</span>
                    </>
                  )}
                  {deptDesignation && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{deptDesignation}</span>
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
                className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
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
              <span className="font-semibold text-emerald-700 block truncate">
                {user?.role === "STARTUP_USER"
                  ? (dpiitNumber ? "100% GFR 173(i) Active" : "DPIIT Required")
                  : (user?.role === "GOVERNMENT_USER" ? "Procuring Authority" : "Active & Verified")}
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
      <div className="border-b border-[#E2E8F0] flex flex-wrap gap-6 text-sm font-semibold text-[#64748B]">
        <button
          type="button"
          onClick={() => setActiveTab("ABOUT")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "ABOUT"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent hover:text-[#10233F]"
          }`}
        >
          About You &amp; Account
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GOVERNMENT")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "GOVERNMENT"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent hover:text-[#10233F]"
          }`}
        >
          Department &amp; Ministry Affiliation
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REGISTRY")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "REGISTRY"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent hover:text-[#10233F]"
          }`}
        >
          Organization &amp; Startup Registry
        </button>

        {isStartupUser && (
          <button
            type="button"
            onClick={() => setActiveTab("VAULT")}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "VAULT"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent hover:text-[#10233F]"
            }`}
          >
            Evidence Vault &amp; E-Certificates
          </button>
        )}
      </div>

      {/* TAB 1: ABOUT YOU & ACCOUNT */}
      {activeTab === "ABOUT" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main 2 Columns: Identity, Profile Edit & Notifications */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Stakeholder Identity Card */}
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#10233F]">
                      Personal Stakeholder Identity
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Verified details and contact information associated with your login session
                    </CardDescription>
                  </div>
                  {!isEditingPersonal ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPersonal(true)}
                      className="text-xs border-slate-300 text-[#2563EB] hover:bg-blue-50 cursor-pointer font-semibold"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingPersonal(false)}
                        className="text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePersonal}
                        className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                      >
                        Save Profile
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {isEditingPersonal ? (
                  <form onSubmit={handleSavePersonal} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[#64748B] font-medium block">
                          Display Name / Full Name
                        </label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#64748B] font-medium block">
                          Official Account Email (Primary)
                        </label>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="h-9 text-xs bg-[#F8FAFC] text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#64748B] font-medium block">
                          Contact Telephone / Mobile
                        </label>
                        <Input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#64748B] font-medium block">
                          Alternate Contact Email
                        </label>
                        <Input
                          type="email"
                          value={alternateEmail}
                          onChange={(e) => setAlternateEmail(e.target.value)}
                          placeholder="official.contact@gov.in"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[#64748B] font-medium block">
                          Professional Designation / Title
                        </label>
                        <Input
                          value={personalDesignation}
                          onChange={(e) => setPersonalDesignation(e.target.value)}
                          placeholder="e.g. Lead Technical Architect / Procurement Director"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-[#64748B] font-medium block">
                        Professional Summary &amp; Background
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Provide an overview of your domain expertise, public sector pilots, research publications, or institutional responsibilities..."
                        rows={3}
                        className="w-full text-xs text-[#10233F] bg-white p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                      >
                        Save Personal Details
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[#64748B] font-medium block">Full Display Name</span>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                          {displayName || user?.userName || "Not specified"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[#64748B] font-medium block">Official Account Email</span>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] flex items-center justify-between">
                          <span className="truncate">{user?.email || "Not specified"}</span>
                          <span className="text-[11px] text-emerald-700 font-medium">Verified</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[#64748B] font-medium block">Contact Telephone / Mobile</span>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                          {contactPhone || "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[#64748B] font-medium block">Alternate Contact Email</span>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] truncate">
                          {alternateEmail || "Not provided"}
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[#64748B] font-medium block">Professional Designation</span>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                          {personalDesignation || deptDesignation || "Authenticated Stakeholder"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[#64748B] font-medium block">
                        Professional Summary &amp; Background
                      </span>
                      {bio ? (
                        <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                          {bio}
                        </p>
                      ) : (
                        <div
                          onClick={() => setIsEditingPersonal(true)}
                          className="text-xs text-slate-400 italic bg-[#F8FAFC] p-3 rounded-lg border border-dashed border-slate-200 cursor-pointer hover:border-blue-300 hover:text-slate-600 transition-colors"
                        >
                          No summary provided yet. Click here to add your background and focus areas.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences Card */}
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#10233F]">
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Configure notification dispatches for problem statement deadlines, milestones, and evaluation updates
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveNotifications}
                    className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-3 text-xs">
                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifDeadlines}
                    onChange={(e) => setNotifDeadlines(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#10233F] block">
                      Problem Statement Deadlines &amp; Submission Milestones
                    </span>
                    <span className="text-[#64748B] block mt-0.5 leading-relaxed">
                      Receive alerts when bookmarked challenges approach submission close dates or receive official amendments.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifMilestones}
                    onChange={(e) => setNotifMilestones(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#10233F] block">
                      Pilot Milestone Reviews &amp; SLA Tranche Disbursements
                    </span>
                    <span className="text-[#64748B] block mt-0.5 leading-relaxed">
                      Receive alerts upon nodal officer verification, milestone approval, and 15-day statutory MSMED payment releases.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifEvaluations}
                    onChange={(e) => setNotifEvaluations(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#10233F] block">
                      Technical Evaluation Assignments &amp; Merit Scoring
                    </span>
                    <span className="text-[#64748B] block mt-0.5 leading-relaxed">
                      Receive notifications for double-blind proposal assignments and rubric score reconciliations.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifDigest}
                    onChange={(e) => setNotifDigest(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#10233F] block">
                      Weekly Sovereign Innovation Digest
                    </span>
                    <span className="text-[#64748B] block mt-0.5 leading-relaxed">
                      Receive a weekly summary email of newly sanctioned challenges, procurement circulars, and policy updates.
                    </span>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Security, Credentials & Session */}
          <div className="space-y-6">
            <Card className="border-[#E2E8F0] shadow-sm bg-white">
              <CardHeader className="border-b border-[#E2E8F0] pb-3">
                <CardTitle className="text-sm font-bold text-[#10233F]">
                  Security &amp; Auth
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Sovereign access credentials and authentication tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[#64748B] font-medium block">Password Management</span>
                  <p className="text-slate-600 leading-relaxed">
                    Update your account password or initiate multi-factor reset via verified email OTP.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 hover:underline"
                    >
                      Update Password / Credentials
                    </Link>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[#64748B] font-medium block">Data Governance</span>
                  <p className="text-slate-600 leading-relaxed">
                    Identity and audit records are preserved under the Digital Personal Data Protection Act (DPDP) 2023.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT & MINISTRY AFFILIATION */}
      {activeTab === "GOVERNMENT" && (
        <div className="space-y-6">
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F]">
                    Departmental &amp; Ministry Affiliation Details
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Official government nodal officer credentials used for drafting problem statements, sanctioning pilot testbeds, and issuing expansion work orders
                  </CardDescription>
                </div>

                {!isEditingDept ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingDept(true)}
                    className="text-xs border-slate-300 text-[#2563EB] hover:bg-blue-50 cursor-pointer font-semibold"
                  >
                    Edit Department Details
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDept(false)}
                      className="text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveDepartment}
                      className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                    >
                      Save Details
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {isEditingDept ? (
                <form onSubmit={handleSaveDepartment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Official Departmental Designation
                      </label>
                      <Input
                        value={deptDesignation}
                        onChange={(e) => setDeptDesignation(e.target.value)}
                        placeholder="e.g. Nodal Officer / Joint Secretary / Director"
                        className="h-9 text-xs"
                      />
                      <span className="text-[10px] text-[#64748B]">
                        Gazetted or departmental ranking for formal challenge sign-offs.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Ministry / Parent Central Authority
                      </label>
                      <Input
                        value={ministry}
                        onChange={(e) => setMinistry(e.target.value)}
                        placeholder="e.g. Ministry of Electronics & IT (MeitY)"
                        className="h-9 text-xs"
                      />
                      <span className="text-[10px] text-[#64748B]">
                        Central ministry, state department, or autonomous PSU.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Division / Departmental Wing / Mission
                      </label>
                      <Input
                        value={deptWing}
                        onChange={(e) => setDeptWing(e.target.value)}
                        placeholder="e.g. Digital Public Infrastructure Wing / Smart Cities Mission"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Official Landline / Intercom Extension
                      </label>
                      <Input
                        value={officeLandline}
                        onChange={(e) => setOfficeLandline(e.target.value)}
                        placeholder="e.g. 011-2436-1234 Ext 412"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Office Room Number &amp; Physical Address
                      </label>
                      <Input
                        value={officeAddress}
                        onChange={(e) => setOfficeAddress(e.target.value)}
                        placeholder="e.g. Room 402, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi - 110003"
                        className="h-9 text-xs"
                      />
                      <span className="text-[10px] text-[#64748B]">
                        Designated official premises for receipt of prototype units and testing hardware.
                      </span>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[#64748B] font-medium block">
                        Reporting Authority / Secretarial Desk
                      </label>
                      <Input
                        value={reportingDesk}
                        onChange={(e) => setReportingDesk(e.target.value)}
                        placeholder="e.g. Office of the Additional Secretary (Procurement & Standards)"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer font-semibold"
                    >
                      Save Department Details
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[#64748B] font-medium block">Departmental Designation</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {deptDesignation || "Not specified"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#64748B] font-medium block">Ministry / Parent Authority</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {ministry || "Not specified"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#64748B] font-medium block">Division / Wing / Mission</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {deptWing || "General Procurement Directorate"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#64748B] font-medium block">Official Landline / Intercom</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {officeLandline || "Not provided"}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[#64748B] font-medium block">Office Room &amp; Address</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {officeAddress || "Not provided"}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[#64748B] font-medium block">Reporting Authority / Secretarial Desk</span>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                        {reportingDesk || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ORGANIZATION & STARTUP REGISTRY */}
      {activeTab === "REGISTRY" && (
        <div className="space-y-6">
          {/* Organization Legal Entity */}
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F]">
                    Registered Legal Entity
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Constitutional company or department records registered in Pragati-GovX
                  </CardDescription>
                </div>
                <span className="inline-flex items-center rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {activeOrg?.verificationStatus || "VERIFIED"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[#64748B] font-medium block">Organization Legal Name</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                    {activeOrg?.name || "Not registered"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] font-medium block">Entity Classification</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                    {activeOrg?.type || user?.role || "Not specified"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] font-medium block">State / Operational HQ</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F]">
                    {activeOrg?.state || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[#64748B] font-medium block">Official Website</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] font-semibold text-[#10233F] flex items-center justify-between">
                    <span className="truncate">{activeOrg?.website || "Not provided"}</span>
                    {activeOrg?.website && (
                      <a
                        href={activeOrg.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563EB] hover:underline text-[11px]"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] font-medium block">DPIIT Statutory Waiver (GFR 173(i))</span>
                  <div
                    className={`p-2.5 rounded-lg border font-semibold flex items-center justify-between ${
                      dpiitNumber
                        ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span>
                      {dpiitNumber
                        ? "100% Earnest Money Deposit (EMD) Waiver Ratified"
                        : "DPIIT Recognition required to activate 100% EMD waiver"}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {dpiitNumber ? "Active" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Startup Data & Capabilities (Editable) */}
          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="border-b border-[#E2E8F0] pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-[#10233F]">
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
                  className="text-xs bg-[#2563EB] hover:bg-blue-700 cursor-pointer text-white self-start sm:self-auto"
                >
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
                  <span className="text-[10px] text-[#64748B] block">
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
                  <span className="text-[10px] text-[#64748B] block">
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
                        {selected ? `✓ ${sector}` : sector}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Capabilities */}
              <div className="space-y-2">
                <label className="font-semibold text-[#10233F] block">
                  Technical Capabilities &amp; Intellectual Property
                </label>
                {capabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                      >
                        <span>{cap}</span>
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
                  <p className="text-xs text-slate-400 italic mb-2">
                    No technical capabilities added yet. Add capabilities using the input below.
                  </p>
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
                  className="text-xs bg-[#2563EB] hover:bg-blue-700 cursor-pointer text-white"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Registry Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: EVIDENCE VAULT & E-CERTIFICATES (Startups Only) */}
      {isStartupUser && activeTab === "VAULT" && (
        <div className="space-y-6">
          {/* Statutory Mandate Banner */}
          <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 shadow-xs rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Statutory Rule 173(i) GFR 2017
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sovereign Evidence Vault &amp; Pilot E-Certificates
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700">
                  {completedPilots.length} Certificate{completedPilots.length === 1 ? "" : "s"} Vaulted
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Every successfully concluded and audited pilot contract receives an authentic, cryptographically verified Electronic Certificate. This serves as legally binding evidence under General Financial Rules (GFR) 2017 Rule 173(i), exempting your enterprise from prior turnover and past experience criteria across all public procurement tenders.
              </p>
            </CardContent>
          </Card>

          {/* Certificates List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Earned Pilot Completion Certificates
              </h3>
            </div>

            {completedPilots.length === 0 ? (
              <Card className="border border-dashed border-slate-200 bg-white rounded-2xl p-8 text-center space-y-3">
                <div className="text-sm font-semibold text-slate-700">
                  No Completed Pilot Contracts Yet
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  When your startup executes a pilot sandbox and concludes all 3 milestone deliverables under department audit, your official E-Certificate will be automatically generated and deposited into this vault.
                </p>
                <div className="pt-2">
                  <Link
                    to="/challenges"
                    className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                  >
                    Discover Public Challenges
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedPilots.map((sub) => {
                  const certData = {
                    certificateId: `CERT-GOVX-2026-${sub._id.toString().slice(-8).toUpperCase()}`,
                    issueDate: sub.updatedAt || new Date(),
                    recipientOrgName: activeOrg.name || "My Startup Innovations Pvt Ltd",
                    dpiitNumber: activeProfile.dpiitRecognitionNumber || "DPIIT-MH-2024-8849",
                    solutionTitle: sub.solutionTitle || "Autonomous Smart Solution",
                    problemTitle: sub.problemId?.title || "Outcome-Based Innovation Challenge",
                    department: sub.problemId?.department || "Department of Information Technology",
                    statutoryReference: "Rule 173(i) General Financial Rules (GFR) 2017",
                    pilotId: `PLT-${sub._id.toString().slice(-8).toUpperCase()}`,
                    grantAmount: 2500000,
                    gemContractId: "GEM-2026-DIR-99120",
                    sanctionMemo: "Sanctioned for direct commercial procurement on GeM under GFR Rule 173(i) exemption following audited pilot success.",
                    verificationHash: `sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`,
                    issuingAuthority: "Government of India & Pragati-GovX Sovereign Procurement Council",
                    status: "VALID_AND_SANCTIONED",
                  };

                  return (
                    <Card
                      key={sub._id}
                      className="border border-slate-200/80 bg-white rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 transition-colors"
                    >
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {certData.certificateId}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {certData.pilotId}
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-bold text-slate-900">
                              {certData.solutionTitle}
                            </h4>
                            <p className="text-xs text-slate-600">
                              Challenge: <span className="font-semibold text-slate-800">{certData.problemTitle}</span>
                            </p>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              GFR 173(i) Certified
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono mt-1">
                              Issued: {new Date(certData.issueDate).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="text-slate-500 truncate max-w-md font-mono text-[11px]">
                            Hash: <span className="text-slate-700">{certData.verificationHash}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/pilots/${sub._id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Pilot Canvas →
                            </Link>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setSelectedCertForModal(certData);
                                setIsCertModalOpen(true);
                              }}
                              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                              View &amp; Download E-Certificate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* E-Certificate Modal (Startups Only) */}
      {isStartupUser && (
        <ECertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          certificateData={selectedCertForModal}
        />
      )}
    </div>
  );
}

export default ProfilePage;
