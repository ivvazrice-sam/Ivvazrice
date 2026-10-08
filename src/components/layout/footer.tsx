import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { hasValue, mailHref, showText, telHref, whatsappHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { SocialIcon } from "@/components/ui/social-icon";
import { Logo } from "./logo";

export function Footer({ content, dict, locale }: { content: ContentSnapshot; dict: Dictionary; locale: string }) {
  const { company, settings, collections } = content;
  const p = (path: string) => localePath(locale, path);
  const sp = settings.showPlaceholders;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: dict.footer.products,
      links: [
        ...collections.products.slice(0, 6).map((prod) => ({ label: prod.name, href: p(`/products/${prod.slug}`) })),
        { label: dict.cta.viewAll, href: p("/products") },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { label: dict.nav.about, href: p("/about") },
        { label: dict.nav.processing, href: p("/processing") },
        { label: dict.nav.infrastructure, href: p("/infrastructure") },
        { label: dict.nav.videos, href: p("/videos") },
      ],
    },
    {
      title: dict.footer.export,
      links: [
        { label: dict.nav.export, href: p("/export") },
        { label: dict.exportProcess.eyebrow, href: p("/export#export-process") },
        { label: dict.nav.quote, href: p("/quote") },
        { label: dict.inquiry.track, href: p("/quote/status") },
      ],
    },
    {
      title: dict.footer.quality,
      links: [
        { label: dict.quality.eyebrow, href: p("/quality") },
        { label: dict.quality.certificationsTitle, href: p("/quality#certifications") },
        { label: dict.packaging.eyebrow, href: p("/packaging") },
        { label: dict.trust.eyebrow, href: p("/quality#trust") },
      ],
    },
  ];

  const contacts = [
    { icon: MapPin, value: company.address, href: company.mapLink || "" },
    { icon: Phone, value: company.phone, href: hasValue(company.phone) ? telHref(company.phone) : "" },
    { icon: Mail, value: company.email, href: hasValue(company.email) ? mailHref(company.email) : "" },
    { icon: MessageCircle, value: company.whatsapp ? `WhatsApp ${company.whatsapp}` : "", href: whatsappHref(company.whatsapp) },
  ].filter((c) => showText(c.value, sp));

  return (
    <footer className="noise relative overflow-hidden bg-ink text-pearl">
      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-pearl/10 py-14 lg:flex-row lg:items-end lg:py-20">
          <h2 className="display max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
            {dict.footer.headline}
            <br />
            <span className="italic text-gold-2">{dict.footer.headlineAccent}</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={p("/quote")} variant="gold" size="lg" arrow>
              {dict.cta.requestQuote}
            </ButtonLink>
            <ButtonLink href={p("/contact")} variant="outline-light" size="lg">
              {dict.nav.contact}
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo name={company.name} logoUrl={company.logoUrl} height={44} />
            {showText(company.shortDescription, sp) && <p className="mt-6 max-w-sm text-sm leading-relaxed text-pearl/55">{company.shortDescription}</p>}
            {contacts.length > 0 && (
              <ul className="mt-8 space-y-3 text-sm text-pearl/70">
                {contacts.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <c.icon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
                    {c.href ? (
                      <a href={c.href} className="transition-colors hover:text-pearl" {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {c.value}
                      </a>
                    ) : (
                      <span className="whitespace-pre-line">{c.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-pearl/40">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-sm text-pearl/70 transition-colors hover:text-gold-2">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-pearl/10 py-8 text-xs text-pearl/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {company.legalName && showText(company.legalName, sp) ? company.legalName : company.name}. {dict.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {collections.socialLinks.length > 0 && (
              <ul className="flex items-center gap-2" aria-label={dict.footer.social}>
                {collections.socialLinks.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="grid size-9 place-items-center rounded-full border border-pearl/10 text-pearl/70 transition-colors hover:border-gold hover:text-gold"
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Link href={p("/privacy")} className="hover:text-pearl">
              {dict.footer.privacy}
            </Link>
            <Link href={p("/terms")} className="hover:text-pearl">
              {dict.footer.terms}
            </Link>
            <Link href="/admin" prefetch={false} className="hover:text-pearl" rel="nofollow">
              {dict.footer.admin}
            </Link>
          </div>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[12vw] font-light leading-[0.8] tracking-[-0.04em] text-pearl/[0.04] -mt-8">
        {company.name.replace(/^\[|\]$/g, "")}
      </p>
    </footer>
  );
}
