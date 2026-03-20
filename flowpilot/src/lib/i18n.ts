"use client";

import de from "../../messages/de.json";
import en from "../../messages/en.json";

export type Language = "de" | "en";

const translations = { de, en } as const;

type TranslationKeys = typeof de;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return path;
    if (typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}

export function getTranslation(lang: Language) {
  const dict = translations[lang] as unknown as Record<string, unknown>;

  return function t(key: string, variables?: Record<string, string | number>): string {
    let value = getNestedValue(dict, key);

    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = value.replace(new RegExp(`{{${varKey}}}`, "g"), String(varValue));
      });
    }

    return value;
  };
}

export const DEFAULT_LANGUAGE: Language = "de";
export const SUPPORTED_LANGUAGES: Language[] = ["de", "en"];

export function isValidLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

export type { TranslationKeys };
