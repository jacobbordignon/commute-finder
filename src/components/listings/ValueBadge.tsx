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
      className: "bg-neutral-900 text-white border-neutral-900",
    },
    good: {
      label: "Good Value",
      icon: TrendingUp,
      className: "bg-neutral-700 text-white border-neutral-700",
    },
    fair: {
      label: "Fair",
      icon: Minus,
      className: "bg-neutral-100 text-neutral-600 border-neutral-200",
    },
    poor: {
      label: "Low Value",
      icon: TrendingDown,
      className: "bg-neutral-100 text-neutral-500 border-neutral-200",
    },
  };

  const { label, icon: Icon, className } = config[rating];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-normal",
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "md" && "text-xs px-2 py-0.5",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}

/**
 * Value score explainer component
 */
export function ValueScoreExplainer() {
  return (
    <div className="bg-neutral-50 rounded-md p-4 space-y-3">
      <h4 className="font-medium text-neutral-800 text-sm">How Value Score Works</h4>
      <p className="text-xs text-neutral-600">
        The value score considers price per square foot, commute time, and number of bedrooms.
        Lower scores indicate better value.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ValueBadge score={30} size="sm" />
          <span className="text-xs text-neutral-500">Score under 50</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={60} size="sm" />
          <span className="text-xs text-neutral-500">Score 50-75</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={85} size="sm" />
          <span className="text-xs text-neutral-500">Score 75-100</span>
        </div>
        <div className="flex items-center gap-2">
          <ValueBadge score={120} size="sm" />
          <span className="text-xs text-neutral-500">Score over 100</span>
        </div>
      </div>
    </div>
  );
}
