import { DEMO_MODE, DEMO_USER } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsPage } from "@/components/settings/settings-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Einstellungen — FlowPilot" };

export default async function SettingsDashboardPage() {
  if (DEMO_MODE) {
    return <SettingsPage profile={DEMO_USER} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  return <SettingsPage profile={profile} />;
}
