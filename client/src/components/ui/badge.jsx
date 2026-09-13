import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20",
        secondary: "border-transparent bg-[#F1F5F9] text-[#10233F] hover:bg-[#E2E8F0]",
        destructive: "border-transparent bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20",
        outline: "border-[#E2E8F0] text-[#10233F]",
        success: "border-transparent bg-[#0F766E]/10 text-[#0F766E] font-semibold hover:bg-[#0F766E]/20",
        warning: "border-transparent bg-[#B45309]/10 text-[#B45309] font-semibold hover:bg-[#B45309]/20",
        navy: "border-transparent bg-[#10233F] text-white",
        dpiit: "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
