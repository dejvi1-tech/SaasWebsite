"use client";

import { DEMO_MODE } from "@/lib/demo-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Info } from "lucide-react";

export function DemoBanner() {
  const { t } = useTranslation();

  if (!DEMO_MODE) return null;

  return (
    <div className="bg-violet-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 shrink-0">
      <Info className="h-3.5 w-3.5" />
      <span>{t("demoBanner.text")}</span>
      <span className="font-semibold">{t("demoBanner.explore")}</span>
    </div>
  );
}
