import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { CustomersPage } from "@/components/customers/customers-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kunden — FlowPilot" };

export default async function CustomersDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  if (DEMO_MODE) {
    return <CustomersPage customers={[]} total={0} page={1} pageSize={10} />;
  }

  const params = await searchParams;
  const supabase = await createClient();
  const page = Number(params.page ?? 1);
  const pageSize = 10;
  const search = params.search ?? "";
  const statusFilter = params.status ?? "";

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: customers, count } = await query;

  return <CustomersPage customers={customers ?? []} total={count ?? 0} page={page} pageSize={pageSize} />;
}
