import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { KitchenReels } from "@/components/sections/kitchen-reels";
import { VideoSection } from "@/components/sections/video-section";

export async function generateMetadata({ params }: PageProps<"/[locale]/videos">) {
  return metaFor(params, "/videos", "Videos", "Company introduction, rice processing, factory walkthrough, quality inspection, packaging and container loading videos.");
}

export default async function VideosPage({ params }: PageProps<"/[locale]/videos">) {
  const { locale, content, dict, sp } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.videos, path: "/videos" }]);
  return (
    <>
      <PageHero eyebrow={dict.videos.eyebrow} title={dict.videos.title} lede={dict.videos.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-videos" tone="white" image={content.settings.imageVideos}></PageHero>
      <VideoSection videos={content.collections.videos} showPlaceholders={sp} />
      <KitchenReels items={content.collections.kitchenVideos} showPlaceholders={sp} />
    </>
  );
}
