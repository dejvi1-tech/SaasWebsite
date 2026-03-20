import { DEMO_MODE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rechnungen — FlowPilot" };

export default async function InvoicesDashboardPage() {
  if (DEMO_MODE) {
    return <InvoicesPage invoices={[]} />;
  }

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(name, email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return <InvoicesPage invoices={invoices ?? []} />;
}
