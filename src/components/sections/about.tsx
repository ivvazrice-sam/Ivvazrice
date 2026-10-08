import React from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ContentSnapshot } from "@/lib/content/types";
import { cn, hasValue, showText } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { MediaFrame } from "@/components/ui/media-frame";
import { Parallax } from "@/components/ui/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PlaceholderTag, SectionHeading } from "@/components/ui/section-heading";

/**
 * Visually accents the parts of a paragraph a buyer scans for first — numbers with units,
 * explicit "{N}+ countries / varieties / years / tonnes" phrases, and known trade keywords.
 * Keeps the sentence otherwise untouched; purely decorative emphasis.
 */
function highlightCopy(text: string): React.ReactNode {
  const patterns: Array<{ re: RegExp; className: string }> = [
    // "250+ MT per day", "9,000 MT", "25+ countries", "10+ years", percentages, ratios
    { re: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:\+|\s*)?\s*(?:MT|tonnes?|tons?|kg|mm|%|countries|varieties|years?|days?|mills?)\b/gi, className: "font-semibold text-ink" },
    // bare "25+" style ranges
    { re: /\b\d{1,4}\+/g, className: "font-semibold text-ink" },
    // key quality / trade phrases
    { re: /\b(fine[\s-]dining(?:\s+restaurants?)?|premium\s+retail(?:\s+chains?)?|foodservice|importers?|basmati|non[\s-]GMO|HACCP|ISO\s*\d+(?::\d+)?|FSSAI|APEDA|IEC|single[\s-]origin|traceability|steam\s+basmati|pure[\s-]basmati|aromatic)\b/gi, className: "font-medium text-husk underline decoration-gold/60 decoration-2 underline-offset-4" },
  ];

  // Collect all matches with positions, then merge non-overlapping, highest-priority wins.
  type Hit = { start: number; end: number; className: string };
  const hits: Hit[] = [];
  for (const { re, className } of patterns) {
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue;
      hits.push({ start: m.index, end: m.index + m[0].length, className });
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const merged: Hit[] = [];
  for (const h of hits) {
    if (merged.length && h.start < merged[merged.length - 1].end) continue;
    merged.push(h);
  }

  const out: React.ReactNode[] = [];
  let i = 0;
  for (const h of merged) {
    if (h.start > i) out.push(text.slice(i, h.start));
    out.push(
      <span key={`${h.start}-${h.end}`} className={h.className}>
        {text.slice(h.start, h.end)}
      </span>,
    );
    i = h.end;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

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
          <div className="mt-10 space-y-5 text-[1.05rem] leading-[1.85] text-stone">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={i === 0 ? "border-l-2 border-gold/60 pl-5 text-[1.12rem] text-ink/90" : undefined}>{highlightCopy(p)}</p>
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
