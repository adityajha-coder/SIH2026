import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Building2, 
  Menu, 
  X, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import logoImg from "@/assets/logo.png";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Challenges", href: "/challenges" },
    { label: "Eligibility Policy", href: "/policy" },
    { label: "Pilot Framework", href: "/pilot-framework" },
    { label: "Audit & Transparency", href: "/audit-public" },
  ];

  const isActive = (path) => location.pathname === path;

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
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
