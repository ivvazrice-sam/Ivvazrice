import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content/queries";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { company } = await getSiteContent();
  const name = company.name.replace(/^\[|\]$/g, "");
  return {
    name,
    short_name: name.slice(0, 12),
    description: company.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#1b3125",
    theme_color: "#1b3125",
    icons: [{ src: "/brand/ivvaz-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
