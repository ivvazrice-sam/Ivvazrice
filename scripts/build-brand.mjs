#!/usr/bin/env node
// Builds the Ivvaz brand assets from brand/ivvaz-logo-source.png (white wordmark on black):
//   public/brand/ivvaz-{white,green,gold}.png  transparent wordmarks
//   public/brand/ivvaz-mark-{gold,green}.png   the leaf "I" mark
//   src/app/icon.png, src/app/apple-icon.png   favicons (gold mark on forest green)
// Usage: node scripts/build-brand.mjs
import sharp from "sharp";
import fs from "node:fs";

const SRC = "brand/ivvaz-logo-source.png";
const COLORS = { white: [255, 252, 243], green: [27, 49, 37], gold: [196, 154, 76] };

const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// Bounding box of the wordmark (luminance above noise floor)
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (data[y * W + x] > 40) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
const pad = 6;
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);

/** Luminance → alpha, filled with a flat brand colour. */
async function tinted(left, top, w, h, rgb, out) {
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const l = data[(top + y) * W + left + x];
      const a = l < 24 ? 0 : Math.min(255, Math.round(((l - 24) / (230 - 24)) * 255));
      const i = (y * w + x) * 4;
      buf[i] = rgb[0]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[2]; buf[i + 3] = a;
    }
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  return out;
}

fs.mkdirSync("public/brand", { recursive: true });
for (const [name, rgb] of Object.entries(COLORS)) await tinted(x0, y0, x1 - x0 + 1, y1 - y0 + 1, rgb, `public/brand/ivvaz-${name}.png`);

// The leaf "I": first glyph from the left, ending at the first empty column gap.
let ix1 = x0 + 10;
for (let x = x0 + pad + 20; x < x1; x++) {
  let ink = 0;
  for (let y = y0; y <= y1; y++) if (data[y * W + x] > 60) ink++;
  if (ink === 0) { ix1 = x; break; }
}
const iw = ix1 - x0 + 2;
const ih = y1 - y0 + 1;
await tinted(x0, y0, iw, ih, COLORS.gold, "public/brand/ivvaz-mark-gold.png");
await tinted(x0, y0, iw, ih, COLORS.green, "public/brand/ivvaz-mark-green.png");

// Favicons: gold mark centred on a rounded forest-green tile.
async function icon(size, out) {
  const mark = await sharp("public/brand/ivvaz-mark-gold.png").resize({ height: Math.round(size * 0.62) }).toBuffer();
  const meta = await sharp(mark).metadata();
  const r = Math.round(size * 0.22);
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#1b3125"/></svg>`);
  await sharp(bg)
    .composite([{ input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile(out);
}
await icon(512, "src/app/icon.png");
await icon(180, "src/app/apple-icon.png");
await icon(512, "public/brand/ivvaz-icon-512.png");
console.log("brand assets built", { wordmark: [x1 - x0 + 1, y1 - y0 + 1], mark: [iw, ih] });
