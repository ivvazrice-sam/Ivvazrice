import { localePath } from "@/i18n/config";
import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { KitchenReels } from "@/components/sections/kitchen-reels";
import { ProductCatalog } from "@/components/sections/product-catalog";

export async function generateMetadata({ params }: PageProps<"/[locale]/products">) {
  return metaFor(params, "/products", "Rice Products", "Explore our rice portfolio — varieties, specifications, packaging options and export availability.");
}

export default async function ProductsPage({ params }: PageProps<"/[locale]/products">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.products, path: "/products" }]);
  return (
    <>
      <PageHero eyebrow={dict.products.eyebrow} title={dict.products.title} lede={dict.products.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-products" tone="white" image={content.settings.imageProducts}></PageHero>
      <ProductCatalog products={content.collections.products} dict={dict} locale={locale} showPlaceholders={sp} packagingHref={localePath(locale, "/packaging")} />
      <KitchenReels items={content.collections.kitchenVideos} showPlaceholders={sp} />
    </>
  );
}
