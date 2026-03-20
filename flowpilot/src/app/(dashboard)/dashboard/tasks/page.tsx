import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { TasksPage } from "@/components/tasks/tasks-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aufgaben — FlowPilot" };

export default async function TasksDashboardPage() {
  if (DEMO_MODE) {
    return <TasksPage tasks={[]} />;
  }

  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, profiles(full_name, avatar_url)")
    .order("position", { ascending: true });

  return <TasksPage tasks={tasks ?? []} />;
}
