import { localePath } from "@/i18n/config";
import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { QualitySection } from "@/components/sections/quality";
import { TrustSection } from "@/components/sections/trust";

export async function generateMetadata({ params }: PageProps<"/[locale]/quality">) {
  return metaFor(params, "/quality", "Quality Control & Certifications", "How every batch of rice is inspected, tested, graded and verified before dispatch.");
}

export default async function QualityPage({ params }: PageProps<"/[locale]/quality">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.quality, path: "/quality" }]);
  return (
    <>
      <PageHero eyebrow={dict.quality.eyebrow} title={dict.quality.title} lede={content.settings.qualityIntro} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-quality" tone="white" image={content.settings.imageQuality}></PageHero>
      <QualitySection content={content} dict={dict} />
      <TrustSection items={content.collections.trustItems} certifications={content.collections.certifications} factoryMedia={content.collections.factoryMedia} dict={dict} showPlaceholders={sp} contactHref={localePath(locale, "/contact")} />
    </>
  );
}
