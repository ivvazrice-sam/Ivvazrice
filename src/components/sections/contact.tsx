import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { localePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { hasValue, mailHref, showText, telHref, whatsappHref } from "@/lib/utils";
import { ContactForm } from "@/components/forms/contact-form";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PlaceholderTag, SectionHeading } from "@/components/ui/section-heading";

export function ContactSection({ content, dict, locale, withForm = false, as = "h2" }: { content: ContentSnapshot; dict: Dictionary; locale: string; withForm?: boolean; as?: "h1" | "h2" }) {
  const { company, settings } = content;
  const sp = settings.showPlaceholders;
  const details = [
    { icon: MapPin, label: dict.contact.address, value: company.address, href: company.mapLink },
    { icon: Phone, label: dict.contact.phone, value: company.phone, href: hasValue(company.phone) ? telHref(company.phone) : "" },
    { icon: Mail, label: dict.contact.email, value: company.email, href: hasValue(company.email) ? mailHref(company.email) : "" },
    { icon: MessageCircle, label: dict.contact.whatsapp, value: company.whatsapp, href: whatsappHref(company.whatsapp) },
    { icon: Clock, label: dict.contact.hours, value: company.businessHours, href: "" },
  ].filter((d) => showText(d.value, sp));

  const wa = whatsappHref(company.whatsapp);
  const mail = hasValue(company.email) ? mailHref(company.email, "Inquiry") : "";
  const tel = hasValue(company.phone) ? telHref(company.phone) : "";

  return (
    <section id="contact" className="section-y relative bg-ivory">
      <div className="container-x">
        <SectionHeading as={as} eyebrow={dict.contact.eyebrow} title={dict.contact.title} lede={dict.contact.lede} />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-3xl text-ink">{company.legalName && showText(company.legalName, sp) ? company.legalName : company.name}</p>
            <Stagger as="ul" className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {details.map((d) => (
                <StaggerItem as="li" key={d.label} className="flex gap-4 py-5">
                  <d.icon className="mt-0.5 size-5 shrink-0 text-husk" strokeWidth={1.5} />
                  <div>
                    <p className="eyebrow text-[0.6rem] text-stone">{d.label}</p>
                    {d.href ? (
                      <a href={d.href} className="mt-1 block whitespace-pre-line text-ink hover:text-husk" {...(d.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 whitespace-pre-line text-ink">{d.value}</p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal className="mt-8 flex flex-wrap gap-2">
              <ButtonLink href={localePath(locale, "/quote")} variant="gold" size="sm" arrow>
                {dict.cta.sendInquiry}
              </ButtonLink>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
                  <MessageCircle className="size-4" /> {dict.cta.whatsapp}
                </a>
              )}
              {mail && (
                <a href={mail} className={buttonClass("outline", "sm")}>
                  <Mail className="size-4" /> {dict.cta.email}
                </a>
              )}
              {tel && (
                <a href={tel} className={buttonClass("outline", "sm")}>
                  <Phone className="size-4" /> {dict.cta.call}
                </a>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-ink/10 bg-cream sm:aspect-[16/10]">
              {company.mapEmbedUrl ? (
                <iframe
                  src={company.mapEmbedUrl}
                  title={`${company.name} location`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full grayscale-[0.4] contrast-[1.05]"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center p-10 text-center">
                  <div>
                    <MapPin className="mx-auto size-10 text-husk/60" strokeWidth={1} />
                    {sp && (
                      <>
                        <p className="mx-auto mt-4 max-w-xs text-sm text-stone">{dict.contact.mapPlaceholder}</p>
                        <PlaceholderTag className="mt-4 text-stone">{dict.common.addInAdmin}</PlaceholderTag>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {company.mapLink && (
              <a href={company.mapLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
                {dict.cta.directions}
              </a>
            )}
          </Reveal>
        </div>

        {withForm && (
          <div className="mt-24 grid gap-10 border-t border-ink/10 pt-16 lg:grid-cols-12">
            <h3 className="display text-4xl text-ink lg:col-span-5">{dict.contact.formTitle}</h3>
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
