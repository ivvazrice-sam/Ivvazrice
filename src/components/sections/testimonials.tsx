"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { Testimonial } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";

/** CMS-controlled testimonials. Renders nothing until real, published testimonials exist. */
export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const { dict } = useI18n();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (!items.length) return null;
  const t = items[i];

  return (
    <section id="testimonials" className="noise relative overflow-hidden bg-forest py-24 text-pearl lg:py-36" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <Eyebrow tone="light">{dict.testimonials.eyebrow}</Eyebrow>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Quote className="size-14 text-gold/60 lg:col-span-1" strokeWidth={1} />
          <div className="min-h-[18rem] lg:col-span-10" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure key={t.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <blockquote className="display text-3xl leading-[1.2] sm:text-4xl lg:text-5xl">“{t.quote}”</blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  {t.imageUrl && (
                    <span className="relative size-14 overflow-hidden rounded-full">
                      <SmartImage src={t.imageUrl} alt={t.customerName} fill sizes="56px" className="object-cover" />
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold">{t.customerName}</span>
                    <span className="block text-sm text-pearl/55">{[t.company, t.country].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-12 flex items-center gap-6 lg:pl-[8.33%]">
            <div className="flex gap-2">
              <button type="button" aria-label="Previous" onClick={() => setI((x) => (x - 1 + items.length) % items.length)} className="grid size-11 place-items-center rounded-full border border-pearl/20 hover:bg-pearl/10">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next" onClick={() => setI((x) => (x + 1) % items.length)} className="grid size-11 place-items-center rounded-full border border-pearl/20 hover:bg-pearl/10">
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="flex gap-1.5">
              {items.map((it, k) => (
                <button key={it.id} type="button" aria-label={`${k + 1}`} onClick={() => setI(k)} className={cn("h-1 rounded-full transition-all duration-500", k === i ? "w-10 bg-gold" : "w-4 bg-pearl/20")} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
