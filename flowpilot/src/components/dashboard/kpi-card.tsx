"use client";

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  gradient: string;
  invertChange?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
  invertChange,
}: KPICardProps) {
  const isPositive = invertChange
    ? changeType === "decrease"
    : changeType === "increase";
  const isNegative = invertChange
    ? changeType === "increase"
    : changeType === "decrease";

  const ChangeIcon = changeType === "neutral" ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shadow-lg",
              gradient
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive && "text-emerald-600 dark:text-emerald-400",
              isNegative && "text-rose-600 dark:text-rose-400",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            <ChangeIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground">vs. letzter Monat</span>
        </div>
      </CardContent>
    </Card>
  );
}
