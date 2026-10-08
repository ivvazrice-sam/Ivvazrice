import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Packaging } from "@/lib/content/types";
import { hasValue, showText } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import { TiltCard } from "@/components/ui/tilt-card";
import { PackMockup } from "./pack-mockup";

export function PackagingSection({ items, brand, logo, dict, showPlaceholders }: { items: Packaging[]; brand: string; logo?: string; dict: Dictionary; showPlaceholders: boolean }) {
  if (!items.length) return null;
  return (
    <section id="packaging" className="section-y relative scroll-mt-20 overflow-hidden bg-cream">
      <div className="container-x">
        <SectionHeading eyebrow={dict.packaging.eyebrow} title={dict.packaging.title} lede={dict.packaging.lede} />
        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((p) => {
            const rows = [
              { label: dict.packaging.sizes, value: p.sizes },
              { label: dict.packaging.material, value: p.material },
              { label: dict.packaging.privateLabel, value: p.privateLabel },
              { label: dict.packaging.moq, value: p.moq },
            ].filter((r) => hasValue(r.value) || showPlaceholders);
            return (
              <StaggerItem key={p.id} className="h-full">
                <TiltCard className="group flex h-full flex-col overflow-hidden rounded-[26px] bg-ivory shadow-[0_30px_60px_-45px_rgba(27,49,37,0.6)]">
                  <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#fbf9f4,#e6dcc6)]">
                    {p.imageUrl ? (
                      <SmartImage src={p.imageUrl} alt={p.name} fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-contain p-8 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-8 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] [transform:translateZ(40px)] group-hover:-translate-y-2 group-hover:scale-[1.03]">
                        <PackMockup type={p.packType} brand={brand} id={p.id} logo={logo} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                    {showText(p.description, showPlaceholders) && <p className="mt-2 text-sm leading-relaxed text-stone">{p.description}</p>}
                    {rows.length > 0 && (
                      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink/10 pt-5 text-sm">
                        {rows.map((r) => (
                          <div key={r.label}>
                            <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-stone/70">{r.label}</dt>
                            <dd className={hasValue(r.value) ? "mt-0.5 text-ink" : "mt-0.5 text-ink/30"}>{hasValue(r.value) ? r.value : dict.common.comingSoon}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
