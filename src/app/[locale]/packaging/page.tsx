import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { PackagingSection } from "@/components/sections/packaging";

export async function generateMetadata({ params }: PageProps<"/[locale]/packaging">) {
  return metaFor(params, "/packaging", "Rice Packaging & Private Label", "Consumer packs, bulk bags, export packaging and private-label options for international buyers.");
}

export default async function PackagingPage({ params }: PageProps<"/[locale]/packaging">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.packaging, path: "/packaging" }]);
  return (
    <>
      <PageHero eyebrow={dict.packaging.eyebrow} title={dict.packaging.title} lede={dict.packaging.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-packaging" tone="golden" image={content.settings.imagePackaging}></PageHero>
      <PackagingSection items={content.collections.packaging} brand={content.company.name} logo={content.company.logoUrl} dict={dict} showPlaceholders={sp} />
    </>
  );
}
