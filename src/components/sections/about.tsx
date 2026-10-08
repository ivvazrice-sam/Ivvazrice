import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { cn, hasValue, showText } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { MediaFrame } from "@/components/ui/media-frame";
import { Parallax } from "@/components/ui/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PlaceholderTag, SectionHeading } from "@/components/ui/section-heading";

export function AboutSection({ content, dict, detailed = false, moreHref }: { content: ContentSnapshot; dict: Dictionary; detailed?: boolean; /** Home-page teaser: first paragraph + stats + a link instead of the full story. */ moreHref?: string }) {
  const { company, settings } = content;
  const sp = settings.showPlaceholders;
  const paragraphs = company.story.split(/\n{2,}/).filter((p) => showText(p, sp));
  const highlights = company.highlights.filter((h) => showText(h.text, sp));
  const stats = company.stats.filter((s) => hasValue(s.value) || sp);

  return (
    <section id="about" className="section-y relative overflow-hidden bg-ivory">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <Parallax className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(27,49,37,0.55)] sm:aspect-[5/5] lg:aspect-[4/5]">
                <MediaFrame
                  url={company.aboutMediaUrl}
                  type={company.aboutMediaType}
                  alt={`${company.name} — rice mill and processing facility`}
                  seed="about"
                  tone="white"
                  variant="field"
                  background="dark"
                  label="Factory image / video"
                  showLabel={sp}
                  className="absolute inset-0"
                  kenburns
                />
              </Parallax>
            </Reveal>
            {showText(company.foundedYear, sp) && (
              <Reveal delay={0.2} className="mt-6 flex items-center justify-between text-sm text-stone">
                <span className="eyebrow">Established</span>
                <span className="font-display text-2xl text-ink">{company.foundedYear || "[Year]"}</span>
              </Reveal>
            )}
          </div>
        </div>

        <div className="lg:col-span-6">
          <SectionHeading eyebrow={dict.about.eyebrow} title={dict.about.title} />
          <div className="mt-10 space-y-5 text-[1.05rem] leading-[1.8] text-stone">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          {stats.length > 0 && (
            <div className="mt-14">
              <p className="eyebrow text-husk">{dict.about.statsTitle}</p>
              <Stagger className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10">
                {stats.map((s) => (
                  <StaggerItem key={s.label} className="bg-ivory p-6 sm:p-8">
                    {hasValue(s.value) ? (
                      <p className="display text-4xl text-ink sm:text-5xl">
                        {s.prefix}
                        <Counter value={s.value} />
                        <span className="text-gold">{s.suffix}</span>
                      </p>
                    ) : (
                      <p className="display text-4xl text-ink/15 sm:text-5xl">— —</p>
                    )}
                    <p className="mt-3 text-sm text-stone">{s.label}</p>
                    {!hasValue(s.value) && <PlaceholderTag className="mt-3 text-stone">{dict.common.addInAdmin}</PlaceholderTag>}
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}

          {moreHref && (
            <Reveal className="mt-10">
              <ButtonLink href={moreHref} variant="primary" arrow>
                {dict.home.aboutMore}
              </ButtonLink>
            </Reveal>
          )}

          {!moreHref && highlights.length > 0 && (
            <Stagger as="ul" className={cn("mt-14 divide-y divide-ink/10 border-y border-ink/10", !detailed && "lg:max-h-none")}>
              {highlights.slice(0, detailed ? undefined : 7).map((h, i) => (
                <StaggerItem as="li" key={h.title} className="group grid grid-cols-[3rem_1fr] gap-4 py-6">
                  <span className="pt-1 text-xs tabular-nums text-husk">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-xl text-ink transition-colors group-hover:text-husk">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone">{h.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}
