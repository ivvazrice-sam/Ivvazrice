import { localePath } from "@/i18n/config";
import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { AboutSection } from "@/components/sections/about";
import { WhyPartnerSection } from "@/components/sections/why-partner";
import { TrustSection } from "@/components/sections/trust";
import { TestimonialsSection } from "@/components/sections/testimonials";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  return metaFor(params, "/about", "About Us — Rice Mill & Exporter");
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.about, path: "/about" }]);
  return (
    <>
      <PageHero eyebrow={dict.about.eyebrow} title={dict.about.title} lede={content.company.shortDescription} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-about" tone="cream" image={content.settings.imageAbout}></PageHero>
      <AboutSection content={content} dict={dict} detailed />
      <WhyPartnerSection items={content.collections.partnerReasons} dict={dict} showPlaceholders={sp} />
      <TrustSection items={content.collections.trustItems} certifications={content.collections.certifications} factoryMedia={content.collections.factoryMedia} dict={dict} showPlaceholders={sp} contactHref={localePath(locale, "/contact")} />
      <TestimonialsSection items={content.collections.testimonials} />
    </>
  );
}
