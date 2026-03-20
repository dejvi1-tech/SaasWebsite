import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { TicketsPage } from "@/components/tickets/tickets-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support-Tickets — FlowPilot" };

export default async function TicketsDashboardPage() {
  if (DEMO_MODE) {
    return <TicketsPage tickets={[]} />;
  }

  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*, customers(name, email), profiles!tickets_assigned_to_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return <TicketsPage tickets={tickets ?? []} />;
}
