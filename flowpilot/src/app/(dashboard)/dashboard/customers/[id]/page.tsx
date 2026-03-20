import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerDetailPage } from "@/components/customers/customer-detail-page";
import type { Metadata } from "next";
import type { Customer } from "@/types";

export const metadata: Metadata = { title: "Kundendetails — FlowPilot" };

const DEMO_CUSTOMER: Customer = {
  id: "demo-1",
  organization_id: "demo-org",
  name: "TechVision GmbH",
  email: "info@techvision.de",
  company: "TechVision GmbH",
  phone: "+49 30 12345678",
  status: "active",
  plan: "Enterprise",
  mrr: 1299,
  avatar_url: null,
  notes: "Wichtigster Enterprise-Kunde. Jährliches Verlängerungsgespräch im April.",
  created_at: "2025-06-15T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

export default async function CustomerDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (DEMO_MODE) {
    return <CustomerDetailPage customer={DEMO_CUSTOMER} subscriptions={[]} invoices={[]} />;
  }

  const supabase = await createClient();
  const [{ data: customer }, { data: subscriptions }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("subscriptions").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  if (!customer) notFound();

  return <CustomerDetailPage customer={customer} subscriptions={subscriptions ?? []} invoices={invoices ?? []} />;
}
