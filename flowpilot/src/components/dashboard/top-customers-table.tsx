"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";
import { ArrowRight } from "lucide-react";

const MOCK_CUSTOMERS = [
  { id: "1", name: "TechVision GmbH", email: "info@techvision.de", company: "TechVision GmbH", status: "active" as const, mrr: 1299, plan: "Enterprise" },
  { id: "2", name: "DataFlow AG", email: "hello@dataflow.ch", company: "DataFlow AG", status: "active" as const, mrr: 799, plan: "Professional" },
  { id: "3", name: "StartupHub Berlin", email: "team@startuphub.de", company: "StartupHub", status: "trial" as const, mrr: 299, plan: "Starter" },
  { id: "4", name: "CloudPeak Solutions", email: "cto@cloudpeak.de", company: "CloudPeak", status: "active" as const, mrr: 1299, plan: "Enterprise" },
  { id: "5", name: "Bright Analytics", email: "info@brightanalytics.de", company: "Bright Analytics", status: "inactive" as const, mrr: 0, plan: "—" },
];

const STATUS_VARIANTS: Record<string, "success" | "warning" | "gray" | "destructive"> = {
  active: "success",
  trial: "warning",
  inactive: "gray",
  churned: "destructive",
};

interface Props {
  customers: Partial<Customer>[];
}

export function TopCustomersTable({ customers }: Props) {
  const { t } = useTranslation();
  const displayCustomers = customers.length > 0 ? customers : MOCK_CUSTOMERS;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.topCustomers")}</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
            <Link href="/dashboard/customers">
              {t("common.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("customers.table.name")}
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("customers.table.plan")}
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("customers.table.status")}
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("customers.table.mrr")}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayCustomers.slice(0, 5).map((c) => {
                const variant = STATUS_VARIANTS[c.status ?? "inactive"];
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {getInitials(c.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.plan ?? "—"}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={variant}>{t(`customers.status.${c.status ?? "inactive"}`)}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {(c.mrr ?? 0) > 0 ? formatCurrency(c.mrr!) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
