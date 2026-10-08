import type { GrainTone, MediaType } from "@/lib/content/types";
import { cn, isSampleMedia } from "@/lib/utils";
import { GrainArt } from "./grain-art";
import { LazyVideo } from "./lazy-video";
import { PlaceholderTag } from "./section-heading";
import { SmartImage } from "./smart-image";

/** Small "Sample photo" marker for bundled stock photography (placeholder mode only). */
export function SampleBadge({ url, className }: { url?: string; className?: string }) {
  if (!isSampleMedia(url)) return null;
  return (
    <span className={cn("pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-pearl/80 backdrop-blur", className)}>
      Sample photo
    </span>
  );
}

/**
 * Renders uploaded company media, or — until real photography exists — a generative
 * rice artwork with an optional "add media" label (only shown in placeholder mode).
 */
export function MediaFrame({
  url,
  type = "image",
  alt,
  seed,
  tone = "white",
  variant = "field",
  background = "dark",
  label,
  showLabel = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  className,
  imgClassName,
  poster,
  kenburns = false,
  badgeClassName,
  renderFallback,
}: {
  url?: string;
  type?: MediaType;
  alt: string;
  seed: string;
  tone?: GrainTone;
  variant?: "field" | "heap";
  background?: "dark" | "light" | "none";
  label?: string;
  showLabel?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  poster?: string;
  /** Slow cinematic drift on photographs. */
  kenburns?: boolean;
  badgeClassName?: string;
  /** Pre-rendered 3D image shown (instead of generative art) when no media is uploaded. */
  renderFallback?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {url ? (
        <>
          {type === "video" ? (
            <LazyVideo src={url} poster={poster} className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)} />
          ) : (
            <div className={cn("absolute inset-0", kenburns && "kenburns")}>
              <SmartImage src={url} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
            </div>
          )}
          <SampleBadge url={url} className={badgeClassName} />
        </>
      ) : renderFallback ? (
        <div className={cn("absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,#fffcf3_0%,#efe6d0_70%,#e2d6bb_100%)]", imgClassName)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={renderFallback} alt={alt} loading="lazy" className="absolute inset-x-[6%] top-[22%] w-[88%] object-contain drop-shadow-[0_18px_24px_rgba(27,49,37,0.18)]" />
        </div>
      ) : (
        <>
          <GrainArt seed={seed} tone={tone} variant={variant} background={background} className={cn("absolute inset-0", imgClassName)} title={alt} />
          {showLabel && label && (
            <div className={cn("absolute bottom-4 left-4", background === "light" ? "text-stone" : "text-pearl/80")}>
              <PlaceholderTag>{label}</PlaceholderTag>
            </div>
          )}
        </>
      )}
    </div>
  );
}
