import { globalExportProps, loadPage } from "@/lib/page";
import { MillTeaser } from "@/components/mill/mill-experience";
import { AboutSection } from "@/components/sections/about";
import { FaqSection } from "@/components/sections/faq";
import { GlobalExport } from "@/components/sections/global-export";
import { Hero } from "@/components/sections/hero";
import { HomeExplore } from "@/components/sections/home-explore";
import { KitchenReels } from "@/components/sections/kitchen-reels";
import { LiveCounter } from "@/components/sections/live-counter";
import { ProductsSection } from "@/components/sections/products";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { TraceabilitySection } from "@/components/sections/traceability";
import { TrustStrip } from "@/components/sections/trust-strip";

/**
 * Home keeps only what a buyer needs first: who we are, what we sell, how the mill works,
 * where we export, and how to get a quote. Everything else lives on its own page (see nav).
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale, content, dict, href } = await loadPage(params);
  const { company, settings, collections } = content;

  return (
    <>
      <Hero
        content={{
          companyName: company.name,
          headline: company.heroHeadline,
          subheadline: company.heroSubheadline,
          foundedYear: company.foundedYear,
          origin: company.originCountry,
          videoUrl: company.heroVideoUrl,
          posterUrl: company.heroPosterUrl,
        }}
      />
      <TrustStrip certifications={collections.certifications} trustItems={collections.trustItems} dict={{ eyebrow: "Verified · Audited · Trusted" }} />
      <LiveCounter
        items={[
          { label: "Export countries", value: collections.exportCountries.filter((c) => c.published).length, suffix: "+", icon: "globe" },
          { label: "Rice varieties", value: collections.products.filter((p) => p.published).length, icon: "package" },
          { label: "Certifications", value: collections.certifications.filter((c) => c.published).length, icon: "shield" },
          { label: "Years in exports", value: company.foundedYear && /^\d{4}$/.test(company.foundedYear) ? Math.max(1, new Date().getFullYear() - Number(company.foundedYear)) : 10, suffix: "+", icon: "timer" },
        ]}
      />
      <AboutSection content={content} dict={dict} moreHref={href("/about")} />
      <ProductsSection content={content} dict={dict} locale={locale} limit={8} />
      <TraceabilitySection />
      <KitchenReels items={collections.kitchenVideos} showPlaceholders={settings.showPlaceholders} />
      <MillTeaser
        titles={collections.processingSteps.map((s) => s.title)}
        href={href("/processing")}
        cta={dict.mill.cta}
        eyebrow={dict.mill.eyebrow}
        title={dict.mill.title}
        lede={dict.mill.teaserLede}
      />
      <GlobalExport {...globalExportProps(content)} />
      <HomeExplore
        eyebrow={dict.home.exploreEyebrow}
        title={dict.home.exploreTitle}
        cards={[
          { href: href("/quality"), title: dict.nav.quality, desc: dict.navDesc.quality, image: settings.imageQuality, tone: "white" },
          { href: href("/infrastructure"), title: dict.nav.infrastructure, desc: dict.navDesc.infrastructure, image: settings.imageInfrastructure, tone: "cream" },
          { href: href("/packaging"), title: dict.nav.packaging, desc: dict.navDesc.packaging, image: settings.imagePackaging, tone: "golden" },
          { href: href("/export#export-process"), title: dict.nav.exportProcess, desc: dict.navDesc.exportProcess, image: settings.imageContact, tone: "white" },
          { href: href("/videos"), title: dict.nav.videos, desc: dict.navDesc.videos, image: settings.imageVideos, tone: "husk" },
          { href: href("/about"), title: dict.nav.about, desc: dict.navDesc.about, image: settings.imageAbout, tone: "brown" },
        ]}
      />
      <TestimonialsSection items={collections.testimonials} />
      <FaqSection />
    </>
  );
}
