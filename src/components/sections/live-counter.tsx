"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Globe2, Package, ShieldCheck, Timer } from "lucide-react";

type Item = { label: string; value: string | number; suffix?: string; prefix?: string; icon: "globe" | "package" | "shield" | "timer" };

const ICONS = { globe: Globe2, package: Package, shield: ShieldCheck, timer: Timer };

/** Short numeric that counts up when the strip scrolls into view (respects reduced motion). */
function Counter({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

/**
 * Strip of 4 trust-building metrics shown just below the hero: countries served, years in
 * export, certifications, and uptime/response time. Values flow in from live Supabase data
 * (export countries, certifications) plus editable company fields (founded year, response SLA).
 */
export function LiveCounter({ items }: { items: Item[] }) {
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden bg-ink py-14 text-pearl sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-leaf) 0, transparent 45%)" }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 sm:grid-cols-4 sm:gap-8">
        {items.map((it, i) => {
          const Icon = ICONS[it.icon];
          const numericValue = typeof it.value === "number" ? it.value : Number(String(it.value).replace(/[^\d]/g, ""));
          const isNumeric = Number.isFinite(numericValue) && numericValue > 0;
          return (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <Icon className="mb-3 size-5 text-gold" aria-hidden />
              <div className="font-display text-4xl font-semibold text-pearl sm:text-5xl">
                {it.prefix}
                {isNumeric ? <Counter to={numericValue} /> : String(it.value)}
                {it.suffix}
              </div>
              <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-pearl/60">{it.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
