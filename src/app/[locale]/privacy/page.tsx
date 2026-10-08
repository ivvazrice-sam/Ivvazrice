import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";


export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  return metaFor(params, "/privacy", "Privacy Policy");
}

export default async function LegalPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale, content, dict } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.footer.privacy, path: "/privacy" }]);
  return (
    <>
      <PageHero eyebrow={content.company.name} title={"Privacy Policy"} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-privacy" tone="white" />
      <section className="section-y bg-ivory">
        <div className="container-x max-w-3xl space-y-5 text-[1.02rem] leading-[1.8] text-stone">
          {content.settings.privacyPolicy.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </section>
    </>
  );
}
