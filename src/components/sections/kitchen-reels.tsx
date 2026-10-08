"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/client";
import type { KitchenVideo } from "@/lib/content/types";
import { cn, isSampleMedia } from "@/lib/utils";
import { GrainArt } from "@/components/ui/grain-art";
import { lockScroll } from "@/components/ui/lightbox";
import { Reveal, RevealText } from "@/components/ui/reveal";
import { Eyebrow, PlaceholderTag } from "@/components/ui/section-heading";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Card: loads its (light) video only when it approaches the viewport, plays muted while
 * at least 60% visible, pauses otherwise. The thin bar at the bottom tracks playback.
 */
function ReelCard({ item, index, onOpen, dragging }: { item: KitchenVideo; index: number; onOpen: () => void; dragging: () => boolean }) {
  const { dict } = useI18n();
  const box = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(false);

  // Load only when hovered — no autoplay on scroll for performance.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (hover && load) v.play().catch(() => {});
    else v.pause();
  }, [hover, load]);

  return (
    <button
      ref={box}
      type="button"
      onClick={() => !dragging() && onOpen()}
      onMouseEnter={() => { setLoad(true); setHover(true); }}
      onMouseLeave={() => setHover(false)}
      onFocus={() => { setLoad(true); setHover(true); }}
      onBlur={() => setHover(false)}
      aria-label={`${dict.kitchen.watch}: ${item.title}`}
      className="group relative block aspect-[9/16] w-[68vw] shrink-0 snap-start overflow-hidden rounded-[22px] bg-ink-3 text-left shadow-[0_30px_60px_-30px_rgba(27,49,37,0.55)] ring-1 ring-ink/10 transition-[transform,box-shadow] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-2 hover:shadow-[0_45px_80px_-30px_rgba(27,49,37,0.65)] sm:w-[280px] lg:w-[300px]"
    >
      {item.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.posterUrl} alt="" loading="lazy" className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", playing && "opacity-0")} />
      )}
      {!item.posterUrl && !playing && <GrainArt seed={item.id} tone="golden" background="dark" />}
      <video
        ref={video}
        src={load ? item.videoUrl : undefined}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
        }}
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.08]"
        aria-hidden
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

      <span className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        {item.tag && <span className="rounded-full bg-black/45 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">{item.tag}</span>}
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-black/45 text-white/80 backdrop-blur-md">
          <VolumeX className="size-3.5" />
        </span>
      </span>

      <span className={cn("absolute inset-0 grid place-items-center transition-opacity duration-500", playing && "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
        <span className="relative grid size-16 place-items-center rounded-full bg-white/90 text-ink shadow-xl transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:bg-gold">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-duration:2.6s]" />
          <Play className="relative size-6 translate-x-0.5 fill-current" />
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 p-5">
        <span className="text-[0.62rem] font-semibold tabular-nums text-gold-2">{String(index + 1).padStart(2, "0")}</span>
        <span className="mt-1 block font-display text-2xl leading-tight text-white">{item.title}</span>
        {item.description && <span className="mt-1.5 block text-xs text-white/65 transition-all duration-500 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-10 sm:group-hover:opacity-100">{item.description}</span>}
        <span className="mt-4 block h-0.5 overflow-hidden rounded-full bg-white/20">
          <span ref={bar} className="block h-full origin-left scale-x-0 bg-gold" />
        </span>
      </span>
      {isSampleMedia(item.videoUrl) && (
        <span className="absolute left-4 top-[3.25rem] rounded-full bg-black/55 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/70">Sample video</span>
      )}
    </button>
  );
}

/** Full-screen story viewer: sound on, segmented progress, auto-advance, swipe/keyboard navigation. */
function ReelViewer({ items, index, onIndex, onClose }: { items: KitchenVideo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { dict } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const item = items[index];

  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => setMuted(true)); // fall back to muted if the browser blocks sound
  }, [paused, index]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-lenis-prevent
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      {/* Ambient blurred backdrop from the poster */}
      {item.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.posterUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
      )}

      <button type="button" aria-label="Previous" onClick={(e) => (e.stopPropagation(), go(-1))} className="absolute left-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:grid lg:left-10">
        <ChevronLeft className="size-6" />
      </button>
      <button type="button" aria-label="Next" onClick={(e) => (e.stopPropagation(), go(1))} className="absolute right-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:grid lg:right-10">
        <ChevronRight className="size-6" />
      </button>

      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
        className="relative aspect-[9/16] h-[min(88svh,calc(100vw*16/9))] overflow-hidden bg-black sm:rounded-[26px] sm:ring-1 sm:ring-white/10"
      >
        <video
          ref={video}
          src={item.videoHdUrl || item.videoUrl}
          poster={item.posterUrl || undefined}
          autoPlay
          playsInline
          muted={muted}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (fill.current && v.duration) fill.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
          }}
          onEnded={() => go(1)}
          onClick={() => setPaused((p) => !p)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* Story segments */}
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {items.map((it, i) => (
            <button key={it.id} type="button" aria-label={it.title} onClick={() => onIndex(i)} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              {i < index ? <span className="block h-full bg-white" /> : i === index ? <span ref={fill} className="block h-full origin-left scale-x-0 bg-white" /> : null}
            </button>
          ))}
        </div>

        <div className="absolute inset-x-3 top-7 flex items-center justify-between">
          {item.tag && <span className="rounded-full bg-black/40 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">{item.tag}</span>}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? dict.kitchen.play : dict.kitchen.pause} className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
              {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4" />}
            </button>
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? dict.kitchen.unmute : dict.kitchen.mute} className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {paused && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid size-20 place-items-center rounded-full bg-white/85 text-ink">
                <Play className="size-8 translate-x-0.5 fill-current" />
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
          <p className="text-[0.65rem] font-semibold tabular-nums text-gold-2">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
          <h3 className="mt-1 font-display text-3xl text-white">{item.title}</h3>
          {item.description && <p className="mt-2 text-sm text-white/70">{item.description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** "Kitchen Creativity": vertical reels of rice dishes, styled like social stories. */
export function KitchenReels({ items, showPlaceholders }: { items: KitchenVideo[]; showPlaceholders: boolean }) {
  const { dict } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [open, setOpen] = useState<number | null>(null);
  // Portals only exist on the client; this stays false during SSR and hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const onScroll = () => {
    const el = track.current;
    if (!el || !progress.current) return;
    const max = el.scrollWidth - el.clientWidth;
    progress.current.style.transform = `scaleX(${max > 0 ? Math.max(0.08, el.scrollLeft / max) : 1})`;
  };
  useEffect(onScroll, [items.length]);

  const page = (d: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!items.length && !showPlaceholders) return null;

  return (
    <section id="kitchen" className="relative overflow-hidden bg-[linear-gradient(180deg,#f6eedb_0%,#eef1e2_55%,#e3ecd6_100%)] py-24 text-ink lg:py-32">
      {/* Warm kitchen glow + faint rice texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <GrainArt seed="kitchen-bg" tone="golden" background="none" density={0.7} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(232,203,139,0.45),transparent_70%),radial-gradient(60%_50%_at_50%_100%,rgba(110,154,88,0.18),transparent_70%)]" />

      <div className="container-x relative text-center">
        <Reveal>
          <Eyebrow className="justify-center">
            {dict.kitchen.eyebrow}
          </Eyebrow>
        </Reveal>
        <RevealText text={dict.kitchen.title} className="display mt-5 text-5xl sm:text-6xl lg:text-[5.5rem]" />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-stone">{dict.kitchen.lede}</p>
        </Reveal>
      </div>

      {items.length ? (
        <>
          <Reveal delay={0.15} className="relative mt-14">
            <div
              ref={track}
              onScroll={onScroll}
              onPointerDown={(e) => {
                if (e.pointerType !== "mouse" || !track.current) return;
                drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d.down || !track.current) return;
                const dx = e.clientX - d.x;
                if (Math.abs(dx) > 6) d.moved = true;
                track.current.scrollLeft = d.left - dx;
              }}
              onPointerUp={() => {
                drag.current.down = false;
                setTimeout(() => (drag.current.moved = false), 0);
              }}
              onPointerLeave={() => (drag.current.down = false)}
              className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-6 active:cursor-grabbing md:scroll-px-10 md:px-10 xl:scroll-px-16 xl:px-16"
            >
              {items.map((item, i) => (
                <ReelCard key={item.id} item={item} index={i} onOpen={() => setOpen(i)} dragging={() => drag.current.moved} />
              ))}
              <span className="w-1 shrink-0" aria-hidden />
            </div>
          </Reveal>

          <div className="container-x relative mt-6 flex items-center gap-6">
            <div className="h-px flex-1 overflow-hidden bg-ink/10">
              <span ref={progress} className="block h-full origin-left scale-x-[0.08] bg-gold transition-transform duration-300" />
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous" onClick={() => page(-1)} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-pearl/60 text-ink transition-colors hover:bg-ink hover:text-pearl">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next" onClick={() => page(1)} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-pearl/60 text-ink transition-colors hover:bg-ink hover:text-pearl">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="container-x relative mt-14 flex gap-5 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative grid aspect-[9/16] w-[260px] shrink-0 place-items-center rounded-[22px] border border-dashed border-ink/20">
              <PlaceholderTag className="text-stone">{dict.common.addInAdmin}</PlaceholderTag>
            </div>
          ))}
        </div>
      )}

      {mounted &&
        createPortal(<AnimatePresence>{open !== null && <ReelViewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>, document.body)}
    </section>
  );
}
