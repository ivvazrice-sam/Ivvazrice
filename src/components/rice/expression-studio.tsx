"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { parseRange } from "@/lib/content/rice";
import type { RiceExpression } from "@/lib/content/types";
import { cn, hasValue } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { RiceHeap } from "./rice-heap";
import { Eyebrow } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import { GrainRuler, type RulerComparison } from "./grain-ruler";

const EASE = [0.16, 1, 0.3, 1] as const;

type MetricKey = "avgLength" | "cookedLength" | "whiteness" | "moisture" | "broken";
const METRICS: { key: MetricKey; max: number; gradient?: string }[] = [
  { key: "avgLength", max: 10 },
  { key: "cookedLength", max: 25 },
  { key: "whiteness", max: 60, gradient: "linear-gradient(90deg,#b98432,#e7cf98,#fffaf0)" },
  { key: "moisture", max: 15 },
  { key: "broken", max: 10 },
];

/** Interactive processing-expression explorer for a product (Raw / Steam / Sella …). */
export function ExpressionStudio({
  productName,
  slug,
  expressions,
  productCookedLength,
  comparisons,
  sampleData,
}: {
  productName: string;
  slug: string;
  expressions: RiceExpression[];
  productCookedLength: string;
  comparisons: RulerComparison[];
  sampleData: boolean;
}) {
  const { dict, href } = useI18n();
  const t = dict.range;
  const [active, setActive] = useState(0);
  const [showCooked, setShowCooked] = useState(true);
  if (!expressions.length) return null;
  const e = expressions[Math.min(active, expressions.length - 1)];
  const value = (x: RiceExpression, k: MetricKey) => (k === "cookedLength" ? x.cookedLength || productCookedLength : x[k]);
  const raw = parseRange(e.avgLength);
  const cooked = parseRange(value(e, "cookedLength"));
  const quoteHref = href(`/quote?product=${slug}&variant=${encodeURIComponent(e.name)}`);

  return (
    <section id="expressions" className="relative scroll-mt-20 overflow-hidden bg-[linear-gradient(180deg,#f9f4e7_0%,#eef3e6_100%)] py-16 sm:py-20">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <Eyebrow>{t.expressionsEyebrow}</Eyebrow>
            <h2 className="display mt-3 text-3xl text-ink sm:text-4xl lg:text-5xl">{t.expressionsTitle}</h2>
            <p className="mt-3 text-sm text-stone sm:text-base">{t.expressionsLede}</p>
          </div>
          {sampleData && (
            <p className="flex max-w-xs items-start gap-2 rounded-xl border border-dashed border-husk/40 bg-pearl/70 p-3 text-xs leading-relaxed text-stone">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-husk" /> {t.sample}
            </p>
          )}
        </div>

        {/* Expression tabs */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={t.expressionsEyebrow}>
          {expressions.map((x, i) => (
            <button
              key={x.name + i}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                i === active ? "border-ink text-pearl" : "border-ink/15 bg-pearl/70 text-ink hover:border-ink/40",
              )}
            >
              {i === active && <motion.span layoutId="expr-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
              <span className="relative size-3.5 rounded-full ring-1 ring-black/15" style={{ background: x.tone }} />
              <span className="relative">{x.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Visual */}
          <div className="lg:col-span-5">
            <div className="relative aspect-square max-h-[320px] mx-auto overflow-hidden rounded-[16px] bg-[radial-gradient(circle_at_50%_30%,#f3ede0_0%,#ddd2ba_62%,#cbbf9f_100%)] shadow-[0_20px_50px_-30px_rgba(27,49,37,0.4)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={e.name}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  {e.imageUrl ? (
                    <SmartImage src={e.imageUrl} alt={`${productName} — ${e.name}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                  ) : (
                    <RiceHeap color={e.tone} className="absolute inset-[6%_4%_4%]" />
                  )}
                </motion.div>
              </AnimatePresence>
              <span className="glass-light absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-ink">
                <span className="size-3 rounded-full ring-1 ring-black/15" style={{ background: e.tone }} />
                {e.toneLabel || e.name}
              </span>
            </div>
          </div>

          {/* Specification */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div key={e.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: EASE }}>
                <div className="flex items-center gap-3">
                  <h3 className="display text-2xl text-ink sm:text-3xl">{e.name}</h3>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-0.5">
                    <span className="size-1.5 rounded-full ring-1 ring-gold/40" style={{ background: e.tone }} />
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-gold">{e.toneLabel || e.name}</span>
                  </div>
                </div>
                {e.description && <p className="mt-2 max-w-xl text-xs leading-relaxed text-stone sm:text-sm">{e.description}</p>}
              </motion.div>
            </AnimatePresence>

            <dl className="mt-4 divide-y divide-ink/5 rounded-lg border border-ink/5 bg-pearl/40 overflow-hidden">
              {METRICS.map((m) => {
                const v = value(e, m.key);
                if (!hasValue(v)) return null;
                const r = parseRange(v);
                const pct = r ? Math.min(100, (r.mid / m.max) * 100) : 0;
                return (
                  <div key={m.key} className="flex items-center gap-3 px-3 py-2">
                    <dt className="w-28 shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-stone/70">{t[m.key]}</dt>
                    <div className="flex-1 relative h-0.5 overflow-hidden rounded-full bg-ink/[0.08]">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: m.gradient ?? "linear-gradient(90deg,var(--color-leaf),var(--color-gold))" }}
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: EASE }}
                      />
                    </div>
                    <dd className="w-20 text-right font-display text-xs font-semibold tabular-nums text-ink sm:text-sm">{v}</dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <ButtonLink href={quoteHref} variant="gold" size="sm" arrow className="flex-1 sm:flex-none">
                {t.requestSpec}
              </ButtonLink>
              <a href="#compare" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-ink/20 px-5 text-xs font-semibold text-ink transition-all hover:border-ink hover:bg-ink/5 sm:flex-none">
                {t.compare} <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Ruler */}
        {raw && (
          <div className="mt-12 overflow-hidden rounded-[24px] border border-ink/10 bg-gradient-to-br from-pearl via-pearl to-ivory p-6 shadow-[0_30px_60px_-40px_rgba(27,49,37,0.25)] sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-xl text-ink sm:text-2xl">{t.rulerTitle}</h3>
                <p className="mt-1 text-xs text-stone">To-scale grain length visualization</p>
              </div>
              {cooked && (
                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
                  <span className={cn("relative h-6 w-11 rounded-full transition-colors", showCooked ? "bg-leaf" : "bg-ink/15")}>
                    <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", showCooked ? "left-[22px]" : "left-0.5")} />
                  </span>
                  <input type="checkbox" className="sr-only" checked={showCooked} onChange={(ev) => setShowCooked(ev.target.checked)} />
                  {t.showCooked}
                </label>
              )}
            </div>
            <div className="mt-6">
              <GrainRuler raw={raw} cooked={cooked} tone={e.tone} comparisons={comparisons} showCooked={showCooked} labels={{ raw: t.raw, cooked: t.cooked, elongation: t.elongation, mm: t.mm, compare: t.rulerCompare }} />
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div id="compare" className="mt-12 scroll-mt-28">
          <div className="mb-6">
            <h3 className="font-display text-2xl text-ink sm:text-3xl">{t.compare}</h3>
            <p className="mt-1 text-sm text-stone">Compare specifications across all expressions</p>
          </div>
          <div className="overflow-x-auto rounded-[20px] border border-ink/10 bg-pearl shadow-[0_15px_30px_-20px_rgba(27,49,37,0.15)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-[0.68rem] uppercase tracking-[0.14em] text-stone">
                  <th className="px-5 py-4 font-semibold">{t.expression}</th>
                  <th className="px-5 py-4 font-semibold">{t.tone}</th>
                  {METRICS.map((m) => (
                    <th key={m.key} className="px-5 py-4 font-semibold">
                      {t[m.key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expressions.map((x, i) => (
                  <tr
                    key={x.name + i}
                    onClick={() => setActive(i)}
                    className={cn("cursor-pointer border-b border-ink/5 transition-colors last:border-0", i === active ? "bg-sage" : "hover:bg-ivory")}
                  >
                    <td className="px-5 py-4 font-display text-lg text-ink">{x.name}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-stone">
                        <span className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: x.tone }} />
                        {x.toneLabel}
                      </span>
                    </td>
                    {METRICS.map((m) => (
                      <td key={m.key} className="px-5 py-4 tabular-nums text-ink">
                        {value(x, m.key) || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
