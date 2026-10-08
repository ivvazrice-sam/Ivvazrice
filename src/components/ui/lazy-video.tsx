"use client";

import { useEffect, useRef, useState } from "react";

/** Muted ambient video that only downloads when it scrolls near the viewport, and pauses off-screen. */
export function LazyVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          if (!reduce) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster || undefined}
      muted
      loop
      playsInline
      preload="none"
      src={load ? src : undefined}
      aria-hidden
    />
  );
}
