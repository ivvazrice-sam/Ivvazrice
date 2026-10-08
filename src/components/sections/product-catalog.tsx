"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Product } from "@/lib/content/types";
import { CHARACTER_TAGS, MARKET_TAGS } from "@/lib/content/rice";
import { localePath } from "@/i18n/config";
import { cn, hasValue } from "@/lib/utils";
import { ProductCard } from "./products";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Filterable product catalogue: category chips + live search with animated re-layout. */
export function ProductCatalog({
  products,
  dict,
  locale,
  showPlaceholders,
  packagingHref,
}: {
  products: Product[];
  dict: Dictionary;
  locale: string;
  showPlaceholders: boolean;
  packagingHref: string;
}) {
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter((c) => hasValue(c)))), [products]);
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const used = useMemo(() => new Set(products.flatMap((p) => [...p.characterTags, ...p.marketTags])), [products]);
  const groups = [
    { label: dict.range.grainGroup, tags: CHARACTER_TAGS.filter((t) => used.has(t)) },
    { label: dict.range.marketGroup, tags: MARKET_TAGS.filter((t) => used.has(t)) },
  ].filter((g) => g.tags.length);
  const fits = (p: Product) => traits.every((t) => p.characterTags.includes(t) || p.marketTags.includes(t));
  const toggle = (t: string) => setTraits((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const visible = products.filter((p) => {
    if (!fits(p)) return false;
    if (category !== "all" && p.category !== category) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return [p.name, p.variety, p.category, p.shortDescription].some((v) => v.toLowerCase().includes(needle));
  });

  return (
    <section id="catalogue" className="section-y bg-pearl">
      <div className="container-x">
        {groups.length > 0 && (
          <div className="mb-16 rounded-[30px] border border-ink/10 bg-[linear-gradient(135deg,#eef3e6_0%,#f8f1df_100%)] p-6 sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="display text-4xl text-ink sm:text-5xl">{dict.range.explorerTitle}</h2>
                <p className="mt-4 max-w-xs font-display text-lg italic text-stone">{dict.range.explorerLede}</p>
                <div className="mt-6 flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-ink px-3 py-1 font-semibold tabular-nums text-pearl">
                    {products.filter(fits).length} {dict.range.matching}
                  </span>
                  {traits.length > 0 && (
                    <button type="button" onClick={() => setTraits([])} className="font-semibold text-husk underline-offset-4 hover:underline">
                      {dict.range.clear}
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-8 lg:col-span-8">
                {groups.map((g) => (
                  <div key={g.label}>
                    <p className="eyebrow text-[0.66rem] text-husk">{g.label}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.tags.map((t) => {
                        const on = traits.includes(t);
                        const reachable = products.some((p) => fits(p) && (p.characterTags.includes(t) || p.marketTags.includes(t)));
                        return (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(t)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition-all duration-300",
                              on ? "border-ink bg-ink text-pearl shadow-[0_10px_20px_-12px_rgba(27,49,37,0.8)]" : reachable ? "border-ink/15 bg-pearl/80 text-ink hover:-translate-y-0.5 hover:border-ink/40" : "border-ink/10 bg-transparent text-ink/30",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-4 border-t border-ink/10 pt-8 lg:flex-row lg:items-center lg:gap-10">
              <p className="eyebrow shrink-0 text-[0.66rem] text-husk">{dict.range.suited}</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {products.map((p) => {
                  const ok = fits(p);
                  return (
                    <li key={p.id}>
                      <Link
                        href={localePath(locale, `/products/${p.slug}`)}
                        className={cn("relative font-display text-2xl transition-all duration-500 sm:text-3xl", ok ? "text-ink hover:text-husk" : "pointer-events-none text-ink/20")}
                      >
                        {hasValue(p.variety) ? p.variety : p.name}
                        <motion.span className="absolute -bottom-1 left-0 h-0.5 bg-gold" initial={false} animate={{ width: ok && traits.length ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.products.eyebrow}>
            {["all", ...categories].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors", category === c ? "text-pearl" : "text-stone hover:text-ink")}
              >
                {category === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="relative">{c === "all" ? dict.nav.allProducts : c}</span>
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search variety, name…"
              className="h-12 w-full rounded-full border border-ink/15 bg-ivory pl-11 pr-10 text-sm outline-none transition-colors focus:border-husk"
            />
            {q && (
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-ink/5">
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        <motion.ul layout className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }}
              >
                <ProductCard product={p} index={products.indexOf(p)} dict={dict} locale={locale} showPlaceholders={showPlaceholders} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {!visible.length && <p className="mt-12 rounded-3xl border border-dashed border-ink/20 p-12 text-center text-stone">{products.length ? (traits.length ? dict.range.noMatch : "No products match your search.") : dict.products.empty}</p>}

        <Link href={packagingHref} className="group mt-20 flex items-center justify-between gap-6 rounded-[26px] border border-ink/10 bg-ivory p-8 transition-colors hover:border-ink/30 sm:p-10">
          <span>
            <span className="eyebrow block text-husk">{dict.packaging.eyebrow}</span>
            <span className="display mt-3 block text-3xl sm:text-4xl">{dict.packaging.title}</span>
          </span>
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-pearl transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
