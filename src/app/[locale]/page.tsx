import { globalExportProps, loadPage } from "@/lib/page";
import { faqSchema } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/layout/json-ld";
import { MillTeaser } from "@/components/mill/mill-experience";
import { AboutSection } from "@/components/sections/about";
import { FaqSection } from "@/components/sections/faq";
import { FAQS } from "@/components/sections/faq-data";
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
      {(() => {
        const iconFor = (label: string): "globe" | "package" | "shield" | "timer" => {
          const l = label.toLowerCase();
          if (l.includes("countr") || l.includes("export")) return "globe";
          if (l.includes("cert") || l.includes("iso") || l.includes("audit")) return "shield";
          if (l.includes("capacity") || l.includes("tonn") || l.includes("mt") || l.includes("product") || l.includes("variet")) return "package";
          return "timer";
        };
        const items = company.stats
          .filter((s) => s.value && s.value.trim() !== "")
          .slice(0, 4)
          .map((s) => ({ label: s.label, value: s.value, prefix: s.prefix, suffix: s.suffix, icon: iconFor(s.label) }));
        return items.length ? <LiveCounter items={items} /> : null;
      })()}
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
      <JsonLd data={faqSchema(FAQS)} />
    </>
  );
}
