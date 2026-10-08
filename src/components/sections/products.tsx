import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot, Product } from "@/lib/content/types";
import { cn, hasValue, showText } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { MediaFrame } from "@/components/ui/media-frame";
import { HEAP_FOR_GRAIN_TONE } from "@/lib/content/rice";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

function FloatingGrains() {
  const grains = [
    { l: "18%", t: "30%", r: -30, d: "0ms" },
    { l: "72%", t: "22%", r: 25, d: "80ms" },
    { l: "60%", t: "44%", r: -60, d: "160ms" },
    { l: "30%", t: "52%", r: 40, d: "120ms" },
    { l: "84%", t: "58%", r: -10, d: "200ms" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {grains.map((g, i) => (
        <svg
          key={i}
          viewBox="-32 -12 64 24"
          className="absolute w-7 translate-y-4 opacity-0 transition-[opacity,transform] duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-3 group-hover:opacity-90"
          style={{ left: g.l, top: g.t, rotate: `${g.r}deg`, transitionDelay: g.d }}
        >
          <path d="M-30 0C-30-7.6-19-9.6-1-9.6 17-9.6 28.5-6.2 30-1.2 30.6 1 29 3.6 26 5.4 21 8.4 12 9.6 0 9.6-18 9.6-30 7.6-30 0Z" fill="#fbf8f0" />
        </svg>
      ))}
    </div>
  );
}

export function ProductCard({ product, index, dict, locale, showPlaceholders }: { product: Product; index: number; dict: Dictionary; locale: string; showPlaceholders: boolean }) {
  const href = localePath(locale, `/products/${product.slug}`);
  const specs = [
    { label: dict.products.grainLength, value: product.grainLength },
    { label: dict.products.texture, value: product.texture },
    { label: dict.products.appearance, value: product.appearance },
    { label: dict.products.exportAvailability, value: product.exportAvailability },
  ].filter((s) => hasValue(s.value) || showPlaceholders);

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-[26px] bg-cream border border-ink/8 shadow-[0_20px_40px_-20px_rgba(27,49,37,0.4),0_0_1px_rgba(27,49,37,0.1)] transition-[transform,box-shadow,border-color] duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-3 group-hover:shadow-[0_40px_80px_-20px_rgba(27,49,37,0.5),0_0_1px_rgba(27,49,37,0.15)] group-hover:border-ink/15"
      >
        <MediaFrame
          url={product.images[0]?.url}
          alt={product.images[0]?.alt || product.name}
          seed={product.slug}
          tone={product.grainTone}
          variant="heap"
          background="light"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="absolute inset-0"
          badgeClassName="left-5 right-auto top-auto bottom-[8.5rem]"
          renderFallback={HEAP_FOR_GRAIN_TONE[product.grainTone]}
          imgClassName="transition-transform duration-[1.8s] ease-[var(--ease-out-expo)] group-hover:scale-[1.12]"
        />
        <FloatingGrains />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          {showText(product.category, showPlaceholders) && (
            <span className="glass-light max-w-[80%] truncate rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/80">{product.category}</span>
          )}
          <span className="ml-auto font-display text-sm text-ink/40 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/55 to-transparent p-6 pt-24 text-pearl">
          <h3 className="display text-[1.9rem] leading-tight">{product.name}</h3>
          {showText(product.variety, showPlaceholders) && <p className="mt-1 text-sm text-pearl/60">{product.variety}</p>}
          {product.expressions.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5" aria-label={product.expressions.map((x) => x.name).join(", ")}>
              {product.expressions.map((x) => (
                <span key={x.name} title={x.name} className="size-3.5 rounded-full ring-1 ring-white/40" style={{ background: x.tone }} />
              ))}
              <span className="ml-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-pearl/60">
                {product.expressions.length} {dict.range.expressions}
              </span>
            </p>
          )}
          {specs.length > 0 && (
            <dl className="grid max-h-0 grid-cols-2 gap-x-4 gap-y-3 overflow-hidden opacity-0 transition-[max-height,opacity,margin] duration-700 ease-[var(--ease-out-expo)] group-hover:mt-5 group-hover:max-h-48 group-hover:opacity-100 group-focus-within:mt-5 group-focus-within:max-h-48 group-focus-within:opacity-100 [@media(hover:none)]:mt-5 [@media(hover:none)]:max-h-48 [@media(hover:none)]:opacity-100">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-pearl/45">{s.label}</dt>
                  <dd className={cn("mt-0.5 text-sm", hasValue(s.value) ? "text-pearl" : "text-pearl/35")}>{hasValue(s.value) ? s.value : dict.common.comingSoon}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <ButtonLink href={href} variant="primary" size="sm" className="flex-1 shadow-[0_10px_20px_-10px_rgba(196,154,76,0.3)] transition-shadow hover:shadow-[0_15px_30px_-10px_rgba(196,154,76,0.4)]">
          {dict.cta.viewProduct}
        </ButtonLink>
        <ButtonLink href={localePath(locale, `/quote?product=${product.slug}`)} variant="outline" size="sm" className="flex-1 transition-all hover:bg-ink/5">
          {dict.cta.requestQuote}
        </ButtonLink>
      </div>
    </article>
  );
}

export function ProductsSection({
  content,
  dict,
  locale,
  limit,
  heading = true,
}: {
  content: ContentSnapshot;
  dict: Dictionary;
  locale: string;
  limit?: number;
  heading?: boolean;
}) {
  const sp = content.settings.showPlaceholders;
  const all = content.collections.products;
  const featured = all.filter((p) => p.featured);
  const products = limit ? (featured.length ? featured : all).slice(0, limit) : all;

  return (
    <section id="products" className="section-y relative bg-pearl">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/2 pointer-events-none" />
      <div className="container-x relative z-10">
        {heading && (
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={dict.products.eyebrow} title={dict.products.title} lede={dict.products.lede} />
            {limit && all.length > 0 && (
              <Link href={localePath(locale, "/products")} className="group inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-ink">{dict.cta.viewAll}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        )}
        {products.length ? (
          <Stagger className={cn("grid gap-x-6 gap-y-16 sm:grid-cols-2 xl:grid-cols-4", heading && "mt-20")}>
            {products.map((p, i) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} index={i} dict={dict} locale={locale} showPlaceholders={sp} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="mt-16 rounded-3xl border border-dashed border-ink/20 p-12 text-center text-stone">{dict.products.empty}</p>
        )}
      </div>
    </section>
  );
}
