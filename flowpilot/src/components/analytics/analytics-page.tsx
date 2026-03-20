"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, Globe, Monitor, Smartphone } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const REVENUE_DATA = [
  { month: "Jan", revenue: 42100, users: 284, prev_revenue: 38500 },
  { month: "Feb", revenue: 46300, users: 312, prev_revenue: 42100 },
  { month: "Mar", revenue: 48250, users: 335, prev_revenue: 46300 },
  { month: "Apr", revenue: 51000, users: 358, prev_revenue: 48250 },
  { month: "May", revenue: 49800, users: 347, prev_revenue: 51000 },
  { month: "Jun", revenue: 53200, users: 376, prev_revenue: 49800 },
];

export function AnalyticsPage() {
  const { t, language } = useTranslation();

  const TRAFFIC_DATA = [
    { source: t("charts.organic"), value: 42, color: "#7c3aed" },
    { source: t("charts.paid"), value: 28, color: "#3b82f6" },
    { source: t("charts.direct"), value: 18, color: "#10b981" },
    { source: t("charts.referral"), value: 12, color: "#f59e0b" },
  ];

  const FUNNEL_DATA = [
    { stage: t("analytics.funnel.visitors"), count: 12400 },
    { stage: t("analytics.funnel.signups"), count: 1860 },
    { stage: t("analytics.funnel.trials"), count: 744 },
    { stage: t("analytics.funnel.paid"), count: 335 },
  ];

  const metrics = [
    { label: t("analytics.cards.totalRevenue"), value: "€48.250", change: "+18,2%", up: true, icon: TrendingUp },
    { label: t("analytics.cards.newUsers"), value: "335", change: "+12,4%", up: true, icon: Users },
    { label: t("analytics.cards.conversionRate"), value: "12,8%", change: "+2,1pp", up: true, icon: TrendingUp },
    { label: t("analytics.cards.churnRate"), value: "2,4%", change: "-0,3pp", up: false, icon: TrendingDown },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("analytics.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("analytics.subtitle")}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <p className="text-2xl font-bold mt-1">{m.value}</p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${m.up ? "text-emerald-600" : "text-rose-600"}`}>
                  <Icon className="h-3 w-3" />
                  {m.change} {t("analytics.vsPrevMonth")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">{t("analytics.revenue")}</TabsTrigger>
          <TabsTrigger value="users">{t("analytics.users")}</TabsTrigger>
          <TabsTrigger value="traffic">{t("analytics.traffic")}</TabsTrigger>
          <TabsTrigger value="funnel">{t("analytics.conversion")}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("charts.revenueVsPrev")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} width={45} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                  <Area type="monotone" dataKey="prev_revenue" name={t("charts.previousMonth")} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#prevGrad)" dot={false} />
                  <Area type="monotone" dataKey="revenue" name={t("charts.current")} stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("charts.userGrowthTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="users" name={t("charts.users")} fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("charts.trafficBySource")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={TRAFFIC_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {TRAFFIC_DATA.map((d) => (
                        <Cell key={d.source} fill={d.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} formatter={(v) => `${Number(v)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {TRAFFIC_DATA.map((d) => (
                    <div key={d.source} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-sm flex-1">{d.source}</span>
                      <span className="text-sm font-medium">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analytics.devices")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Desktop", value: 58, icon: Monitor, color: "bg-violet-600" },
                  { label: "Mobile", value: 32, icon: Smartphone, color: "bg-blue-500" },
                  { label: "Tablet", value: 10, icon: Globe, color: "bg-emerald-500" },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <div key={d.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {d.label}
                        </div>
                        <span className="text-sm font-medium">{d.value}%</span>
                      </div>
                      <Progress value={d.value} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("analytics.funnel.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {FUNNEL_DATA.map((stage, index) => {
                  const max = FUNNEL_DATA[0].count;
                  const pct = (stage.count / max) * 100;
                  const colors = ["bg-violet-600", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
                  const conversionRate = index > 0
                    ? ((stage.count / FUNNEL_DATA[index - 1].count) * 100).toFixed(1)
                    : null;

                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          {conversionRate && (
                            <span className="text-xs text-muted-foreground">({conversionRate}% {t("analytics.funnel.conversionRate")})</span>
                          )}
                        </div>
                        <span className="text-sm font-bold">{stage.count.toLocaleString(language === "de" ? "de-DE" : "en-US")}</span>
                      </div>
                      <div className="h-8 bg-muted rounded-xl overflow-hidden">
                        <div
                          className={`h-full ${colors[index]} rounded-xl transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
