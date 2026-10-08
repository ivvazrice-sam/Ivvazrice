"use client";

import { Expand, Play } from "lucide-react";
import { useState } from "react";
import type { GrainTone, ProductImage, VideoRef } from "@/lib/content/types";
import { cn, videoPoster } from "@/lib/utils";
import { GrainArt } from "@/components/ui/grain-art";
import { HEAP_FOR_GRAIN_TONE } from "@/lib/content/rice";
import { Lightbox, type LightboxItem } from "@/components/ui/lightbox";
import { SmartImage } from "@/components/ui/smart-image";
import { SampleBadge } from "@/components/ui/media-frame";

/** Product gallery: large stage + thumbnails; images zoom in the lightbox, videos play in place of the stage. */
export function ProductGallery({ name, slug, tone, images, videos }: { name: string; slug: string; tone: GrainTone; images: ProductImage[]; videos: VideoRef[] }) {
  const items: LightboxItem[] = [
    ...images.map((i) => ({ type: "image" as const, src: i.url, title: i.alt || name })),
    ...videos.map((v) => ({ type: "video" as const, src: v.url, title: v.title || name, provider: v.provider, poster: v.posterUrl })),
  ];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const current = items[active];
  const currentPoster = current?.type === "video" ? videoPoster(current.provider ?? "mp4", current.src, current.poster) : current?.src;

  return (
    <div>
      <button
        type="button"
        onClick={() => items.length && setOpen(active)}
        disabled={!items.length}
        className="group relative block aspect-square w-full overflow-hidden rounded-[30px] bg-cream shadow-[0_40px_80px_-50px_rgba(27,49,37,0.6)]"
        aria-label={items.length ? `Open ${name} gallery` : name}
      >
        {currentPoster ? (
          <SmartImage src={currentPoster} alt={current.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,#fffcf3_0%,#efe6d0_70%,#e2d6bb_100%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HEAP_FOR_GRAIN_TONE[tone]} alt={name} className="absolute inset-x-[6%] top-[24%] w-[88%] object-contain" />
          </span>
        )}
        <SampleBadge url={currentPoster} />
        {items.length > 0 && (
          <span className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-ink/80 text-pearl backdrop-blur-md transition-transform group-hover:scale-110">
            {current?.type === "video" ? <Play className="size-4 fill-current" /> : <Expand className="size-4" />}
          </span>
        )}
      </button>
      {items.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3">
          {items.map((it, i) => {
            const thumb = it.type === "video" ? videoPoster(it.provider ?? "mp4", it.src, it.poster) : it.src;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={it.title}
                  aria-current={i === active}
                  className={cn("relative block aspect-square w-full overflow-hidden rounded-2xl bg-cream ring-2 ring-offset-2 ring-offset-ivory transition", i === active ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100")}
                >
                  {thumb ? <SmartImage src={thumb} alt="" fill sizes="120px" className="object-cover" /> : <GrainArt seed={`${slug}-${i}`} tone={tone} background="light" />}
                  {it.type === "video" && <Play className="absolute inset-0 m-auto size-5 fill-pearl text-pearl" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </div>
  );
}
