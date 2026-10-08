import "server-only";
import { defaultLocale, type LocaleCode } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Partial<Record<LocaleCode, () => Promise<Dictionary>>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const load = dictionaries[locale as LocaleCode] ?? dictionaries[defaultLocale]!;
  return load();
}
