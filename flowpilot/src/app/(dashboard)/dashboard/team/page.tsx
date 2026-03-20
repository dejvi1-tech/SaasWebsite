import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { TeamPage } from "@/components/team/team-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team — FlowPilot" };

export default async function TeamDashboardPage() {
  if (DEMO_MODE) {
    return <TeamPage members={[]} />;
  }

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("organization_members")
    .select("*, profiles(id, full_name, email, avatar_url, role)")
    .order("created_at", { ascending: false });

  return <TeamPage members={members ?? []} />;
}
