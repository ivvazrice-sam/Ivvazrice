/**
 * Locale configuration. English is live; other locales are prepared but disabled until
 * translated content has been reviewed and approved. To launch a language:
 *   1. add a dictionary in ./dictionaries (copy en.ts and translate),
 *   2. register it in ./get-dictionary.ts,
 *   3. set `enabled: true` below.
 * Company-specific content (products, story, etc.) is never machine-translated automatically.
 */
export const locales = [
  { code: "en", label: "English", dir: "ltr", enabled: true },
  { code: "ar", label: "العربية", dir: "rtl", enabled: false },
  { code: "fr", label: "Français", dir: "ltr", enabled: false },
  { code: "es", label: "Español", dir: "ltr", enabled: false },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];
export const defaultLocale: LocaleCode = "en";
export const enabledLocales = locales.filter((l) => l.enabled).map((l) => l.code) as LocaleCode[];

export const isEnabledLocale = (value: string): value is LocaleCode => (enabledLocales as string[]).includes(value);
export const localeDir = (code: string) => locales.find((l) => l.code === code)?.dir ?? "ltr";

/** Localised path. The default locale has clean, prefix-free URLs. */
export function localePath(locale: string, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
