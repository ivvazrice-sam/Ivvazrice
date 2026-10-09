import "server-only";
import type { Metadata } from "next";
import { enabledLocales, localePath } from "@/i18n/config";
import { env } from "@/lib/env";
import type { ContentSnapshot, Product } from "@/lib/content/types";
import { hasValue } from "@/lib/utils";

export const absoluteUrl = (path: string) => `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
const brand = (name: string) => name.replace(/^\[|\]$/g, "");

/** Consistent per-page metadata: unique title, description, canonical URL, hreflang, Open Graph and X cards. */
export function pageMetadata({
  content,
  locale,
  path,
  title,
  description,
  image,
  noIndex,
  extraKeywords,
}: {
  content: ContentSnapshot;
  locale: string;
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  /** Page-specific keywords (variety names, cooking uses, etc.) layered onto the global list. */
  extraKeywords?: string[];
}): Metadata {
  const { company, settings } = content;
  const siteName = brand(company.name);
  const desc = description || settings.seoDescription || company.shortDescription;
  const url = localePath(locale, path);
  const ogImage = image || settings.ogImageUrl || undefined;
  const languages = Object.fromEntries(enabledLocales.map((l) => [l, localePath(l, path)]));

  const brandKeywords = [
    siteName,
    `${siteName} Rice`,
    `${siteName} Rice Mill`,
    `${siteName} Exports`,
    ...(settings.brandAliases ?? []),
  ];
  const keywords = Array.from(
    new Set([...(extraKeywords ?? []), ...(settings.seoKeywords ?? []), ...brandKeywords]),
  ).filter(Boolean);
  const verification =
    settings.googleSiteVerification || settings.bingSiteVerification
      ? {
          ...(settings.googleSiteVerification ? { google: settings.googleSiteVerification } : {}),
          ...(settings.bingSiteVerification ? { other: { "msvalidate.01": settings.bingSiteVerification } } : {}),
        }
      : undefined;

  return {
    title: title ? `${title} | ${siteName}` : settings.seoTitle || siteName,
    description: desc,
    keywords,
    alternates: { canonical: url, languages: { ...languages, "x-default": localePath("en", path) } },
    ...(verification ? { verification } : {}),
    openGraph: {
      type: "website",
      siteName,
      title: title || settings.seoTitle || siteName,
      description: desc,
      url,
      locale,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title || settings.seoTitle || siteName,
      description: desc,
      ...(hasValue(settings.twitterHandle) ? { site: settings.twitterHandle } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function organizationSchema(content: ContentSnapshot) {
  const { company, collections, settings } = content;
  const sameAs = collections.socialLinks.map((s) => s.url).filter(Boolean);
  const siteName = brand(company.name);
  const aliases = (settings.brandAliases ?? []).filter((a) => a && a !== siteName);
  const hasGeo = Number.isFinite(company.originLat) && Number.isFinite(company.originLng) && (company.originLat !== 0 || company.originLng !== 0);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": absoluteUrl("/#organization"),
    name: siteName,
    ...(aliases.length ? { alternateName: aliases } : {}),
    ...(hasValue(company.legalName) ? { legalName: company.legalName } : {}),
    url: env.siteUrl,
    ...(company.logoUrl ? { logo: company.logoUrl.startsWith("http") ? company.logoUrl : absoluteUrl(company.logoUrl) } : {}),
    ...(company.logoUrl ? { image: company.logoUrl.startsWith("http") ? company.logoUrl : absoluteUrl(company.logoUrl) } : {}),
    ...(hasValue(company.shortDescription) ? { description: company.shortDescription } : {}),
    ...(hasValue(company.foundedYear) ? { foundingDate: company.foundedYear } : {}),
    ...(hasValue(company.address)
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: company.address,
            addressCountry: "IN",
            ...(hasValue(company.originCountry) ? { addressRegion: company.originCountry } : {}),
          },
        }
      : {}),
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: company.originLat, longitude: company.originLng } } : {}),
    ...(hasValue(company.email) || hasValue(company.phone)
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              ...(hasValue(company.email) ? { email: company.email } : {}),
              ...(hasValue(company.phone) ? { telephone: company.phone } : {}),
              areaServed: "Worldwide",
              availableLanguage: ["English", "Hindi"],
            },
          ],
        }
      : {}),
    knowsAbout: ["Basmati rice", "Non-basmati rice", "Rice milling", "Rice export", "FOB shipping", "CIF shipping", "APEDA export", "Food processing"],
    naics: "311212",
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Sitelinks + search box in Google results. */
export function websiteSchema(content: ContentSnapshot) {
  const siteName = brand(content.company.name);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: env.siteUrl,
    name: siteName,
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${env.siteUrl}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en",
  };
}

/** Rich FAQ accordion inside Google results. Pass the same Q/A pairs rendered on the page. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function productSchema(product: Product, content: ContentSnapshot, locale: string) {
  const image = product.images.map((i) => (i.url.startsWith("http") ? i.url : absoluteUrl(i.url)));
  const specProperties = product.specifications
    .filter((s) => hasValue(s.value))
    .map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value }));
  const intrinsic = [
    hasValue(product.variety) && { "@type": "PropertyValue", name: "Variety", value: product.variety },
    hasValue(product.grainLength) && { "@type": "PropertyValue", name: "Grain length", value: product.grainLength },
    hasValue(product.cookedLength) && { "@type": "PropertyValue", name: "Cooked length", value: product.cookedLength },
    hasValue(product.texture) && { "@type": "PropertyValue", name: "Texture", value: product.texture },
    hasValue(product.appearance) && { "@type": "PropertyValue", name: "Appearance", value: product.appearance },
    hasValue(product.availableQuantities) && { "@type": "PropertyValue", name: "Packaging", value: product.availableQuantities },
  ].filter(Boolean);
  const siteName = brand(content.company.name);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(localePath(locale, `/products/${product.slug}`)) + "#product",
    name: product.name,
    description: product.shortDescription || product.overview,
    url: absoluteUrl(localePath(locale, `/products/${product.slug}`)),
    sku: product.id,
    ...(image.length ? { image } : {}),
    ...(hasValue(product.category) ? { category: product.category } : {}),
    brand: { "@type": "Brand", name: siteName },
    manufacturer: { "@id": absoluteUrl("/#organization") },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      priceSpecification: { "@type": "PriceSpecification", description: "Contact for FOB / CIF quotation" },
      seller: { "@id": absoluteUrl("/#organization") },
      areaServed: "Worldwide",
      url: absoluteUrl(localePath(locale, `/quote?product=${product.slug}`)),
    },
    additionalProperty: [...intrinsic, ...specProperties],
  };
}

/** ItemList schema for a listing page (products, factory media, countries) — helps Google generate carousel-style results. */
export function itemListSchema(items: { name: string; url: string; image?: string; description?: string }[], listName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(listName ? { name: listName } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url.startsWith("http") ? it.url : absoluteUrl(it.url),
      ...(it.image ? { image: it.image.startsWith("http") ? it.image : absoluteUrl(it.image) } : {}),
      ...(it.description ? { description: it.description } : {}),
    })),
  };
}

/** Keywords derived from a product — variety names, use cases, HS codes. Fed to pageMetadata.extraKeywords. */
export function productKeywords(product: Product): string[] {
  const kw: string[] = [];
  if (hasValue(product.name)) kw.push(product.name, `${product.name} rice`, `${product.name} basmati`);
  if (hasValue(product.variety)) kw.push(product.variety, `${product.variety} rice`, `${product.variety} exporter`);
  if (hasValue(product.category)) kw.push(`${product.category} rice`, `${product.category} rice exporter`);
  if (hasValue(product.grainLength)) kw.push(`${product.grainLength} rice`);
  for (const tag of product.characterTags ?? []) kw.push(String(tag));
  for (const tag of product.marketTags ?? []) kw.push(String(tag));
  return kw;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
