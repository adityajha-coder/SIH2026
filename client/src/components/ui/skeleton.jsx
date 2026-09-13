import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E2E8F0]/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
