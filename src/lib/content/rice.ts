/** Rice-range vocabulary and helpers for specifications (shared by the site and the admin). */

export const CHARACTER_TAGS = [
  "Exceptional length",
  "Extra-long grain",
  "Long grain",
  "High elongation",
  "Pronounced aroma",
  "Gentle aroma",
  "Firm & separate",
  "Soft & versatile",
] as const;

export const MARKET_TAGS = ["Flagship retail", "Premium mainstream", "Foodservice", "Everyday retail", "Value-led programmes", "Fine dining"] as const;

/** Suggested visual tones for common processing expressions (editable per expression in the admin). */
export const EXPRESSION_TONES: Record<string, { tone: string; label: string }> = {
  raw: { tone: "#efe8d8", label: "Natural white" },
  steam: { tone: "#f8f5ec", label: "Bright white" },
  "creamy sella": { tone: "#ead8ae", label: "Ivory" },
  "golden sella": { tone: "#d8a654", label: "Golden amber" },
  "lemon sella": { tone: "#e6d58f", label: "Pale straw" },
  sella: { tone: "#e4cf9c", label: "Parboiled cream" },
  brown: { tone: "#a87443", label: "Natural brown" },
};

/** "8.30–8.35 mm" → { min: 8.3, max: 8.35, mid: 8.325 }; "≈8.40 mm" → 8.4; returns null when no number. */
export function parseRange(value: string | undefined | null) {
  if (!value) return null;
  const nums = (value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const min = Math.min(...nums.slice(0, 2));
  const max = Math.max(...nums.slice(0, 2));
  return { min, max, mid: (min + max) / 2 };
}

/** Lighten (amount > 0) or darken (amount < 0) a hex colour. */
export function shade(hex: string, amount: number) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  const ch = m.slice(1).map((h) => parseInt(h, 16));
  const out = ch.map((c) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount)));
  return `#${out.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

export const isHexColor = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** Tones that have a pre-rendered (baked) 3D heap image in /public/renders. */
export const BAKED_TONES: Record<string, string> = {
  white: "#efe8d8",
  bright: "#f8f5ec",
  ivory: "#ead8ae",
  golden: "#d8a654",
  straw: "#e6d58f",
  cream: "#e4cf9c",
  brown: "#a87443",
};

const hexToRgb = (hex: string) => {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? m.slice(1).map((h) => parseInt(h, 16)) : [239, 232, 216];
};

/** Closest baked heap image for any grain colour. */
export function bakedHeapFor(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  let best = "white";
  let dist = Infinity;
  for (const [name, h] of Object.entries(BAKED_TONES)) {
    const [r2, g2, b2] = hexToRgb(h);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < dist) {
      dist = d;
      best = name;
    }
  }
  return `/renders/heap-${best}.png`;
}

/** Product card / gallery tones → baked heap image. */
export const HEAP_FOR_GRAIN_TONE: Record<string, string> = {
  white: "/renders/heap-white.png",
  cream: "/renders/heap-ivory.png",
  golden: "/renders/heap-golden.png",
  brown: "/renders/heap-brown.png",
  husk: "/renders/heap-golden.png",
};
