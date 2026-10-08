import "server-only";
import { cache } from "react";
import { isSampleMedia } from "@/lib/utils";
import { getStore } from "./store";
import { COLLECTION_KEYS, type ContentSnapshot, type SiteSettings } from "./types";

const clear = (url: string) => (isSampleMedia(url) ? "" : url);

/** Once placeholder mode is off, bundled sample photography disappears everywhere (artwork fallbacks take over). */
function withoutSamples(s: ContentSnapshot): ContentSnapshot {
  const settings = { ...s.settings };
  for (const key of Object.keys(settings) as (keyof SiteSettings)[]) {
    if (key.startsWith("image") || key === "ogImageUrl") (settings as Record<string, unknown>)[key] = clear(String(settings[key] ?? ""));
  }
  const c = s.collections;
  return {
    company: { ...s.company, aboutMediaUrl: clear(s.company.aboutMediaUrl), heroPosterUrl: clear(s.company.heroPosterUrl) },
    settings,
    collections: {
      ...c,
      products: c.products.filter((p) => !p.sampleData).map((p) => ({ ...p, images: p.images.filter((i) => !isSampleMedia(i.url)) })),
      processingSteps: c.processingSteps.map((st) => ({ ...st, mediaUrl: clear(st.mediaUrl) })),
      technologies: c.technologies.map((t) => ({ ...t, mediaUrl: clear(t.mediaUrl) })),
      factoryMedia: c.factoryMedia.filter((m) => !isSampleMedia(m.url)),
      packaging: c.packaging.map((p) => ({ ...p, imageUrl: clear(p.imageUrl) })),
      kitchenVideos: c.kitchenVideos.filter((k) => !isSampleMedia(k.videoUrl)),
    },
  };
}

/** Everything the public site renders, fetched once per request/render pass. */
export const getSiteContent = cache(async (): Promise<ContentSnapshot> => {
  const store = await getStore("public");
  const [company, settings, ...lists] = await Promise.all([
    store.getCompany(),
    store.getSettings(),
    ...COLLECTION_KEYS.map((k) => store.list(k)),
  ]);
  const collections = Object.fromEntries(COLLECTION_KEYS.map((k, i) => [k, lists[i]])) as ContentSnapshot["collections"];
  const snapshot = { company, settings, collections };
  return settings.showPlaceholders ? snapshot : withoutSamples(snapshot);
});

export const getProductBySlug = cache(async (slug: string) => {
  const { collections } = await getSiteContent();
  return collections.products.find((p) => p.slug === slug) ?? null;
});
