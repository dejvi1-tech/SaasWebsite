"use client";

import { Bell, Search, Sun, Moon, Monitor, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { DEMO_MODE } from "@/lib/demo-auth";

interface HeaderProps {
  user?: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    if (DEMO_MODE) {
      await fetch("/api/demo/logout", { method: "POST" });
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  const ThemeIcon = mounted
    ? theme === "dark" ? Moon : theme === "light" ? Sun : Monitor
    : Monitor;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm px-4 flex items-center gap-3 shrink-0 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <Input
          placeholder={t("common.searchPlaceholder")}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          className="h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={cycleTheme} className="h-8 w-8">
          <ThemeIcon className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{t("notifications.title")}</span>
              <Button variant="ghost" size="sm" className="h-auto py-0 px-1 text-xs">
                {t("notifications.markAllRead")}
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <NotificationItem
              title={t("dashboard.notifications.newCustomer")}
              message={t("dashboard.notifications.newCustomerMsg")}
              time="2 Min."
              unread
            />
            <NotificationItem
              title={t("dashboard.notifications.paymentReceived")}
              message={t("dashboard.notifications.paymentReceivedMsg")}
              time="15 Min."
              unread
            />
            <NotificationItem
              title={t("dashboard.notifications.ticketAnswered")}
              message={t("dashboard.notifications.ticketAnsweredMsg")}
              time="1 Std."
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-sm text-muted-foreground">
              <Link href="/dashboard/notifications">{t("notifications.viewAll")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {user?.full_name ? getInitials(user.full_name) : "FP"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {user?.full_name ?? user?.email ?? "User"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name ?? "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                {t("settings.tabs.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("auth.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  message,
  time,
  unread,
}: {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <DropdownMenuItem className="flex items-start gap-3 py-2.5 cursor-pointer">
      {unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
      {!unread && <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{message}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </DropdownMenuItem>
  );
}
