"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/** Subtle 3D tilt that follows the pointer, with a soft light sheen. Mouse only — touch input is ignored. */
export function TiltCard({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), transparent 55%)`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  return (
    <div className="h-full [perspective:1200px]">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={cn("relative h-full will-change-transform", className)}
      >
        {children}
        <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: sheen }} aria-hidden />
      </motion.div>
    </div>
  );
}
