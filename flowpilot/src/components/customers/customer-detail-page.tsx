"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building, Calendar, CreditCard, FileText, Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Customer, Subscription, Invoice, CustomerStatus, SubscriptionStatus, InvoiceStatus } from "@/types";

const CUSTOMER_STATUS_VARIANT: Record<CustomerStatus, "success" | "warning" | "gray" | "destructive"> = {
  active: "success",
  trial: "warning",
  inactive: "gray",
  churned: "destructive",
};

const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, "success" | "warning" | "gray" | "destructive"> = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
  draft: "gray",
};

interface Props {
  customer: Customer;
  subscriptions: Subscription[];
  invoices: Invoice[];
}

export function CustomerDetailPage({ customer, subscriptions, invoices }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const statusVariant = CUSTOMER_STATUS_VARIANT[customer.status];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>{t(`customers.status.${customer.status}`)}</Badge>
          <Button variant="outline" size="sm">
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="text-lg">{getInitials(customer.name)}</AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-base">{customer.name}</h2>
                {customer.company && (
                  <p className="text-muted-foreground text-sm">{customer.company}</p>
                )}
              </div>

              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`mailto:${customer.email}`} className="hover:text-primary truncate">{customer.email}</a>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${customer.phone}`} className="hover:text-primary">{customer.phone}</a>
                  </div>
                )}
                {customer.company && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{customer.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{formatDate(customer.created_at, locale)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">MRR</p>
                  <p className="font-semibold text-sm mt-0.5">{formatCurrency(customer.mrr)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-semibold text-sm mt-0.5">{customer.plan ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("common.notes")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="subscriptions">
            <TabsList>
              <TabsTrigger value="subscriptions">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                {t("nav.subscriptions")}
              </TabsTrigger>
              <TabsTrigger value="invoices">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                {t("nav.invoices")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="mt-4">
              {subscriptions.length === 0 ? (
                <EmptyState icon={CreditCard} title={t("subscriptions.title")} desc={t("subscriptions.noSubscriptions")} />
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} sub={sub} locale={locale} t={t} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              {invoices.length === 0 ? (
                <EmptyState icon={FileText} title={t("invoices.title")} desc={t("subscriptions.noInvoices")} />
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase">{t("invoices.table.invoiceNumber")}</th>
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase">{t("invoices.table.status")}</th>
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase">{t("invoices.table.dueDate")}</th>
                          <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase">{t("invoices.table.amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => {
                          const variant = INVOICE_STATUS_VARIANT[inv.status];
                          return (
                            <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-4 font-medium">{inv.invoice_number}</td>
                              <td className="py-3 px-4"><Badge variant={variant}>{t(`invoices.status.${inv.status}`)}</Badge></td>
                              <td className="py-3 px-4 text-muted-foreground">{formatDate(inv.due_date, locale)}</td>
                              <td className="py-3 px-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ sub, locale, t }: { sub: Subscription; locale: string; t: (k: string) => string }) {
  const SUB_VARIANT: Record<SubscriptionStatus, "success" | "warning" | "gray" | "destructive" | "info"> = {
    active: "success",
    trialing: "warning",
    canceled: "gray",
    past_due: "destructive",
    paused: "info",
  };

  const variant = SUB_VARIANT[sub.status];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{sub.plan_name}</p>
              <Badge variant={variant}>{t(`subscriptions.status.${sub.status}`)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subscriptions.renewal")}: {formatDate(sub.current_period_end, locale)}
            </p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(sub.plan_price)}<span className="text-sm font-normal text-muted-foreground">{t("subscriptions.perMonth")}</span></p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: typeof CreditCard; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-2xl border-dashed">
      <Icon className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
