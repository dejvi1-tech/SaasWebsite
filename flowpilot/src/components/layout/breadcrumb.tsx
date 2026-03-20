"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const pathToKey: Record<string, string> = {
  dashboard: "nav.dashboard",
  customers: "nav.customers",
  subscriptions: "nav.subscriptions",
  invoices: "nav.invoices",
  team: "nav.team",
  analytics: "nav.analytics",
  tasks: "nav.tasks",
  tickets: "nav.tickets",
  settings: "nav.settings",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const segments = pathname.split("/").filter(Boolean);
  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = pathToKey[segment] ? t(pathToKey[segment]) : segment;
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item) => (
        <div key={item.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          {item.isLast ? (
            <span className={cn("font-medium text-foreground")}>{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
