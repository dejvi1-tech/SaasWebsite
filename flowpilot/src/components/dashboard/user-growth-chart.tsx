"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

const DATA = [
  { month: "Jul", new: 45, churned: 8 },
  { month: "Aug", new: 62, churned: 12 },
  { month: "Sep", new: 54, churned: 9 },
  { month: "Oct", new: 78, churned: 14 },
  { month: "Nov", new: 71, churned: 11 },
  { month: "Dec", new: 89, churned: 15 },
  { month: "Jan", new: 84, churned: 13 },
  { month: "Feb", new: 96, churned: 16 },
  { month: "Mar", new: 103, churned: 14 },
];

export function UserGrowthChart() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("dashboard.charts.userGrowth")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={2}>
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
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Bar dataKey="new" name={t("charts.newUsers")} fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" name={t("charts.churned")} fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
            {t("charts.newUsers")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            {t("charts.churned")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
