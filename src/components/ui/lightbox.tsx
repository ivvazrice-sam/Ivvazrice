"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { VideoProvider } from "@/lib/content/types";
import { cn, videoEmbedSrc } from "@/lib/utils";

export interface LightboxItem {
  type: "image" | "video";
  src: string;
  title: string;
  description?: string;
  provider?: VideoProvider;
  poster?: string;
}

export function lockScroll(lock: boolean) {
  const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
  if (lock) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

/** Fullscreen media viewer: keyboard navigation, click-to-zoom with pan, native fullscreen, video playback. */
export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const shell = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setZoom(false);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open, go, onClose]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else shell.current?.requestFullscreen?.().catch(() => {});
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          ref={shell}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex flex-col bg-ink/95 text-pearl backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="min-w-0">
              <p className="truncate font-display text-lg">{item.title}</p>
              {items.length > 1 && (
                <p className="text-xs text-pearl/50">
                  {index! + 1} / {items.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {item.type === "image" && (
                <IconBtn label={zoom ? "Zoom out" : "Zoom in"} onClick={() => setZoom((z) => !z)}>
                  {zoom ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
                </IconBtn>
              )}
              <IconBtn label="Fullscreen" onClick={fullscreen}>
                <Maximize2 className="size-5" />
              </IconBtn>
              <IconBtn label="Close" onClick={onClose}>
                <X className="size-5" />
              </IconBtn>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className="relative flex h-full w-full items-center justify-center overflow-hidden"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.title}
                    onClick={() => setZoom((z) => !z)}
                    onMouseMove={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
                    }}
                    style={{ transformOrigin: origin }}
                    className={cn(
                      "max-h-full max-w-full select-none object-contain transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      zoom ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in",
                    )}
                  />
                ) : !item.provider || item.provider === "mp4" ? (
                  <video src={item.src} poster={item.poster} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg" />
                ) : (
                  <div className="aspect-video w-full max-w-6xl overflow-hidden rounded-lg bg-black">
                    <iframe
                      src={videoEmbedSrc(item.provider, item.src)}
                      title={item.title}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <IconBtn label="Previous" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 md:left-6">
                  <ChevronLeft className="size-6" />
                </IconBtn>
                <IconBtn label="Next" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 md:right-6">
                  <ChevronRight className="size-6" />
                </IconBtn>
              </>
            )}
          </div>
          {item.description && <p className="mx-auto max-w-2xl px-6 pb-8 text-center text-sm text-pearl/60">{item.description}</p>}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function IconBtn({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("grid size-11 place-items-center rounded-full border border-pearl/10 bg-pearl/5 transition-colors hover:bg-pearl/15", className)}
    >
      {children}
    </button>
  );
}
