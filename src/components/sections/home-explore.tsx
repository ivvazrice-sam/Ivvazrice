import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GrainTone } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/ui/media-frame";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export interface ExploreCard {
  href: string;
  title: string;
  desc: string;
  image: string;
  tone: GrainTone;
}

const SPANS = ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"];

/** Photo-led gateway to the inner pages — keeps the home page short while everything stays one click away. */
export function HomeExplore({ eyebrow, title, cards }: { eyebrow: string; title: string; cards: ExploreCard[] }) {
  return (
    <section className="section-y bg-ivory">
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Stagger className="mt-14 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-12">
          {cards.map((c, i) => (
            <StaggerItem key={c.href} className={cn("h-full", SPANS[i % SPANS.length])}>
              <Link href={c.href} className="group relative block h-full overflow-hidden rounded-[26px] bg-ink text-pearl">
                <MediaFrame
                  url={c.image}
                  alt={c.title}
                  seed={`explore-${i}`}
                  tone={c.tone}
                  background="dark"
                  sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/5 transition-opacity duration-700 group-hover:opacity-90" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 lg:p-7">
                  <span>
                    <span className="block font-display text-2xl lg:text-3xl">{c.title}</span>
                    <span className="mt-1 block max-w-sm text-sm text-pearl/65 transition-[max-height,opacity] duration-700">{c.desc}</span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-pearl/25 bg-ink/30 backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
