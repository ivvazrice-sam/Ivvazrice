"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { cn } from "@/lib/utils";
import { bakedHeapFor } from "@/lib/content/rice";

const RiceHeapScene = dynamic(() => import("@/components/three/rice-heap-scene"), { ssr: false });

/**
 * Live photoreal 3D rice heap. Loads only near the viewport, pauses off-screen, and falls back
 * to a pre-rendered image of the same heap on devices without capable WebGL.
 */
export function RiceHeap({ color, className, seed }: { color: string; className?: string; seed?: number }) {
  const tier = useDeviceTier();
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const live = near && (tier === "high" || tier === "low");
  return (
    <div ref={box} className={cn("relative", className)}>
      {/* Baked render: instant first paint and the no-WebGL fallback */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bakedHeapFor(color)} alt="" aria-hidden className={cn("absolute inset-0 h-full w-full object-contain transition-opacity duration-700", live && ready ? "opacity-0" : "opacity-100")} />
      {live && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
          <RiceHeapScene color={color} tier={tier} active={visible} seed={seed} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
