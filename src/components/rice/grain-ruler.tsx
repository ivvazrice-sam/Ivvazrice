"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface RulerComparison {
  name: string;
  length: number;
  current?: boolean;
}

/**
 * True-to-scale raw grain length ruler (millimetres). Shows the raw grain of the selected
 * expression, its tolerance band, and where other varieties sit on the same scale.
 */
export function GrainRuler({
  raw,
  tone,
  comparisons,
  labels,
}: {
  raw: { min: number; max: number; mid: number } | null;
  cooked?: { min: number; max: number; mid: number } | null;
  tone: string;
  comparisons: RulerComparison[];
  showCooked?: boolean;
  labels: { raw: string; cooked?: string; elongation?: string; mm: string; compare: string };
}) {
  const maxMm = Math.max(12, Math.ceil(((raw?.max ?? 10) + 1.5) / 2) * 2);
  const L = 70;
  const W = 1000 - L - 40;
  const x = (mm: number) => L + (mm / maxMm) * W;
  const px = W / maxMm;
  const grainH = Math.max(16, Math.min(40, 1.85 * px));
  const tag = (mm: number, w: number) => Math.min(x(mm) + 12, 1000 - w - 6);

  const rawW = raw ? raw.mid * px : 0;

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative min-w-[640px]">
      <svg viewBox="0 0 1000 170" className="block w-full" role="img" aria-label={raw ? `${labels.raw}: ${raw.mid.toFixed(2)} ${labels.mm}` : labels.raw}>
        <defs>
          {/* Realistic rice grain, drawn in a 0..100 × 0..30 viewBox and scaled via <use>. */}
          <radialGradient id="rg-body" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f6efdd" />
            <stop offset="100%" stopColor="#d8c69c" />
          </radialGradient>
          <linearGradient id="rg-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rg-underShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#7a6b47" stopOpacity="0.55" />
          </linearGradient>
          <filter id="rg-softShadow" x="-20%" y="-50%" width="140%" height="200%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodOpacity="0.22" />
          </filter>
          <symbol id="realistic-grain" viewBox="0 0 100 30" preserveAspectRatio="none">
            {/* base body with soft gradient */}
            <path
              d="M4 15 C 4 7, 20 2, 50 2 C 80 2, 96 7, 96 15 C 96 23, 80 28, 50 28 C 20 28, 4 23, 4 15 Z"
              fill="url(#rg-body)"
              stroke="#b89d6a"
              strokeOpacity="0.35"
              strokeWidth="0.6"
              filter="url(#rg-softShadow)"
            />
            {/* under-belly shadow */}
            <ellipse cx="50" cy="20" rx="42" ry="6" fill="url(#rg-underShadow)" opacity="0.5" />
            {/* top sheen highlight */}
            <ellipse cx="50" cy="9" rx="38" ry="4.5" fill="url(#rg-sheen)" opacity="0.85" />
            {/* longitudinal grain striations */}
            <g stroke="#b59a68" strokeOpacity="0.22" strokeWidth="0.25" fill="none" strokeLinecap="round">
              <path d="M10 11 Q 50 9 90 11" />
              <path d="M10 14 Q 50 12 90 14" />
              <path d="M10 17 Q 50 15 90 17" />
              <path d="M10 20 Q 50 18 90 20" />
            </g>
            {/* bright tip highlights */}
            <ellipse cx="86" cy="13" rx="4.5" ry="2.6" fill="#ffffff" opacity="0.5" />
            <ellipse cx="14" cy="14" rx="4" ry="2.4" fill="#ffffff" opacity="0.35" />
            {/* tiny speck of pearlescent shine */}
            <ellipse cx="48" cy="7" rx="14" ry="1" fill="#ffffff" opacity="0.6" />
          </symbol>
        </defs>

        {/* Raw grain */}
        <text x={L} y="34" className="fill-stone text-[13px] font-semibold uppercase tracking-[0.14em]">
          {labels.raw}
        </text>
        {raw && (
          <>
            {/* tolerance band */}
            <rect x={x(raw.min)} y={62 - grainH / 2 - 8} width={Math.max(2, (raw.max - raw.min) * px)} height={grainH + 16} rx="4" fill="var(--color-gold)" opacity="0.18" />
            <use
              href="#realistic-grain"
              x="0"
              y={62 - grainH / 2}
              width={rawW}
              height={grainH}
              style={{ transform: `translate(${L}px, 0)`, transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)" }}
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

        {/* Scale */}
        <line x1={L} x2={x(maxMm)} y1="126" y2="126" stroke="var(--color-ink)" strokeOpacity="0.5" />
        {Array.from({ length: maxMm * 2 + 1 }, (_, i) => {
          const mm = i / 2;
          const major = Number.isInteger(mm) && mm % 2 === 0;
          const whole = Number.isInteger(mm);
          return (
            <g key={i}>
              <line x1={x(mm)} x2={x(mm)} y1="126" y2={126 + (major ? 14 : whole ? 9 : 5)} stroke="var(--color-ink)" strokeOpacity={major ? 0.6 : 0.3} />
              {major && (
                <text x={x(mm)} y="158" textAnchor="middle" className="fill-stone text-[12px] tabular-nums">
                  {mm}
                </text>
              )}
            </g>
          );
        })}
        <text x={x(maxMm)} y="158" textAnchor="end" dx="26" className="fill-stone text-[12px]">
          {labels.mm}
        </text>

        {/* Other varieties on the same scale */}
        {comparisons.map((c) => (
          <g key={c.name} transform={`translate(${x(c.length)} 0)`}>
            <line y1="116" y2="126" stroke={c.current ? "var(--color-husk)" : "var(--color-ink)"} strokeOpacity={c.current ? 1 : 0.45} strokeWidth={c.current ? 2.5 : 1.5} />
            <circle cy="116" r={c.current ? 5 : 3.5} fill={c.current ? "var(--color-gold)" : "var(--color-ink)"} fillOpacity={c.current ? 1 : 0.5} />
          </g>
        ))}
      </svg>
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
