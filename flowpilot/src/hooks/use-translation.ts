"use client";

import { useCallback } from "react";
import { useLanguageStore } from "@/stores/language-store";
import { getTranslation } from "@/lib/i18n";

export function useTranslation() {
  const { language } = useLanguageStore();
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) =>
      getTranslation(language)(key, variables),
    [language]
  );

  return { t, language };
}
