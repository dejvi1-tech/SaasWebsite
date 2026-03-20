"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Language, DEFAULT_LANGUAGE, isValidLanguage } from "@/lib/i18n";

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang) => {
        if (isValidLanguage(lang)) {
          set({ language: lang });
        }
      },
    }),
    {
      name: "flowpilot-language",
    }
  )
);
