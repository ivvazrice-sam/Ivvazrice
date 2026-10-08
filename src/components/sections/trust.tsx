import Link from "next/link";
import { ArrowUpRight, ExternalLink, FileCheck2 } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Certification, FactoryMedia, TrustItem, TrustKind } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";

/** Span the closing call-to-action cell across whatever is left of the last grid row. */
const CTA_SPAN_SM = ["sm:col-span-2", "sm:col-span-1"];
const CTA_SPAN_LG = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

const KINDS: TrustKind[] = ["registration", "export-document", "award", "membership", "association"];

/** Verified credentials only. Every group is hidden until real entries are published (placeholder slots in preview mode). */
export function TrustSection({
  items,
  certifications,
  factoryMedia,
  dict,
  showPlaceholders,
  contactHref,
}: {
  items: TrustItem[];
  certifications: Certification[];
  factoryMedia: FactoryMedia[];
  dict: Dictionary;
  showPlaceholders: boolean;
  contactHref: string;
}) {
  const buyers = items.filter((i) => i.kind === "buyer-logo");
  const groups = KINDS.map((k) => ({ kind: k, entries: items.filter((i) => i.kind === k) })).filter((g) => g.entries.length || showPlaceholders);
  const standards = certifications.filter((c) => c.kind === "standard");
  const factoryImages = factoryMedia.filter((m) => m.type === "image").slice(0, 4);
  const hasAnything = items.length || certifications.length || factoryImages.length;
  if (!hasAnything && !showPlaceholders) return null;

  return (
    <section id="trust" className="section-y relative scroll-mt-20 bg-pearl">
      <div className="container-x">
        <SectionHeading eyebrow={dict.trust.eyebrow} title={dict.trust.title} lede={dict.trust.lede} />

        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-[26px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem className="bg-pearl p-7">
            <GroupTitle>{dict.trust.kinds.certification}</GroupTitle>
            <ul className="mt-5 space-y-3">
              {certifications.filter((c) => c.kind === "certification").map((c) => (
                <Entry key={c.id} title={c.name} sub={c.issuer} href={c.documentUrl} />
              ))}
              {!certifications.some((c) => c.kind === "certification") && <Slot label={dict.trust.slot} />}
            </ul>
          </StaggerItem>
          <StaggerItem className="bg-pearl p-7">
            <GroupTitle>{dict.trust.kinds.standard}</GroupTitle>
            <ul className="mt-5 space-y-3">
              {standards.map((c) => (
                <Entry key={c.id} title={c.name} sub={c.issuer} href={c.documentUrl} />
              ))}
              {!standards.length && <Slot label={dict.trust.slot} />}
            </ul>
          </StaggerItem>
          {groups.map((g) => (
            <StaggerItem key={g.kind} className="bg-pearl p-7">
              <GroupTitle>{dict.trust.kinds[g.kind]}</GroupTitle>
              <ul className="mt-5 space-y-3">
                {g.entries.map((e) => (
                  <Entry key={e.id} title={e.title} sub={e.description} href={e.url} image={e.imageUrl} />
                ))}
                {!g.entries.length && <Slot label={dict.trust.slot} />}
              </ul>
            </StaggerItem>
          ))}
          <StaggerItem className={cn("flex flex-col justify-between gap-6 bg-ink p-7 text-pearl", CTA_SPAN_SM[(groups.length + 2) % 2], CTA_SPAN_LG[(groups.length + 2) % 3])}>
            <p className="font-display text-2xl">{dict.trust.requestDocs}</p>
            <Link href={contactHref} className="inline-flex items-center gap-2 text-sm font-semibold text-gold-2 hover:underline">
              {dict.nav.contact} <ArrowUpRight className="size-4" />
            </Link>
          </StaggerItem>
        </Stagger>

        {factoryImages.length > 0 && (
          <Reveal className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {factoryImages.map((m) => (
              <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <SmartImage src={m.url} alt={m.title} fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </Reveal>
        )}

        {(buyers.length > 0 || showPlaceholders) && (
          <Reveal className="mt-16">
            <GroupTitle>{dict.trust.kinds["buyer-logo"]}</GroupTitle>
            <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-3 lg:grid-cols-6">
              {(buyers.length ? buyers : Array.from({ length: 6 }, () => null)).map((b, i) => (
                <li key={b?.id ?? i} className="relative grid h-28 place-items-center bg-pearl p-6">
                  {b?.imageUrl ? (
                    <SmartImage src={b.imageUrl} alt={b.title} fill sizes="200px" className="object-contain p-7 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  ) : b ? (
                    <span className="font-display text-lg text-ink/60">{b.title}</span>
                  ) : (
                    <span className="text-[0.65rem] uppercase tracking-[0.16em] text-ink/25">Logo</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="eyebrow text-husk">{children}</h3>;
}

function Entry({ title, sub, href, image }: { title: string; sub?: string; href?: string; image?: string }) {
  const body = (
    <span className="flex items-start gap-3">
      {image ? (
        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-cream">
          <SmartImage src={image} alt="" fill sizes="40px" className="object-contain p-1" />
        </span>
      ) : (
        <FileCheck2 className="mt-0.5 size-5 shrink-0 text-husk" strokeWidth={1.4} />
      )}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          {title}
          {href && <ExternalLink className="size-3 text-stone" />}
        </span>
        {sub && <span className="block text-xs text-stone">{sub}</span>}
      </span>
    </span>
  );
  return <li>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-70">{body}</a> : body}</li>;
}

function Slot({ label }: { label: string }) {
  return <li className={cn("rounded-xl border border-dashed border-ink/15 px-4 py-3 text-xs text-stone/70")}>{label}</li>;
}
