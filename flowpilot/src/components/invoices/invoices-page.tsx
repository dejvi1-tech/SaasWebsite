"use client";

import { useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types";
import { Download, Plus, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_VARIANTS: Record<InvoiceStatus, "success" | "warning" | "destructive" | "gray"> = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
  draft: "gray",
};

const MOCK_INVOICES: (Invoice & { customers?: { name: string; email: string } })[] = [
  { id: "1", organization_id: "org1", customer_id: "c1", invoice_number: "INV-2026-001", status: "paid", amount: 1299, tax: 246.81, total: 1545.81, due_date: "2026-02-28", paid_at: "2026-02-25", notes: null, created_at: "2026-02-01", updated_at: "2026-02-25", customers: { name: "TechVision GmbH", email: "info@techvision.de" } },
  { id: "2", organization_id: "org1", customer_id: "c2", invoice_number: "INV-2026-002", status: "paid", amount: 799, tax: 151.81, total: 950.81, due_date: "2026-02-28", paid_at: "2026-02-20", notes: null, created_at: "2026-02-01", updated_at: "2026-02-20", customers: { name: "DataFlow AG", email: "hello@dataflow.ch" } },
  { id: "3", organization_id: "org1", customer_id: "c3", invoice_number: "INV-2026-003", status: "pending", amount: 299, tax: 56.81, total: 355.81, due_date: "2026-03-31", paid_at: null, notes: null, created_at: "2026-03-01", updated_at: "2026-03-01", customers: { name: "StartupHub Berlin", email: "team@startuphub.de" } },
  { id: "4", organization_id: "org1", customer_id: "c4", invoice_number: "INV-2026-004", status: "overdue", amount: 799, tax: 151.81, total: 950.81, due_date: "2026-02-15", paid_at: null, notes: null, created_at: "2026-01-15", updated_at: "2026-01-15", customers: { name: "MedicoSoft", email: "billing@medicosoft.de" } },
  { id: "5", organization_id: "org1", customer_id: "c5", invoice_number: "INV-2026-005", status: "draft", amount: 1299, tax: 246.81, total: 1545.81, due_date: "2026-04-01", paid_at: null, notes: null, created_at: "2026-03-15", updated_at: "2026-03-15", customers: { name: "CloudPeak AG", email: "cto@cloudpeak.de" } },
];

interface Props {
  invoices: (Invoice & { customers?: { name: string; email: string } | null })[];
}

function generateInvoicePdf(inv: Invoice & { customers?: { name: string; email: string } | null }, locale: string) {
  const customer = inv.customers;
  const isDE = locale.startsWith("de");
  const fmtCur = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(n);
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${inv.invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; padding: 48px; font-size: 13px; line-height: 1.5; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
  .logo { font-size: 22px; font-weight: 700; color: #7c3aed; }
  .logo span { color: #1a1a2e; }
  .inv-num { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
  .meta-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px; }
  .meta-block p { font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  thead th { text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; border-bottom: 2px solid #e5e7eb; }
  thead th:last-child { text-align: right; }
  tbody td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-table { width: 240px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals-row.total { border-top: 2px solid #1a1a2e; font-weight: 700; font-size: 15px; padding-top: 10px; margin-top: 4px; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-overdue { background: #fee2e2; color: #991b1b; }
  .status-draft { background: #f3f4f6; color: #6b7280; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print {
    body { padding: 0; }
    @page { margin: 24mm 20mm; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Flow<span>Pilot</span></div>
      <div class="inv-num">${inv.invoice_number}</div>
    </div>
    <div style="text-align:right">
      <span class="status status-${inv.status}">${isDE ? { paid: "Bezahlt", pending: "Ausstehend", overdue: "Überfällig", draft: "Entwurf" }[inv.status] : { paid: "Paid", pending: "Pending", overdue: "Overdue", draft: "Draft" }[inv.status]}</span>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <h4>${isDE ? "Rechnungssteller" : "From"}</h4>
      <p><strong>FlowPilot GmbH</strong></p>
      <p>Musterstraße 1, 10115 Berlin</p>
      <p>USt-IdNr.: DE123456789</p>
    </div>
    <div class="meta-block">
      <h4>${isDE ? "Empfänger" : "To"}</h4>
      <p><strong>${customer?.name ?? "—"}</strong></p>
      <p>${customer?.email ?? ""}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <h4>${isDE ? "Rechnungsdatum" : "Invoice Date"}</h4>
      <p>${fmtDate(inv.created_at)}</p>
    </div>
    <div class="meta-block">
      <h4>${isDE ? "Fälligkeitsdatum" : "Due Date"}</h4>
      <p>${fmtDate(inv.due_date)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${isDE ? "Beschreibung" : "Description"}</th>
        <th style="text-align:right">${isDE ? "Betrag" : "Amount"}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>SaaS ${isDE ? "Abonnement" : "Subscription"} — FlowPilot</td>
        <td>${fmtCur(inv.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="totals-row">
        <span>${isDE ? "Nettobetrag" : "Subtotal"}</span>
        <span>${fmtCur(inv.amount)}</span>
      </div>
      <div class="totals-row">
        <span>${isDE ? "USt. 19%" : "VAT 19%"}</span>
        <span>${fmtCur(inv.tax)}</span>
      </div>
      <div class="totals-row total">
        <span>${isDE ? "Gesamtbetrag" : "Total"}</span>
        <span>${fmtCur(inv.total)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    FlowPilot GmbH · Musterstraße 1, 10115 Berlin · ${isDE ? "Geschäftsführer" : "CEO"}: Klaus Müller · Amtsgericht Berlin HRB 12345
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.addEventListener("load", () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    });
  }
}

export function InvoicesPage({ invoices: serverInvoices }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const invoices = serverInvoices.length > 0 ? serverInvoices : MOCK_INVOICES;

  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);

  const handleDownload = useCallback((inv: Invoice & { customers?: { name: string; email: string } | null }) => {
    generateInvoicePdf(inv, locale);
    toast.success(t("toasts.invoiceDownloaded"));
  }, [locale, t]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("invoices.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("invoices.subtitle")}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />
          {t("invoices.createInvoice")}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("invoices.paidThisMonth"), value: formatCurrency(paid), icon: CheckCircle, color: "text-emerald-600" },
          { label: t("invoices.pendingAmount"), value: formatCurrency(pending), icon: Clock, color: "text-amber-600" },
          { label: t("invoices.overdueAmount"), value: formatCurrency(overdue), icon: AlertTriangle, color: "text-rose-600" },
          { label: t("invoices.totalRevenue"), value: formatCurrency(paid + pending), icon: DollarSign, color: "text-violet-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {[t("invoices.table.invoiceNumber"), t("invoices.table.customer"), t("invoices.table.status"), t("invoices.table.dueDate"), t("invoices.table.amount"), t("common.actions")].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const variant = STATUS_VARIANTS[inv.status];
                const customer = (inv as any).customers;
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-xs">{inv.invoice_number}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{customer?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email ?? ""}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Badge variant={variant}>{t(`invoices.status.${inv.status}`)}</Badge></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(inv.due_date, locale)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(inv.total)}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDownload(inv)}
                        title={t("invoices.downloadPdf")}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
