import Image from "next/image";
import { cn } from "@/lib/utils";
import { canOptimize } from "@/components/ui/smart-image";

/** Ivvaz wordmark artwork is 987 × 306 (≈ 3.2 : 1). */
const RATIO = 987 / 306;

function LogoImage({ src, alt, height, className }: { src: string; alt: string; height: number; className?: string }) {
  const width = Math.round(height * RATIO);
  return canOptimize(src) ? (
    <Image src={src} alt={alt} width={width * 2} height={height * 2} priority className={cn("w-auto object-contain", className)} style={{ height }} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} height={height} className={cn("w-auto object-contain", className)} style={{ height }} />
  );
}

/**
 * Company logo from the CMS. `tone="light"` sits on dark backgrounds (light artwork),
 * `tone="dark"` on light backgrounds (dark artwork). When both versions exist they are
 * stacked and cross-faded so the navigation can switch smoothly while scrolling.
 * Falls back to a monogram wordmark until a logo is uploaded.
 */
export function Logo({
  name,
  logoUrl,
  logoDarkUrl,
  tone = "light",
  height = 34,
  className,
}: {
  name: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  tone?: "light" | "dark";
  height?: number;
  className?: string;
}) {
  const display = name.replace(/^\[|\]$/g, "");
  if (logoUrl && logoDarkUrl) {
    return (
      <span className={cn("relative inline-grid", className)} style={{ height }}>
        <LogoImage src={logoUrl} alt={display} height={height} className={cn("col-start-1 row-start-1 transition-opacity duration-500", tone === "light" ? "opacity-100" : "opacity-0")} />
        <LogoImage src={logoDarkUrl} alt="" height={height} className={cn("col-start-1 row-start-1 transition-opacity duration-500", tone === "dark" ? "opacity-100" : "opacity-0")} />
      </span>
    );
  }
  const single = tone === "dark" ? logoDarkUrl || logoUrl : logoUrl || logoDarkUrl;
  if (single) return <LogoImage src={single} alt={display} height={height} className={className} />;

  return (
    <span className={cn("flex items-center gap-3", tone === "light" ? "text-pearl" : "text-ink", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <g transform="translate(20 20) rotate(-38)">
          <path d="M-11 0C-11-3.4-6-4.3 0-4.3 6-4.3 10.6-2.8 11-0.5 11.2 1 10 2.4 8 3.3 5.5 4.3 3 4.3 0 4.3-6 4.3-11 3.4-11 0Z" fill="var(--color-gold)" />
        </g>
      </svg>
      <span className="whitespace-nowrap font-display text-[1.15rem] leading-none tracking-[-0.01em]">{display}</span>
    </span>
  );
}
