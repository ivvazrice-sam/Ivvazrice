"use client";

import { AnimatePresence, motion } from "motion/react";
import { Expand, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { FactoryCategory, FactoryMedia } from "@/lib/content/types";
import { cn, videoPoster } from "@/lib/utils";
import { GrainArt } from "@/components/ui/grain-art";
import { Lightbox, type LightboxItem } from "@/components/ui/lightbox";
import { Eyebrow, PlaceholderTag } from "@/components/ui/section-heading";
import { RevealText, Reveal } from "@/components/ui/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { SampleBadge } from "@/components/ui/media-frame";

const CATEGORIES: FactoryCategory[] = ["rice-mill", "processing-plant", "machinery", "storage", "warehouse", "packaging", "laboratory", "loading", "container"];
const SPANS = ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"];

export function InfrastructureGallery({ items, showPlaceholders }: { items: FactoryMedia[]; showPlaceholders: boolean }) {
  const { dict } = useI18n();
  const [filter, setFilter] = useState<FactoryCategory | "all">("all");
  const [index, setIndex] = useState<number | null>(null);

  const present = useMemo(() => CATEGORIES.filter((c) => items.some((i) => i.category === c)), [items]);
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const lightbox: LightboxItem[] = visible.map((m) => ({
    type: m.type,
    src: m.url,
    title: m.title || dict.infrastructure.categories[m.category],
    description: m.description,
    provider: m.provider,
    poster: m.posterUrl,
  }));

  if (!items.length && !showPlaceholders) return null;

  return (
    <section id="infrastructure" className="relative overflow-hidden bg-sage py-24 text-ink lg:py-36">
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow>{dict.infrastructure.eyebrow}</Eyebrow>
            </Reveal>
            <RevealText text={dict.infrastructure.title} className="display mt-5 text-[2.5rem] sm:text-5xl lg:text-[4.25rem]" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-stone">{dict.infrastructure.lede}</p>
            </Reveal>
          </div>
          {present.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.infrastructure.eyebrow}>
              {(["all", ...present] as const).map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={filter === c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    filter === c ? "text-ink" : "text-stone hover:text-ink",
                  )}
                >
                  {filter === c && <motion.span layoutId="infra-filter" className="absolute inset-0 rounded-full bg-gold" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
                  <span className="relative">{c === "all" ? dict.infrastructure.all : dict.infrastructure.categories[c]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length ? (
          <motion.ul layout className="mt-14 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:auto-rows-[240px] lg:grid-cols-12">
            <AnimatePresence mode="popLayout">
              {visible.map((m, i) => {
                const poster = m.type === "video" ? videoPoster(m.provider, m.url, m.posterUrl) : m.url;
                return (
                  <motion.li
                    layout
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("group relative overflow-hidden rounded-[22px] bg-ink-3 text-pearl shadow-[0_30px_60px_-40px_rgba(27,49,37,0.6)]", SPANS[i % SPANS.length])}
                  >
                    <button type="button" onClick={() => setIndex(i)} className="absolute inset-0 text-left" aria-label={m.title || dict.infrastructure.categories[m.category]}>
                      {poster ? (
                        <SmartImage src={poster} alt={m.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" />
                      ) : (
                        <GrainArt seed={m.id} tone="white" background="dark" />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                      <SampleBadge url={m.url} />
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                        <span>
                          <span className="eyebrow block text-[0.6rem] text-gold-2">{dict.infrastructure.categories[m.category]}</span>
                          {m.title && <span className="mt-1 block font-display text-xl">{m.title}</span>}
                        </span>
                        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-pearl/20 bg-ink/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                          {m.type === "video" ? <Play className="size-4 fill-current" /> : <Expand className="size-4" />}
                        </span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <ul className="mt-14 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {CATEGORIES.slice(0, 6).map((c, i) => (
              <li key={c} className={cn("relative overflow-hidden rounded-[22px] border border-dashed border-ink/20 bg-ink text-pearl", SPANS[i])}>
                <GrainArt seed={`infra-${c}`} tone={i % 2 ? "white" : "cream"} background="dark" className="opacity-40" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-xl">{dict.infrastructure.categories[c]}</p>
                  <PlaceholderTag className="mt-2 text-pearl/60">{dict.common.addInAdmin}</PlaceholderTag>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Lightbox items={lightbox} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
