"use client";

import { FileText, ZoomIn } from "lucide-react";
import { useState } from "react";
import type { Certification } from "@/lib/content/types";
import { Lightbox, type LightboxItem } from "@/components/ui/lightbox";
import { SmartImage } from "@/components/ui/smart-image";

export function CertificationGallery({
  items,
  labels,
}: {
  items: Certification[];
  labels: { validUntil: string; view: string; standard: string; certification: string };
}) {
  const [index, setIndex] = useState<number | null>(null);
  const withImages = items.filter((c) => c.imageUrl);
  const lightboxItems: LightboxItem[] = withImages.map((c) => ({ type: "image", src: c.imageUrl, title: c.name, description: c.issuer }));

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => {
          const imgIndex = withImages.indexOf(c);
          return (
            <li key={c.id} className="group flex flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-pearl transition-shadow duration-500 hover:shadow-[0_30px_60px_-40px_rgba(27,49,37,0.5)]">
              <button
                type="button"
                disabled={!c.imageUrl}
                onClick={() => setIndex(imgIndex)}
                className="relative aspect-[3/4] w-full overflow-hidden bg-cream disabled:cursor-default"
                aria-label={`${labels.view}: ${c.name}`}
              >
                {c.imageUrl ? (
                  <>
                    <SmartImage src={c.imageUrl} alt={c.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-6 transition-transform duration-700 group-hover:scale-[1.03]" />
                    <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-ink/80 text-pearl opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="size-4" />
                    </span>
                  </>
                ) : (
                  <span className="grid h-full place-items-center text-ink/20">
                    <FileText className="size-14" strokeWidth={1} />
                  </span>
                )}
              </button>
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow text-[0.6rem] text-husk">{c.kind === "standard" ? labels.standard : labels.certification}</p>
                <h4 className="mt-2 font-display text-xl text-ink">{c.name}</h4>
                {c.issuer && <p className="mt-1 text-sm text-stone">{c.issuer}</p>}
                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-stone">
                  {c.validUntil ? (
                    <span>
                      {labels.validUntil} {c.validUntil}
                    </span>
                  ) : (
                    <span>{c.certificateNumber}</span>
                  )}
                  {c.documentUrl && (
                    <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
                      PDF
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <Lightbox items={lightboxItems} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
