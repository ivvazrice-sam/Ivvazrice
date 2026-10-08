import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GrainTone } from "@/lib/content/types";
import { GrainArt } from "@/components/ui/grain-art";
import { SampleBadge } from "@/components/ui/media-frame";
import { Reveal, RevealText } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/layout/json-ld";

/** Cinematic header for inner pages: slow-drifting photo (or generative art), breadcrumbs + BreadcrumbList JSON-LD. */
export function PageHero({
  eyebrow,
  title,
  lede,
  crumbs,
  tone = "white",
  seed,
  breadcrumbLd,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  crumbs: { name: string; href: string }[];
  tone?: GrainTone;
  seed: string;
  breadcrumbLd: object;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="noise relative flex min-h-[78svh] items-end overflow-hidden bg-ink pb-16 pt-40 text-pearl lg:min-h-[86svh] lg:pb-24">
      {image ? (
        <div className="absolute inset-0 kenburns">
          <SmartImage src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-40">
          <GrainArt seed={seed} tone={tone} background="none" density={0.8} />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,49,37,0.88)_12%,rgba(36,65,47,0.5)_55%,rgba(36,65,47,0.15))]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      {image && <SampleBadge url={image} className="bottom-6 right-6 top-auto" />}
      <div className="container-x relative w-full">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-pearl/55">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3" />}
                {i < crumbs.length - 1 ? (
                  <Link href={c.href} className="hover:text-pearl">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-pearl/80">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal className="mt-10">
          <Eyebrow tone="light">{eyebrow}</Eyebrow>
        </Reveal>
        <RevealText as="h1" text={title} className="display mt-5 max-w-5xl text-[2.8rem] sm:text-6xl lg:text-[5.5rem]" />
        {lede && (
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-pearl/70 sm:text-lg">{lede}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.25} className="mt-9 flex flex-wrap gap-3">{children}</Reveal>}
      </div>
      <JsonLd data={breadcrumbLd} />
    </section>
  );
}
