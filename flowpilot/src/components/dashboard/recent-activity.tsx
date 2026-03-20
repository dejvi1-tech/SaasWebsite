"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityLog } from "@/types";
import {
  UserPlus,
  CreditCard,
  FileText,
  Ticket,
  Activity,
  CheckSquare,
} from "lucide-react";

const ACTION_ICONS: Record<string, typeof UserPlus> = {
  customer_created: UserPlus,
  subscription_created: CreditCard,
  invoice_paid: FileText,
  ticket_created: Ticket,
  task_completed: CheckSquare,
};

const MOCK_ACTIVITIES = [
  { id: "1", action: "customer_created", metadata: { name: "Markus Weber" }, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "2", action: "invoice_paid", metadata: { number: "INV-2026-042", amount: "€299" }, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "3", action: "subscription_created", metadata: { plan: "Professional", customer: "Tech GmbH" }, created_at: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "4", action: "ticket_created", metadata: { title: "Login-Problem", customer: "Anna Schmidt" }, created_at: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: "5", action: "task_completed", metadata: { title: "API Dokumentation" }, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "6", action: "customer_created", metadata: { name: "Diana Koch" }, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
];

function getActivityLabel(activity: { action: string; metadata: Record<string, string> }, t: (key: string) => string): string {
  switch (activity.action) {
    case "customer_created": return t("dashboard.activity.customerCreated").replace("{name}", activity.metadata.name);
    case "invoice_paid": return t("dashboard.activity.invoicePaid").replace("{number}", activity.metadata.number);
    case "subscription_created": return t("dashboard.activity.subscriptionCreated").replace("{plan}", activity.metadata.plan);
    case "ticket_created": return t("dashboard.activity.ticketCreated").replace("{title}", activity.metadata.title);
    case "task_completed": return t("dashboard.activity.taskCompleted").replace("{title}", activity.metadata.title);
    default: return activity.action;
  }
}

interface Props {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";

  const displayActivities = activities.length > 0 ? activities : MOCK_ACTIVITIES;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("dashboard.recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4">
        <ScrollArea className="h-[220px]">
          <div className="space-y-3">
            {displayActivities.map((activity) => {
              const IconComponent = ACTION_ICONS[activity.action] ?? Activity;
              const meta = (activity.metadata ?? {}) as Record<string, string>;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                    <IconComponent className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">
                      {getActivityLabel({ action: activity.action, metadata: meta }, t)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(activity.created_at, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
