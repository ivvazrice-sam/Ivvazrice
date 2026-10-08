import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content/queries";

export const alt = "Ivvaz — premium rice, advanced processing, global export";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social card generated from CMS content (used when no custom OG image is uploaded). */
export default async function OpengraphImage() {
  const { company } = await getSiteContent();
  const name = company.name.replace(/^\[|\]$/g, "");
  const lines = company.heroHeadline.split(/(?<=\.)\s+/);
  let logo: string | null = null;
  if (company.logoUrl.startsWith("/")) {
    try {
      const file = await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", company.logoUrl));
      logo = `data:image/png;base64,${file.toString("base64")}`;
    } catch {
      logo = null;
    }
  }
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "radial-gradient(circle at 78% 40%, #3f6b51 0%, #24412f 55%, #1b3125 100%)", color: "#fffcf3" }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} height={74} width={239} style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", fontSize: 40, letterSpacing: 4, color: "#e8cb8b" }}>{name}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 82, lineHeight: 1.02, fontFamily: "serif" }}>
          {lines.map((l, i) => (
            <span key={i} style={{ color: i === lines.length - 1 ? "#e8cb8b" : "#fffcf3", fontStyle: i === lines.length - 1 ? "italic" : "normal" }}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, color: "rgba(255,252,243,0.7)" }}>
          <div style={{ width: 56, height: 2, background: "#e8cb8b" }} />
          {company.originCountry} · Basmati &amp; Non-Basmati Rice Exporter
        </div>
      </div>
    ),
    size,
  );
}
