"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";

const MONTHLY_DATA = [
  { month: "Jul", revenue: 32000, target: 35000 },
  { month: "Aug", revenue: 38500, target: 37000 },
  { month: "Sep", revenue: 35200, target: 38000 },
  { month: "Oct", revenue: 41800, target: 40000 },
  { month: "Nov", revenue: 39600, target: 42000 },
  { month: "Dec", revenue: 44200, target: 43000 },
  { month: "Jan", revenue: 42100, target: 44000 },
  { month: "Feb", revenue: 46300, target: 46000 },
  { month: "Mar", revenue: 48250, target: 47000 },
];

const RANGE_OPTIONS = ["7d", "30d", "90d", "1y"] as const;
type Range = (typeof RANGE_OPTIONS)[number];

export function RevenueChart() {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("30d");

  const dataSlice = range === "7d" ? MONTHLY_DATA.slice(-2) :
    range === "30d" ? MONTHLY_DATA.slice(-3) :
    range === "90d" ? MONTHLY_DATA.slice(-6) :
    MONTHLY_DATA;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p) => (
            <p key={p.name} style={{ color: p.color }} className="text-xs">
              {p.name === "revenue" ? t("charts.revenue") : t("charts.target")}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">{t("dashboard.charts.revenueOverview")}</CardTitle>
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {RANGE_OPTIONS.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  range === r ? "" : "hover:bg-transparent"
                )}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dataSlice} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#targetGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#7c3aed" }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
            {t("charts.revenue")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 opacity-60" />
            {t("charts.target")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
