"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up to a numeric value once visible. Non-numeric values (e.g. "ISO 22000") render as-is. */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
    if (!inView || !match || !ref.current) return;
    const [, pre, num, post] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const el = ref.current;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${pre}${v.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${post}`;
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
