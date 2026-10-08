import { breadcrumbs, loadPage, metaFor } from "@/lib/page";
import { PageHero } from "@/components/sections/page-hero";
import { ContactSection } from "@/components/sections/contact";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  return metaFor(params, "/contact", "Contact", "Contact our rice export team by phone, email or WhatsApp, or send an inquiry.");
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale, content, dict } = await loadPage(params);
  const bc = breadcrumbs(locale, dict.common.breadcrumbHome, [{ name: dict.nav.contact, path: "/contact" }]);
  return (
    <>
      <PageHero eyebrow={dict.contact.eyebrow} title={dict.contact.title} lede={dict.contact.lede} crumbs={bc.crumbs} breadcrumbLd={bc.ld} seed="page-contact" tone="cream" image={content.settings.imageContact}></PageHero>
      <ContactSection content={content} dict={dict} locale={locale} withForm />
    </>
  );
}
