import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getSiteContent } from "@/lib/content/queries";
import { breadcrumbs, loadPage } from "@/lib/page";
import { pageMetadata, productSchema } from "@/lib/seo/metadata";
import { hasValue, showText } from "@/lib/utils";
import { JsonLd } from "@/components/layout/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PlaceholderTag } from "@/components/ui/section-heading";
import { ProductGallery } from "@/components/sections/product-gallery";
import { ProductCard } from "@/components/sections/products";
import { ExpressionStudio } from "@/components/rice/expression-studio";
import { parseRange } from "@/lib/content/rice";

export async function generateStaticParams() {
  const { collections } = await getSiteContent();
  return collections.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  const [content, product] = await Promise.all([getSiteContent(), getProductBySlug(slug)]);
  if (!product) return {};
  return pageMetadata({
    content,
    locale,
    path: `/products/${slug}`,
    title: [product.name, hasValue(product.variety) ? product.variety : ""].filter(Boolean).join(" — "),
    description: product.shortDescription || product.overview.slice(0, 160),
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { slug } = await params;
  const { locale, content, dict, sp, href } = await loadPage(params);
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const t = dict.products;
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [
    { name: dict.nav.products, path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  const keyFacts = [
    { label: t.variety, value: product.variety },
    { label: t.grainLength, value: product.grainLength },
    { label: t.texture, value: product.texture },
    { label: t.appearance, value: product.appearance },
    { label: t.quantities, value: product.availableQuantities },
    { label: t.exportAvailability, value: product.exportAvailability },
  ].filter((f) => hasValue(f.value) || sp);
  const specs = product.specifications.filter((s) => hasValue(s.value) || sp);
  const related = content.collections.products.filter((p) => p.id !== product.id).slice(0, 3);
  // Every variety on one millimetre scale for the grain-length ruler.
  const comparisons = content.collections.products
    .map((p) => ({ name: p.variety && !p.variety.startsWith("[") ? p.variety : p.name, length: parseRange(p.grainLength || p.expressions[0]?.avgLength)?.mid ?? 0, current: p.id === product.id }))
    .filter((c) => c.length > 0)
    .sort((a, b) => a.length - b.length);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-pearl via-ivory to-cream pb-8 pt-20 lg:pt-24">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute -right-40 -top-40 size-96 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-[500px] rounded-full bg-gradient-to-tr from-leaf/15 to-transparent blur-3xl" />
          <div className="absolute left-1/3 top-10 size-64 rounded-full bg-gradient-to-br from-husk/15 to-transparent blur-3xl" />
        </div>
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone/80">
              {bc.crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="size-4 text-stone/40" />}
                  {i < bc.crumbs.length - 1 ? (
                    <Link href={c.href} className="transition-colors hover:text-ink">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-bold text-ink">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <div className="lg:sticky lg:top-28">
                <ProductGallery name={product.name} slug={product.slug} tone={product.grainTone} images={product.images} videos={product.videos} />
              </div>
            </div>

            <div className="lg:col-span-6">
              {showText(product.category, sp) && (
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-gold">{product.category}</span>
                </div>
              )}
              <h1 className="display mt-4 text-4xl text-ink sm:text-5xl lg:text-6xl">{product.name}</h1>
              {showText(product.shortDescription, sp) && <p className="mt-4 text-base leading-relaxed text-stone sm:text-lg">{product.shortDescription}</p>}

              {keyFacts.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {keyFacts.map((f, idx) => (
                    <div
                      key={f.label}
                      className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                        idx % 3 === 0
                          ? "bg-gradient-to-br from-ink to-[#1f3b2a] text-pearl shadow-[0_8px_24px_-8px_rgba(27,49,37,0.3)]"
                          : idx % 3 === 1
                          ? "bg-gradient-to-br from-pearl to-ivory border border-ink/5"
                          : "bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20"
                      }`}
                    >
                      <div className={`absolute right-2 top-2 size-6 rounded-full opacity-20 ${idx % 3 === 0 ? "bg-gold" : idx % 3 === 1 ? "bg-leaf" : "bg-gold"}`} />
                      <dt className={`text-[0.6rem] font-bold uppercase tracking-[0.14em] ${idx % 3 === 0 ? "text-gold-2" : idx % 3 === 1 ? "text-stone/70" : "text-gold"}`}>
                        {f.label}
                      </dt>
                      <dd className={hasValue(f.value) ? `mt-2 font-display text-base leading-tight ${idx % 3 === 0 ? "text-pearl" : "text-ink"}` : "mt-2 text-sm text-ink/30"}>
                        {hasValue(f.value) ? f.value : dict.common.comingSoon}
                      </dd>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={href(`/quote?product=${product.slug}`)} variant="gold" size="lg" arrow className="flex-1 sm:flex-none">
                  {dict.cta.requestQuote}
                </ButtonLink>
                <ButtonLink href={href("/products")} variant="outline" size="lg" className="flex-1 sm:flex-none">
                  {dict.cta.viewAll}
                </ButtonLink>
              </div>

              <div className="mt-8 space-y-5 border-t border-ink/10 pt-6">
                <InfoBlock title={t.overview} empty={!showText(product.overview, sp)} sp={sp} emptyLabel={dict.common.addInAdmin}>
                  <div className="space-y-3 text-sm leading-relaxed text-stone">
                    {product.overview.split(/\n{2,}/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </InfoBlock>
                {specs.length > 0 && (
                  <InfoBlock title={t.specifications} empty={!specs.length} sp={sp} emptyLabel={dict.common.addInAdmin}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {specs.map((s) => (
                        <div key={s.label} className="flex items-center justify-between rounded-lg bg-pearl/60 px-3 py-2">
                          <span className="text-xs font-medium text-stone">{s.label}</span>
                          <span className="font-display text-sm text-ink">{hasValue(s.value) ? s.value : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </InfoBlock>
                )}
                <InfoBlock title={t.quality} empty={!showText(product.qualityInfo, sp)} sp={sp} emptyLabel={dict.common.addInAdmin}>
                  <p className="text-sm leading-relaxed text-stone">{product.qualityInfo}</p>
                </InfoBlock>
                <InfoBlock title={t.packaging} empty={!product.packagingOptions.length} sp={sp} emptyLabel={dict.common.addInAdmin}>
                  <div className="flex flex-wrap gap-2">
                    {product.packagingOptions.map((p) => (
                      <span key={p} className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-medium text-ink">
                        {p}
                      </span>
                    ))}
                  </div>
                </InfoBlock>
                <InfoBlock title={t.applications} empty={!product.applications.length} sp={sp} emptyLabel={dict.common.addInAdmin}>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {product.applications.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-sm text-ink">
                        <span className="size-1 rounded-full bg-gold" /> {a}
                      </li>
                    ))}
                  </ul>
                </InfoBlock>
                <InfoBlock title={t.exportAvailability} empty={!hasValue(product.exportAvailability)} sp={sp} emptyLabel={dict.common.addInAdmin}>
                  <p className="text-sm leading-relaxed text-stone">{product.exportAvailability}</p>
                </InfoBlock>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExpressionStudio
        productName={product.name}
        slug={product.slug}
        expressions={product.expressions}
        productCookedLength={product.cookedLength}
        comparisons={comparisons}
        sampleData={product.sampleData}
      />

      {related.length > 0 && (
        <section className="section-y bg-pearl">
          <div className="container-x">
            <h2 className="display text-4xl text-ink sm:text-5xl">{t.related}</h2>
            <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} dict={dict} locale={locale} showPlaceholders={sp} />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={[productSchema(product, content, locale), bc.ld]} />
    </>
  );
}

function InfoBlock({ title, empty, sp, emptyLabel, children }: { title: string; empty: boolean; sp: boolean; emptyLabel: string; children: React.ReactNode }) {
  if (empty && !sp) return null;
  return (
    <Reveal className="border-t border-ink/10 py-4">
      <h2 className="eyebrow text-xs text-husk">{title}</h2>
      <div className="mt-2">{empty ? <PlaceholderTag className="text-stone">{emptyLabel}</PlaceholderTag> : children}</div>
    </Reveal>
  );
}
