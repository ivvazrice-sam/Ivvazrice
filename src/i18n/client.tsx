"use client";

import { createContext, useContext } from "react";
import { localePath } from "./config";
import type { Dictionary } from "./dictionaries/en";

const I18nContext = createContext<{ locale: string; dict: Dictionary } | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: string; dict: Dictionary; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return { ...ctx, href: (path: string) => localePath(ctx.locale, path) };
}
