"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/client";
import type { ExportCountry, ExportRoute } from "@/lib/content/types";
import { cn, isPlaceholderText } from "@/lib/utils";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, PlaceholderTag } from "@/components/ui/section-heading";
import { FlatMap } from "./flat-map";

const GlobeScene = dynamic(() => import("@/components/three/globe-scene"), { ssr: false });

export interface GlobalExportProps {
  headline: string;
  intro: string;
  shippingCapability: string;
  internationalSupply: string;
  majorMarketsNote: string;
  origin: { name: string; lat: number; lng: number; port: string };
  countries: ExportCountry[];
  routes: ExportRoute[];
  showPlaceholders: boolean;
}

export function GlobalExport(props: GlobalExportProps) {
  const { dict, href } = useI18n();
  const tier = useDeviceTier();
  const section = useRef<HTMLElement>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [inView, setInView] = useState(false);
  // The globe (three.js + map data) is only downloaded once the section approaches the viewport.
  const [seen, setSeen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const sp = props.showPlaceholders;

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const destinations = useMemo(
    () => [
      ...props.countries.map((c) => ({ id: c.id, name: c.name, lat: c.lat, lng: c.lng, major: c.isMajorMarket, port: c.port, region: c.region, placeholder: c.isPlaceholder })),
      ...props.routes.map((r) => ({ id: r.id, name: r.name, lat: r.destinationLat, lng: r.destinationLng, major: false, port: r.destinationPort, region: r.transitNote, placeholder: false })),
    ],
    [props.countries, props.routes],
  );
  const anyPlaceholder = destinations.some((d) => d.placeholder);
  const major = destinations.filter((d) => d.major);
  const origin = useMemo(() => ({ name: props.origin.name, lat: props.origin.lat, lng: props.origin.lng }), [props.origin]);
  const globeRoutes = useMemo(() => destinations.map(({ id, name, lat, lng, major }) => ({ id, name, lat, lng, major })), [destinations]);

  const info = [
    { label: dict.export.shipping, text: props.shippingCapability },
    { label: dict.export.supply, text: props.internationalSupply },
  ].filter((i) => sp || !isPlaceholderText(i.text));

  return (
    <section ref={section} id="global-export" className="noise relative overflow-hidden bg-ink py-24 text-pearl lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_65%_50%,rgba(198,161,91,0.12),transparent_70%)]" />
      <div className="container-x relative grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="relative z-10 lg:col-span-5">
          <Reveal>
            <Eyebrow tone="light">{dict.export.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-5 text-[2.6rem] sm:text-6xl lg:text-7xl">
              {props.headline.split(" to ").length === 2 ? (
                <>
                  {props.headline.split(" to ")[0]} to <span className="italic text-gold-2">{props.headline.split(" to ")[1]}</span>
                </>
              ) : (
                props.headline
              )}
            </h2>
          </Reveal>
          {(sp || !isPlaceholderText(props.intro)) && props.intro && (
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-pearl/60">{props.intro}</p>
            </Reveal>
          )}

          <Reveal delay={0.15} className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-pearl/10 bg-pearl/10">
            <div className="bg-ink p-5">
              <p className="eyebrow text-[0.6rem] text-pearl/40">{dict.export.origin}</p>
              <p className="mt-2 font-display text-2xl">{props.origin.name}</p>
              {(sp || !isPlaceholderText(props.origin.port)) && props.origin.port && <p className="mt-1 text-xs text-pearl/50">{props.origin.port}</p>}
            </div>
            <div className="bg-ink p-5">
              <p className="eyebrow text-[0.6rem] text-pearl/40">{dict.export.countries}</p>
              <p className="mt-2 font-display text-2xl">{anyPlaceholder ? "—" : destinations.length}</p>
              {anyPlaceholder && <PlaceholderTag className="mt-2 text-pearl/60">{dict.common.addInAdmin}</PlaceholderTag>}
            </div>
          </Reveal>

          {info.length > 0 && (
            <dl className="mt-8 space-y-6">
              {info.map((i) => (
                <Reveal key={i.label}>
                  <dt className="eyebrow text-[0.62rem] text-gold-2/80">{i.label}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-pearl/60">{i.text}</dd>
                </Reveal>
              ))}
            </dl>
          )}

          <Reveal className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={href("/quote")} variant="gold" arrow>
              {dict.cta.requestQuote}
            </ButtonLink>
            <ButtonLink href={href("/export#export-process")} variant="outline-light">
              {dict.exportProcess.eyebrow}
            </ButtonLink>
          </Reveal>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[720px] lg:-mr-10 lg:-mt-8">
            {tier === "none" ? (
              <div className="absolute inset-x-0 top-1/2 aspect-[2/1] -translate-y-1/2">
                <FlatMap origin={origin} points={globeRoutes} />
              </div>
            ) : tier && seen ? (
              <>
                <GlobeScene origin={origin} routes={globeRoutes} focusId={focusId} tier={tier} active={inView} labelRefs={labelRefs} />
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                  <div ref={(el) => void (labelRefs.current.origin = el)} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
                    <span className="ml-3 -mt-3 block whitespace-nowrap rounded-full bg-gold px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink">
                      {props.origin.name}
                    </span>
                  </div>
                  {destinations.map((d) => (
                    <div key={d.id} ref={(el) => void (labelRefs.current[d.id] = el)} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
                      <span
                        className={cn(
                          "ml-2.5 -mt-2.5 block whitespace-nowrap rounded-full px-2 py-0.5 text-[0.62rem] font-semibold transition-colors",
                          focusId === d.id ? "bg-pearl text-ink" : "glass-dark text-pearl/80",
                        )}
                      >
                        {d.name}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.2em] text-pearl/30">{dict.export.dragHint}</p>
              </>
            ) : null}
          </div>

          {destinations.length > 0 && (
            <div className="relative z-10 mt-6">
              {anyPlaceholder && <p className="mb-4 text-xs text-pearl/40">{dict.export.placeholderNote}</p>}
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setFocusId(null)}>
                {destinations.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setFocusId(d.id)}
                      onFocus={() => setFocusId(d.id)}
                      onClick={() => setFocusId((f) => (f === d.id ? null : d.id))}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-300",
                        focusId === d.id ? "border-gold/60 bg-pearl/[0.06]" : "border-pearl/10 hover:border-pearl/25",
                      )}
                    >
                      <MapPin className={cn("size-4 shrink-0", d.major ? "text-gold" : "text-pearl/40")} strokeWidth={1.6} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{d.name}</span>
                        {d.port && (sp || !isPlaceholderText(d.port)) && (
                          <span className="flex items-center gap-1 truncate text-[0.7rem] text-pearl/40">
                            <Anchor className="size-3" /> {d.port}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {major.length > 0 && !anyPlaceholder && (
                <p className="mt-6 text-xs text-pearl/50">
                  <span className="eyebrow mr-2 text-[0.6rem] text-gold-2/80">{dict.export.majorMarkets}</span>
                  {major.map((m) => m.name).join(" · ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
