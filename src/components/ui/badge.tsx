import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-100 text-emerald-800",
        secondary: "bg-slate-100 text-slate-800",
        destructive: "bg-red-100 text-red-800",
        outline: "border border-slate-200 text-slate-700",
        excellent: "bg-emerald-100 text-emerald-800",
        good: "bg-blue-100 text-blue-800",
        fair: "bg-amber-100 text-amber-800",
        poor: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

