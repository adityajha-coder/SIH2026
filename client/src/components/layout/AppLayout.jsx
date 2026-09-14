import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  CheckSquare, 
  Sliders, 
  ShieldAlert, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  User,
  Home
} from "lucide-react";
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

// Strictly authorized navigation according to user role
const ROLE_NAV_CONFIG = {
  STARTUP_USER: [
    { label: "Startup Dashboard", href: "/startup/dashboard", icon: LayoutDashboard },
    { label: "Find Challenges", href: "/challenges", icon: FileText },
    { label: "My Applications", href: "/startup/submissions", icon: Send },
    { label: "Startup Passport", href: "/startup/profile", icon: FileText },
    { label: "Profile & Settings", href: "/profile", icon: User },
  ],
  GOVERNMENT_USER: [
    { label: "Command Center", href: "/government/dashboard", icon: LayoutDashboard },
    { label: "Challenge Studio", href: "/government/challenges/new", icon: Sliders },
    { label: "Public Challenges", href: "/challenges", icon: FileText },
    { label: "Department Affiliation", href: "/profile", icon: User },
  ],
  EVALUATOR: [
    { label: "Evaluations Queue", href: "/evaluator/queue", icon: CheckSquare },
    { label: "Problem Statements", href: "/challenges", icon: FileText },
    { label: "Evaluator Credentials", href: "/profile", icon: User },
  ],
  ADMIN: [
    { label: "Forensic Audit Trail", href: "/admin/audit", icon: ShieldAlert },
    { label: "Department Command", href: "/government/dashboard", icon: LayoutDashboard },
    { label: "Challenge Studio", href: "/government/challenges/new", icon: Sliders },
    { label: "Evaluations Queue", href: "/evaluator/queue", icon: CheckSquare },
    { label: "Public Challenges", href: "/challenges", icon: FileText },
    { label: "System Profile", href: "/profile", icon: User },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const Icon = item.icon;
    const active =
      location.pathname === item.href ||
      (item.href !== "/" &&
        item.href !== getRoleDashboardPath(userRole) &&
        location.pathname.startsWith(`${item.href}/`));
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all",
          active
            ? "bg-[#2563EB] text-white shadow-xs"
            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#10233F]"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#E2E8F0] bg-white">
        {/* Brand header */}
        <Link
          to="/"
          title="Return to Sovereign Portal Home"
          className="h-16 flex items-center gap-3 px-6 border-b border-[#E2E8F0] hover:bg-slate-50/80 transition-colors"
        >
          <img
            src={logoImg}
            alt="Pragati-GovX"
            className="h-8 w-auto object-contain rounded-md"
          />
          <div>
            <h1 className="font-bold text-sm text-[#10233F]">Pragati-GovX</h1>
            <span className="text-[10px] text-[#64748B] font-medium">Console</span>
          </div>
        </Link>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1">
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
            <div className="h-8 w-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
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
                <p className="mt-1 truncate text-[10px] text-[#64748B]">
                  {organization.name}
                </p>
              )}
            </div>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-[#DC2626] hover:bg-red-50 hover:text-[#DC2626] border-red-100 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close workspace navigation"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-[#E2E8F0] bg-white shadow-xl">
            <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-[#E2E8F0]">
              <Link to="/" className="flex items-center gap-3" title="Return to Sovereign Portal Home">
                <img
                  src={logoImg}
                  alt="Pragati-GovX"
                  className="h-8 w-auto object-contain rounded-md"
                />
                <div>
                  <h1 className="font-bold text-sm text-[#10233F]">Pragati-GovX</h1>
                  <span className="text-[10px] text-[#64748B] font-medium">Console</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close workspace navigation"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 px-3 py-4 space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {sectionLabel}
              </div>
              {roleNavItems.map(renderNavItem)}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 glass-nav flex items-center justify-between px-4 sm:px-8 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open workspace navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-[#64748B]">
              <Link to="/" className="hover:text-[#2563EB] flex items-center gap-1 font-medium transition-colors">
                <Home className="h-3.5 w-3.5 text-blue-600" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <Link to={getRoleDashboardPath(userRole)} className="hover:text-[#10233F] transition-colors">
                Workspace
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="truncate font-semibold text-[#10233F]">
                {getBreadcrumbTitle(location.pathname)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authorization & Affiliation Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs">
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

            <Link
              to="/notifications"
              title="Universal Notification Hub"
              className="relative p-2 rounded-lg text-[#64748B] hover:text-[#10233F] hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB]" />
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
