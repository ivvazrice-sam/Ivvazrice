import type { Certification, TrustItem } from "@/lib/content/types";
import { hasValue } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";

/**
 * Compact horizontal credentials strip for the home page. Shows certification + trust logos
 * (ISO, FSSAI, APEDA, IEC, etc.) with a muted monochrome treatment that reads as "we are legit"
 * at a glance without competing with the hero. Hidden entirely until real logos are published.
 */
export function TrustStrip({
  certifications,
  trustItems,
  dict,
}: {
  certifications: Certification[];
  trustItems: TrustItem[];
  dict: { eyebrow: string };
}) {
  const certs = certifications.filter((c) => c.published && hasValue(c.imageUrl));
  const trusts = trustItems.filter((t) => t.published && hasValue(t.imageUrl));
  const items = [...certs, ...trusts].slice(0, 12);
  if (!items.length) return null;

  return (
    <section aria-label={dict.eyebrow} className="border-y border-ink/10 bg-pearl/60 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone">
          {dict.eyebrow}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {items.map((item) => {
            const name = "name" in item ? item.name : item.title;
            return (
              <li key={item.id} className="flex items-center">
                <SmartImage
                  src={item.imageUrl}
                  alt={name}
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
