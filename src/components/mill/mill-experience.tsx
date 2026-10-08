"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ProcessingStep } from "@/lib/content/types";
import { cn, hasValue } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import { BAYS, MillStrip, STRIP_H, STRIP_W } from "./mill-strip";

const EASE = [0.16, 1, 0.3, 1] as const;
/** Breathing room so the first and last machines clear the edge fades. */
const EDGE = 72;

/** Keeps the machines animating only while visible. */
function useVisible<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible] as const;
}

/**
 * Pinned, scroll-driven walk through the mill: vertical scrolling pans the machine line
 * sideways; the machine in focus lights up and its CMS description appears.
 */
export function MillExperience({ steps, eyebrow, title, lede, showPlaceholders }: { steps: ProcessingStep[]; eyebrow: string; title: string; lede: string; showPlaceholders: boolean }) {
  const section = useRef<HTMLElement>(null);
  const [viewport, visible] = useVisible<HTMLDivElement>();
  const [dims, setDims] = useState({ strip: 0, view: 0 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const titles = Array.from({ length: BAYS }, (_, i) => steps[i]?.title ?? "");

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -Math.max(0, dims.strip - dims.view) * Math.min(1, Math.max(0, (p - 0.04) / 0.92)));
  const bar = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p - 0.04) / 0.92)));

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.round(Math.min(1, Math.max(0, (p - 0.04) / 0.92)) * (BAYS - 1));
    if (i !== active) setActive(i);
  });

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      setDims({ strip: (h * STRIP_W) / STRIP_H + EDGE * 2, view: el.clientWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewport]);

  const jump = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * (0.04 + (i / (BAYS - 1)) * 0.92), behavior: "smooth" });
  };

  // Deep links from the home teaser: /processing#bay-5 scrolls straight to that machine.
  useEffect(() => {
    const m = window.location.hash.match(/^#bay-(\d+)$/);
    if (!m) return;
    const t = setTimeout(() => jump(Math.min(BAYS, Math.max(1, Number(m[1]))) - 1), 400);
    return () => clearTimeout(t);
  }, []);

  const step = steps[active];

  return (
    <section ref={section} id="mill" aria-label={title} className="relative bg-ink text-pearl" style={{ height: `${BAYS * 55 + 100}vh` }}>
      <div className="noise sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_60%,#2a4836_0%,#1b3125_75%)]" />

        <div className="container-x relative flex flex-wrap items-end justify-between gap-4 pt-24 lg:pt-28">
          <div>
            <Eyebrow tone="light">{eyebrow}</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden max-w-sm text-sm text-pearl/50 xl:block">{lede}</p>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="flex items-center gap-2 rounded-full border border-pearl/15 px-4 py-2 text-xs text-pearl/70 transition-colors hover:border-pearl/40 hover:text-pearl"
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              {paused ? "Run machines" : "Pause machines"}
            </button>
          </div>
        </div>

        {/* Machine line */}
        <div ref={viewport} className="relative mt-6 min-h-0 flex-1">
          <motion.div className="absolute inset-y-0 left-0 will-change-transform" style={{ x, paddingInline: EDGE }}>
            <MillStrip titles={titles} active={active} paused={paused || !visible} onBayClick={jump} />
          </motion.div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
        </div>

        {/* Stage card + progress */}
        <div className="container-x relative pb-6 pt-4">
          <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="glass-dark flex max-w-3xl items-start gap-5 rounded-2xl border border-pearl/10 p-4 sm:p-5"
              >
                {step && hasValue(step.mediaUrl) && step.mediaType === "image" ? (
                  <span className="relative hidden size-20 shrink-0 overflow-hidden rounded-xl sm:block">
                    <SmartImage src={step.mediaUrl} alt={step.title} fill sizes="80px" className="object-cover" />
                  </span>
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold-2">
                    <Icon name={step?.icon ?? "cog"} className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="eyebrow text-[0.62rem] text-gold-2/80 tabular-nums">
                    {String(active + 1).padStart(2, "0")} / {String(BAYS).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl">{step?.title}</h3>
                  {step?.summary && <p className="mt-1 text-sm text-pearl/75">{step.summary}</p>}
                  {step?.description && (showPlaceholders || hasValue(step.description)) && (
                    <p className="mt-1 hidden text-xs leading-relaxed text-pearl/50 sm:block">{step.description}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative mt-4 h-px bg-pearl/10">
            <motion.div className="absolute inset-0 origin-left bg-gold" style={{ scaleX: bar }} />
          </div>
          <ol className="mt-3 grid grid-cols-10 gap-1">
            {titles.map((t, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "w-full text-left text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-colors",
                    i === active ? "text-gold-2" : i < active ? "text-pearl/45" : "text-pearl/20 hover:text-pearl/50",
                  )}
                >
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-0.5 hidden truncate lg:block">{t}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Home-page teaser: the whole line glides past on its own; hover pauses it, clicking a
 * machine opens the full walkthrough.
 */
export function MillTeaser({ titles, href, cta, eyebrow, title, lede }: { titles: string[]; href: string; cta: string; eyebrow: string; title: string; lede: string }) {
  const router = useRouter();
  const [viewport, visible] = useVisible<HTMLDivElement>();
  const [hover, setHover] = useState(false);
  const [dims, setDims] = useState({ strip: 0, view: 0 });

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => setDims({ strip: (el.clientHeight * STRIP_W) / STRIP_H + EDGE * 2, view: el.clientWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewport]);

  const distance = Math.max(0, dims.strip - dims.view);

  return (
    <section id="mill" className="noise relative overflow-hidden bg-ink py-24 text-pearl lg:py-32">
      <div className="container-x relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <Eyebrow tone="light">{eyebrow}</Eyebrow>
          <h2 className="display mt-5 text-[2.5rem] sm:text-5xl lg:text-[4.25rem]">{title}</h2>
          <p className="mt-6 max-w-xl text-pearl/55">{lede}</p>
        </div>
        <Link href={href} className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-gold px-6 text-sm font-semibold text-ink transition-colors hover:bg-gold-2 lg:self-auto">
          {cta}
        </Link>
      </div>
      <div
        ref={viewport}
        className="relative mt-14 h-[300px] sm:h-[380px] lg:h-[440px]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {distance > 0 && (
          <div
            className="absolute inset-y-0 left-0"
            style={{
              paddingInline: EDGE,
              animationName: "ml-slide",
              animationDuration: `${Math.round(distance / 22)}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationPlayState: hover || !visible ? "paused" : "running",
              ["--dx" as string]: `-${distance}px`,
            }}
          >
            <MillStrip titles={titles} paused={!visible} onBayClick={(i) => router.push(`${href}#bay-${i + 1}`)} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
      </div>
    </section>
  );
}
