"use client";

import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getValueRating } from "@/lib/value-score";
import { cn } from "@/lib/utils";

interface ValueBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ValueBadge({ score, showLabel = true, size = "md" }: ValueBadgeProps) {
  const rating = getValueRating(score);

  const config = {
    excellent: {
      label: "Best Value",
      icon: Star,
      variant: "excellent" as const,
      iconColor: "text-emerald-600",
    },
    good: {
      label: "Good Value",
      icon: TrendingUp,
      variant: "good" as const,
      iconColor: "text-blue-600",
    },
    fair: {
      label: "Fair Value",
      icon: Minus,
      variant: "fair" as const,
      iconColor: "text-amber-600",
    },
    poor: {
      label: "Low Value",
      icon: TrendingDown,
      variant: "poor" as const,
      iconColor: "text-red-600",
    },
  };

  const { label, icon: Icon, variant, iconColor } = config[rating];

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1 shadow-sm",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1"
      )}
    >
      <Icon className={cn("h-3 w-3", iconColor)} />
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}

/**
 * Value score explainer component
 */
export function ValueScoreExplainer() {
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-slate-900 text-sm">How Value Score Works</h4>
      <p className="text-xs text-slate-600">
        The value score considers price per square foot, commute time, and number of bedrooms.
        Lower scores indicate better value.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ValueBadge score={30} size="sm" />
          <span className="text-xs text-slate-500">Score under 50</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={60} size="sm" />
          <span className="text-xs text-slate-500">Score 50-75</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={85} size="sm" />
          <span className="text-xs text-slate-500">Score 75-100</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={120} size="sm" />
          <span className="text-xs text-slate-500">Score over 100</span>
        </div>
      </div>
    </div>
  );
}

