import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Technology } from "@/lib/content/types";
import { isPlaceholderText } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { MediaFrame } from "@/components/ui/media-frame";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";

export function TechnologySection({ items, dict, showPlaceholders }: { items: Technology[]; dict: Dictionary; showPlaceholders: boolean }) {
  const visible = items.filter((t) => showPlaceholders || !isPlaceholderText(t.description));
  if (!visible.length) return null;

  return (
    <section id="technology" className="section-y relative overflow-hidden bg-ivory">
      <div className="container-x">
        <SectionHeading eyebrow={dict.technology.eyebrow} title={dict.technology.title} lede={dict.technology.lede} />
        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((t, i) => (
            <StaggerItem key={t.id} className="h-full">
              <TiltCard className="group h-full overflow-hidden rounded-[24px] bg-ink text-pearl shadow-[0_30px_60px_-40px_rgba(27,49,37,0.7)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <MediaFrame
                    url={t.mediaUrl}
                    type={t.mediaType}
                    alt={t.title}
                    seed={`tech-${t.id}`}
                    tone={i % 2 ? "white" : "cream"}
                    background="dark"
                    className="absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-100"
                    imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                    sizes="(min-width: 1280px) 25vw, 50vw"
                  />
                  {/* Technical blueprint overlay */}
                  <svg className="absolute inset-0 h-full w-full text-gold-2/40" preserveAspectRatio="none" viewBox="0 0 320 200" aria-hidden>
                    <defs>
                      <pattern id={`grid-${t.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                      </pattern>
                    </defs>
                    <rect width="320" height="200" fill={`url(#grid-${t.id})`} />
                    <path
                      d="M0 150 C80 150 90 60 160 60 S240 150 320 110"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      className="[stroke-dashoffset:200] transition-[stroke-dashoffset] duration-[2s] ease-out group-hover:[stroke-dashoffset:0]"
                    />
                  </svg>
                  <div className="absolute left-5 top-5 grid size-12 place-items-center rounded-full border border-pearl/15 bg-ink/60 text-gold-2 backdrop-blur-md">
                    <Icon name={t.icon} className="size-5" />
                  </div>
                  <span className="absolute right-5 top-5 text-xs tabular-nums text-pearl/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-6 pb-7">
                  <h3 className="font-display text-2xl">{t.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-pearl/55">{t.description}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
