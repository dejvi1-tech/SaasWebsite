"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumb } from "./breadcrumb";
import { MobileSidebar } from "./mobile-sidebar";
import { DemoBanner } from "./demo-banner";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DemoBanner />
        <Header user={user} />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            <Breadcrumb />
          </div>
          <main className="px-6 pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
