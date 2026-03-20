"use client";

import { useTranslation } from "@/hooks/use-translation";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TopCustomersTable } from "@/components/dashboard/top-customers-table";
import { SubscriptionBreakdown } from "@/components/dashboard/subscription-breakdown";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Customer, ActivityLog } from "@/types";

interface Props {
  stats: {
    customerCount: number;
    activeSubscriptions: number;
    mrr: number;
    churnRate: number;
    conversionRate: number;
    growth: number;
  };
  recentCustomers: Partial<Customer>[];
  recentActivity: ActivityLog[];
}

export function DashboardOverview({ stats, recentCustomers, recentActivity }: Props) {
  const { t } = useTranslation();

  const kpis = [
    {
      title: t("dashboard.kpi.mrr"),
      value: formatCurrency(stats.mrr),
      change: stats.growth,
      changeType: "increase" as const,
      icon: DollarSign,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: t("dashboard.kpi.activeSubscriptions"),
      value: stats.activeSubscriptions.toLocaleString("de-DE"),
      change: 8.1,
      changeType: "increase" as const,
      icon: CreditCard,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: t("dashboard.kpi.activeUsers"),
      value: stats.customerCount.toLocaleString("de-DE"),
      change: stats.growth,
      changeType: "increase" as const,
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: t("dashboard.kpi.churnRate"),
      value: `${stats.churnRate}%`,
      change: -0.3,
      changeType: "decrease" as const,
      icon: TrendingDown,
      gradient: "from-rose-500 to-pink-500",
      invertChange: true,
    },
    {
      title: t("dashboard.kpi.conversionRate"),
      value: `${stats.conversionRate}%`,
      change: 2.1,
      changeType: "increase" as const,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: t("dashboard.kpi.arr"),
      value: formatCurrency(stats.mrr * 12),
      change: stats.growth,
      changeType: "increase" as const,
      icon: BarChart2,
      gradient: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <SubscriptionBreakdown />
        </div>
      </div>

      {/* User growth + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <UserGrowthChart />
        </div>
        <div>
          <RecentActivity activities={recentActivity} />
        </div>
      </div>

      {/* Top customers */}
      <TopCustomersTable customers={recentCustomers} />
    </div>
  );
}
