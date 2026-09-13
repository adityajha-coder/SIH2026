import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Building2, 
  Sparkles, 
  Rocket, 
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import heroSectionImg from "@/assets/hero_section.png";

export function LandingPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Full-Screen Hero Section with Background Artwork */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[82vh] flex items-center overflow-hidden border-b border-[#E2E8F0] bg-[#F7F5F0]">
        {/* Background Image*/}
        <div className="absolute inset-0 z-0">
          <img
            src={heroSectionImg}
            alt="Maharashtra Innovation Procurement Platform Background"
            className="w-full h-full object-cover object-center lg:object-right filter contrast-[1.18] saturate-[1.20] brightness-[0.97]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F5F0]/95 via-[#F7F5F0]/60 to-transparent sm:from-[#F7F5F0]/90 sm:via-[#F7F5F0]/30 sm:to-transparent lg:w-[70%]" />
          {/* Bottom blend */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#F7F9FC] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-12 sm:py-20 w-full">
          <div className="max-w-2xl space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#10233F] tracking-tight leading-[1.12]">
              Sovereign Innovation Procurement <br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#0F766E] bg-clip-text text-transparent">
                Designed for Startups.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#1E293B] leading-relaxed font-medium max-w-xl">
              Eliminating prior-turnover hurdles for eligible innovators. Empowering Maharashtra government departments to formulate outcome-based challenges, structure controlled sandbox pilots, and execute milestone-based contracts with automated payment SLAs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/challenges">
                <Button size="lg" className="gap-2 text-xs sm:text-sm font-semibold shadow-md">
                  Explore Open Challenges
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="text-xs sm:text-sm font-semibold border-[#CBD5E1] bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm">
                  Join as a Startup
                </Button>
              </Link>
              <Link to="/government/challenges/new">
                <Button variant="civic" size="lg" className="text-xs sm:text-sm font-semibold shadow-sm">
                  Department Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10233F]">
            The Innovation Procurement Highway
          </h2>
          <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
            Engineered to resolve the systemic friction between conventional tender bureaucracy and cutting-edge startup solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card className="glass-card border-[#E2E8F0]">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">1. Outcome Challenges</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Departments post clear problem statements and KPIs rather than rigid technical specs, unlocking novel technology approaches.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2 */}
          <Card className="glass-card border-[#E2E8F0]">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#0F766E] flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">2. Explainable AI Match</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Deterministic 0–100 scoring across sector alignment, capabilities, and DPIIT recognition, supplemented by transparent AI fit rationale.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3 */}
          <Card className="glass-card border-[#E2E8F0]">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#B45309] flex items-center justify-center mb-2">
                <Rocket className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">3. Sandbox Pilots</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Controlled trials with pre-baked IP ownership and data security clauses protecting startup patents while de-risking government adoption.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 4 */}
          <Card className="glass-card border-[#E2E8F0]">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">4. Scale-Up & Payments</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Tranche disbursements linked to verified milestones with SLA countdown clocks, ending long, unpredictable sales cycles.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#10233F] to-[#1E3A65] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Statewide Interoperability
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Scaling Proven Solutions Across Maharashtra’s 36 Districts
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Successful pilots generate standardized Procurement Release Memos compatible with GeM (Government e-Marketplace) and State innovation mandates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/challenges">
              <Button variant="default" size="lg" className="bg-[#2563EB] hover:bg-blue-600 font-semibold text-sm">
                Browse Active Tenders
              </Button>
            </Link>
            <Link to="/policy">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10 text-sm">
                View Policy Framework
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
