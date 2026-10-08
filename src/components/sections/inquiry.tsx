import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { countryNames } from "@/lib/countries";
import { hasValue, mailHref, telHref, whatsappHref } from "@/lib/utils";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { GrainArt } from "@/components/ui/grain-art";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function InquirySection({ content, dict, defaultProduct, defaultMessage, as = "h2" }: { content: ContentSnapshot; dict: Dictionary; defaultProduct?: string; defaultMessage?: string; as?: "h1" | "h2" }) {
  const { company, collections } = content;
  const products = collections.products.map((p) => p.name);
  const packaging = collections.packaging.map((p) => p.name);
  const direct = [
    { icon: Mail, label: dict.cta.email, value: company.email, href: hasValue(company.email) ? mailHref(company.email, "Quote request") : "" },
    { icon: Phone, label: dict.cta.call, value: company.phone, href: hasValue(company.phone) ? telHref(company.phone) : "" },
    { icon: MessageCircle, label: dict.cta.whatsapp, value: company.whatsapp, href: whatsappHref(company.whatsapp) },
  ].filter((d) => d.href);

  return (
    <section id="inquiry" className="relative overflow-hidden bg-[linear-gradient(160deg,#eef3e6_0%,#f8f1df_100%)] py-24 text-ink lg:py-36">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 opacity-[0.25] lg:block" aria-hidden>
        <GrainArt seed="inquiry" tone="golden" background="none" />
      </div>
      <div className="container-x relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading as={as} eyebrow={dict.inquiry.eyebrow} title={dict.inquiry.title} lede={dict.inquiry.lede} />
          {direct.length > 0 && (
            <Reveal delay={0.2} className="mt-12 space-y-3">
              {direct.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  {...(d.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-ink/10 bg-pearl/70 px-5 py-4 transition-colors hover:border-gold"
                >
                  <d.icon className="size-5 text-husk" strokeWidth={1.5} />
                  <span>
                    <span className="eyebrow block text-[0.6rem] text-stone">{d.label}</span>
                    <span className="block text-sm">{d.value}</span>
                  </span>
                </a>
              ))}
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="rounded-[28px] border border-ink/10 bg-pearl p-6 shadow-[0_40px_80px_-50px_rgba(27,49,37,0.5)] sm:p-10">
            <InquiryForm products={products} packaging={packaging} countries={countryNames("en")} defaultProduct={defaultProduct} defaultMessage={defaultMessage} tone="light" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
