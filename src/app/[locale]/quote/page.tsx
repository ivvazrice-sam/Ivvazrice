import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { InquirySection } from "@/components/sections/inquiry";
import { PageHero } from "@/components/sections/page-hero";

export async function generateMetadata({ params }: PageProps<"/[locale]/quote">) {
  return metaFor(params, "/quote", "Request a Quote", "Request a rice export quotation — tell us the product, quantity, packaging and destination.");
}

export default async function QuotePage({ params, searchParams }: PageProps<"/[locale]/quote">) {
  const { locale, content, dict } = await loadPage(params);
  const { product, variant } = await searchParams;
  const slug = typeof product === "string" ? product : "";
  const defaultProduct = content.collections.products.find((p) => p.slug === slug)?.name ?? "";
  const expression = typeof variant === "string" ? variant.slice(0, 60).replace(/[<>]/g, "") : "";
  const defaultMessage = defaultProduct && expression ? `Specification request: ${defaultProduct} — ${expression}.

` : "";
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.quote, path: "/quote" }]);
  return (
    <>
      <PageHero eyebrow={dict.inquiry.eyebrow} title={dict.inquiry.title} lede={dict.inquiry.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-quote" tone="golden" image={content.settings.imageQuote} />
      <InquirySection content={content} dict={dict} defaultProduct={defaultProduct} defaultMessage={defaultMessage} />
    </>
  );
}
