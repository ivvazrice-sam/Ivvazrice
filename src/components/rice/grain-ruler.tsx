"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { shade } from "@/lib/content/rice";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const RulerGrainsScene = dynamic(() => import("@/components/three/ruler-grains-scene"), { ssr: false });

/** Grain outline with a slightly tapered tip, drawn in a 0..1 × -0.5..0.5 box. */
const GRAIN = "M0 0C0-0.36 0.08-0.5 0.5-0.5 0.9-0.5 1-0.3 1-0.04 1 0.14 0.94 0.3 0.86 0.38 0.76 0.47 0.62 0.5 0.5 0.5 0.08 0.5 0 0.36 0 0Z";

export interface RulerComparison {
  name: string;
  length: number;
  current?: boolean;
}

/**
 * True-to-scale grain length ruler (millimetres). Shows the raw grain of the selected expression,
 * its tolerance band, the cooked grain (elongation) and where other varieties sit on the scale.
 */
export function GrainRuler({
  raw,
  cooked,
  tone,
  comparisons,
  showCooked,
  labels,
}: {
  raw: { min: number; max: number; mid: number } | null;
  cooked: { min: number; max: number; mid: number } | null;
  tone: string;
  comparisons: RulerComparison[];
  showCooked: boolean;
  labels: { raw: string; cooked: string; elongation: string; mm: string; compare: string };
}) {
  const maxMm = Math.max(12, Math.ceil(((cooked?.max ?? raw?.max ?? 10) + 1.5) / 2) * 2);
  const L = 70; // left padding
  const W = 1000 - L - 40;
  const x = (mm: number) => L + (mm / maxMm) * W;
  const px = W / maxMm; // px per mm
  const grainH = Math.max(16, Math.min(40, 1.85 * px)); // ~1.85 mm grain width, true to scale where possible
  const tag = (mm: number, w: number) => Math.min(x(mm) + 12, 1000 - w - 6);

  const rawW = raw ? raw.mid * px : 0;
  const cookedW = cooked ? cooked.mid * px : 0;
  const ratio = raw && cooked ? cooked.mid / raw.mid : null;
  const tier = useDeviceTier();
  const use3D = tier === "high" || tier === "low";
  const [ready, setReady] = useState(false);
  const flat = !(use3D && ready);

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative min-w-[640px]">
      <svg viewBox="0 0 1000 250" className="block w-full" role="img" aria-label={raw ? `${labels.raw}: ${raw.mid.toFixed(2)} ${labels.mm}` : labels.raw}>
        <defs>
          <filter id="grain-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.15" />
          </filter>
          <linearGradient id="gr-grain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(tone, 0.7)} />
            <stop offset="0.5" stopColor={tone} />
            <stop offset="1" stopColor={shade(tone, -0.35)} />
          </linearGradient>
          <linearGradient id="gr-cooked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fefdfb" />
            <stop offset="0.6" stopColor={shade(tone, 0.6)} />
            <stop offset="1" stopColor={shade(tone, 0.08)} />
          </linearGradient>
        </defs>

        {/* Raw grain */}
        <text x={L} y="34" className="fill-stone text-[13px] font-semibold uppercase tracking-[0.14em]">
          {labels.raw}
        </text>
        {raw && (
          <>
            {/* tolerance band */}
            <rect x={x(raw.min)} y={62 - grainH / 2 - 8} width={Math.max(2, (raw.max - raw.min) * px)} height={grainH + 16} rx="4" fill="var(--color-gold)" opacity="0.18" />
            <path
              opacity={flat ? 0.75 : 0}
              d={GRAIN}
              fill="url(#gr-grain)"
              stroke={shade(tone, -0.4)}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              filter="url(#grain-shadow)"
              style={{ transform: `translate(${L}px, 62px) scale(${rawW}, ${grainH})`, transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}
            />
            <line x1={x(raw.mid)} x2={x(raw.mid)} y1="34" y2="92" stroke="var(--color-husk)" strokeDasharray="3 3" style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
            <motion.g initial={false} animate={{ x: tag(raw.mid, 110) }} transition={{ duration: 0.9, ease: EASE }}>
              <rect x="0" y="48" width="110" height="28" rx="14" fill="var(--color-ink)" />
              <text x="55" y="67" textAnchor="middle" className="fill-pearl text-[14px] font-semibold tabular-nums">
                {raw.mid.toFixed(2)} {labels.mm}
              </text>
            </motion.g>
          </>
        )}

        {/* Cooked grain */}
        <g className={cn("transition-opacity duration-500", showCooked && cooked ? "opacity-100" : "opacity-0")}>
          <text x={L} y="126" className="fill-stone text-[13px] font-semibold uppercase tracking-[0.14em]">
            {labels.cooked}
          </text>
          {cooked && (
            <>
              <path
                opacity={flat ? 0.65 : 0}
                d={GRAIN}
                fill="url(#gr-cooked)"
                stroke={shade(tone, -0.2)}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                filter="url(#grain-shadow)"
                style={{
                  transform: `translate(${L}px, 154px) scale(${showCooked ? cookedW : rawW}, ${grainH * 0.82})`,
                  transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
              <motion.g initial={false} animate={{ x: tag(showCooked ? cooked.mid : raw?.mid ?? 0, 210) }} transition={{ duration: 1.4, ease: EASE }}>
                <rect x="0" y="140" width="210" height="28" rx="14" fill="var(--color-gold)" />
                <text x="105" y="159" textAnchor="middle" className="fill-ink text-[14px] font-semibold tabular-nums">
                  {cooked.mid.toFixed(1)} {labels.mm}
                  {ratio ? `  ·  ×${ratio.toFixed(1)} ${labels.elongation}` : ""}
                </text>
              </motion.g>
            </>
          )}
        </g>

        {/* Scale */}
        <line x1={L} x2={x(maxMm)} y1="206" y2="206" stroke="var(--color-ink)" strokeOpacity="0.5" />
        {Array.from({ length: maxMm * 2 + 1 }, (_, i) => {
          const mm = i / 2;
          const major = Number.isInteger(mm) && mm % 2 === 0;
          const whole = Number.isInteger(mm);
          return (
            <g key={i}>
              <line x1={x(mm)} x2={x(mm)} y1="206" y2={206 + (major ? 14 : whole ? 9 : 5)} stroke="var(--color-ink)" strokeOpacity={major ? 0.6 : 0.3} />
              {major && (
                <text x={x(mm)} y="238" textAnchor="middle" className="fill-stone text-[12px] tabular-nums">
                  {mm}
                </text>
              )}
            </g>
          );
        })}
        <text x={x(maxMm)} y="238" textAnchor="end" dx="26" className="fill-stone text-[12px]">
          {labels.mm}
        </text>

        {/* Other varieties on the same scale */}
        {comparisons.map((c) => (
          <g key={c.name} transform={`translate(${x(c.length)} 0)`}>
            <line y1="196" y2="206" stroke={c.current ? "var(--color-husk)" : "var(--color-ink)"} strokeOpacity={c.current ? 1 : 0.45} strokeWidth={c.current ? 2.5 : 1.5} />
            <circle cy="196" r={c.current ? 5 : 3.5} fill={c.current ? "var(--color-gold)" : "var(--color-ink)"} fillOpacity={c.current ? 1 : 0.5} />
          </g>
        ))}
      </svg>
      {use3D && raw && (
        <RulerGrainsScene left={L} rawLen={rawW} cookedLen={cookedW} rawY={62} cookedY={154} tone={tone} showCooked={showCooked && !!cooked} grainWidth={grainH} onReady={() => setReady(true)} />
      )}
      </div>

      {comparisons.length > 1 && (
        <div className="mt-8 min-w-[640px] border-t border-ink/10 pt-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone">{labels.compare}</p>
          <ul className="mt-4 space-y-2.5">
            {comparisons.map((c) => (
              <li key={c.name} className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center gap-4 text-sm">
                <span className={cn("truncate", c.current ? "font-bold text-ink" : "text-stone")}>{c.name}</span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
                  <motion.span
                    className={cn("absolute inset-y-0 left-0 rounded-full", c.current ? "bg-gold" : "bg-leaf/50")}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(c.length / maxMm) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE }}
                  />
                </span>
                <span className={cn("text-right tabular-nums", c.current ? "font-bold text-ink" : "text-stone")}>
                  {c.length.toFixed(2)} {labels.mm}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
