import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { showText } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PlaceholderTag, SectionHeading } from "@/components/ui/section-heading";
import { CertificationGallery } from "./certification-gallery";

export function QualitySection({ content, dict }: { content: ContentSnapshot; dict: Dictionary }) {
  const { settings, collections } = content;
  const sp = settings.showPlaceholders;
  const certs = collections.certifications;

  return (
    <section id="quality" className="section-y relative overflow-hidden bg-cream">
      <div className="container-x">
        <SectionHeading eyebrow={dict.quality.eyebrow} title={dict.quality.title} lede={showText(settings.qualityIntro, sp) ? settings.qualityIntro : undefined} />

        {/* Journey */}
        <Stagger as="ol" className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-0">
          {dict.quality.journey.map((stepLabel, i, arr) => (
            <StaggerItem as="li" key={stepLabel} className="group relative">
              <div className="flex h-full items-center gap-4 rounded-2xl border border-ink/10 bg-ivory/70 p-4 lg:flex-col lg:items-start lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:px-5 lg:py-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-husk/40 bg-ivory font-display text-sm text-husk transition-colors duration-500 group-hover:bg-ink group-hover:text-gold-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg leading-tight text-ink lg:mt-6">{stepLabel}</span>
                {i < arr.length - 1 && <ArrowRight className="ml-auto size-4 text-husk/50 lg:hidden" />}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-2 hidden lg:block">
          <div className="h-px origin-left bg-gradient-to-r from-husk via-gold to-transparent" />
        </Reveal>

        {/* Checks */}
        <div className="mt-24 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="display text-4xl text-ink">{dict.quality.checksTitle}</h3>
          </div>
          <Stagger className="grid gap-px overflow-hidden rounded-[24px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:col-span-8">
            {collections.qualityChecks.map((c) => (
              <StaggerItem key={c.id} className="group bg-cream p-7 transition-colors duration-500 hover:bg-ivory">
                <Icon name={c.icon} className="size-7 text-husk transition-transform duration-700 group-hover:-translate-y-1" />
                <h4 className="mt-6 font-display text-xl text-ink">{c.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-stone">{c.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Certifications */}
        {(certs.length > 0 || sp) && (
          <div id="certifications" className="mt-24 scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="display text-4xl text-ink">{dict.quality.certificationsTitle}</h3>
              {!certs.length && <PlaceholderTag className="text-stone">{dict.common.addInAdmin}</PlaceholderTag>}
            </div>
            <div className="mt-10">
              {certs.length ? (
                <CertificationGallery
                  items={certs}
                  labels={{
                    validUntil: dict.quality.validUntil,
                    view: dict.quality.viewCertificate,
                    standard: dict.trust.kinds.standard,
                    certification: dict.trust.kinds.certification,
                  }}
                />
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="grid aspect-[3/4] place-items-center rounded-[22px] border border-dashed border-ink/20 p-6 text-center text-sm text-stone">
                      {dict.quality.certificationsEmpty}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
