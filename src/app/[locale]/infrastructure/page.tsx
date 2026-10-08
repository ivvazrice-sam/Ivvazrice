import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { InfrastructureGallery } from "@/components/sections/infrastructure-gallery";
import { TechnologySection } from "@/components/sections/technology";

export async function generateMetadata({ params }: PageProps<"/[locale]/infrastructure">) {
  return metaFor(params, "/infrastructure", "Factory & Infrastructure", "Our rice mill, processing plant, storage, quality laboratory, packaging and container loading facilities.");
}

export default async function InfrastructurePage({ params }: PageProps<"/[locale]/infrastructure">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.infrastructure, path: "/infrastructure" }]);
  return (
    <>
      <PageHero eyebrow={dict.infrastructure.eyebrow} title={dict.infrastructure.title} lede={dict.infrastructure.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-infra" tone="white" image={content.settings.imageInfrastructure}></PageHero>
      <InfrastructureGallery items={content.collections.factoryMedia} showPlaceholders={sp} />
      <TechnologySection items={content.collections.technologies} dict={dict} showPlaceholders={sp} />
    </>
  );
}
