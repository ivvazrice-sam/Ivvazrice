import type { Dictionary } from "@/i18n/dictionaries/en";
import type { PartnerReason } from "@/lib/content/types";
import { isPlaceholderText } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function WhyPartnerSection({ items, dict, showPlaceholders }: { items: PartnerReason[]; dict: Dictionary; showPlaceholders: boolean }) {
  // Reasons are capability claims: only show them once the company has written real copy.
  const visible = items.filter((r) => showPlaceholders || !isPlaceholderText(r.description));
  if (!visible.length) return null;

  return (
    <section id="why-us" className="section-y relative overflow-hidden bg-ivory">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} />
          </div>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {visible.map((r, i) => (
            <StaggerItem
              key={r.id}
              className="group relative overflow-hidden rounded-[22px] border border-ink/10 bg-pearl p-7 transition-[border-color,transform,box-shadow] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_30px_60px_-45px_rgba(27,49,37,0.6)]"
            >
              <span className="absolute -right-6 -top-6 size-28 rounded-full bg-gold/0 blur-2xl transition-colors duration-700 group-hover:bg-gold/25" aria-hidden />
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-ink text-gold-2 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[-8deg] group-hover:scale-105">
                  <Icon name={r.icon} className="size-5" />
                </span>
                <span className="text-xs tabular-nums text-ink/25">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl text-ink">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{r.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
