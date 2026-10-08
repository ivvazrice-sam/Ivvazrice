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
}: {
  content: ContentSnapshot;
  locale: string;
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const { company, settings } = content;
  const siteName = brand(company.name);
  const desc = description || settings.seoDescription || company.shortDescription;
  const url = localePath(locale, path);
  const ogImage = image || settings.ogImageUrl || undefined;
  const languages = Object.fromEntries(enabledLocales.map((l) => [l, localePath(l, path)]));

  return {
    title: title ? `${title} | ${siteName}` : settings.seoTitle || siteName,
    description: desc,
    keywords: settings.seoKeywords,
    alternates: { canonical: url, languages: { ...languages, "x-default": localePath("en", path) } },
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
  const { company, collections } = content;
  const sameAs = collections.socialLinks.map((s) => s.url).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: brand(company.name),
    ...(hasValue(company.legalName) ? { legalName: company.legalName } : {}),
    url: env.siteUrl,
    ...(company.logoUrl ? { logo: company.logoUrl.startsWith("http") ? company.logoUrl : absoluteUrl(company.logoUrl) } : {}),
    ...(hasValue(company.shortDescription) ? { description: company.shortDescription } : {}),
    ...(hasValue(company.foundedYear) ? { foundingDate: company.foundedYear } : {}),
    ...(hasValue(company.address) ? { address: { "@type": "PostalAddress", streetAddress: company.address, addressCountry: "IN" } } : {}),
    ...(hasValue(company.email) || hasValue(company.phone)
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              ...(hasValue(company.email) ? { email: company.email } : {}),
              ...(hasValue(company.phone) ? { telephone: company.phone } : {}),
              availableLanguage: ["English"],
            },
          ],
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function productSchema(product: Product, content: ContentSnapshot, locale: string) {
  const image = product.images.map((i) => (i.url.startsWith("http") ? i.url : absoluteUrl(i.url)));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.overview,
    url: absoluteUrl(localePath(locale, `/products/${product.slug}`)),
    ...(image.length ? { image } : {}),
    ...(hasValue(product.category) ? { category: product.category } : {}),
    brand: { "@type": "Brand", name: brand(content.company.name) },
    manufacturer: { "@id": absoluteUrl("/#organization") },
    ...(product.specifications.length
      ? {
          additionalProperty: product.specifications
            .filter((s) => hasValue(s.value))
            .map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
