import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

// Extra image hosts (e.g. a CDN) can be allowed with NEXT_PUBLIC_IMAGE_REMOTE_HOSTS="cdn.example.com,images.example.com"
const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ["lucide-react", "motion", "three"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      ...extraHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
      { protocol: "https", hostname: "i.ytimg.com" },
      // Sample photography used by the starter content (hidden once placeholder mode is off).
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Uploaded media is stored under random, never-reused file names, so it can be cached forever.
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/products/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
