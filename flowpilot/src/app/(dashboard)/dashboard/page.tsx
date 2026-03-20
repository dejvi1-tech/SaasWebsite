import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Übersicht — FlowPilot" };

export default async function DashboardPage() {
  if (DEMO_MODE) {
    return (
      <DashboardOverview
        stats={{ customerCount: 248, activeSubscriptions: 312, mrr: 48250, churnRate: 2.4, conversionRate: 12.8, growth: 18.2 }}
        recentCustomers={[]}
        recentActivity={[]}
      />
    );
  }

  const supabase = await createClient();

  const [
    { count: customerCount },
    { count: activeSubCount },
    { data: recentCustomers },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("customers").select("id, name, email, company, status, mrr, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <DashboardOverview
      stats={{ customerCount: customerCount ?? 0, activeSubscriptions: activeSubCount ?? 0, mrr: 48250, churnRate: 2.4, conversionRate: 12.8, growth: 18.2 }}
      recentCustomers={recentCustomers ?? []}
      recentActivity={recentActivity ?? []}
    />
  );
}
