"use client";

import { Zap } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function AuthBranding() {
  const { t } = useTranslation();

  const stats = [
    { label: t("authLayout.activeUsers"), value: "12.400+" },
    { label: t("authLayout.processedRevenue"), value: "€8,2M+" },
    { label: t("authLayout.supportTickets"), value: t("authLayout.ticketsResolved") },
    { label: t("authLayout.uptime"), value: "99,9%" },
  ];

  return (
    <div className="hidden lg:flex flex-col w-[480px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-12 relative overflow-hidden shrink-0">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Logo */}
      <div className="relative flex items-center gap-3 mb-auto">
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">FlowPilot</span>
      </div>

      {/* Tagline */}
      <div className="relative mt-auto">
        <h2 className="text-3xl font-bold leading-tight mb-4">
          {t("authLayout.tagline")}
        </h2>
        <p className="text-white/70 text-base leading-relaxed">
          {t("authLayout.description")}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-white/60 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
