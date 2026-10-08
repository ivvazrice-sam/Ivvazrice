"use client";

import { useEffect, useRef } from "react";

/** Lightweight 2D fallback for the export globe (no WebGL / reduced motion): dotted map + static routes. */
export function FlatMap({ origin, points }: { origin: { lat: number; lng: number }; points: { id: string; lat: number; lng: number }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { buildLandDots } = await import("@/components/three/land-mask");
      const dots = await buildLandDots(2);
      const canvas = ref.current;
      if (!alive || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      const px = (lng: number) => ((lng + 180) / 360) * w;
      const py = (lat: number) => ((82 - lat) / 140) * h;
      for (const d of dots) {
        ctx.fillStyle = d.india ? "rgba(255,214,140,0.95)" : "rgba(199,168,112,0.35)";
        ctx.beginPath();
        ctx.arc(px(d.lng), py(d.lat), d.india ? 1.4 : 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      const ox = px(origin.lng);
      const oy = py(origin.lat);
      ctx.lineWidth = 1.2;
      for (const p of points) {
        const x = px(p.lng);
        const y = py(p.lat);
        ctx.strokeStyle = "rgba(233,207,148,0.7)";
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.quadraticCurveTo((ox + x) / 2, Math.min(oy, y) - Math.abs(x - ox) * 0.25, x, y);
        ctx.stroke();
        ctx.fillStyle = "#f4e3bd";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffd98a";
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fill();
    })();
    return () => {
      alive = false;
    };
  }, [origin, points]);

  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
