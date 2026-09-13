import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm active:translate-y-[0.5px]",
        destructive: "bg-[#DC2626] text-white hover:bg-red-700 shadow-sm",
        outline: "border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#10233F] hover:text-[#10233F]",
        secondary: "bg-[#F1F5F9] text-[#10233F] hover:bg-[#E2E8F0]",
        ghost: "hover:bg-[#F1F5F9] text-[#10233F] hover:text-[#10233F]",
        link: "text-[#2563EB] underline-offset-4 hover:underline",
        civic: "bg-[#10233F] text-white hover:bg-[#1E3A65] shadow-sm",
        teal: "bg-[#0F766E] text-white hover:bg-[#115E59] shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
