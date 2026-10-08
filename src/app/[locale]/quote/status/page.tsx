import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { StatusLookup } from "@/components/forms/status-lookup";
import { PageHero } from "@/components/sections/page-hero";

export async function generateMetadata({ params }: PageProps<"/[locale]/quote/status">) {
  return { ...(await metaFor(params, "/quote/status", "Track Your Inquiry")), robots: { index: false, follow: true } };
}

export default async function StatusPage({ params }: PageProps<"/[locale]/quote/status">) {
  const { locale, dict } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [
    { name: dict.nav.quote, path: "/quote" },
    { name: dict.status.title, path: "/quote/status" },
  ]);
  return (
    <>
      <PageHero eyebrow={dict.inquiry.eyebrow} title={dict.status.title} lede={dict.status.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-status" tone="white" />
      <section className="section-y bg-ivory">
        <div className="container-x max-w-4xl">
          <StatusLookup />
        </div>
      </section>
    </>
  );
}
