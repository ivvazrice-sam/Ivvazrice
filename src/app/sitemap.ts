import type { MetadataRoute } from "next";
import { enabledLocales, localePath } from "@/i18n/config";
import { getSiteContent } from "@/lib/content/queries";
import { env } from "@/lib/env";

export const revalidate = 3600;

const STATIC = ["/", "/about", "/products", "/packaging", "/processing", "/quality", "/export", "/infrastructure", "/videos", "/contact", "/quote", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections } = await getSiteContent();
  const paths = [...STATIC, ...collections.products.map((p) => `/products/${p.slug}`)];
  const now = new Date();
  return paths.flatMap((path) =>
    enabledLocales.map((locale) => ({
      url: `${env.siteUrl}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency: path.startsWith("/products/") ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.startsWith("/products") || path === "/quote" ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(enabledLocales.map((l) => [l, `${env.siteUrl}${localePath(l, path)}`])) },
    })),
  );
}
