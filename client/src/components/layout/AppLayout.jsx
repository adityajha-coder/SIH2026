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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRoleDashboardPath } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, logout } = useAuth();
  const userRole = user?.role || "STARTUP_USER";
  const userName = user?.userName || "User";

  const navItems = [
    { label: "Dashboard", href: getRoleDashboardPath(userRole), icon: LayoutDashboard, roles: ["ALL"] },
    { label: "Find Challenges", href: "/challenges", icon: FileText, roles: ["STARTUP_USER", "ALL"] },
    { label: "My Applications", href: "/startup/submissions", icon: Send, roles: ["STARTUP_USER"] },
    { label: "Startup Passport", href: "/startup/profile", icon: User, roles: ["STARTUP_USER"] },
    { label: "Challenge Studio", href: "/government/challenges/new", icon: Sliders, roles: ["GOVERNMENT_USER", "ADMIN"] },
    { label: "Evaluations Queue", href: "/evaluator/queue", icon: CheckSquare, roles: ["EVALUATOR", "ADMIN"] },
    { label: "Forensic Audit Trail", href: "/admin/audit", icon: ShieldAlert, roles: ["ADMIN"] },
  ];

  const filteredNav = navItems.filter(
    (item) => item.roles.includes("ALL") || item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.href;
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all",
          active
            ? "bg-[#2563EB] text-white shadow-sm"
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
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#E2E8F0]">
          <img
            src={logoImg}
            alt="Pragati-GovX"
            className="h-8 w-auto object-contain rounded-md"
          />
          <div>
            <h1 className="font-bold text-sm text-[#10233F]">Pragati-GovX</h1>
            <span className="text-[10px] text-[#64748B] font-medium">Console</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map(renderNavItem)}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#10233F] truncate">{userName}</p>
              <Badge variant="secondary" className="text-[9px] py-0 px-1 font-mono">
                {userRole}
              </Badge>
              {organization?.name && (
                <p className="mt-1 truncate text-[10px] text-[#64748B]">
                  {organization.name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-[#DC2626] hover:bg-red-50 hover:text-[#DC2626] border-red-100"
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
              <Link to={getRoleDashboardPath(userRole)} className="flex items-center gap-3">
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
              {filteredNav.map(renderNavItem)}
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
              <Link to={getRoleDashboardPath(userRole)} className="hover:text-[#10233F]">Workspace</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate font-semibold text-[#10233F] capitalize">
                {location.pathname.replace("/", "").replace(/-/g, " ") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative p-2 rounded-lg text-[#64748B] hover:text-[#10233F] hover:bg-slate-100 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB]" />
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
