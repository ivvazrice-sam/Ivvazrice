import { breadcrumbs, loadPage, metaFor, globalExportProps } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { GlobalExport } from "@/components/sections/global-export";
import { ExportProcessSection } from "@/components/sections/export-process";

export async function generateMetadata({ params }: PageProps<"/[locale]/export">) {
  return metaFor(params, "/export", "Global Rice Export", "Rice export from India to international markets — export destinations, shipping capability and a transparent export process.");
}

export default async function ExportPage({ params }: PageProps<"/[locale]/export">) {
  const { locale, content, dict } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.export, path: "/export" }]);
  return (
    <>
      <PageHero eyebrow={dict.export.eyebrow} title={content.settings.exportHeadline} lede={dict.exportProcess.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-export" tone="cream" image={content.settings.imageExport}></PageHero>
      <GlobalExport {...globalExportProps(content)} />
      <ExportProcessSection steps={content.collections.exportSteps} dict={dict} />
    </>
  );
}
