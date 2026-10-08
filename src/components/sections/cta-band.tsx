import { MessageCircle } from "lucide-react";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Reveal, RevealText } from "@/components/ui/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { GrainArt } from "@/components/ui/grain-art";

/** Closing call-to-action used at the bottom of every page. */
export function CtaBand({
  title,
  body,
  quoteHref,
  quoteLabel,
  contactHref,
  contactLabel,
  whatsappHref,
  whatsappLabel,
  image,
}: {
  title: string;
  body: string;
  quoteHref: string;
  quoteLabel: string;
  contactHref: string;
  contactLabel: string;
  whatsappHref?: string;
  whatsappLabel: string;
  image?: string;
}) {
  return (
    <section className="bg-ivory px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="noise relative overflow-hidden rounded-[32px] bg-ink text-pearl">
        {image ? (
          <div className="absolute inset-0 kenburns">
            <SmartImage src={image} alt="" fill sizes="100vw" className="object-cover opacity-45" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-30">
            <GrainArt seed="cta" tone="golden" background="none" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(27,49,37,0.95)_25%,rgba(27,49,37,0.55))]" />
        <div className="container-x relative flex flex-col gap-10 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-28">
          <div className="max-w-2xl">
            <RevealText text={title} className="display text-4xl sm:text-5xl lg:text-6xl" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-pearl/65">{body}</p>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="flex flex-wrap gap-3">
            <ButtonLink href={quoteHref} variant="gold" size="lg" arrow>
              {quoteLabel}
            </ButtonLink>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass("outline-light", "lg")}>
                <MessageCircle className="size-4" /> {whatsappLabel}
              </a>
            )}
            <ButtonLink href={contactHref} variant="outline-light" size="lg">
              {contactLabel}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
