import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionsPage } from "@/components/subscriptions/subscriptions-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Abonnements — FlowPilot" };

export default async function SubscriptionsDashboardPage() {
  if (DEMO_MODE) {
    return <SubscriptionsPage subscriptions={[]} stats={{ active: 312, trial: 47, canceled: 28, mrr: 48250 }} />;
  }

  const supabase = await createClient();
  const [
    { data: subscriptions },
    { count: activeCount },
    { count: trialCount },
    { count: canceledCount },
  ] = await Promise.all([
    supabase.from("subscriptions").select("*, customers(name, email, company)").order("created_at", { ascending: false }).limit(50),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled"),
  ]);

  return <SubscriptionsPage subscriptions={subscriptions ?? []} stats={{ active: activeCount ?? 0, trial: trialCount ?? 0, canceled: canceledCount ?? 0, mrr: 48250 }} />;
}
