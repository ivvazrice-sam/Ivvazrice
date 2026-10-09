"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { ButtonLink } from "@/components/ui/button";
import { GrainArt } from "@/components/ui/grain-art";

const HeroScene = dynamic(() => import("@/components/three/hero-scene"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

export interface HeroContent {
  companyName: string;
  headline: string;
  subheadline: string;
  foundedYear: string;
  origin: string;
  videoUrl: string;
  posterUrl: string;
}

/** Single-screen cinematic hero: headline on the left, self-playing 3D rice formations on the right. */
export function Hero({ content }: { content: HeroContent }) {
  const { dict, href } = useI18n();
  const section = useRef<HTMLElement>(null);
  const tier = useDeviceTier();
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lines = content.headline
    .split(/(?<=\.)\s+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const use3D = tier === "low" || tier === "high";
  const next = () => (section.current?.nextElementSibling as HTMLElement | null)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section ref={section} aria-label={content.headline} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-pearl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_75%_45%,#3f6b51_0%,#24412f_55%,#1b3125_100%)]" />

      {/* Fallback: company video → generative still (also shown until the 3D scene is ready) */}
      <div className={cn("absolute inset-0 transition-opacity duration-[1.6s]", use3D && ready ? "opacity-0" : "opacity-100")}>
        {content.videoUrl ? (
          <video className="h-full w-full object-cover opacity-60" src={content.videoUrl} poster={content.posterUrl || undefined} autoPlay={tier !== "none"} muted loop playsInline preload="metadata" aria-hidden />
        ) : (
          <GrainArt seed="hero" tone="husk" variant="field" background="none" density={0.6} className="opacity-25" />
        )}
      </div>

      {use3D && (
        <div className={cn("absolute inset-0 transition-opacity duration-[2s]", ready ? "opacity-100" : "opacity-0")}>
          <HeroScene tier={tier} active={active} onReady={() => setReady(true)} />
        </div>
      )}

      {/* Readability: deep green wash behind the copy */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(22,42,30,0.97)_0%,rgba(22,42,30,0.90)_40%,rgba(22,42,30,0.55)_65%,rgba(22,42,30,0.15)_85%)] max-lg:bg-[linear-gradient(180deg,rgba(22,42,30,0.55)_0%,rgba(22,42,30,0.75)_40%,rgba(22,42,30,0.97)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />

      <div className="container-x relative flex h-full flex-col justify-start pb-20 pt-[7rem] lg:justify-center lg:pb-0 lg:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
          className="eyebrow flex items-center gap-3 text-[0.78rem] text-gold-2"
        >
          <span className="h-px w-10 bg-gold-2/70" />
          {content.companyName}
        </motion.p>

        <h1 className="mt-8 max-w-4xl font-display text-[2.5rem] font-medium leading-[1.02] tracking-[-0.025em] [text-shadow:0_4px_30px_rgba(8,20,12,0.95),0_2px_10px_rgba(8,20,12,0.8)] sm:mt-6 sm:text-7xl sm:leading-[0.98] lg:text-[min(6.4rem,11.5vh)]">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={cn("block", i === lines.length - 1 && lines.length > 1 && "italic text-gold-2")}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.35 + i * 0.14 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {content.subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
            className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-pearl/90 [text-shadow:0_2px_20px_rgba(8,20,12,0.6)] sm:text-xl"
          >
            {content.subheadline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1.05 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <ButtonLink href={href("/products")} variant="gold" size="lg" arrow>
            {dict.cta.exploreProducts}
          </ButtonLink>
          <ButtonLink href={href("/export")} variant="light" size="lg">
            {dict.cta.globalExport}
          </ButtonLink>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <button
        type="button"
        onClick={next}
        aria-label={dict.cta.scroll}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-pearl/70 transition-colors hover:text-pearl"
      >
        <span className="eyebrow hidden text-[0.62rem] sm:block">{dict.cta.scroll}</span>
        <span className="grid size-10 place-items-center rounded-full border border-pearl/25 animate-float">
          <ArrowDown className="size-4" />
        </span>
      </button>
    </section>
  );
}
