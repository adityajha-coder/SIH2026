import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoleDashboardPath } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

const ROLE_DISPLAY_NAMES = {
  STARTUP_USER: "Verified Startup",
  GOVERNMENT_USER: "Nodal Officer",
  EVALUATOR: "Technical Validator",
  ADMIN: "System Administrator",
};

const ROLE_SECTION_LABELS = {
  STARTUP_USER: "Startup Workspace",
  GOVERNMENT_USER: "Department Workspace",
  EVALUATOR: "Validation Workspace",
  ADMIN: "Administration Console",
};

// Strictly authorized navigation according to user role (Icon-free)
const ROLE_NAV_CONFIG = {
  STARTUP_USER: [
    { label: "Startup Dashboard", href: "/startup/dashboard" },
    { label: "Find Challenges", href: "/challenges" },
    { label: "My Applications", href: "/startup/submissions" },
    { label: "Startup Passport", href: "/startup/profile" },
    { label: "Profile & Settings", href: "/profile" },
  ],
  GOVERNMENT_USER: [
    { label: "Command Center", href: "/government/dashboard" },
    { label: "Challenge Studio", href: "/government/challenges/new" },
    { label: "Public Challenges", href: "/challenges" },
    { label: "Department Affiliation", href: "/profile" },
  ],
  EVALUATOR: [
    { label: "Evaluations Queue", href: "/evaluator/queue" },
    { label: "Problem Statements", href: "/challenges" },
    { label: "Evaluator Credentials", href: "/profile" },
  ],
  ADMIN: [
    { label: "Forensic Audit Trail", href: "/admin/audit" },
    { label: "Department Command", href: "/government/dashboard" },
    { label: "Challenge Studio", href: "/government/challenges/new" },
    { label: "Evaluations Queue", href: "/evaluator/queue" },
    { label: "Public Challenges", href: "/challenges" },
    { label: "System Profile", href: "/profile" },
  ],
};

const getBreadcrumbTitle = (pathname) => {
  if (pathname === "/government/dashboard") return "Department Command Center";
  if (pathname === "/government/challenges/new") return "Challenge Studio";
  if (pathname.includes("/matching")) return "AI Candidate Matching";
  if (pathname === "/startup/dashboard") return "Startup Dashboard";
  if (pathname === "/startup/submissions") return "My Applications";
  if (pathname === "/startup/profile") return "Startup Passport";
  if (pathname === "/evaluator/queue") return "Evaluations Queue";
  if (pathname.startsWith("/evaluator/evaluate")) return "Evaluation Room";
  if (pathname === "/admin/audit") return "Forensic Audit Console";
  if (pathname === "/profile") return "Profile & Affiliation";
  if (pathname === "/challenges") return "Public Challenges";
  if (pathname === "/notifications") return "Notification Hub";
  if (pathname.startsWith("/pilots")) return "Pilot Canvas";
  return pathname.replace("/", "").replace(/-/g, " ") || "Overview";
};

export function AppLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, logout } = useAuth();
  const { data: notifsData } = useNotifications();
  const unreadCount = notifsData?.unreadCount ?? 0;
  const userRole = user?.role || "STARTUP_USER";
  const userName = user?.userName || "User";

  const roleNavItems = ROLE_NAV_CONFIG[userRole] || ROLE_NAV_CONFIG.STARTUP_USER;
  const sectionLabel = ROLE_SECTION_LABELS[userRole] || "Workspace";
  const roleDisplay = ROLE_DISPLAY_NAMES[userRole] || "Member";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const renderNavItem = (item) => {
    const active =
      location.pathname === item.href ||
      (item.href !== "/" &&
        item.href !== getRoleDashboardPath(userRole) &&
        location.pathname.startsWith(`${item.href}/`));
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setMobileSidebarOpen(false)}
        className={cn(
          "flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold transition-all",
          active
            ? "bg-[#2563EB] text-white shadow-xs"
            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#10233F]"
        )}
      >
        <span>{item.label}</span>
        {active && (
          <span className="text-[9px] uppercase tracking-wider font-mono opacity-80">
            Active
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {/* Desktop Sidebar (Collapsible / Toggleable) */}
      {sidebarVisible && (
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#E2E8F0] bg-white shrink-0 transition-all duration-200">
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
            <Link
              to="/"
              title="Return to Portal Home"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <img
                src={logoImg}
                alt="Pragati-GovX"
                className="h-7 w-auto object-contain rounded"
              />
              <div>
                <h1 className="font-bold text-xs text-[#10233F]">Pragati-GovX</h1>
                <span className="text-[10px] text-[#64748B] font-medium block -mt-0.5">
                  Console
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarVisible(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#10233F] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation list */}
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {sectionLabel}
            </div>
            {roleNavItems.map(renderNavItem)}
          </div>

          {/* User Card & Logout */}
          <div className="p-4 border-t border-[#E2E8F0] space-y-3">
            <Link
              to="/profile"
              title="View Profile & Data"
              className="flex items-center gap-3 p-1.5 -m-1.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#10233F] truncate group-hover:text-blue-600 transition-colors">
                  {userName}
                </p>
                <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#2563EB] border border-blue-200/60">
                  {roleDisplay}
                </span>
                {organization?.name && (
                  <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
                    {organization.name}
                  </p>
                )}
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-md border border-red-200 text-[#DC2626] hover:bg-red-50 transition-colors text-center cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close workspace navigation"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-[#E2E8F0] bg-white shadow-xl">
            <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-[#E2E8F0]">
              <Link
                to="/"
                className="flex items-center gap-2.5"
                title="Return to Portal Home"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <img
                  src={logoImg}
                  alt="Pragati-GovX"
                  className="h-7 w-auto object-contain rounded"
                />
                <div>
                  <h1 className="font-bold text-xs text-[#10233F]">Pragati-GovX</h1>
                  <span className="text-[10px] text-[#64748B] font-medium block -mt-0.5">
                    Console
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#10233F] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {sectionLabel}
              </div>
              {roleNavItems.map(renderNavItem)}
            </div>

            {/* Mobile User Card & Logout */}
            <div className="p-4 border-t border-[#E2E8F0] space-y-3">
              <Link
                to="/profile"
                onClick={() => setMobileSidebarOpen(false)}
                title="View Profile & Data"
                className="flex items-center gap-3 p-1.5 -m-1.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#10233F] truncate group-hover:text-blue-600 transition-colors">
                    {userName}
                  </p>
                  <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#2563EB] border border-blue-200/60">
                    {roleDisplay}
                  </span>
                  {organization?.name && (
                    <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
                      {organization.name}
                    </p>
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-md border border-red-200 text-[#DC2626] hover:bg-red-50 transition-colors text-center cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-8 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Icon Button (Obsidian / ChatGPT style - shown on mobile or when desktop sidebar is collapsed) */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setMobileSidebarOpen(true);
                } else {
                  setSidebarVisible(true);
                }
              }}
              className={cn(
                "p-2 rounded-lg text-slate-600 hover:text-[#10233F] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 border border-slate-200",
                sidebarVisible ? "lg:hidden" : "flex"
              )}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4 text-[#2563EB]" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-[#64748B]">
              <Link to="/" className="hover:text-[#2563EB] font-medium transition-colors">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                to={getRoleDashboardPath(userRole)}
                className="hover:text-[#10233F] transition-colors"
              >
                Workspace
              </Link>
              <span className="text-slate-300">/</span>
              <span className="truncate font-semibold text-[#10233F]">
                {getBreadcrumbTitle(location.pathname)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authorization & Affiliation Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs">
              <span className="font-semibold text-[#10233F]">
                {roleDisplay}
              </span>
              {organization?.name && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#2563EB] font-medium truncate max-w-[140px]">
                    {organization.name}
                  </span>
                </>
              )}
            </div>

            {/* Notification Center Link with Bell Icon */}
            <Link
              to="/notifications"
              title="Universal Notification Hub"
              aria-label="Universal Notification Hub"
              className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#10233F] hover:bg-slate-50 transition-colors flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

