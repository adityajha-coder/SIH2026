import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductPulseRail } from "@/components/common/ProductPulseRail";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC]">
      <Navbar />
      <ProductPulseRail />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
