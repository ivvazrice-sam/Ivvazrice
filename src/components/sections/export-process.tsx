import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ExportStep } from "@/lib/content/types";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function ExportProcessSection({ steps, dict }: { steps: ExportStep[]; dict: Dictionary }) {
  if (!steps.length) return null;
  return (
    <section id="export-process" className="section-y relative scroll-mt-20 bg-ivory">
      <div className="container-x">
        <SectionHeading eyebrow={dict.exportProcess.eyebrow} title={dict.exportProcess.title} lede={dict.exportProcess.lede} />
        <Stagger as="ol" className="relative mt-16 grid gap-px overflow-hidden rounded-[28px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <StaggerItem as="li" key={s.id} className="group relative bg-ivory p-7 transition-colors duration-700 hover:bg-ink">
              <div className="flex items-center justify-between">
                <span className="relative grid size-14 place-items-center rounded-full border border-husk/30 text-husk transition-colors duration-700 group-hover:border-gold/50 group-hover:text-gold-2">
                  <Icon name={s.icon} className="size-6 transition-transform duration-700 group-hover:scale-110" />
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56" aria-hidden>
                    <circle
                      cx="28"
                      cy="28"
                      r="27"
                      fill="none"
                      stroke="var(--color-gold)"
                      strokeWidth="1"
                      strokeDasharray="170"
                      strokeDashoffset="170"
                      className="transition-[stroke-dashoffset] duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:[stroke-dashoffset:0]"
                    />
                  </svg>
                </span>
                <span className="font-display text-3xl text-ink/10 tabular-nums transition-colors duration-700 group-hover:text-pearl/15">{s.number}</span>
              </div>
              <h3 className="mt-8 font-display text-xl text-ink transition-colors duration-700 group-hover:text-pearl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone transition-colors duration-700 group-hover:text-pearl/60">{s.description}</p>
              {i < steps.length - 1 && (
                <span className="absolute -right-px top-1/2 z-10 hidden size-3 -translate-y-1/2 translate-x-1/2 rotate-45 border-r border-t border-ink/15 bg-ivory lg:block" aria-hidden />
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
