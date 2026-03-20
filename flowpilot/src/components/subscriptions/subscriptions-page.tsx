"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Subscription, SubscriptionStatus } from "@/types";
import { CreditCard, Users, XCircle, TrendingUp } from "lucide-react";

const STATUS_STYLES: Record<SubscriptionStatus, { label: string; variant: "success" | "warning" | "gray" | "destructive" | "info" }> = {
  active: { label: "Aktiv", variant: "success" },
  trialing: { label: "Testphase", variant: "warning" },
  canceled: { label: "Storniert", variant: "gray" },
  past_due: { label: "Überfällig", variant: "destructive" },
  paused: { label: "Pausiert", variant: "info" },
};

const MOCK_SUBS: (Subscription & { customers?: { name: string; email: string; company: string | null } })[] = [
  { id: "1", organization_id: "org1", customer_id: "c1", plan_name: "Enterprise", plan_price: 1299, status: "active", current_period_start: "2026-02-01", current_period_end: "2026-03-01", trial_ends_at: null, canceled_at: null, created_at: "2025-12-01", updated_at: "2026-03-01", customers: { name: "TechVision GmbH", email: "info@techvision.de", company: "TechVision GmbH" } },
  { id: "2", organization_id: "org1", customer_id: "c2", plan_name: "Professional", plan_price: 799, status: "active", current_period_start: "2026-02-01", current_period_end: "2026-03-01", trial_ends_at: null, canceled_at: null, created_at: "2026-01-15", updated_at: "2026-03-01", customers: { name: "DataFlow AG", email: "hello@dataflow.ch", company: "DataFlow AG" } },
  { id: "3", organization_id: "org1", customer_id: "c3", plan_name: "Starter", plan_price: 299, status: "trialing", current_period_start: "2026-03-10", current_period_end: "2026-03-24", trial_ends_at: "2026-03-24", canceled_at: null, created_at: "2026-03-10", updated_at: "2026-03-10", customers: { name: "StartupHub Berlin", email: "team@startuphub.de", company: "StartupHub" } },
  { id: "4", organization_id: "org1", customer_id: "c4", plan_name: "Professional", plan_price: 799, status: "past_due", current_period_start: "2026-01-01", current_period_end: "2026-02-01", trial_ends_at: null, canceled_at: null, created_at: "2025-11-01", updated_at: "2026-02-01", customers: { name: "MedicoSoft", email: "billing@medicosoft.de", company: "MedicoSoft" } },
  { id: "5", organization_id: "org1", customer_id: "c5", plan_name: "Starter", plan_price: 299, status: "canceled", current_period_start: "2025-12-01", current_period_end: "2026-01-01", trial_ends_at: null, canceled_at: "2025-12-28", created_at: "2025-10-01", updated_at: "2025-12-28", customers: { name: "OldCompany GbR", email: "info@old.de", company: "OldCompany GbR" } },
];

interface Props {
  subscriptions: (Subscription & { customers?: { name: string; email: string; company: string | null } | null })[];
  stats: { active: number; trial: number; canceled: number; mrr: number };
}

export function SubscriptionsPage({ subscriptions: serverSubs, stats }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const subs = serverSubs.length > 0 ? serverSubs : MOCK_SUBS;

  const statCards = [
    { label: t("subscriptions.activeSubscriptions"), value: stats.active || 312, icon: CreditCard, color: "text-violet-600" },
    { label: t("subscriptions.trialUsers"), value: stats.trial || 47, icon: Users, color: "text-amber-600" },
    { label: t("subscriptions.canceledSubscriptions"), value: stats.canceled || 28, icon: XCircle, color: "text-rose-600" },
    { label: t("subscriptions.totalMRR"), value: formatCurrency(stats.mrr), icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("subscriptions.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subscriptions.subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
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

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Starter", price: 299, features: ["5 Nutzer", "10 GB Speicher", "E-Mail-Support", "Basis-Analytik"], popular: false, color: "border-border" },
          { name: "Professional", price: 799, features: ["25 Nutzer", "100 GB Speicher", "Prioritäts-Support", "Erweiterte Analytik", "API-Zugang"], popular: true, color: "border-primary" },
          { name: "Enterprise", price: 1299, features: ["Unbegrenzt Nutzer", "1 TB Speicher", "24/7 Dedizierter Support", "Vollständige Analytik", "Custom Integrationen", "SLA-Garantie"], popular: false, color: "border-border" },
        ].map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs">Beliebtester Plan</Badge>
              </div>
            )}
            <CardContent className="p-5">
              <h3 className="font-semibold text-base">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground text-sm">/Monat</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {[t("subscriptions.table.customer"), t("subscriptions.table.plan"), t("subscriptions.table.status"), t("subscriptions.table.amount"), t("subscriptions.table.renewalDate")].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const style = STATUS_STYLES[sub.status];
                const customer = (sub as any).customers;
                return (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{customer?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email ?? ""}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{sub.plan_name}</td>
                    <td className="py-3 px-4"><Badge variant={style.variant}>{style.label}</Badge></td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(sub.plan_price)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(sub.current_period_end, locale)}</td>
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
