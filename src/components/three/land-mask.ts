import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";

/** ISO 3166-1 numeric code for India, as used by world-atlas. */
export const INDIA_ID = "356";

export interface LandDot {
  lat: number;
  lng: number;
  india: boolean;
}

type Ring = number[][];

function drawGeometry(ctx: CanvasRenderingContext2D, geometry: Geometry, w: number, h: number) {
  const polys: Ring[][] =
    geometry.type === "Polygon" ? [geometry.coordinates as Ring[]] : geometry.type === "MultiPolygon" ? (geometry.coordinates as Ring[][]) : [];
  ctx.beginPath();
  for (const poly of polys) {
    for (const ring of poly) {
      ring.forEach(([lng, lat], i) => {
        const x = ((lng + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
  }
  ctx.fill("evenodd");
}

/**
 * Rasterises country shapes to an equirectangular mask, then samples it on an
 * equal-area lat/lng grid to produce the dotted-earth point cloud.
 */
export async function buildLandDots(step = 1.4): Promise<LandDot[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topo: any = (await import("world-atlas/countries-110m.json")).default;
  const countries = feature(topo, topo.objects.countries) as unknown as FeatureCollection;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  ctx.fillStyle = "#f00"; // red channel = land
  for (const f of countries.features as Feature[]) if (f.geometry) drawGeometry(ctx, f.geometry, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#ff0"; // green channel = India
  const india = (countries.features as Feature[]).find((f) => String(f.id) === INDIA_ID);
  if (india?.geometry) drawGeometry(ctx, india.geometry, w, h);

  const data = ctx.getImageData(0, 0, w, h).data;
  const dots: LandDot[] = [];
  for (let lat = -58; lat <= 82; lat += step) {
    const n = Math.max(1, Math.round((360 / step) * Math.cos((lat * Math.PI) / 180)));
    for (let i = 0; i < n; i++) {
      const lng = -180 + (i / n) * 360;
      const x = Math.min(w - 1, Math.floor(((lng + 180) / 360) * w));
      const y = Math.min(h - 1, Math.floor(((90 - lat) / 180) * h));
      const idx = (y * w + x) * 4;
      if (data[idx] > 128) dots.push({ lat, lng, india: data[idx + 1] > 128 });
    }
  }
  return dots;
}
