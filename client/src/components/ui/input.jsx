import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#10233F] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
