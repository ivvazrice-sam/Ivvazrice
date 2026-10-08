"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** Scroll-linked parallax: the inner layer drifts against the frame for depth. */
export function Parallax({ children, className, strength = 60 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, (p) => (p - 0.5) * -strength * 2);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, scale: 1 + (strength * 2.4) / 1000 }} className="absolute inset-0">
        {children}
      </motion.div>
    </div>
  );
}
