"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import type { Video } from "@/lib/content/types";
import { cn, videoPoster } from "@/lib/utils";
import { GrainArt } from "@/components/ui/grain-art";
import { Lightbox, type LightboxItem } from "@/components/ui/lightbox";
import { Reveal, RevealText, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Eyebrow, PlaceholderTag } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";

function PlayBadge({ large }: { large?: boolean }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center rounded-full bg-pearl/90 text-ink shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110",
        large ? "size-24" : "size-16",
      )}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-pearl/30 [animation-duration:2.4s]" />
      <Play className={cn("relative translate-x-0.5 fill-current", large ? "size-7" : "size-5")} />
    </span>
  );
}

function VideoCard({ v, large, onOpen }: { v: Video; large?: boolean; onOpen: () => void }) {
  const poster = videoPoster(v.provider, v.url, v.posterUrl);
  return (
    <button type="button" onClick={onOpen} className="group relative block h-full w-full overflow-hidden rounded-[26px] bg-ink-3 text-left">
      {poster ? (
        <SmartImage src={poster} alt={v.title} fill sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} className="object-cover transition-transform duration-[1.8s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]" />
      ) : (
        <GrainArt seed={`video-${v.id}`} tone="white" background="dark" className="transition-transform duration-[1.8s] group-hover:scale-[1.05]" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/10" />
      <span className="absolute inset-0 grid place-items-center">
        <PlayBadge large={large} />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
        <span className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-2">
          {v.category}
          {v.duration && <span className="text-pearl/50">{v.duration}</span>}
        </span>
        <span className={cn("mt-2 block font-display text-pearl", large ? "text-3xl lg:text-5xl" : "text-2xl")}>{v.title}</span>
        {v.description && <span className={cn("mt-2 block max-w-xl text-sm text-pearl/60", !large && "line-clamp-2")}>{v.description}</span>}
      </span>
    </button>
  );
}

/** Cinematic video cards; nothing is downloaded from YouTube/Vimeo/MP4 until the visitor presses play. */
export function VideoSection({ videos, showPlaceholders, compact = false }: { videos: Video[]; showPlaceholders: boolean; compact?: boolean }) {
  const { dict } = useI18n();
  const [index, setIndex] = useState<number | null>(null);
  if (!videos.length && !showPlaceholders) return null;

  const ordered = [...videos].sort((a, b) => Number(b.featured) - Number(a.featured));
  const [featured, ...rest] = ordered;
  const items: LightboxItem[] = ordered.map((v) => ({ type: "video", src: v.url, title: v.title, description: v.description, provider: v.provider, poster: v.posterUrl }));

  return (
    <section id="videos" className="relative overflow-hidden bg-ink-2 py-24 text-pearl lg:py-36">
      <div className="container-x">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">{dict.videos.eyebrow}</Eyebrow>
          </Reveal>
          <RevealText text={dict.videos.title} className="display mt-5 text-[2.5rem] sm:text-5xl lg:text-[4.25rem]" />
          <Reveal delay={0.1}>
            <p className="mt-6 text-pearl/55">{dict.videos.lede}</p>
          </Reveal>
        </div>

        {videos.length ? (
          <Stagger className="mt-14 grid gap-4 lg:grid-cols-3">
            <StaggerItem className="aspect-[16/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:min-h-[560px]">
              <VideoCard v={featured} large onOpen={() => setIndex(0)} />
            </StaggerItem>
            {rest.slice(0, compact ? 2 : undefined).map((v, i) => (
              <StaggerItem key={v.id} className="aspect-[16/10]">
                <VideoCard v={v} onOpen={() => setIndex(i + 1)} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dict.videos.suggestions.map((title, i) => (
              <li key={title} className={cn("relative aspect-[16/10] overflow-hidden rounded-[26px] border border-dashed border-pearl/15", i === 0 && "sm:col-span-2 lg:row-span-2 lg:aspect-auto")}>
                <GrainArt seed={`vs-${i}`} tone="white" background="dark" className="opacity-35" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full border border-pearl/20 text-pearl/50">
                    <Play className="size-5" />
                  </span>
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-xl">{title}</p>
                  <PlaceholderTag className="mt-2 text-pearl/60">{dict.common.addInAdmin}</PlaceholderTag>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
