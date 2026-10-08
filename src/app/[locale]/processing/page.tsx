import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { MillExperience } from "@/components/mill/mill-experience";
import { TechnologySection } from "@/components/sections/technology";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: PageProps<"/[locale]/processing">) {
  return metaFor(params, "/processing", "Rice Processing — Inside the Mill", "Walk through every stage of rice processing: paddy reception, cleaning, de-stoning, milling, optical sorting, polishing, inspection, grading, packaging and export.");
}

export default async function ProcessingPage({ params }: PageProps<"/[locale]/processing">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.processing, path: "/processing" }]);
  return (
    <>
      <PageHero eyebrow={dict.mill.eyebrow} title={dict.process.title} lede={dict.mill.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-process" tone="husk" image={content.settings.imageProcessing}>
        <ButtonLink href="#mill" variant="gold" size="lg" arrow>
          {dict.mill.cta}
        </ButtonLink>
      </PageHero>
      <MillExperience steps={content.collections.processingSteps} eyebrow={dict.mill.eyebrow} title={dict.mill.title} lede={dict.mill.lede} showPlaceholders={sp} />
      <TechnologySection items={content.collections.technologies} dict={dict} showPlaceholders={sp} />
    </>
  );
}
