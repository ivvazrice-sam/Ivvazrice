import type { GrainTone } from "@/lib/content/types";
import { shade } from "@/lib/content/rice";
import { cn, seededRandom } from "@/lib/utils";

/**
 * Generative rice-grain artwork (pure SVG, server-rendered, no JS).
 * Used as an elegant stand-in wherever real product or factory photography has not been uploaded yet.
 */
const TONES: Record<GrainTone, { hi: string; body: string; shade: string; ridge?: string }> = {
  white: { hi: "#ffffff", body: "#f1ede2", shade: "#cfc6b2" },
  cream: { hi: "#fffaf0", body: "#ede1c4", shade: "#c7b68f" },
  golden: { hi: "#f8e2ad", body: "#dfbd76", shade: "#a98137" },
  brown: { hi: "#d3a676", body: "#a8774a", shade: "#6f4a2a" },
  husk: { hi: "#e8c67f", body: "#c29550", shade: "#8a6329", ridge: "#7d5823" },
};

const GRAIN_PATH = "M-30 0C-30-7.6-19-9.6-1-9.6 17-9.6 28.5-6.2 30-1.2 30.6 1 29 3.6 26 5.4 21 8.4 12 9.6 0 9.6-18 9.6-30 7.6-30 0Z";

interface Props {
  seed: string;
  tone?: GrainTone;
  variant?: "field" | "heap";
  background?: "dark" | "light" | "none";
  className?: string;
  density?: number;
  title?: string;
  /** Custom grain colour (hex) — overrides the tone preset, e.g. for processing expressions. */
  color?: string;
}

export function GrainArt({ seed, tone = "white", variant = "field", background = "dark", className, density = 1, title, color }: Props) {
  const rand = seededRandom(`${seed}:${variant}:${tone}`);
  const t: { hi: string; body: string; shade: string; ridge?: string } = color ? { hi: shade(color, 0.6), body: color, shade: shade(color, -0.3) } : TONES[tone];
  const id = `ga-${seed.replace(/[^a-z0-9]/gi, "")}-${variant}-${color ? color.slice(1) : tone}`;
  const W = 800;
  const H = 600;

  type G = { x: number; y: number; r: number; s: number; o: number; k: number };
  const grains: G[] = [];

  if (variant === "heap") {
    const n = Math.round(190 * density);
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(rand());
      const th = rand() * Math.PI * 2;
      const baseY = 440 + Math.sin(th) * 78 * r;
      const height = (1 - r * r) * 190 * (0.75 + rand() * 0.25);
      const depth = (baseY - 360) / 160;
      grains.push({
        x: 400 + Math.cos(th) * 310 * r,
        y: baseY - height,
        r: rand() * 360,
        s: 0.62 + depth * 0.22 + rand() * 0.08,
        o: 0.78 + depth * 0.22,
        k: baseY,
      });
    }
    grains.sort((a, b) => a.k - b.k);
  } else {
    const n = Math.round(150 * density);
    for (let i = 0; i < n; i++) {
      const layer = rand();
      grains.push({
        x: rand() * (W + 80) - 40,
        y: rand() * (H + 80) - 40,
        r: rand() * 360,
        s: 0.7 + layer * 0.55,
        o: 0.35 + layer * 0.65,
        k: layer,
      });
    }
    grains.sort((a, b) => a.k - b.k);
  }

  const bg =
    background === "dark"
      ? { from: "#2c4836", to: "#14281c" }
      : background === "light"
        ? { from: "#fbf8f1", to: "#e7dcc6" }
        : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.hi} />
          <stop offset="0.45" stopColor={t.body} />
          <stop offset="1" stopColor={t.shade} />
        </linearGradient>
        {bg && (
          <radialGradient id={`${id}-bg`} cx="0.5" cy={variant === "heap" ? "0.42" : "0.3"} r="0.85">
            <stop offset="0" stopColor={bg.from} />
            <stop offset="1" stopColor={bg.to} />
          </radialGradient>
        )}
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity={background === "light" ? 0.28 : 0.55} />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <g id={`${id}-grain`}>
          <path d={GRAIN_PATH} fill={`url(#${id}-g)`} />
          {t.ridge ? (
            <path d="M-26 -2.5C-10 -4.5 12 -4.5 27 -1.8M-26 2.8C-8 4.6 12 4.4 26 2.2" fill="none" stroke={t.ridge} strokeWidth="1.1" strokeOpacity="0.55" />
          ) : (
            <path d="M-22 -5.2C-8 -7.4 10 -7.2 22 -4.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeOpacity="0.55" strokeLinecap="round" />
          )}
        </g>
      </defs>
      {title && <title>{title}</title>}
      {bg && <rect width={W} height={H} fill={`url(#${id}-bg)`} />}
      {variant === "heap" && <ellipse cx="400" cy="470" rx="360" ry="70" fill={`url(#${id}-shadow)`} />}
      {grains.map((g, i) => (
        <use
          key={i}
          href={`#${id}-grain`}
          transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.r.toFixed(0)}) scale(${g.s.toFixed(2)})`}
          opacity={g.o.toFixed(2)}
        />
      ))}
      {background === "dark" && variant === "field" && (
        <rect width={W} height={H} fill={`url(#${id}-bg)`} opacity="0.35" style={{ mixBlendMode: "multiply" }} />
      )}
    </svg>
  );
}
