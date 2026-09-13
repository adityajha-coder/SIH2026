import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard,
  LogOut,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleDashboardPath } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

import logoImg from "@/assets/logo.png";

const ROLE_LABELS = {
  STARTUP_USER: "STARTUP",
  GOVERNMENT_USER: "GOV",
  EVALUATOR: "EVAL",
  ADMIN: "ADMIN",
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, isAuthenticated, isLoading, logout } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Challenges", href: "/challenges" },
    { label: "Eligibility Policy", href: "/policy" },
    { label: "Pilot Framework", href: "/pilot-framework" },
    { label: "Audit & Transparency", href: "/audit-public" },
  ];

  const isActive = (path) => location.pathname === path;
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "USER";
  const initial = user?.userName?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const authActions = isAuthenticated ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 pl-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-[#2563EB]">
            {initial}
          </span>
          <span className="hidden max-w-28 truncate text-xs sm:inline">
            {user.userName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="truncate text-sm font-bold text-[#10233F]">
              {user.userName}
            </p>
            <p className="truncate text-xs font-normal text-[#64748B]">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
              {roleLabel}
            </span>
            <span className="truncate text-[11px] text-[#64748B]">
              {organization?.name || "No organization"}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={getRoleDashboardPath(user.role)} className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-[#DC2626] focus:text-[#DC2626]"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <Link to="/login">
        <Button variant="outline" size="sm" className="font-medium text-xs">
          Sign In
        </Button>
      </Link>
      <Link to="/register">
        <Button size="sm" className="gap-1.5 font-medium text-xs shadow-sm">
          Register Startup
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      <nav className="glass-nav px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Pragati-GovX"
            className="h-9 w-auto object-contain rounded-md transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#10233F] tracking-tight">Pragati-GovX</span>
            <span className="text-[10px] text-[#64748B] font-medium leading-none">
              Innovation Procurement Gateway
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold"
                  : "text-[#64748B] hover:text-[#10233F] hover:bg-slate-100/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2.5">
          {!isLoading && authActions}
        </div>

        {/* Mobile hamburger */}
        <div className="flex sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-[#E2E8F0] bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-[#10233F] hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="rounded-lg bg-[#F8FAFC] p-3">
                  <p className="text-sm font-bold text-[#10233F]">{user.userName}</p>
                  <p className="truncate text-xs text-[#64748B]">
                    {organization?.name || roleLabel}
                  </p>
                </div>
                <Link
                  to={getRoleDashboardPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button className="w-full text-sm">Open Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-sm text-[#DC2626]"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full text-sm">
                    Register Startup
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
