import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DEMO_MODE, DEMO_COOKIE, DEMO_USER } from "@/lib/demo-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Demo mode ────────────────────────────────────────────────────────────
  if (DEMO_MODE) {
    const cookieStore = await cookies();
    const hasDemo = cookieStore.get(DEMO_COOKIE)?.value === "1";
    if (!hasDemo) redirect("/login");

    return (
      <DashboardShell
        user={{
          email: DEMO_USER.email,
          full_name: DEMO_USER.full_name,
          avatar_url: DEMO_USER.avatar_url,
        }}
      >
        {children}
      </DashboardShell>
    );
  }

  // ── Production mode ──────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const profile = profileData as { full_name: string | null; avatar_url: string | null } | null;

  return (
    <DashboardShell
      user={{
        email: user.email ?? "",
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
