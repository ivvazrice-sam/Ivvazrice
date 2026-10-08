import "server-only";
import { notFound } from "next/navigation";
import { isEnabledLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSiteContent } from "@/lib/content/queries";
import type { ContentSnapshot } from "@/lib/content/types";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { whatsappHref } from "@/lib/utils";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo/metadata";

/** Shared loader for localised pages. */
export async function loadPage(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isEnabledLocale(locale)) notFound();
  const [content, dict] = await Promise.all([getSiteContent(), getDictionary(locale)]);
  return { locale, content, dict, sp: content.settings.showPlaceholders, href: (p: string) => localePath(locale, p) };
}

export async function metaFor(params: Promise<{ locale: string }>, path: string, title: string, description?: string) {
  const { locale } = await params;
  const content = await getSiteContent();
  return pageMetadata({ content, locale, path, title, description });
}

/** Visible breadcrumb items + matching BreadcrumbList JSON-LD. */
export function breadcrumbs(locale: string, home: string, items: { name: string; path: string }[]) {
  const all = [{ name: home, path: "/" }, ...items].map((i) => ({ name: i.name, path: localePath(locale, i.path) }));
  return { crumbs: all.map((i) => ({ name: i.name, href: i.path })), ld: breadcrumbSchema(all) };
}

export function globalExportProps(content: ContentSnapshot) {
  const { company, settings, collections } = content;
  return {
    headline: settings.exportHeadline,
    intro: settings.exportIntro,
    shippingCapability: settings.shippingCapability,
    internationalSupply: settings.internationalSupply,
    majorMarketsNote: settings.majorMarketsNote,
    origin: { name: company.originLabel, lat: company.originLat, lng: company.originLng, port: company.originPort },
    countries: collections.exportCountries,
    routes: collections.exportRoutes,
    showPlaceholders: settings.showPlaceholders,
  };
}

/** Props for the closing call-to-action band shown on every page. */
export function ctaProps(content: ContentSnapshot, dict: Dictionary, locale: string, image?: string) {
  return {
    title: dict.home.ctaTitle,
    body: dict.home.ctaBody,
    quoteHref: localePath(locale, "/quote"),
    quoteLabel: dict.cta.requestQuote,
    contactHref: localePath(locale, "/contact"),
    contactLabel: dict.nav.contact,
    whatsappHref: whatsappHref(content.company.whatsapp),
    whatsappLabel: dict.cta.whatsapp,
    image: image ?? content.settings.imageQuote,
  };
}
