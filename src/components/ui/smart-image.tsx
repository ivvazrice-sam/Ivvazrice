import Image, { type ImageProps } from "next/image";

const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const EXTRA_HOSTS = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean);

/** True when next/image is allowed to optimise this URL (see images.remotePatterns in next.config.ts). */
export function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false;
    if (SUPABASE && src.startsWith(SUPABASE)) return true;
    return ["i.ytimg.com", "i.vimeocdn.com", "images.pexels.com", ...EXTRA_HOSTS].includes(hostname);
  } catch {
    return false;
  }
}

/** next/image (AVIF/WebP, responsive srcset) when possible, plain lazy <img> for other hosts. */
export function SmartImage(props: ImageProps & { src: string }) {
  // Guard against empty src — don't render an <img> with no source.
  if (!props.src) return null;
  if (canOptimize(props.src)) return <Image {...props} alt={props.alt} loading={props.priority ? "eager" : props.loading} />;
  const { src, alt, className, fill, sizes, priority, style } = props;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
    />
  );
}
